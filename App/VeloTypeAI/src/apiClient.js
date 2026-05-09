const BASE_URL = import.meta.env.VITE_API_URL || "https://velotype-2-jn34.onrender.com/api/v1"
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
    const error = await res.json().catch(() => ({}));
    const detail = error?.detail;
    const msg = Array.isArray(detail)
      ? detail.map(d => d.msg || JSON.stringify(d)).join(' | ')
      : (typeof detail === 'string' ? detail : `HTTP ${res.status}`);
    throw new Error(msg || 'Something went wrong');
  }

  return res.json();
};

export default apiClient;