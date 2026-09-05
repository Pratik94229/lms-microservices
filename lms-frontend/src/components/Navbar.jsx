import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  addAuthListener,
  getUserRoles,
  isAuthenticated,
  removeAccessToken,
} from "../utils/auth";
import keycloak from "../keycloak";

function Navbar() {
  // Track whether the user is authenticated.
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // Store the roles assigned to the current user.
  const [roles, setRoles] = useState(getUserRoles());

  // Control the mobile navigation menu.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Update Navbar when authentication changes.
    const handleAuthChange = () => {
      setAuthenticated(isAuthenticated());
      setRoles(getUserRoles());
    };

    // Listen for authentication changes.
    const removeListener = addAuthListener(handleAuthChange);

    // Remove listener when Navbar is unmounted.
    return removeListener;
  }, []);

  // Logout the current user from Keycloak.
  const handleLogout = async () => {
    setMobileMenuOpen(false);

    try {
      // Clear the locally stored token first.
      removeAccessToken();

      // End the actual Keycloak browser session.
      await keycloak.logout({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error("Keycloak logout failed:", error);

      // Make sure the local authentication state
      // is cleared even if the Keycloak request fails.
      removeAccessToken();
    }
  };

  // Determine the user's primary role.
  const getPrimaryRole = () => {
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

  const primaryRole = getPrimaryRole();

  // Desktop navigation link styling.
  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
      isActive
        ? "bg-primary text-white shadow-sm"
        : "text-gray-700 hover:bg-primary/10 hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* =====================================================
            LOGO
        ====================================================== */}

        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-md">
            L
          </div>

          <div className="hidden sm:block">
            <p className="text-xl font-bold leading-none text-dark">LMS</p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Learn. Grow. Succeed.
            </p>
          </div>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <div className="hidden items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1.5 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/courses" className={navLinkClass}>
            Courses
          </NavLink>

          {/* Student navigation */}

          {authenticated && primaryRole === "STUDENT" && (
            <NavLink to="/my-learning" className={navLinkClass}>
              My Learning
            </NavLink>
          )}

          {/* Instructor navigation */}

          {authenticated && primaryRole === "INSTRUCTOR" && (
            <NavLink to="/instructor" className={navLinkClass}>
              Instructor
            </NavLink>
          )}

          {/* Admin navigation */}

          {authenticated && primaryRole === "ADMIN" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}

          {/* Profile */}

          {authenticated && (
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          )}
        </div>

        {/* =====================================================
            DESKTOP AUTH SECTION
        ====================================================== */}

        <div className="hidden items-center gap-3 md:flex">
          {authenticated ? (
            <>
              {/* Current role */}

              {primaryRole && (
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm" />

                  <span className="text-xs font-bold tracking-wider text-primary">
                    {primaryRole}
                  </span>
                </div>
              )}

              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}

              <Link
                to="/login"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 hover:text-primary"
              >
                Login
              </Link>

              {/* Sign Up */}

              <Link
                to="/register"
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-lg font-semibold text-gray-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "×" : "☰"}
        </button>
      </nav>

      {/* =======================================================
          MOBILE MENU
      ======================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-5 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {/* Home */}

            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              Home
            </NavLink>

            {/* Courses */}

            <NavLink
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              Courses
            </NavLink>

            {/* Student */}

            {authenticated && primaryRole === "STUDENT" && (
              <NavLink
                to="/my-learning"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                My Learning
              </NavLink>
            )}

            {/* Instructor */}

            {authenticated && primaryRole === "INSTRUCTOR" && (
              <NavLink
                to="/instructor"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Instructor
              </NavLink>
            )}

            {/* Admin */}

            {authenticated && primaryRole === "ADMIN" && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Admin
              </NavLink>
            )}

            {/* Profile */}

            {authenticated && (
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                Profile
              </NavLink>
            )}

            <div className="my-2 border-t border-gray-200" />

            {/* Mobile authentication */}

            {authenticated ? (
              <div className="flex items-center justify-between pt-2">
                {primaryRole && (
                  <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                    <span className="text-xs font-bold tracking-wider text-primary">
                      {primaryRole}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
