const BASE_URL = "http://localhost:8000/api/v1"
const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include", // needed for httpOnly refresh token cookie
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Something went wrong");
  }

  return res.json();
};

export default apiClient;