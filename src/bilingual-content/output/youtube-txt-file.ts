const getTheNextFromValueForThisTo = (thisChunk, nextChunk) => {
  const thisProvChunkTo = thisChunk.to;
  const nextChunksFirstEl = nextChunk.content[0].time;

  const realTo = thisProvChunkTo + nextChunksFirstEl;

  return realTo;
};

const getUpdateToAndFromValues = (outputJSONDefaultToAndFrom) => {
  const updatedValues = outputJSONDefaultToAndFrom.map((item, index) => {
    const isLast = index + 1 === outputJSONDefaultToAndFrom.length;
    const realNextValue = isLast
      ? item.to
      : getTheNextFromValueForThisTo(
          item,
          outputJSONDefaultToAndFrom[index + 1],
        );

    return {
      ...item,
      to: realNextValue,
    };
  });
  return updatedValues;
};

const splitByInterval = (data, interval, title) => {
  const result = [];
  let currentChunk = [];
  let currentStartTime = 0;

  // Initialize first "to" time based on the interval
  let currentEndTime = interval;

  for (const item of data) {
    if (item.time >= currentEndTime) {
      if (currentChunk.length > 0) {
        result.push({
          from: currentStartTime,
          to: currentEndTime,
          content: currentChunk,
          hasAudio: true,
        });
      }

      // Update the current start and end times
      currentStartTime = currentEndTime;
      currentEndTime += interval;

      // Start a new chunk
      currentChunk = [];
    }

    // Add the current item to the chunk
    currentChunk.push(item);
  }

  // Push the last chunk if it contains items
  if (currentChunk.length > 0) {
    result.push({
      from: currentStartTime,
      to: currentEndTime,
      content: currentChunk,
      hasAudio: true,
    });
  }

  return result.map((snippetContent, index) => ({
    title: `${title}-${index + 1}`,
    ...snippetContent,
    content: snippetContent.content.map((sentence) => ({
      ...sentence,
      time: sentence.time - interval * index,
    })),
  }));
};

export { splitByInterval, getUpdateToAndFromValues };
