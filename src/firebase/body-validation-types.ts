export const wordKeysRouteValidationObj = {
  id: 'id',
  baseForm: 'baseForm',
  definition: 'definition',
  contexts: 'contexts',
  reviewData: 'reviewData',
  surfaceForm: 'surfaceForm',
  transliteration: 'transliteration',
  phonetic: 'phonetic',
};

export const wordKeysRouteValidationArr = Object.keys(
  wordKeysRouteValidationObj,
);

export const updateWordObj = {
  wordId: 'wordId',
  language: 'language',
  fieldToUpdate: 'fieldToUpdate',
};

const fieldToUpdatePrefix = 'fieldToUpdate';

export const validationRouteKeys = {
  reviewData: `${fieldToUpdatePrefix}.reviewData`,
  nextReview: `${fieldToUpdatePrefix}.nextReview`,
  reviewHistory: `${fieldToUpdatePrefix}.reviewHistory`,
};
