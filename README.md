# hash-graph

hash-graph is a library that assignes a uniq hash to all the nodes in the graph. The hash is deterministic and stable, the same input will always produce the same output.
The hash is reflects the content of a node and the hash of its children. This means that if a node changes content, all ancestors will get a new hash. The is useful for cache invalidation.

The special feature of hash-graph is that it can hash graphs that have cycles. This feature is inspired from [this article](https://www.fugue.co/blog/2016-05-18-cryptographic-hashes-and-dependency-cycles.html).

## Usage

```javascript
const { getNodeHashes } = require("hash-graph");

const graph = {
  nodes: [
    { contentHash: "foo", id: 1 },
    { contentHash: "bar", id: 2 },
    { contentHash: "baz", id: 3 },
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 2 }, // Graph cycle!
  ],
};

const nodeHashes = getNodeHashes(graph);

const hash1 = nodeHashes.get(1);
const hash2 = nodeHashes.get(2);
const hash3 = nodeHashes.get(3);
```
