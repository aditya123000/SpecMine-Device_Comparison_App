import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/useAuth";

const AUTH_TOAST_STORAGE_KEY = "auth_toast";

const formCopy = {
  login: {
    title: "Login",
    description: "Sign in to continue.",
    button: "Login",
    alternateText: "Need an account?",
    alternateLink: "/register",
    alternateLabel: "Register",
  },
  register: {
    title: "Create your account",
    description: "Register to save your place and make device comparisons feel more personal.",
    button: "Register",
    alternateText: "Already have an account?",
    alternateLink: "/login",
    alternateLabel: "Login",
  },
};

const registerBenefits = [
  "Save your account details for future visits.",
  "Move through device search and comparison with a more personal experience.",
  "Access your account quickly without creating it again later.",
];

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = formCopy[mode];
  const redirectTo = location.state?.from?.pathname ?? "/";
  const isRegisterPage = mode === "register";

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register(formData);
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          AUTH_TOAST_STORAGE_KEY,
          JSON.stringify({
            type: "login",
            message: `Logged in as ${formData.name || formData.email || "your account"}.`,
            expiresAt: Date.now() + 2500,
          }),
        );
      }

      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`mx-auto grid gap-8 ${isRegisterPage ? "max-w-5xl lg:grid-cols-[1fr_1.1fr]" : "max-w-xl"}`}>
      {isRegisterPage ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/40">
          <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-slate-100">{copy.title}</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">{copy.description}</p>
          <div className="mt-10 space-y-4">
            {registerBenefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{copy.button}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{copy.description}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {copy.alternateText}{" "}
              <Link
                className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-300"
                to={copy.alternateLink}
              >
                {copy.alternateLabel}
              </Link>
            </p>
          </div>

          {mode === "register" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-sky-400 dark:border-slate-600">
                <FiUser className="text-slate-400" />
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="auth-input w-full bg-transparent outline-none"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-sky-400 dark:border-slate-600">
              <FiMail className="text-slate-400" />
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="auth-input w-full bg-transparent outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-sky-400 dark:border-slate-600">
              <FiLock className="text-slate-400" />
              <input
                required
                minLength={6}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="auth-input w-full bg-transparent outline-none"
              />
            </div>
          </label>

          {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Please wait..." : copy.button}
            <FiArrowRight />
          </button>
        </form>
      </div>
    </section>
  );
};

export default AuthPage;
