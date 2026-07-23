import type {
  Forecast,
  ForecastDataPoint,
  ForecastSummary,
  ForecastType,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface ForecastingConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface ForecastGenerateOptions {
  type: ForecastType;
  companyId: string;
  period: string;
  historicalData: { date: Date; value: number }[];
  horizon?: number;
  confidenceLevel?: number;
}

export class Forecasting {
  private logger = new DefaultLogger('forecasting');
  private forecasts = new Map<string, Forecast>();
  private config: ForecastingConfig;

  constructor(config?: ForecastingConfig) {
    this.config = config ?? {};
  }

  async createForecast(data: Omit<Forecast, 'id' | 'createdAt' | 'updatedAt'>): Promise<Forecast> {
    const now = new Date();
    const forecast: Forecast = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.forecasts.set(forecast.id, forecast);
    await this.logger.info('Forecast created', { id: forecast.id, type: forecast.type });
    return forecast;
  }

  async getForecastById(id: string): Promise<Forecast | undefined> {
    return this.forecasts.get(id);
  }

  async listForecasts(companyId: string, filters?: { type?: ForecastType; period?: string }): Promise<Forecast[]> {
    let results = Array.from(this.forecasts.values()).filter(f => f.companyId === companyId);
    if (filters?.type) results = results.filter(f => f.type === filters.type);
    if (filters?.period) results = results.filter(f => f.period === filters.period);
    return results;
  }

  async updateForecast(id: string, data: Partial<Forecast>): Promise<Forecast> {
    const existing = this.forecasts.get(id);
    if (!existing) throw new Error(`Forecast ${id} not found`);
    const updated: Forecast = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.forecasts.set(id, updated);
    await this.logger.info('Forecast updated', { id });
    return updated;
  }

  async deleteForecast(id: string): Promise<boolean> {
    const deleted = this.forecasts.delete(id);
    if (deleted) await this.logger.info('Forecast deleted', { id });
    return deleted;
  }

  async generateForecast(options: ForecastGenerateOptions): Promise<Forecast> {
    const { type, companyId, period, historicalData, horizon = 12, confidenceLevel = 0.95 } = options;

    if (historicalData.length < 2) {
      throw new Error('At least 2 historical data points are required');
    }

    const sorted = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime());
    const values = sorted.map(d => d.value);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;

    let trend = 0;
    for (let i = 1; i < n; i++) {
      trend += (values[i] - values[i - 1]);
    }
    trend /= (n - 1);

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const zScore = confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.95 ? 1.96 : 1.645;
    const lastDate = sorted[sorted.length - 1].date;

    const dataPoints: ForecastDataPoint[] = [];
    for (let i = 1; i <= horizon; i++) {
      const predicted = mean + trend * i;
      const margin = zScore * stdDev * Math.sqrt(1 + i / n);
      const date = new Date(lastDate);
      date.setMonth(date.getMonth() + i);
      dataPoints.push({
        date,
        predicted: Math.round(predicted * 100) / 100,
        lowerBound: Math.round((predicted - margin) * 100) / 100,
        upperBound: Math.round((predicted + margin) * 100) / 100,
        confidence: confidenceLevel,
      });
    }

    const totalPredicted = dataPoints.reduce((sum, dp) => sum + dp.predicted, 0);
    const averageConfidence = confidenceLevel;
    const lastValues = values.slice(-3);
    const recentTrend = lastValues.length > 1
      ? lastValues[lastValues.length - 1] - lastValues[0]
      : 0;
    const trendDirection: ForecastSummary['trend'] = recentTrend > mean * 0.02 ? 'growing' : recentTrend < -mean * 0.02 ? 'declining' : 'stable';

    const diffs: number[] = [];
    for (let i = 2; i < n; i++) {
      diffs.push((values[i] - values[i - 1]) * (values[i - 1] - values[i - 2]));
    }
    const signChanges = diffs.filter(d => d < 0).length;
    const seasonalityDetected = signChanges > n * 0.3;

    const riskFactors: string[] = [];
    if (stdDev > mean * 0.3) riskFactors.push('High volatility in historical data');
    if (n < 12) riskFactors.push('Limited historical data');
    if (trendDirection === 'declining') riskFactors.push('Declining trend detected');
    if (seasonalityDetected) riskFactors.push('Seasonality pattern detected');

    const summary: ForecastSummary = {
      totalPredicted: Math.round(totalPredicted * 100) / 100,
      averageConfidence,
      trend: trendDirection,
      seasonalityDetected,
      riskFactors,
    };

    const forecast = await this.createForecast({
      companyId,
      type,
      period,
      dataPoints,
      summary,
      algorithm: 'linear_regression_with_confidence',
    });

    await this.logger.info('Forecast generated', { id: forecast.id, type, horizon });
    return forecast;
  }

  async updateActualValue(forecastId: string, date: Date, actual: number): Promise<ForecastDataPoint | undefined> {
    const forecast = this.forecasts.get(forecastId);
    if (!forecast) throw new Error(`Forecast ${forecastId} not found`);
    const point = forecast.dataPoints.find(dp =>
      dp.date.getFullYear() === date.getFullYear() && dp.date.getMonth() === date.getMonth()
    );
    if (!point) return undefined;
    point.actual = actual;
    forecast.updatedAt = new Date();
    this.forecasts.set(forecastId, forecast);
    await this.logger.info('Actual value updated', { forecastId, date: date.toISOString(), actual });
    return point;
  }
}

export { Forecasting as default };
