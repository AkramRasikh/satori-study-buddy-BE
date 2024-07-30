import { Request, Response } from 'express';
import {
  addContentArr,
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
  japaneseSongs,
  tempContent,
} from './refs';
import { updateAndCreateReview } from './update-and-create-review';
import { updateContentItem } from './update-content-item';

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

    if (japaneseContent !== ref) {
      res.status(500).json({ error: `Wrong ref added ${ref}` });
      return;
    }
    try {
      await addContentArr({ ref, contentEntry });
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
      const japaneseWordRes = await addJapaneseWord({ word, contexts });
      if (japaneseWordRes.status === 409) {
        return res
          .status(409)
          .json({ message: 'Entry already exists', word: {} });
      }
      if (japaneseWordRes.status === 200) {
        res.status(200).json({
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
        ref === japaneseSongs ||
        ref === satoriContent ||
        ref === japaneseSentences ||
        ref === japaneseContentFullMP3s ||
        ref === japaneseSnippets ||
        ref === tempContent
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

  app.post('/update-review', async (req: Request, res: Response) => {
    const ref = req.body?.ref;
    const contentEntry = req.body?.contentEntry;
    const fieldToUpdate = req.body?.fieldToUpdate;

    try {
      const fieldToUpdateRes = await updateAndCreateReview({
        ref,
        contentEntry,
        fieldToUpdate,
      });
      if (fieldToUpdateRes) {
        res.status(200).json(fieldToUpdateRes);
      } else {
        res.status(400).json({ message: 'Not found' });
      }
    } catch (error) {
      res.status(400).json();
      console.log('## /update-review Err', { error });
    }
  });

  app.post('/update-content-item', async (req: Request, res: Response) => {
    const sentenceId = req.body?.sentenceId;
    const topicName = req.body?.topicName;
    const fieldToUpdate = req.body?.fieldToUpdate;

    try {
      const fieldToUpdateRes = await updateContentItem({
        sentenceId,
        topicName,
        fieldToUpdate,
      });
      if (fieldToUpdateRes) {
        res.status(200).json(fieldToUpdateRes);
      } else {
        res.status(400).json({ message: 'Not found' });
      }
    } catch (error) {
      res.status(400).json();
      console.log('## /update-review Err', { error });
    }
  });

  app.post('/firebase-data-mobile', async (req: Request, res: Response) => {
    const refs = req.body?.refs;

    // filter
    const isValidRef = (ref) => {
      if (
        ref === japaneseContent ||
        ref === japaneseWords ||
        ref === japaneseSongs ||
        ref === satoriContent ||
        ref === japaneseSentences ||
        ref === japaneseContentFullMP3s ||
        ref === japaneseSnippets ||
        ref === tempContent
      ) {
        return true;
      }
      return false;
    };

    const validRefs = refs.filter(isValidRef);

    const getFirebaseDataMap = async () => {
      return await Promise.all(
        validRefs.map(async (ref) => {
          return { [ref]: await getFirebaseContent({ ref }) };
        }),
      );
    };

    try {
      const data = await getFirebaseDataMap();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
};

export { firebaseRoutes };
