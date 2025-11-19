import { Express } from 'express';
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

const firebaseRoutes = (app: Express) => {
  app.post('/add-content', addContentValidation, addContent);
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
};

export { firebaseRoutes };
