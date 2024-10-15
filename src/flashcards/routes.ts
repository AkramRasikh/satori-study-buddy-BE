import { Request, Response } from 'express';
import {
  getJapaneseWordsViaSong,
  getJapaneseWordsViaTopic,
  getTopicsWithFlashWordsToStudy,
} from '.';

const flashcardRoutes = async (app) => {
  app.get('/topics-to-study', async (req: Request, res: Response) => {
    try {
      const topicsWithFlashWordsToStudy =
        await getTopicsWithFlashWordsToStudy();
      res.send(topicsWithFlashWordsToStudy).status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });

  app.post('/get-japanese-words-topic', async (req: Request, res: Response) => {
    const topic = req.body?.topic;
    try {
      const thisTopicsWords = await getJapaneseWordsViaTopic({ topic });
      res.send(thisTopicsWords).status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });

  app.post('/get-japanese-words-song', async (req: Request, res: Response) => {
    const topic = req.body?.topic;
    try {
      const thisTopicsWords = await getJapaneseWordsViaSong({ topic });
      res.send(thisTopicsWords).status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });
};

export { flashcardRoutes };
