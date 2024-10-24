import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';
import { validationRouteKeys } from '../body-validation-types';

const updateSentenceReviewValidation = [
  checkMandatoryLanguage,
  body(validationRouteKeys.reviewData).optional(),
  body(validationRouteKeys.nextReview).optional(),
  body(validationRouteKeys.reviewHistory).optional(),
];

export { updateSentenceReviewValidation };
