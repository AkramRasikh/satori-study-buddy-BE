import { Request, Response } from 'express';
import { fetchMixMatchJsonData } from './mix-match';
import { combineSRTData } from './combine-srt-data';
import { japaneseSongs } from '../firebase/refs';
import { addLyricsToFirestore } from '../firebase/init';

const bilingualContentRoutes = (app) => {
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
