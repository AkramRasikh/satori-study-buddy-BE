import { eligibleLanguages } from '../eligible-languages';

const audofolderSuffix = '-audio';

export const getAudioFolderViaLang = (languageStr: string): string => {
  if (eligibleLanguages.includes(languageStr)) {
    return `${languageStr}${audofolderSuffix}`;
  }

  throw new Error(
    `Invalid language '${languageStr}'. Expected one of: ${eligibleLanguages.join(
      ', ',
    )}`,
  );
};
