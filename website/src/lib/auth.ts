let tokenKey = "koosha_token";
let roleKey  = "koosha_role"; // manager|accountant|reception|doctor
export function setAuth(token:string, role:string){ localStorage.setItem(tokenKey, token); localStorage.setItem(roleKey, role); }
export function clearAuth(){ localStorage.removeItem(tokenKey); localStorage.removeItem(roleKey); }
export function getToken(){ return typeof window==="undefined" ? "" : (localStorage.getItem(tokenKey)||""); }
export function getRole(){ return typeof window==="undefined" ? "" : (localStorage.getItem(roleKey)||""); }
