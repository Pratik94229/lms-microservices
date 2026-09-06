import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { isAdmin } from "../../utils/auth";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [selectedRoles, setSelectedRoles] = useState({});

  const [successMessage, setSuccessMessage] = useState("");

  /*
   * =========================================================
   * GET LMS ROLE
   * =========================================================
   *
   * User Service now stores a single LMS role directly
   * on the User object.
   */

  const getLmsRole = (user) => {
    return user?.role || null;
  };

  /*
   * =========================================================
   * LOAD USERS
   * =========================================================
   */

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      const loadedUsers = response.data || [];

      setUsers(loadedUsers);

      const initialRoles = {};

      loadedUsers.forEach((user) => {
        const role = getLmsRole(user);

        if (role && user?.id) {
          initialRoles[user.id] = role;
        }
      });

      setSelectedRoles(initialRoles);
    } catch (err) {
      console.error("Failed to load users:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to access this page.");
      } else {
        setError("Unable to load users. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * =========================================================
   * ADMIN ACCESS + INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/", { replace: true });
      return;
    }

    fetchUsers();
  }, [navigate, fetchUsers]);

  /*
   * =========================================================
   * ROLE STYLING
   * =========================================================
   */

  const getRoleClass = (role) => {
    if (role === "ADMIN") {
      return "bg-red-100 text-red-700";
    }

    if (role === "INSTRUCTOR") {
      return "bg-purple-100 text-purple-700";
    }

    if (role === "STUDENT") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  /*
   * =========================================================
   * ROLE SELECTION
   * =========================================================
   */

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((previous) => ({
      ...previous,
      [userId]: role,
    }));

    setSuccessMessage("");
    setError("");
  };

  /*
   * =========================================================
   * SAVE ROLE
   * =========================================================
   */

  const handleSaveRole = async (userId) => {
    const role = selectedRoles[userId];

    if (!role) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      setError("");
      setSuccessMessage("");

      const response = await api.put(`/users/${userId}/role`, {
        role,
      });

      console.log("Role update response:", response.data);

      setSuccessMessage("User role updated successfully.");

      await fetchUsers();
    } catch (err) {
      console.error("Failed to update user role:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to change user roles.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid role selected.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to update the user role. Please try again.",
        );
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  /*
   * =========================================================
   * DELETE USER
   * =========================================================
   */

  const handleDeleteUser = async (user) => {
    const userId = user?.id;
    const username = user?.username || "this user";

    if (!userId) {
      setError("Unable to delete this user because the user ID is missing.");
      return;
    }

    /*
     * Safety protection:
     *
     * Do not allow the currently logged-in admin to
     * accidentally delete their own account.
     */

    const confirmed = window.confirm(
      `Are you sure you want to delete "${username}"?\n\n` +
        "This will permanently remove the user's LMS account.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(userId);
      setError("");
      setSuccessMessage("");

      const response = await api.delete(`/users/${userId}`);

      console.log("User deletion response:", response.data);

      setSuccessMessage(`User "${username}" deleted successfully.`);

      await fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "You do not have permission to delete users.",
        );
      } else if (err.response?.status === 404) {
        setError(err.response?.data?.message || "User was not found.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to delete the user. Please try again.",
        );
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-muted">Loading admin dashboard...</p>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error && users.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <Link
              to="/"
              className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const profilesWithPhone = users.filter((user) => user?.phone).length;

  const students = users.filter(
    (user) => getLmsRole(user) === "STUDENT",
  ).length;

  const instructors = users.filter(
    (user) => getLmsRole(user) === "INSTRUCTOR",
  ).length;

  const admins = users.filter((user) => getLmsRole(user) === "ADMIN").length;

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-dark">Admin Dashboard</h1>

          <p className="mt-2 text-muted">Manage users and monitor the LMS.</p>
        </div>

        {/* Statistics */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">Total Users</p>

            <p className="mt-2 text-3xl font-bold text-dark">{users.length}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">Students</p>

            <p className="mt-2 text-3xl font-bold text-blue-600">{students}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">Instructors</p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {instructors}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">Admins</p>

            <p className="mt-2 text-3xl font-bold text-red-600">{admins}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">
              Profiles With Phone
            </p>

            <p className="mt-2 text-3xl font-bold text-dark">
              {profilesWithPhone}
            </p>
          </div>
        </div>

        {/* Success Message */}

        {successMessage && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-sm font-semibold text-green-700">
              ✓ {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}

        {error && users.length > 0 && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Users */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              User Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Registered Users
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-dark">No users found</p>

              <p className="mt-2 text-sm text-muted">
                There are currently no LMS user profiles.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-dark">
                      User
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-dark">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-dark">
                      Name
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-dark">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-dark">
                      Role
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-dark">
                      Action
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-dark">
                      Delete
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const currentRole = getLmsRole(user);

                    const selectedRole = selectedRoles[user?.id] || "";

                    const fullName =
                      [user?.firstName, user?.lastName]
                        .filter(Boolean)
                        .join(" ") || "—";

                    const isUpdating = updatingUserId === user?.id;

                    const isDeleting = deletingUserId === user?.id;

                    return (
                      <tr
                        key={user?.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-secondary/50"
                      >
                        {/* User */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                              {user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div>
                              <p className="font-semibold text-dark">
                                {user?.username || "Unknown"}
                              </p>

                              <p className="text-xs text-muted">
                                {user?.id || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}

                        <td className="px-6 py-4 text-sm text-muted">
                          {user?.email || "—"}
                        </td>

                        {/* Name */}

                        <td className="px-6 py-4 text-sm text-dark">
                          {fullName}
                        </td>

                        {/* Phone */}

                        <td className="px-6 py-4 text-sm text-muted">
                          {user?.phone || "—"}
                        </td>

                        {/* Role */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleClass(
                                currentRole,
                              )}`}
                            >
                              {currentRole || "No LMS Role"}
                            </span>

                            <select
                              value={selectedRole}
                              onChange={(event) =>
                                handleRoleChange(user?.id, event.target.value)
                              }
                              disabled={isUpdating || isDeleting}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                              <option value="">Select role</option>

                              <option value="STUDENT">STUDENT</option>

                              <option value="INSTRUCTOR">INSTRUCTOR</option>

                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </div>
                        </td>

                        {/* Action */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/users/${user?.id}`}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                            >
                              View Details
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleSaveRole(user?.id)}
                              disabled={
                                isUpdating ||
                                isDeleting ||
                                !selectedRole ||
                                selectedRole === currentRole
                              }
                              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
                            >
                              {isUpdating ? "Saving..." : "Save Role"}
                            </button>
                          </div>
                        </td>

                        {/* Delete */}

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isUpdating || isDeleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
