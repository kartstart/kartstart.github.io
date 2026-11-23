import ru from './locales/ru.js';
import en from './locales/en.js';
import az from './locales/az.js';

const locales = { ru, en, az };
const formatLocales = { ru: 'ru-RU', en: 'en-GB', az: 'az-AZ' };
export const languages = { ru: 'Русский', en: 'English', az: 'Azərbaycanca' };
let language = 'ru';

export function useLanguage(value) {
  language = Object.prototype.hasOwnProperty.call(locales, value) ? value : 'ru';
  document.documentElement.lang = language;
  document.querySelector('meta[name="description"]').content = t('description');
}

export function t(key) {
  return locales[language].ui[key];
}

export function content() {
  return locales[language];
}

export function currentLanguage() {
  return language;
}

export function dateLabel(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(formatLocales[language], { dateStyle: 'medium' }).format(date);
}

export function searchText(value) {
  return String(value).toLocaleLowerCase(formatLocales[language])
    .replace(/ё/g, 'е')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i');
}
