import OpenAI from 'openai';

interface chatGPTTranslatorParams {
  word: string;
  model: string;
  openAIKey: string;
}

const jsonFormat = {
  definition: 'beans, bean, peas',
  transliteration: 'Mame',
};

const formatTranslationPrompt = (japaneseWord) => {
  return `
  Translate the below word from Japanese to english given the context.
  I want the definition and the transliteration.
  For example, given 豆 I want the return object:

  ${JSON.stringify(jsonFormat)}

  NOTE: this is an integration so only the above is indeed as a response.

  Word to translate: ${japaneseWord}
`;
};

const chatGPTTranslator = async ({
  word,
  model,
  openAIKey,
}: chatGPTTranslatorParams) => {
  const openai = new OpenAI({
    apiKey: openAIKey,
  });

  const formattedTranslationPrompt = formatTranslationPrompt(word);

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

    console.log('## chatGPTTranslator 1', { completion });

    const content = completion.choices[0].message.content;
    console.log('## chatGPTTranslator 2', { content });

    const parsed = JSON.parse(content);
    console.log('## chatGPTTranslator 3', { parsed });

    return parsed;
  } catch (error) {
    console.log('## Error OpenAI: ', error);
  }
};

export { chatGPTTranslator };
