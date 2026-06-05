// ── Comunicados globais — FlowDesck ──────────────────────────────────────────
const DISMISSED_KEY = 'fd_dismissed_anns';

function getDismissed() {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { return []; }
}
function dismiss(id) {
  const list = getDismissed();
  if (!list.includes(id)) { list.push(id); localStorage.setItem(DISMISSED_KEY, JSON.stringify(list)); }
}

// ── Estilos por prioridade — cores sólidas, alto contraste ───────────────────
const STYLES = {
  urgent: {
    bg:       'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #7F1D1D 100%)',
    solid:    '#991B1B',
    border:   '#EF4444',
    glow:     'rgba(239,68,68,.45)',
    title:    '#FFFFFF',
    body:     'rgba(255,255,255,.88)',
    badge:    '#EF4444',
    badgeTxt: '#fff',
    icon:     '🚨',
    label:    'URGENTE',
    pulse:    true,
  },
  important: {
    bg:       'linear-gradient(135deg, #1E3A5F 0%, #1D4ED8 50%, #1E3A5F 100%)',
    solid:    '#1D4ED8',
    border:   '#3B82F6',
    glow:     'rgba(59,130,246,.4)',
    title:    '#FFFFFF',
    body:     'rgba(255,255,255,.88)',
    badge:    '#3B82F6',
    badgeTxt: '#fff',
    icon:     '📢',
    label:    'IMPORTANTE',
    pulse:    false,
  },
  normal: {
    bg:       'linear-gradient(135deg, #78350F 0%, #92400E 50%, #78350F 100%)',
    solid:    '#92400E',
    border:   '#F59E0B',
    glow:     'rgba(245,158,11,.35)',
    title:    '#FFFFFF',
    body:     'rgba(255,255,255,.88)',
    badge:    '#F59E0B',
    badgeTxt: '#1a0e00',
    icon:     '📣',
    label:    'AVISO',
    pulse:    false,
  },
};

function buildCSS() {
  if (document.getElementById('ann-banner-style')) return;
  const style = document.createElement('style');
  style.id = 'ann-banner-style';
  style.textContent = `
    #ann-stack { display:flex; flex-direction:column; flex-shrink:0; }

    /* ── Banner ── */
    .ann-banner {
      display:flex; align-items:center; gap:12px;
      padding:10px 18px;
      border-bottom:1px solid transparent;
      position:relative; overflow:hidden;
      animation: annDrop .35s cubic-bezier(.22,1,.36,1) both;
    }

    /* Linha brilhante no topo (borda superior colorida) */
    .ann-banner::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background:inherit; filter:brightness(1.8);
    }

    /* Shimmer sutil que varre o banner */
    .ann-banner::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.06) 50%,transparent 60%);
      background-size:200% 100%;
      animation: annShimmer 3s ease-in-out infinite;
    }

    @keyframes annDrop {
      from { opacity:0; transform:translateY(-100%); max-height:0; }
      to   { opacity:1; transform:translateY(0);     max-height:80px; }
    }

    @keyframes annShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position:-200% 0; }
    }

    @keyframes annPulse {
      0%,100% { box-shadow:0 2px 20px var(--ann-glow,rgba(239,68,68,.0)); }
      50%     { box-shadow:0 2px 32px var(--ann-glow,rgba(239,68,68,.6)); }
    }

    .ann-banner.pulse {
      animation: annDrop .35s cubic-bezier(.22,1,.36,1) both,
                 annPulse 2s ease-in-out .4s infinite;
    }

    .ann-banner.dismissing {
      animation: annCollapse .22s ease forwards !important;
    }
    @keyframes annCollapse {
      to { opacity:0; max-height:0; padding-top:0; padding-bottom:0; }
    }

    /* Badge de tipo */
    .ann-badge {
      font-size:9px; font-weight:800; letter-spacing:1px;
      padding:2px 7px; border-radius:3px;
      text-transform:uppercase; flex-shrink:0;
      font-family:-apple-system,sans-serif;
    }

    /* Ícone */
    .ann-icon-wrap {
      font-size:16px; flex-shrink:0; line-height:1;
      filter:drop-shadow(0 0 6px currentColor);
    }

    /* Conteúdo */
    .ann-content { flex:1; min-width:0; display:flex; align-items:center; gap:8px; overflow:hidden; }
    .ann-title {
      font-size:13px; font-weight:700; white-space:nowrap; flex-shrink:0;
      font-family:-apple-system,sans-serif;
      text-shadow:0 1px 4px rgba(0,0,0,.3);
    }
    .ann-sep { color:rgba(255,255,255,.3); font-size:12px; flex-shrink:0; }
    .ann-body-txt {
      font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      flex:1; font-family:-apple-system,sans-serif;
    }

    /* Direita */
    .ann-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
    .ann-time { font-size:10px; color:rgba(255,255,255,.45); }
    .ann-pin  { font-size:13px; }

    /* Botão fechar */
    .ann-close-btn {
      width:24px; height:24px; border-radius:5px; border:none;
      background:rgba(255,255,255,.12); cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      color:rgba(255,255,255,.7); transition:all .15s; padding:0;
      flex-shrink:0;
    }
    .ann-close-btn:hover { background:rgba(255,255,255,.25); color:#fff; transform:scale(1.1); }
    .ann-close-btn svg { width:11px; height:11px; }

    @media(max-width:600px) {
      .ann-body-txt, .ann-sep { display:none; }
      .ann-banner { padding:9px 14px; gap:9px; }
      .ann-time { display:none; }
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
  const s   = STYLES[a.priority] || STYLES.normal;
  const div = document.createElement('div');

  div.className   = `ann-banner${s.pulse ? ' pulse' : ''}`;
  div.dataset.id  = a.id;
  div.style.cssText = `
    background:${s.bg};
    border-bottom-color:${s.border}80;
    --ann-glow:${s.glow};
    box-shadow:0 2px 16px ${s.glow};
  `;

  div.innerHTML = `
    <span class="ann-icon-wrap">${s.icon}</span>
    <span class="ann-badge" style="background:${s.badge};color:${s.badgeTxt}">${s.label}</span>
    <div class="ann-content">
      <span class="ann-title" style="color:${s.title}">${escHtml(a.title)}</span>
      <span class="ann-sep">·</span>
      <span class="ann-body-txt" style="color:${s.body}">${escHtml(a.body)}</span>
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
  setTimeout(() => el.remove(), 240);
};

export async function initAnnouncements(supabase) {
  buildCSS();

  if (!document.getElementById('ann-stack')) {
    const stack = document.createElement('div');
    stack.id = 'ann-stack';
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.insertAdjacentElement('afterend', stack);
    else document.body.prepend(stack);
  }

  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned',     { ascending: false })
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

  // Stagger na entrada dos banners
  active.forEach((a, i) => {
    const banner = renderBanner(a);
    banner.style.animationDelay = `${i * 0.08}s`;
    stack.appendChild(banner);
  });

  // Realtime
  supabase.channel('ann-global')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
      const a = payload.new;
      if (getDismissed().includes(a.id)) return;
      const stack = document.getElementById('ann-stack');
      if (!stack) return;
      const banner = renderBanner(a);
      if (a.pinned) stack.prepend(banner);
      else stack.insertBefore(banner, stack.firstChild);
    })
    .subscribe();
}
