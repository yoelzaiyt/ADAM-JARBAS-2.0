// ─── Business Suite Interfaces ─────────────────────────────────────────────────
// Sprint 09 - @jarbas/business-suite

// ─── Company Manager ──────────────────────────────────────────────────────────

export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'archived';

export type TaxRegime = 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei';

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  legalName: string;
  cnpj: string;
  cpf?: string;
  ie?: string;
  im?: string;
  taxRegime: TaxRegime;
  size: CompanySize;
  status: CompanyStatus;
  industry: string;
  website?: string;
  email: string;
  phone: string;
  address: Address;
  logo?: string;
  parentCompanyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  code: string;
  cnpj: string;
  address: Address;
  phone: string;
  email: string;
  isHeadquarters: boolean;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  companyId: string;
  branchId?: string;
  name: string;
  code: string;
  parentId?: string;
  managerId?: string;
  costCenterId?: string;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCenter {
  id: string;
  companyId: string;
  name: string;
  code: string;
  parentId?: string;
  budget?: number;
  spent: number;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  companyId: string;
  departmentId: string;
  name: string;
  leadId?: string;
  memberIds: string[];
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  teamIds: string[];
  permissions: Permission[];
  status: 'active' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'owner' | 'admin' | 'manager' | 'user' | 'viewer' | 'guest';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
  conditions?: Record<string, unknown>;
}

// ─── CRM ──────────────────────────────────────────────────────────────────────

export type LeadSource = 'website' | 'whatsapp' | 'email' | 'phone' | 'referral' | 'social' | 'event' | 'cold_call' | 'partner' | 'other';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type OpportunityStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  notes?: string;
  assignedTo?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  companyId: string;
  leadId?: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  enterpriseId?: string;
  isPrimary: boolean;
  tags: string[];
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  companyId: string;
  title: string;
  value: number;
  currency: string;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate?: Date;
  contactId: string;
  enterpriseId?: string;
  assignedTo?: string;
  lostReason?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pipeline {
  id: string;
  companyId: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color?: string;
}

