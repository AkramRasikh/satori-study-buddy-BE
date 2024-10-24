import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const cutAudioFromAudio = async ({
  inputFilePath,
  trimStart,
  trimEnd,
  outputFilePath,
}) => {
  const ffmpegCommand = `ffmpeg -i ${inputFilePath} -ss ${trimStart} -to ${trimEnd} -c copy ${outputFilePath}`;

  try {
    // Execute the FFmpeg command asynchronously
    const { stdout, stderr } = await execAsync(ffmpegCommand);

    if (stderr) {
      console.error(`FFmpeg stderr: ${stderr}`);
    }

    console.log(`FFmpeg stdout: ${stdout}`);

    return true; // Return a successful resolution
  } catch (error) {
    console.error(`Error executing FFmpeg command: ${error.message}`);
    throw error; // Re-throw the error to allow further handling
  }
};

export { cutAudioFromAudio };
