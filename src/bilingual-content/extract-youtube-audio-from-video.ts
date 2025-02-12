import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Promisify exec to use with async/await
const execAsync = promisify(exec);

// Define the output directory
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to extract audio from YouTube
const extractYoutubeAudioFromVideo = async ({ url, title }) => {
  const outputFilePath = path.join(outputDir, title);

  // Construct the yt-dlp command
  const command = `yt-dlp -x --audio-format mp3 "${url}" -o "${outputFilePath}"`;

  try {
    // Execute the command and wait for it to complete
    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('WARNING')) {
      console.error(`stderr: ${stderr}`);
      throw new Error(`Error during extraction: ${stderr}`);
    }
    const fileNameWithMP3Ending = outputFilePath + '.mp3';

    const buffer = fs.readFileSync(fileNameWithMP3Ending);

    console.log(`## stdout: ${stdout}`);
    console.log(`## Audio has been extracted and saved to ${outputFilePath}`);
    return { extractedBaseFilePath: fileNameWithMP3Ending, buffer }; // Optionally return the path to the saved file
  } catch (error) {
    console.error(`## extractYoutubeAudioFromVideo Error: ${error.message}`);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
};

export { extractYoutubeAudioFromVideo };
