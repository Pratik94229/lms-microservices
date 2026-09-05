import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import keycloak from "../keycloak";

function Login() {
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the user is already authenticated,
    // there is no need to show the login page.
    if (keycloak.authenticated) {
      const destination = location.state?.from || "/";

      window.location.replace(destination);
    }
  }, [location.state]);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Get the page the user originally wanted to visit.
      const destination = location.state?.from || "/";

      // Build the redirect URL.
      const redirectUri = `${window.location.origin}${destination}`;

      // Open the Keycloak browser login page.
      await keycloak.login({
        redirectUri,
      });
    } catch (error) {
      console.error("Keycloak login failed:", error);

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
            {/* LMS logo */}

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
              LOGIN ACTION
          ====================================================== */}

          <div className="mt-8">
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Opening Secure Login..." : "Continue to Login"}
            </button>

            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-center text-xs leading-5 text-muted">
                You will be redirected to our secure authentication service to
                enter your login credentials.
              </p>
            </div>
          </div>

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
                  Your credentials are handled by Keycloak and are never sent
                  directly through the LMS application.
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
