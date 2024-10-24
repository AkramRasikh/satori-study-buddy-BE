import { translate } from '@vitalets/google-translate-api';
import { googleLanguagesKey } from '../eligible-languages';

const getGoogleTranslate = async ({ word, language }) => {
  const fromLanguage = googleLanguagesKey[language];

  try {
    if (fromLanguage) {
      const { text: definition, raw } = (await translate(word, {
        from: fromLanguage,
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
    } else {
      throw new Error(`No viable language key found for ${language}`);
    }
  } catch (error) {
    throw new Error(error || 'Error getting google translation');
  }
};

export { getGoogleTranslate };
