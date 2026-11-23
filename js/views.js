import { currentLanguage, dateLabel, languages, t } from './i18n.js';
import { conditions, limits, today } from './journal.js';
import { backLink, emptyState, escapeHtml, icon, lamps, notice, pageHeader, tile } from './ui.js';

export function homeView(partnerCard) {
  return `<section class="hero">
    <picture class="hero-art">
      <source media="(max-width: 699px)" srcset="./assets/kart-hero-mobile.webp">
      <img src="./assets/kart-hero.webp" width="1600" height="800" alt="" fetchpriority="high">
    </picture>
    <div class="hero-copy">
      <h1>${escapeHtml(t('heroLineOne'))}<br><span>${escapeHtml(t('heroLineTwo'))}</span></h1>
      <p>${escapeHtml(t('heroDescription'))}</p>
      <a class="button primary" href="#/guide/flags">${escapeHtml(t('openGuide'))}${icon('arrow', 19)}</a>
    </div>
  </section>
  <section class="home-section" aria-labelledby="quick-heading">
    <h2 id="quick-heading">${escapeHtml(t('quickAccess'))}</h2>
    <div class="quick-grid">
      ${tile({ href: '#/guide/flags', symbol: 'flag', title: t('flags'), description: t('flagsShort') })}
      ${tile({ href: '#/guide/safety', symbol: 'shield', title: t('safety'), description: t('safetyShort'), tone: 'green' })}
      ${tile({ href: '#/journal', symbol: 'journal', title: t('journal'), description: t('journalShort'), tone: 'violet' })}
    </div>
  </section>
  <a class="practice-feature" href="#/practice/reaction">
    <span class="tile-icon tone-lime">${icon('timer', 24)}</span>
    <span class="feature-copy"><strong>${escapeHtml(t('reaction'))}</strong><span>${escapeHtml(t('reactionShort'))}</span></span>
    ${lamps()}
    <span class="feature-action">${escapeHtml(t('start'))}${icon('arrow', 19)}</span>
  </a>
  ${partnerCard}`;
}

function rideUrl(id) {
  return `#/journal/${encodeURIComponent(id)}`;
}

function addRideLink() {
  return `<a class="button primary" href="#/journal/new">${icon('plus', 20)}${escapeHtml(t('addRide'))}</a>`;
}

export function journalView(rides, readFailed) {
  const entries = [...rides].sort((a, b) => b.date.localeCompare(a.date));
  const header = pageHeader(t('journal'), t('journalDescription'), entries.length ? addRideLink() : '');
  if (readFailed) return header + notice(t('readError'), 'warning');
  if (!entries.length) {
    return header + emptyState('journal', t('noRides'), t('noRidesHint'), addRideLink())
      + `<p class="journal-local">${icon('info', 17)}${escapeHtml(t('localData'))}</p>`;
  }
  return `${header}<ul class="ride-list">
    ${entries.map(ride => `<li><a class="ride-row" href="${rideUrl(ride.id)}">
      <span class="tile-icon tone-violet">${icon('journal', 21)}</span>
      <span class="ride-row-copy"><strong>${escapeHtml(ride.track)}</strong>
        <span>${escapeHtml(dateLabel(ride.date))}${ride.kart ? ` · ${escapeHtml(ride.kart)}` : ''}</span>
      </span>
      ${ride.time ? `<span class="lap-number">${escapeHtml(ride.time)}</span>` : ''}
      ${icon('chevron', 19)}
    </a></li>`).join('')}
  </ul><div class="journal-footer">
    <p class="journal-local">${icon('info', 17)}${escapeHtml(t('localData'))}</p>
    <button class="button secondary" type="button" data-action="export">${icon('download', 19)}${escapeHtml(t('exportDiary'))}</button>
  </div>`;
}

function field(name, label, control, hint = '') {
  return `<div class="field field-${name}">
    <label for="field-${name}">${escapeHtml(t(label))}</label>
    ${control}
    ${hint ? `<p class="field-hint" id="hint-${name}">${escapeHtml(hint)}</p>` : ''}
    <p class="field-error" id="error-${name}" hidden></p>
  </div>`;
}

export function journalForm(ride = null) {
  const text = key => escapeHtml(ride?.[key] ?? '');
  const back = ride ? rideUrl(ride.id) : '#/journal';
  const date = escapeHtml(ride?.date ?? today());
  const title = ride ? t('editRideTitle') : t('addRide');
  return `${backLink(back)}${pageHeader(title)}
    <form class="surface ride-form" id="ride-form" novalidate>
      <p class="form-intro">${escapeHtml(t('optionalFields'))}</p>
      <div class="form-grid">
        ${field('date', 'date', `<input id="field-date" name="date" type="date" required min="0001-01-01" max="9999-12-31" value="${date}" aria-describedby="error-date">`)}
        ${field('track', 'track', `<input id="field-track" name="track" required maxlength="${limits.track}" placeholder="${escapeHtml(t('trackPlaceholder'))}" value="${text('track')}" aria-describedby="error-track">`)}
        ${field('kart', 'kart', `<input id="field-kart" name="kart" maxlength="${limits.kart}" placeholder="${escapeHtml(t('kartPlaceholder'))}" value="${text('kart')}">`)}
        ${field('time', 'lapTime', `<input id="field-time" name="time" inputmode="decimal" maxlength="${limits.time}" value="${text('time')}" placeholder="0:42.380" aria-describedby="hint-time error-time">`, t('lapHint'))}
        ${field('condition', 'condition', `<select id="field-condition" name="condition">${conditions.map(condition => `<option value="${condition}" ${condition === ride?.condition ? 'selected' : ''}>${escapeHtml(t(condition))}</option>`).join('')}</select>`)}
        ${field('weather', 'weather', `<input id="field-weather" name="weather" maxlength="${limits.weather}" placeholder="${escapeHtml(t('weatherPlaceholder'))}" value="${text('weather')}">`)}
        ${field('notes', 'notes', `<textarea id="field-notes" name="notes" rows="4" maxlength="${limits.notes}" placeholder="${escapeHtml(t('notesPlaceholder'))}">${text('notes')}</textarea>`)}
      </div>
      <div class="form-actions">
        <a class="button secondary" href="${back}">${escapeHtml(t('cancel'))}</a>
        <button class="button primary" type="submit">${icon('check', 19)}<span>${escapeHtml(t('save'))}</span></button>
      </div>
    </form>`;
}

