/**
 * Layout profesional tipo dashboard (sidebar + topbar)
 * Estable, limpio y sin romper el DOM
 */

function renderNav(active) {
  const u = getUser();
  if (!u) return;

  const isAdmin = u.rol === 'administrador';

  const items = [
    { id: 'dashboard', href: 'dashboard.html', label: 'Dashboard', icon: 'fa-gauge-high' },
    { id: 'entrada', href: 'entrada.html', label: 'Entrada', icon: 'fa-right-to-bracket' },
    { id: 'salida', href: 'salida.html', label: 'Salida', icon: 'fa-right-from-bracket' },
    { id: 'historial', href: 'historial.html', label: 'Historial', icon: 'fa-clock-rotate-left' },
    ...(isAdmin ? [
      { id: 'tarifas', href: 'tarifas.html', label: 'Tarifas', icon: 'fa-tags' },
      { id: 'usuarios', href: 'usuarios.html', label: 'Usuarios', icon: 'fa-users-gear' },
    ] : [])
  ];

  const labels = {
    dashboard: 'Panel principal',
    entrada: 'Registrar entrada',
    salida: 'Registrar salida',
    historial: 'Historial',
    tarifas: 'Tarifas',
    usuarios: 'Usuarios',
  };

  const initials = (u.nombre || '?')
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // 🧱 Crear layout base
  const layout = document.createElement('div');
  layout.className = 'app';

  layout.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <img src="../img/logo.png" alt="Logo">
        <span>Parqueadero</span>
      </div>

      <nav>
        <div class="label">Operación</div>
        ${items.slice(0,4).map(i => `
          <a href="${i.href}" class="${i.id === active ? 'active' : ''}">
            <i class="fas ${i.icon}"></i><span>${i.label}</span>
          </a>
        `).join('')}

        ${isAdmin ? `
          <div class="label">Administración</div>
          ${items.slice(4).map(i => `
            <a href="${i.href}" class="${i.id === active ? 'active' : ''}">
              <i class="fas ${i.icon}"></i><span>${i.label}</span>
            </a>
          `).join('')}
        ` : ''}
      </nav>

      <div class="side-foot">
        <div class="avatar">${initials}</div>
        <div class="uinfo">
          <div class="name">${u.nombre}</div>
          <div class="role">${u.rol}</div>
        </div>
        <button class="logout" onclick="logout()">
          <i class="fas fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <button class="menu-toggle" onclick="toggleSidebar()">
          <i class="fas fa-bars"></i>
        </button>

        <div class="crumb">${labels[active] || 'Parqueadero'}</div>

        <div class="spacer"></div>

        <div class="pill">● Online</div>
        <div class="pill" id="clock">--:--</div>
      </header>

      <div id="appContent"></div>
    </div>
  `;

  // 📦 Obtener contenido original
  const originalContent = document.querySelector('.container');

  // 🧹 Limpiar body
  document.body.innerHTML = '';

  // 🧩 Insertar layout
  document.body.appendChild(layout);

  // 📌 Insertar contenido dentro del layout
  if (originalContent) {
    document.getElementById('appContent').appendChild(originalContent);
  }

  // 🕒 Reloj
  const clock = document.getElementById('clock');
  function updateClock() {
    clock.textContent = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  updateClock();
  setInterval(updateClock, 30000);
}


// 📱 Sidebar toggle (responsive)
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}