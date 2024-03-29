export interface Node {
  id: number;
  contentHash: string;
}

export interface Link {
  source: number;
  target: number;
}

export interface Graph {
  nodes: Node[];
  links: Link[];
}
