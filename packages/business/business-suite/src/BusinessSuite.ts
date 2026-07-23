import type { BusinessSuiteConfig } from './interfaces.js';
import { Accounting } from './accounting/Accounting.js';
import { Analytics } from './analytics/Analytics.js';
import { BI } from './bi/BI.js';
import { CompanyManager } from './company-manager/CompanyManager.js';
import { Compliance } from './compliance/Compliance.js';
import { Contracts } from './contracts/Contracts.js';
import { CRM } from './crm/CRM.js';
import { CustomerSuccess } from './customer-success/CustomerSuccess.js';
import { ERP } from './erp/ERP.js';
import { Finance } from './finance/Finance.js';
import { Forecasting } from './forecasting/Forecasting.js';
import { HR } from './hr/HR.js';
import { Inventory } from './inventory/Inventory.js';
import { Kanban } from './kanban/Kanban.js';
import { Legal } from './legal/Legal.js';
import { Logistics } from './logistics/Logistics.js';
import { Marketing } from './marketing/Marketing.js';
import { Payroll } from './payroll/Payroll.js';
import { Projects } from './projects/Projects.js';
import { Purchasing } from './purchasing/Purchasing.js';
import { Sales } from './sales/Sales.js';
import { ServiceDesk } from './service-desk/ServiceDesk.js';
import { Treasury } from './treasury/Treasury.js';
import { WorkflowEngine } from './workflow-engine/WorkflowEngine.js';
import { ApprovalEngine } from './approval-engine/ApprovalEngine.js';
import { NotificationCenter } from './notification-center/NotificationCenter.js';
import { DocumentManager } from './document-manager/DocumentManager.js';
import { ReportGenerator } from './report-generator/ReportGenerator.js';
import { Integrations } from './integrations/Integrations.js';
import { BusinessAPI } from './api/BusinessAPI.js';
import { Monitoring } from './monitoring/Monitoring.js';

export interface ModuleHealthInfo {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  initialized: boolean;
}

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

class BusinessSuite {
  private logger = new DefaultLogger('business-suite');
  private config: BusinessSuiteConfig;

  readonly accounting: Accounting;
  readonly analytics: Analytics;
  readonly bi: BI;
  readonly companyManager: CompanyManager;
  readonly compliance: Compliance;
  readonly contracts: Contracts;
  readonly crm: CRM;
  readonly customerSuccess: CustomerSuccess;
  readonly erp: ERP;
  readonly finance: Finance;
  readonly forecasting: Forecasting;
  readonly hr: HR;
  readonly inventory: Inventory;
  readonly kanban: Kanban;
  readonly legal: Legal;
  readonly logistics: Logistics;
  readonly marketing: Marketing;
  readonly payroll: Payroll;
  readonly projects: Projects;
  readonly purchasing: Purchasing;
  readonly sales: Sales;
  readonly serviceDesk: ServiceDesk;
  readonly treasury: Treasury;
  readonly workflowEngine: WorkflowEngine;
  readonly approvalEngine: ApprovalEngine;
  readonly notificationCenter: NotificationCenter;
  readonly documentManager: DocumentManager;
  readonly reportGenerator: ReportGenerator;
  readonly integrations: Integrations;
  readonly api: BusinessAPI;
  readonly monitoring: Monitoring;

  constructor(config: BusinessSuiteConfig) {
    this.config = config;
    const moduleConfig = { defaultCurrency: config.defaultCurrency, timezone: config.timezone, language: config.language };

    this.accounting = new Accounting(moduleConfig);
    this.analytics = new Analytics(moduleConfig);
    this.bi = new BI(moduleConfig);
    this.companyManager = new CompanyManager(moduleConfig);
    this.compliance = new Compliance(moduleConfig);
    this.contracts = new Contracts(moduleConfig);
    this.crm = new CRM(moduleConfig);
    this.customerSuccess = new CustomerSuccess(moduleConfig);
    this.erp = new ERP(moduleConfig);
    this.finance = new Finance(moduleConfig);
    this.forecasting = new Forecasting(moduleConfig);
    this.hr = new HR(moduleConfig);
    this.inventory = new Inventory(moduleConfig);
    this.kanban = new Kanban(moduleConfig);
    this.legal = new Legal(moduleConfig);
    this.logistics = new Logistics(moduleConfig);
    this.marketing = new Marketing(moduleConfig);
    this.payroll = new Payroll(moduleConfig);
    this.projects = new Projects(moduleConfig);
    this.purchasing = new Purchasing(moduleConfig);
    this.sales = new Sales(moduleConfig);
    this.serviceDesk = new ServiceDesk(moduleConfig);
    this.treasury = new Treasury(moduleConfig);
    this.workflowEngine = new WorkflowEngine(moduleConfig);
    this.approvalEngine = new ApprovalEngine(moduleConfig);
    this.notificationCenter = new NotificationCenter(moduleConfig);
    this.documentManager = new DocumentManager(moduleConfig);
    this.reportGenerator = new ReportGenerator(moduleConfig);
    this.integrations = new Integrations(moduleConfig);
    this.api = new BusinessAPI(moduleConfig);
    this.monitoring = new Monitoring(moduleConfig);
  }

  async getModuleHealth(): Promise<ModuleHealthInfo[]> {
    const modules = [
      { name: 'accounting', instance: this.accounting },
      { name: 'analytics', instance: this.analytics },
      { name: 'bi', instance: this.bi },
      { name: 'companyManager', instance: this.companyManager },
      { name: 'compliance', instance: this.compliance },
      { name: 'contracts', instance: this.contracts },
      { name: 'crm', instance: this.crm },
      { name: 'customerSuccess', instance: this.customerSuccess },
      { name: 'erp', instance: this.erp },
      { name: 'finance', instance: this.finance },
      { name: 'forecasting', instance: this.forecasting },
      { name: 'hr', instance: this.hr },
      { name: 'inventory', instance: this.inventory },
      { name: 'kanban', instance: this.kanban },
      { name: 'legal', instance: this.legal },
      { name: 'logistics', instance: this.logistics },
      { name: 'marketing', instance: this.marketing },
      { name: 'payroll', instance: this.payroll },
      { name: 'projects', instance: this.projects },
      { name: 'purchasing', instance: this.purchasing },
      { name: 'sales', instance: this.sales },
      { name: 'serviceDesk', instance: this.serviceDesk },
      { name: 'treasury', instance: this.treasury },
      { name: 'workflowEngine', instance: this.workflowEngine },
      { name: 'approvalEngine', instance: this.approvalEngine },
      { name: 'notificationCenter', instance: this.notificationCenter },
      { name: 'documentManager', instance: this.documentManager },
      { name: 'reportGenerator', instance: this.reportGenerator },
      { name: 'integrations', instance: this.integrations },
      { name: 'api', instance: this.api },
      { name: 'monitoring', instance: this.monitoring },
    ];

    return modules.map(m => ({
      name: m.name,
      status: (m.instance ? 'healthy' : 'down') as 'healthy' | 'degraded' | 'down',
      initialized: !!m.instance,
    }));
  }

  getConfig(): BusinessSuiteConfig {
    return { ...this.config };
  }
}

export { BusinessSuite, BusinessSuite as default };
export type { BusinessSuiteConfig };
