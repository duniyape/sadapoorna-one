# 🚀 Sadapoorna — MERN Developer Interview Preparation Guide

> **"What I personally built, why I chose it, and the hard problems I solved"**

---

## 🏗️ 1. What Is Sadapoorna?

**Sadapoorna** is a full-stack **B2B Business Management ERP platform** I built for a real-world client. It has **two separate frontend apps**:

| App | Purpose | Tech |
|-----|---------|------|
| **Admin Dashboard** (`sadapoorna-one/`) | Internal staff panel for managing orders, inventory, finance, HR | React 19 + Vite + Tailwind v4 |
| **Customer App** (`customer-app/`) | Customer-facing portal for viewing orders, profile, Khata | React 19 + Vite + Tailwind |

The backend is a **Python FastAPI** REST API (not in this repo — deployed separately).

---

## 🔐 2. Authentication Flow — How It Works

### Architecture
```
User types email/password
    ↓
POST /auth/login  (fetch API, no Axios)
    ↓
Backend validates → returns { access_token: "jwt..." }
    ↓
localStorage.setItem('token', access_token)
    ↓
Every protected page → ProtectedRoute checks localStorage for token
    ↓
DashboardLayout → on mount → GET /auth/profile  (Bearer token in header)
    ↓
User object stored in React state → passed down via Outlet context
    ↓
If 401 → localStorage cleared → redirect to /login
```

### Key Code — LoginPage.jsx
```js
const res = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ login: email, password })
});
if (data.access_token) localStorage.setItem('token', data.access_token);
```

### Key Code — ProtectedRoute (App.jsx)
```js
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};
```

### Why JWT + localStorage?
- **Simple stateless auth** — no session management on server
- **Works perfectly** for SPA with React Router
- Token sent as `Authorization: Bearer <token>` on every API call
- **Tradeoff I accepted**: not using HttpOnly cookies, but localStorage is simpler for internal B2B tool where XSS risk is managed

---

## 🗄️ 3. Database Structure (What I Inferred from APIs)

The backend uses **MongoDB** (NoSQL) — I can tell from:
- API endpoints like `/masters/v1/Designation`, `/masters/v1/ProductUnit`
- Response shapes: `data.data`, `data.masters`, `data.user` — flexible document structure
- No strict relational joins — collections are referenced by `_id`

### Key Collections (Inferred from Frontend)

| Collection | Key Fields | Purpose |
|------------|-----------|---------|
| `users` | `_id`, `name`, `email`, `designation`, `access` | Staff users |
| `designations` | `_id`, `name`, `frontend_icons[]` | Roles + permissions |
| `customers` | `_id`, `name`, `phone`, `address`, `gstin`, `assigned_to` | Customer master |
| `orders` | `_id`, `customer_id`, `items[]`, `status`, `total`, `branch` | Sales orders |
| `products` | `_id`, `name`, `sku`, `unit`, `packing_types[]`, `batches[]` | Product catalog |
| `inventory` | `batch_no`, `warehouse_id`, `vehicle_id`, `qty` | Stock tracking |
| `vehicles` | `_id`, `number`, `driver`, `capacity` | Fleet |
| `warehouses` | `_id`, `name`, `location`, `capacity` | Storage |
| `vouchers` | `_id`, `type`, `amount`, `ledger_id`, `date` | Accounting |
| `cheques` | `_id`, `status`, `amount`, `customer_id`, `bank` | Cheque lifecycle |

### Why MongoDB?
- **Flexible schema** — orders have different item structures per product type
- **Document embedding** — order items embedded in order document = fast reads
- **Scales horizontally** — important for growing business data
- **No complex joins needed** — relationships handled at application level

---

## 🌐 4. API Flow — How Data Moves

### Pattern Used Everywhere (No Axios — Vanilla Fetch)
```js
// Standard pattern used across 60+ pages
const token = localStorage.getItem('token');
const res = await fetch('/masters/v1/Designation', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await res.json();
const items = Array.isArray(data) ? data : (data.data || data.masters || []);
```

### Why Vanilla `fetch` Instead of Axios?
- **No extra dependency** — keeps bundle small
- **Built into browser** — no import needed
- **Enough for this use case** — no interceptors needed since auth is simple
- **Tradeoff**: Had to write error handling manually every time

### Vite Proxy Setup
```js
// All /auth/* and /masters/* proxied to backend server
// Avoids CORS issues in development
server: {
  proxy: {
    '/auth': 'http://backend-server',
    '/masters': 'http://backend-server'
  }
}
```

### API Endpoint Patterns
| Prefix | Purpose |
|--------|---------|
| `/auth/login` | Authentication |
| `/auth/profile` | Get logged-in user |
| `/masters/v1/{Model}` | CRUD for master data |
| `/orders/v1/...` | Orders management |
| `/inventory/v1/...` | Stock operations |

---

## 🛡️ 5. RBAC — Role-Based Access Control System

