import { Request, Response } from 'express';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { addFullJapaneseMP3, uploadBufferToFirebase } from '../firebase/init';

const folderPath = 'japanese-audio';

const mp3Utils = (app) => {
  app.post('/combine-audio', (req: Request, res: Response) => {
    const audioFiles = req?.body?.audioFiles;
    const mp3Name = req?.body?.mp3Name;
    const formattedFirebaseName = folderPath + '/' + mp3Name + '.mp3';

    const outputFilePath = path.join(__dirname, 'output.mp3');

    const command = ffmpeg();
    audioFiles.forEach((file) => {
      command.input(file);
    });

    command
      .on('start', function (commandLine) {
        console.log('Spawned ffmpeg with command: ' + commandLine);
      })
      .on('error', function (err, stdout, stderr) {
        console.error('Error: ' + err.message);
        console.error('ffmpeg stderr: ' + stderr);
        res.status(500).send('Error processing audio files');
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

          res.status(200).send({ url });
        } catch (error) {
          console.error('Error uploading to Firebase Storage:', error);
          res.status(500).send('Error uploading to Firebase Storage');
        } finally {
          fs.unlinkSync(outputFilePath); // Clean up the temporary file
        }
      })
      .mergeToFile(outputFilePath, __dirname);
  });
};

export { mp3Utils };
