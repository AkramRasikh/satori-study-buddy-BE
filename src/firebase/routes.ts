import { Request, Response, Express } from 'express';
import { addMyGeneratedContent } from './init';
import { content, words, sentences } from './refs';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';
import { addContent } from './add-content/route';
import { addContentValidation } from './add-content/validation';
import { updateContentMetaData } from './update-content-review/route';
import { updateContentMetaDataValidation } from './update-content-review/validation';
import { updateSentence } from './update-sentence/route';
import { updateSentenceValidation } from './update-sentence/validation';
import { deleteAllContent, deleteContent } from './delete-content/route';
import {
  deleteAllContentValidation,
  deleteContentValidation,
} from './delete-content/validation';
import { updateSentenceReview } from './update-sentence-review/route';
import { updateSentenceReviewValidation } from './update-sentence-review/validation';
import {
  updateSentenceReviewBulkAllValidation,
  updateSentenceReviewBulkValidation,
} from './update-sentence-bulk/validation';
import {
  updateSentenceBulk,
  updateSentenceBulkAll,
} from './update-sentence-bulk/route';
import { baseRoute } from '../shared-express-utils/base-route';
import { addWordContext } from './add-word-context/route';
import { addWordContextValidation } from './add-word-context/validation';

const firebaseRoutes = (app: Express) => {
  app.post('/add-content', addContentValidation, addContent);
  app.post(
    '/add-word-context',
    addWordContextValidation,
    baseRoute,
    addWordContext,
  );
  app.post(
    '/update-content',
    updateContentMetaDataValidation,
    updateContentMetaData,
  );
  app.post('/update-sentence', updateSentenceValidation, updateSentence);
  app.post('/delete-content', deleteContentValidation, deleteContent);
  app.post('/delete-all-content', deleteAllContentValidation, deleteAllContent);
  app.post(
    '/update-sentence-review',
    updateSentenceReviewValidation,
    updateSentenceReview,
  );
  app.post(
    '/sentence-review-bulk',
    updateSentenceReviewBulkValidation,
    updateSentenceBulk,
  );
  app.post(
    '/remove-all-content-review',
    updateSentenceReviewBulkAllValidation,
    updateSentenceBulkAll,
  );

  app.post(
    '/add-my-generated-content',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const ref = req.body?.ref;
      const language = req.body?.language;
      const contentEntry = req.body?.contentEntry;
      const allowedRefs = [content, words, sentences];
      if (!allowedRefs.includes(ref)) {
        res.status(500).json({ error: `Wrong ref added ${ref}` });
      }
      try {
        const data = await addMyGeneratedContent({
          ref,
          language,
          contentEntry,
        });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error });
      }
    },
  );
};

export { firebaseRoutes };
