
export enum ModuleType {
  ACCOUNTING = 'ACCOUNTING',
  INVENTORY = 'INVENTORY',
  HR = 'HR',
  CRM = 'CRM'
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

/** 
 * USER ENTITY
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  companyIds: string[];
  createdAt?: number;
}

/** 
 * COMPANY (TENANT) ENTITY
 */
export interface Company {
  id: string;
  name: string;
  adminEmail: string;
  activeModules: ModuleType[];
  createdAt: number;
}

/** 
 * ACCOUNTING ENTITIES
 */
export interface Account {
  id: string;
  companyId?: string; // Foreign Key reference
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface JournalEntryLine {
  id?: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  companyId?: string;
  date: string;
  reference: string;
  lines: JournalEntryLine[];
  description: string;
  createdAt?: number;
}

/** 
 * INVENTORY ENTITIES
 */
export interface Product {
  id: string;
  companyId?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

export interface Warehouse {
  id: string;
  companyId?: string;
  name: string;
  location: string;
  capacity: number;
  occupancy: number;
}

/** 
 * HR ENTITIES
 */
export interface Employee {
  id: string;
  companyId?: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE';
}

export interface PayrollRecord {
  id: string;
  companyId?: string;
  employeeId?: string;
  month: string;
  status: 'PAID' | 'PENDING';
  amount: number;
  date: string;
}

/** 
 * CRM ENTITIES
 */
export interface Lead {
  id: string;
  companyId?: string;
  company_id?: string;
  name: string;
  company: string | any;
  company_name?: string | null;
  value: number;
  stage: 'NEW' | 'CONTACTED' | 'PROPOSAL' | 'NEGOTIATION';
  chance: number;
}

/** 
 * GLOBAL APP STATE
 */
export interface AppState {
  users: User[];
  currentUserId: string | null;
  companies: Company[];
  currentCompanyId: string | null;
  
  // Tenant-Partitioned Data Store (Keyed by Company ID)
  accounts: Record<string, Account[]>; 
  entries: Record<string, JournalEntry[]>;
  products: Record<string, Product[]>;
  warehouses: Record<string, Warehouse[]>;
  employees: Record<string, Employee[]>;
  leads: Record<string, Lead[]>;
  payrolls: Record<string, PayrollRecord[]>;
  invoices: Record<string, any[]>; // Invoice records
}