export interface FollowUp {
  id: string;
  companyId: string;
  leadId?: string;
  opportunityId?: string;
  contactId?: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'task';
  title: string;
  description?: string;
  scheduledAt: Date;
  completedAt?: Date;
  outcome?: string;
  assignedTo: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMProposal {
  id: string;
  companyId: string;
  opportunityId: string;
  title: string;
  value: number;
  currency: string;
  validUntil: Date;
  items: ProposalItem[];
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ─── ERP ──────────────────────────────────────────────────────────────────────

export type ProductType = 'product' | 'service' | 'digital' | 'subscription';

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  description?: string;
  type: ProductType;
  categoryId?: string;
  unitPrice: number;
  costPrice?: number;
  currency: string;
  taxRate?: number;
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  companyId: string;
  name: string;
  parentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPOrder {
  id: string;
  companyId: string;
  type: 'sale' | 'purchase' | 'transfer';
  orderNumber: string;
  status: 'draft' | 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  contactId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  expectedDate?: Date;
  completedDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'investment' | 'receivable' | 'payable';

export type TransactionStatus = 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled';

export type PaymentMethod = 'pix' | 'boleto' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'check';

export interface FinancialAccount {
  id: string;
  companyId: string;
  name: string;
  type: AccountType;
  bank?: string;
  agency?: string;
  accountNumber?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  companyId: string;
  type: 'income' | 'expense' | 'transfer';
  accountId: string;
  destinationAccountId?: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  dueDate?: Date;
  paymentMethod?: PaymentMethod;
  status: TransactionStatus;
  contactId?: string;
  costCenterId?: string;
  documentNumber?: string;
  notes?: string;
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashFlow {
  id: string;
  companyId: string;
  period: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  projections: CashFlowProjection[];
  createdAt: Date;
}

export interface CashFlowProjection {
  date: Date;
  expectedIncome: number;
  expectedExpense: number;
  confidence: number;
}

export interface BankReconciliation {
  id: string;
  companyId: string;
  accountId: string;
  statementDate: Date;
  statementBalance: number;
  systemBalance: number;
  difference: number;
  items: ReconciliationItem[];
  status: 'pending' | 'reconciled' | 'discrepancy';
  reconciledBy?: string;
  reconciledAt?: Date;
  createdAt: Date;
}

export interface ReconciliationItem {
  id: string;
  transactionId?: string;
  description: string;
  amount: number;
  date: Date;
  matched: boolean;
  matchedTransactionId?: string;
}

// ─── Accounting ───────────────────────────────────────────────────────────────

export interface ChartOfAccounts {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;
  date: Date;
  description: string;
  lines: JournalLine[];
  status: 'draft' | 'posted' | 'reversed';
  postedBy?: string;
  postedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface TrialBalance {
  id: string;
  companyId: string;
  period: string;
  accounts: TrialBalanceAccount[];
  totalDebit: number;
  totalCredit: number;
  generatedAt: Date;
}

export interface TrialBalanceAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface FinancialStatement {
  id: string;
  companyId: string;
  type: 'dre' | 'balance_sheet' | 'cash_flow';
  period: string;
  data: Record<string, unknown>;
  generatedAt: Date;
}

// ─── Treasury ─────────────────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  companyId: string;
  name: string;
  bank: string;
  agency: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'investment';
  balance: number;
  availableBalance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investment {
  id: string;
  companyId: string;
  bankAccountId: string;
  type: 'cdb' | 'lci' | 'lca' | 'tesouro_direto' | 'fund' | 'stock' | 'other';
  name: string;
  principal: number;
  currentValue: number;
  rate: number;
  rateType: 'fixed' | 'cdi' | 'ipca' | 'market';
  startDate: Date;
  maturityDate?: Date;
  status: 'active' | 'matured' | 'redeemed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  companyId: string;
  bankAccountId: string;
  lender: string;
  principal: number;
  outstandingBalance: number;
  rate: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'paid' | 'defaulted';
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export interface SalesTarget {
  id: string;
  companyId: string;
  name: string;
  period: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  assignedTo?: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  id: string;
  companyId: string;
  salesPersonId: string;
  opportunityId: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  period: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Purchasing ───────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  cnpj: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  paymentTerms?: string;
  rating: number;
  isActive: boolean;
  tags: string[];
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseQuote {
  id: string;
  companyId: string;
  supplierId: string;
  items: PurchaseQuoteItem[];
  totalAmount: number;
  currency: string;
  validUntil: Date;
  status: 'requested' | 'received' | 'approved' | 'rejected';
  requestedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseQuoteItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  companyId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  maximumStock?: number;
  averageCost: number;
  location?: string;
  lotNumber?: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  code: string;
  address?: Address;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  warehouseId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// ─── Logistics ────────────────────────────────────────────────────────────────

export interface Carrier {
  id: string;
  companyId: string;
  name: string;
  cnpj: string;
  contactEmail?: string;
  contactPhone?: string;
  trackingUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  companyId: string;
  orderId: string;
  carrierId: string;
  trackingCode?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'returned';
  origin: Address;
  destination: Address;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  freightCost: number;
  weight?: number;
  volume?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── HR ───────────────────────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'suspended';

export interface Employee {
  id: string;
  companyId: string;
  userId: string;
  registrationNumber: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate?: Date;
  gender?: string;
  maritalStatus?: string;
  phone?: string;
  email: string;
  address?: Address;
  departmentId: string;
  position: string;
  admissionDate: Date;
  terminationDate?: Date;
  salary: number;
  currency: string;
  status: EmployeeStatus;
  managerId?: string;
  bankAccountId?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  documents: EmployeeDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeDocument {
  id: string;
  type: 'ctps' | 'pis' | 'cnh' | 'voter_title' | 'military_cert' | 'birth_cert' | 'marriage_cert' | 'education' | 'other';
  number: string;
  expiryDate?: Date;
  documentUrl?: string;
}

export interface OrganizationalChart {
  id: string;
  companyId: string;
  name: string;
  rootDepartmentId: string;
  nodes: OrgChartNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgChartNode {
  departmentId: string;
  parentId?: string;
  managerId?: string;
  name: string;
}

export interface Vacation {
  id: string;
  companyId: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'requested' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  approvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Training {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  instructor?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  maxParticipants?: number;
  participants: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceEvaluation {
  id: string;
  companyId: string;
  employeeId: string;
  evaluatorId: string;
  period: string;
  scores: EvaluationScore[];
  overallScore: number;
  comments?: string;
  status: 'draft' | 'submitted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationScore {
  criterion: string;
  score: number;
  maxScore: number;
  comment?: string;
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export interface PayrollRecord {
  id: string;
  companyId: string;
  employeeId: string;
  period: string;
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  currency: string;
  status: 'draft' | 'approved' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface Benefit {
  id: string;
  companyId: string;
  employeeId: string;
  type: 'health_insurance' | 'dental' | 'meal_voucher' | 'transport_voucher' | 'life_insurance' | 'gym' | 'other';
  description: string;
  monthlyValue: number;
  employerContribution: number;
  employeeContribution: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Legal ────────────────────────────────────────────────────────────────────

export type LegalProcessStatus = 'active' | 'suspended' | 'closed' | 'appeal';

export interface LegalProcess {
  id: string;
  companyId: string;
  number: string;
  type: 'civil' | 'criminal' | 'labor' | 'administrative' | 'tax';
  description: string;
  court?: string;
  judge?: string;
  lawyer?: string;
  parties: LegalParty[];
  status: LegalProcessStatus;
  nextHearing?: Date;
  deadline?: Date;
  value?: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalParty {
  name: string;
  cpfCnpj: string;
  role: 'plaintiff' | 'defendant' | 'third_party';
}

export interface LegalOpinion {
  id: string;
  companyId: string;
  processId?: string;
  title: string;
  content: string;
  author: string;
  status: 'draft' | 'reviewed' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export type ContractStatus = 'draft' | 'active' | 'suspended' | 'expired' | 'terminated';

export interface Contract {
  id: string;
  companyId: string;
  title: string;
  type: 'client' | 'supplier' | 'employee' | 'partner' | 'nda' | 'other';
  counterparty: string;
  counterpartyId?: string;
  value?: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  autoRenew: boolean;
  status: ContractStatus;
  terms: string;
  attachments: string[];
  alerts: ContractAlert[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractAlert {
  id: string;
  type: 'renewal' | 'expiry' | 'payment' | 'review';
  alertDate: Date;
  message: string;
  acknowledged: boolean;
}

// ─── Compliance ───────────────────────────────────────────────────────────────

export type ComplianceType = 'lgpd' | 'iso_27001' | 'sox' | 'pci_dss' | 'other';

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'pending_review';

export interface ComplianceRecord {
  id: string;
  companyId: string;
  type: ComplianceType;
  requirement: string;
  description: string;
  status: ComplianceStatus;
  evidence?: string;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  responsiblePerson?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditRecord {
  id: string;
  companyId: string;
  type: string;
  title: string;
  scope: string;
  auditor: string;
  findings: AuditFinding[];
  overallResult: 'pass' | 'fail' | 'partial';
  startDate: Date;
  endDate?: Date;
  reportUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
  dueDate?: Date;
}

// ─── Marketing ────────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  companyId: string;
  name: string;
  type: 'email' | 'social' | 'ads' | 'content' | 'event' | 'mixed';
  status: CampaignStatus;
  budget?: number;
  spent: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: string;
  channels: string[];
  metrics: CampaignMetrics;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  revenue: number;
  roi: number;
}

export interface SocialMediaPost {
  id: string;
  companyId: string;
  campaignId?: string;
  platform: 'linkedin' | 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'youtube';
  content: string;
  mediaUrls: string[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics: SocialMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMetrics {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement: number;
}

// ─── Customer Success ─────────────────────────────────────────────────────────

export type CSHealth = 'healthy' | 'at_risk' | 'critical' | 'churned';

export interface CustomerSuccessRecord {
  id: string;
  companyId: string;
  contactId: string;
  health: CSHealth;
  npsScore?: number;
  satisfactionScore?: number;
  lastContactDate?: Date;
  renewalDate?: Date;
  contractValue: number;
  notes?: string;
  assignedTo: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingRecord {
  id: string;
  companyId: string;
  contactId: string;
  steps: OnboardingStep[];
  currentStep: number;
  totalSteps: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startDate?: Date;
  completedDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  assignedTo?: string;
}

// ─── Service Desk ─────────────────────────────────────────────────────────────

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  companyId: string;
  number: string;
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: TicketPriority;
  status: TicketStatus;
  contactId: string;
  assignedTo?: string;
  slaDeadline?: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  tags: string[];
  attachments: string[];
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  content: string;
  attachments: string[];
  createdAt: Date;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  spent: number;
  currency: string;
  managerId: string;
  teamIds: string[];
  tags: string[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  priority: ProjectPriority;
  status: 'backlog' | 'in_progress' | 'done';
  storyPoints?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  epicId?: string;
  sprintId?: string;
  title: string;
  description?: string;
  type: 'feature' | 'bug' | 'improvement' | 'task' | 'spike';
  priority: ProjectPriority;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  assigneeId?: string;
  reporterId: string;
  estimatedHours?: number;
  loggedHours?: number;
  storyPoints?: number;
  dependencies: string[];
  tags: string[];
  checklist: ChecklistItem[];
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed';
  completedPoints: number;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Kanban ───────────────────────────────────────────────────────────────────

export interface KanbanBoard {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  columns: KanbanColumn[];
  labels: KanbanLabel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  name: string;
  order: number;
  color?: string;
  wipLimit?: number;
  cardIds: string[];
}

export interface KanbanCard {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  labels: string[];
  dueDate?: Date;
  order: number;
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

// ─── BI ───────────────────────────────────────────────────────────────────────

export interface Dashboard {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  type: 'executive' | 'finance' | 'crm' | 'projects' | 'hr' | 'marketing' | 'sales' | 'legal' | 'custom';
  profileRole: UserRole;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge' | 'alert' | 'insight';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  position: WidgetPosition;
  refreshInterval?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
}

export interface KPI {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category: string;
  value: number;
  target?: number;
  unit: string;
  currency?: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  period: string;
  formula?: string;
  dataSource: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Forecasting ──────────────────────────────────────────────────────────────

export type ForecastType = 'revenue' | 'expense' | 'cash_flow' | 'sales' | 'hiring' | 'projects' | 'capacity';

export interface Forecast {
  id: string;
  companyId: string;
  type: ForecastType;
  period: string;
  dataPoints: ForecastDataPoint[];
  summary: ForecastSummary;
  algorithm: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastDataPoint {
  date: Date;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  actual?: number;
}

export interface ForecastSummary {
  totalPredicted: number;
  averageConfidence: number;
  trend: 'growing' | 'declining' | 'stable';
  seasonalityDetected: boolean;
  riskFactors: string[];
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsDashboard {
  id: string;
  companyId: string;
  name: string;
  modules: AnalyticsModule[];
  refreshInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsModule {
  id: string;
  name: string;
  metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  unit: string;
}

export interface AnalyticsChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: Record<string, unknown>[];
  xAxis?: string;
  yAxis?: string;
}

// ─── Workflow Engine ──────────────────────────────────────────────────────────

export type WorkflowTriggerType = 'manual' | 'event' | 'schedule' | 'webhook';

export interface Workflow {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  steps: WorkflowStep[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'condition' | 'action' | 'notification' | 'approval' | 'delay' | 'integration';
  config: Record<string, unknown>;
  nextStepId?: string;
  alternativeStepId?: string;
  order: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  companyId: string;
  triggerData: Record<string, unknown>;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStepId?: string;
  steps: WorkflowStepExecution[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface WorkflowStepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// ─── Approval Engine ──────────────────────────────────────────────────────────

export type ApprovalType = 'financial' | 'purchase' | 'legal' | 'project' | 'hr' | 'contract' | 'custom';

export interface ApprovalRequest {
  id: string;
  companyId: string;
  type: ApprovalType;
  title: string;
  description?: string;
  requesterId: string;
  entityId: string;
  entityType: string;
  amount?: number;
  currency?: string;
  currentApproverId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvals: ApprovalStep[];
  comments: ApprovalComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  approverId: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  processedAt?: Date;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// ─── Notification Center ──────────────────────────────────────────────────────

export type NotificationChannel = 'email' | 'whatsapp' | 'push' | 'sms' | 'webhook' | 'dashboard';

export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  channel: NotificationChannel;
  source: string;
  sourceId?: string;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface NotificationRule {
  id: string;
  companyId: string;
  name: string;
  event: string;
  conditions: NotificationCondition[];
  channels: NotificationChannel[];
  template: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

// ─── Document Manager ─────────────────────────────────────────────────────────

export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'text' | 'other';

export interface BusinessDocument {
  id: string;
  companyId: string;
  name: string;
  type: DocumentType;
  category: string;
  subcategory?: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  tags: string[];
  metadata: Record<string, unknown>;
  version: number;
  versions: DocumentVersion[];
  permissions: DocumentPermission[];
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  version: number;
  fileUrl: string;
  uploadedBy: string;
  changelog?: string;
  uploadedAt: Date;
}

export interface DocumentPermission {
  userId: string;
  level: 'read' | 'write' | 'admin';
}

// ─── Report Generator ─────────────────────────────────────────────────────────

export type ReportFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'html' | 'markdown';

export interface ReportTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category: string;
  format: ReportFormat;
  dataSource: string;
  template: string;
  parameters: ReportParameter[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportParameter {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  defaultValue?: unknown;
  options?: string[];
  required: boolean;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  companyId: string;
  parameters: Record<string, unknown>;
  format: ReportFormat;
  fileUrl: string;
  fileSize: number;
  generatedBy: string;
  generatedAt: Date;
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export type IntegrationType = 'n8n' | 'github' | 'obsidian' | 'calendar' | 'whatsapp' | 'email' | 'voice' | 'vision' | 'meeting' | 'custom';

export interface Integration {
  id: string;
  companyId: string;
  name: string;
  type: IntegrationType;
  config: Record<string, unknown>;
  isActive: boolean;
  lastSyncAt?: Date;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  direction: 'inbound' | 'outbound';
  event: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processed' | 'failed';
  error?: string;
  processedAt?: Date;
  createdAt: Date;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface BusinessHealth {
  companyId: string;
  modules: ModuleHealth[];
  overallScore: number;
  alerts: BusinessAlert[];
  lastChecked: Date;
}

export interface ModuleHealth {
  module: string;
  status: 'healthy' | 'degraded' | 'down';
  score: number;
  lastActivity?: Date;
  errorRate: number;
  responseTime: number;
}

export interface BusinessAlert {
  id: string;
  companyId: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  module: string;
  message: string;
  acknowledged: boolean;
  createdAt: Date;
}

// ─── Business Suite Config ────────────────────────────────────────────────────

export interface BusinessSuiteConfig {
  defaultCurrency: string;
  timezone: string;
  language: string;
  features: BusinessFeatures;
  integrations: string[];
  security: BusinessSecurityConfig;
}

export interface BusinessFeatures {
  crm: boolean;
  erp: boolean;
  finance: boolean;
  accounting: boolean;
  treasury: boolean;
  sales: boolean;
  purchasing: boolean;
  inventory: boolean;
  logistics: boolean;
  hr: boolean;
  payroll: boolean;
  legal: boolean;
  contracts: boolean;
  compliance: boolean;
  marketing: boolean;
  customerSuccess: boolean;
  serviceDesk: boolean;
  projects: boolean;
  kanban: boolean;
  bi: boolean;
  forecasting: boolean;
  analytics: boolean;
  workflowEngine: boolean;
  approvalEngine: boolean;
  documentManager: boolean;
  reportGenerator: boolean;
}

export interface BusinessSecurityConfig {
  rbac: boolean;
  abac: boolean;
  lgpd: boolean;
  encryption: boolean;
  audit: boolean;
  mfa: boolean;
  rateLimit: boolean;
  tenantIsolation: boolean;
}
