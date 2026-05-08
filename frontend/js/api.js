// Cliente HTTP del frontend. Ajusta API_URL si tu backend corre en otro host.
const API_URL = window.API_URL_OVERRIDE || '/api';

function getToken() { return localStorage.getItem('pq_token'); }
function setSession(token, usuario) {
  localStorage.setItem('pq_token', token);
  localStorage.setItem('pq_user', JSON.stringify(usuario));
}
function getUser() {
  try { return JSON.parse(localStorage.getItem('pq_user') || 'null'); } catch { return null; }
}
function logout() {
  localStorage.removeItem('pq_token');
  localStorage.removeItem('pq_user');
  window.location.href = '../index.html';
}

async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(API_URL + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

function requireAuth(rolRequerido) {
  const u = getUser();
  if (!getToken() || !u) { window.location.href = '../index.html'; return null; }
  if (rolRequerido && u.rol !== rolRequerido) {
    alert('No tienes permisos para acceder a esta sección');
    window.location.href = '../pages/dashboard.html';
    return null;
  }
  return u;
}

function money(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-CO');
}

