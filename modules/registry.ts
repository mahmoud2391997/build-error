
import React from 'react';
import { ModuleType } from '../types';
import ChartOfAccounts from './accounting/ChartOfAccounts';
import JournalEntries from './accounting/JournalEntries';
import TrialBalance from './accounting/TrialBalance';
import Invoices from './accounting/Invoices';
import Products from './inventory/Products';
import Warehouses from './inventory/Warehouses';
import Employees from './hr/Employees';
import Payroll from './hr/Payroll';
import Leads from './crm/Leads';

export interface TabDefinition {
  id: string;
  label: string;
  component: React.FC<any>;
}

export interface ModuleDefinition {
  type: ModuleType;
  label: string;
  description: string;
  icon: string;
  tabs: TabDefinition[];
}

export const APP_MODULES: ModuleDefinition[] = [
  {
    type: ModuleType.ACCOUNTING,
    label: 'المحاسبة المالية',
    description: 'إدارة الحسابات، القيود، والتقارير المالية المتقدمة',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    tabs: [
      { id: 'coa', label: 'دليل الحسابات', component: ChartOfAccounts },
      { id: 'journal', label: 'القيود اليومية', component: JournalEntries },
      { id: 'invoices', label: 'الفواتير والمدفوعات', component: Invoices },
      { id: 'trial', label: 'ميزان المراجعة', component: TrialBalance },
    ]
  },
  {
    type: ModuleType.INVENTORY,
    label: 'إدارة المخزون',
    description: 'تتبع المنتجات، الكميات، الموردين والمستودعات',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    tabs: [
      { id: 'products', label: 'المنتجات', component: Products },
      { id: 'warehouses', label: 'المستودعات', component: Warehouses },
    ]
  },
  {
    type: ModuleType.HR,
    label: 'الموارد البشرية',
    description: 'إدارة شؤون الموظفين، الرواتب، الحضور والإجازات',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    tabs: [
      { id: 'employees', label: 'قائمة الموظفين', component: Employees },
      { id: 'payroll', label: 'مسيرات الرواتب', component: Payroll },
    ]
  },
  {
    type: ModuleType.CRM,
    label: 'إدارة العملاء',
    description: 'تنظيم المبيعات، علاقات العملاء، والفرص البيعية',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    tabs: [
      { id: 'leads', label: 'العملاء المحتملين', component: Leads },
    ]
  }
];
