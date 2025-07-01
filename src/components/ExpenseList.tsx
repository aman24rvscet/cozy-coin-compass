
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, DollarSign, Euro, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import CategoryIcon from './CategoryIcon';

interface Expense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  currency: string;
}

interface ExpenseListProps {
  refreshKey: number;
  onExpenseChange: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ refreshKey, onExpenseChange }) => {
  const { user } = useAuth();
  const { currency } = useSettings();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case 'EUR': return '€';
      case 'INR': return '₹';
      case 'USD': return '$';
      default: return '$';
    }
  };

  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'EUR': return Euro;
      case 'INR': return IndianRupee;
      default: return DollarSign;
    }
  };

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user, refreshKey, filter]);

  const loadExpenses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('expenses')
        .select(`
          id,
          amount,
          description,
          expense_date,
          currency,
          expense_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .limit(20);

      if (filter !== 'all') {
        const date = new Date();
        if (filter === 'week') {
          date.setDate(date.getDate() - 7);
        } else if (filter === 'month') {
          date.setMonth(date.getMonth() - 1);
        }
        query = query.gte('expense_date', date.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedExpenses: Expense[] = (data || []).map(expense => ({
        id: expense.id,
        amount: Number(expense.amount),
        description: expense.description || '',
        expense_date: expense.expense_date,
        currency: expense.currency || 'USD',
        category: expense.expense_categories ? {
          id: expense.expense_categories.id,
          name: expense.expense_categories.name,
          color: expense.expense_categories.color,
          icon: expense.expense_categories.icon
        } : null
      }));

      setExpenses(processedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Expense deleted successfully');
      loadExpenses();
      onExpenseChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>Loading expenses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense) => {
            const CurrencyIcon = getCurrencyIcon(expense.currency);
            const currencySymbol = getCurrencySymbol(expense.currency);

            return (
              <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {expense.category ? (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: expense.category.color }}
                    >
                      <CategoryIcon 
                        iconName={expense.category.icon} 
                        size={16} 
                        color="white"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon iconName="dollar-sign" size={16} color="white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {expense.description || 'No description'}
                      </span>
                      {expense.category && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full text-white flex-shrink-0"
                          style={{ backgroundColor: expense.category.color }}
                        >
                          {expense.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-semibold">
                      <CurrencyIcon className="w-4 h-4" />
                      <span>{currencySymbol}{expense.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteExpense(expense.id)}
                    className="ml-2"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          {expenses.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No expenses found. Add your first expense to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
