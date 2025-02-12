import path from 'path';
import { exec } from 'child_process';

export const downloadYoutubeVideo = ({ videoUrl, title }) => {
  return new Promise((resolve, reject) => {
    const outputFolder = path.resolve(__dirname, 'output');
    const outputPath = path.join(outputFolder, `${title}.mp4`);

    const command = `yt-dlp -f 134+140 -o "${outputPath}" ${videoUrl}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`yt-dlp stderr: ${stderr}`);
      }
      console.log(`yt-dlp output: ${stdout}`);
      console.log(`Download complete: ${title}.mp4`);
      resolve(outputPath); // Resolve with the filename
    });
  });
};
