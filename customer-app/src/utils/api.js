// =============================================================================
// Central API Configuration � Customer App
// Change ONLY API_BASE to point to a different backend server
// =============================================================================
export const API_BASE = ""; // DEV: Vite proxy handles routing. PROD: set full URL here

// --- Auth Header Helpers ---
export const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("customer_token")}`,
});

export const authHeaderOnly = () => ({
  Authorization: `Bearer ${localStorage.getItem("customer_token")}`,
});

// --- All API Endpoints (one place) ---
export const ENDPOINTS = {
  // Auth
  SEND_OTP:          `${API_BASE}/auth/customer/send-otp`,
  VERIFY_OTP:        `${API_BASE}/auth/customer/verify-otp`,
  CUSTOMER_PROFILE:  `${API_BASE}/customer/profile`,

  // Products
  PRODUCTS_LIST:     `${API_BASE}/products/customer/list`,
  PRODUCT_DETAIL:    (id) => `${API_BASE}/products/customer/${id}`,

  // Orders
  ORDERS_LIST:       `${API_BASE}/orders/customer/v1`,
  ORDER_DETAIL:      (id) => `${API_BASE}/orders/customer/v1/${id}`,
  CREATE_ORDER:      `${API_BASE}/orders/customer/v1`,

  // Payments / Statement
  PAYMENT_STATEMENT: `${API_BASE}/accounting/customer/statement`,
};

// --- Generic Fetch Wrapper ---
// Usage: const { data, ok, error } = await apiFetch(ENDPOINTS.ORDERS_LIST);
// Usage: const { data, ok, error } = await apiFetch(ENDPOINTS.CREATE_ORDER, { method: 'POST', body: JSON.stringify(payload) });
export const apiFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("customer_token")}`,
        ...options.headers,
      },
      ...options,
    });
    let data = null;
    try { data = await res.json(); } catch (_) {}
    return {
      data,
      ok: res.ok,
      status: res.status,
      error: res.ok ? null : (data?.message || data?.detail || "Request failed"),
    };
  } catch (err) {
    return { data: null, ok: false, status: 0, error: "Network error. Check your connection." };
  }
};

