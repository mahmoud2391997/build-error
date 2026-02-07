'use client';

import { useState, useEffect } from 'react';
import { Company, ModuleType, Account, AccountType } from '../../types';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Dashboard from '../../modules/core/Dashboard';
import { APP_MODULES } from '../../modules/registry';

const findActiveComponent = (activeTab: string): React.FC<any> | null => {
  if (activeTab === 'dashboard') {
    return Dashboard;
  }
  for (const module of APP_MODULES) {
    const tab = module.tabs.find(t => t.id === activeTab);
    if (tab) {
      return tab.component;
    }
  }
  return null;
};

export default function DashboardPage() {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin User');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      console.log('Dashboard: Starting company data fetch...');
      try {
        // Get user email from localStorage (you might want to get this from auth context)
        const userEmail = localStorage.getItem('userEmail') || 'admin@example.com'; // Fallback for testing
        
        // Fetch companies for this user
        const response = await fetch(`/api/companies?email=${encodeURIComponent(userEmail)}`);
        const companies = await response.json();
        console.log('Dashboard: Companies fetched for user', userEmail, ':', companies);
        
        // Also fetch user information to get the name
        try {
          const userResponse = await fetch(`/api/auth/user?email=${encodeURIComponent(userEmail)}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserName(userData.name || 'Admin User');
            console.log('Dashboard: User data fetched:', userData);
          }
        } catch (userError) {
          console.log('Dashboard: Could not fetch user data, using default');
          // Keep default name if user fetch fails
        }
        
        if (companies && companies.length > 0) {
          // Prioritize company with active modules, or use the first one
          const apiCompany = companies.find(c => c.active_modules && c.active_modules.length > 0) || companies[0];
          const company: Company = {
            id: apiCompany.id,
            name: apiCompany.name,
            adminEmail: apiCompany.admin_email,
            createdAt: new Date(apiCompany.created_at).getTime(),
            activeModules: apiCompany.active_modules?.map((m: any) => m.module_name) || []
          };
          console.log('Dashboard: Selected company:', company.name, 'with modules:', company?.activeModules || []);
          setCurrentCompany(company);
          setCompanies(companies);
        } else {
          console.log('Dashboard: No companies found, using fallback');
          // Fallback to mock company if no companies exist
          const mockCompany: Company = {
            id: '1',
            name: 'شركة تجارية',
            adminEmail: 'admin@example.com',
            createdAt: Date.now(),
            activeModules: [ModuleType.ACCOUNTING, ModuleType.INVENTORY, ModuleType.HR, ModuleType.CRM]
          };
          setCurrentCompany(mockCompany);
          setCompanies(companies);
        }
        console.log('Dashboard: Setting loading to false');
        setLoading(false);
      } catch (error) {
        console.error('Dashboard: Error fetching company data:', error);
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab !== 'dashboard' && currentCompany) {
        try {
          if (activeTab === 'coa' || activeTab === 'invoices') {
            // Fetch Chart of Accounts from both accounts API and journal entries
            const [accountsResponse, journalResponse] = await Promise.all([
              fetch(`/api/coa?companyId=${currentCompany.id}`),
              fetch(`/api/journal?companyId=${currentCompany.id}`)
            ]);
            
            const accounts = await accountsResponse.json();
            const journalData = await journalResponse.json();
            
            // Set journal entries state
            if (journalData && Array.isArray(journalData)) {
              setJournalEntries(journalData.map((entry: any) => ({
                ...entry,
                lines: entry.lines || []
              })));
            } else {
              setJournalEntries([]);
            }
            
            // Start with accounts from API
            const uniqueAccounts = new Map();
            accounts.forEach((account: any) => {
              uniqueAccounts.set(account.id, {
                id: account.id,
                code: account.code,
                name: account.name,
                type: account.type,
                balance: parseFloat(account.balance?.toString() || '0'),
                company_id: currentCompany.id
              });
            });
            
            // Add accounts from journal lines if they exist
            if (journalData && Array.isArray(journalData)) {
              journalData.forEach((entry: any) => {
                if (entry.lines && Array.isArray(entry.lines)) {
                  entry.lines.forEach((line: any) => {
                    if (line.accountId && !uniqueAccounts.has(line.accountId)) {
                      uniqueAccounts.set(line.accountId, {
                        id: line.accountId,
                        code: '', // Will be populated from accounts API
                        name: line.description || `Account ${line.accountId}`,
                        type: 'ASSET', // Default type
                        balance: 0,
                        company_id: currentCompany.id
                      });
                    }
                  });
                }
              });
            }
            
            const accountsArray = Array.from(uniqueAccounts.values());
            console.log('Dashboard: COA from accounts + journal:', accountsArray.length, 'accounts from API:', accounts.length, 'journal entries:', journalData.length);
            setAccounts(accountsArray);
          } else {
            // For all other tabs, fetch normally
            const response = await fetch(`/api/${activeTab === 'payroll' ? 'payroll-records' : activeTab}?companyId=${currentCompany.id}`);
            const data = await response.json();
            console.log(`Dashboard: Fetched ${activeTab} data:`, data);
            
            // Set the appropriate state based on the active tab
            if (activeTab === 'journal') {
              // Ensure entries have lines array, even if empty
              const entriesWithLines = data.map((entry: any) => ({
                ...entry,
                lines: entry.lines || []
              }));
              setJournalEntries(entriesWithLines);
            } else if (activeTab === 'products') {
              setProducts(data || []);
            } else if (activeTab === 'warehouses') {
              setWarehouses(data || []);
            } else if (activeTab === 'employees') {
              setEmployees(data || []);
            } else if (activeTab === 'trial') {
              setTrialBalance(data || []);
            } else if (activeTab === 'payroll') {
              setPayrolls(data || []);
            } else if (activeTab === 'leads') {
              setLeads(data || []);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${activeTab} data:`, error);
        }
      }
    };

    fetchData();
  }, [activeTab, currentCompany]);

  // Calculate real dashboard metrics from database data
  const calculateTotalBalance = () => {
    if (!accounts || accounts.length === 0) return 0;
    return accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  };

  const calculateTransactionsCount = () => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    return journalEntries.length;
  };

  const totalBalance = calculateTotalBalance();
  const transactionsCount = calculateTransactionsCount();

  const handleToggleModule = async (moduleType: ModuleType) => {
    if (!currentCompany) return;
    
    try {
      console.log('Toggle module:', moduleType);
      
      // Check if module is currently active
      const isActive = currentCompany.activeModules?.includes(moduleType);
      
      if (isActive) {
        // Deactivate module
        const response = await fetch(`/api/companies/${currentCompany.id}/modules/${moduleType}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Update local state
          setCurrentCompany(prev => prev ? {
            ...prev,
            activeModules: prev.activeModules.filter(m => m !== moduleType)
          } : null);
          console.log('Module deactivated:', moduleType);
        }
      } else {
        // Activate module
        const response = await fetch(`/api/companies/${currentCompany.id}/modules/${moduleType}`, {
          method: 'POST',
        });
        
        if (response.ok) {
          // Update local state
          setCurrentCompany(prev => prev ? {
            ...prev,
            activeModules: [...prev.activeModules, moduleType]
          } : null);
          console.log('Module activated:', moduleType);
        }
      }
    } catch (error) {
      console.error('Error toggling module:', error);
      alert('فشل في تفعيل/إلغاء تفعيل الوحدة');
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Clear current company state
    setCurrentCompany(null);
    setCompanies([]);
    setActiveTab('dashboard');
    setLoading(false);
    
    // Clear user email from localStorage
    localStorage.removeItem('userEmail');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const handleJournalEdit = async (entry: any) => {
    if (!currentCompany) return;
    
    try {
      const response = await fetch(`/api/journal/${entry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...entry, companyId: currentCompany.id }),
      });

      if (response.ok) {
        // Update the journal entries state
        setJournalEntries(prev => 
          prev.map(e => e.id === entry.id ? { ...e, ...entry } : e)
        );
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  const handleJournalDelete = async (id: string) => {
    if (!currentCompany) return;
    
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from journal entries state
        setJournalEntries(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  const handleAction = async (entity: string, action: string, data: any) => {
    if (!currentCompany) return;

    console.log('handleAction called - entity:', entity, 'action:', action, 'data:', data);

    let url = `/api/${entity === 'payroll' ? 'payroll-records' : entity}`;
    let method = 'POST';

    if (action === 'edit') {
      url += `/${data.id}`;
      method = 'PUT';
    } else if (action === 'delete') {
      // For delete, data should be the account object with id property
      const accountId = typeof data === 'string' ? data : data.id;
      if (!accountId) {
        console.error('Delete action: No account ID found in data:', data);
        return;
      }
      url += `/${accountId}`;
      method = 'DELETE';
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, companyId: currentCompany.id }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to ${action} ${entity}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          // Ignore JSON parse errors for error responses
        }

        if (response.status === 409) {
          alert(errorMsg);
          return;
        }
        
        throw new Error(errorMsg);
      }

      // Refetch data to update UI
      try {
        const fetchDataResponse = await fetch(`/api/${entity === 'payroll' ? 'payroll-records' : entity}?companyId=${currentCompany.id}`);
        const updatedData = await fetchDataResponse.json();
        
        if (entity === 'coa') {
          setAccounts(updatedData || []);
        } else if (entity === 'journal') {
          const entriesWithLines = (updatedData || []).map((entry: any) => ({
            ...entry,
            lines: entry.lines || []
          }));
          setJournalEntries(entriesWithLines);
        } else if (entity === 'invoices') {
          setInvoices(updatedData || []);
        } else if (entity === 'trial') {
          setTrialBalance(updatedData || []);
        } else if (entity === 'products') {
          setProducts(updatedData || []);
        } else if (entity === 'warehouses') {
          setWarehouses(updatedData || []);
        } else if (entity === 'employees') {
          setEmployees(updatedData || []);
        } else if (entity === 'payroll') {
          setPayrolls(updatedData || []);
        } else if (entity === 'leads') {
          setLeads(updatedData || []);
        }
      } catch (fetchError) {
        console.error(`Error refetching ${entity} data:`, fetchError);
      }
    } catch (error: any) {
      console.error(`Error in handleAction for ${entity}:`, error);
      alert(error.message || 'حدث خطأ أثناء تنفيذ العملية');
    }
  };

  const ActiveComponent = findActiveComponent(activeTab);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-['Noto_Sans_Arabic']" dir="rtl">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeModules={currentCompany?.activeModules || []}
        userName={userName}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          companyName={currentCompany ? currentCompany.name : ''}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-100">
          {activeTab === 'dashboard' && currentCompany && ActiveComponent ? (
            <Dashboard 
              company={currentCompany}
              onToggleModule={handleToggleModule}
              totalBalance={totalBalance}
              transactionsCount={transactionsCount}
            />
          ) : activeTab === 'dashboard' ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-slate-700">الرجاء اختيار شركة</h2>
              <p className="text-slate-500 mt-2">الرجاء اختيار شركة من القائمة للبدء.</p>
            </div>
          ) : ActiveComponent ? (
            <ActiveComponent 
              entries={(activeTab === 'journal' || activeTab === 'invoices') ? journalEntries : accounts}
              accounts={accounts}
              products={products}
              warehouses={warehouses}
              employees={employees}
              invoices={invoices}
              trialBalance={trialBalance}
              payrolls={payrolls}
              leads={leads}
              onAdd={activeTab === 'coa' ? (account: Account) => {
                console.log('Adding account:', account);
                handleAction('coa', 'add', account);
              } : activeTab === 'journal' ? (entry: any) => {
                console.log('Adding journal entry:', entry);
                handleAction('journal', 'add', entry);
              } : undefined}
              onEdit={activeTab === 'coa' ? (account: Account) => {
                console.log('Editing account:', account);
                handleAction('coa', 'edit', account);
              } : activeTab === 'journal' ? (entry: any) => {
                console.log('Editing journal entry:', entry);
                handleAction('journal', 'edit', entry);
              } : undefined}
              onDelete={activeTab === 'coa' ? (id: string) => {
                console.log('Deleting account:', id);
                handleAction('coa', 'delete', { id });
              } : activeTab === 'journal' ? (id: string) => {
                console.log('Deleting journal entry:', id);
                handleAction('journal', 'delete', { id });
              } : undefined}
              onAction={handleAction} 
              company={currentCompany} 
            />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-slate-700">مكون غير موجود</h2>
              <p className="text-slate-500 mt-2">عذرًا، لم نتمكن من العثور على المكون المطابق لهذا التبويب.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
