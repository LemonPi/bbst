/**
 * Created by Johnson on 2017-01-07.
 */
const assert = require("assert");
const BST = require("../src/treap");

function isBSTSubtree(node) {
    // assumes node !== NIL
    if (node.left !== BST.NIL) {

    }
    return true;
}
function isBST(bst) {
    if (bst.root === BST.NIL) {
        return true;
    }
    return isBSTSubtree(bst.root);
}

function generateRandomBST(size) {
    const bst = new BST();
    for (let i = 0; i < size; ++i) {
        bst.insert({key: Math.round(Math.random() * size)});
    }
    return bst;
}
function generateRandomArray(size) {
    const arr = [];
    for (let i = 0; i < size; ++i) {
        arr.push(Math.round(Math.random() * size));
    }
    return arr;
}
function generateSequentialBST(size) {
    const bst = new BST();
    for (let key = 0; key < size; ++key) {
        bst.insert({key});
    }
    return bst;
}

describe("Balanced binary search tree implemented as a treap", function () {
    describe("#constructor", function () {
        it("should be able to create an empty BST", function () {
            const bst = new BST();
            assert(isBST(bst));
            assert.strictEqual(bst.size(), 0);
        });
    });
    let keys = [4, 1, 5, 2, 3, 7, 9, 8];
    let bst = new BST();
    describe("#insert, findFirst, findNext", function () {
        it("should be able to insert a data list, each datum with key property", function () {
            keys.forEach((key)=> {
                bst.insert({key});
            });
            assert(isBST(bst));
            assert(bst.size(), keys.length);
        });
        it("should not allow inserting data without key", function () {
            assert.throws(()=> {
                bst.insert({notKey: "something"});
            });
        });
        it("should be able to insert duplicate data", function () {
            const dupKey = 6;
            const dups = new Set();
            dups.add(bst.insert({
                key: dupKey,
                foo: "bar"
            }));
            dups.add(bst.insert({
                key: dupKey,
                baz: "qux"
            }));
            dups.add(bst.insert({
                key: dupKey,
                foo: "quo"
            }));

            assert(isBST(bst));
            assert(bst.size(), keys.length + dups.size);

            let node = bst.findFirst(dupKey);
            while (node !== BST.NIL) {
                assert(dups.has(node));
                assert(dups.delete(node));
                node = bst.findNext(node);
            }
            // finished finding all of them
            assert.strictEqual(dups.size, 0);
        });
    });
    describe("#find", function () {
        let bst = generateSequentialBST(1000);
        it("should find and return an existing node", function () {
            const key = 456;
            const found = bst.find(key);
            assert(found !== BST.NIL);
            assert.strictEqual(found.key, key);
        });
        it("should not find a non-existing node and return NIL", function () {
            const key = 1111;
            const found = bst.find(key);
            assert(found === BST.NIL);
        });
    });
    describe("#erase, eraseNode", function () {
        let bst = generateSequentialBST(10);
        it("should be able to erase by key equality", function () {
            bst.erase(6);
            assert(bst.find(6) === BST.NIL);
            assert(isBST(bst));
            assert.strictEqual(bst.size(), 9);
        });
        it("should be able to erase by node equality", function () {
            let node = bst.find(5);
            assert(node !== BST.NIL);
            bst.eraseNode(node);
            assert(bst.find(5) === BST.NIL);
            assert(isBST(bst));
        });
        let emptyBst = new BST();
        it("should not do anything on empty tree", function () {
            emptyBst.erase(6);
        });
        it("should not do anything when deleting non-existing key", function () {
            bst.erase(11);
        });
        describe("repeated erase of random elements", function () {
            const toErase = 10;
            let size = 100;
            let elems = generateRandomArray(size);
            let bst = new BST();
            elems.forEach((key)=> {
                bst.insert({key});
            });
            for (let erased = 0; erased < toErase; ++erased) {
                it(`erase ${erased+1} random element`, function () {
                    bst.erase(elems[erased]);
                    --size;
                    assert(bst.size(), size);
                });
            }
        });
    });
    describe("#changeKey", function () {
        let bst = generateSequentialBST(40);
        it("should allow changing a node's key directly without reinsertion", function () {
            let node = bst.find(12);
            bst.changeKey(node, 13);
            assert(isBST(bst));
        });
    });
    describe("#iteration", function () {
        let keys = [4, 1, 5, 2, 3, 7, 9, 8];
        let bst = new BST();
        keys.forEach((key)=> {
            bst.insert({key});
        });
        keys.sort();
        it("should be able to traverse inorder (on key value)", function () {
            let i = 0;
            for (let node of bst) {
                assert.strictEqual(node.key, keys[i++]);
            }
            assert.strictEqual(i,
                keys.length,
                `total traversed ${i} different from length ${keys.length}`);
        });
        describe("#reverseIterator", function () {
            it("should traverse in reverse order", function () {
                let i = keys.length - 1;
                for (let node of bst.reverseIterator()) {
                    assert.strictEqual(node.key, keys[i--]);
                }
                assert.strictEqual(i, -1, `should have finished traversal with i=-1, but i=${i}`);
            });
        });
    });
    describe("#balance - should achieve height = O(lg(n)) with high probability", function () {
        const ns = [1000, 10000, 100000, 1000000];
        ns.forEach(function (n) {
            it(`height with n = ${n}`, function () {
                let bst = generateSequentialBST(n);
                const expected = Math.log2(n);
                const height = bst.height();
                console.log(`lg(n): ${expected} height: ${height}`);
            });
        });
    });
    describe("#print", function () {
        it("should print nicely with ASCII box drawing characters", function () {
            let bst = generateRandomBST(10);
            bst.print();
        });
    });
});