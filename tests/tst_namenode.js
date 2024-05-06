const assert = require('assert');
const {NameNode} = require('../nodes/NameNode');

const email = '';
const password = '';

const testKey = 'testHash';
const testObj = { name: 'testName', node: 1, tags: ['tag1', 'tag2'], link: 'testLink' };

async function testAddEntry(nameNode) {
  const key = testKey;
  const value = testObj;

  await nameNode.addEntry(key, value); // can add false if want to remove wait and use some custom wait solution

  const indexContent = await nameNode.queryIndex();
  assert.strictEqual(indexContent[key].name, value.name);
  assert.deepStrictEqual(indexContent[key].tags, value.tags);
  assert.strictEqual(indexContent[key].link, value.link);

  console.log('Add entry test passed successfully');
}

// Test querying the index
async function testQueryIndex(nameNode) {
  const indexContent = await nameNode.queryIndex();

  assert.strictEqual(typeof indexContent, 'object');
  console.log(`Queried Index Content:`);
  console.log(indexContent);
  console.log('Query index test passed successfully');
}

// Test checking key existence in the index
async function testCheckKeyExistence(nameNode) {
  const key = testKey;

  // Assuming the key doesn't exist initially
  let {exists, obj} = await nameNode.checkKeyExistence(testKey);
  assert.strictEqual(exists, true);
  assert.deepStrictEqual(obj, testObj);

  console.log('Check key existence test passed successfully');
}

// Run the tests
async function runTests() {
  const nameNode = new NameNode(email, password);
  try {
    await nameNode.init();
    await testQueryIndex(nameNode);
    await testAddEntry(nameNode);
    await testCheckKeyExistence(nameNode);
    console.log(`----- All Tests Passed Successfully -----`)
    await nameNode.exit();
  } catch (error) {
    console.error('Error occurred during testing:', error);
  }
}

// Execute the tests
(async ()=>{
  await runTests();
})();