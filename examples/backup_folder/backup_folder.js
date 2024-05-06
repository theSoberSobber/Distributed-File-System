// Uploads an Entire Folder to mega with records at current namenode
const folderPath = 'test';

const fs = require('fs/promises');
const path = require('path');
const FileSystem = require('../../FileSystem');

async function backupFolder(folderPath) {
  try {
    // Initialize the FileSystem
    const fileSystem = new FileSystem();
    await fileSystem.init();

    // Read all files in the folder
    const files = await fs.readdir(folderPath);

    // Upload each file to the FileSystem
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      await fileSystem.add(filePath);
    }

    // Print summary
    const summary = await fileSystem.summary();
    console.table(summary);
  } catch (error) {
    console.error('Error occurred during backup:', error);
  }
}

backupFolder(folderPath);