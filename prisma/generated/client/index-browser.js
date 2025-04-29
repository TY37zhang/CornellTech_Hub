
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  description: 'description',
  credits: 'credits',
  department: 'department',
  semester: 'semester',
  year: 'year',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  professorId: 'professorId',
  fullCode: 'fullCode',
  concentration_core: 'concentration_core',
  concentration_elective: 'concentration_elective'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  avatar_url: 'avatar_url',
  created_at: 'created_at',
  updated_at: 'updated_at',
  program: 'program'
};

exports.Prisma.CourseScheduleScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  course_id: 'course_id',
  day: 'day',
  start_time: 'start_time',
  end_time: 'end_time',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CoursePlannerScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  course_id: 'course_id',
  requirement_type: 'requirement_type',
  semester: 'semester',
  year: 'year',
  status: 'status',
  notes: 'notes',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ForumCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  slug: 'slug',
  created_at: 'created_at'
};

exports.Prisma.ForumPostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  author_id: 'author_id',
  category_id: 'category_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at',
  notify_on_reply: 'notify_on_reply'
};

exports.Prisma.ForumCommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  post_id: 'post_id',
  author_id: 'author_id',
  parent_id: 'parent_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  like_count: 'like_count',
  dislike_count: 'dislike_count'
};

exports.Prisma.ForumLikeScalarFieldEnum = {
  id: 'id',
  post_id: 'post_id',
  user_id: 'user_id',
  created_at: 'created_at'
};

exports.Prisma.ForumPostTagScalarFieldEnum = {
  id: 'id',
  post_id: 'post_id',
  tag: 'tag',
  created_at: 'created_at'
};

exports.Prisma.ForumViewScalarFieldEnum = {
  id: 'id',
  post_id: 'post_id',
  user_id: 'user_id',
  created_at: 'created_at'
};

exports.Prisma.ForumSavedScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  post_id: 'post_id',
  created_at: 'created_at'
};

exports.Prisma.ForumNotificationPreferenceScalarFieldEnum = {
  id: 'id',
  post_id: 'post_id',
  user_id: 'user_id',
  notify_on_reply: 'notify_on_reply',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CourseCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt'
};

exports.Prisma.CourseCategoryJunctionScalarFieldEnum = {
  courseId: 'courseId',
  categoryId: 'categoryId',
  createdAt: 'createdAt'
};

exports.Prisma.Course_reviewsScalarFieldEnum = {
  id: 'id',
  course_id: 'course_id',
  author_id: 'author_id',
  rating: 'rating',
  difficulty: 'difficulty',
  workload: 'workload',
  content: 'content',
  created_at: 'created_at',
  updated_at: 'updated_at',
  overall_rating: 'overall_rating'
};

exports.Prisma.Marketplace_itemsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  price: 'price',
  category: 'category',
  condition: 'condition',
  image_url: 'image_url',
  seller_id: 'seller_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Course: 'Course',
  User: 'User',
  CourseSchedule: 'CourseSchedule',
  CoursePlanner: 'CoursePlanner',
  ForumCategory: 'ForumCategory',
  ForumPost: 'ForumPost',
  ForumComment: 'ForumComment',
  ForumLike: 'ForumLike',
  ForumPostTag: 'ForumPostTag',
  ForumView: 'ForumView',
  ForumSaved: 'ForumSaved',
  ForumNotificationPreference: 'ForumNotificationPreference',
  CourseCategory: 'CourseCategory',
  CourseCategoryJunction: 'CourseCategoryJunction',
  course_reviews: 'course_reviews',
  marketplace_items: 'marketplace_items'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
