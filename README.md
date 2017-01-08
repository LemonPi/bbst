# Balanced binary search trees in ES6 Javascript for Node.js and browsers
The underlying implementation is a [Treap](https://en.wikipedia.org/wiki/Treap), which provides balance with high probability. 
This implementation focuses on fast iteration, and provides generators for doing so.

Treaps are simple and fast. In most cases, it provides up to 4x faster inserts, and 2x faster erases than a similar RB tree implementation.

Deterministic behaviour can be achieved by seeding the RNG. This will come in a future release.

## Installation
Package name is `bbst`

```bash
npm install bbst --save
```

## Test
```bash
npm install mocha

npm test
```

## Usage
The API provides `insert`, `changeKey`, `find`, `erase`, iteration, `reverseIterator`, `size`, `height`, `print`, and variants of the above (to be covered in examples below).

First you need to include the module, which is easy in both node and a browser (look at index.html).

### node
```javascript
const BST = require("bbst");
```

### browser
```html
<html>
<head>
    <meta charset="UTF-8">
    <script src="src/treap.js"></script>
</head>
<body>
<script>
const BST = Treap;
</script>
</body>
</html>
```
From this point on, usage is the same on both platforms; let's assume we name the class `BST`.

### construction
```javascript
const bst = new BST();
```

### insert
Insert takes 1 object that is required to have a `key` property that can be compared. An `Error` will be thrown if something is inserted without a `key`. The inserted object can have any other property.
```javascript
bst.insert({key:1, name:"Buzz Lightyear"});
```

Duplicate keys are not guarenteed to remain in insertion order.
```javascript
bst.insert({key:1, name:"An imposter"});
// bst.find(1) will find them in a random order
```

### iteration
Iterating forward will do so in increasing key order
```javascript
for (let node of bst) {
  console.log(node.key);  // print keys smallest to largest
}
for (let node of bst.reverseIterator()) {
  console.log(node.key);  // print keys largest to smallest
}
```
This is very useful for game tree searches as you iterate through possible moves in place rather than creating and sorting them at each step. This is especially powerful combined with `changeKey`. For each step, instead of creating a new state, simply change the current one to the next one while tracking the changes. If you have n possible moves, at each step you use `O(1)` memory instead of `O(n)`. 

I use this in a minimax algorithm with alpha-beta pruning so that the best moves are explored first, which often causes most of the other moves to be pruned and thus not generated.

### changeKey
A small change to a key's value can be dealt with faster than deleting and reinserting the node with `changeKey`.
```javascript
const bst = new BST();
for (let key = 0; key < 1000000; ++key) {
  bst.insert({key});
}
const node = bst.find(4000);
// takes many fewer operations since it searches from node up
bst.changeKey(node, 4001);
```

### print
The tree comes with pretty printing that works in consoles and browsers, as well as returning the string.
```javascript
const bst = new BST();
for (let key = 0; key < 10; ++key) {
    bst.insert({key});
}
bst.print();
```
Results in something similar to
```
4
├ 1
│ ├ 0
│ └ 2
│   ├ 
│   └ 3
└ 9
  └ 7
    ├ 5
    │ ├ 
    │ └ 6
    └ 8
```

print accepts a custom printer function for printing more than just the node key.
```javascript
bst.print((node)=> {
  // return something printable, such as a string
  return node.key + ":" + node.name;
});
```



### find
All failed finds will return `BST.NIL`. The basic find retrieves the top-most node with matching key. 
```javascript
const node = bst.find(5);
const nonNode = bst.find(11);
assert(nonNode === BST.NIL);  // true
```
If there is temporal locality (you need it soon after you found it, but not immediately after), then `findAndElevate` will make subsequent finds faster.
```javascript
const hotNode = bst.find(5);
```
If your data has duplicate keys and you care about finding all of them or a specific one, then use `findFirst` and `findNext`.
`findFirst` takes the key to find, `findNext` takes the previous node (and is `O(1)` time).
```javascript
bst.insert({key:5, fruit:"Pomelo"});
bst.insert({key:5, fruit:"Tomato"});
let found = bst.findFirst(5);
while (found !== BST.NIL) {
  console.log(found.fruit);
  found = bst.findNext(found);
}
```

### erase
Erase the top-most node with a matching key, or do nothing if it doesn't exist
```javascript
bst.erase(5);
```
Erase a specific node, which is useful for duplicates and faster if you already found the node
```javascript
bst.erase(bst.find(5));
```

### size
Get number of nodes
```javascript
let bst = new BST();
bst.size(); // 0

for (let key = 0; key < 10; ++key) {
  bst.insert({key});
}
bst.size(); // 10
```

### height
Maximum pointer distance to root node. It is expected to be `O(lg(bst.size()))`, and is more likely with larger size.
```javascript
let bst = new BST();
bst.height(); // 0


for (let key = 0; key < 1000; ++key) {
  bst.insert({key});
}
bst.height(); // about lg(bst.size())
```
