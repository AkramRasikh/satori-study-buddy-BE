import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const addWordKey = {
  word: 'word',
  context: 'context',
  contextSentence: 'contextSentence',
  isGoogle: 'isGoogle',
  reviewData: 'reviewData',
};

const addWordValidation = [
  body(addWordKey.word)
    .notEmpty()
    .isString()
    .withMessage(`Validation error passing ${addWordKey.word} for word`),
  checkMandatoryLanguage,
  body(addWordKey.context)
    .notEmpty()
    .isString()
    .withMessage(`${addWordKey.context} needs to be passed an id (string)`),
  body(addWordKey.contextSentence)
    .notEmpty()
    .isString()
    .withMessage(
      `A ${addWordKey.contextSentence} needs to be passed for translation`,
    ),
  body(addWordKey.isGoogle)
    .optional()
    .isBoolean()
    .withMessage(`A ${addWordKey.isGoogle} should be a boolean`),
  body(addWordKey.reviewData)
    .optional()
    .isObject()
    .withMessage(`A ${addWordKey.reviewData} should be an srs object`),
];

export { addWordValidation };
