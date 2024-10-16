import { FirebaseCoreQueryParams } from '../firebase/types';

const getRefPath = ({ language, ref }: FirebaseCoreQueryParams) => {
  return `${language}/${ref}`;
};

export { getRefPath };
