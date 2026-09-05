import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { isAdmin } from "../../utils/auth";

function AdminUserDetails() {
  const navigate = useNavigate();
  const { keycloakUserId } = useParams();

  const [userItem, setUserItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * =========================================================
   * GET PRIMARY LMS ROLE
   * =========================================================
   */

  const getLmsRole = (roles = []) => {
    if (roles.includes("ADMIN")) {
      return "ADMIN";
    }

    if (roles.includes("INSTRUCTOR")) {
      return "INSTRUCTOR";
    }

    if (roles.includes("STUDENT")) {
      return "STUDENT";
    }

    return null;
  };

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
   * LOAD USER
   * =========================================================
   *
   * We use the existing:
   *
   * GET /api/users
   *
   * endpoint.
   *
   * We do not need a new backend endpoint because the
   * Admin API already returns the complete User object
   * together with Keycloak roles.
   */

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/", { replace: true });
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users");

        const users = response.data || [];

        const foundUser = users.find(
          (item) => item.user?.keycloakUserId === keycloakUserId,
        );

        if (!foundUser) {
          setError("User not found.");
          return;
        }

        setUserItem(foundUser);
      } catch (err) {
        console.error("Failed to load user details:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this page.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load user details. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate, keycloakUserId]);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-muted">Loading user details...</p>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error || !userItem) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-600">
              {error || "User not found."}
            </p>

            <Link
              to="/admin"
              className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const user = userItem.user;

  const role = getLmsRole(userItem.roles);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Not provided";

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back */}

        <Link
          to="/admin"
          className="inline-flex items-center text-sm font-semibold text-primary transition hover:opacity-80"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Profile Image / Initial */}

            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.username?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>

            {/* User Header Information */}

            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                User Details
              </p>

              <h1 className="mt-1 text-3xl font-bold text-dark">
                {user?.username || "Unknown User"}
              </h1>

              <p className="mt-2 text-muted">
                {user?.email || "No email provided"}
              </p>

              <div className="mt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleClass(
                    role,
                  )}`}
                >
                  {role || "No LMS Role"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Profile Information
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Personal Details
            </h2>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            {/* Username */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Username
              </p>

              <p className="mt-2 font-semibold text-dark">
                {user?.username || "Not provided"}
              </p>
            </div>

            {/* Email */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Email
              </p>

              <p className="mt-2 font-semibold text-dark break-all">
                {user?.email || "Not provided"}
              </p>
            </div>

            {/* First Name */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                First Name
              </p>

              <p className="mt-2 font-semibold text-dark">
                {user?.firstName || "Not provided"}
              </p>
            </div>

            {/* Last Name */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Last Name
              </p>

              <p className="mt-2 font-semibold text-dark">
                {user?.lastName || "Not provided"}
              </p>
            </div>

            {/* Full Name */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Full Name
              </p>

              <p className="mt-2 font-semibold text-dark">{fullName}</p>
            </div>

            {/* Phone */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Phone
              </p>

              <p className="mt-2 font-semibold text-dark">
                {user?.phone || "Not provided"}
              </p>
            </div>

            {/* LMS Role */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                LMS Role
              </p>

              <div className="mt-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleClass(
                    role,
                  )}`}
                >
                  {role || "No LMS Role"}
                </span>
              </div>
            </div>

            {/* Profile Image */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Profile Image
              </p>

              <p className="mt-2 break-all text-sm text-dark">
                {user?.profileImage || "Not provided"}
              </p>
            </div>
          </div>
        </section>

        {/* System Information */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              System Information
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Account Identifiers
            </h2>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            {/* MongoDB ID */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                LMS Profile ID
              </p>

              <p className="mt-2 break-all font-mono text-sm text-dark">
                {user?.id || "Not available"}
              </p>
            </div>

            {/* Keycloak ID */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Keycloak User ID
              </p>

              <p className="mt-2 break-all font-mono text-sm text-dark">
                {user?.keycloakUserId || "Not available"}
              </p>
            </div>
          </div>
        </section>

        {/* Keycloak Roles */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Authorization
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Keycloak Realm Roles
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 p-6">
            {(userItem.roles || []).map((userRole) => (
              <span
                key={userRole}
                className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleClass(
                  userRole,
                )}`}
              >
                {userRole}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminUserDetails;
