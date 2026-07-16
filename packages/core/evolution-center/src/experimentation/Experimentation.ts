import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Experiment, ExperimentVariant, ExperimentResult, ExperimentStatus } from '../interfaces.js';

export class Experimentation {
  private experiments: Map<string, Experiment> = new Map();
  private log = createLogger('Experimentation');

  createExperiment(experiment: Omit<Experiment, 'id' | 'createdAt'>): Experiment {
    const newExp: Experiment = {
      ...experiment,
      id: generateId(),
      createdAt: new Date()
    };
    this.experiments.set(newExp.id, newExp);
    this.log(`Created experiment: ${newExp.name}`);
    return newExp;
  }

  start(id: string): boolean {
    const exp = this.experiments.get(id);
    if (!exp) return false;
    exp.status = 'running';
    exp.startDate = new Date();
    return true;
  }

  pause(id: string): boolean {
    const exp = this.experiments.get(id);
    if (!exp) return false;
    exp.status = 'paused';
    return true;
  }

  complete(id: string, result: ExperimentResult): boolean {
    const exp = this.experiments.get(id);
    if (!exp) return false;
    exp.status = 'completed';
    exp.endDate = new Date();
    exp.result = result;
    return true;
  }

  cancel(id: string): boolean {
    const exp = this.experiments.get(id);
    if (!exp) return false;
    exp.status = 'cancelled';
    exp.endDate = new Date();
    return true;
  }

  recordMetric(experimentId: string, variantId: string, metric: string, value: number): boolean {
    const exp = this.experiments.get(experimentId);
    if (!exp) return false;
    const variant = exp.variants.find(v => v.id === variantId);
    if (!variant) return false;
    variant.metrics[metric] = value;
    return true;
  }

  getById(id: string): Experiment | undefined {
    return this.experiments.get(id);
  }

  getAll(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  getRunning(): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.status === 'running');
  }

  getByStatus(status: ExperimentStatus): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.status === status);
  }

  getCompleted(): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.status === 'completed' && e.result);
  }

  createVariant(experimentId: string, variant: Omit<ExperimentVariant, 'id' | 'metrics'>): ExperimentVariant | null {
    const exp = this.experiments.get(experimentId);
    if (!exp) return null;
    const newVariant: ExperimentVariant = { ...variant, id: generateId(), metrics: {} };
    exp.variants.push(newVariant);
    return newVariant;
  }
}
