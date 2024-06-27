import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import kanjiToHiragana from '../language-script-helpers/kanji-to-hiragana';

function srtTimestampToSeconds(timestamp) {
  const parts = timestamp.split(/[:,]/);
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  const milliseconds = parseInt(parts[3], 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}
const everything = async () => {
  // Function to read SRT file and return content as string
  function readSRTFile(filename) {
    const filenamePath = path.resolve(__dirname, filename);

    if (fs.existsSync(filenamePath)) {
      const data = fs.readFileSync(filenamePath, 'utf8');
      console.log('File content:', data);
      return data;
    } else {
      console.error(`File ${filename} not found.`);
    }
  }

  const englishSRT = readSRTFile('./english.srt');
  const japaneseSRT = readSRTFile('./japanese.srt');

  // Function to parse SRT content and generate array of subtitle objects
  const parseSRT = (srtContent, lang) => {
    const lines = srtContent?.trim().split(/\n\s*\n/); // Split by double newline to get each subtitle block

    return lines.map((block) => {
      const lines = block.trim().split('\n');
      const id = lines[0].trim(); // First line is the ID
      const [startAt, endAt] = lines[1].trim().split(' --> '); // Second line contains timestamps

      // Convert timestamps to seconds

      const startSeconds = srtTimestampToSeconds(startAt);
      const endSeconds = srtTimestampToSeconds(endAt);

      // Join remaining lines as subtitle text
      const text = lines.slice(2).join('\n').trim();

      console.log('## lang: ', { lang });

      return {
        id: generateID(), // Generate or assign an ID
        baseLang: lang === 'english' ? text : '', // Assign English translation
        targetLanguage: lang === 'japanese' ? text : '', // Assign Japanese translation
        startAt: startSeconds,
        endAt: endSeconds,
      };
    });
  };

  // Dummy function to generate an ID (you can replace this with your own logic)
  const generateID = () => {
    // Example of generating a random ID (not recommended for production)
    return Math.random().toString(36).substr(2, 9);
  };

  // Example usage:
  const englishSubtitles = parseSRT(englishSRT, 'english');
  const japaneseSubtitles = parseSRT(japaneseSRT, 'japanese');

  // // Combine both arrays (assuming they have the same length)
  const combinedSubtitles = await Promise.all(
    englishSubtitles.map(async (item, index) => ({
      id: item.id,
      baseLang: item.baseLang,
      targetLanguage: japaneseSubtitles[index].targetLanguage,
      kanjiFree: await kanjiToHiragana({
        sentence: japaneseSubtitles[index].targetLanguage,
      }),
      startAt: item.startAt,
      endAt: item.endAt,
    })),
  );

  return combinedSubtitles;
};
const bilingualContentRoutes = (app) => {
  app.get('/combine', async (req: Request, res: Response) => {
    const combinedSubtitles = await everything();
    res.send(combinedSubtitles).status(200);
  });
};

export { bilingualContentRoutes };
