import { Graph } from "./types";

const scc: (graph: number[][]) => {
  components: number[][];
} = require("strongly-connected-components");

export function componentizeGraph(graph: Graph): number[][] {
  const nodes = graph.nodes;
  const nodeToIndex = new Map<number, number>();
  nodes.forEach((n, i) => nodeToIndex.set(n.id, i));

  const gr: number[][] = nodes.map(() => []);
  graph.links.forEach((link) => {
    const targetIndex = nodeToIndex.get(link.target)!;
    const sourceTarget = nodeToIndex.get(link.source)!;
    gr[sourceTarget].push(targetIndex);
  });

  const components = scc(gr).components.map((c) => c.map((i) => nodes[i].id));
  return components;
}
