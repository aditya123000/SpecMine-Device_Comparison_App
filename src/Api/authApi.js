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

  const response = await fetch(`/api/auth${path}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseJsonResponse(response);
};

const registerUser = (payload) => createAuthRequest("/register", payload);
const loginUser = (payload) => createAuthRequest("/login", payload);
const getCurrentUser = (token) => createAuthRequest("/me", null, token);

export { getCurrentUser, loginUser, registerUser };