This was a **complex system I designed from scratch**.

### How It Works
```
Backend stores: designation.frontend_icons = ['orders', 'customers', 'users', ...]
                                 ↓
Frontend fetches user profile on login
                                 ↓
usePermissions(user) hook checks if module ID is in allowedIcons[]
                                 ↓
Sidebar only renders modules the user has access to
Dashboard only shows cards the user can access
```

### Key Code — permissions.js
```js
export function usePermissions(user) {
  const allowedIcons = user?.access?.frontend_icons ||
                       user?.designation?.frontend_icons || [];

  const isAllowed = (item) => {
    if (!user) return false;
    if (ALWAYS_ALLOWED_IDS.has(item.id)) return true;
    return allowedIcons.some((iconData) => {
      if (typeof iconData === 'string') return iconData === item.id;
      if (typeof iconData === 'object') return iconData.icon === item.id;
      return false;
    });
  };
  return { isAllowed };
}
```

### Why I Designed It This Way
- **Single source of truth** — `MASTER_MODULES` in `constants.js` defines ALL 40+ modules
- **Backend-driven permissions** — no hardcoded roles in frontend
- **Flexible** — icons can be string OR object (supports future sub-permissions)
- **Accessibility Page** — admin can toggle ON/OFF each module per designation in real-time

---

## ⚡ 6. Performance Optimization — Code Splitting

### Problem
With **60+ pages**, loading everything at once = huge initial bundle = slow first load.

### Solution: React.lazy() + Suspense
```js
// Every page is lazy loaded — Vite auto splits into separate chunks
const OrdersPage = React.lazy(() => import("./pages/OrdersPage"));
const CustomersDirectoryPage = React.lazy(() => import("./pages/CustomersDirectoryPage"));
// ... 58 more pages

// Only LoginPage + DashboardLayout are eager (critical path)
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
```

### Result
- **Initial bundle = tiny** — only login + layout loads
- **Each page loads on demand** — user never waits for code they don't visit
- **Suspense fallback** — spinner shown while page chunk downloads

---

## 🧩 7. Architecture Pattern — Outlet Context (Prop Drilling Solved)

### Problem
`showToast`, `user`, `searchQuery` needed by ALL 60+ pages — passing as props = nightmare.

### Solution: React Router Outlet Context
```js
// DashboardLayout.jsx — produces shared state
<Outlet context={{ showToast, searchQuery, user }} />

// Any child page — consumes without prop drilling
const { showToast, user } = useOutletContext();
showToast("Order created successfully!");
```

### Why Not Redux/Zustand?
- **Overkill for this pattern** — state is layout-scoped, not truly global
- **Outlet context is built-in** — zero dependency
- **Simpler mental model** — data flows down naturally from Layout to Page

---

## 🤖 8. AI Integration — Gemini API

Built a full **AI Suite** with 4 Google Gemini APIs:

| Feature | API Used | Purpose |
|--------|---------|---------|
| Text Q&A | `gemini-3-flash-preview` | Business insights chat |
| Web Search | `gemini + google_search tool` | Grounded market analysis |
| Image Gen | `imagen-4.0-generate-001` | Product banner creation |
| Text-to-Speech | `gemini-2.5-flash-preview-tts` | Voice narration |

### Hard Problem: TTS Audio Handling
```js
// Gemini TTS returns raw PCM16 binary data — NOT a playable file
// Had to manually encode PCM → WAV for browser playback
export function pcmToWav(pcmData, sampleRate = 24000) {
  // Build WAV header manually (44 bytes)
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  // ... manual binary manipulation byte by byte
  return new Blob([buffer], { type: 'audio/wav' });
}
```
**Why tricky?** I had to write a WAV header encoder from scratch using the DataView binary API — building the 44-byte RIFF header manually.

### Retry with Exponential Backoff
```js
export async function apiFetchWithBackoff(url, options) {
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (e) { if (i === 2) throw e; }
    await new Promise(res => setTimeout(res, delay));
    delay *= 2; // 1s → 2s → 4s
  }
}
```
**Why?** — Gemini API has rate limits. Backoff prevents cascading failures.

---

## 😓 9. Difficult Problems I Solved

### Problem 1: Dual App Architecture in One Repo
**Challenge**: Admin panel + Customer portal — separate builds, different routes, shared design system.

**Solution**: Two separate Vite apps in one monorepo. Each has its own `package.json`, `vite.config.js`, `index.html`. Shared styling philosophy but independent deployments.

---

### Problem 2: Order Pipeline — Complex Status Machine
**Challenge**: Orders have 6+ statuses (Draft → Confirmed → Packed → Dispatched → Delivered → Returned). Each status needs different UI, different API calls, different permissions.

**Solution**: Built a `SwipeButton` component — drag-to-confirm prevents accidental status changes. Status-driven rendering shows different action buttons per stage.

