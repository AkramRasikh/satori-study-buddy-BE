const replaceStringSpaces = (str, replacement = '') => {
  if (str === '') {
    return str;
  }
  return str?.replace(/\s+/g, replacement);
};

export { replaceStringSpaces };
