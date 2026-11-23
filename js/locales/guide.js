import { content, searchText, t } from './i18n.js';
import { emptyState, escapeHtml, flagPicture, icon, notice, pageHeader } from './ui.js';

export const categories = ['flags', 'safety', 'situations', 'terms'];
const categoryIcons = { flags: 'flag', safety: 'shield', situations: 'route', terms: 'guide' };

function guideItem(category, id, value, expanded = false) {
  if (category === 'flags') {
    const [title, picture, meaning, action] = value;
    return `<article class="flag-card">
      ${flagPicture(id, picture)}
      <div class="flag-copy">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(meaning)}</p>
        <div class="flag-action"><span>${escapeHtml(t('flagAction'))}</span><p>${escapeHtml(action)}</p></div>
      </div>
    </article>`;
  }
  const [title, description] = category === 'situations'
    ? [value.title, value.explanation]
    : value;
  return `<details class="guide-detail" ${expanded ? 'open' : ''}>
    <summary>
      <span class="tile-icon tone-lime">${icon(categoryIcons[category], 19)}</span>
      <strong>${escapeHtml(title)}</strong>${icon('down', 20)}
    </summary>
    <p>${escapeHtml(description)}</p>
  </details>`;
}

function group(category, items, searching) {
  return `<section class="guide-group">
    <h2 class="${searching ? 'group-title' : 'visually-hidden'}">${escapeHtml(t(category))}</h2>
    <div class="guide-items ${category === 'flags' ? 'flag-grid' : ''}">
      ${items.map(([id, value]) => guideItem(category, id, value, searching)).join('')}
    </div>
  </section>`;
}

export function guideResults(category, query) {
  const terms = searchText(query).trim().split(/\s+/).filter(Boolean);
  const data = content();
  if (!terms.length) {
    const cards = group(category, Object.entries(data[category]), false);
    return { html: (category === 'terms' ? '' : notice(t('trackPriority'))) + cards, summary: '' };
  }

  let count = 0;
  const sections = categories.map(key => {
    const matches = Object.entries(data[key]).filter(([, entry]) => {
      const fields = Array.isArray(entry) ? entry : [entry.title, entry.prompt, entry.explanation];
      const haystack = searchText(fields.join(' '));
      return terms.every(term => haystack.includes(term));
    });
    count += matches.length;
    return matches.length ? group(key, matches, true) : '';
  });
  return {
    html: count
      ? `<h2 class="results-heading">${escapeHtml(t('searchResults'))} <span>${count}</span></h2>${notice(t('trackPriority'))}${sections.join('')}`
      : emptyState('search', t('noMatches'), t('noMatchesHint')),
    summary: count ? `${t('searchCount')} ${count}` : t('noMatches')
  };
}

export function guideView(category, query) {
  return `${pageHeader(t('guide'), t('guideDescription'))}
    <div class="guide-tools">
      <div class="search-field" role="search">
        ${icon('search', 20)}
        <input type="search" id="guide-search" aria-label="${escapeHtml(t('search'))}" placeholder="${escapeHtml(t('searchPlaceholder'))}" value="${escapeHtml(query)}" maxlength="120" autocomplete="off">
        <button type="button" id="clear-search" class="icon-button" ${query ? '' : 'hidden'} aria-label="${escapeHtml(t('clearSearch'))}">${icon('close', 18)}</button>
      </div>
      <nav class="category-nav" aria-label="${escapeHtml(t('guideNav'))}">
        ${categories.map(key => `<a href="#/guide/${key}" data-category="${key}" ${key === category ? 'aria-current="page"' : ''}>${icon(categoryIcons[key], 18)}<span>${escapeHtml(t(key))}</span></a>`).join('')}
      </nav>
    </div>
    <div id="guide-summary" class="visually-hidden" role="status"></div>
    <div id="guide-results">${guideResults(category, query).html}</div>`;
}
