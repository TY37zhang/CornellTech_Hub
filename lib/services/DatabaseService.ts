import { sql, executeQuery } from "@/lib/db";
import NodeCache from "node-cache";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { v4 as uuidv4 } from "uuid";

export interface Course {
    id: string;
    code: string;
    name: string;
    description: string | null;
    credits: number;
    department: string;
    semester: string;
    year: number;
    professor_id: string;
    full_code: string | null;
    concentration_core: string | null;
    concentration_elective: string | null;
    created_at: string;
    updated_at: string;
}

export interface CourseReview {
    id: string;
    course_id: string;
    rating: number;
    difficulty: number;
    workload: number;
    content: string;
    created_at: string;
    updated_at: string;
    overall_rating: number;
    grade: string | null;
}

export interface UserInfo {
    id: string;
    name: string;
    program: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface ConversationHistory {
    userId: string;
    messages: ChatCompletionMessageParam[];
    context: {
        courseMentions: string[];
        programMentions: string[];
        departmentMentions: string[];
        semesterMentions: string[];
        lastQueryType:
            | "course"
            | "review"
            | "schedule"
            | "requirement"
            | "general";
        lastQueryTimestamp: string;
    };
    lastUpdated: string;
}

export class DatabaseService {
    private static cache = new NodeCache({
        stdTTL: 300, // 5 minutes cache
        checkperiod: 60, // Check for expired keys every minute
        useClones: false, // Don't clone objects for better performance
    });

    private static async handleDatabaseError(
        error: any,
        operation: string
    ): Promise<never> {
        console.error(`DatabaseService.${operation} error:`, error);
        if (error.code === "ECONNREFUSED") {
            throw new Error(
                "Database connection refused. Please try again later."
            );
        } else if (error.code === "ETIMEDOUT") {
            throw new Error("Database connection timed out. Please try again.");
        } else if (error.code === "P0001") {
            throw new Error(`Database error: ${error.message}`);
        }
        throw new Error(`Failed to ${operation}: ${error.message}`);
    }

