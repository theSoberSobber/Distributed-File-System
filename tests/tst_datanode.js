const assert = require('assert');
const { DataNode } = require('../nodes/datanode');

const email = '';
const password = '';

const fileName = 'test.txt';
const fileContent = 'This is a test file.';

async function testQueryRemainingSpace(dataNode) {
  const spaceInfo = await dataNode.queryRemainingSpace();
  console.log(`SpaceUsed: ${spaceInfo.spaceUsed}, SpaceTotal: ${spaceInfo.spaceTotal}`);
  assert.ok(spaceInfo.spaceUsed >= 0);
  assert.ok(spaceInfo.spaceTotal >= 0);
  console.log('Query remaining space test passed successfully');
}

async function testUploadFile(dataNode) {
  const { file, shareLink } = await dataNode.uploadFileWithContent(fileName, fileContent);
  console.log(`Shareable Link of file: `, shareLink);
  assert.ok(file);
  assert.ok(shareLink);
  console.log('Upload file test passed successfully');
}

// Run the tests
async function runTests() {
  const dataNode = new DataNode(email, password);
  try {
    await dataNode.init();
    await testQueryRemainingSpace(dataNode);
    await testUploadFile(dataNode);
    console.log(`----- All Tests Passed Successfully -----`);
    await dataNode.exit();
  } catch (error) {
    console.error('Error occurred during testing:', error);
  }
}

// Execute the tests
(async () => {
  await runTests();
})();