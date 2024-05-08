import { Readable } from 'stream';
import fetch from 'node-fetch'; // or import axios from 'axios';
import { uploadBufferToFirebase } from '../firebase/init';

const japaneseVoices = [
  // 'Kasumi',
  // 'Kei',
  // 'Ayami',
  // 'Mariko',
  // 'Takeshi',
  'Yuriko',
  'Kenichi',
  'Takuya',
  'Kaori',
  'Hideaki', // the best!
  'Akira', // nice
  'Tomoka', // nice
  'Kenji', // the best!
  'Kuniko', // the best!
];

const folderPath = 'japanese-audio';

const getRandomVoice = () => {
  const randomIndex = Math.floor(Math.random() * japaneseVoices.length);
  return japaneseVoices[randomIndex];
};

const narakeetAudio = async ({ sentence, apiKey, id, voice }) => {
  const nameToSaveUnder = id || sentence;
  const voiceSelected = voice || getRandomVoice();
  const fileNameWithMP3Ending = nameToSaveUnder + '.mp3';

  try {
    const response = await fetch(
      `https://api.narakeet.com/text-to-speech/mp3?voice=${voiceSelected}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'x-api-key': apiKey,
          Accept: 'application/octet-stream',
        },
        body: sentence,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch MP3: ${response.statusText}`);
    }

    const buffer = Readable.from(await response.buffer()); // or response.arrayBuffer() if using axios

    await uploadBufferToFirebase({
      buffer,
      filePath: folderPath + '/' + fileNameWithMP3Ending,
    });

    console.log('File saved successfully: ', { sentence, voiceSelected });
    return nameToSaveUnder;
  } catch (error) {
    console.error('Error occurred:', error);
    return error;
  }
};

export default narakeetAudio;