```js
// Swipe > 85% threshold to confirm action (prevents accidents)
if (sliderValue > 85) {
  setSliderValue(100);
  setIsSuccess(true);
  onConfirm(); // fires API call
}
```

---

### Problem 3: Customer 360° Profile — Nested Routes
**Challenge**: Customer profile has 4 tabs — each tab is a separate page with its own data fetching, but they share the customer header.

**Solution**: Nested React Router layout:
```jsx
<Route path="view-customer/:id" element={<CustomerProfileLayout />}>
  <Route index element={<CustomerProfileTab />} />
  <Route path="orders" element={<CustomerOrdersTab />} />
  <Route path="statement" element={<CustomerStatementTab />} />
  <Route path="khata" element={<CustomerKhataTab />} />
</Route>
```
CustomerProfileContext passes `customer` data to all tabs without re-fetching.

---

### Problem 4: Inventory Flow — Batch Tracking
**Challenge**: Same product can exist in 3 places simultaneously (Main Inventory → Warehouse → Vehicle). Need to track quantity at every stage.

**Solution**: Designed a batch-based tracking system:
- `batch_no` is the key identifier across all stages
- Pages: `BatchStockPage` → `WarehouseInventoryPage` → `VehicleAllocationsPage` → `BulkDispatchPage`
- `BatchTimelinePage` shows the full journey of a batch

---

### Problem 5: Inconsistent API Response Shapes
**Challenge**: The same API sometimes returns `data` as array directly, sometimes as `{ data: [] }`, sometimes as `{ masters: [] }`.

**Solution**: Defensive normalization pattern used everywhere:
```js
const items = Array.isArray(data) ? data : (data.data || data.masters || []);
```

---

## 🛠️ 10. Technology Choices — Why?

| Technology | Why I Chose It |
|-----------|---------------|
| **React 19** | Latest stable — concurrent features, improved Suspense |
| **Vite 8** | 10x faster than CRA — instant HMR, native ESM |
| **Tailwind CSS v4** | Utility-first = fast UI iteration, no custom CSS conflicts |
| **React Router v7** | Nested layouts, Outlet context, file-based thinking |
| **Lucide React** | Consistent icon set, tree-shakeable (only imports icons used) |
| **React Leaflet** | Beat management needs real maps — Leaflet is open source, no API key cost |
| **Vanilla fetch** | No Axios bloat — fetch is native, sufficient for this use case |
| **No Redux** | Outlet context + local state is enough — avoiding over-engineering |
| **oxlint** | Rust-based linter — 50-100x faster than ESLint |

---

## 📦 11. Project Scale — Numbers That Impress

| Metric | Count |
|--------|-------|
| Total Pages | **63 pages** |
| Total Modules | **40+ modules** |
| API Integrations | **6+ API endpoint groups** |
| AI APIs Used | **4 Google Gemini APIs** |
| Route Definitions | **50+ routes** |
| Components | **15+ reusable components** |
| Sidebar Groups | **6 navigation groups** |

---

## 🎯 12. Interview Talking Points — Speak Confidently

### "Tell me about your architecture decisions"
> "I built a dual-app monorepo — admin panel and customer portal are separate Vite builds sharing design philosophy but independently deployed. The admin has 63 pages all lazy-loaded for performance, while a ProtectedRoute + JWT auth pattern secures every route."

### "How did you handle authentication?"
> "JWT-based auth — user logs in via POST /auth/login, token stored in localStorage, sent as Bearer on every request. DashboardLayout fetches /auth/profile on mount to hydrate the user object, which is then passed to all 60+ pages via React Router's Outlet context."

### "What's the hardest problem you solved?"
> "The PCM-to-WAV audio converter for Gemini TTS — the API returns raw 16-bit PCM binary data, not a playable file. I hand-wrote a WAV header encoder using DataView API, building the 44-byte RIFF header byte by byte, then converting it to a Blob URL for the audio element."

### "How did you handle role-based access?"
> "Backend stores frontend_icons[] array in each designation. My usePermissions() hook checks if a module's ID exists in that array. The Sidebar and Dashboard only render modules the user can access. Admin can toggle permissions per designation in real-time through the Accessibility page."

### "Why React and not Next.js?"
> "This is an internal B2B tool — SEO is irrelevant, SSR is unnecessary. React + Vite gives the fastest developer experience and the client-only SPA fits perfectly. Next.js would add complexity with no benefit here."

### "Why no state management library?"
> "I used React Router's Outlet context to pass shared state (user, showToast, searchQuery) from DashboardLayout to all child pages. This is layout-scoped state — Redux would be overkill and add unnecessary boilerplate."

---

## 🚀 How to Run the Project

```bash
# Admin Panel
cd sadapoorna-one
npm install
npm run dev   # runs on http://localhost:5173

# Customer App
cd sadapoorna-one/customer-app
npm install
npm run dev   # runs on http://localhost:5174
```

---

> **Built with love for Sadapoorna — A real production ERP serving real businesses.**
