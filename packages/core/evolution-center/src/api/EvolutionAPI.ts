import { createLogger } from '../Logger.js';
import type { EvolutionCenter } from '../EvolutionCenter.js';

export interface APIRequest {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface APIResponse {
  status: number;
  body: unknown;
}

export class EvolutionAPI {
  private center: EvolutionCenter;
  private log = createLogger('EvolutionAPI');

  constructor(center: EvolutionCenter) {
    this.center = center;
  }

  async handleRequest(request: APIRequest): Promise<APIResponse> {
    const { method, path } = request;

    try {
      if (method === 'POST' && path === '/evolution/analysis') {
        return this.handleAnalysis(request);
      }
      if (method === 'POST' && path === '/evolution/backlog') {
        return this.handleBacklog(request);
      }
      if (method === 'POST' && path === '/evolution/roadmap') {
        return this.handleRoadmap(request);
      }
      if (method === 'POST' && path === '/evolution/feature') {
        return this.handleFeature(request);
      }
      if (method === 'POST' && path === '/evolution/bug') {
        return this.handleBug(request);
      }
      if (method === 'POST' && path === '/evolution/release') {
        return this.handleRelease(request);
      }
      if (method === 'POST' && path === '/evolution/approve') {
        return this.handleApproval(request);
      }
      if (method === 'GET' && path === '/evolution/dashboard') {
        return this.handleDashboard(request);
      }
      if (method === 'GET' && path === '/evolution/metrics') {
        return this.handleMetrics(request);
      }
      if (method === 'GET' && path === '/evolution/report') {
        return this.handleReport(request);
      }

      return { status: 404, body: { error: 'Not found' } };
    } catch (error) {
      this.log(`API error: ${error}`);
      return { status: 500, body: { error: 'Internal server error' } };
    }
  }

  private handleAnalysis(request: APIRequest): APIResponse {
    const metrics = request.body as any;
    return { status: 200, body: { analyses: this.center.getEvolutionEngine().getAllAnalyses() } };
  }

  private handleBacklog(request: APIRequest): APIResponse {
    const data = request.body as any;
    const item = this.center.getBacklogManager().createItem(data);
    return { status: 201, body: item };
  }

  private handleRoadmap(request: APIRequest): APIResponse {
    const data = request.body as any;
    const roadmap = this.center.getRoadmapEngine().createRoadmap(data.name, data.description, data.startDate, data.endDate);
    return { status: 201, body: roadmap };
  }

  private handleFeature(request: APIRequest): APIResponse {
    const data = request.body as any;
    const feature = this.center.getFeatureCenter().createFeature(data);
    return { status: 201, body: feature };
  }

  private handleBug(request: APIRequest): APIResponse {
    const data = request.body as any;
    const bug = this.center.getBugCenter().createBug(data);
    return { status: 201, body: bug };
  }

  private handleRelease(request: APIRequest): APIResponse {
    const data = request.body as any;
    const release = this.center.getReleaseManager().createRelease(data);
    return { status: 201, body: release };
  }

  private handleApproval(request: APIRequest): APIResponse {
    const data = request.body as any;
    const approval = this.center.getApprovalEngine().createRequest(data);
    return { status: 201, body: approval };
  }

  private handleDashboard(_request: APIRequest): APIResponse {
    return { status: 200, body: this.center.getDashboardManager().getAll() };
  }

  private handleMetrics(_request: APIRequest): APIResponse {
    return { status: 200, body: this.center.getMetrics() };
  }

  private handleReport(_request: APIRequest): APIResponse {
    return { status: 200, body: this.center.getReportGenerator().getAll() };
  }
}
