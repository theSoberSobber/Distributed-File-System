class Node {
    constructor(value, nodeNum) {
        this.value = value;
        this.nodeNum = nodeNum;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.color = 'red'; // New nodes are always red
    }
  }
  
  class RedBlackTree {
    constructor() {
        this.root = null;
    }
  
    insert(value, nodeNum) {
        const newNode = new Node(value, nodeNum);
        if (!this.root) {
            this.root = newNode;
        } else {
            let current = this.root;
            let parent = null;
            while (current) {
                parent = current;
                if (value <= current.value && nodeNum <= current.nodeNum) {
                    current = current.left;
                } else {
                    current = current.right;
                }
            }
            newNode.parent = parent;
            if (value <= parent.value) {
                parent.left = newNode;
            } else {
                parent.right = newNode;
            }
            this.fixRedBlackTreeAfterInsert(newNode);
        }
    }
  
    fixRedBlackTreeAfterInsert(node) {
        while (node !== this.root && node.parent.color === 'red') {
            if (node.parent === node.parent.parent.left) {
                const uncle = node.parent.parent.right;
                if (uncle && uncle.color === 'red') {
                    node.parent.color = 'black';
                    uncle.color = 'black';
                    node.parent.parent.color = 'red';
                    node = node.parent.parent;
                } else {
                    if (node === node.parent.right) {
                        node = node.parent;
                        this.rotateLeft(node);
                    }
                    node.parent.color = 'black';
                    node.parent.parent.color = 'red';
                    this.rotateRight(node.parent.parent);
                }
            } else {
                const uncle = node.parent.parent.left;
                if (uncle && uncle.color === 'red') {
                    node.parent.color = 'black';
                    uncle.color = 'black';
                    node.parent.parent.color = 'red';
                    node = node.parent.parent;
                } else {
                    if (node === node.parent.left) {
                        node = node.parent;
                        this.rotateRight(node);
                    }
                    node.parent.color = 'black';
                    node.parent.parent.color = 'red';
                    this.rotateLeft(node.parent.parent);
                }
            }
        }
        this.root.color = 'black';
    }
  
    rotateLeft(node) {
        const rightChild = node.right;
        node.right = rightChild.left;
        if (rightChild.left) {
            rightChild.left.parent = node;
        }
        rightChild.parent = node.parent;
        if (!node.parent) {
            this.root = rightChild;
        } else if (node === node.parent.left) {
            node.parent.left = rightChild;
        } else {
            node.parent.right = rightChild;
        }
        rightChild.left = node;
        node.parent = rightChild;
    }
  
    rotateRight(node) {
        const leftChild = node.left;
        node.left = leftChild.right;
        if (leftChild.right) {
            leftChild.right.parent = node;
        }
        leftChild.parent = node.parent;
        if (!node.parent) {
            this.root = leftChild;
        } else if (node === node.parent.right) {
            node.parent.right = leftChild;
        } else {
            node.parent.left = leftChild;
        }
        leftChild.right = node;
        node.parent = leftChild;
    }
  
    remove(value, nodeNum) {
        let nodeToRemove = this.findNode(value, nodeNum);
        if (!nodeToRemove) return;
  
        if (nodeToRemove.left && nodeToRemove.right) {
            let successor = nodeToRemove.right;
            while (successor.left) {
                successor = successor.left;
            }
            nodeToRemove.value = successor.value;
            nodeToRemove = successor;
        }
  
        let child = nodeToRemove.left ? nodeToRemove.left : nodeToRemove.right;
        if (child) {
            child.parent = nodeToRemove.parent;
            if (!nodeToRemove.parent) {
                this.root = child;
            } else if (nodeToRemove === nodeToRemove.parent.left) {
                nodeToRemove.parent.left = child;
            } else {
                nodeToRemove.parent.right = child;
            }
            if (nodeToRemove.color === 'black') {
                this.fixRedBlackTreeAfterRemove(child);
            }
        } else if (!nodeToRemove.parent) {
            this.root = null;
        } else {
            if (nodeToRemove.color === 'black') {
                this.fixRedBlackTreeAfterRemove(nodeToRemove);
            }
            if (nodeToRemove.parent) {
                if (nodeToRemove === nodeToRemove.parent.left) {
                    nodeToRemove.parent.left = null;
                } else if (nodeToRemove === nodeToRemove.parent.right) {
                    nodeToRemove.parent.right = null;
                }
                nodeToRemove.parent = null;
            }
        }
    }
  
    fixRedBlackTreeAfterInsert(node) {
        while (node !== this.root && node.parent && node.parent.parent) {
            if (node.parent === node.parent.parent.left) {
                const uncle = node.parent.parent.right;
                if (uncle && uncle.color === 'red') {
                    node.parent.color = 'black';
                    uncle.color = 'black';
                    node.parent.parent.color = 'red';
                    node = node.parent.parent;
                } else {
                    if (node === node.parent.right) {
                        node = node.parent;
                        this.rotateLeft(node);
                    }
                    if (node.parent) {
                        node.parent.color = 'black';
                        if (node.parent.parent) {
                            node.parent.parent.color = 'red';
                            this.rotateRight(node.parent.parent);
                        }
                    }
                }
            } else {
                const uncle = node.parent.parent.left;
                if (uncle && uncle.color === 'red') {
                    node.parent.color = 'black';
                    uncle.color = 'black';
                    node.parent.parent.color = 'red';
                    node = node.parent.parent;
                } else {
                    if (node === node.parent.left) {
                        node = node.parent;
                        this.rotateRight(node);
                    }
                    if (node.parent) {
                        node.parent.color = 'black';
                        if (node.parent.parent) {
                            node.parent.parent.color = 'red';
                            this.rotateLeft(node.parent.parent);
                        }
                    }
                }
            }
        }
        this.root.color = 'black';
    }
  
    fixRedBlackTreeAfterRemove(node) {
        while (node !== this.root && (!node || node.color === 'black')) {
            if (node === node.parent.left) {
                let sibling = node.parent.right;
                if (sibling && sibling.color === 'red') {
                    sibling.color = 'black';
                    node.parent.color = 'red';
                    this.rotateLeft(node.parent);
                    sibling = node.parent.right;
                }
                if ((!sibling.left || sibling.left.color === 'black') && (!sibling.right || sibling.right.color === 'black')) {
                    sibling.color = 'red';
                    node = node.parent;
                } else {
                    if (!sibling.right || sibling.right.color === 'black') {
                        sibling.left.color = 'black';
                        sibling.color = 'red';
                        this.rotateRight(sibling);
                        sibling = node.parent.right;
                    }
                    sibling.color = node.parent.color;
                    node.parent.color = 'black';
                    sibling.right.color = 'black';
                    this.rotateLeft(node.parent);
                    node = this.root;
                }
            } else {
                let sibling = node.parent.left;
                if (sibling && sibling.color === 'red') {
                    sibling.color = 'black';
                    node.parent.color = 'red';
                    this.rotateRight(node.parent);
                    sibling = node.parent.left;
                }
                if ((!sibling.right || sibling.right.color === 'black') && (!sibling.left || sibling.left.color === 'black')) {
                    sibling.color = 'red';
                    node = node.parent;
                } else {
                    if (!sibling.left || sibling.left.color === 'black') {
                        sibling.right.color = 'black';
                        sibling.color = 'red';
                        this.rotateLeft(sibling);
                        sibling = node.parent.left;
                    }
                    sibling.color = node.parent.color;
                    node.parent.color = 'black';
                    sibling.left.color = 'black';
                    this.rotateRight(node.parent);
                    node = this.root;
                }
            }
        }
        if (node) node.color = 'black';
    }
  
    findNode(value, nodeNum) {
        let current = this.root;
        while (current) {
            if (value == current.value) {
                if (nodeNum == current.nodeNum) return current;
                if(nodeNum < current.nodeNum) current = current.left;
                else current = current.right;
            } else if (value < current.value) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return null;
    }
  
    getMin() {
        let current = this.root;
        while (current.left) {
            current = current.left;
        }
        return current;
    }
  
    getMax() {
        let current = this.root;
        while (current.right) {
            current = current.right;
        }
        return current;
    }
  
  
    lowerBound(value) {
        let current = this.root;
        let lowerBoundNode = null;
  
        while (current) {
            if (value === current.value) {
                return current.value;
            } else if (value < current.value) {
                lowerBoundNode = current;
                current = current.left;
            } else {
                current = current.right;
            }
        }
  
        if (!lowerBoundNode) {
            return null;
        }
  
        return lowerBoundNode;
    }

    inOrderTraversal(node, result) {
        if (node !== null) {
            this.inOrderTraversal(node.left, result);
            result.push([node.value, node.nodeNum]);
            this.inOrderTraversal(node.right, result);
        }
    }

    toSortedSet() {
        const sortedSet = [];
        this.inOrderTraversal(this.root, sortedSet);
        return sortedSet;
    }

  }
  
  module.exports = {
    RedBlackTree
  }
  
  // check lower bound against null to see if == set.end()
  
//   const rbTree = new RedBlackTree();
  
//   rbTree.insert(8, 1);
//   rbTree.insert(10, 1);
//   rbTree.insert(5, 2);

//   console.log(rbTree.lowerBound(8));
//   rbTree.insert(5, 4);
//   rbTree.insert(15, 5);
//   rbTree.insert(3, 1);
//   rbTree.insert(7, 10);
//   rbTree.insert(12, 1);
//   rbTree.insert(18, 2);
//   rbTree.insert(18, 1);

//   rbTree.remove(5, 4);
  
//   console.log(rbTree.toSortedSet());

//   console.log(rbTree.lowerBound(17));
//   rbTree.remove(18);
//   console.log(rbTree.lowerBound(17));
//   rbTree.remove(18);
//   console.log(rbTree.lowerBound(17));
//   console.log(rbTree.getMax());
//   console.log(rbTree.getMin());
  
//   rbTree.remove(8);
  
//   console.log(rbTree.lowerBound(8));