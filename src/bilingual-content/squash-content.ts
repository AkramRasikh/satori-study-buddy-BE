export const squashContent = (content) => {
  // Create a map to group objects by their time property
  const groupedByTime = content.reduce((acc, obj) => {
    if (!acc[obj.time]) {
      acc[obj.time] = { ...obj };
    } else {
      acc[obj.time].baseLang += `. ${obj.baseLang}`;
      acc[obj.time].targetLang += `. ${obj.targetLang}`;
    }
    return acc;
  }, {});

  // Convert the grouped object back into an array
  const values = Object.values(groupedByTime);

  return values;
};
