import { createHash } from "crypto";
import { componentizeGraph } from "./componentizeGraph";
import type { Graph } from "./types";

export { Graph };

export function getNodeHashes(graph: Graph): Map<number, string> {
  const components = componentizeGraph(graph);
  const idToContent = new Map<number, string>();
  graph.nodes.forEach((node) => idToContent.set(node.id, node.contentHash));

  type IndexComponents = Map<number, number[]>;

  // the keys are the package keys and the values are a list of packages in the same group.
  const indexedComponent: IndexComponents = new Map(
    components
      .map((o) => o.map<[number, number[]]>((oo) => [oo, o]))
      .reduce((p, n) => [...p, ...n], [])
  );

  function getLinksFrom(graph: Graph, id: number): number[] {
    return graph.links.filter((l) => l.source === id).map((l) => l.target);
  }

  function getMapEntryFor(graph: Graph, id: number): [number, number[]] {
    return [id, getLinksFrom(graph, id)];
  }

  type IndexedTargets = Map<number, number[]>;
  const targets: IndexedTargets = new Map(
    graph.nodes.map((n) => getMapEntryFor(graph, n.id))
  );

  function getComponentHash(
    targets: IndexedTargets,
    component: number[],
    components: IndexComponents
  ): string {
    const hash = createHash("sha256");
    const contentOfComponent = component
      .map((c) => idToContent.get(c))
      .sort()
      .join("+");
    hash.update(contentOfComponent);
    const externalHash = component
      .map((n) =>
        targets
          .get(n)!
          .filter((t) => !component.includes(t))
          .sort()
          .map((n) => hash_package(targets, components)(n))
          .join("+")
      )
      .join("**");
    hash.update(externalHash);

    const innerGraph = component
      .sort()
      .map((c) =>
        targets
          .get(c)!
          .filter((v) => component.includes(v))
          .sort()
          .map((d) => `${c}=>${d}`)
          .join(";")
      )
      .join(";;");
    hash.update(innerGraph);

    const result = hash.digest("hex");
    return result;
  }

  const memo = new Map<number, string>();
  function hash_package(
    targets: IndexedTargets,
    components: IndexComponents
  ): (id: number) => string {
    const hashing = (id: number): string => {
      if (memo.has(id)) {
        return memo.get(id)!;
      }

      const hash = createHash("sha256");
      hash.update(idToContent.get(id)!);
      const component = components.get(id)!;
      const componentHash = getComponentHash(targets, component, components);
      hash.update(componentHash);
      const externalDepsHash = targets
        .get(id)!
        .filter((t) => !component.includes(t))
        .sort()
        .map((n) => hashing(n))
        .join("+");
      hash.update(externalDepsHash);

      const result = hash.digest("hex");
      memo.set(id, result);

      return result;
    };
    return hashing;
  }

  const hashing = hash_package(targets, indexedComponent);

  const result = new Map(graph.nodes.map((n) => [n.id, hashing(n.id)]));
  return result;
}
