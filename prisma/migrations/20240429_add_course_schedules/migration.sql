-- CreateTable
CREATE TABLE "course_schedules" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "day" VARCHAR(20) NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_schedules_user_id_idx" ON "course_schedules"("user_id");
CREATE INDEX "course_schedules_course_id_idx" ON "course_schedules"("course_id");

-- AddForeignKey
ALTER TABLE "course_schedules" ADD CONSTRAINT "course_schedules_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_schedules" ADD CONSTRAINT "course_schedules_course_id_fkey" 
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE; 