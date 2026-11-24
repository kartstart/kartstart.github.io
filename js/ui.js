import { t } from './i18n.js';

const paths = {
  home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-7h6v7"/>',
  guide: '<path d="M12 6c-2.7-2.3-5.7-3-9-2v15c3.3-1 6.3-.3 9 2 2.7-2.3 5.7-3 9-2V4c-3.3-1-6.3-.3-9 2v15"/>',
  journal: '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 8h4m-4 4h4m-4 4h4m3-8h6m-6 4h6"/>',
  practice: '<path d="m13.5 2-9 12H11l-.5 8 9-12H13l.5-8Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M10 2h4l.5 2.4 2.3 1.3 2.3-.8 2 3.5-1.8 1.7v2.7l1.8 1.7-2 3.5-2.3-.8-2.3 1.3L14 21h-4l-.5-2.5-2.3-1.3-2.3.8-2-3.5 1.8-1.7v-2.7L2.9 8.4l2-3.5 2.3.8 2.3-1.3z" transform="translate(0 .5)"/>',
  flag: '<path d="M4 22V3c3-2 5.5-1 8 0s5 2 8 0v11c-3 2-5.5 1-8 0s-5-2-8 0"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4m-2 0v3m6 2 2-2"/>',
  route: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8a3 3 0 1 1 0 6H8a3 3 0 1 0 0 6h8"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  edit: '<path d="m15 5 4 4M4 16l-1 5 5-1L20 8a2.8 2.8 0 1 0-4-4z"/>',
  trash: '<path d="M4 7h16m-10 4v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
  upload: '<path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
  share: '<path d="M8 9H5v12h14V9h-3M12 14V3m-3 3 3-3 3 3"/>',
  squarePlus: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8m-4-4v8"/>',
  toggle: '<rect x="3" y="6" width="18" height="12" rx="6"/><circle cx="15" cy="12" r="2.5"/>',
  more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 4H6a2 2 0 0 0-2 2v10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19m0-14-1.4 1.4M6.4 17.6 5 19"/>',
  moon: '<path d="M20.6 14.5A8.8 8.8 0 0 1 9.5 3.4 9 9 0 1 0 20.6 14.5Z"/>',
  offline: '<path d="m3 3 18 18M2 8.8a16 16 0 0 1 3-1.9m3.7-1.2A16 16 0 0 1 22 8.8M5 12a11 11 0 0 1 3.4-1.7m4.3-.5a11 11 0 0 1 6.3 2.2M8 15a6 6 0 0 1 4-1.5m0 5.5h.01"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  external: '<path d="M13 4h7v7m0-7-9 9M9 4H4v16h16v-5"/>'
};

export function icon(name, size = 22) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

export function brand() {
  return `<a class="brand" href="#/" aria-label="KartStart"><img src="./assets/mark.svg" width="37" height="37" alt=""><span>Kart<span>Start</span></span></a>`;
}

export function pageHeader(title, description = '', action = '') {
  return `<header class="page-head">
    <div><h1>${escapeHtml(title)}</h1>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>
    ${action}
  </header>`;
}

export function backLink(href, label = t('back')) {
  return `<a class="back-link" href="${href}">${icon('back', 17)}${escapeHtml(label)}</a>`;
}

export function tile({ href, symbol, title, description, tone = 'lime' }) {
  return `<a class="tile" href="${href}">
    <span class="tile-icon tone-${tone}">${icon(symbol, 23)}</span>
    <span class="tile-copy"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></span>
    ${icon('chevron', 18)}
  </a>`;
}

export function emptyState(symbol, title, description, action = '') {
  return `<section class="empty-state">
    <span class="tile-icon tone-lime">${icon(symbol, 26)}</span>
    <h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(description)}</p>
    ${action}
  </section>`;
}

export function notice(message, variant = '') {
  return `<p class="notice ${variant}">${icon(variant === 'warning' ? 'info' : 'shield', 20)}<span>${escapeHtml(message)}</span></p>`;
}

export function flagPicture(id, label = '') {
  return `<span class="flag-picture flag-${id}" ${label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true"'}>
    <span class="flag-cloth"></span><span class="flag-pole"></span>
  </span>`;
}

export function lamps() {
  return `<span class="lamps" aria-hidden="true">${'<span class="lamp"></span>'.repeat(5)}</span>`;
}
