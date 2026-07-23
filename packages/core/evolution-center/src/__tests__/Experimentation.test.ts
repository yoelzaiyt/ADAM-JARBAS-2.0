import { describe, it, expect } from 'vitest';
import { Experimentation } from '../experimentation/Experimentation.js';

describe('Experimentation', () => {
  const exp = new Experimentation();

  it('creates Experimentation', () => { expect(exp).toBeDefined(); });

  it('creates experiment', () => {
    const experiment = exp.createExperiment({
      name: 'Button Color', description: 'Test red vs blue', hypothesis: 'Red converts better',
      status: 'draft', variants: [], targetMetric: 'conversion', minSampleSize: 1000, confidenceLevel: 0.95
    });
    expect(experiment.name).toBe('Button Color');
  });

  it('starts experiment', () => {
    const experiment = exp.createExperiment({
      name: 'Test', description: '', hypothesis: '', status: 'draft',
      variants: [], targetMetric: 'clicks', minSampleSize: 100, confidenceLevel: 0.95
    });
    exp.start(experiment.id);
    expect(exp.getById(experiment.id)!.status).toBe('running');
  });

  it('completes experiment with result', () => {
    const experiment = exp.createExperiment({
      name: 'Test', description: '', hypothesis: '', status: 'draft',
      variants: [], targetMetric: 'clicks', minSampleSize: 100, confidenceLevel: 0.95
    });
    exp.start(experiment.id);
    exp.complete(experiment.id, { winner: 'A', confidence: 0.98, metrics: { clicks: { control: 100, treatment: 150, lift: 50 } } });
    expect(exp.getById(experiment.id)!.result).toBeDefined();
  });

  it('adds variant', () => {
    const experiment = exp.createExperiment({
      name: 'Test', description: '', hypothesis: '', status: 'draft',
      variants: [], targetMetric: 'clicks', minSampleSize: 100, confidenceLevel: 0.95
    });
    const variant = exp.createVariant(experiment.id, { name: 'Control', description: '', weight: 50 });
    expect(variant).toBeDefined();
    expect(variant!.name).toBe('Control');
  });

  it('gets running experiments', () => {
    const running = exp.getRunning();
    expect(Array.isArray(running)).toBe(true);
  });
});