    // Get course details with reviews and requirements
    static async getCourseDetails(courseId: string): Promise<{
        course: Course | null;
        reviews: CourseReview[];
        requirements: { prerequisites: string[]; corequisites: string[] };
        averageRating: number;
        averageDifficulty: number;
        averageWorkload: number;
    }> {
        try {
            const cacheKey = `course_details:${courseId}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached as any;

            const course = await this.getCourseById(courseId);
            if (!course) {
                return {
                    course: null,
                    reviews: [],
                    requirements: { prerequisites: [], corequisites: [] },
                    averageRating: 0,
                    averageDifficulty: 0,
                    averageWorkload: 0,
                };
            }

            const [reviews, requirements] = await Promise.all([
                this.getCourseReviews(courseId),
                this.getCourseRequisites(courseId),
            ]);

            // Calculate averages
            const averageRating =
                reviews.length > 0
                    ? reviews.reduce(
                          (acc, review) => acc + review.overall_rating,
                          0
                      ) / reviews.length
                    : 0;
            const averageDifficulty =
                reviews.length > 0
                    ? reviews.reduce(
                          (acc, review) => acc + review.difficulty,
                          0
                      ) / reviews.length
                    : 0;
            const averageWorkload =
                reviews.length > 0
                    ? reviews.reduce(
                          (acc, review) => acc + review.workload,
                          0
                      ) / reviews.length
                    : 0;

            const result = {
                course,
                reviews,
                requirements,
                averageRating,
                averageDifficulty,
                averageWorkload,
            };

            this.cache.set(cacheKey, result);
            return result;
        } catch (err) {
            return this.handleDatabaseError(err, "getCourseDetails");
        }
    }

    // Search courses with advanced filtering
    static async searchCourses(
        query: string,
        department?: string,
        semester?: string,
        year?: number,
        minCredits?: number,
        maxCredits?: number,
        category?: string
    ): Promise<Course[]> {
        try {
            const cacheKey = `course_search:${query}:${JSON.stringify({ department, semester, year, minCredits, maxCredits, category })}`;
            const cached = this.cache.get<Course[]>(cacheKey);
            if (cached) return cached;

            const conditions = [];
            const params = [];
            let paramIndex = 1;

            // Base search condition
            conditions.push(`(
                c.code ILIKE $${paramIndex} OR
                c.name ILIKE $${paramIndex} OR
                c.description ILIKE $${paramIndex}
            )`);
            params.push(`%${query}%`);
            paramIndex++;

            // Add filters
            if (department) {
                conditions.push(`c.department = $${paramIndex}`);
                params.push(department);
                paramIndex++;
            }
            if (semester) {
                conditions.push(`c.semester = $${paramIndex}`);
                params.push(semester);
                paramIndex++;
            }
            if (year) {
                conditions.push(`c.year = $${paramIndex}`);
                params.push(year);
                paramIndex++;
            }
            if (minCredits) {
                conditions.push(`c.credits >= $${paramIndex}`);
                params.push(minCredits);
                paramIndex++;
            }
            if (maxCredits) {
                conditions.push(`c.credits <= $${paramIndex}`);
                params.push(maxCredits);
                paramIndex++;
            }
            if (category) {
                conditions.push(`cc.slug = $${paramIndex}`);
                params.push(category);
                paramIndex++;
            }

            const whereClause =
                conditions.length > 0
                    ? `WHERE ${conditions.join(" AND ")}`
                    : "";

            // First get all matching courses
            const sqlQuery = `
                SELECT c.*
                FROM courses c
                LEFT JOIN course_category_junction ccj ON c.id = ccj.course_id
                LEFT JOIN course_categories cc ON ccj.category_id = cc.id
                ${whereClause}
                ORDER BY c.name ASC, c.code ASC
            `;

            const allCourses = await executeQuery<Course>(sqlQuery, params);

            // Group courses by name only
            const courseMap = new Map<string, Course>();
            allCourses.forEach((course) => {
                const key = course.name.toLowerCase(); // Use lowercase for case-insensitive matching
                if (courseMap.has(key)) {
                    // If course exists, append the code and department
                    const existingCourse = courseMap.get(key)!;
                    // Only append if the code is not already included and matches course code pattern
                    if (
                        !existingCourse.code.includes(course.code) &&
                        /^[A-Z]{2,4}\s*\d{4}$/.test(course.code)
                    ) {
                        existingCourse.code = `${existingCourse.code}, ${course.code}`;
                    }
                    // Only append if the department is not already included
                    if (
                        !existingCourse.department.includes(course.department)
                    ) {
                        existingCourse.department = `${existingCourse.department}, ${course.department}`;
                    }
                } else {
                    // Only include valid course codes
                    if (!/^[A-Z]{2,4}\s*\d{4}$/.test(course.code)) {
                        return;
                    }
                    courseMap.set(key, { ...course });
                }
            });

            const courses = Array.from(courseMap.values());
            this.cache.set(cacheKey, courses);
            return courses;
        } catch (err) {
            return this.handleDatabaseError(err, "searchCourses");
        }
    }

    // Get course reviews with filtering and sorting
    static async getCourseReviews(
        courseId: string,
        minRating?: number,
        maxRating?: number,
        minDifficulty?: number,
        maxDifficulty?: number,
        minWorkload?: number,
        maxWorkload?: number,
        sortBy?: string,
        sortOrder?: string,
        limit?: number
    ): Promise<CourseReview[]> {
        try {
            const cacheKey = `course_reviews:${courseId}:${JSON.stringify({ minRating, maxRating, minDifficulty, maxDifficulty, minWorkload, maxWorkload, sortBy, sortOrder, limit })}`;
            const cached = this.cache.get<CourseReview[]>(cacheKey);
            if (cached) return cached;

            let sqlQuery = sql`
                SELECT cr.*, u.name as author_name, u.image as author_image
                FROM course_reviews cr
                JOIN users u ON cr.author_id = u.id
                WHERE cr.course_id = ${courseId}
            `;

            if (minRating) {
                sqlQuery = sql`${sqlQuery} AND cr.overall_rating >= ${minRating}`;
            }
            if (maxRating) {
                sqlQuery = sql`${sqlQuery} AND cr.overall_rating <= ${maxRating}`;
            }
            if (minDifficulty) {
                sqlQuery = sql`${sqlQuery} AND cr.difficulty >= ${minDifficulty}`;
            }
            if (maxDifficulty) {
                sqlQuery = sql`${sqlQuery} AND cr.difficulty <= ${maxDifficulty}`;
            }
            if (minWorkload) {
                sqlQuery = sql`${sqlQuery} AND cr.workload >= ${minWorkload}`;
            }
            if (maxWorkload) {
                sqlQuery = sql`${sqlQuery} AND cr.workload <= ${maxWorkload}`;
            }

            // Add sorting
            const sortField = sortBy || "date";
            const order = sortOrder || "desc";
            const sortColumn = sortField === "date" ? "created_at" : sortField;
            sqlQuery = sql`${sqlQuery} ORDER BY cr.${sortColumn} ${order}`;

            if (limit) {
                sqlQuery = sql`${sqlQuery} LIMIT ${limit}`;
            }

            const result = await sqlQuery;
            const reviews = result as CourseReview[];
            this.cache.set(cacheKey, reviews);
            return reviews;
        } catch (err) {
            return this.handleDatabaseError(err, "getCourseReviews");
        }
    }

    // Get course schedule with availability
    static async getCourseSchedule(
        courseId: string,
        semester?: string,
        year?: number
    ): Promise<{
        schedule: {
            day: string;
            startTime: string;
            endTime: string;
        }[];
        availability: {
            totalSeats: number;
            enrolledStudents: number;
            availableSeats: number;
        };
    }> {
        try {
            const cacheKey = `course_schedule:${courseId}:${semester}:${year}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached as any;

            let sqlQuery = sql`
                SELECT cs.*, c.total_seats, c.enrolled_students
                FROM course_schedules cs
                JOIN courses c ON cs.course_id = c.id
                WHERE cs.course_id = ${courseId}
            `;

            if (semester) {
                sqlQuery = sql`${sqlQuery} AND c.semester = ${semester}`;
            }
            if (year) {
                sqlQuery = sql`${sqlQuery} AND c.year = ${year}`;
            }

            const schedule = await sqlQuery;
            const result = {
                schedule: schedule.map((s) => ({
                    day: s.day,
                    startTime: s.start_time,
                    endTime: s.end_time,
                })),
                availability: {
                    totalSeats: schedule[0]?.total_seats || 0,
                    enrolledStudents: schedule[0]?.enrolled_students || 0,
                    availableSeats:
                        (schedule[0]?.total_seats || 0) -
                        (schedule[0]?.enrolled_students || 0),
                },
            };

            this.cache.set(cacheKey, result);
            return result;
        } catch (err) {
            return this.handleDatabaseError(err, "getCourseSchedule");
        }
    }

