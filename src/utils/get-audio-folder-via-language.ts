import { eligibleLanguages } from '../eligible-languages';

const audiofolderSuffix = '-audio';

export const getAudioFolderViaLang = (languageStr: string): string => {
  if (eligibleLanguages.includes(languageStr)) {
    return `${languageStr}${audiofolderSuffix}`;
  }

  throw new Error(
    `Invalid language '${languageStr}'. Expected one of: ${eligibleLanguages.join(
      ', ',
    )}`,
  );
};

const videofolderSuffix = '-video';

export const getvideoFolderViaLang = (languageStr: string): string => {
  if (eligibleLanguages.includes(languageStr)) {
    return `${languageStr}${videofolderSuffix}`;
  }

  throw new Error(
    `Invalid language '${languageStr}'. Expected one of: ${eligibleLanguages.join(
      ', ',
    )}`,
  );
};
