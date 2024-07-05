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
    const url = req?.body?.url;
    const title = req?.body?.title;
    const youtubeId = req?.body?.youtubeId;
    const outputDir = path.join(__dirname, 'output');

    try {
      const buffer = await extractYoutubeAudio({ url, title });
      const englishContent = await extractSrtData({ youtubeId, lang: 'en' });
      const japaneseContent = await extractSrtData({ youtubeId, lang: 'ja' });
      const japaneseSongContentEntry = await combineFromYoutubeSRTData({
        title,
        englishSRT: englishContent,
        japaneseSRT: japaneseContent,
      });
      await uploadBufferToFirebase({
        buffer,
        filePath: folderPath + '/' + title + '.mp3',
      });
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
