import { Request, Response } from 'express';
import getSatoriCardsInBulk from './bulk-cards';
import satoriFlashcard from './flashcard';
import {
  japaneseContent,
  japaneseSentences,
  japaneseWords,
  satoriContent,
} from '../firebase/refs';
import { structureSatoriFlashcards } from './structure-satori-data';
import { addToSatori, getFirebaseContent } from '../firebase/init';

const satoriRoutes = (app) => {
  app.post('/satori-flashcard', async (req: Request, res: Response) => {
    const sessionToken = req.body?.sessionToken;
    const flashCardDifficulty = req.body?.flashCardDifficulty;
    const cardId = req.body?.cardId;

    try {
      const flashcardResponseSuccess = await satoriFlashcard({
        sessionToken,
        flashCardDifficulty,
        cardId,
      });

      if (flashcardResponseSuccess) {
        // send text too?
        res.status(200).json({ cardId });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  app.post('/satori-data-with-fb', async (req: Request, res: Response) => {
    const ref = req.body?.ref;
    const sessionToken = req.body?.sessionToken;

    try {
      const satoriResponse = await getSatoriCardsInBulk({
        isDueAndAuto: true,
        sessionToken,
      });

      const data = await satoriResponse.json();

      const satoriData = await Promise.all(
        await structureSatoriFlashcards(data.result, sessionToken),
      );

      const satoriContentInFirebase = await getFirebaseContent({ ref });

      let contextIds = [];

      satoriData.forEach((item) => {
        const textWithKanji = item.textWithKanji;

        satoriContentInFirebase?.forEach((fireBaseItem) => {
          if (
            fireBaseItem?.matchedWords?.includes(textWithKanji) &&
            !contextIds.includes(fireBaseItem.id)
          ) {
            contextIds.push(fireBaseItem.id);
          }
        });
      });

      const contextHelperData =
        satoriContentInFirebase?.filter((item) =>
          contextIds?.includes(item.id),
        ) || [];

      res.status(200).json({ satoriData, contextHelperData });
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  app.post('/satori-content-add', async (req: Request, res: Response) => {
    const ref = req.body?.ref;
    const contentEntry = req.body?.contentEntry;
    const allowedRefs = [
      japaneseContent,
      japaneseWords,
      satoriContent,
      japaneseSentences,
    ];
    if (!allowedRefs.includes(ref)) {
      res.status(500).json({ error: `Wrong ref added ${ref}` });
    }
    try {
      const data = await addToSatori({ ref, contentEntry });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
};

export { satoriRoutes };
