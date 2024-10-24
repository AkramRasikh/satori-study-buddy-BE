import { translate } from '@vitalets/google-translate-api';
import { googleLanguagesKey, languageKey } from '../eligible-languages';
import kanjiToHiragana from './kanji-to-hiragana';

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
      let phonetic;
      if (language === languageKey.japanese) {
        phonetic = await kanjiToHiragana({ sentence: word });
      }
      return { definition, transliteration: finalTransliteration, phonetic };
    } else {
      throw new Error(`No viable language key found for ${language}`);
    }
  } catch (error) {
    throw new Error(error || 'Error getting google translation');
  }
};

export { getGoogleTranslate };
