import { body } from 'express-validator';
import {
  updateWordObj,
  wordKeysRouteValidationArr,
} from '../body-validation-types';
import { languageValidation } from '../../route-validation/check-mandatory-language';

const updateWordValidation = [
  ...languageValidation,
  body(updateWordObj.wordId)
    .notEmpty()
    .isString()
    .withMessage('wordId is required for an update'),
  body(updateWordObj.fieldToUpdate).custom((value) => {
    if (!value || typeof value !== 'object') {
      throw new Error(
        `fieldToUpdate must be an object of: 
        ${wordKeysRouteValidationArr.join(', ')}`,
      );
    }

    const hasValidField = Object.keys(value).some((key) =>
      wordKeysRouteValidationArr.includes(key),
    );
    if (!hasValidField) {
      throw new Error(
        `fieldToUpdate must contain at least one of the following: ${wordKeysRouteValidationArr.join(
          ', ',
        )}`,
      );
    }

    return true;
  }),
];

export { updateWordValidation };
