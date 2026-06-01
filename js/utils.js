// ── Formatação de data ────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d atrás`;
  return formatDate(dateStr);
}

// ── Prioridade ────────────────────────────────────────────────
export const PRIORITY_LABELS = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };
export const PRIORITY_COLORS = { low: "success", medium: "warning", high: "danger", urgent: "urgent" };

export function priorityBadge(p) {
  const labels = PRIORITY_LABELS;
  const map = { low: "#16a34a", medium: "#d97706", high: "#dc2626", urgent: "#7c3aed" };
  const bg  = { low: "#dcfce7", medium: "#fef3c7", high: "#fee2e2", urgent: "#ede9fe" };
  return `<span style="background:${bg[p]||bg.medium};color:${map[p]||map.medium};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:.3px">${labels[p] || p}</span>`;
}

// ── Toast ─────────────────────────────────────────────────────
export function toast(msg, type = "success") {
  const el = document.createElement("div");
  const colors = { success: "#16a34a", error: "#dc2626", info: "#2563eb", warning: "#d97706" };
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${colors[type]||colors.info};color:#fff;
    padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;
    box-shadow:0 4px 16px rgba(0,0,0,0.25);
    animation:slideIn .2s ease;max-width:320px;line-height:1.4;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Spinner ───────────────────────────────────────────────────
export function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn._orig = btn.innerHTML;
    btn.innerHTML = `<span style="opacity:.7">${btn._orig}</span> <span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-left:6px"></span>`;
  } else {
    btn.disabled = false;
    if (btn._orig) btn.innerHTML = btn._orig;
  }
}

// ── Format currency ───────────────────────────────────────────
export function formatCurrency(val) {
  if (!val && val !== 0) return "—";
  return Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Inicializa animações CSS necessárias ──────────────────────
const style = document.createElement("style");
style.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(style);
