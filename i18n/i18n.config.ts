import ja from '~/i18n/locales/ja';

export default defineI18nConfig(() => {
  // @ts-ignore
  const data = ja.default || ja;

  return {
    legacy: false,
    locale: 'ja',
    messages: {
      ja: data,
    },
  };
});
