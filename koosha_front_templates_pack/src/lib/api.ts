import axios from "axios";
const base = process.env.NEXT_PUBLIC_API || "http://localhost:8000";
const api = axios.create({ baseURL: base });
api.interceptors.request.use(cfg => {
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("access_token");
    if (t) cfg.headers = { ...(cfg.headers||{}), Authorization: `Bearer ${t}` };
  }
  return cfg;
});
export default api;
