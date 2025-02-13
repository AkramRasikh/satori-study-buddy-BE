import { exec } from 'child_process';

export const checkYoutubeVideoCaptionStatus = ({ youtubeId }) => {
  return new Promise((resolve, reject) => {
    const command = `yt-dlp --list-subs ${youtubeId} | awk '/Available subtitles/,0' | grep -E "^en(-[a-zA-Z]+)?"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        resolve('');
        return;
      }

      if (stderr) {
        console.warn(`yt-dlp stderr: ${stderr}`);
      }

      const firstEngSubtitles = stdout
        ?.trim()
        ?.split(' ')
        ?.find((sub) => /^en(-[a-zA-Z]+)?$/.test(sub));

      return resolve(firstEngSubtitles);
    });
  });
};
