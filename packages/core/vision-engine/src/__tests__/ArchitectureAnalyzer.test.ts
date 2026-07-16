import { describe, it, expect, beforeEach } from 'vitest';
import { ArchitectureAnalyzer } from '../ArchitectureAnalyzer.js';
import type { VisionAnalysisRequest, ArchitectureAnalysis } from '../interfaces.js';

describe('ArchitectureAnalyzer', () => {
  let analyzer: ArchitectureAnalyzer;

  beforeEach(() => {
    analyzer = new ArchitectureAnalyzer();
  });

  it('creates ArchitectureAnalyzer', () => {
    expect(analyzer).toBeDefined();
  });

  it('analyzes architecture', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['architecture'],
    };
    const result = await analyzer.analyze(request);
    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });

  it('detects architecture type', () => {
    const type = analyzer.detectArchitectureType(Buffer.from(''));
    expect(type).toBeDefined();
  });

  it('extracts rooms', () => {
    const architecture: ArchitectureAnalysis = {
      type: 'floor-plan',
      summary: 'Test',
      rooms: [
        { name: 'Living Room', type: 'living', area: 25 },
        { name: 'Kitchen', type: 'kitchen', area: 12 },
      ],
      objects: [],
    };
    const rooms = analyzer.extractRooms(architecture);
    expect(rooms).toHaveLength(2);
  });

  it('calculates total area', () => {
    const rooms = [
      { name: 'Living Room', type: 'living', area: 25 },
      { name: 'Kitchen', type: 'kitchen', area: 12 },
    ];
    const totalArea = analyzer.calculateTotalArea(rooms);
    expect(totalArea).toBe(37);
  });

  it('identifies rooms', () => {
    const rooms = analyzer.identifyRooms(Buffer.from(''));
    expect(rooms).toBeDefined();
    expect(rooms.length).toBeGreaterThan(0);
  });

  it('generates recommendations', () => {
    const architecture: ArchitectureAnalysis = {
      type: 'floor-plan',
      summary: 'Test',
      rooms: [],
      objects: [],
    };
    const recommendations = analyzer.generateRecommendations(architecture);
    expect(recommendations).toBeDefined();
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('safety check', () => {
    const architecture: ArchitectureAnalysis = {
      type: 'floor-plan',
      summary: 'Test',
      rooms: [],
      objects: ['door', 'window'],
    };
    const result = analyzer.safetyCheck(architecture);
    expect(result.safe).toBe(true);
  });
});
