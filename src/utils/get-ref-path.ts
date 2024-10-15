const getRefPath = ({ language, ref }) => {
  if (!language || !ref) {
    return null;
    // figure out how best to reject
  }
  return `${language}/${ref}`;
};

export { getRefPath };