    // Get course prerequisites and corequisites (assumes columns or join table)
    static async getCourseRequisites(
        courseId: string
    ): Promise<{ prerequisites: string[]; corequisites: string[] }> {
        try {
            // Example: If you have columns prerequisites/corequisites as comma-separated codes
            const result =
                await sql`SELECT prerequisites, corequisites FROM courses WHERE id = ${courseId}`;
            if (!result[0]) return { prerequisites: [], corequisites: [] };
            return {
                prerequisites: result[0].prerequisites
                    ? result[0].prerequisites.split(",")
                    : [],
                corequisites: result[0].corequisites
                    ? result[0].corequisites.split(",")
                    : [],
            };
        } catch (err) {
            return this.handleDatabaseError(err, "getCourseRequisites");
        }
    }

    // Get a single course by ID (with cache)
    static async getCourseById(courseId: string): Promise<Course | null> {
        try {
            const cacheKey = `course:${courseId}`;
            const cached = this.cache.get<Course>(cacheKey);
            if (cached) return cached;

            const result =
                await sql`SELECT * FROM courses WHERE id = ${courseId} LIMIT 1`;
            if (!result[0]) return null;
            const course = result[0] as Course;
            this.cache.set(cacheKey, course);
            return course;
        } catch (err) {
            return this.handleDatabaseError(err, "getCourseById");
        }
    }

