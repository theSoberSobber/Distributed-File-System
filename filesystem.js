const { NameNode } = require('./nodes/NameNode');
const { DataNode } = require('./nodes/datanode');
const { RedBlackTree } = require('./utils/node-multiset');
const { calculateHash } = require('./utils/hash');
const fs = require('fs/promises');

const { execSync } = require('child_process');

async function callSubprocess(command) {
  return new Promise((resolve, reject) => {
    try {
      execSync(command);
      console.log('Subprocess finished successfully');
      resolve();
    } catch (error) {
      console.error('Error running subprocess:', error);
      reject(error);
    }
  });
}

class FileSystem {
  constructor() {
    this.nameNode = null;
    this.gapsTree = new RedBlackTree();
  }

  async init() {
    try {
      // Initialize NameNode using credentials from namenode.config
      const nameNodeConfig = await fs.readFile('namenode.config', 'utf-8');
      const [email, password] = nameNodeConfig.split(',');
      this.nameNode = new NameNode(email, password);
      await this.nameNode.init();

      // Load gaps from gaps.json into Red-Black Tree
      const gapsJSON = await fs.readFile('gaps.json', 'utf-8');
      const { gaps } = JSON.parse(gapsJSON);
      gaps.forEach((e) => {
        const capacity = e[0], nodeNum = e[1];
        this.gapsTree.insert(capacity, nodeNum);
      });

      console.log('FileSystem initialized successfully');
    } catch (error) {
      console.error(`Failed to initialize FileSystem: ${error}`);
    }
  }

  async commitGaps() {
    try {
      const gapsJSON = JSON.stringify({ gaps: this.gapsTree.toSortedSet() });
      await fs.writeFile('gaps.json', gapsJSON);
      console.log('Gaps committed successfully');
    } catch (error) {
      console.error(`Failed to commit gaps: ${error}`);
    }
  }

  async addWithContent(fileName, fileContent) {
    try {
      // Calculate hash from file content
      const hash = calculateHash(fileContent);

      // Check if file already exists in NameNode
      const { exists, obj } = await this.nameNode.checkKeyExistence(hash);
      if (exists) {
        console.log('File already exists:', obj);
        return;
      }

      // Find node with available space
      const fileSize = fileContent.length;
      const node = this.gapsTree.lowerBound(fileSize);

      if (node === null) {
        // Handle case when no space is available
        console.log('No space available for file insertion');

        // Call subprocess to generate new node
        await callSubprocess('python genNewNode.py --addToDataNodes');
        console.log(`New node generated`);

        // Read datanode.config to get email and password for the new node
        const datanodeConfig = await fs.readFile('datanode.config', 'utf-8');
        const { datanodes } = JSON.parse(datanodeConfig);
        const newNode = datanodes[datanodes.length - 1];

        // Query space total and insert new gap in the Red-Black Tree
        console.log(`Trying to Login to new node`);
        const dataNode = new DataNode(newNode.email, newNode.password);
        await dataNode.init();
        console.log(`Logged into the new node`);
        const { spaceTotal, spaceUsed } = await dataNode.queryRemainingSpace();
        const capacity = spaceTotal - spaceUsed;
        this.gapsTree.insert(capacity, datanodes.length - 1);

        await dataNode.exit();

        // Commit gaps to gaps.json
        await this.commitGaps();
        console.log("Commited New Node Gap");

        // Recursive call to add after new node generation
        await this.addWithContent(fileName, fileContent);

        // Ensure return to prevent further execution
        return;
      }

      const datanodeConfig = await fs.readFile('datanode.config', 'utf-8');
      const { datanodes } = JSON.parse(datanodeConfig);

      // Initialize DataNode for file insertion
      const dataNode = new DataNode(datanodes[node.nodeNum].email, datanodes[node.nodeNum].password);
      await dataNode.init();

      // Upload file to DataNode
      const { file, shareLink } = await dataNode.uploadFileWithContent(fileName, fileContent);

      // Add entry to NameNode
      const entryValue = { name: fileName, node: node.nodeNum, tags: [], link: shareLink };
      await this.nameNode.addEntry(hash, entryValue);

      // Update the gap with remaining space
      this.gapsTree.remove(node.value, node.nodeNum);
      if (node.value - fileSize) this.gapsTree.insert(node.value - fileSize, node.nodeNum);

      // Commit gaps to gaps.json
      await this.commitGaps();

      await dataNode.exit();

      console.log('File added successfully:', entryValue);
    } catch (error) {
      console.error(`Failed to add file: ${error}`);
    }
  }

  async addFile(fileName) {
    try {
      const fileContent = await this.readFileContent(fileName);
      // console.log(fileContent.length);
      await this.addWithContent(fileName, fileContent);
      console.log(`File added successfully`);
    } catch (error) {
      console.error(`Failed to add file ${fileName}: ${error}`);
    }
  }

  async readFileContent(fileName) {
    try {
      // Read file content using fs module
      const fileContent = await fs.readFile(fileName);
      return fileContent;
    } catch (error) {
      console.error(`Failed to read file content ${fileName}: ${error}`);
      return null;
    }
  }

  async queryIndex() {
    try {
      const indexContent = await this.nameNode.queryIndex();
      return indexContent;
    } catch (error) {
      console.error(`Failed to query index from filesystem: ${error}`);
      return null;
    }
  } 
  
  async summary() {
    try {
      const indexContent = await this.nameNode.queryIndex();
      const summary = {};
      for(let hash in indexContent) summary[indexContent[hash].name] = indexContent[hash].link;
      return summary;
    } catch (error) {
      console.error(`Failed to query index from filesystem: ${error}`);
      return null;
    }
  }

  async exit(){
    await this.nameNode.exit();
    console.log("Connection to Mega Closed Successfully");
  }
}

module.exports = FileSystem;