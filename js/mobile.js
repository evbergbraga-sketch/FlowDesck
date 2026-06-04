/**
 * FlowDesck — Mobile Utilities
 * Detecção de dispositivo + comportamentos mobile
 */

// ── DETECÇÃO ─────────────────────────────────────────────────────────────────
export const isMobile  = () => window.innerWidth <= 768;
export const isPhone   = () => window.innerWidth <= 480;
export const isTouch   = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Adicionar classe no <html> para CSS condicional
function applyDeviceClass() {
  const html = document.documentElement;
  if (isMobile()) {
    html.classList.add('is-mobile');
    html.classList.remove('is-desktop');
  } else {
    html.classList.add('is-desktop');
    html.classList.remove('is-mobile');
  }
}
applyDeviceClass();
window.addEventListener('resize', applyDeviceClass);

// ── BOTTOM NAV — ACTIVE STATE ─────────────────────────────────────────────────
// Sincroniza activeState do rail/bottom-nav com a seção visível
export function syncBottomNav(sectionId) {
  if (!isMobile()) return;
  document.querySelectorAll('.rail-btn, .bottom-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });
}

// ── SIDEBAR IMÓVEIS — DRAWER MOBILE ──────────────────────────────────────────
let sidebarOpen = false;

export function setupMobileSidebar(sidebarEl) {
  if (!isMobile() || !sidebarEl) return;

  // Criar overlay se não existir
  let overlay = document.getElementById('sidebarOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', closeMobileSidebar);
    document.body.appendChild(overlay);
  }

  // Botão para abrir sidebar no header mobile
  const header = document.querySelector('.imoveis-header, .main-header');
  if (header && !header.querySelector('.sidebar-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'sidebar-toggle h-btn';
    btn.style.cssText = 'display:flex;align-items:center;gap:5px;';
    btn.innerHTML = '<i class="ti ti-menu-2"></i>';
    btn.addEventListener('click', toggleMobileSidebar);
    header.insertBefore(btn, header.firstChild);
  }
}

export function toggleMobileSidebar() {
  sidebarOpen ? closeMobileSidebar() : openMobileSidebar();
}

function openMobileSidebar() {
  sidebarOpen = true;
  document.querySelector('.imoveis-sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  sidebarOpen = false;
  document.querySelector('.imoveis-sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// Fechar sidebar ao selecionar sublista no mobile
export function closeSidebarOnSelect() {
  if (isMobile()) closeMobileSidebar();
}

// ── CALENDÁRIO — PAINEL MOBILE ────────────────────────────────────────────────
export function openCalendarPanel() {
  if (!isMobile()) return;
  document.getElementById('calDayPanel')?.classList.add('open');
}

export function closeCalendarPanel() {
  document.getElementById('calDayPanel')?.classList.remove('open');
}

// ── SCROLL TO TOP AO MUDAR SEÇÃO ─────────────────────────────────────────────
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── TOAST ADAPTADO PARA MOBILE ────────────────────────────────────────────────
// No mobile o toast fica acima do bottom nav
export function adjustToastPosition() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (isMobile()) {
    toast.style.bottom = '68px'; // acima do rail (56px) + 12px margin
    toast.style.right  = '12px';
    toast.style.left   = '12px';
    toast.style.textAlign = 'center';
  } else {
    toast.style.bottom = '20px';
    toast.style.right  = '20px';
    toast.style.left   = '';
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  adjustToastPosition();
  window.addEventListener('resize', adjustToastPosition);
});
