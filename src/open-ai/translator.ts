import OpenAI from 'openai';
import { japaneseformatTranslationPrompt } from './open-ai-translate-prompts/japanese';
import { FirebaseCoreQueryParams } from '../firebase/types';
import { languageKey } from '../eligible-languages';
import { chineseformatTranslationPrompt } from './open-ai-translate-prompts/chinese';

interface chatGPTTranslatorParams {
  word: string;
  language: string;
  context?: string;
}

interface GetThisLanguagePromptTypes {
  word: string;
  language: FirebaseCoreQueryParams['language'];
  context: string;
}

const getThisLanguagePrompt = ({
  word,
  language,
  context,
}: GetThisLanguagePromptTypes) => {
  if (language === languageKey.japanese) {
    return japaneseformatTranslationPrompt(word, context);
  } else if (language === languageKey.chinese) {
    return chineseformatTranslationPrompt(word, context);
  }
  throw new Error('Error matching language keys for prompt');
};

const chatGPTTranslator = async ({
  word,
  context,
  language,
}: chatGPTTranslatorParams) => {
  const deepseekKey = process.env.DEEPSEEK_KEY;
  const openai = new OpenAI({
    apiKey: deepseekKey,
    baseURL: 'https://api.deepseek.com/v1',
  });

  const formattedTranslationPrompt = getThisLanguagePrompt({
    word,
    context,
    language,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: formattedTranslationPrompt,
        },
      ],
      model: 'deepseek-chat',
    });

    const content = completion.choices[0].message.content;
    const cleanedContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanedContent);
    return parsed;
  } catch (error) {
    const message = error?.message;
    const tooManyRequestsOrVerifyIssues =
      message?.includes('quota') || message?.includes('Quota');
    if (tooManyRequestsOrVerifyIssues) {
      throw new Error('Open AI quota error');
    }
    throw new Error('Error using OpenAI translation');
  }
};

export { chatGPTTranslator };
