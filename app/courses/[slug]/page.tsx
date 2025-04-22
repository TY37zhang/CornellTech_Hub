import Link from "next/link"
import { ArrowLeft, BookOpen, Calendar, Clock, Star, ThumbsDown, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  // This would normally fetch data based on the slug
  const courseData = {
    title: "Machine Learning",
    professor: "Prof. Serge Belongie",
    category: "Technical",
    rating: 4.0,
    reviewCount: 24,
    difficulty: 7.5,
    workload: 8.0,
    value: 8.5,
    description:
      "This course provides a broad introduction to machine learning and statistical pattern recognition. Topics include: supervised learning, unsupervised learning, learning theory, reinforcement learning and adaptive control.",
    syllabus:
      "The course covers fundamental concepts in machine learning including linear models, kernel methods, deep learning, clustering, dimensionality reduction, and more. Students will complete programming assignments and a final project.",
    ratings: {
      5: 10,
      4: 8,
      3: 4,
      2: 1,
      1: 1,
    },
    reviews: [
      {
        id: 1,
        author: "Alex Johnson",
        program: "MEng CS",
        date: "Fall 2023",
        rating: 5,
        content:
          "Excellent course that provides a solid foundation in machine learning concepts. The programming assignments were challenging but very educational. Professor Belongie explains complex concepts clearly and is always willing to help during office hours.",
        helpful: 15,
        unhelpful: 2,
      },
      {
        id: 2,
        author: "Jamie Smith",
        program: "MBA Tech",
        date: "Spring 2023",
        rating: 4,
        content:
          "As someone with a business background, I found this course challenging but manageable. The professor does a good job explaining technical concepts to non-technical students. The workload is heavy, but worth it if you want to understand how ML works.",
        helpful: 12,
        unhelpful: 1,
      },
      {
        id: 3,
        author: "Taylor Wong",
        program: "MEng CS",
        date: "Fall 2022",
        rating: 3,
        content:
          "The course content is good, but the pacing can be quite fast if you don't have prior experience with machine learning concepts. The assignments take much longer than the estimated time. Curve is tough, so be prepared to put in extra hours.",
        helpful: 8,
        unhelpful: 3,
      },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/courses">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to courses</span>
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">Back to courses</p>
              </div>
              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400"
                        variant="secondary"
                      >
                        {courseData.category}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{courseData.title}</h1>
                    <p className="text-muted-foreground">{courseData.professor}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(courseData.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{courseData.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({courseData.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Technical Course</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Fall & Spring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">~10 hours/week</span>
                    </div>
                  </div>
                </div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Course Rating Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Overall</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(courseData.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{courseData.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-yellow-400"
                                style={{ width: `${courseData.difficulty * 10}%` }}
                              ></div>
                            </div>
                            <span>{courseData.difficulty}/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-yellow-400"
                                style={{ width: `${courseData.workload * 10}%` }}
                              ></div>
                            </div>
                            <span>{courseData.workload}/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-yellow-400"
                                style={{ width: `${courseData.value * 10}%` }}
                              ></div>
                            </div>
                            <span>{courseData.value}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Write a Review</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="syllabus"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Syllabus
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-6">
              <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Course Description</h2>
                    <p className="text-muted-foreground">{courseData.description}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">What You'll Learn</h3>
                    <ul className="list-disc pl-6 text-muted-foreground">
                      <li>Fundamental concepts in machine learning and statistical pattern recognition</li>
                      <li>Supervised learning methods including linear models, SVMs, and neural networks</li>
                      <li>Unsupervised learning techniques such as clustering and dimensionality reduction</li>
                      <li>Practical implementation of machine learning algorithms in Python</li>
                      <li>How to evaluate and compare machine learning models</li>
                      <li>Real-world applications of machine learning</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Prerequisites</h3>
                    <p className="text-muted-foreground">
                      Basic knowledge of linear algebra, calculus, and probability theory. Programming experience in
                      Python is recommended but not required.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2">
                        {Object.entries(courseData.ratings)
                          .sort((a, b) => Number(b[0]) - Number(a[0]))
                          .map(([rating, count]) => (
                            <div key={rating} className="flex items-center gap-2">
                              <div className="flex w-12 items-center gap-1">
                                <span>{rating}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              </div>
                              <Progress
                                value={(count / courseData.reviewCount) * 100}
                                className="h-2"
                                indicatorClassName="bg-yellow-400"
                              />
                              <div className="w-12 text-right text-sm text-muted-foreground">{count}</div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Course Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department</span>
                          <span className="font-medium">Computer Science</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Course Code</span>
                          <span className="font-medium">CS 5785</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Credits</span>
                          <span className="font-medium">4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Semesters Offered</span>
                          <span className="font-medium">Fall, Spring</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated</span>
                          <span className="font-medium">2 weeks ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Student Reviews</h2>
                    <Button>Write a Review</Button>
                  </div>
                  <div className="space-y-6">
                    {courseData.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={review.author} />
                                <AvatarFallback>{review.author[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{review.author}</CardTitle>
                                <CardDescription>
                                  {review.program} • {review.date}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-muted text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-muted-foreground">{review.content}</p>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Was this review helpful?</span>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{review.helpful}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ThumbsDown className="h-4 w-4" />
                              <span>{review.unhelpful}</span>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Review Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          When writing a review, please consider the following guidelines:
                        </p>
                        <ul className="list-disc pl-6 text-sm text-muted-foreground">
                          <li>Be honest and specific about your experience</li>
                          <li>Focus on the course content, teaching quality, and workload</li>
                          <li>Avoid personal attacks on professors or students</li>
                          <li>Provide constructive feedback that can help other students</li>
                          <li>Include both positives and areas for improvement</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Filter Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rating</label>
                          <div className="flex flex-wrap gap-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <Button key={rating} variant="outline" size="sm" className="h-8 gap-1">
                                {rating} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Semester</label>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              Fall 2023
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              Spring 2023
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              Fall 2022
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Program</label>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              MEng
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              MBA
                            </Button>
                            <Button variant="outline" size="sm" className="h-8">
                              LLM
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="syllabus" className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Course Syllabus</h2>
                  <p className="text-muted-foreground">{courseData.syllabus}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight">Weekly Schedule</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 1: Introduction to Machine Learning</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Overview of machine learning and its applications</li>
                        <li>Types of machine learning: supervised, unsupervised, reinforcement</li>
                        <li>Python tools for machine learning: NumPy, Pandas, Scikit-learn</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 2: Linear Regression</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Linear regression models</li>
                        <li>Loss functions and optimization</li>
                        <li>Regularization techniques</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 3: Classification</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Logistic regression</li>
                        <li>Decision boundaries</li>
                        <li>Multi-class classification</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 4: Support Vector Machines</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Maximum margin classifiers</li>
                        <li>Kernel methods</li>
                        <li>Soft margin classification</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 5: Neural Networks</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Perceptrons and multi-layer networks</li>
                        <li>Backpropagation</li>
                        <li>Deep learning introduction</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 6: Midterm Exam</h4>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 7: Clustering</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>K-means clustering</li>
                        <li>Hierarchical clustering</li>
                        <li>Density-based clustering</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 8: Dimensionality Reduction</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Principal Component Analysis (PCA)</li>
                        <li>t-SNE</li>
                        <li>Feature selection methods</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 9: Ensemble Methods</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Bagging and boosting</li>
                        <li>Random forests</li>
                        <li>Gradient boosting machines</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 10: Model Evaluation</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Cross-validation</li>
                        <li>Performance metrics</li>
                        <li>Bias-variance tradeoff</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Week 11-14: Final Projects</h4>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li>Project proposal and development</li>
                        <li>Implementation and experimentation</li>
                        <li>Final presentations</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight">Grading</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Homework Assignments (5)</span>
                      <span>30%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Midterm Exam</span>
                      <span>25%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Final Project</span>
                      <span>35%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Participation</span>
                      <span>10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="container px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Share Your Experience</h2>
              <p className="text-muted-foreground">
                Help your fellow students by sharing your experience with this course.
              </p>
            </div>
            <Button>Write a Review</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
