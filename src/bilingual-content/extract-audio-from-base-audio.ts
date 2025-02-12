import ffmpeg from 'fluent-ffmpeg';

// if you cut the duration by 60, this could cut through a line
// Function to extract specific part of the mp3
export const extractAudioFromBaseAudio = (
  inputFilePath,
  outputFilePath,
  fromTime,
  toTime,
) => {
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
};
