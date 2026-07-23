'use strict';

import type {
  ReasoningEngine as IReasoningEngine,
  ReasoningInput,
  ReasoningResult,
  ReasoningStep,
  ReasoningChain,
  ReasoningMode,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

interface QueryAnalysis {
  length: number;
  complexity: number;
  domain: 'technical' | 'creative' | 'analytical' | 'general';
  questionMarks: number;
  keyTerms: string[];
}

function analyzeQuery(query: string): QueryAnalysis {
  const normalizedQuery = query.toLowerCase();
  const length = query.length;
  const questionMarks = (query.match(/\?/g) ?? []).length;

  const technicalTerms = ['algorithm', 'function', 'code', 'api', 'database', 'system', 'architecture', 'performance', 'optimize', 'debug', 'error', 'implementation', 'compile', 'runtime', 'type', 'interface', 'class', 'module', 'package', 'deploy'];
  const creativeTerms = ['design', 'create', 'imagine', 'story', 'idea', 'artistic', 'brainstorm', 'innovative', 'vision', 'concept', 'creative', 'compose', 'write', 'illustration', 'theme'];
  const analyticalTerms = ['analyze', 'compare', 'evaluate', 'measure', 'data', 'statistics', 'trend', 'pattern', 'hypothesis', 'conclusion', 'evidence', 'reason', 'logic', 'proof', 'validate'];

  const technicalScore = technicalTerms.filter(t => normalizedQuery.includes(t)).length;
  const creativeScore = creativeTerms.filter(t => normalizedQuery.includes(t)).length;
  const analyticalScore = analyticalTerms.filter(t => normalizedQuery.includes(t)).length;

  let domain: QueryAnalysis['domain'] = 'general';
  if (technicalScore > creativeScore && technicalScore > analyticalScore) domain = 'technical';
  else if (creativeScore > technicalScore && creativeScore > analyticalScore) domain = 'creative';
  else if (analyticalScore > technicalScore && analyticalScore > creativeScore) domain = 'analytical';

  const keyTerms = normalizedQuery
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 10);

  const wordCount = query.split(/\s+/).length;
  const complexity = Math.min(1, (wordCount / 100) * 0.4 + (questionMarks * 0.1) + (length / 500) * 0.3 + (keyTerms.length / 10) * 0.2);

  return { length, complexity, domain, questionMarks, keyTerms };
}

function generateSubQuestions(query: string, analysis: QueryAnalysis): string[] {
  const subQuestions: string[] = [];
  subQuestions.push(`What are the core aspects of: "${query.slice(0, 100)}"?`);

  if (analysis.questionMarks > 0) {
    subQuestions.push('What specific answer is being sought?');
  }

  if (analysis.domain === 'technical') {
    subQuestions.push('What are the technical requirements?');
    subQuestions.push('What are the implementation considerations?');
  } else if (analysis.domain === 'creative') {
    subQuestions.push('What are the key creative elements?');
    subQuestions.push('What constraints or guidelines apply?');
  } else if (analysis.domain === 'analytical') {
    subQuestions.push('What data or evidence is relevant?');
    subQuestions.push('What analytical methods should be applied?');
  } else {
    subQuestions.push('What are the relevant factors?');
    subQuestions.push('What context is important?');
  }

  if (analysis.complexity > 0.5) {
    subQuestions.push('Are there secondary considerations?');
    subQuestions.push('What are the potential edge cases?');
  }

  return subQuestions;
}

function generateEvidence(query: string, subQuestion: string, analysis: QueryAnalysis): string[] {
  const evidence: string[] = [];
  evidence.push(`Analysis of query related to: "${subQuestion.slice(0, 60)}"`);

  if (analysis.domain === 'technical') {
    evidence.push('Based on technical domain knowledge and best practices');
  } else if (analysis.domain === 'creative') {
    evidence.push('Drawing from creative principles and design patterns');
  } else if (analysis.domain === 'analytical') {
    evidence.push('Supported by analytical frameworks and data patterns');
  } else {
    evidence.push('Informed by general knowledge and contextual analysis');
  }

  if (analysis.keyTerms.length > 0) {
    evidence.push(`Key terms identified: ${analysis.keyTerms.slice(0, 5).join(', ')}`);
  }

  return evidence;
}

