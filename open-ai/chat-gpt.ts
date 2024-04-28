import OpenAI from 'openai';

interface chatGptTextAPIParams {
  sentence: string;
  model: string;
  sessionKey: string;
}

const chatGptTextAPI = async ({
  sentence,
  model,
  sessionKey,
}: chatGptTextAPIParams) => {
  const openai = new OpenAI({
    apiKey: sessionKey,
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
    return content;
  } catch (error) {
    console.log('## Error OpenAI: ', error);
  }
};

export default chatGptTextAPI;
