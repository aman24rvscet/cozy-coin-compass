
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
  category: {
    name: string;
    color: string;
  } | null;
}

interface ExpenseListProps {
  refreshKey: number;
  onExpenseChange: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ refreshKey, onExpenseChange }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [user, refreshKey]);

  const loadExpenses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          amount,
          description,
          expense_date,
          expense_categories (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedExpenses = data?.map(expense => ({
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        expense_date: expense.expense_date,
        category: expense.expense_categories ? {
          name: expense.expense_categories.name,
          color: expense.expense_categories.color
        } : null
      })) || [];

      setExpenses(formattedExpenses);
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
      onExpenseChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No expenses found. Add your first expense to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">${expense.amount.toFixed(2)}</span>
                  {expense.category && (
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: expense.category.color + '20', color: expense.category.color }}
                    >
                      {expense.category.name}
                    </Badge>
                  )}
                </div>
                {expense.description && (
                  <p className="text-gray-600 mb-2">{expense.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(expense.expense_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteExpense(expense.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseList;
