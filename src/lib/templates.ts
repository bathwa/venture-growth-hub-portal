// Templates Library
// Predefined templates for agreements, reports, and financial statements

export interface Template {
  id: string;
  name: string;
  type: 'agreement' | 'report' | 'financial' | 'payment' | 'general';
  subtype: string;
  content: string;
  variables: string[];
  description: string;
  is_active: boolean;
}

export const AGREEMENT_TEMPLATES: Template[] = [
  {
    id: 'nda-standard',
    name: 'Standard NDA',
    type: 'agreement',
    subtype: 'nda',
    description: 'Non-Disclosure Agreement for confidential information sharing',
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of {{date}} by and between:

{{disclosing_party}} ("Disclosing Party")
{{receiving_party}} ("Receiving Party")

1. CONFIDENTIAL INFORMATION
The Receiving Party acknowledges that it may receive confidential and proprietary information from the Disclosing Party, including but not limited to business plans, financial information, technical data, customer lists, and trade secrets (collectively, "Confidential Information").

2. NON-DISCLOSURE
The Receiving Party agrees to:
(a) Maintain the confidentiality of all Confidential Information
(b) Not disclose Confidential Information to any third party without prior written consent
(c) Use Confidential Information solely for the purpose of {{purpose}}
(d) Return or destroy all Confidential Information upon request

3. TERM
This Agreement shall remain in effect for {{duration}} from the date of execution.

4. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

5. REMEDIES
The parties acknowledge that monetary damages may not be sufficient for breach of this Agreement and that injunctive relief may be appropriate.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

{{disclosing_party}}                    {{receiving_party}}
_________________                  _________________
Signature                          Signature

Date: {{date}}                     Date: {{date}}`,
    variables: ['date', 'disclosing_party', 'receiving_party', 'purpose', 'duration', 'jurisdiction'],
    is_active: true,
  },
  {
    id: 'investment-agreement',
    name: 'Investment Agreement',
    type: 'agreement',
    subtype: 'investment',
    description: 'Standard investment agreement for equity investments',
    content: `INVESTMENT AGREEMENT

This Investment Agreement (the "Agreement") is made as of {{date}} between:

{{company_name}}, a {{company_type}} ("Company")
{{investor_name}} ("Investor")

1. INVESTMENT
The Investor agrees to invest {{investment_amount}} in exchange for {{equity_percentage}}% equity in the Company.

2. CLOSING
The closing of this investment shall occur on {{closing_date}} at the offices of {{company_name}}.

3. REPRESENTATIONS AND WARRANTIES
Each party represents and warrants that:
(a) It has the authority to enter into this Agreement
(b) This Agreement constitutes a valid and binding obligation
(c) No consent or approval is required from any third party

4. COVENANTS
The Company covenants to:
(a) Use the investment proceeds for {{use_of_funds}}
(b) Provide quarterly financial reports to the Investor
(c) Maintain proper corporate governance

5. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

{{company_name}}                   {{investor_name}}
_________________                  _________________
Signature                          Signature

Date: {{date}}                     Date: {{date}}`,
    variables: ['date', 'company_name', 'company_type', 'investor_name', 'investment_amount', 'equity_percentage', 'closing_date', 'use_of_funds', 'jurisdiction'],
    is_active: true,
  },
  {
    id: 'service-agreement',
    name: 'Service Agreement',
    type: 'agreement',
    subtype: 'service',
    description: 'Service agreement for professional services',
    content: `SERVICE AGREEMENT

This Service Agreement (the "Agreement") is entered into as of {{date}} between:

{{service_provider}} ("Service Provider")
{{client}} ("Client")

1. SERVICES
The Service Provider shall provide the following services: {{services_description}}

2. TERM
This Agreement shall commence on {{start_date}} and continue until {{end_date}}.

3. COMPENSATION
The Client shall pay the Service Provider {{compensation_amount}} for the services rendered.

4. PAYMENT TERMS
Payment shall be made {{payment_terms}}.

5. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of any proprietary information shared during the term of this Agreement.

6. TERMINATION
Either party may terminate this Agreement with {{notice_period}} written notice.

IN WITNESS WHEREOF, the parties have executed this Agreement.

{{service_provider}}                {{client}}
_________________                  _________________
Signature                          Signature

Date: {{date}}                     Date: {{date}}`,
    variables: ['date', 'service_provider', 'client', 'services_description', 'start_date', 'end_date', 'compensation_amount', 'payment_terms', 'notice_period'],
    is_active: true,
  },
];

export const REPORT_TEMPLATES: Template[] = [
  {
    id: 'investment-journey-report',
    name: 'Investment Journey Report',
    type: 'report',
    subtype: 'investment_journey',
    description: 'Comprehensive report tracking investment progress and milestones',
    content: `INVESTMENT JOURNEY REPORT

Report Period: {{report_period}}
Generated: {{generated_date}}

INVESTMENT OVERVIEW
Opportunity: {{opportunity_name}}
Company: {{company_name}}
Investment Amount: {{investment_amount}}
Investment Date: {{investment_date}}
Current Status: {{current_status}}

MILESTONES ACHIEVED
{{milestones_achieved}}

MILESTONES PENDING
{{milestones_pending}}

FINANCIAL PERFORMANCE
Revenue Growth: {{revenue_growth}}
EBITDA: {{ebitda}}
Cash Flow: {{cash_flow}}
Valuation: {{current_valuation}}

KEY METRICS
{{key_metrics}}

RISKS AND CHALLENGES
{{risks_challenges}}

NEXT STEPS
{{next_steps}}

RECOMMENDATIONS
{{recommendations}}

Prepared by: {{prepared_by}}
Date: {{generated_date}}`,
    variables: ['report_period', 'generated_date', 'opportunity_name', 'company_name', 'investment_amount', 'investment_date', 'current_status', 'milestones_achieved', 'milestones_pending', 'revenue_growth', 'ebitda', 'cash_flow', 'current_valuation', 'key_metrics', 'risks_challenges', 'next_steps', 'recommendations', 'prepared_by'],
    is_active: true,
  },
  {
    id: 'due-diligence-report',
    name: 'Due Diligence Report',
    type: 'report',
    subtype: 'due_diligence',
    description: 'Comprehensive due diligence report for investment opportunities',
    content: `DUE DILIGENCE REPORT

Company: {{company_name}}
Opportunity: {{opportunity_name}}
Report Date: {{report_date}}
Prepared by: {{prepared_by}}

EXECUTIVE SUMMARY
{{executive_summary}}

COMPANY OVERVIEW
Business Model: {{business_model}}
Market Position: {{market_position}}
Competitive Landscape: {{competitive_landscape}}

FINANCIAL ANALYSIS
Revenue: {{revenue}}
Profitability: {{profitability}}
Cash Flow: {{cash_flow}}
Debt: {{debt}}

MARKET ANALYSIS
Market Size: {{market_size}}
Growth Potential: {{growth_potential}}
Market Risks: {{market_risks}}

TECHNICAL ASSESSMENT
Technology Stack: {{technology_stack}}
IP Portfolio: {{ip_portfolio}}
Technical Risks: {{technical_risks}}

LEGAL REVIEW
Corporate Structure: {{corporate_structure}}
Compliance: {{compliance}}
Legal Risks: {{legal_risks}}

RECOMMENDATION
{{recommendation}}

RISK ASSESSMENT
{{risk_assessment}}`,
    variables: ['company_name', 'opportunity_name', 'report_date', 'prepared_by', 'executive_summary', 'business_model', 'market_position', 'competitive_landscape', 'revenue', 'profitability', 'cash_flow', 'debt', 'market_size', 'growth_potential', 'market_risks', 'technology_stack', 'ip_portfolio', 'technical_risks', 'corporate_structure', 'compliance', 'legal_risks', 'recommendation', 'risk_assessment'],
    is_active: true,
  },
];

export const FINANCIAL_TEMPLATES: Template[] = [
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    type: 'financial',
    subtype: 'balance_sheet',
    description: 'Standard balance sheet template',
    content: `BALANCE SHEET

Company: {{company_name}}
As of: {{as_of_date}}

ASSETS
Current Assets:
  Cash and Cash Equivalents: {{cash_equivalents}}
  Accounts Receivable: {{accounts_receivable}}
  Inventory: {{inventory}}
  Prepaid Expenses: {{prepaid_expenses}}
  Total Current Assets: {{total_current_assets}}

Fixed Assets:
  Property, Plant & Equipment: {{ppe}}
  Accumulated Depreciation: {{accumulated_depreciation}}
  Net Fixed Assets: {{net_fixed_assets}}

Other Assets:
  Intangible Assets: {{intangible_assets}}
  Goodwill: {{goodwill}}
  Total Other Assets: {{total_other_assets}}

TOTAL ASSETS: {{total_assets}}

LIABILITIES AND EQUITY
Current Liabilities:
  Accounts Payable: {{accounts_payable}}
  Short-term Debt: {{short_term_debt}}
  Accrued Expenses: {{accrued_expenses}}
  Total Current Liabilities: {{total_current_liabilities}}

Long-term Liabilities:
  Long-term Debt: {{long_term_debt}}
  Deferred Tax: {{deferred_tax}}
  Total Long-term Liabilities: {{total_long_term_liabilities}}

Equity:
  Common Stock: {{common_stock}}
  Retained Earnings: {{retained_earnings}}
  Additional Paid-in Capital: {{additional_paid_in_capital}}
  Total Equity: {{total_equity}}

TOTAL LIABILITIES AND EQUITY: {{total_liabilities_equity}}`,
    variables: ['company_name', 'as_of_date', 'cash_equivalents', 'accounts_receivable', 'inventory', 'prepaid_expenses', 'total_current_assets', 'ppe', 'accumulated_depreciation', 'net_fixed_assets', 'intangible_assets', 'goodwill', 'total_other_assets', 'total_assets', 'accounts_payable', 'short_term_debt', 'accrued_expenses', 'total_current_liabilities', 'long_term_debt', 'deferred_tax', 'total_long_term_liabilities', 'common_stock', 'retained_earnings', 'additional_paid_in_capital', 'total_equity', 'total_liabilities_equity'],
    is_active: true,
  },
  {
    id: 'income-statement',
    name: 'Income Statement (P&L)',
    type: 'financial',
    subtype: 'income_statement',
    description: 'Profit and Loss statement template',
    content: `INCOME STATEMENT

Company: {{company_name}}
Period: {{period}}

REVENUE
Gross Revenue: {{gross_revenue}}
Less: Returns and Allowances: {{returns_allowances}}
Net Revenue: {{net_revenue}}

COST OF GOODS SOLD
Direct Materials: {{direct_materials}}
Direct Labor: {{direct_labor}}
Manufacturing Overhead: {{manufacturing_overhead}}
Total COGS: {{total_cogs}}

GROSS PROFIT: {{gross_profit}}

OPERATING EXPENSES
Selling Expenses:
  Marketing: {{marketing_expenses}}
  Sales Commissions: {{sales_commissions}}
  Total Selling Expenses: {{total_selling_expenses}}

General & Administrative:
  Salaries: {{salaries}}
  Rent: {{rent}}
  Utilities: {{utilities}}
  Insurance: {{insurance}}
  Total G&A: {{total_ga_expenses}}

Total Operating Expenses: {{total_operating_expenses}}

OPERATING INCOME: {{operating_income}}

OTHER INCOME/EXPENSES
Interest Income: {{interest_income}}
Interest Expense: {{interest_expense}}
Other Income: {{other_income}}
Other Expenses: {{other_expenses}}
Net Other Income: {{net_other_income}}

INCOME BEFORE TAXES: {{income_before_taxes}}

INCOME TAXES: {{income_taxes}}

NET INCOME: {{net_income}}

Earnings Per Share: {{eps}}`,
    variables: ['company_name', 'period', 'gross_revenue', 'returns_allowances', 'net_revenue', 'direct_materials', 'direct_labor', 'manufacturing_overhead', 'total_cogs', 'gross_profit', 'marketing_expenses', 'sales_commissions', 'total_selling_expenses', 'salaries', 'rent', 'utilities', 'insurance', 'total_ga_expenses', 'total_operating_expenses', 'operating_income', 'interest_income', 'interest_expense', 'other_income', 'other_expenses', 'net_other_income', 'income_before_taxes', 'income_taxes', 'net_income', 'eps'],
    is_active: true,
  },
  {
    id: 'cash-flow-statement',
    name: 'Cash Flow Statement',
    type: 'financial',
    subtype: 'cash_flow',
    description: 'Cash flow statement template',
    content: `CASH FLOW STATEMENT

Company: {{company_name}}
Period: {{period}}

OPERATING ACTIVITIES
Net Income: {{net_income}}

Adjustments for Non-cash Items:
  Depreciation: {{depreciation}}
  Amortization: {{amortization}}
  Stock-based Compensation: {{stock_compensation}}
  Deferred Taxes: {{deferred_taxes}}

Changes in Working Capital:
  Accounts Receivable: {{change_ar}}
  Inventory: {{change_inventory}}
  Accounts Payable: {{change_ap}}
  Accrued Expenses: {{change_accrued}}

Net Cash from Operating Activities: {{net_cash_operating}}

INVESTING ACTIVITIES
Capital Expenditures: {{capex}}
Acquisitions: {{acquisitions}}
Investments: {{investments}}
Net Cash from Investing Activities: {{net_cash_investing}}

FINANCING ACTIVITIES
Proceeds from Debt: {{debt_proceeds}}
Repayment of Debt: {{debt_repayment}}
Proceeds from Equity: {{equity_proceeds}}
Dividends Paid: {{dividends}}
Net Cash from Financing Activities: {{net_cash_financing}}

NET CHANGE IN CASH: {{net_change_cash}}

Beginning Cash Balance: {{beginning_cash}}
Ending Cash Balance: {{ending_cash}}`,
    variables: ['company_name', 'period', 'net_income', 'depreciation', 'amortization', 'stock_compensation', 'deferred_taxes', 'change_ar', 'change_inventory', 'change_ap', 'change_accrued', 'net_cash_operating', 'capex', 'acquisitions', 'investments', 'net_cash_investing', 'debt_proceeds', 'debt_repayment', 'equity_proceeds', 'dividends', 'net_cash_financing', 'net_change_cash', 'beginning_cash', 'ending_cash'],
    is_active: true,
  },
];

export const PAYMENT_TEMPLATES: Template[] = [
  {
    id: 'payment-request',
    name: 'Payment Request',
    type: 'payment',
    subtype: 'request',
    description: 'Standard payment request template',
    content: `PAYMENT REQUEST

Request Number: {{request_number}}
Date: {{request_date}}
Due Date: {{due_date}}

FROM:
{{from_name}}
{{from_address}}
{{from_email}}
{{from_phone}}

TO:
{{to_name}}
{{to_address}}
{{to_email}}

SERVICE/GOODS DESCRIPTION:
{{service_description}}

AMOUNT DETAILS:
Subtotal: {{subtotal}}
Tax: {{tax}}
Discount: {{discount}}
Total Amount: {{total_amount}}

PAYMENT TERMS:
{{payment_terms}}

PAYMENT METHODS:
{{payment_methods}}

BANK DETAILS:
Bank Name: {{bank_name}}
Account Number: {{account_number}}
Routing Number: {{routing_number}}
Swift Code: {{swift_code}}

NOTES:
{{notes}}

Please remit payment by {{due_date}} to avoid late fees.

Thank you for your business.

{{from_name}}`,
    variables: ['request_number', 'request_date', 'due_date', 'from_name', 'from_address', 'from_email', 'from_phone', 'to_name', 'to_address', 'to_email', 'service_description', 'subtotal', 'tax', 'discount', 'total_amount', 'payment_terms', 'payment_methods', 'bank_name', 'account_number', 'routing_number', 'swift_code', 'notes'],
    is_active: true,
  },
  {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    type: 'payment',
    subtype: 'receipt',
    description: 'Payment receipt template',
    content: `PAYMENT RECEIPT

Receipt Number: {{receipt_number}}
Date: {{receipt_date}}
Transaction ID: {{transaction_id}}

RECEIVED FROM:
{{payer_name}}
{{payer_address}}
{{payer_email}}

PAYMENT DETAILS:
Amount Received: {{amount_received}}
Payment Method: {{payment_method}}
Reference: {{reference}}

FOR:
{{service_description}}

BALANCE:
Previous Balance: {{previous_balance}}
Amount Paid: {{amount_paid}}
New Balance: {{new_balance}}

THANK YOU FOR YOUR PAYMENT!

{{company_name}}
{{company_address}}
{{company_phone}}
{{company_email}}`,
    variables: ['receipt_number', 'receipt_date', 'transaction_id', 'payer_name', 'payer_address', 'payer_email', 'amount_received', 'payment_method', 'reference', 'service_description', 'previous_balance', 'amount_paid', 'new_balance', 'company_name', 'company_address', 'company_phone', 'company_email'],
    is_active: true,
  },
];

export const GENERAL_TEMPLATES: Template[] = [
  {
    id: 'meeting-minutes',
    name: 'Meeting Minutes',
    type: 'general',
    subtype: 'meeting_minutes',
    description: 'Standard meeting minutes template',
    content: `MEETING MINUTES

Meeting: {{meeting_title}}
Date: {{meeting_date}}
Time: {{meeting_time}}
Location: {{meeting_location}}

ATTENDEES:
{{attendees}}

ABSENT:
{{absent}}

AGENDA:
{{agenda}}

DISCUSSION:
{{discussion}}

DECISIONS MADE:
{{decisions}}

ACTION ITEMS:
{{action_items}}

NEXT MEETING:
Date: {{next_meeting_date}}
Time: {{next_meeting_time}}
Location: {{next_meeting_location}}

Prepared by: {{prepared_by}}
Date: {{prepared_date}}`,
    variables: ['meeting_title', 'meeting_date', 'meeting_time', 'meeting_location', 'attendees', 'absent', 'agenda', 'discussion', 'decisions', 'action_items', 'next_meeting_date', 'next_meeting_time', 'next_meeting_location', 'prepared_by', 'prepared_date'],
    is_active: true,
  },
  {
    id: 'project-status-report',
    name: 'Project Status Report',
    type: 'general',
    subtype: 'project_status',
    description: 'Project status report template',
    content: `PROJECT STATUS REPORT

Project: {{project_name}}
Report Period: {{report_period}}
Prepared by: {{prepared_by}}
Date: {{report_date}}

PROJECT OVERVIEW:
{{project_overview}}

CURRENT STATUS:
{{current_status}}

COMPLETED TASKS:
{{completed_tasks}}

IN PROGRESS:
{{in_progress_tasks}}

UPCOMING TASKS:
{{upcoming_tasks}}

ISSUES AND RISKS:
{{issues_risks}}

BUDGET STATUS:
Planned: {{planned_budget}}
Actual: {{actual_budget}}
Variance: {{budget_variance}}

SCHEDULE STATUS:
Planned End Date: {{planned_end_date}}
Current End Date: {{current_end_date}}
Status: {{schedule_status}}

RECOMMENDATIONS:
{{recommendations}}`,
    variables: ['project_name', 'report_period', 'prepared_by', 'report_date', 'project_overview', 'current_status', 'completed_tasks', 'in_progress_tasks', 'upcoming_tasks', 'issues_risks', 'planned_budget', 'actual_budget', 'budget_variance', 'planned_end_date', 'current_end_date', 'schedule_status', 'recommendations'],
    is_active: true,
  },
];

// Combine all templates
export const ALL_TEMPLATES: Template[] = [
  ...AGREEMENT_TEMPLATES,
  ...REPORT_TEMPLATES,
  ...FINANCIAL_TEMPLATES,
  ...PAYMENT_TEMPLATES,
  ...GENERAL_TEMPLATES,
];

// Template utility functions
export const getTemplatesByType = (type: string): Template[] => {
  return ALL_TEMPLATES.filter(template => template.type === type);
};

export const getTemplatesBySubtype = (subtype: string): Template[] => {
  return ALL_TEMPLATES.filter(template => template.subtype === subtype);
};

export const getTemplateById = (id: string): Template | undefined => {
  return ALL_TEMPLATES.find(template => template.id === id);
};

export const generateFromTemplate = (templateId: string, variables: Record<string, string>): string => {
  const template = getTemplateById(templateId);
  if (!template) return '';

  let content = template.content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value);
  });

  return content;
};

export const extractVariables = (content: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  return Array.from(variables);
}; 