import { body } from 'express-validator';
import { languageValidation } from '../../route-validation/check-mandatory-language';

const contentPrefix = 'content';

const netflix = 'netflix';
const youtube = 'youtube';

const mediaContent = [netflix, youtube];

const contentKeys = {
  title: `${contentPrefix}.title`,
  content: `${contentPrefix}.content`,
  //
  hasAudio: `${contentPrefix}.hasAudio`,
  origin: `${contentPrefix}.origin`,
  url: `${contentPrefix}.url`,
  interval: `${contentPrefix}.interval`,
};
const addContentValidation = [
  ...languageValidation,
  body(contentKeys.title)
    .notEmpty()
    .isString()
    .withMessage('Content needs a title'),
  body(contentKeys.content)
    .notEmpty()
    .withMessage('Content needs a content property string[]')
    .isArray({ min: 1 })
    .withMessage('Content needs to have some sentences inside'),
  //
  body(contentKeys.hasAudio)
    .optional()
    .isBoolean()
    .withMessage('hasAudio should be a boolean'),
  body(contentKeys.origin)
    .optional()
    .isString()
    .withMessage(`origin should be one of: ${mediaContent.join(', ')}`),
  body(contentKeys.url)
    .optional()
    .isString()
    .withMessage('url should be a string'),
  body(contentKeys.interval)
    .optional()
    .isNumeric()
    .withMessage('interval should be a number'),
];

export { addContentValidation };
