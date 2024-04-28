import OpenAI from 'openai';

const chatGptTextAPI = async (
  textContent: string,
  model: string = 'gpt-3.5-turbo',
  sessionKey: string,
) => {
  const openai = new OpenAI({
    apiKey: sessionKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: textContent,
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
