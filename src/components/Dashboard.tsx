
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, LogOut, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import BudgetManager from './BudgetManager';

interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  totalBudget: number;
  expenseCount: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    totalBudget: 0,
    expenseCount: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

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

      const totalExpenses = allExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const monthlyTotal = monthlyExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const totalBudget = budgets?.reduce((sum, budget) => sum + Number(budget.amount), 0) || 0;

      setStats({
        totalExpenses,
        monthlyExpenses: monthlyTotal,
        totalBudget,
        expenseCount: allExpenses?.length || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowExpenseForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.full_name || user?.email}</p>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.expenseCount} total transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Current month spending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBudget.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Monthly budget limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalBudget > 0 ? `${((stats.monthlyExpenses / stats.totalBudget) * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Budget used this month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Expenses</h2>
              <Button onClick={() => setShowExpenseForm(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
            <ExpenseList refreshKey={refreshKey} onExpenseChange={() => setRefreshKey(prev => prev + 1)} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6">Budget Management</h2>
            <BudgetManager onBudgetChange={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div>
      </main>

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
