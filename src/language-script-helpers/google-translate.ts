import { TranslationServiceClient } from '@google-cloud/translate';
import {
  chinese,
  googleLanguagesKey,
  languageKey,
} from '../eligible-languages';
import kanjiToHiragana from './kanji-to-hiragana';
import { pinyin } from 'pinyin-pro';
import config from '../../config';

const translationClient = new TranslationServiceClient({
  credentials: JSON.parse(process.env.GOOGLE_TRANSLATE_ACCOUNT),
});
const getGoogleTranslate = async ({ word, language }) => {
  const fromLanguage = googleLanguagesKey[language];
  const request = {
    parent: `projects/${config.projectId}`,
    contents: [word],
    mimeType: 'text/plain',
    sourceLanguageCode: fromLanguage,
    targetLanguageCode: 'en',
  };

  let phonetic;
  let transliteration;

  try {
    const [translation] = await translationClient.translateText(request);
    const definition = translation.translations[0].translatedText;

    if (language !== chinese) {
      const [romanized] = await translationClient.romanizeText(request);
      transliteration = romanized.romanizations[0].romanizedText;
    } else {
      transliteration = pinyin(word);
    }

    if (language === languageKey.japanese) {
      phonetic = await kanjiToHiragana({ sentence: word });
    }
    return { definition, transliteration, phonetic };
  } catch (error) {
    throw new Error(error || 'Error getting google translation');
  }
};

export { getGoogleTranslate };
