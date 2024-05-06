const assert = require('assert');
const fs = require('fs/promises');
const FileSystem = require('../filesystem');
const { calculateHash } = require('../utils/hash');

const fileName = 'test.txt';
const fileContent = 'This is a test file.';

async function testUploadAndQueryIndex() {
  const fileSystem = new FileSystem();
  await fileSystem.init();

  // Calculate hash of file content
  const hash = calculateHash(fileContent);

  // Add the file with its content
  await fileSystem.addWithContent(fileName, fileContent);

  // Query the index for the hash
  const indexContent = await fileSystem.queryIndex();
  console.log(indexContent);

  // Check if the hash exists in the index
  assert.ok(indexContent.hasOwnProperty(hash), 'Hash not found in index');
  console.log('Hash found in index:', indexContent[hash]);

  await fileSystem.exit();
}

// Run the test
testUploadAndQueryIndex().catch(error => {
  console.error('Error occurred during test:', error);
});