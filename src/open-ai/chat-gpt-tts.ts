import { uploadBufferToFirebase } from '../firebase/init';

import OpenAI from 'openai';
import { getAudioFolderViaLang } from '../utils/get-audio-folder-via-language';

interface ChatGPTTextToSpeechParams {
  sentence: string;
  id: string;
  language: string;
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
  language,
}: ChatGPTTextToSpeechParams) => {
  const getRandomVoice = () => {
    const randomIndex = Math.floor(Math.random() * japaneseVoices.length);
    console.log('## voice selected: ', japaneseVoices[randomIndex]);
    return japaneseVoices[randomIndex] as string;
  };
  const openAIKey = process.env.OPENAI_API_KEY;

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
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const formattedFirebaseName =
      getAudioFolderViaLang(language) + '/' + nameToSaveUnder + '.mp3';

    await uploadBufferToFirebase({
      buffer,
      filePath: formattedFirebaseName,
    });

    return nameToSaveUnder;
  } catch (error) {
    console.error('## chatGPTTextToSpeech:', error);
    return error;
  }
};

export default chatGPTTextToSpeech;
