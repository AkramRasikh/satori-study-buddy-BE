import { FirebaseCoreQueryParams } from '../firebase/types';

const getRefPath = ({ language, ref }: FirebaseCoreQueryParams) =>
  `${language}/${ref}`;

export { getRefPath };
