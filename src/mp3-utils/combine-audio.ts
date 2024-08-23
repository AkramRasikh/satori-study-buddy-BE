import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { addFullJapaneseMP3, uploadBufferToFirebase } from '../firebase/init';

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
        const url = await uploadBufferToFirebase({
          buffer,
          filePath: formattedFirebaseName,
        });

        await addFullJapaneseMP3({
          contentEntry: {
            name: mp3Name,
          },
        });

        // res.status(200).send({ url });
        return true;
      } catch (error) {
        console.error('Error uploading to Firebase Storage:', error);
        return false;
        // res.status(500).send('Error uploading to Firebase Storage');
      } finally {
        fs.unlinkSync(outputFilePath); // Clean up the temporary file
      }
    })
    .mergeToFile(outputFilePath, __dirname);
};
