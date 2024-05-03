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
          role: 'user',
          content: sentence,
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

export default chatGptTextAPI;
