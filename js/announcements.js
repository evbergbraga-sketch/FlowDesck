// ── Comunicados globais — compartilhado em todos os dashboards ────────────────
// Uso: <script type="module"> import '/js/announcements.js'; </script>
// Requer: supabase já instanciado como window._supabase

const DISMISSED_KEY = 'fd_dismissed_anns';

function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { return []; }
}
function dismiss(id) {
  const list = getDismissed();
  if (!list.includes(id)) { list.push(id); localStorage.setItem(DISMISSED_KEY, JSON.stringify(list)); }
}

const STYLES = {
  urgent:    { bg:'#3B0A0A', border:'#7F1D1D', titleColor:'#FCA5A5', bodyColor:'rgba(252,165,165,.7)', icon:'🚨' },
  important: { bg:'#0A1628', border:'#1E3A5F', titleColor:'#93C5FD', bodyColor:'rgba(147,197,253,.7)', icon:'📢' },
  normal:    { bg:'#1A1200', border:'#3D2800', titleColor:'#FCD34D', bodyColor:'rgba(252,211,77,.7)',  icon:'📣' },
};

function buildCSS() {
  if (document.getElementById('ann-banner-style')) return;
  const style = document.createElement('style');
  style.id = 'ann-banner-style';
  style.textContent = `
    #ann-stack { display:flex; flex-direction:column; flex-shrink:0; }
    .ann-banner {
      display:flex; align-items:center; gap:10px;
      padding:9px 20px; border-bottom:0.5px solid transparent;
      animation: annSlideIn .25s ease;
    }
    @keyframes annSlideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
    .ann-banner.dismissing { animation: annSlideOut .2s ease forwards; }
    @keyframes annSlideOut { to { opacity:0; max-height:0; padding:0; overflow:hidden; } }
    .ann-icon { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
    .ann-content { flex:1; min-width:0; display:flex; align-items:center; gap:8px; overflow:hidden; }
    .ann-title { font-size:12px; font-weight:600; white-space:nowrap; flex-shrink:0; }
    .ann-sep { color:#52525B; font-size:10px; flex-shrink:0; }
    .ann-body-txt { font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; }
    .ann-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
    .ann-time { font-size:10px; color:#52525B; }
    .ann-pin  { font-size:11px; }
    .ann-close-btn {
      width:20px; height:20px; border-radius:4px; border:none;
      background:transparent; cursor:pointer; display:flex;
      align-items:center; justify-content:center; color:#52525B;
      transition:all .15s; padding:0;
    }
    .ann-close-btn:hover { background:rgba(255,255,255,.08); color:#A1A1AA; }
    .ann-close-btn svg { width:11px; height:11px; }
    @media(max-width:600px) {
      .ann-body-txt { display:none; }
      .ann-sep { display:none; }
      .ann-banner { padding:9px 14px; }
    }
  `;
  document.head.appendChild(style);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)   return `há ${m}m`;
  if (m < 1440) return `há ${Math.floor(m/60)}h`;
  return `há ${Math.floor(m/1440)}d`;
}

function renderBanner(a) {
  const s = STYLES[a.priority] || STYLES.normal;
  const div = document.createElement('div');
  div.className = 'ann-banner';
  div.dataset.id = a.id;
  div.style.cssText = `background:${s.bg};border-bottom-color:${s.border};`;
  div.innerHTML = `
    <div class="ann-icon" style="background:${s.border}">${s.icon}</div>
    <div class="ann-content">
      <span class="ann-title" style="color:${s.titleColor}">${escHtml(a.title)}</span>
      <span class="ann-sep">·</span>
      <span class="ann-body-txt" style="color:${s.bodyColor}">${escHtml(a.body)}</span>
    </div>
    <div class="ann-right">
      ${a.pinned ? '<span class="ann-pin">📌</span>' : ''}
      <span class="ann-time">${timeAgo(a.created_at)}</span>
      <button class="ann-close-btn" title="Dispensar" onclick="window._dismissAnn('${a.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`;
  return div;
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window._dismissAnn = function(id) {
  dismiss(id);
  const el = document.querySelector(`.ann-banner[data-id="${id}"]`);
  if (!el) return;
  el.classList.add('dismissing');
  setTimeout(() => el.remove(), 220);
};

export async function initAnnouncements(supabase) {
  buildCSS();

  // Criar container após topbar se não existir
  if (!document.getElementById('ann-stack')) {
    const stack = document.createElement('div');
    stack.id = 'ann-stack';
    // Inserir após a topbar (primeiro elemento .topbar ou [class*="topbar"])
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.insertAdjacentElement('afterend', stack);
    else document.body.prepend(stack);
  }

  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (!data?.length) return;

  const dismissed = getDismissed();
  const now = new Date();
  const active = data.filter(a =>
    !dismissed.includes(a.id) &&
    (!a.expires_at || new Date(a.expires_at) > now)
  );

  const stack = document.getElementById('ann-stack');
  stack.innerHTML = '';
  active.forEach(a => stack.appendChild(renderBanner(a)));

  // Realtime — atualiza automaticamente quando admin publica novo aviso
  supabase.channel('ann-global')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
      const a = payload.new;
      const dismissed = getDismissed();
      if (dismissed.includes(a.id)) return;
      const stack = document.getElementById('ann-stack');
      if (!stack) return;
      const banner = renderBanner(a);
      if (a.pinned) stack.prepend(banner);
      else stack.insertBefore(banner, stack.firstChild);
    })
    .subscribe();
}
