import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { uploadBufferToFirebase } from '../firebase/init';

const folderPath = 'japanese-audio';

export const combineAudio = ({ audioFiles, mp3Name }) => {
  const formattedFirebaseName = folderPath + '/' + mp3Name + '.mp3';

  const outputFilePath = path.join(__dirname, 'output.mp3');

  const command = ffmpeg();
  audioFiles.forEach((file) => {
    command.input(file);
  });

  return command
    .on('start', function (commandLine) {
      console.log('Spawned ffmpeg with command: ' + commandLine);
    })
    .on('error', function (err, stdout, stderr) {
      console.error('Error: ' + err.message);
      console.error('ffmpeg stderr: ' + stderr);
      return false;
      // res.status(500).send('Error processing audio files');
    })
    .on('end', async () => {
      console.log('Files have been merged successfully');

      const buffer = fs.readFileSync(outputFilePath);

      try {
        await uploadBufferToFirebase({
          buffer,
          filePath: formattedFirebaseName,
        });

        // res.status(200).send({ url });
        return true;
      } catch (error) {
        throw new Error('Error uploading to Firebase Storage');
        // res.status(500).send('Error uploading to Firebase Storage');
      } finally {
        fs.unlinkSync(outputFilePath); // Clean up the temporary file
      }
    })
    .mergeToFile(outputFilePath, __dirname);
};
