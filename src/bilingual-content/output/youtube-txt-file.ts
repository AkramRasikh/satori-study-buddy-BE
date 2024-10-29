import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import { timeToSeconds } from '../../utils/time-string-to-seconds';
import { replaceStringSpaces } from '../../utils/replace-string-space';

// if you cut the duration by 60, this could cut through a line
// Function to extract specific part of the mp3
function extractMP3Section(inputFilePath, outputFilePath, fromTime, toTime) {
  return new Promise((resolve, reject) => {
    const duration = toTime - fromTime;

    ffmpeg(inputFilePath)
      .setStartTime(fromTime) // Start time in seconds
      .setDuration(duration) // Duration in seconds
      .output(outputFilePath) // Output file path
      .on('end', () => {
        console.log(`Snippet created from ${fromTime} to ${toTime} seconds.`);
        resolve(outputFilePath);
      })
      .on('error', (err) => {
        console.error(
          'Error while processing MP3:',
          err.message,
          outputFilePath,
        );
        reject(err);
      })
      .run();
  });
}

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

function splitSubtitlesByInterval(filePath, start, finish, needsTrimmedSpaces) {
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n');
  const startTimeSeconds = timeToSeconds(start);
  const finishTimeSeconds = timeToSeconds(finish);

  let results = [];

  lines.forEach((line) => {
    const parts = line.trim().split('\t');
    if (parts.length >= 3) {
      const time = needsTrimmedSpaces ? parts[0].trim() : parts[0]; // Time in HH:MM:SS format
      const thisTimeStamp = timeToSeconds(time);
      const hasDesiginatedTimeRange = start && finish;
      const isInRange = hasDesiginatedTimeRange
        ? thisTimeStamp >= startTimeSeconds &&
          thisTimeStamp <= finishTimeSeconds
        : true;

      if (time !== 'Time' && isInRange) {
        const targetLang = parts[2]; // targetLang (original language)
        const targetLangTrim = needsTrimmedSpaces
          ? replaceStringSpaces(targetLang, '')
          : targetLang; // Replaces spaces with underscores
        const baseLang = needsTrimmedSpaces ? parts[4].trim() : parts[4]; // English (translation)

        // Push the extracted data into the results array
        results.push({
          id: uuidv4(),
          baseLang: baseLang, // English translation
          targetLang: targetLangTrim, // targetLang text
          time: thisTimeStamp - startTimeSeconds, // Convert time to seconds
        });
      }
    }
  });

  return results;
}

function splitByInterval(data, interval, title) {
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
}

export {
  splitSubtitlesByInterval,
  splitByInterval,
  extractMP3Section,
  getUpdateToAndFromValues,
};