    static async getCourseCategories() {
        const categories = await sql`
            SELECT id, name, description, slug
            FROM course_categories
            ORDER BY name ASC
        `;
        return categories;
    }

    // Get non-sensitive user information
    static async getUserInfo(userId: string): Promise<UserInfo | null> {
        try {
            const cacheKey = `user:${userId}`;
            const cached = this.cache.get<UserInfo>(cacheKey);
            if (cached) return cached;

            const result = await sql`
                SELECT id, name, program, avatar_url, created_at, updated_at
                FROM users
                WHERE id = ${userId}
                LIMIT 1
            `;

            if (!result[0]) return null;
            const userInfo = result[0] as UserInfo;
            this.cache.set(cacheKey, userInfo);
            return userInfo;
        } catch (err) {
            return this.handleDatabaseError(err, "getUserInfo");
        }
    }

    // Store conversation history (creates a new conversation and messages)
    static async storeConversationHistory(
        history: ConversationHistory
    ): Promise<void> {
        try {
            const cacheKey = `conversation:${history.userId}`;
            // Create a new conversation
            const now = new Date();
            const title = `Chat (${now.toLocaleString()})`;
            const conversationId = uuidv4();
            await sql`
                INSERT INTO chat_conversations (id, user_id, title, created_at, updated_at)
                VALUES (${conversationId}, ${history.userId}, ${title}, ${now.toISOString()}, ${now.toISOString()})
            `;
            // Insert all messages
            for (const msg of history.messages) {
                await sql`
                    INSERT INTO chat_messages (id, conversation_id, user_id, role, content, tokens, created_at)
                    VALUES (
                        ${uuidv4()},
                        ${conversationId},
                        ${history.userId},
                        ${msg.role},
                        ${typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)},
                        0,
                        ${now.toISOString()}
                    )
                `;
            }
            // Update cache
            this.cache.set(cacheKey, history);
        } catch (err) {
            return this.handleDatabaseError(err, "storeConversationHistory");
        }
    }

    // Get the latest conversation history for a user
    static async getConversationHistory(
        userId: string
    ): Promise<ConversationHistory | null> {
        try {
            const cacheKey = `conversation:${userId}`;
            const cached = this.cache.get<ConversationHistory>(cacheKey);
            if (cached) return cached;
            // Get the latest conversation for the user
            const conv = await sql`
                SELECT id, updated_at FROM chat_conversations
                WHERE user_id = ${userId}
                ORDER BY updated_at DESC
                LIMIT 1
            `;
            if (!conv[0]) return null;
            const conversationId = conv[0].id;
            // Get all messages for this conversation
            const messages = await sql`
                SELECT role, content FROM chat_messages
                WHERE conversation_id = ${conversationId}
                ORDER BY created_at ASC
            `;
            // Rebuild ConversationHistory
            const history: ConversationHistory = {
                userId,
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
                context: {
                    courseMentions: [],
                    programMentions: [],
                    departmentMentions: [],
                    semesterMentions: [],
                    lastQueryType: "general",
                    lastQueryTimestamp: new Date().toISOString(),
                },
                lastUpdated: conv[0].updated_at,
            };
            this.cache.set(cacheKey, history);
            return history;
        } catch (err) {
            return this.handleDatabaseError(err, "getConversationHistory");
        }
    }
}
