# MDFS - Mega Based Distributed Filesystem
- This is a simple DFS implemented using [mega](https://mega.nz).
- It uses shortest gap eligible everytime for packing purposes.
- The file system architecture is as agnostic as possible without complicating things, so mega can be swapped out for google drive etc. just by providing alternate implementations of datanode and namenode methods.
- In theory this can use discord or similar services as a filesystem too but since there is no partial file support that would be quite useless.

### Usage 
- Copy `namenode.example.config` to `namenode.config` with your namenode email and password. (if you don't have a namenode account then you can use generate one by `python genNewNode.py`)
- Do the same for `datanode.example.config` too.
- Write your own program over the filesystem or use the provided backup script to test.
- Periodically run `python keep_account_active.py` to ensure your accounts are deleted due to inactivity.

### Examples
- `examples` directory has some sample usage of filesystem module, you may learn from it or read the fs file itself.

### Documentation
- `filesystem.js` has the whole filesystem API, there are no docs desciribing the API at the moment but you can refer to the module as it's pretty compact.
- `Datanode` and `Namenode` are concepts borrowed from [Hadoop](https://hadoop.apache.org/)
- `Gaps.json` contains the gaps that are left behind on placing complete files in datanode.
- No Partial File support is implemented, unfortunately this means files of size greater than max data node capacity are not allowed eithe (they will cause the file system to go into an infinite loop, so lookout for that).

### Tests
- The tests folder contains appropriate tests for all modules, all tests start with `tst_` prefix.
- Current tests
    - `tst_datanode.js`
    - `tst_namenode.js`
    - `tst_filesystem.js`

### Parital File Support
- [Merkle Trees](https://en.wikipedia.org/wiki/Merkle_tree)?