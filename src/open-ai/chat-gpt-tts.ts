import { uploadBufferToFirebase } from '../firebase/init';

import OpenAI from 'openai';

interface ChatGPTTextToSpeechParams {
  sentence: string;
  id: string;
  openAIKey: string;
}

const folderPath = 'japanese-audio';

const japaneseVoices = [
  'alloy',
  'echo',
  'onyx',
  'shimmer',
  'fable',
  'fable',
  'fable',
  'nova',
  'nova',
  'nova',
];

const chatGPTTextToSpeech = async ({
  id,
  sentence,
  openAIKey,
}: ChatGPTTextToSpeechParams) => {
  const getRandomVoice = () => {
    const randomIndex = Math.floor(Math.random() * japaneseVoices.length);
    console.log('## voice selected: ', japaneseVoices[randomIndex]);
    return japaneseVoices[randomIndex] as string;
  };
  const openai = new OpenAI({
    apiKey: openAIKey,
  });
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: getRandomVoice() as any,
      input: sentence,
    });

    const nameToSaveUnder = id || sentence;

    const fileNameWithMP3Ending = nameToSaveUnder + '.mp3';
    const buffer = Buffer.from(await mp3.arrayBuffer());

    await uploadBufferToFirebase({
      buffer,
      filePath: folderPath + '/' + fileNameWithMP3Ending,
    });

    return nameToSaveUnder;
  } catch (error) {
    console.error('## chatGPTTextToSpeech:', error);
    return error;
  }
};

export default chatGPTTextToSpeech;
