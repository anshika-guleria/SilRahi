const API_URL = import.meta.env.VITE_API_URL || "https://silrahi.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("silrahi_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  firebaseLogin: (payload) => request("/auth/firebase", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  tailors: (query = "") => request(`/tailors${query}`),
  tailor: (id) => request(`/tailors/${id}`),
  myTailorProfile: () => request("/tailors/me"),
  updateTailor: (payload) => request("/tailors/me", { method: "PUT", body: JSON.stringify(payload) }),
  uploadPhoto: (formData) => request("/tailors/me/photo", { method: "POST", body: formData }),
  uploadWorkSample: (formData) => request("/tailors/me/work-samples", { method: "POST", body: formData }),
  customerProfile: () => request("/customers/me"),
  customerDashboard: () => request("/customers/me/dashboard"),
  tailorDashboard: () => request("/tailors/me/dashboard"),
  updateCustomer: (payload) => request("/customers/me", { method: "PUT", body: JSON.stringify(payload) }),
  bookings: () => request("/bookings"),
  createBooking: (payload) =>
    request("/bookings", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload)
    }),
  updateBookingStatus: (id, status, extra = {}) =>
    request(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, ...extra }) }),
  markBookingPaid: (id, payload) =>
    request(`/bookings/${id}/payment`, { method: "PATCH", body: JSON.stringify(payload) }),
  createReview: (payload) => request("/reviews", { method: "POST", body: JSON.stringify(payload) }),
  reviews: (tailorId) => request(`/reviews/tailor/${tailorId}`),
  messages: (bookingId) => request(`/messages/${bookingId}`),
  sendMessage: (bookingId, text) => request(`/messages/${bookingId}`, { method: "POST", body: JSON.stringify({ text }) }),
  adminUsers: () => request("/admin/users"),
  adminTailors: () => request("/admin/tailors"),
  adminBookings: () => request("/admin/bookings"),
  verifyTailor: (id, verified) =>
    request(`/admin/tailors/${id}/verify`, { method: "PATCH", body: JSON.stringify({ verified }) }),
  removeUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" })
};
