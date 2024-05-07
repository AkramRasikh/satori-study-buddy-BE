import fs from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import fetch from 'node-fetch'; // or import axios from 'axios';

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

const getRandomVoice = () => {
  const randomIndex = Math.floor(Math.random() * japaneseVoices.length);
  return japaneseVoices[randomIndex];
};

const narakeetAudio = async ({ sentence, apiKey, id, voice }) => {
  const nameToSaveUnder = id || sentence;
  const speechFile = path.resolve('public/audio/' + nameToSaveUnder + '.mp3');
  const voiceSelected = voice || getRandomVoice();

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

    await pipeline(
      Readable.from(await response.buffer()), // or response.arrayBuffer() if using axios
      createWriteStream(speechFile),
    );

    console.log('File saved successfully: ', { sentence, voiceSelected });
    const audioDirectoryPath = path.join(process.cwd(), 'public', 'audio');
    const availableMP3Files = await fs.promises.readdir(audioDirectoryPath);
    return availableMP3Files;
  } catch (error) {
    console.error('Error occurred:', error);
    return error;
  }
};

export default narakeetAudio;
