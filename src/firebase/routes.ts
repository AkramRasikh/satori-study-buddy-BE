import { Request, Response } from 'express';
import { addEntry, addJapaneseWord, getFirebaseContent } from './init';
import {
  japaneseContent,
  japaneseSentences,
  japaneseWords,
  satoriContent,
} from './refs';

const firebaseRoutes = (app) => {
  app.post('/update-content', async (req: Request, res: Response) => {
    const ref = req.body?.ref;
    const contentEntry = req.body?.contentEntry;
    try {
      await addEntry({ ref, contentEntry });
      res
        .status(200)
        .json({ message: 'Successfully updated entry', contentEntry });
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  app.post('/add-word', async (req: Request, res: Response) => {
    const word = req.body?.word;
    const contexts = req.body?.contexts;
    try {
      const resStatus = await addJapaneseWord({ word, contexts });
      if (resStatus === 409) {
        console.log('## 1');
        return res.status(409).json({ message: 'Entry already exists', word });
      }
      if (resStatus === 200) {
        res.status(200).json({ message: 'Successfully added entry', word });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to add item', word: req.body?.word });
    }
  });

  app.post('/firebase-data', async (req: Request, res: Response) => {
    const ref = req.body?.ref;

    if (
      !(
        ref === japaneseContent ||
        ref === japaneseWords ||
        ref === satoriContent ||
        ref === japaneseSentences
      )
    ) {
      res.status(500).json({ error: `Wrong ref added ${ref}` });
    }
    try {
      const data = await getFirebaseContent({ ref });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
};

export { firebaseRoutes };
