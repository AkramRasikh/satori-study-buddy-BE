import { ContentType, SentenceType } from '../types';

export const getThisContentsIndex = ({ data, title }) => {
  // Convert object of objects to an array
  const values = Object.values(data);
  const keys = Object.keys(data);

  // Find the index of the object to update
  const index = values.findIndex((item: ContentType) => {
    return item.title === title;
  });

  return { keys, index };
};

export const getThisSentenceIndex = ({ data, id }) => {
  // Convert object of objects to an array
  const values = Object.values(data);
  const sentenceKeys = Object.keys(data);

  // Find the index of the object to update
  const sentenceIndex = values.findIndex((item: SentenceType) => {
    return item.id === id;
  });

  return { sentenceKeys, sentenceIndex };
};
