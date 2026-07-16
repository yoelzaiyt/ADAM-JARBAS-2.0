import type { ValidationEngine as IValidationEngine, ValidationResult, ValidationError, ValidationRule, Document, ConnectorType } from './interfaces.js';

export class ValidationEngine implements IValidationEngine {
  private customRules: ValidationRule[] = [];

  async validateDocument(document: Document): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const requiredFields: [string, unknown][] = [
      ['id', document.id],
      ['title', document.title],
      ['content', document.content],
      ['tenantId', document.tenantId],
      ['sourceType', document.sourceType],
    ];

    for (const [field, value] of requiredFields) {
      if (value === undefined || value === null || value === '') {
        errors.push({
          field,
          message: `Field "${field}" is required`,
          severity: 'error',
        });
      }
    }

    if (document.content !== undefined && document.content !== null && document.content.trim().length === 0) {
      errors.push({
        field: 'content',
        message: 'Content must not be empty',
        severity: 'error',
      });
    }

    if (document.title !== undefined && document.title !== null && document.title.length === 0) {
      errors.push({
        field: 'title',
        message: 'Title must have a non-zero length',
        severity: 'error',
      });
    }

    if (document.tenantId !== undefined && document.tenantId !== null && document.tenantId.trim().length === 0) {
      errors.push({
        field: 'tenantId',
        message: 'TenantId must not be empty',
        severity: 'error',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => w.message),
      score: errors.length === 0 ? 1 : Math.max(0, 1 - errors.length * 0.2),
    };
  }

  async validateContent(content: string, rules?: ValidationRule[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const allRules = rules ?? [...this.getDefaultContentRules(), ...this.customRules];

    for (const rule of allRules) {
      const isValid = rule.validate(content);
      if (!isValid) {
        errors.push({
          field: 'content',
          message: rule.message,
          severity: 'error',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      score: errors.length === 0 ? 1 : Math.max(0, 1 - errors.length * 0.25),
    };
  }

  async validateSource(source: string, connectorType: ConnectorType): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const validConnectorTypes: ConnectorType[] = [
      'github', 'gitlab', 'bitbucket', 'google-drive', 'onedrive',
      'dropbox', 'nextcloud', 'sharepoint', 'obsidian', 'notion',
      'confluence', 'web', 'youtube',
    ];

    if (!validConnectorTypes.includes(connectorType)) {
      errors.push({
        field: 'connectorType',
        message: `Invalid connector type: "${connectorType}"`,
        severity: 'error',
      });
    }

    const isUrl = /^https?:\/\/.+/.test(source);
    const isFilePath = /^[a-zA-Z]:\\/.test(source) || /^\/[^/]/.test(source) || /^\.\.?[/\\]/.test(source);

    if (!isUrl && !isFilePath) {
      errors.push({
        field: 'source',
        message: 'Source must be a valid URL or file path',
        severity: 'error',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.map(w => w.message),
      score: errors.length === 0 ? 1 : 0,
    };
  }

  addRule(rule: ValidationRule): void {
    this.customRules.push(rule);
  }

  private getDefaultContentRules(): ValidationRule[] {
    return [
      {
        name: 'not-empty',
        validate: (input: unknown) => typeof input === 'string' && input.trim().length > 0,
        message: 'Content must not be empty',
      },
      {
        name: 'min-length',
        validate: (input: unknown) => typeof input === 'string' && input.length >= 10,
        message: 'Content must be at least 10 characters long',
      },
      {
        name: 'max-length',
        validate: (input: unknown) => typeof input === 'string' && input.length <= 1_000_000,
        message: 'Content must not exceed 1,000,000 characters',
      },
    ];
  }
}

export { ValidationEngine as Validation };
