import { useEffect, useState } from "react";
import api from "../api/axios";
import CourseCard from "./CourseCard";

// Displays all published courses
function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");

        setCourses(response.data);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Unable to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-muted">Loading courses...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Explore
          </p>

          <h1 className="mt-2 text-3xl font-bold text-dark">Browse Courses</h1>

          <p className="mt-2 text-muted">
            Learn practical skills from our collection of courses.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-dark">
              No courses available
            </h2>

            <p className="mt-2 text-sm text-muted">
              Check back later for new courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Courses;
