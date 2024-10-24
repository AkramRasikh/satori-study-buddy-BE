import OpenAI from 'openai';
import config from '../../config';

interface chatGPTTranslatorParams {
  prompt: string;
  model: string;
}

const chatGPTTranslator = async ({
  model,
  prompt,
}: chatGPTTranslatorParams) => {
  const openai = new OpenAI({
    apiKey: config.openAIKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model,
    });

    const content = completion.choices[0].message.content;

    const parsed = JSON.parse(content);
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
