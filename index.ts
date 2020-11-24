type GraphLink = { source: string, target: string };
type Graph = { nodes: string[], links: GraphLink[] };

import * as path from "path";
import { createHash } from "crypto";

const components: string[][] = require(path.join(process.cwd(), "components.json"));
const resolved_graph: Graph = require(path.join(process.cwd(), "resolved_graph.json"));

type IndexComponents = Map<string, string[]>;
const indexedComponent : IndexComponents = new Map(components.map(o => o.map<[string, string[]]>(oo => [oo, o])).reduce((p,n) => [...p, ...n], []));

function getLinksFrom(resolved_graph: Graph, name: string): string[] {
  return resolved_graph.links.filter(l => l.source === name).map(l => l.target);
}

function getMapEntryFor(resolved_graph: Graph, name: string): [string, string[]] {
  return [name, getLinksFrom(resolved_graph, name)]
}

type IndexedTargets = Map<string, string[]>;
const targets: IndexedTargets = new Map(resolved_graph.nodes.map(n => getMapEntryFor(resolved_graph, n)));

function getComponentHash(targets: IndexedTargets, component: string[], components: IndexComponents): string {
  const hash = createHash("sha256");
  const names = component.map(s => s.split("+")[0]).sort().join("+");
  hash.update(names);
  const externalHash = component.map(n => targets.get(n).filter(t => !component.includes(t)).sort().map(n => hash_package(targets, components)(n)).join("+")).join("**");
  hash.update(externalHash);

  const innerGraph = component.sort().map(c => targets.get(c).filter(v => component.includes(v)).sort().map(d => `${c}=>${d}`).join(";")).join(";;");
  hash.update(innerGraph);

  const result = hash.digest("hex");
  return result;
}

const memo = new Map<string, string>();
function hash_package(targets: IndexedTargets, components: IndexComponents): (name: string) => string {
  const hashing = (name: string): string => {
    if (memo.has(name)) {
      return memo.get(name)
    }

    const hash = createHash("sha256");
    const nameHash = name.split("+")[0];
    hash.update(nameHash);
    const component = components.get(name);
    const componentHash = getComponentHash(targets, component, components);
    hash.update(componentHash);
    const externalDepsHash = targets.get(name).filter(t => !component.includes(t)).sort().map(n => hashing(n)).join("+");
    hash.update(externalDepsHash);


    const result = name.split("+")[0] + "**" + hash.digest("hex").slice(0, 10);
    memo.set(name, result);

    return result;
  }
  return hashing;
}

const hashing = hash_package(targets, indexedComponent);

const result = resolved_graph.nodes.map(n => ({ node: n, hash: hashing(n) }));
console.log(JSON.stringify(result, undefined, 2))

