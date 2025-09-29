const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function j(path: string, opts?: RequestInit) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    try { return await res.json(); } catch { return {}; }
  } catch (e: any) {
    console.warn("API error:", e?.message || e);
    return { _error: true, message: String(e?.message || e) };
  }
}

export const AdminApi = {
  // KPI و ظرفیت
  kpis: () => j("/api/admin/kpis/"),
  capacity: () => j("/api/admin/capacity/"),
  // درخواست‌های رزرو عمومی (منشی)
  pendingRequests: () => j("/api/admin/booking-requests/"),
  approveRequest: (id: number | string, action: "approve" | "reject") =>
    j(`/api/admin/booking-requests/${id}/${action}/`, { method: "POST" }),
  // قوانین دسترس‌پذیری
  rulesList: () => j("/api/admin/availability/rules/"),
  ruleCreate: (payload: any) =>
    j("/api/admin/availability/rules/", { method: "POST", body: JSON.stringify(payload) }),
  exceptionsList: () => j("/api/admin/availability/exceptions/"),
  // حسابداری/تسویه
  closePeriod: (payload: any) =>
    j("/api/billing/close-period/", { method: "POST", body: JSON.stringify(payload) }),
  settlements: () => j("/api/billing/settlements/"),
  // گزارش/لاگ
  logs: () => j("/api/admin/logs/"),
  exportUrl: (kind: "csv" | "xlsx" | "pdf", qs = "") => `${BASE}/api/admin/export/${kind}/${qs}`,
};

// دادهٔ نمونه برای مواقعی که API آماده نیست:
export const AdminMock = {
  kpis: {
    revenue_month: 480_000_000, sessions_done: 1240, occupancy: 78, new_patients: 210,
    top_services: [{ title: "فیزیوتراپی", count: 430 }, { title: "ویزیت عمومی", count: 360 }, { title: "آزمایش‌ها", count: 210 }],
    trend: [12,14,15,13,18,21,20,24,22,25,27,30],
  },
  pendingRequests: [
    { id: 101, name: "نرگس ش.", phone: "09120000001", service: "فیزیوتراپی", slot: "فردا عصر", note: "" },
    { id: 102, name: "مهدی ر.", phone: "09120000002", service: "ویزیت عمومی", slot: "اولین زمان", note: "درد شانه" },
  ],
  rules: [
    { id: 1, dept: "توانبخشی", provider: "دکتر پ", weekday: "شنبه-چهارشنبه", start: "09:00", end: "14:00", slot: 30, max_concurrent: 2 },
  ],
  settlements: [
    { id: 1, provider: "دکتر الف", period: "1404-06", gross: 120_000_000, clinic_share: 30_000_000, provider_share: 90_000_000, status: "Open" },
  ],
  logs: [
    { id: 1, ts: "1404/06/28 09:12", user: "reception1", action: "APPROVE_REQUEST", message: "id=101" },
    { id: 2, ts: "1404/06/28 10:02", user: "manager", action: "CLOSE_PERIOD", message: "1404-05" },
  ],
};
