import { translate } from '@vitalets/google-translate-api';

const getGoogleTranslate = async (word) => {
  const { text: definition, raw } = (await translate(word, {
    from: 'ja',
    to: 'en',
  })) as any;

  let transliteration: string[] = [];
  raw.sentences?.forEach((sentence) => {
    if (sentence?.src_translit) {
      transliteration.push(sentence.src_translit);
    }
  });
  const finalTransliteration = transliteration?.join(' ');

  return { definition, transliteration: finalTransliteration };
};

export { getGoogleTranslate };
