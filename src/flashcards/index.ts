import { getFirebaseContent } from '../firebase/init';
import {
  japaneseContent,
  japaneseSongs,
  japaneseWords,
} from '../firebase/refs';

const getJapaneseWords = async () => {
  const data = await getFirebaseContent({ ref: japaneseWords });
  return data;
};
const getJapaneseContent = async () => {
  const data = await getFirebaseContent({ ref: japaneseContent });
  return data;
};
const getJapaneseSongs = async () => {
  const data = await getFirebaseContent({ ref: japaneseSongs });
  return data;
};

export { getJapaneseWords, getJapaneseContent, getJapaneseSongs };
