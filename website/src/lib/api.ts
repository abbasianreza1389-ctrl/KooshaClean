export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
export async function getJSON(path: string){
  const r = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if(!r.ok) throw new Error('API error');
  return r.json();
}
