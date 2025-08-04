import OpenAI from 'openai';

interface chatGptTextAPIParams {
  sentence: string;
  model: string;
  openAIKey: string;
}

const chatGptTextAPI = async ({
  sentence,
  model,
  openAIKey,
}: chatGptTextAPIParams) => {
  const openai = new OpenAI({
    apiKey: openAIKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates natural and fluent Japanese sentences based on English instructions.',
        },
        {
          role: 'user',
          content: sentence,
        },
      ],
      model: 'gpt-4o-mini',
    });

    const content = completion.choices[0].message.content;

    const parsed = JSON.parse(content);

    return parsed;
  } catch (error) {
    console.log('## Error OpenAI: ', error);
    throw error;
  }
};

export const deepSeekChatAPI = async ({
  sentence,
  model,
  openAIKey,
}: chatGptTextAPIParams) => {
  const openai = new OpenAI({
    apiKey: openAIKey,
    // baseURL: 'https://api.deepseek.com/v1',
  });

  const systemPrompt = `You are a bilingual tutor. You will be given Japanese words and asked to build a short sentence using them. Your job is to return a structured JSON object containing the Japanese sentence, its English translation, and helpful notes for learners.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: sentence,
        },
      ],
      model,
    });

    const content = completion.choices[0].message.content;
    const cleanedContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanedContent);

    return parsed;
  } catch (error) {
    console.log('## Error DeepSeek: ', error);
    throw error;
  }
};

export default chatGptTextAPI;
