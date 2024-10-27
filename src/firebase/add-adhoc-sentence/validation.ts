import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';
import { validationRouteKeys } from '../body-validation-types';

const addAdhocSentenceKeys = {
  baseLang: 'adhocSentence.baseLang',
  context: 'adhocSentence.context',
  topic: 'topic',
  tags: 'tags',
};

const addAdhocSentenceValidation = [
  checkMandatoryLanguage,
  body(addAdhocSentenceKeys.baseLang).isString().notEmpty(),
  body(addAdhocSentenceKeys.topic).isString().notEmpty(),
  body(addAdhocSentenceKeys.tags).isArray().notEmpty(),
  body(addAdhocSentenceKeys.context).isString().optional(),
  body(validationRouteKeys.reviewData).notEmpty(),
];

export { addAdhocSentenceValidation };
