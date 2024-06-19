import ffmpeg from 'fluent-ffmpeg';
import fetch from 'node-fetch';
import fs from 'fs';

export async function fetchBufferFromUrl(url) {
  try {
    // Fetch the data from the URL
    const response = await fetch(url);
    console.log('## fetchBufferFromUrl 1: ', { url, response });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    // Convert the response into a buffer
    const buffer = await response.buffer();
    console.log('## fetchBufferFromUrl 2: ', { url, buffer });
    return buffer;
  } catch (error) {
    console.error('Error fetching buffer from URL:', error);
    throw error;
  }
}

export async function useFFmpeg(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
}

export function saveBufferToFile(buffer, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, buffer, (err) => {
      if (err) return reject(err);
      resolve(filePath);
    });
  });
}
