import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const fieldToUpdatePrefix = 'fieldToUpdate';
const updateContentKeysRouteValidationObj = {
  title: 'title',
  reviewData: `${fieldToUpdatePrefix}.reviewData`,
  nextReview: `${fieldToUpdatePrefix}.nextReview`,
  origin: `${fieldToUpdatePrefix}.origin`,
  reviewHistory: `${fieldToUpdatePrefix}.reviewHistory`,
  isCore: `${fieldToUpdatePrefix}.isCore`,
  hasAudio: `${fieldToUpdatePrefix}.hasAudio`,
};
const updateContentKeysRouteValidationArr = Object.keys(
  updateContentKeysRouteValidationObj,
);

const updateFieldForContentValidation = (value: object) => {
  if (!value || typeof value !== 'object') {
    throw new Error(
      `fieldToUpdate must be an object of: 
      ${updateContentKeysRouteValidationArr.join(', ')}`,
    );
  }

  const hasValidField = Object.keys(value).some((key) =>
    updateContentKeysRouteValidationArr.includes(key),
  );
  if (!hasValidField) {
    throw new Error(
      `fieldToUpdate must contain at least one of the following: ${updateContentKeysRouteValidationArr.join(
        ', ',
      )}`,
    );
  }

  return true;
};

const updateContentValidation = [
  checkMandatoryLanguage,
  body(fieldToUpdatePrefix).notEmpty().custom(updateFieldForContentValidation),
  body(updateContentKeysRouteValidationObj.reviewData).optional(),
  body(updateContentKeysRouteValidationObj.nextReview).optional(),
  body(updateContentKeysRouteValidationObj.origin).optional().isString(),
  body(updateContentKeysRouteValidationObj.reviewHistory).optional(),
  body(updateContentKeysRouteValidationObj.isCore).optional().isBoolean(),
  body(updateContentKeysRouteValidationObj.hasAudio).optional().isBoolean(),
];

export { updateContentValidation };
