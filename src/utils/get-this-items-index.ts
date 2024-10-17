const getThisItemsIndex = ({ snapshotArr, id }) => {
  const length = snapshotArr.length;
  for (let i = 0; i < length; i++) {
    const thisItem = snapshotArr[i].id === id;
    if (thisItem) {
      return i;
    }
  }
};

const getThisItemsViaValues = ({ snapshotArr, id }) => {
  const thisItemsValues = Object.values(snapshotArr);
  const keys = Object.keys(snapshotArr);
  const index = thisItemsValues.findIndex((item) => {
    return (item as any).id === id;
  });
  return { keys, index };
};

export { getThisItemsIndex, getThisItemsViaValues };
