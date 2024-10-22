const audofolderSuffix = '-audio';

const japanese = 'japanese';

export const eligibleLanguages = [japanese];

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
