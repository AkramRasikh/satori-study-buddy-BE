import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { fetchMixMatchJsonData } from './mix-match';
import { combineFromYoutubeSRTData, combineSRTData } from './combine-srt-data';
import { japaneseSongs } from '../firebase/refs';
import { addLyricsToFirestore, uploadBufferToFirebase } from '../firebase/init';
import { extractYoutubeAudio } from './extract-youtube-audio';
import { extractSrtData } from './extract-srt-data';

const folderPath = 'japanese-songs';

const bilingualContentRoutes = (app) => {
  app.post('/combine-with-url', async (req: Request, res: Response) => {
    const title = req?.body?.title;
    const youtubeId = req?.body?.youtubeId;
    const targetLang = req?.body?.targetLang || 'ja';
    const outputDir = path.join(__dirname, 'output');

    const url = 'https://www.youtube.com/watch?v=' + youtubeId;

    try {
      const buffer = await extractYoutubeAudio({ url, title });
      console.log('## extracted video');
      const englishContent = await extractSrtData({ youtubeId, lang: 'en' });
      console.log('## extracted english Subs');
      const japaneseContent = await extractSrtData({
        youtubeId,
        lang: targetLang,
      });
      console.log('## extracted target lang subs');
      const japaneseSongContentEntry = await combineFromYoutubeSRTData({
        title,
        englishSRT: englishContent,
        japaneseSRT: japaneseContent,
      });
      console.log('## combined subs');
      await uploadBufferToFirebase({
        buffer,
        filePath: folderPath + '/' + title + '.mp3',
      });
      console.log('## uploading to firestore');
      await addLyricsToFirestore({
        ref: japaneseSongs,
        contentEntry: japaneseSongContentEntry,
      });
      res.send(japaneseSongContentEntry).status(200);
    } catch (error) {
      console.log('## Error combine-with-url: ', error);
      res.send().status(401);
    } finally {
      if (fs.existsSync(outputDir)) {
        await fs.rm(outputDir, (res) => {
          console.log('## remove output res', res);
        });
      }
    }
  });
  app.post('/combine', async (req: Request, res: Response) => {
    const title = req?.body?.title;

    const japaneseSongContentEntry = await combineSRTData({ title });
    await addLyricsToFirestore({
      ref: japaneseSongs,
      contentEntry: japaneseSongContentEntry,
    });
    res.send(japaneseSongContentEntry).status(200);
  });

  app.post('/get-lyrics', async (req: Request, res: Response) => {
    const url = req?.body?.url;
    const title = req?.body?.title;
    const japaneseSongContentEntry = await fetchMixMatchJsonData({
      url,
      title,
    });

    // await addLyricsToFirestore({
    //   ref: japaneseSongs,
    //   contentEntry: japaneseSongContentEntry,
    // });
    res.send(japaneseSongContentEntry).status(200);
  });
};

export { bilingualContentRoutes };
