import { randomUUID } from 'node:crypto';
import type {
  KnowledgeGraph as IKnowledgeGraph,
  GraphNode,
  GraphEdge,
  GraphQuery,
} from './interfaces.js';

export class KnowledgeGraph implements IKnowledgeGraph {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>();

  async addNode(node: Omit<GraphNode, 'id'>): Promise<GraphNode> {
    const id = randomUUID();
    const fullNode: GraphNode = { ...node, id };
    this.nodes.set(id, fullNode);
    return fullNode;
  }

  async addEdge(edge: Omit<GraphEdge, 'id'>): Promise<GraphEdge> {
    if (!this.nodes.has(edge.source)) {
      throw new Error(`Source node ${edge.source} does not exist`);
    }
    if (!this.nodes.has(edge.target)) {
      throw new Error(`Target node ${edge.target} does not exist`);
    }
    const id = randomUUID();
    const fullEdge: GraphEdge = { ...edge, id };
    this.edges.set(id, fullEdge);
    return fullEdge;
  }

  async query(
    query: GraphQuery,
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const maxDepth = query.maxDepth ?? 3;
    const limit = query.limit ?? 100;

    let matchedNodes: GraphNode[];
    let matchedEdges: GraphEdge[];

    if (query.startNode) {
      const { nodes: bfsNodes, edges: bfsEdges } = this.bfs(
        query.startNode,
        maxDepth,
      );
      matchedNodes = bfsNodes;
      matchedEdges = bfsEdges;
    } else {
      matchedNodes = [...this.nodes.values()];
      matchedEdges = [...this.edges.values()];
    }

    if (query.nodeTypes && query.nodeTypes.length > 0) {
      const types = new Set(query.nodeTypes);
      matchedNodes = matchedNodes.filter((n) => types.has(n.type));
    }

    if (query.tenantId) {
      matchedNodes = matchedNodes.filter((n) => n.tenantId === query.tenantId);
    }

    if (query.edgeTypes && query.edgeTypes.length > 0) {
      const types = new Set(query.edgeTypes);
      matchedEdges = matchedEdges.filter((e) => types.has(e.type));
    }

    const nodeIds = new Set(matchedNodes.map((n) => n.id));
    matchedEdges = matchedEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );

    matchedNodes = matchedNodes.slice(0, limit);

    return { nodes: matchedNodes, edges: matchedEdges };
  }

  async getNode(nodeId: string): Promise<GraphNode | null> {
    return this.nodes.get(nodeId) ?? null;
  }

  async getNeighbors(
    nodeId: string,
    depth = 1,
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    return this.bfs(nodeId, depth);
  }

  async deleteNode(nodeId: string): Promise<void> {
    this.nodes.delete(nodeId);
    for (const [edgeId, edge] of this.edges) {
      if (edge.source === nodeId || edge.target === nodeId) {
        this.edges.delete(edgeId);
      }
    }
  }

  async deleteEdge(edgeId: string): Promise<void> {
    this.edges.delete(edgeId);
  }

  async search(query: string, tenantId: string): Promise<GraphNode[]> {
    const lowerQuery = query.toLowerCase();
    return [...this.nodes.values()].filter((node) => {
      if (node.tenantId !== tenantId) return false;
      if (node.label.toLowerCase().includes(lowerQuery)) return true;
      for (const value of Object.values(node.properties)) {
        if (
          typeof value === 'string' &&
          value.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
      }
      return false;
    });
  }

  private bfs(
    startNodeId: string,
    maxDepth: number,
  ): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const resultNodes: GraphNode[] = [];
    const resultEdges: GraphEdge[] = [];

    const startNode = this.nodes.get(startNodeId);
    if (!startNode) {
      return { nodes: [], edges: [] };
    }

    const queue: { nodeId: string; depth: number }[] = [
      { nodeId: startNodeId, depth: 0 },
    ];
    visitedNodes.add(startNodeId);

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      const node = this.nodes.get(nodeId);
      if (node) {
        resultNodes.push(node);
      }

      if (depth >= maxDepth) continue;

      for (const edge of this.edges.values()) {
        if (edge.source !== nodeId && edge.target !== nodeId) continue;

        const neighborId =
          edge.source === nodeId ? edge.target : edge.source;

        if (!visitedEdges.has(edge.id)) {
          visitedEdges.add(edge.id);
          resultEdges.push(edge);
        }

        if (!visitedNodes.has(neighborId)) {
          visitedNodes.add(neighborId);
          queue.push({ nodeId: neighborId, depth: depth + 1 });
        }
      }
    }

    return { nodes: resultNodes, edges: resultEdges };
  }
}
