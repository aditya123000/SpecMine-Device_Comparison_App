import { useEffect, useState } from "react";
import { FiUser, FiMail, FiLock, FiCheck, FiAlertCircle } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: "/profile" }} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
    setProfileError("");
    setProfileSuccess("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setIsSubmitting(true);

    try {
      await updateProfile(profileForm);
      setProfileSuccess("Profile updated successfully");
    } catch (error) {
      setProfileError(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage your account information and security settings.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex -mb-px px-4 pt-3 gap-2" aria-label="Profile tabs">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition ${
                activeTab === "profile"
                  ? "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
              }`}
            >
              <FiUser className="text-base" />
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition ${
                activeTab === "password"
                  ? "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
              }`}
            >
              <FiLock className="text-base" />
              Password
            </button>
          </nav>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 focus-within:border-sky-400 focus-within:bg-white dark:border-slate-600 dark:bg-slate-900/50 dark:focus-within:bg-slate-900">
                    <FiUser className="text-slate-400 text-lg" />
                    <input
                      required
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Your name"
                      className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 focus-within:border-sky-400 focus-within:bg-white dark:border-slate-600 dark:bg-slate-900/50 dark:focus-within:bg-slate-900">
                    <FiMail className="text-slate-400 text-lg" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </label>
              </div>

              {profileError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                  <FiAlertCircle className="shrink-0 text-base" />
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <FiCheck className="shrink-0 text-base" />
                  {profileSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
                <FiCheck />
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 focus-within:border-sky-400 focus-within:bg-white dark:border-slate-600 dark:bg-slate-900/50 dark:focus-within:bg-slate-900">
                    <FiLock className="text-slate-400 text-lg" />
                    <input
                      required
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 focus-within:border-sky-400 focus-within:bg-white dark:border-slate-600 dark:bg-slate-900/50 dark:focus-within:bg-slate-900">
                    <FiLock className="text-slate-400 text-lg" />
                    <input
                      required
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 focus-within:border-sky-400 focus-within:bg-white dark:border-slate-600 dark:bg-slate-900/50 dark:focus-within:bg-slate-900">
                    <FiLock className="text-slate-400 text-lg" />
                    <input
                      required
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </label>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                  <FiAlertCircle className="shrink-0 text-base" />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <FiCheck className="shrink-0 text-base" />
                  {passwordSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Changing..." : "Change Password"}
                <FiCheck />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;