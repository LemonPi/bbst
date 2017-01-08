/**
 * Created by Johnson on 2017-01-07.
 */

const NIL = {
    left    : null,
    right   : null,
    parent  : null,
    priority: Number.NEGATIVE_INFINITY
};

// core tree node utilities
function isLeftChild(node) {
    return node === node.parent.left;
}
function isRightChild(node) {
    return node === node.parent.right;
}

function treeMin(start) {
    while (start.left !== NIL) start = start.left;
    return start;
}

function treeMax(start) {
    while (start.right !== NIL) start = start.right;
    return start;
}

function treeFind(start, key) {
    while (start !== NIL && start.key !== key) {
        if (key < start.key) {
            start = start.left;
        } else {
            start = start.right;
        }
    }
    return start;
}

// binanry tree traversals
function preorderWalk(start, op) {
    if (start !== NIL) {
        op(start, op);
        preorderWalk(start.left, op);
        preorderWalk(start.right, op);
    }
}
function inorderWalk(start, op) {
    if (start !== NIL) {
        inorderWalk(start.left, op);
        op(start, op);
        inorderWalk(start.right, op);
    }
}
function postorderWalk(start, op) {
    if (start !== NIL) {
        postorderWalk(start.left, op);
        postorderWalk(start.right, op);
        op(start, op);
    }
}

/**
 * Print and indent a binary tree
 * adopted from Yoshi's response to http://stackoverflow.com/q/22038162
 * @param root Root node that has left and right
 * @param cfg String configuration for what characters to print depending
 * on node sibling/ancestor status
 * @param collector Collect strings for printing
 * @param indent Indent at this level
 */
function treeIndent(root, cfg, collector, indent) {
    indent = indent || [];

    const noRightChild = root.right === NIL;
    if (root.left !== NIL) {
        collector(root.left, indent.concat(noRightChild ? cfg.isLastChild : cfg.hasNextSibling));
        treeIndent(root.left,
            cfg,
            collector,
            indent.concat(noRightChild ? cfg.ancestorIsLastChild : cfg.ancestorHasNextSibling));
    } else if (!noRightChild) {
        // should print something to indicate the next one is right child and not left child
        collector(NIL, indent.concat(cfg.hasNextSibling));
    }
    if (root.right !== NIL) {
        collector(root.right, indent.concat(cfg.isLastChild));
        treeIndent(root.right, cfg, collector, indent.concat(cfg.ancestorIsLastChild));
    }
}

const consoleCharacters = {
    hasNextSibling        : "├",
    isLastChild           : "└",
    ancestorHasNextSibling: "│",
    ancestorIsLastChild   : " "
};
function printIndented(node, printer) {
    let str = [printer(node), "\n"];
    treeIndent(node, consoleCharacters, function (node, indent) {
        str.push(indent.join(" "), " ", printer(node), "\n");
    });
    str = str.join("");
    console.log(str);
    return str;
}

function printKey(node) {
    return node.key;
}

/**
 * Get node with smallest key greater than start
 * @param start{TreapNode}
 * @returns {TreapNode}
 */
function treeSuccessor(start) {
    if (start.right !== NIL) {
        return treeMin(start.right);
    }
    // else go up until a node that's the left child of parent
    let parent = start.parent;
    while (parent !== NIL && start === parent.right) {
        start = parent;
        parent = parent.parent;
    }
    return parent;
}
function treePredecessor(start) {
    if (start.left !== NIL) {
        return treeMax(start.left);
    }
    // else go up until a node that's the right child of parent
    let parent = start.parent;
    while (parent !== NIL && start === parent.left) {
        start = parent;
        parent = parent.parent;
    }
    return parent;
}

// tree statistics
function minHeight(start) {
    if (start === NIL) {
        return 0;
    }
    return 1 + Math.min(minHeight(start.left), minHeight(start.right));
}
function maxHeight(start) {
    if (start === NIL) {
        return 0;
    }
    return 1 + Math.max(maxHeight(start.left), maxHeight(start.right));
}

class TreapNode {
    constructor(data) {
        this.parent = NIL;
        this.left = NIL;
        this.right = NIL;
        this.priority = Math.random();
        Object.assign(this, data);
    }

}

class Treap {
    constructor() {
        this.root = NIL;
    }

    _heapFixUp(node) {
        while (node !== this.root && node.priority > node.parent.priority) {
            if (isLeftChild(node)) {
                this._rotateRight(node.parent);
            } else {
                this._rotateLeft(node.parent);
            }
        }
    }

    /**
     * Moves one subtree to replace another one
     * Move moved into old's position without deleting anything
     * Updating moved's children and erasing old is up to caller
     * @param old
     * @param moved
     */
    _transplant(old, moved) {
        // no parent must mean that old is root or NIL itself
        if (old.parent === NIL) {
            this.root = moved;
        } else if (isLeftChild(old)) {
            old.parent.left = moved;
        } else {
            old.parent.right = moved;
        }
        // can assign to parent unconditionally due to sentinel
        moved.parent = old.parent;
    }

    _rotateLeft(node) {
        const child = node.right;

        node.right = child.left;
        if (child.left !== NIL) {
            child.left.parent = node;
        }

        child.parent = node.parent;
        if (node.parent === NIL) {
            this.root = child;
        } else if (isLeftChild(node)) {
            node.parent.left = child;
        } else {
            node.parent.right = child;
        }

        child.left = node;
        node.parent = child;
    }

    _rotateRight(node) {
        const child = node.left;

        node.left = child.right;
        if (child.right !== NIL) {
            child.right.parent = node;
        }

        child.parent = node.parent;
        if (node.parent === NIL) {
            this.root = child;
        } else if (isLeftChild(node)) {
            node.parent.left = child;
        } else {
            node.parent.right = child;
        }

        child.right = node;
        node.parent = child;
    }

