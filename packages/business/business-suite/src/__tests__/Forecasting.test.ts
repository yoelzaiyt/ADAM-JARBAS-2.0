import { describe, it, expect, beforeEach } from 'vitest';
import { Forecasting } from '../forecasting/Forecasting.js';

const CID = 'comp-1';

function historicalData(count = 6, base = 1000) {
  const data: { date: Date; value: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(2025, i, 1);
    data.push({ date: d, value: base + i * 100 });
  }
  return data;
}

describe('Forecasting', () => {
  let forecasting: Forecasting;

  beforeEach(() => {
    forecasting = new Forecasting();
  });

  it('generates a revenue forecast', async () => {
    const f = await forecasting.generateForecast({
      type: 'revenue', companyId: CID, period: '2025', historicalData: historicalData(),
    });
    expect(f.id).toBeDefined();
    expect(f.type).toBe('revenue');
    expect(f.dataPoints).toHaveLength(12);
    expect(f.summary.totalPredicted).toBeGreaterThan(0);
  });

  it('generates a forecast with confidence intervals', async () => {
    const f = await forecasting.generateForecast({
      type: 'expense', companyId: CID, period: '2025', historicalData: historicalData(), confidenceLevel: 0.99,
    });
    for (const dp of f.dataPoints) {
      expect(dp.lowerBound).toBeLessThan(dp.predicted);
      expect(dp.upperBound).toBeGreaterThan(dp.predicted);
      expect(dp.confidence).toBe(0.99);
    }
  });

  it('respects custom horizon', async () => {
    const f = await forecasting.generateForecast({
      type: 'cash_flow', companyId: CID, period: '2025', historicalData: historicalData(), horizon: 3,
    });
    expect(f.dataPoints).toHaveLength(3);
  });

  it('throws with fewer than 2 data points', async () => {
    await expect(forecasting.generateForecast({
      type: 'sales', companyId: CID, period: '2025', historicalData: [{ date: new Date(), value: 100 }],
    })).rejects.toThrow('At least 2 historical data points');
  });

  it('detects trend direction', async () => {
    const f = await forecasting.generateForecast({
      type: 'revenue', companyId: CID, period: '2025', historicalData: historicalData(6, 5000),
    });
    expect(['growing', 'declining', 'stable']).toContain(f.summary.trend);
  });

  it('updates actual values on forecast points', async () => {
    const f = await forecasting.generateForecast({
      type: 'revenue', companyId: CID, period: '2025', historicalData: historicalData(),
    });
    const dp = f.dataPoints[0];
    const updated = await forecasting.updateActualValue(f.id, dp.date, 999);
    expect(updated?.actual).toBe(999);
  });

  it('CRUD for forecasts', async () => {
    const f = await forecasting.createForecast({
      companyId: CID, type: 'capacity', period: '2025', dataPoints: [], summary: {
        totalPredicted: 0, averageConfidence: 0.95, trend: 'stable', seasonalityDetected: false, riskFactors: [],
      }, algorithm: 'linear',
    });
    expect(await forecasting.getForecastById(f.id)).toBeDefined();
    const updated = await forecasting.updateForecast(f.id, { period: '2026' });
    expect(updated.period).toBe('2026');
    expect(await forecasting.deleteForecast(f.id)).toBe(true);
  });
});
