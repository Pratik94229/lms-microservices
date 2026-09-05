import { Link } from "react-router-dom";

// Displays information for one course
function CourseCard({ course }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Temporary course image */}
      <div className="flex h-44 items-center justify-center bg-secondary">
        <span className="text-4xl">📚</span>
      </div>

      {/* Course information */}
      <div className="p-5">
        {/* Course title */}
        <h2 className="text-xl font-semibold text-dark">{course.title}</h2>

        {/* Course description */}
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
          {course.description}
        </p>

        {/* Price and action */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ₹{course.price}
          </span>

          <Link
            to={`/courses/${course.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
