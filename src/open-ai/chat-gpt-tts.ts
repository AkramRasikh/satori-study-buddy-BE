import fs from 'fs';
import path from 'path';

import OpenAI from 'openai';

interface ChatGPTTextToSpeechParams {
  sentence: string;
  id: string;
  sessionKey: string;
}

const chatGPTTextToSpeech = async ({
  id,
  sentence,
  sessionKey,
}: ChatGPTTextToSpeechParams) => {
  const openai = new OpenAI({
    apiKey: sessionKey,
  });
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: sentence,
    });

    const nameToSaveUnder = id || sentence;

    const buffer = Buffer.from(await mp3.arrayBuffer());

    const speechFile = path.resolve('public/audio/' + nameToSaveUnder + '.mp3');
    await fs.promises.writeFile(speechFile, buffer);
    const audioDirectoryPath = path.join(process.cwd(), 'public', 'audio');

    const availableMP3Files = await fs.promises.readdir(audioDirectoryPath);

    return availableMP3Files;
  } catch (error) {
    console.error('Error:', error);
    return error;
  }
};

export default chatGPTTextToSpeech;
