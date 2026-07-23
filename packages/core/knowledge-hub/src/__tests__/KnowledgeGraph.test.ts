import { describe, it, expect } from 'vitest';
import { KnowledgeGraph } from '../KnowledgeGraph.js';

describe('KnowledgeGraph', () => {
  it('addNode creates node with id', async () => {
    const graph = new KnowledgeGraph();

    const node = await graph.addNode({
      type: 'concept',
      label: 'Machine Learning',
      tenantId: 't1',
      properties: {},
    });

    expect(node.id).toBeTruthy();
    expect(node.type).toBe('concept');
    expect(node.label).toBe('Machine Learning');
  });

  it('addEdge creates edge between nodes', async () => {
    const graph = new KnowledgeGraph();
    const nodeA = await graph.addNode({ type: 'concept', label: 'A', tenantId: 't1', properties: {} });
    const nodeB = await graph.addNode({ type: 'concept', label: 'B', tenantId: 't1', properties: {} });

    const edge = await graph.addEdge({
      source: nodeA.id,
      target: nodeB.id,
      type: 'related_to',
      properties: {},
    });

    expect(edge.id).toBeTruthy();
    expect(edge.source).toBe(nodeA.id);
    expect(edge.target).toBe(nodeB.id);
    expect(edge.type).toBe('related_to');
  });

  it('query filters by nodeTypes', async () => {
    const graph = new KnowledgeGraph();
    await graph.addNode({ type: 'concept', label: 'ML', tenantId: 't1', properties: {} });
    await graph.addNode({ type: 'person', label: 'Hinton', tenantId: 't1', properties: {} });
    await graph.addNode({ type: 'concept', label: 'DL', tenantId: 't1', properties: {} });

    const result = await graph.query({ nodeTypes: ['concept'] });

    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.every(n => n.type === 'concept')).toBe(true);
  });

  it('query with startNode does BFS', async () => {
    const graph = new KnowledgeGraph();
    const a = await graph.addNode({ type: 'concept', label: 'A', tenantId: 't1', properties: {} });
    const b = await graph.addNode({ type: 'concept', label: 'B', tenantId: 't1', properties: {} });
    const c = await graph.addNode({ type: 'concept', label: 'C', tenantId: 't1', properties: {} });
    await graph.addEdge({ source: a.id, target: b.id, type: 'link', properties: {} });
    await graph.addEdge({ source: b.id, target: c.id, type: 'link', properties: {} });

    const result = await graph.query({ startNode: a.id, maxDepth: 1 });

    expect(result.nodes.length).toBeGreaterThanOrEqual(1);
    expect(result.nodes.some(n => n.id === a.id)).toBe(true);
    expect(result.nodes.some(n => n.id === b.id)).toBe(true);
  });

  it('getNode returns node', async () => {
    const graph = new KnowledgeGraph();
    const created = await graph.addNode({ type: 'concept', label: 'Test', tenantId: 't1', properties: {} });

    const fetched = await graph.getNode(created.id);

    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.label).toBe('Test');
  });

  it('getNeighbors returns connected nodes', async () => {
    const graph = new KnowledgeGraph();
    const a = await graph.addNode({ type: 'concept', label: 'Center', tenantId: 't1', properties: {} });
    const b = await graph.addNode({ type: 'concept', label: 'Neighbor1', tenantId: 't1', properties: {} });
    const c = await graph.addNode({ type: 'concept', label: 'Neighbor2', tenantId: 't1', properties: {} });
    await graph.addEdge({ source: a.id, target: b.id, type: 'link', properties: {} });
    await graph.addEdge({ source: a.id, target: c.id, type: 'link', properties: {} });

    const result = await graph.getNeighbors(a.id);

    expect(result.nodes.length).toBeGreaterThanOrEqual(2);
    expect(result.edges.length).toBeGreaterThanOrEqual(2);
  });

  it('deleteNode removes node and edges', async () => {
    const graph = new KnowledgeGraph();
    const a = await graph.addNode({ type: 'concept', label: 'A', tenantId: 't1', properties: {} });
    const b = await graph.addNode({ type: 'concept', label: 'B', tenantId: 't1', properties: {} });
    await graph.addEdge({ source: a.id, target: b.id, type: 'link', properties: {} });

    await graph.deleteNode(a.id);

    const fetched = await graph.getNode(a.id);
    expect(fetched).toBeNull();

    const allEdges = (await graph.query({})).edges;
    expect(allEdges.some(e => e.source === a.id || e.target === a.id)).toBe(false);
  });

  it('search finds nodes by label', async () => {
    const graph = new KnowledgeGraph();
    await graph.addNode({ type: 'concept', label: 'Neural Network', tenantId: 't1', properties: {} });
    await graph.addNode({ type: 'concept', label: 'Decision Tree', tenantId: 't1', properties: {} });
    await graph.addNode({ type: 'concept', label: 'Support Vector Machine', tenantId: 't1', properties: {} });

    const results = await graph.search('neural', 't1');

    expect(results.length).toBe(1);
    expect(results[0].label).toBe('Neural Network');
  });
});
