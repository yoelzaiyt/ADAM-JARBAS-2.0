import type {
  SkillInvocation as ISkillInvocation,
  SkillInvocationRequest,
  SkillInvocationResult,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

interface MockSkill {
  id: string;
  name: string;
  description: string;
  handler: (input: string, context?: Record<string, unknown>) => string;
}

const MOCK_SKILLS: MockSkill[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for information',
    handler: (input) => `Simulated web search results for: "${input}"`,
  },
  {
    id: 'code-analysis',
    name: 'Code Analysis',
    description: 'Analyze code for patterns and issues',
    handler: (input) => `Simulated code analysis of: "${input}"`,
  },
  {
    id: 'data-retrieval',
    name: 'Data Retrieval',
    description: 'Retrieve data from configured sources',
    handler: (input) => `Simulated data retrieval for: "${input}"`,
  },
];

export class SkillInvocation implements ISkillInvocation {
  private skillManager: unknown | null;
  private logger: Logger;
  private mockSkills: Map<string, MockSkill>;

  constructor(skillManager?: unknown, logger?: Logger) {
    this.skillManager = skillManager ?? null;
    this.logger = logger ?? {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };

    this.mockSkills = new Map();
    for (const skill of MOCK_SKILLS) {
      this.mockSkills.set(skill.id, skill);
    }
  }

  async invoke(request: SkillInvocationRequest): Promise<SkillInvocationResult> {
    const startTime = Date.now();

    if (this.skillManager) {
      this.logger.debug('Delegating invocation to SkillManager', {
        skillId: request.skillId,
      });

      const manager = this.skillManager as {
        invoke: (req: SkillInvocationRequest) => Promise<SkillInvocationResult>;
      };

      try {
        return await manager.invoke(request);
      } catch (err) {
        this.logger.error('SkillManager invocation failed, falling back to simulation', {
          skillId: request.skillId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.debug('Using simulated skill invocation', {
      skillId: request.skillId,
    });

    const mockSkill = this.mockSkills.get(request.skillId);

    if (!mockSkill) {
      this.logger.warn('Unknown skill requested, using fallback', {
        skillId: request.skillId,
      });

      return {
        skillId: request.skillId,
        output: `Skill "${request.skillId}" executed with input: "${request.input}" (simulated)`,
        toolCalls: [],
        tokensUsed: Math.floor(Math.random() * 200) + 50,
        latencyMs: Date.now() - startTime,
      };
    }

    const output = mockSkill.handler(request.input, request.context);
    const tokensUsed = Math.floor(Math.random() * 300) + 100;

    return {
      skillId: request.skillId,
      output,
      toolCalls: [
        {
          tool: mockSkill.id,
          args: { input: request.input, ...(request.context ?? {}) },
          result: output,
        },
      ],
      tokensUsed,
      latencyMs: Date.now() - startTime,
    };
  }

  async listAvailable(): Promise<{ id: string; name: string; description: string }[]> {
    if (this.skillManager) {
      this.logger.debug('Fetching available skills from SkillManager');

      const manager = this.skillManager as {
        list: () => Promise<{ id: string; name: string; description: string }[]>;
      };

      try {
        return await manager.list();
      } catch (err) {
        this.logger.error('SkillManager list failed, using mock skills', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.debug('Returning simulated available skills');

    return MOCK_SKILLS.map((skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
    }));
  }
}
