import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getUserRoles, isAuthenticated } from "../utils/auth";

function Profile() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // GET PRIMARY ROLE
  // =========================================================

  const getPrimaryRole = () => {
    const roles = getUserRoles();

    if (roles.includes("ADMIN")) {
      return "ADMIN";
    }

    if (roles.includes("INSTRUCTOR")) {
      return "INSTRUCTOR";
    }

    if (roles.includes("STUDENT")) {
      return "STUDENT";
    }

    return "USER";
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/me");

        const user = response.data;

        setProfile(user);

        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);

        if (err.response?.status === 401) {
          setError("Your login session is invalid or expired.");
        } else {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear previous messages while editing.
    setError("");
    setSuccessMessage("");
  };

  // =========================================================
  // HANDLE SAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    // ---------------------------------------------------------
    // Frontend validation
    // ---------------------------------------------------------

    if (formData.firstName.length > 50) {
      setError("First name cannot exceed 50 characters.");
      return;
    }

    if (formData.lastName.length > 50) {
      setError("Last name cannot exceed 50 characters.");
      return;
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/users/me", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });

      setProfile(response.data);

      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phone: response.data.phone || "",
      });

      setSuccessMessage("Your profile has been updated successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Please check the information you entered.",
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid or expired.");
      } else {
        setError("Unable to update your profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phone: profile.phone || "",
    });

    setError("");
    setSuccessMessage("");
  };

  // =========================================================
  // AVATAR INITIAL
  // =========================================================

  const getAvatarInitial = () => {
    if (profile?.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    }

    if (profile?.username) {
      return profile.username.charAt(0).toUpperCase();
    }

    return "U";
  };

  // =========================================================
  // DISPLAY NAME
  // =========================================================

  const getDisplayName = () => {
    const fullName = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(" ");

    return fullName || profile?.username || "User";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-muted">Loading your profile...</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR WITHOUT PROFILE
  // =========================================================

  if (error && !profile) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-secondary px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const primaryRole = getPrimaryRole();

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="min-h-[calc(100vh-80px)] bg-secondary px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-dark">My Profile</h1>

          <p className="mt-2 text-sm text-muted">
            Manage your personal information and account details.
          </p>
        </div>

        {/* =====================================================
            PROFILE HEADER CARD
        ====================================================== */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white shadow-md">
              {getAvatarInitial()}
            </div>

            {/* User information */}

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-dark">
                {getDisplayName()}
              </h2>

              <p className="mt-1 text-sm text-muted">{profile?.email}</p>

              <div className="mt-3">
                <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold tracking-wider text-primary">
                  {primaryRole}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Personal Information
            </p>

            <h2 className="mt-1 text-xl font-bold text-dark">
              Update your details
            </h2>

            <p className="mt-2 text-sm text-muted">
              Keep your personal information up to date.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Error */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Success */}

            {successMessage && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-700">
                  {successMessage}
                </p>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {/* First Name */}

              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="Enter your first name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Last Name */}

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="Enter your last name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Phone */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-dark"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:max-w-md"
                />

                <p className="mt-2 text-xs text-muted">
                  Enter exactly 10 digits.
                </p>
              </div>
            </div>

            {/* Buttons */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* =====================================================
            ACCOUNT INFORMATION
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Account Information
          </p>

          <h2 className="mt-1 text-xl font-bold text-dark">Account details</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Username */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Username
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-dark">
                {profile?.username || "—"}
              </p>
            </div>

            {/* Email */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-dark">
                {profile?.email || "—"}
              </p>
            </div>

            {/* Role */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Role
              </p>

              <p className="mt-2 text-sm font-semibold text-primary">
                {primaryRole}
              </p>
            </div>

            {/* Account ID */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Account ID
              </p>

              <p className="mt-2 break-all text-xs font-medium text-muted">
                {profile?.id || "—"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;
