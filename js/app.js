import { currentLanguage, t, useLanguage } from './i18n.js';
import { categories, guideResults, guideView } from './guide.js';
import { changeRides, downloadBackup, entryFromForm, journalKey, readBackup, readRides } from './journal.js';
import { centerCard, centerEnabled, centerView } from './partner.js';
import { bindQuiz, bindReaction, quizView, reactionView } from './training.js';
import { brand, escapeHtml, icon } from './ui.js';
import { homeView, journalDetails, journalForm, journalView, missingRide, practiceView, settingsView } from './views.js';

const root = document.querySelector('#app');
const dialog = document.querySelector('#confirm-dialog');
const status = document.querySelector('#app-status');
const tabs = ['home', 'guide', 'journal', 'practice'];
const drills = ['reaction', 'flags', 'situations'];
const paths = { home: '#/', guide: '#/guide/flags', journal: '#/journal', practice: '#/practice' };

let theme = document.documentElement.dataset.theme;
let route;
let settingsBack = '#/';
let query = '';
let rides = [];
let readFailed = false;
let disposeView = () => {};
let toastTimer;
let installEvent;
let installedHere = false;

useLanguage(document.documentElement.lang);
refreshJournal();

function routeFromHash(hash) {
  const [section, item, mode] = hash.replace(/^#\/?/, '').split('/');
  switch (section) {
    case 'guide': {
      const category = categories.includes(item) ? item : 'flags';
      return { section, category, href: '#/guide/' + category };
    }
    case 'diary':
    case 'journal': {
      if (item === 'new') return { section: 'journal', mode: 'new', href: '#/journal/new' };
      if (item) {
        try {
          const id = decodeURIComponent(item);
          const suffix = mode === 'edit' ? '/edit' : '';
          return { section: 'journal', mode: suffix ? 'edit' : 'details', id, href: '#/journal/' + encodeURIComponent(id) + suffix };
        } catch {
          // Return to the journal when a malformed URL is pasted.
        }
      }
      return { section: 'journal', href: paths.journal };
    }
    case 'train':
    case 'practice':
      return drills.includes(item)
        ? { section: 'practice', drill: item, href: '#/practice/' + item }
        : { section: 'practice', href: paths.practice };
    case 'settings':
      return { section, href: '#/settings' };
    case 'center':
      if (centerEnabled) return { section, href: '#/center' };
      break;
  }
  return { section: 'home', href: '#/' };
}

function shell() {
  root.innerHTML = `<a class="skip-link" href="#main-content">${escapeHtml(t('skip'))}</a>
    <div class="app-layout">
      <aside class="rail">
        <div class="rail-brand">${brand()}</div>
        <nav class="main-nav" aria-label="${escapeHtml(t('mainNav'))}">
          ${tabs.map(tab => `<a class="nav-link" href="${paths[tab]}" data-nav="${tab}">
            <span class="nav-icon">${icon(tab, 21)}</span><span>${escapeHtml(t(tab))}</span>
          </a>`).join('')}
        </nav>
      </aside>
      <div class="workspace">
        <header class="topbar">
          <div class="mobile-brand">${brand()}</div>
          <span class="current-section"></span>
          <div class="top-actions">
            <span class="offline-indicator" hidden>${icon('offline', 16)}${escapeHtml(t('offline'))}</span>
            <a href="#/settings" class="icon-button settings-button" aria-label="${escapeHtml(t('settings'))}" title="${escapeHtml(t('settings'))}">${icon('settings', 21)}</a>
          </div>
        </header>
        <main id="main-content" tabindex="-1"></main>
      </div>
    </div>`;
  updateConnectivity();
}

function isInstalled() {
  return installedHere || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function render({ scroll = false, focus = false } = {}) {
  disposeView();
  disposeView = () => {};
  const main = root.querySelector('main');
  for (const tab of root.querySelectorAll('[data-nav]')) {
    if (tab.dataset.nav === route.section) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  const settingsButton = root.querySelector('.settings-button');
  if (route.section === 'settings') settingsButton.setAttribute('aria-current', 'page');
  else settingsButton.removeAttribute('aria-current');
  root.querySelector('.current-section').textContent = t(route.section);
  main.className = 'view view-' + route.section;
  document.title = route.section === 'home' ? 'KartStart' : t(route.section) + ' · KartStart';

  switch (route.section) {
    case 'home':
      main.innerHTML = homeView(centerCard());
      break;
    case 'guide':
      main.innerHTML = guideView(route.category, query);
      break;
    case 'journal': {
      const ride = rides.find(entry => entry.id === route.id);
      if (route.mode === 'new') main.innerHTML = journalForm();
      else if (route.mode === 'edit' && ride) main.innerHTML = journalForm(ride);
      else if (route.mode === 'details' && ride) main.innerHTML = journalDetails(ride);
      else if (route.mode) main.innerHTML = missingRide();
      else main.innerHTML = journalView(rides, readFailed);
      break;
    }
    case 'practice':
      if (route.drill === 'reaction') {
        main.innerHTML = reactionView();
        disposeView = bindReaction(main);
      } else if (route.drill) {
        main.innerHTML = quizView(route.drill);
        disposeView = bindQuiz(main, route.drill);
      } else {
        main.innerHTML = practiceView();
      }
      break;
    case 'settings':
      main.innerHTML = settingsView({ theme, installed: isInstalled(), hasRides: rides.length > 0, readFailed }, settingsBack);
      break;
    case 'center':
      main.innerHTML = centerView();
      break;
  }
  if (scroll) window.scrollTo(0, 0);
  if (focus) main.focus({ preventScroll: true });
}

function onRouteChange() {
  const previous = route;
  route = routeFromHash(location.hash);
  if (previous && previous.href !== route.href && dialog.open) dialog.close('cancel');
  if (route.section === 'settings' && previous && previous.section !== 'settings') settingsBack = previous.href;
  if (previous?.section !== 'guide' || route.section !== 'guide' || previous.category !== route.category) query = '';
  if (location.hash && location.hash !== route.href) history.replaceState(null, '', route.href);
  render({ scroll: true, focus: Boolean(previous) });
}

function refreshJournal() {
  try {
    rides = readRides();
    readFailed = false;
  } catch {
    rides = [];
    readFailed = true;
  }
}

function updateConnectivity() {
  root.querySelector('.offline-indicator').hidden = navigator.onLine;
}

function toast(message) {
  clearTimeout(toastTimer);
  status.textContent = message;
  toastTimer = setTimeout(() => { status.textContent = ''; }, 5500);
}

function storePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    toast(t('preferenceError'));
  }
}

function selectTheme(value) {
  theme = value === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f5f5ef' : '#151614';
  storePreference('kartstart-theme', theme);
}

function setQuery(value) {
  query = value;
  const { html, summary } = guideResults(route.category, query);
  root.querySelector('#guide-results').innerHTML = html;
  root.querySelector('#guide-summary').textContent = summary;
  root.querySelector('#clear-search').hidden = !query;
}

function updateRideError(form, name, message) {
  const input = form.elements[name];
  const error = form.querySelector('#error-' + name);
  if (!error) return;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  error.hidden = !message;
  error.textContent = message ?? '';
}

async function saveRide(form) {
  const { errors, ride } = entryFromForm(form);
  for (const name of ['date', 'track', 'time']) updateRideError(form, name, errors[name] ? t(errors[name]) : '');
  const firstError = Object.keys(errors)[0];
  if (firstError) {
    form.elements[firstError].focus();
    return;
  }

  const button = form.querySelector('button[type=submit]');
  if (button.disabled) return;
  button.disabled = true;
  button.querySelector('span').textContent = t('saving');
  const current = route;
  const id = current.id ?? (globalThis.crypto?.randomUUID?.() || 'ride-' + Date.now() + '-' + Math.random().toString(36).slice(2));

  try {
    rides = await changeRides(oldRides => {
      const record = { ...ride, id };
      if (!current.id) return [record, ...oldRides];
      if (!oldRides.some(entry => entry.id === id)) throw new Error('Session has been removed');
      return oldRides.map(entry => entry.id === id ? record : entry);
    });
    readFailed = false;
    if (route === current && form.isConnected) location.hash = '#/journal/' + encodeURIComponent(id);
    toast(t('saved'));
  } catch {
    toast(t('storageError'));
  } finally {
    button.disabled = false;
    button.querySelector('span').textContent = t('save');
  }
}

function confirm(title, description) {
  if (!dialog.showModal) return Promise.resolve(window.confirm(title + '\n\n' + description));
  if (dialog.open) return Promise.resolve(false);
  dialog.innerHTML = `<form method="dialog" class="confirm-form">
    <span class="tile-icon tone-danger">${icon('trash', 23)}</span>
    <h2 id="confirm-title">${escapeHtml(title)}</h2>
    <p id="confirm-description">${escapeHtml(description)}</p>
    <div class="form-actions">
      <button class="button secondary" value="cancel" autofocus>${escapeHtml(t('cancel'))}</button>
      <button class="button danger" value="delete">${escapeHtml(t('confirmDelete'))}</button>
    </div>
  </form>`;
  dialog.returnValue = '';
  dialog.showModal();
  return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'delete'), { once: true }));
}

