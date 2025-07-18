const BASE_URL = 'http://localhost:5000/api';

async function request(path, method = 'GET', data) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data) config.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, config);
  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'API error');
  return result;
}

export async function registerUser(data) {
  return await request('/auth/register', 'POST', data);
}

export async function loginUser(data) {
  return await request('/auth/login', 'POST', data);
}
