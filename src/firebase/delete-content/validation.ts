import { body } from 'express-validator';
import { languageValidation } from '../../route-validation/check-mandatory-language';

const deleteContentKey = {
  title: 'title',
};

const deleteContentValidation = [
  ...languageValidation,
  body(deleteContentKey.title)
    .notEmpty()
    .isString()
    .withMessage(
      `Validation error passing ${deleteContentKey.title} to delete content`,
    ),
];

const deleteAllContentValidation = [
  ...languageValidation,
  body('url')
    .notEmpty()
    .isString()
    .withMessage(`Validation error passing url to delete content`),
];

export { deleteContentValidation, deleteAllContentValidation };
