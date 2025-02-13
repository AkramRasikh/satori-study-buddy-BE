export const formatTranscriptBasedOnTime = (content) => {
  // Sort the content by time to ensure it is in the correct order
  const sortedContent = [...content].sort((a, b) => a.time - b.time);

  // Initialize an array to hold the squashed content
  const squashedContent = [];

  // Iterate over the sorted content
  sortedContent.forEach((current, index) => {
    if (index === 0) {
      squashedContent.push({ ...current });
    } else {
      const previous = squashedContent[squashedContent.length - 1];
      // Check if the current time is within 2 seconds of the previous time
      if (current.time - previous.time < 2) {
        // Merge the current content into the previous entry
        previous.baseLang += `. ${current.baseLang}`;
        previous.targetLang += `. ${current.targetLang}`;
      } else {
        // Add the current object to the squashed content as a new entry
        squashedContent.push({ ...current });
      }
    }
  });

  return squashedContent;
};