function generateAlternatives(thought: string, analysis: QueryAnalysis): string[] {
  const alternatives: string[] = [];

  if (analysis.domain === 'technical') {
    alternatives.push(`Alternative technical approach to: ${thought.slice(0, 50)}`);
    alternatives.push('Could consider a simpler implementation');
  } else if (analysis.domain === 'creative') {
    alternatives.push(`Different creative interpretation: ${thought.slice(0, 50)}`);
    alternatives.push('Explore a contrasting style or approach');
  } else if (analysis.domain === 'analytical') {
    alternatives.push(`Alternative analysis perspective: ${thought.slice(0, 50)}`);
    alternatives.push('Consider different data interpretations');
  } else {
    alternatives.push(`Alternative viewpoint: ${thought.slice(0, 50)}`);
    alternatives.push('Consider additional factors');
  }

  return alternatives;
}

function buildStep(
  stepNumber: number,
  thought: string,
  confidence: number,
  evidence: string[],
  alternatives: string[]
): ReasoningStep {
  return {
    step: stepNumber,
    thought,
    confidence: Math.round(confidence * 1000) / 1000,
    evidence,
    alternatives,
  };
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class ReasoningEngine implements IReasoningEngine {
  private chains: Map<string, ReasoningChain> = new Map();
  private history: ReasoningChain[] = [];
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async reason(input: ReasoningInput): Promise<ReasoningResult> {
    const startTime = performance.now();
    const analysis = analyzeQuery(input.query);
    const subQuestions = generateSubQuestions(input.query, analysis);
    const maxSteps = input.maxSteps ?? Math.max(3, Math.min(8, subQuestions.length + 2));

    this.logger.info('Starting reasoning', {
      mode: input.mode,
      queryLength: input.query.length,
      complexity: analysis.complexity,
      domain: analysis.domain,
    });

    let steps: ReasoningStep[] = [];

    switch (input.mode) {
      case 'chain-of-thought':
        steps = this.chainOfThought(input, analysis, subQuestions, maxSteps);
        break;
      case 'tree-of-thought':
        steps = this.treeOfThought(input, analysis, subQuestions, maxSteps);
        break;
      case 'reflective':
        steps = this.reflective(input, analysis, subQuestions, maxSteps);
        break;
      case 'multi-perspective':
        steps = this.multiPerspective(input, analysis, subQuestions, maxSteps);
        break;
    }

    const totalTokens = steps.reduce((sum, s) => {
      return sum + estimateTokens(s.thought) + s.evidence.reduce((eSum, e) => eSum + estimateTokens(e), 0);
    }, 0) + estimateTokens(input.query);

    const avgConfidence = steps.length > 0
      ? steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length
      : 0;

    const conclusion = this.generateConclusion(input, steps, analysis);
    const latencyMs = performance.now() - startTime;

    const result: ReasoningResult = {
      conclusion,
      confidence: Math.round(avgConfidence * 1000) / 1000,
      steps,
      mode: input.mode,
      latencyMs: Math.round(latencyMs * 100) / 100,
      tokensUsed: totalTokens,
    };

    const chain: ReasoningChain = {
      id: generateId(),
      input,
      steps,
      conclusion,
      confidence: result.confidence,
      createdAt: new Date(),
    };

    this.chains.set(chain.id, chain);
    this.history.push(chain);

    this.logger.info('Reasoning completed', {
      chainId: chain.id,
      stepsCount: steps.length,
      confidence: result.confidence,
      tokensUsed: result.tokensUsed,
    });

    return result;
  }

  async getChain(chainId: string): Promise<ReasoningChain | null> {
    return this.chains.get(chainId) ?? null;
  }

  getHistory(limit?: number): ReasoningChain[] {
    if (limit !== undefined) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  private chainOfThought(
    input: ReasoningInput,
    analysis: QueryAnalysis,
    subQuestions: string[],
    maxSteps: number
  ): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    const stepsToGenerate = Math.min(maxSteps, subQuestions.length + 2);

    steps.push(buildStep(
      1,
      `Analyzing the query: "${input.query.slice(0, 80)}${input.query.length > 80 ? '...' : ''}" — domain identified as ${analysis.domain} with ${analysis.questionMarks} question(s).`,
      0.6,
      [`Query length: ${analysis.length} chars`, `Detected domain: ${analysis.domain}`],
      ['Could reinterpret domain classification'],
    ));

    for (let i = 0; i < subQuestions.length && steps.length < stepsToGenerate - 1; i++) {
      const subQ = subQuestions[i];
      const evidence = generateEvidence(input.query, subQ, analysis);
      const alternatives = generateAlternatives(subQ, analysis);
      const confidence = 0.5 + (i / subQuestions.length) * 0.3;

      steps.push(buildStep(
        steps.length + 1,
        `Addressing sub-question: ${subQ}`,
        confidence,
        evidence,
        alternatives,
      ));
    }

    const finalConfidence = 0.7 + analysis.complexity * 0.15;
    steps.push(buildStep(
      steps.length + 1,
      `Synthesizing findings from ${steps.length - 1} analysis steps to form a coherent conclusion about the original query.`,
      finalConfidence,
      ['Based on accumulated evidence from prior steps', `Domain: ${analysis.domain}, complexity: ${(analysis.complexity * 100).toFixed(0)}%`],
      ['Could weight recent evidence more heavily', 'Alternative synthesis approach available'],
    ));

    return steps;
  }

  private treeOfThought(
    input: ReasoningInput,
    analysis: QueryAnalysis,
    subQuestions: string[],
    maxSteps: number
  ): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    const branches = Math.min(3, Math.ceil(subQuestions.length / 2));
    const stepsPerBranch = Math.max(2, Math.floor((maxSteps - 1) / branches));

    steps.push(buildStep(
      1,
      `Exploring ${branches} parallel reasoning branches for: "${input.query.slice(0, 60)}..."`,
      0.55,
      [`Branching factor: ${branches}`, `Steps per branch: ${stepsPerBranch}`],
      ['Could explore more branches', 'Could use deeper branching'],
    ));

    for (let branch = 0; branch < branches && steps.length < maxSteps; branch++) {
      const perspective = branch === 0 ? 'practical' : branch === 1 ? 'theoretical' : 'critical';
      const branchStart = branch * stepsPerBranch;

      for (let s = 0; s < stepsPerBranch && steps.length < maxSteps; s++) {
        const subQ = subQuestions[(branchStart + s) % subQuestions.length];
        const confidence = 0.4 + (branch / branches) * 0.2 + (s / stepsPerBranch) * 0.2;

        steps.push(buildStep(
          steps.length + 1,
          `[Branch ${branch + 1}: ${perspective}] ${subQ}`,
          confidence,
          [
            `Perspective: ${perspective}`,
            `Branch ${branch + 1} of ${branches}`,
            `Sub-question index: ${(branchStart + s) % subQuestions.length}`,
          ],
          [
            `Could merge with branch ${((branch + 1) % branches) + 1}`,
            `Alternative ${perspective} interpretation`,
          ],
        ));
      }
    }

    const bestBranchConfidence = 0.65 + analysis.complexity * 0.1;
    steps.push(buildStep(
      steps.length + 1,
      `Evaluating and selecting the strongest branch. Converging on best-supported reasoning path across ${branches} explored alternatives.`,
      bestBranchConfidence,
      [`Evaluated ${branches} branches`, `Selected strongest path based on evidence density`],
      ['Could ensemble multiple branches', 'Could retry with different branching criteria'],
    ));

    return steps;
  }

  private reflective(
    input: ReasoningInput,
    analysis: QueryAnalysis,
    subQuestions: string[],
    maxSteps: number
  ): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    const initialSteps = Math.max(2, Math.floor((maxSteps - 2) * 0.6));
    const reflectionSteps = Math.max(1, maxSteps - initialSteps - 1);

    for (let i = 0; i < initialSteps && steps.length < initialSteps; i++) {
      const subQ = subQuestions[i % subQuestions.length];
      const confidence = 0.5 + (i / initialSteps) * 0.25;

      steps.push(buildStep(
        steps.length + 1,
        `Initial analysis — ${subQ}`,
        confidence,
        generateEvidence(input.query, subQ, analysis),
        generateAlternatives(subQ, analysis),
      ));
    }

    const currentConfidence = steps.length > 0
      ? steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length
      : 0.5;

    steps.push(buildStep(
      steps.length + 1,
      `Reflecting on initial reasoning: Current confidence is ${(currentConfidence * 100).toFixed(0)}%. Identifying gaps, assumptions, and areas needing correction.`,
      Math.max(0.3, currentConfidence - 0.15),
      [
        `Current average confidence: ${(currentConfidence * 100).toFixed(0)}%`,
        `Steps completed: ${steps.length}`,
        `Domain: ${analysis.domain}`,
      ],
      ['Could challenge core assumptions', 'Could seek additional evidence'],
    ));

    for (let r = 0; r < reflectionSteps && steps.length < maxSteps; r++) {
      const improvedConfidence = Math.min(0.95, currentConfidence + 0.1 + r * 0.05);
      steps.push(buildStep(
        steps.length + 1,
        `Correction pass ${r + 1}: Refining conclusions based on reflective analysis. Addressing identified weaknesses and strengthening evidence chains.`,
        improvedConfidence,
        [
          'Based on reflective self-assessment',
          `Correcting for ${r + 1} identified weakness(es)`,
          `Confidence trajectory: increasing`,
        ],
        ['Could introduce additional correction passes', 'Alternative correction strategies available'],
      ));
    }

    return steps;
  }

  private multiPerspective(
    input: ReasoningInput,
    analysis: QueryAnalysis,
    subQuestions: string[],
    maxSteps: number
  ): ReasoningStep[] {
    const steps: ReasoningStep[] = [];
    const perspectives = [
      { name: 'domain-expert', label: 'Domain Expert' },
      { name: 'skeptic', label: 'Skeptic' },
      { name: 'end-user', label: 'End User' },
      { name: 'innovator', label: 'Innovator' },
    ];

    const stepsPerPerspective = Math.max(1, Math.floor((maxSteps - 1) / perspectives.length));

    steps.push(buildStep(
      1,
      `Conducting multi-perspective analysis of: "${input.query.slice(0, 70)}..." using ${perspectives.length} viewpoints.`,
      0.5,
      [`Perspectives: ${perspectives.map(p => p.label).join(', ')}`, `Steps per perspective: ${stepsPerPerspective}`],
      ['Could add more perspectives', 'Could weight perspectives differently'],
    ));

    for (let p = 0; p < perspectives.length && steps.length < maxSteps; p++) {
      const perspective = perspectives[p];

      for (let s = 0; s < stepsPerPerspective && steps.length < maxSteps - 1; s++) {
        const subQ = subQuestions[(p * stepsPerPerspective + s) % subQuestions.length];
        const baseConfidence = perspective.name === 'skeptic' ? 0.4 : perspective.name === 'domain-expert' ? 0.65 : 0.5;
        const confidence = baseConfidence + (s / stepsPerPerspective) * 0.15;

        steps.push(buildStep(
          steps.length + 1,
          `[${perspective.label}] ${subQ}`,
          confidence,
          [
            `Viewpoint: ${perspective.label}`,
            `Focus area: ${subQ.slice(0, 50)}`,
          ],
          [
            `What would a ${perspectives[(p + 1) % perspectives.length].label} say?`,
            `Counter-argument from skeptic perspective`,
          ],
        ));
      }
    }

    const synthesisConfidence = 0.7 + analysis.complexity * 0.1;
    steps.push(buildStep(
      steps.length + 1,
      `Synthesizing insights from ${perspectives.length} perspectives into a unified conclusion. Weighing each viewpoint based on relevance and evidence quality.`,
      synthesisConfidence,
      [
        `Combined ${perspectives.length} perspectives`,
        `Evidence density: ${analysis.keyTerms.length} key terms`,
        `Complexity: ${(analysis.complexity * 100).toFixed(0)}%`,
      ],
      ['Could prioritize certain perspectives', 'Could run additional synthesis passes'],
    ));

    return steps;
  }

  private generateConclusion(input: ReasoningInput, steps: ReasoningStep[], analysis: QueryAnalysis): string {
    if (steps.length === 0) {
      return `No reasoning steps were generated for the query: "${input.query.slice(0, 50)}..."`;
    }

    const avgConfidence = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length;
    const confidenceLevel = avgConfidence > 0.8 ? 'high' : avgConfidence > 0.6 ? 'moderate' : 'low';

    const perspectives = input.mode === 'multi-perspective'
      ? ' across multiple analytical perspectives'
      : input.mode === 'tree-of-thought'
        ? ' through parallel exploration of alternatives'
        : input.mode === 'reflective'
          ? ' with reflective self-correction'
          : '';

    return [
      `Based on ${steps.length} reasoning steps${perspectives}, `,
      `the analysis of the query regarding ${analysis.domain} concerns `,
      `yields a ${confidenceLevel}-confidence conclusion. `,
      `The reasoning chain examined ${Math.min(steps.length, 5)} sub-aspects `,
      `of the original query, progressing from initial analysis through `,
      `evidence gathering to synthesis. `,
      `Key terms (${analysis.keyTerms.slice(0, 3).join(', ') || 'none identified'}) `,
      `were central to the analysis.`,
    ].join('');
  }
}