async function deleteRide(all = false) {
  const current = route;
  const title = t(all ? 'clearDiary' : 'deleteRide');
  const hint = t(all ? 'clearDiaryHint' : 'deleteRideHint');
  if (!await confirm(title, hint)) return;
  try {
    rides = await changeRides(old => all ? [] : old.filter(entry => entry.id !== current.id), all);
    readFailed = false;
    if (route === current) {
      if (all) render({ focus: true });
      else location.hash = '#/journal';
    }
    toast(t(all ? 'diaryCleared' : 'deleted'));
  } catch {
    toast(t('storageError'));
  }
}

async function exportJournal() {
  try {
    const records = readRides();
    if (!records.length) {
      toast(t('exportEmpty'));
      return;
    }
    await downloadBackup(records);
  } catch {
    toast(t('exportError'));
  }
}

async function importJournal(input) {
  const file = input.files[0];
  input.value = '';
  if (!file) return;
  const button = root.querySelector('[data-action="import"]');
  button.disabled = true;
  let newRecords;
  try {
    newRecords = readBackup(await file.text());
  } catch {
    toast(t('importError'));
    button.disabled = false;
    return;
  }

  try {
    let added = 0;
    rides = await changeRides(old => {
      const ids = new Set(old.map(ride => ride.id));
      const newRides = newRecords.filter(ride => !ids.has(ride.id));
      added = newRides.length;
      return [...old, ...newRides];
    });
    readFailed = false;
    if (route.section === 'settings') {
      render();
      root.querySelector('[data-action="import"]').focus();
    } else if (route.section === 'journal' && !route.mode) render();
    toast(added ? t('importDone') + ' ' + added : t('importDuplicate'));
  } catch {
    toast(t('storageError'));
  } finally {
    button.disabled = false;
  }
}

