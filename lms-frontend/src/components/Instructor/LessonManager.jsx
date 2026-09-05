import { useEffect, useState } from "react";
import api from "../../api/axios";

// Manages lessons belonging to one section.
function LessonManager({ sectionId }) {
  // Stores lessons for this section.
  const [lessons, setLessons] = useState([]);

  // Controls whether the lesson form is visible.
  const [showForm, setShowForm] = useState(false);

  // Stores the lesson currently being edited.
  const [editingLessonId, setEditingLessonId] = useState(null);

  // Lesson form data.
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    duration: "",
    orderIndex: "",
  });

  // Loading state for lesson create/update/delete requests.
  const [loading, setLoading] = useState(false);

  // Loading state while initially fetching lessons.
  const [fetching, setFetching] = useState(false);

  // Loading state while uploading a video.
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Error message.
  const [error, setError] = useState("");

  // Video upload success message.
  const [videoMessage, setVideoMessage] = useState("");

  // Load lessons when the component is displayed.
  useEffect(() => {
    const loadLessons = async () => {
      try {
        setFetching(true);
        setError("");

        const response = await api.get(`/sections/${sectionId}/lessons`);

        const sortedLessons = [...response.data].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        );

        setLessons(sortedLessons);
      } catch (err) {
        console.error("Failed to load lessons:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view these lessons.");
        } else if (err.response?.status === 404) {
          setError("Section not found.");
        } else {
          setError("Unable to load lessons.");
        }
      } finally {
        setFetching(false);
      }
    };

    loadLessons();
  }, [sectionId]);

  // Handle lesson form changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError("");
    setVideoMessage("");
  };

  // Reset the lesson form.
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: "",
      orderIndex: "",
    });

    setEditingLessonId(null);
    setShowForm(false);
    setError("");
    setVideoMessage("");
  };

  // Start creating a lesson.
  const handleAddLesson = () => {
    setEditingLessonId(null);

    setForm({
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: "",
      orderIndex: lessons.length + 1,
    });

    setError("");
    setVideoMessage("");
    setShowForm(true);
  };

  // Start editing a lesson.
  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);

    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      duration: lesson.duration ?? "",
      orderIndex: lesson.orderIndex ?? "",
    });

    setError("");
    setVideoMessage("");
    setShowForm(true);
  };

  // Upload a lesson video to Cloudinary.
  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];

    // Clear the file input so the same file can be selected again.
    event.target.value = "";

    if (!file) {
      return;
    }

    // Basic frontend validation.
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    // Keep this consistent with the Gateway/Course Service limit.
    const maxFileSize = 500 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setError("Video file cannot be larger than 500 MB.");
      return;
    }

    try {
      setUploadingVideo(true);
      setError("");
      setVideoMessage("Uploading video...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/videos/upload", formData);

      const videoUrl = response.data?.videoUrl;

      if (!videoUrl) {
        throw new Error("Cloudinary did not return a video URL.");
      }

      // Automatically place the Cloudinary URL into the lesson form.
      setForm((previousForm) => ({
        ...previousForm,
        videoUrl,
      }));

      setVideoMessage("Video uploaded successfully.");
    } catch (err) {
      console.error("Failed to upload video:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Invalid video file. Please select another video.",
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("Only instructors can upload course videos.");
      } else if (err.response?.status === 413) {
        setError("Video file is too large. Maximum size is 500 MB.");
      } else {
        setError("Unable to upload video. Please try again.");
      }

      setVideoMessage("");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Create a new lesson.
  const handleCreateLesson = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(`/sections/${sectionId}/lessons`, {
        title: form.title,
        description: form.description,
        content: form.content,
        videoUrl: form.videoUrl,
        duration: Number(form.duration),
        orderIndex: Number(form.orderIndex),
      });

      setLessons((previousLessons) => {
        const updatedLessons = [...previousLessons, response.data];

        return updatedLessons.sort((a, b) => a.orderIndex - b.orderIndex);
      });

      resetForm();
    } catch (err) {
      console.error("Failed to create lesson:", err);

      if (err.response?.status === 400) {
        setError(
          "Please check the lesson details. The title or order may already exist.",
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to create this lesson.");
      } else if (err.response?.status === 404) {
        setError("Section not found.");
      } else {
        setError("Unable to create lesson. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update an existing lesson.
  const handleUpdateLesson = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.put(
        `/sections/${sectionId}/lessons/${editingLessonId}`,
        {
          title: form.title,
          description: form.description,
          content: form.content,
          videoUrl: form.videoUrl,
          duration: Number(form.duration),
          orderIndex: Number(form.orderIndex),
        },
      );

      setLessons((previousLessons) => {
        const updatedLessons = previousLessons.map((lesson) =>
          lesson.id === editingLessonId ? response.data : lesson,
        );

        return updatedLessons.sort((a, b) => a.orderIndex - b.orderIndex);
      });

      resetForm();
    } catch (err) {
      console.error("Failed to update lesson:", err);

      if (err.response?.status === 400) {
        setError("Please check the lesson details.");
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to update this lesson.");
      } else if (err.response?.status === 404) {
        setError("Lesson not found.");
      } else {
        setError("Unable to update lesson. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete a lesson.
  const handleDeleteLesson = async (lessonId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(`/sections/${sectionId}/lessons/${lessonId}`);

      setLessons((previousLessons) =>
        previousLessons.filter((lesson) => lesson.id !== lessonId),
      );
    } catch (err) {
      console.error("Failed to delete lesson:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to delete this lesson.");
      } else if (err.response?.status === 404) {
        setError("Lesson not found.");
      } else {
        setError("Unable to delete lesson. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-5">
      {/* Lesson heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-dark">Lessons</p>

          <p className="mt-1 text-xs text-muted">
            Add videos, content, and lesson details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddLesson}
          disabled={loading || uploadingVideo}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Add Lesson
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Lesson form */}
      {showForm && (
        <div className="mt-5 rounded-xl border border-primary/10 bg-white p-5">
          <p className="text-sm font-semibold text-primary">
            {editingLessonId ? "Edit Lesson" : "Create Lesson"}
          </p>

          <h3 className="mt-1 text-lg font-bold text-dark">
            {editingLessonId ? "Update lesson details" : "Add a new lesson"}
          </h3>

          <form
            onSubmit={editingLessonId ? handleUpdateLesson : handleCreateLesson}
            className="mt-5 space-y-5"
          >
            {/* Title */}
            <div>
              <label
                htmlFor={`lesson-title-${sectionId}`}
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Lesson Title
              </label>

              <input
                id={`lesson-title-${sectionId}`}
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to Java"
                className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor={`lesson-description-${sectionId}`}
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Description
              </label>

              <textarea
                id={`lesson-description-${sectionId}`}
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what students will learn..."
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor={`lesson-content-${sectionId}`}
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Lesson Content
              </label>

              <textarea
                id={`lesson-content-${sectionId}`}
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={7}
                placeholder="Write the lesson content here..."
                className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            {/* Video Upload */}
            <div>
              <label
                htmlFor={`lesson-video-upload-${sectionId}`}
                className="mb-2 block text-sm font-semibold text-dark"
              >
                Course Video
              </label>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark">
                      Upload lesson video
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      MP4 and other supported video formats. Maximum 500 MB.
                    </p>
                  </div>

                  <label
                    htmlFor={`lesson-video-upload-${sectionId}`}
                    className={`inline-flex cursor-pointer items-center justify-center rounded-lg border border-primary/20 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 ${
                      uploadingVideo
                        ? "pointer-events-none cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    {uploadingVideo ? "Uploading..." : "Choose Video"}
                  </label>

                  <input
                    id={`lesson-video-upload-${sectionId}`}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                  />
                </div>

                {videoMessage && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                    <p className="text-sm font-medium text-green-700">
                      ✓ {videoMessage}
                    </p>
                  </div>
                )}

                {form.videoUrl && (
                  <div className="mt-3 rounded-lg border border-primary/10 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Uploaded Video
                    </p>

                    <p className="mt-1 break-all text-xs text-primary">
                      {form.videoUrl}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Duration and order */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`lesson-duration-${sectionId}`}
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Duration (minutes)
                </label>

                <input
                  id={`lesson-duration-${sectionId}`}
                  name="duration"
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor={`lesson-order-${sectionId}`}
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Lesson Order
                </label>

                <input
                  id={`lesson-order-${sectionId}`}
                  name="orderIndex"
                  type="number"
                  min="1"
                  value={form.orderIndex}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            {/* Form buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || uploadingVideo}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : editingLessonId
                    ? "Save Lesson"
                    : "Create Lesson"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading || uploadingVideo}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {fetching ? (
        <p className="mt-5 text-sm text-muted">Loading lessons...</p>
      ) : (
        <div className="mt-5 space-y-2">
          {lessons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
              <p className="text-sm font-medium text-dark">No lessons yet</p>

              <p className="mt-1 text-xs text-muted">
                Add the first lesson to this section.
              </p>
            </div>
          ) : (
            lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-600">
                      {lesson.orderIndex}
                    </div>

                    <div>
                      <h4 className="font-medium text-dark">{lesson.title}</h4>

                      <p className="mt-1 text-sm text-muted">
                        {lesson.description}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                        {lesson.duration != null && (
                          <span>{lesson.duration} min</span>
                        )}

                        {lesson.videoUrl && (
                          <span className="text-primary">Video uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditLesson(lesson)}
                      disabled={loading || uploadingVideo}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      disabled={loading || uploadingVideo}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default LessonManager;
