import { getApiUrl } from "./apiBase.js";

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "Authentication request failed");
  }

  return data;
};

const createAuthRequest = async (path, body, token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const method = body ? (path === "/register" || path === "/login" ? "POST" : "PUT") : "GET";

  const response = await fetch(getApiUrl(`/api/auth${path}`), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseJsonResponse(response);
};

const registerUser = (payload) => createAuthRequest("/register", payload);
const loginUser = (payload) => createAuthRequest("/login", payload);
const getCurrentUser = (token) => createAuthRequest("/me", null, token);
const updateProfile = (payload, token) => createAuthRequest("/profile", payload, token);
const changePassword = (payload, token) => createAuthRequest("/password", payload, token);

export { getCurrentUser, loginUser, registerUser, updateProfile, changePassword };
