import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, LogOut, DollarSign, TrendingUp, Calendar, Settings, Euro, IndianRupee, BarChart3, Wallet, PieChart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import BudgetManager from './BudgetManager';
import IncomeManager from './IncomeManager';
import Footer from './Footer';
import MobileNav from './MobileNav';

interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  totalBudget: number;
  expenseCount: number;
  monthlyIncome: number;
  salaryUtilization: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { currency } = useSettings();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    totalBudget: 0,
    expenseCount: 0,
    monthlyIncome: 0,
    salaryUtilization: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case 'EUR': return '€';
      case 'INR': return '₹';
      case 'USD': return '$';
      default: return '$';
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'EUR': return Euro;
      case 'INR': return IndianRupee;
      case 'USD': return DollarSign;
      default: return DollarSign;
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user, refreshKey]);

  const loadDashboardStats = async () => {
    if (!user) return;

    try {
      // Get total expenses
      const { data: allExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id);

      // Get monthly expenses
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', `${currentMonth}-01`);

      // Get total budget
      const { data: budgets } = await supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user.id);

      // Get income sources
      const { data: incomeSources } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const totalExpenses = allExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const monthlyTotal = monthlyExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const totalBudget = budgets?.reduce((sum, budget) => sum + Number(budget.amount), 0) || 0;

      // Calculate monthly income - properly handle different frequencies
      const monthlyIncome = incomeSources?.reduce((total, source) => {
        let monthlyAmount = Number(source.amount);
        if (source.frequency === 'weekly') {
          monthlyAmount = monthlyAmount * 4.33; // Average weeks per month
        } else if (source.frequency === 'yearly') {
          monthlyAmount = monthlyAmount / 12;
        } else if (source.frequency === 'one-time') {
          monthlyAmount = 0; // Don't count one-time income in monthly calculations
        }
        return total + monthlyAmount;
      }, 0) || 0;

      const salaryUtilization = monthlyIncome > 0 ? (monthlyTotal / monthlyIncome) * 100 : 0;

      setStats({
        totalExpenses,
        monthlyExpenses: monthlyTotal,
        totalBudget,
        expenseCount: allExpenses?.length || 0,
        monthlyIncome,
        salaryUtilization
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowExpenseForm(false);
  };

  const CurrencyIcon = getCurrencyIcon(currency);
  const remainingIncome = stats.monthlyIncome > 0 ? stats.monthlyIncome - stats.monthlyExpenses : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <img src="/below.png" alt="logo" className="w-32 sm:w-40 h-8 sm:h-12 bg-transparent" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/how-to-use">
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  How to Use
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Navigation */}
            <MobileNav user={user} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.monthlyIncome)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyIncome === 0 ? 'Add income sources' : 'Total monthly income'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.monthlyExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                Current month spending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Used</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${
                stats.monthlyIncome === 0 ? 'text-muted-foreground' : 
                stats.salaryUtilization > 100 ? 'text-red-600' : 
                stats.salaryUtilization > 80 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {stats.monthlyIncome === 0 ? 'N/A' : `${stats.salaryUtilization.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyIncome === 0 ? 'Add income first' : 'Of monthly income'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${
                stats.monthlyIncome === 0 ? 'text-muted-foreground' :
                remainingIncome < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {stats.monthlyIncome === 0 ? formatCurrency(0) : formatCurrency(remainingIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyIncome === 0 ? 'Add income first' : 'Left this month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.expenseCount} total transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Expenses Section */}
          <div className="xl:col-span-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">Recent Expenses</h2>
              <Button onClick={() => setShowExpenseForm(true)} className="w-full sm:w-auto">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
            <ExpenseList refreshKey={refreshKey} onExpenseChange={() => setRefreshKey(prev => prev + 1)} />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Income & Budget</h2>
              <IncomeManager onIncomeChange={() => setRefreshKey(prev => prev + 1)} refreshKey={refreshKey} />
            </div>
            
            <BudgetManager onBudgetChange={() => setRefreshKey(prev => prev + 1)} refreshKey={refreshKey} />
          </div>
        </div>
      </main>

      <Footer />

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;
