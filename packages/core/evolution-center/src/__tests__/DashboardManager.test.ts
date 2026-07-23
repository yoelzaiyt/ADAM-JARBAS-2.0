import { describe, it, expect } from 'vitest';
import { DashboardManager } from '../dashboards/DashboardManager.js';

describe('DashboardManager', () => {
  const manager = new DashboardManager();

  it('creates DashboardManager', () => { expect(manager).toBeDefined(); });

  it('creates dashboard', () => {
    const d = manager.createDashboard('CTO View', 'cto', 'Executive metrics');
    expect(d.name).toBe('CTO View');
    expect(d.type).toBe('cto');
  });

  it('adds widget', () => {
    const d = manager.createDashboard('Test', 'quality', '');
    const w = manager.addWidget(d.id, { type: 'chart', title: 'Errors', dataSource: 'metrics', config: {}, position: { x: 0, y: 0, w: 6, h: 4 } });
    expect(w).toBeDefined();
    expect(w!.title).toBe('Errors');
  });

  it('removes widget', () => {
    const d = manager.createDashboard('Test', 'security', '');
    const w = manager.addWidget(d.id, { type: 'metric', title: 'W1', dataSource: '', config: {}, position: { x: 0, y: 0, w: 3, h: 2 } });
    manager.removeWidget(d.id, w!.id);
    expect(manager.getById(d.id)!.widgets.length).toBe(0);
  });

  it('gets by type', () => {
    manager.createDashboard('Security', 'security', '');
    expect(manager.getByType('security').length).toBeGreaterThan(0);
  });

  it('gets default dashboards', () => {
    const defaults = manager.getDefaultDashboards();
    expect(defaults.length).toBe(4);
  });
});
