const japanese = 'japanese';
const audofolderSuffix = '-audio';

enum LanguageEnum {
  Japanese = 'japanese',
  Arabic = 'arabic',
  Chinese = 'chinese',
}

export const eligibleLanguages = [LanguageEnum.Japanese];

export const getAudioFolderViaLang = (languageStr: LanguageEnum): string => {
  const validLanguages = Object.values(LanguageEnum);
  if (validLanguages.includes(languageStr)) {
    return `${languageStr}${audofolderSuffix}`;
  }

  throw new Error(
    `Invalid language '${languageStr}'. Expected one of: ${validLanguages.join(
      ', ',
    )}`,
  );
};
