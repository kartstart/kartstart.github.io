import config from './partner-config.js';
import { currentLanguage, t } from './i18n.js';
import { backLink, escapeHtml, icon, pageHeader } from './ui.js';

function localized(value) {
  if (typeof value === 'string') return value.trim();
  return (value?.[currentLanguage()] || value?.ru || value?.en || value?.az || '').trim();
}

function https(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function imageUrl(value) {
  return typeof value === 'string' && value.startsWith('./assets/') ? value : https(value);
}

export const centerEnabled = Boolean(localized(config?.name));

export function centerCard() {
  if (!centerEnabled) return '';
  const logo = imageUrl(config.logo);
  return `<a class="tile center-preview" href="#/center">
    <span class="tile-icon tone-green">${logo ? `<img src="${escapeHtml(logo)}" alt="">` : icon('pin')}</span>
    <span class="tile-copy"><strong>${escapeHtml(localized(config.name))}</strong><span>${escapeHtml(t('center'))}</span></span>
    ${icon('chevron', 18)}
  </a>`;
}

export function centerView() {
  if (!centerEnabled) return '';
  const name = localized(config.name);
  const details = [
    ['centerAddress', config.address],
    ['centerHours', config.hours],
    ['centerContacts', config.contacts]
  ].map(([label, value]) => [t(label), localized(value)]).filter(([, value]) => value);
  const cover = imageUrl(config.photo);
  const karts = (Array.isArray(config.karts) ? config.karts : []).filter(kart => localized(kart.name));
  const rules = localized(config.rules);
  const prices = localized(config.prices);
  const actions = [['centerMap', https(config.mapUrl)], ['centerBook', https(config.bookingUrl)]]
    .filter(([, value]) => value);
  return `${backLink('#/')}${pageHeader(name, t('center'))}
    <div class="center-content">
      ${cover ? `<img class="center-photo" src="${escapeHtml(cover)}" alt="${escapeHtml(name)}">` : ''}
      ${details.length || actions.length ? `<section class="surface ride-detail">
        ${details.length ? `<dl class="detail-grid">${details.map(([label, value]) =>
          `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>` : ''}
        ${actions.length ? `<div class="form-actions">${actions.map(([label, url]) =>
          `<a class="button ${label === 'centerBook' ? 'primary' : 'secondary'}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(label))}${icon('external', 18)}</a>`).join('')}</div>` : ''}
      </section>` : ''}
      ${karts.length ? `<section class="surface settings-card"><h2>${escapeHtml(t('centerKarts'))}</h2>
        <dl class="detail-grid">${karts.map(kart =>
          `<div><dt>${escapeHtml(localized(kart.name))}</dt><dd>${escapeHtml(localized(kart.details))}</dd></div>`).join('')}</dl></section>` : ''}
      ${rules ? `<section class="surface settings-card"><h2>${escapeHtml(t('centerRules'))}</h2><p class="multiline">${escapeHtml(rules)}</p></section>` : ''}
      ${prices ? `<section class="surface settings-card"><h2>${escapeHtml(t('centerPrices'))}</h2><p class="multiline">${escapeHtml(prices)}</p></section>` : ''}
    </div>`;
}
