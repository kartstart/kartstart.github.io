import { content, t } from './i18n.js';
import { backLink, escapeHtml, icon, pageHeader } from './ui.js';

const platforms = [
  ['ios', 'iPhone'],
  ['android', 'Android']
];

const illustrations = {
  ios: ['compass', 'share', 'squarePlus', 'toggle', 'plus', 'app'],
  android: ['compass', 'more', 'squarePlus', 'check', 'app']
};

export function installGuidePath(platform = 'ios') {
  return '#/settings/install/' + platform;
}

export function installEnvironment(browser) {
  const ua = browser.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (browser.platform === 'MacIntel' && browser.maxTouchPoints > 1);
  const android = /Android/i.test(ua) || browser.userAgentData?.platform === 'Android';
  const inApp = /Instagram|FBAN|FBAV|FB_IAB|BytedanceWebview|TikTok|Snapchat|MicroMessenger|Telegram|Line\/|; wv\)/i.test(ua);
  const iosWebView = ios && /AppleWebKit/i.test(ua) && !/Safari|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  return { platform: ios ? 'ios' : android ? 'android' : 'desktop', embedded: inApp || iosWebView };
}

function addressField() {
  const address = new URL('./', document.baseURI).href;
  const copyLabel = escapeHtml(t('installCopyAddress'));
  return `<div class="install-address">
    <input id="install-address" type="url" value="${escapeHtml(address)}" aria-label="${escapeHtml(t('installAddress'))}"
      readonly inputmode="none" dir="ltr">
    <button class="icon-button" type="button" data-action="copy-install-address" aria-label="${copyLabel}" title="${copyLabel}">${icon('copy', 19)}</button>
  </div>`;
}

function installStep([title, details], symbol, index) {
  const emphasised = symbol === 'share' || symbol === 'squarePlus';
  return `<li class="surface install-step${emphasised ? ' install-step--highlight' : ''}">
    <span class="install-step-number">${index + 1}</span>
    <div class="install-step-copy"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(details)}</p></div>
    <span class="install-step-icon">${symbol === 'app'
      ? '<img src="./assets/icon-180.png" alt="" width="36" height="36">'
      : icon(symbol, 24)}</span>
    ${index === 0 ? addressField() : ''}
  </li>`;
}

export function installGuideView(platform, embedded) {
  const guide = content().installGuide[platform];
  return `<div class="install-guide">
    ${backLink('#/settings', t('settings'))}
    ${pageHeader(t('installGuideTitle'), guide.description)}
    <nav class="category-nav install-platforms" aria-label="${escapeHtml(t('installPlatforms'))}">
      ${platforms.map(([id, label]) => `<a href="${installGuidePath(id)}"${id === platform ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>
    <details class="surface install-browser-help"${embedded ? ' open' : ''}>
      <summary>${icon('external', 18)}<strong>${escapeHtml(t('installBrowserHelp'))}</strong>${icon('down', 17)}</summary>
      <p>${escapeHtml(guide.embedded)}</p>
    </details>
    <ol class="install-steps" role="list">${guide.steps.map((step, index) => installStep(step, illustrations[platform][index], index)).join('')}</ol>
    <a href="#/settings" class="button primary install-done">${icon('check', 19)}${escapeHtml(t('installDone'))}</a>
  </div>`;
}
