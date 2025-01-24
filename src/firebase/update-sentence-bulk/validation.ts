import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const fieldToUpdatePrefix = 'fieldToUpdate';
const updateSentenceBulkReviewRouteValidationObj = {
  title: 'title',
  removeReview: 'removeReview',
  reviewData: `${fieldToUpdatePrefix}.reviewData`,
};
const updateSentenceBulkReviewRouteValidationReviewData = {
  reviewData: `${fieldToUpdatePrefix}.reviewData`,
};
const updateSentenceBulkReviewRouteValidationArr = Object.keys(
  updateSentenceBulkReviewRouteValidationReviewData,
);

const updateFieldForContentValidation = (value: object) => {
  if (!value || typeof value !== 'object') {
    throw new Error(
      `${fieldToUpdatePrefix} must be an object of: 
      ${updateSentenceBulkReviewRouteValidationArr.join(', ')}`,
    );
  }

  const hasValidField = Object.keys(value).some((key) =>
    updateSentenceBulkReviewRouteValidationArr.includes(key),
  );
  if (!hasValidField) {
    throw new Error(
      `${fieldToUpdatePrefix} must contain at least one of the following: ${updateSentenceBulkReviewRouteValidationArr.join(
        ', ',
      )}`,
    );
  }

  return true;
};

const updateSentenceReviewBulkValidation = [
  checkMandatoryLanguage,
  body(updateSentenceBulkReviewRouteValidationObj.title).notEmpty().isString(),
  body(updateSentenceBulkReviewRouteValidationObj.removeReview)
    .optional()
    .isBoolean(),
  body(fieldToUpdatePrefix).optional().custom(updateFieldForContentValidation),
];

export { updateSentenceReviewBulkValidation };
