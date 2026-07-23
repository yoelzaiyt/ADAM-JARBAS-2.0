import { randomUUID } from 'node:crypto';
import type {
  ClassificationEngine as IClassificationEngine,
  EmailCategory,
  EmailMessage,
  ClassificationResult,
} from './interfaces.js';

export class ClassificationEngine implements IClassificationEngine {
  private categories: EmailCategory[] = [];
  private confidenceThreshold = 0.6;

  constructor() {
    this.categories = [
      { id: '1', name: 'Comercial', keywords: ['venda', 'proposta', 'orçamento', 'cliente', 'negócio'], patterns: [], color: '#3b82f6', icon: '💰' },
      { id: '2', name: 'Financeiro', keywords: ['fatura', 'pagamento', 'boleto', 'nota fiscal', 'conta'], patterns: [], color: '#10b981', icon: '💵' },
      { id: '3', name: 'Jurídico', keywords: ['contrato', 'acordo', 'cláusula', 'legal', 'advogado'], patterns: [], color: '#8b5cf6', icon: '⚖️' },
      { id: '4', name: 'Suporte', keywords: ['problema', 'erro', 'bug', 'ajuda', 'suporte'], patterns: [], color: '#f59e0b', icon: '🛠️' },
      { id: '5', name: 'Marketing', keywords: ['campanha', 'marketing', 'promoção', 'lançamento'], patterns: [], color: '#ec4899', icon: '📣' },
      { id: '6', name: 'Projetos', keywords: ['projeto', 'sprint', 'entrega', 'milestone', 'roadmap'], patterns: [], color: '#06b6d4', icon: '📋' },
      { id: '7', name: 'RH', keywords: ['rh', 'recursos humanos', 'ferias', 'ponto', 'holerite'], patterns: [], color: '#84cc16', icon: '👥' },
      { id: '8', name: 'Compras', keywords: ['compra', 'pedido', 'fornecedor', 'estoque'], patterns: [], color: '#f97316', icon: '🛒' },
      { id: '9', name: 'Pessoal', keywords: ['pessoal', 'família', 'aniversário', 'festa'], patterns: [], color: '#6366f1', icon: '😊' },
    ];
  }

  async classify(message: EmailMessage): Promise<ClassificationResult> {
    const text = `${message.subject} ${message.textBody}`.toLowerCase();
    let bestMatch: { name: string; score: number; tags: string[] } = { name: 'Geral', score: 0, tags: [] };

    for (const cat of this.categories) {
      let score = 0;
      const matchedTags: string[] = [];
      for (const kw of cat.keywords) {
        if (text.includes(kw.toLowerCase())) {
          score += 0.2;
          matchedTags.push(kw);
        }
      }
      if (score > bestMatch.score) {
        bestMatch = { name: cat.name, score: Math.min(score, 1), tags: matchedTags };
      }
    }

    return {
      category: bestMatch.name,
      confidence: bestMatch.score,
      subcategories: bestMatch.tags,
      tags: bestMatch.tags,
    };
  }

  getCategories(): EmailCategory[] {
    return [...this.categories];
  }

  addCategory(category: Omit<EmailCategory, 'id'>): EmailCategory {
    const full: EmailCategory = { ...category, id: randomUUID() };
    this.categories.push(full);
    return full;
  }

  updateCategory(categoryId: string, updates: Partial<EmailCategory>): EmailCategory {
    const cat = this.categories.find(c => c.id === categoryId);
    if (!cat) throw new Error(`Category not found: ${categoryId}`);
    Object.assign(cat, updates, { id: categoryId });
    return cat;
  }

  deleteCategory(categoryId: string): void {
    this.categories = this.categories.filter(c => c.id !== categoryId);
  }

  getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }

  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = threshold;
  }
}
