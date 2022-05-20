import { getNodeHashes } from ".";
import type { Graph } from "./types";

describe("graph with one node", () => {
  it("hash is independent of id", () => {
    const graph1: Graph = { nodes: [{ contentHash: "foo", id: 1 }], links: [] };
    const graph2: Graph = { nodes: [{ contentHash: "foo", id: 2 }], links: [] };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(2);

    expect(hash1).toEqual(hash2);
  }),
    it("hash depends on content hash", () => {
      const graph1: Graph = {
        nodes: [{ contentHash: "foo", id: 1 }],
        links: [],
      };
      const graph2: Graph = {
        nodes: [{ contentHash: "bar", id: 1 }],
        links: [],
      };

      const hash1 = getNodeHashes(graph1).get(1);
      const hash2 = getNodeHashes(graph2).get(1);

      expect(hash1).not.toEqual(hash2);
    });
});
describe("graph with two nodes", () => {
  it("hash is independent of order", () => {
    const graph1: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
      ],
      links: [],
    };
    const graph2: Graph = {
      nodes: [
        { contentHash: "bar", id: 2 },
        { contentHash: "foo", id: 1 },
      ],
      links: [],
    };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(1);

    expect(hash1).toEqual(hash2);

    const hash3 = getNodeHashes(graph1).get(2);
    const hash4 = getNodeHashes(graph2).get(2);

    expect(hash3).toEqual(hash4);
  });
  it("hash of a package depends on its dependencies", () => {
    const graph1: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
      ],
      links: [{ source: 1, target: 2 }],
    };
    const graph2: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "catfish", id: 2 },
      ],
      links: [{ source: 1, target: 2 }],
    };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(1);

    expect(hash1).not.toEqual(hash2);
  });
});

describe("graph with two nodes and a circular dependency", () => {
  it("hash is independent of order", () => {
    const graph1: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 1 },
      ],
    };
    const graph2: Graph = {
      nodes: [
        { contentHash: "bar", id: 2 },
        { contentHash: "foo", id: 1 },
      ],
      links: [
        { source: 2, target: 1 },
        { source: 1, target: 2 },
      ],
    };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(1);

    expect(hash1).toEqual(hash2);

    const hash3 = getNodeHashes(graph1).get(2);
    const hash4 = getNodeHashes(graph2).get(2);

    expect(hash3).toEqual(hash4);
  });

  it("hash of a package depends on its dependencies", () => {
    const graph1: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 1 },
      ],
    };
    const graph2: Graph = {
      nodes: [
        { contentHash: "catfish", id: 2 },
        { contentHash: "foo", id: 1 },
      ],
      links: [
        { source: 2, target: 1 },
        { source: 1, target: 2 },
      ],
    };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(1);

    expect(hash1).not.toEqual(hash2);
  });
});

describe("more complicated graph with circular dependencies", () => {
  it("package depending on a component depends on every package in this component", () => {
    const graph1: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
        { contentHash: "baz", id: 3 },
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 2 },
      ],
    };
    const graph2: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
        { contentHash: "catfish", id: 3 },
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 2 },
      ],
    };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(1);

    expect(hash1).not.toEqual(hash2);
  });
  it("every packages in a components depend on every dependency of every packages in this component", () => {
    const graph1: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
        { contentHash: "baz", id: 3 },
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 1 },
        { source: 2, target: 3 },
      ],
    };
    const graph2: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
        { contentHash: "catfish", id: 3 },
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 1 },
        { source: 2, target: 3 },
      ],
    };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(1);

    expect(hash1).not.toEqual(hash2);
  });
  it("ids in cycle does not matter", () => {
    const graph1: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 2 },
        { contentHash: "baz", id: 3 }
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 2 }
      ],
    };
    const graph2: Graph = {
      nodes: [
        { contentHash: "foo", id: 1 },
        { contentHash: "bar", id: 12 },
        { contentHash: "baz", id: 13 }
      ],
      links: [
        { source: 1, target: 12 },
        { source: 12, target: 13 },
        { source: 13, target: 12 }
      ],
    };

    const hash1 = getNodeHashes(graph1).get(1);
    const hash2 = getNodeHashes(graph2).get(1);

    expect(hash1).toEqual(hash2);
  });
});
