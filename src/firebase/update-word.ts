import { Request, Response } from 'express';
import { getContentTypeSnapshot } from '../utils/get-content-type-snapshot';
import { getRefPath } from '../utils/get-ref-path';
import { db } from './init';
import { words } from './refs';
import { defaultLanguageErrorMsg } from '../route-validation/check-mandatory-language';
import { body, validationResult } from 'express-validator';
import { eligibleLanguages } from '../eligible-languages';
import { wordKeysRouteValidation } from './types';
import {
  getThisItemsIndex,
  getThisItemsViaValues,
} from '../utils/get-this-items-index';

const updateWordValidation = [
  body('wordId')
    .notEmpty()
    .isString()
    .withMessage('wordId is required for an update'),
  body('language')
    .notEmpty()
    .withMessage('Language is required')
    .isIn(eligibleLanguages)
    .withMessage(defaultLanguageErrorMsg),
  body('fieldToUpdate').custom((value) => {
    if (!value || typeof value !== 'object') {
      throw new Error(
        `fieldToUpdate must be an object of: 
        ${wordKeysRouteValidation.join(', ')}`,
      );
    }

    const hasValidField = Object.keys(value).some((key) =>
      wordKeysRouteValidation.includes(key),
    );
    if (!hasValidField) {
      throw new Error(
        `fieldToUpdate must contain at least one of the following: ${wordKeysRouteValidation.join(
          ', ',
        )}`,
      );
    }

    return true;
  }),
];

const updateFirebaseStore = async ({ language, indexKey, fieldToUpdate }) => {
  const refPath = getRefPath({ language, ref: words });
  const refObj = db.ref(refPath);
  const wordObjectRef = refObj.child(indexKey);
  await wordObjectRef.update(fieldToUpdate);
  return fieldToUpdate;
};

const updateWordBusinessLogic = async ({ id, language, fieldToUpdate }) => {
  try {
    const snapshotArr = await getContentTypeSnapshot({
      language,
      ref: words,
      db,
    });

    const indexKey = getThisItemsIndex({ snapshotArr, id });

    if (isFinite(indexKey)) {
      await updateFirebaseStore({
        language,
        indexKey: indexKey.toString(),
        fieldToUpdate,
      });
      return fieldToUpdate;
    }

    const { keys, index } = getThisItemsViaValues({ snapshotArr, id });

    if (index !== -1) {
      const indexViaValues = keys[index];
      await updateFirebaseStore({
        language,
        indexKey: indexViaValues,
        fieldToUpdate,
      });
      return fieldToUpdate;
    } else {
      throw new Error('Word not found in DB');
    }
  } catch (error) {
    throw new Error('Error querying firebase DB (words)');
  }
};

const updateWord = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { wordId, language, fieldToUpdate } = req.body;

  try {
    const fieldToUpdateRes = await updateWordBusinessLogic({
      language,
      id: wordId,
      fieldToUpdate,
    });
    if (fieldToUpdateRes) {
      res.status(200).json(fieldToUpdateRes);
    } else {
      res.status(400).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error updating word' });
  }
};

export { updateWord, updateWordValidation };