export function missingRide() {
  return backLink('#/journal') + pageHeader(t('rideMissing'), t('rideMissingHint'));
}

export function journalDetails(ride) {
  const data = [
    [t('date'), dateLabel(ride.date)],
    [t('kart'), ride.kart],
    [t('lapTime'), ride.time],
    [t('condition'), ride.condition === 'unspecified' ? '' : t(ride.condition)],
    [t('weather'), ride.weather],
    [t('notes'), ride.notes]
  ];
  return `${backLink('#/journal')}${pageHeader(ride.track, t('rideDetails'))}
    <section class="surface ride-detail">
      <dl class="detail-grid">
        ${data.filter(([, value]) => value).map(([label, value]) =>
          `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
      </dl>
      <div class="form-actions details-actions">
        <button class="button danger-text" type="button" data-action="delete-ride">${icon('trash', 19)}${escapeHtml(t('deleteRide'))}</button>
        <a class="button secondary" href="${rideUrl(ride.id)}/edit">${icon('edit', 19)}${escapeHtml(t('editRide'))}</a>
      </div>
    </section>`;
}

const exercises = [
  ['reaction', 'timer', 'reaction', 'reactionShort', 'lime'],
  ['flags', 'flag', 'flagQuiz', 'flagQuizShort', 'green'],
  ['situations', 'route', 'situationQuiz', 'situationQuizShort', 'violet']
];

export function practiceView() {
  return `${pageHeader(t('practice'), t('practiceDescription'))}
    <div class="exercise-list">
      ${exercises.map(([id, symbol, title, description, tone]) => tile({
        href: '#/practice/' + id, symbol, title: t(title), description: t(description), tone
      })).join('')}
    </div>`;
}

function themeOption(value, symbol, selected) {
  return `<label class="theme-option">
    <input type="radio" name="theme" value="${value}" ${selected ? 'checked' : ''}>
    <span>${icon(symbol, 18)}${escapeHtml(t(value))}</span>
  </label>`;
}

export function settingsView({ theme, installed, hasRides, readFailed }, returnUrl) {
  return `${backLink(returnUrl)}${pageHeader(t('settings'))}
    <div class="settings-grid">
      <section class="surface settings-card">
        <h2>${escapeHtml(t('appearance'))}</h2>
        <div class="setting-row">
          <label for="language">${escapeHtml(t('language'))}</label>
          <select id="language" name="language">
            ${Object.entries(languages).map(([code, label]) => `<option value="${code}" lang="${code}" ${code === currentLanguage() ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select>
        </div>
        <fieldset class="setting-row theme-setting">
          <legend>${escapeHtml(t('theme'))}</legend>
          <div class="theme-options">${themeOption('dark', 'moon', theme === 'dark')}${themeOption('light', 'sun', theme === 'light')}</div>
        </fieldset>
      </section>
      <section class="surface settings-card">
        <h2>${escapeHtml(t('appSection'))}</h2>
        <p>${escapeHtml(t('installDescription'))}</p>
        <button type="button" class="button secondary" data-action="install" ${installed ? 'disabled' : ''} aria-controls="install-help" aria-expanded="false">
          ${icon('phone', 20)}${escapeHtml(t(installed ? 'installed' : 'install'))}
        </button>
        <p id="install-help" class="inline-help" hidden></p>
        <details class="about-details">
          <summary><strong>${escapeHtml(t('about'))}</strong>${icon('down', 19)}</summary>
          <p>${escapeHtml(t('aboutText'))}</p>
        </details>
      </section>
      <section class="surface settings-card data-card">
        <h2>${escapeHtml(t('diaryData'))}</h2>
        <p>${escapeHtml(t('diaryDataDescription'))}</p>
        ${readFailed ? notice(t('readError'), 'warning') : ''}
        <div class="data-actions">
          <button class="button secondary" data-action="export" type="button" ${hasRides ? '' : 'disabled'}>${icon('download', 19)}${escapeHtml(t('exportDiary'))}</button>
          <button class="button secondary" data-action="import" type="button" aria-describedby="import-hint">${icon('upload', 19)}${escapeHtml(t('importDiary'))}</button>
          <input type="file" id="import-diary" accept=".json,application/json" hidden>
        </div>
        <p id="import-hint" class="field-hint">${escapeHtml(t('importHint'))}</p>
        <div class="data-remove">
          <button class="button danger-text" data-action="clear" type="button" ${hasRides || readFailed ? '' : 'disabled'}>${icon('trash', 19)}${escapeHtml(t('clearDiary'))}</button>
        </div>
      </section>
    </div>`;
}
