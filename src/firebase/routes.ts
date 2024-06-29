import { Request, Response } from 'express';
import {
  addEntry,
  addJapaneseWord,
  addSnippet,
  getFirebaseContent,
  removeSnippet,
} from './init';
import {
  japaneseContent,
  japaneseContentFullMP3s,
  japaneseSentences,
  japaneseWords,
  satoriContent,
  japaneseSnippets,
} from './refs';

const firebaseRoutes = (app) => {
  app.post('/add-snippet', async (req: Request, res: Response) => {
    const ref = req.body?.ref;
    const contentEntry = req.body?.contentEntry;
    const allowedRefs = [japaneseSnippets];
    if (!allowedRefs.includes(ref)) {
      res.status(500).json({ error: `Wrong ref added ${ref}` });
    }
    try {
      const data = await addSnippet({ ref, contentEntry });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  app.post('/delete-snippet', async (req: Request, res: Response) => {
    const ref = req.body?.ref;
    const contentEntry = req.body?.contentEntry;
    const allowedRefs = [japaneseSnippets];
    if (!allowedRefs.includes(ref)) {
      res.status(500).json({ error: `Wrong ref added ${ref}` });
    }
    try {
      const data = await removeSnippet({ ref, contentEntry });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

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
    console.log('## add-word 0');
    const word = req.body?.word;
    const contexts = req.body?.contexts;
    console.log('## add-word 1', { word, contexts });

    try {
      const japaneseWordRes = await addJapaneseWord({ word, contexts });
      if (japaneseWordRes.status === 409) {
        console.log('## add-word 2');
        return res
          .status(409)
          .json({ message: 'Entry already exists', word: {} });
      }
      if (japaneseWordRes.status === 200) {
        res
          .status(200)
          .json({
            message: 'Successfully added entry',
            word: japaneseWordRes.wordData,
          });
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
        ref === japaneseSentences ||
        ref === japaneseContentFullMP3s ||
        ref === japaneseSnippets
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