function manualInstall(button) {
  if (!button.isConnected) return;
  const help = root.querySelector('#install-help');
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const key = isIOS ? 'installIOS' : /Android/i.test(ua) ? 'installAndroid' : 'installDesktop';
  help.textContent = t(key);
  help.hidden = !help.hidden;
  button.setAttribute('aria-expanded', String(!help.hidden));
}

async function installApp(button) {
  if (isInstalled()) return;
  const event = installEvent;
  if (!event) {
    manualInstall(button);
    return;
  }
  installEvent = undefined;
  button.disabled = true;
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') installedHere = true;
  } catch {
    manualInstall(button);
  } finally {
    if (isInstalled() && route.section === 'settings') render({ focus: true });
    else button.disabled = false;
  }
}

root.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    root.querySelector('main').focus();
    return;
  }
  const category = event.target.closest('[data-category]');
  if (query && category && route.section === 'guide') setQuery('');
  if (event.target.closest('#clear-search')) {
    const search = root.querySelector('#guide-search');
    search.value = '';
    setQuery('');
    search.focus();
    return;
  }
  const action = event.target.closest('[data-action]');
  switch (action?.dataset.action) {
    case 'install': installApp(action); break;
    case 'delete-ride': deleteRide(); break;
    case 'clear': deleteRide(true); break;
    case 'export': exportJournal(); break;
    case 'import': root.querySelector('#import-diary').click(); break;
  }
});

root.addEventListener('input', event => {
  if (event.target.id === 'guide-search') setQuery(event.target.value);
  if (event.target.form?.id === 'ride-form') updateRideError(event.target.form, event.target.name);
});

root.addEventListener('change', event => {
  if (event.target.id === 'language') {
    useLanguage(event.target.value);
    storePreference('kartstart-language', currentLanguage());
    shell();
    render();
    root.querySelector('#language').focus();
  } else if (event.target.name === 'theme') {
    selectTheme(event.target.value);
  } else if (event.target.id === 'import-diary') {
    importJournal(event.target);
  }
});

root.addEventListener('submit', event => {
  if (event.target.id === 'ride-form') {
    event.preventDefault();
    saveRide(event.target);
  }
});

window.addEventListener('hashchange', onRouteChange);
window.addEventListener('online', updateConnectivity);
window.addEventListener('offline', updateConnectivity);
window.addEventListener('storage', event => {
  if (event.key !== journalKey && event.key !== null) return;
  refreshJournal();
  if ((route.section === 'journal' && (!route.mode || route.mode === 'details')) || route.section === 'settings') render();
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installEvent = event;
});

window.addEventListener('appinstalled', () => {
  installEvent = undefined;
  installedHere = true;
  if (route.section === 'settings') render({ focus: true });
});

shell();
onRouteChange();

if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(error => {
    console.warn('KartStart service worker registration failed.', error);
  });
}
