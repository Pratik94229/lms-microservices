import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  getCurrentUser,
  getUserRole,
  isAuthenticated,
  logout,
} from "../utils/auth";

function Navbar() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [role, setRole] = useState(getUserRole());

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthenticated(isAuthenticated());
      setRole(getUserRole());
    };

    window.addEventListener("storage", handleAuthChange);

    const interval = setInterval(() => {
      setAuthenticated(isAuthenticated());
      setRole(getUserRole());
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const currentUser = getCurrentUser();

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  const getPrimaryRole = () => {
    if (role === "ADMIN") {
      return "ADMIN";
    }

    if (role === "INSTRUCTOR") {
      return "INSTRUCTOR";
    }

    if (role === "STUDENT") {
      return "STUDENT";
    }

    return null;
  };

  const primaryRole = getPrimaryRole();

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

          {authenticated && primaryRole === "STUDENT" && (
            <NavLink to="/my-learning" className={navLinkClass}>
              My Learning
            </NavLink>
          )}

          {authenticated && primaryRole === "INSTRUCTOR" && (
            <NavLink to="/instructor" className={navLinkClass}>
              Instructor
            </NavLink>
          )}

          {authenticated && primaryRole === "ADMIN" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}

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
              {primaryRole && (
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm" />

                  <span className="text-xs font-bold tracking-wider text-primary">
                    {primaryRole}
                  </span>
                </div>
              )}

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
              <Link
                to="/login"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 hover:text-primary"
              >
                Login
              </Link>

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
