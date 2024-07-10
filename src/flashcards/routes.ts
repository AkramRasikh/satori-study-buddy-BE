import { Request, Response } from 'express';
// import { getJapaneseContent, getJapaneseSongs, getJapaneseWords } from '.';
import { getJapaneseWords } from '.';

const flashcardRoutes = async (app) => {
  app.get('/get-japanese-words', async (req: Request, res: Response) => {
    try {
      const japaneseWordsRes = await getJapaneseWords();
      // const japaneseContentRes = await getJapaneseContent();
      // const japaneseSongsRes = await getJapaneseSongs()

      res.send(japaneseWordsRes).status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });
};

export { flashcardRoutes };
