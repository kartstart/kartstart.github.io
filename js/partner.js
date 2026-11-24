import config from './partner-config.js';
import { currentLanguage, t } from './i18n.js';
import { escapeHtml, icon } from './ui.js';

const { track, booking, karts = [], prices, rules = [] } = config ?? {};
const tariffKeys = {
  standard: 'centerTariffStandard',
  insured: 'centerTariffInsured',
  membership: 'centerTariffMembership'
};

function localized(value) {
  if (typeof value === 'string') return value.trim();
  return (value?.[currentLanguage()] || value?.az || value?.ru || value?.en || '').trim();
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

function assetUrl(value) {
  return typeof value === 'string' && value.startsWith('./assets/') ? value : https(value);
}

function label(key) {
  return escapeHtml(t(key));
}

function tariffName(tariff) {
  return t(tariffKeys[tariff]) || tariff;
}

function formatNumber(value, options = {}) {
  return new Intl.NumberFormat(currentLanguage(), { maximumFractionDigits: 2, ...options }).format(value);
}

function sessionCount(count) {
  const plural = new Intl.PluralRules(currentLanguage()).select(count);
  const key = { one: 'centerSessionOne', few: 'centerSessionFew' }[plural] || 'centerSessions';
  return formatNumber(count) + ' ' + t(key);
}

function link(url, key, symbol, type = 'secondary') {
  if (!url) return '';
  const external = url.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="button ${type}" href="${escapeHtml(url)}"${external}>${icon(symbol, 18)}${label(key)}</a>`;
}

export const centerEnabled = Boolean(localized(config?.name));
export const centerTabs = [
  ['overview', 'centerOverview', true],
  ['karts', 'centerKarts', karts.length],
  ['prices', 'centerPrices', prices?.rides?.length || prices?.memberships?.length],
  ['rules', 'centerRulesTab', rules.length]
].filter(([, , available]) => available);

export function centerPath(tab) {
  return tab && tab !== 'overview' ? '#/center/' + tab : '#/center';
}

export function centerCard() {
  if (!centerEnabled) return '';
  return `<a class="tile center-preview" href="${centerPath()}">
    <span class="tile-icon tone-green">${icon('pin', 22)}</span>
    <span class="tile-copy"><strong>${escapeHtml(localized(config.name))}</strong><span>${label('center')}</span></span>
    ${icon('chevron', 18)}
  </a>`;
}

function trackCard() {
  const source = assetUrl(track?.image);
  if (!source) return '';
  const pdf = assetUrl(track.pdf);
  const facts = [
    track.length && formatNumber(track.length) + ' ' + t('centerMetres'),
    track.widthMin && track.widthMax && formatNumber(track.widthMin) + '–' + formatNumber(track.widthMax) + ' ' + t('centerMetres')
  ];
  return `<section class="surface center-card center-track-card" aria-labelledby="center-track-heading">
    <h2 id="center-track-heading">${label('centerTrack')}</h2>
    ${facts.some(Boolean) ? `<dl class="center-track-facts">
      ${facts[0] ? `<div><dt>${label('centerTrackLength')}</dt><dd>${escapeHtml(facts[0])}</dd></div>` : ''}
      ${facts[1] ? `<div><dt>${label('centerTrackWidth')}</dt><dd>${escapeHtml(facts[1])}</dd></div>` : ''}
    </dl>` : ''}
    <a class="center-track-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer" aria-label="${label('centerTrackZoom')}">
      <img class="center-track-image" src="${escapeHtml(source)}" width="${escapeHtml(track.width)}" height="${escapeHtml(track.height)}" alt="${escapeHtml(localized(track.alt))}">
      <span class="center-track-zoom">${icon('plus', 18)}${label('centerTrackZoom')}</span>
    </a>
    ${localized(track.description) ? `<p class="center-card-note">${escapeHtml(localized(track.description))}</p>` : ''}
    ${pdf ? `<a class="back-link center-pdf-link" href="${escapeHtml(pdf)}" target="_blank" rel="noopener noreferrer">${label('centerTrackPdf')}${icon('external', 15)}</a>` : ''}
  </section>`;
}

function contactCard() {
  const address = localized(config.address);
  const hours = localized(config.hours);
  const phone = config.phone?.label;
  const phoneUrl = /^\+?[\d\s()-]+$/.test(config.phone?.number ?? '')
    ? 'tel:' + config.phone.number.replace(/[^\d+]/g, '')
    : '';
  const directions = https(config.mapUrl);
  const website = https(config.website);
  const instagram = https(config.instagram);
  if (![address, hours, phone, directions, website, instagram].some(Boolean)) return '';
  return `<section class="surface center-card center-contact-card" aria-labelledby="center-contacts-heading">
    <h2 id="center-contacts-heading">${label('centerContacts')}</h2>
    <dl class="center-details">
      ${address ? `<div><dt>${label('centerAddress')}</dt><dd>${escapeHtml(address)}</dd></div>` : ''}
      ${hours ? `<div><dt>${label('centerHours')}</dt><dd>${escapeHtml(hours)}</dd></div>` : ''}
      ${phone ? `<div><dt>${label('centerPhone')}</dt><dd dir="ltr">${escapeHtml(phone)}</dd></div>` : ''}
    </dl>
    <div class="center-actions">
      ${link(directions, 'centerMap', 'pin', 'primary')}
      ${link(phoneUrl, 'centerCall', 'phone')}
    </div>
    ${website || instagram ? `<div class="center-externals">
      ${website ? `<a class="back-link" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">${label('centerWebsite')}${icon('external', 15)}</a>` : ''}
      ${instagram ? `<a class="back-link" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer">Instagram${icon('external', 15)}</a>` : ''}
    </div>` : ''}
  </section>`;
}

function overviewView() {
  const photo = assetUrl(config.photo?.image);
  return `${photo ? `<img class="center-photo" src="${escapeHtml(photo)}" width="${escapeHtml(config.photo.width)}" height="${escapeHtml(config.photo.height)}" alt="${escapeHtml(localized(config.photo.alt))}" loading="lazy">` : ''}
    <div class="center-overview">${trackCard()}${contactCard()}</div>`;
}

function kartsView() {
  return `<div class="center-kart-grid">
    ${karts.map(kart => {
      const photo = assetUrl(kart.photo?.image);
      return `<article class="surface center-card center-kart">
        ${photo ? `<img class="center-kart-photo" src="${escapeHtml(photo)}" width="${escapeHtml(kart.photo.width)}" height="${escapeHtml(kart.photo.height)}" alt="${escapeHtml(localized(kart.photo.alt) || kart.name)}" loading="lazy">` : ''}
        <h2>${escapeHtml(localized(kart.name))}</h2>
        <p class="center-kart-engine">${escapeHtml(localized(kart.engine))}</p>
        <dl class="center-kart-specs">
          ${kart.powerHp ? `<div><dt>${label('centerPower')}</dt><dd>${escapeHtml(formatNumber(kart.powerHp))} ${label('centerHp')}${kart.powerKw ? ` <span>/ ${escapeHtml(formatNumber(kart.powerKw))} ${label('centerKw')}</span>` : ''}</dd></div>` : ''}
          ${kart.cc ? `<div><dt>${label('centerDisplacement')}</dt><dd>${escapeHtml(formatNumber(kart.cc))} ${label('centerCc')}</dd></div>` : ''}
          ${kart.tariffs?.length ? `<div><dt>${label('centerTariffs')}</dt><dd>${escapeHtml(kart.tariffs.map(tariffName).join(' · '))}</dd></div>` : ''}
        </dl>
        ${localized(kart.restrictions) ? `<p class="center-card-note">${escapeHtml(localized(kart.restrictions))}</p>` : ''}
        ${localized(kart.details) ? `<p class="center-card-note">${escapeHtml(localized(kart.details))}</p>` : ''}
      </article>`;
    }).join('')}
  </div>`;
}

function priceGroup(title, rows, notes) {
  if (!rows.length) return '';
  return `<section class="surface center-card center-price-card">
    <h2>${label(title)}</h2>
    <ul class="center-price-list">
      ${rows.map(({ name, terms, price }) => `<li>
        <div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(terms)}</span></div>
        <span class="center-amount">${escapeHtml(formatNumber(price))} <small>AZN</small></span>
      </li>`).join('')}
    </ul>
    ${notes?.length ? `<ul class="center-price-notes">${notes.map(note => `<li>${escapeHtml(localized(note))}</li>`).join('')}</ul>` : ''}
  </section>`;
}

function bookingCard() {
  const url = https(booking?.url);
  const poster = assetUrl(booking?.poster);
  if (!url && !poster) return '';
  return `<section class="surface center-card center-booking">
    <h2>${label('centerBooking')}</h2>
    ${localized(booking.note) ? `<p class="center-card-note">${escapeHtml(localized(booking.note))}</p>` : ''}
    ${link(url, 'centerBook', 'external', 'primary')}
    ${poster ? `<details class="about-details center-booking-code">
      <summary><strong>${label('centerBookingQR')}</strong>${icon('down', 19)}</summary>
      <img src="${escapeHtml(poster)}" width="${escapeHtml(booking.width)}" height="${escapeHtml(booking.height)}" alt="${label('centerBookingQR')}" loading="lazy">
    </details>` : ''}
  </section>`;
}

function pricesView() {
  const rides = (prices.rides ?? []).map(ride => ({
    name: tariffName(ride.tariff),
    terms: formatNumber(ride.minutes) + ' ' + t('centerMinutes'),
    price: ride.price
  }));
  const memberships = (prices.memberships ?? []).map(plan => ({
    name: plan.name,
    terms: sessionCount(plan.rides) + ' · ' + formatNumber(plan.days, { style: 'unit', unit: 'day', unitDisplay: 'long' }),
    price: plan.price
  }));
  const { discount } = prices;
  return `<div class="center-price-layout">
    <div class="center-stack">
      ${priceGroup('centerSingleRides', rides, prices.rideNotes)}
      ${priceGroup('centerMemberships', memberships, prices.membershipNotes)}
      ${discount ? `<div class="center-discount">
        <strong>${escapeHtml(formatNumber(discount.percent))}%</strong>
        <span>${escapeHtml(localized(discount.details))}</span>
      </div>` : ''}
    </div>
    ${bookingCard()}
  </div>`;
}

function rulesView() {
  return `<section class="center-rules" aria-labelledby="center-rules-heading">
    <h2 id="center-rules-heading">${label('centerRules')}</h2>
    <p class="center-card-note">${label('centerRulesIntro')}</p>
    <div class="guide-items">
      ${rules.map((group, index) => `<details class="guide-detail center-rule-group"${index === 0 ? ' open' : ''}>
        <summary><strong>${label(group.topic)}</strong>${icon('down', 20)}</summary>
        <ol start="${escapeHtml(group.start)}">
          ${group.items.map(item => `<li>
            ${item.emphasis ? `<strong>${escapeHtml(localized(item.text))}</strong>` : escapeHtml(localized(item.text))}
            ${item.points?.length ? `<ul>${item.points.map(point => `<li>${escapeHtml(localized(point))}</li>`).join('')}</ul>` : ''}
          </li>`).join('')}
        </ol>
      </details>`).join('')}
    </div>
  </section>`;
}

const tabViews = { overview: overviewView, karts: kartsView, prices: pricesView, rules: rulesView };

export function centerView(tab = 'overview') {
  if (!centerEnabled) return '';
  const logo = assetUrl(config.logo);
  const name = localized(config.name);
  return `<header class="surface center-heading">
      ${logo ? `<div class="center-logo"><img src="${escapeHtml(logo)}" width="1000" height="364" alt="${escapeHtml(name)}"></div>` : ''}
      <div class="center-heading-copy">
        <h1>${escapeHtml(name)}</h1>
        ${localized(config.description) ? `<p>${escapeHtml(localized(config.description))}</p>` : ''}
      </div>
    </header>
    <nav class="center-tabs" aria-label="${label('centerTabNav')}">
      ${centerTabs.map(([id, key]) => `<a href="${centerPath(id)}"${id === tab ? ' aria-current="page"' : ''}>${label(key)}</a>`).join('')}
    </nav>
    <div class="center-panel">${tabViews[tab]()}</div>`;
}
