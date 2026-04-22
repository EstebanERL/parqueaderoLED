/**
 * Renderiza navegación superior común.
 * @param {string} active - id de la página actual
 */
function renderNav(active) {
  const u = getUser(); if (!u) return;
  const isAdmin = u.rol === 'administrador';
  const items = [
    { id: 'dashboard', href: 'dashboard.html', label: 'Dashboard' },
    { id: 'entrada',   href: 'entrada.html',   label: 'Entrada' },
    { id: 'salida',    href: 'salida.html',    label: 'Salida' },
    { id: 'historial', href: 'historial.html', label: 'Historial' },
    ...(isAdmin ? [
      { id: 'tarifas',  href: 'tarifas.html',  label: 'Tarifas' },
      { id: 'usuarios', href: 'usuarios.html', label: 'Usuarios' },
    ] : []),
  ];
  const html = `
    <div class="nav">
      <div class="brand">🅿️ Parqueadero</div>
      ${items.map(i => `<a href="${i.href}" class="${i.id===active?'active':''}">${i.label}</a>`).join('')}
      <div class="spacer"></div>
      <div class="user">${u.nombre} · <i>${u.rol}</i></div>
      <button class="btn ghost" style="color:#fff;border-color:#334155" onclick="logout()">Salir</button>
    </div>`;
  document.getElementById('nav').outerHTML = html;
}
