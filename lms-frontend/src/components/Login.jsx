import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getAccessToken, setAccessToken, setCurrentUser } from "../utils/auth";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAccessToken()) {
      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
    }
  }, [location.state, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      const data = response.data;

      /*
       * User Service returns the JWT together with
       * the authenticated user's information.
       */
      const token = data.token || data.accessToken || data.jwt;

      if (!token) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      setAccessToken(token);

      if (data.user) {
        setCurrentUser(data.user);
      } else {
        /*
         * Store the user information when it is returned
         * directly in the login response.
         */
        setCurrentUser({
          id: data.id || data.userId,
          username: data.username,
          email: data.email,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      const destination = location.state?.from || "/";

      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);

      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-176px)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 shadow-sm sm:p-10">
          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white shadow-md">
              L
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary">
              Welcome Back
            </p>

            <h1 className="mt-2 text-3xl font-bold text-dark">Sign In</h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Sign in securely to continue learning, manage your courses, and
              access your LMS account.
            </p>
          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* =====================================================
              LOGIN FORM
          ====================================================== */}

          <form onSubmit={handleLogin} className="mt-8">
            {/* Username */}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-dark"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loading}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100"
              />
            </div>

            {/* Password */}

            <div className="mt-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-dark"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100"
              />
            </div>

            {/* Login button */}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* =====================================================
              REGISTER
          ====================================================== */}

          <div className="mt-6 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create Account
            </Link>
          </div>

          {/* =====================================================
              SECURITY NOTE
          ====================================================== */}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">
                ✓
              </div>

              <div>
                <p className="text-xs font-semibold text-dark">
                  Secure authentication
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Your password is securely processed by the LMS authentication
                  service and is never stored in your browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
