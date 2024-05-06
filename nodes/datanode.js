const { Storage } = require('megajs');
const fs = require('fs').promises;

class DataNode {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.storage = null;
  }

  async init(){
    try {
      this.storage = await new Storage({
        email: this.email,
        password: this.password
      }).ready;
      console.log(`DataNode initialized for ${this.email}`);
    } catch (error) {
      console.error(`Failed to initialize DataNode for ${this.email}: ${error}`);
    }
  }

  async queryRemainingSpace() {
    try {
      const accountInfo = await this.storage.getAccountInfo();
      return {
        spaceUsed: accountInfo.spaceUsed,
        spaceTotal: accountInfo.spaceTotal
      };
    } catch (error) {
      console.error(`Failed to query remaining space: ${error}`);
      return null;
    }
  }

  async uploadFileWithContent(fileName, fileContent) {
    try {
      const file = await this.storage.upload(fileName, fileContent).complete;
      const shareLink = await file.link();
      console.log(`File uploaded successfully: ${fileName}`);
      return {
        file,
        shareLink
      };
    } catch (error) {
      console.error(`Failed to upload file ${fileName}: ${error}`);
      return null;
    }
  }

  async uploadFile(fileName) {
    try {
      // Read file content
      const fileContent = await this.readFileContent(fileName);

      // Upload file using filename and content
      const { file, shareLink } = await this.uploadFileWithContent(fileName, fileContent);
      console.log(`File uploaded successfully: ${fileName}`);
      return { file, shareLink };
    } catch (error) {
      console.error(`Failed to upload file ${fileName}: ${error}`);
      return null;
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

  async exit(){
    await this.storage.close();
    console.log("Connection to Mega Closed Successfully");
  }
}

module.exports = {
  DataNode
}