    _treeInsert(start, node) {
        let parent = NIL;
        while (start !== NIL) {
            parent = start;
            if (node.key < start.key) {
                start = start.left;
            } else {
                start = start.right;
            }
        }
        node.parent = parent;
        if (parent === NIL) {
            this.root = node;
        } else if (node.key < parent.key) {
            parent.left = node;
        } else {
            parent.right = node;
        }
    }

    _treapInsert(node) {
        this._treeInsert(this.root, node);
        this._heapFixUp(node);
    }

    _treapDelete(node) {
        // 4 cases based on the children of node
        // either no children or just one child
        // no left child, become right child
        if (node.left === NIL) {
            this._transplant(node, node.right);
        }// no right child, become left child
        else if (node.right === NIL) {
            this._transplant(node, node.left);
        }// else both children, find successor in right subtree
        else {
            let successor = treeMin(node.right);
            // not immediate right child
            if (successor.parent !== node) {
                // replace successor by its right child, then give successor node's right subtree
                this._transplant(successor, successor.right);
                successor.right = node.right;
                successor.right.parent = successor;
            }
            this._transplant(node, successor);
            successor.left = node.left;
            successor.left.parent = successor;
            // restore priority
            while (successor.priority < successor.left.priority ||
                   successor.priority < successor.right.priority) {
                if (successor.left.priority >
                    successor.right.priority) {
                    this._rotateRight(successor);
                } else {
                    this._rotateLeft(successor);
                }
            }
        }
        // delete node (garbage collection)
        node.left = NIL;
        node.right = NIL;
    }

    // PUBLIC API
    /**
     * Insert a node into the tree with data payload
     * Duplicate keys are acceptable, but deletion order is not guaranteed
     * @param data {Object} Node payload that should include property key
     * @returns {TreapNode} The node that was inserted
     */
    insert(data) {
        if (!Object.prototype.hasOwnProperty.call(data, "key")) {
            throw Error("data has no key property");
        }
        const node = new TreapNode(data);
        this._treapInsert(node);
        return node;
    }

    /**
     * Adjust the key of node in O(lgn) time.
     * This is faster than erasing and re-inserting a node from root if the change is small,
     * particularly if the tree is large
     * @param node
     * @param newKey
     */
    changeKey(node, newKey) {
        this._treapDelete(node);
        let goLeft = newKey < node.key;
        node.key = newKey;

        let parent = node.parent;
        if (goLeft) {
            while (parent !== this.root && node.key < parent.key) {
                parent = parent.parent;
            }
        } else {
            while (parent !== this.root && node.key > parent.key) {
                parent = parent.parent;
            }
        }
        // insert will take care of getting new parent
        this._treeInsert(parent, node);
        this._heapFixUp(node);
    }

    /**
     * Erase a found node
     * @param node
     */
    eraseNode(node) {
        if (node !== NIL) {
            this._treapDelete(node);
        }
    }

    /**
     * Erase a node if it exists that has value key
     * @param key
     */
    erase(key) {
        this.eraseNode(treeFind(this.root, key));
    }


    /**
     * Find a node and put it further up in the tree for temporal locality
     * @param key
     */
    findAndElevate(key) {
        const found = treeFind(this.root, key);
        if (found !== NIL) {
            found.priority *= 2;
            this._heapFixUp(found);
        }
        return found;
    }

    /**
     * Find a node with given key
     * @param key
     * @returns {TreapNode}
     */
    find(key) {
        return treeFind(this.root, key);
    }

    /**
     * Find the first node with a certain key that you suspect has duplicates
     * @param key
     */
    findFirst(key) {
        let node = treeFind(this.root, key);
        let preNode = treePredecessor(node);
        while (preNode !== NIL && preNode.key === key) {
            node = preNode;
            preNode = treePredecessor(preNode);
        }
        return node;
    }

    /**
     * Find the next node with the same key as node
     * @param node
     * @returns Next node with same key as node or NIL if none exists
     */
    findNext(node) {
        const found = treeSuccessor(node);
        return (found.key === node.key) ? found : NIL;
    }

    /**
     * Inorder traversal of nodes in O(n) time and O(1) memory.
     * In a complete traversal, touches 2n nodes where n = # nodes
     * @returns {{next: (function())}} Iterator
     */
    [Symbol.iterator]() {
        let prevNode;
        let node = treeMin(this.root);
        return {
            next: ()=> {
                prevNode = node;
                if (prevNode !== NIL) {
                    node = treeSuccessor(node);
                    return {
                        value: prevNode,
                        done : false
                    };
                } else {
                    return {
                        value: prevNode,
                        done : true
                    };
                }
            }
        }
    }

    reverseIterator() {
        return {
            [Symbol.iterator]: () => {
                let prevNode;
                let node = treeMax(this.root);
                return {
                    next: ()=> {
                        prevNode = node;
                        if (prevNode !== NIL) {
                            node = treePredecessor(node);
                            return {
                                value: prevNode,
                                done : false
                            };
                        } else {
                            return {
                                value: prevNode,
                                done : true
                            };
                        }
                    }
                }
            }
        };
    }

    size() {
        let num = 0;
        inorderWalk(this.root, ()=> {
            ++num;
        });
        return num;
    }

    height() {
        return maxHeight(this.root);
    }

    /**
     * Pretty print nodes with indent
     * @param printer Function for formatting what to print about each node
     */
    print(printer) {
        if (this.root !== NIL) {
            printer = printer || printKey;
            printIndented(this.root, printer);
        }
    }
}

// attach somethings to the class
Treap.NIL = NIL;

module.exports = Treap;
