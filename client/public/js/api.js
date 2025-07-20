const BASE = 'http://localhost:5000/api';

async function request(path, method='GET', data=null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['x-auth-token'] = token;
  const opts = { method, headers };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(BASE + path, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || res.statusText);
  return json;
}

export const registerUser  = d => request('/auth/register','POST',d);
export const loginUser     = d => request('/auth/login','POST',d);
export const listChannels  = ()  => request('/channels');
export const getChannel    = id => request(`/channels/${id}`);
export const createChannel = d => request('/channels','POST',d);
export const joinChannel   = id => request(`/channels/${id}/join`,'POST');
export const addVideo      = (id, d) => request(`/channels/${id}/videos`, 'POST', d);
export const deleteVideo   = (id, vidId) => request(`/channels/${id}/videos/${vidId}`, 'DELETE');

export function getCurrentUser() {
  const t = localStorage.getItem('token');
  if (!t) return null;
  try { return JSON.parse(atob(t.split('.')[1])); }
  catch { return null; }
}
