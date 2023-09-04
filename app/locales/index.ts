import { merge } from '../utils/merge';
import ar from './ar';
import bn from './bn';
import cn from './cn';
import cs from './cs';
import de from './de';
import en from './en';
import es from './es';
import fr from './fr';
import id from './id';
import it from './it';
import jp from './jp';
import ko from './ko';
import no from './no';
import ru from './ru';
import tr from './tr';
import tw from './tw';
import vi from './vi';

import type { LocaleType } from './cn';
export type { LocaleType, PartialLocaleType } from './cn';

const ALL_LANGS = {
  cn,
  en,
  tw,
  jp,
  ko,
  id,
  fr,
  es,
  it,
  tr,
  de,
  vi,
  ru,
  cs,
  no,
  ar,
  bn,
};

export type Lang = keyof typeof ALL_LANGS;

export const AllLangs = Object.keys(ALL_LANGS) as Lang[];

export const ALL_LANG_OPTIONS: Record<Lang, string> = {
  cn: '简体中文',
  en: 'English',
  tw: '繁體中文',
  jp: '日本語',
  ko: '한국어',
  id: 'Indonesia',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  tr: 'Türkçe',
  de: 'Deutsch',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  cs: 'Čeština',
  no: 'Nynorsk',
  ar: 'العربية',
  bn: 'বাংলা',
};

const LANG_KEY = 'lang';
const DEFAULT_LANG = 'en';

const fallbackLang = en;
const targetLang = ALL_LANGS[getLang()] as LocaleType;

// if target lang missing some fields, it will use fallback lang string
merge(fallbackLang, targetLang);

export default fallbackLang as LocaleType;

function getItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function getLanguage() {
  try {
    return navigator.language.toLowerCase();
  } catch {
    return DEFAULT_LANG;
  }
}

export function getLang(): Lang {
  const savedLang = getItem(LANG_KEY);

  if (AllLangs.includes((savedLang ?? '') as Lang)) {
    return savedLang as Lang;
  }

  const lang = getLanguage();

  for (const option of AllLangs) {
    if (lang.includes(option)) {
      return option;
    }
  }

  return DEFAULT_LANG;
}

export function changeLang(lang: Lang) {
  setItem(LANG_KEY, lang);
  location.reload();
}

export function getISOLang() {
  const isoLangString: Record<string, string> = {
    cn: 'zh-Hans',
    tw: 'zh-Hant',
  };

  const lang = getLang();
  return isoLangString[lang] ?? lang;
}
