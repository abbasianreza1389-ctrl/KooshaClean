const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

function getToken() {
  const m = document.cookie.match(/(?:^| )token=([^;]+)/);
  return m ? m[1] : "";
}

export async function login(username: string, password: string) {
  const r = await fetch(`${base}/api/token/`, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) return false;
  const data = await r.json();
  document.cookie = `token=${data.access}; path=/; SameSite=Lax`;
  return true;
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = { ...(init.headers||{}), Authorization: token ? `Bearer ${token}` : "" };
  const r = await fetch(`${base}${path}`, { ...init, headers });
  if (r.status === 401) location.href = "/login";
  return r;
}

// ---- Patients
export const getPatients = async (q="") =>
  authFetch(`/api/patients/?q=${encodeURIComponent(q)}`).then(r=>r.json());
export const createPatient = async (data:any) =>
  authFetch(`/api/patients/`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(data) }).then(r=>r.json());

// ---- Calendar / Appointments
export const getAppointmentsByDay = async (date:string, doctor?:number) =>
  authFetch(`/api/appointments/by_day/?date=${date}${doctor?`&doctor=${doctor}`:""}`).then(r=>r.json());

// ---- Billing
export const getBillingEntries = async (from?:string, to?:string) =>
  authFetch(`/api/billing/entries/${from||to?`?${new URLSearchParams({from:from||"",to:to||""}).toString()}`:""}`).then(r=>r.json());

// ---- Reports
export const getSummary = async () =>
  authFetch(`/api/reports/summary/`).then(r=>r.json());
