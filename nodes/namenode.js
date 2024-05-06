const { Storage } = require('megajs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

class NameNode {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.storage = null;
  }

  async find(query) {
    return new Promise((resolve, reject) => {
      const file = this.storage.root.children?.find(file => file.name == query);
      // console.log(file);
      if (file) {
        resolve(file);
      } else {
        console.log(`File ${query} not found`);
        resolve(undefined);
      }  
    });
  }

  async init(){
    try {
      this.storage = await new Storage({
        email: this.email,
        password: this.password
      }).ready;
      console.log(`NameNode initialized for ${this.email}`);
      await this.ensureIndex();
    } catch (error) {
      console.error(`Failed to initialize NameNode for ${this.email}: ${error}`);
    }
  }

  async ensureIndex(precautionWait = true){
    try {
      const indexFile = await this.find('index.json');
      
      if (!indexFile) {
        // If index file doesn't exist, create an empty one
        await this.storage.upload('index.json', '{}');
        if(precautionWait) await sleep(3*1000);
        console.log('Created index.json');
      } else {
        console.log('Index file already exists');
      }
      return true;
    } catch (error) {
      console.error(`Failed to ensure index: ${error}`);
      return false;
    }
  }

  async addEntry(key, value, precautionWait = true) {
    try {
      // Check if index file exists
      const indexFile = await this.find('index.json');
      
      // Initialize index content
      let indexContent = {};

      // If index file exists, fetch its content
      if (indexFile) {
        indexContent = JSON.parse(await indexFile.downloadBuffer());
      }

      // Add new entry to index content
      indexContent[key] = value;

      // Upload index file with updated content
      await indexFile.delete(true, (e)=>{});
      await this.storage.upload('index.json', JSON.stringify(indexContent));

      // to allow the api to remove the old file, so that we don't run into old file errors
      if(precautionWait) await sleep(3*1000);

      console.log(`New entry added to index: ${key}:`, value);
      return true;
    } catch (error) {
      console.error(`Failed to add new entry to index: ${error}`);
      return false;
    }
  }

  async queryIndex() {
    try {
      // console.log(this.storage, this.storage.root);
      const indexFile = await this.find('index.json');
      // console.log("I am index file: ", indexFile);
      if (!indexFile) {
        console.error('Index file not found');
        return null;
      }

      const indexContent = JSON.parse(await indexFile.downloadBuffer());
      return indexContent;
    } catch (error) {
      console.error(`Failed to query index: ${error}`);
      return null;
    }
  }

  async checkKeyExistence(key) {
    try {
      const indexContent = await this.queryIndex();
      return {
          exists: indexContent.hasOwnProperty(key), 
          obj: indexContent.hasOwnProperty(key) ? indexContent[key] : undefined
        };
    } catch (error) {
      console.error(`Failed to check key existence: ${error}`);
      return false;
    }
  }

  async exit(){
    await this.storage.close();
    console.log("Connection to Mega Closed Successfully");
  }
}

module.exports = {
  NameNode
}