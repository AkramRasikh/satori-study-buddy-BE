import OpenAI from 'openai';

interface chatGPTTranslatorParams {
  word: string;
  model: string;
  openAIKey: string;
  context?: string;
}

const jsonFormatBasicExample = {
  definition: 'beans, bean, peas',
  transliteration: 'Mame',
  note: '豆',
  baseForm: '豆',
  surfaceForm: '豆',
  notes: '',
};

const jsonFormatVerbExample = {
  baseForm: '彷徨う',
  surfaceForm: '彷徨って',
  definition: 'to wander or to roam',
  transliteration: 'samayou',
  phonetic: 'さまよう',
  notes:
    'By itself, 彷徨 (ほうこう, hōkō) means "wandering" or "roaming." It describes the state of wandering aimlessly, much like the verb 彷徨う (samayou), but in its noun form.',
};

const baseFormPrompt =
  'baseForm: Give me the base form of the word provided. For example the base form (infinite form) of 泳げます is 泳ぐ. If possible, also do this when multiple verbs are used together for example 勉強して遊びたい => 勉強して遊ぶ. However, if this detracts from the meaning then leave it as the surface level provided i.e. 勉強して遊びたい. If it is a phrase then leave it as it is for example じゃあいってきます can be left as it is.';
const notePrompt =
  'notes: This is a field to mention anything nuanced happening in the language that may be missed. For example 彷徨う is pronounced ‘samayou’ but 彷徨 is pronounced ‘hōkō’. Anything that may be relevant to the learner given the word, it’s use in the context provided and how the word maybe used in another context would be useful';

const formatTranslationPrompt = (japaneseWord, context) => {
  return `
  Translate the below word from Japanese to english given the context.
  I want the definition, transliteration, a baseForm and notes section.

  ${JSON.stringify(baseFormPrompt)}
  ${JSON.stringify(notePrompt)}

  For example, given 豆 I want the return object:

  ${JSON.stringify(jsonFormatBasicExample)}

  A more comprehensive example for ${
    jsonFormatVerbExample.surfaceForm
  } I want the return object: 

  ${JSON.stringify(jsonFormatVerbExample)}

  NOTE: this is an integration so only the above is indeed as a response.

  Word to translate: ${japaneseWord}
  Context in which the word is used ${context}
`;
};

const chatGPTTranslator = async ({
  word,
  model,
  openAIKey,
  context,
}: chatGPTTranslatorParams) => {
  const openai = new OpenAI({
    apiKey: openAIKey,
  });

  const formattedTranslationPrompt = formatTranslationPrompt(word, context);

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: formattedTranslationPrompt,
        },
      ],
      model,
    });

    const content = completion.choices[0].message.content;

    const parsed = JSON.parse(content);

    return parsed;
  } catch (error) {
    console.log('## Error OpenAI: ', error);
  }
};

export { chatGPTTranslator };
