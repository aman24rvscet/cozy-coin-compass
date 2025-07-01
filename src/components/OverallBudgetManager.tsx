
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Edit2, Trash2, DollarSign, Euro, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

interface OverallBudget {
  id: string;
  amount: number;
  period: string;
  currency: string;
  budget_date: string;
  spent: number;
}

interface OverallBudgetManagerProps {
  onBudgetChange: () => void;
  refreshKey?: number;
}

const OverallBudgetManager: React.FC<OverallBudgetManagerProps> = ({ onBudgetChange, refreshKey }) => {
  const { user } = useAuth();
  const { currency } = useSettings();
  const [overallBudgets, setOverallBudgets] = useState<OverallBudget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<OverallBudget | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    period: 'monthly',
    currency: currency,
    budget_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const currencyOptions = [
    { value: 'USD', label: 'USD', icon: DollarSign, symbol: '$' },
    { value: 'EUR', label: 'EUR', icon: Euro, symbol: '€' },
    { value: 'INR', label: 'INR', icon: IndianRupee, symbol: '₹' },
  ];

  useEffect(() => {
    if (user) {
      loadOverallBudgets();
    }
  }, [user, refreshKey]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, currency }));
  }, [currency]);

  const loadOverallBudgets = async () => {
    if (!user) return;

    try {
      const { data: budgetData, error } = await supabase
        .from('overall_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('budget_date', { ascending: false });

      if (error) throw error;

      // Calculate spending for each overall budget
      const budgetsWithSpending = await Promise.all(
        (budgetData || []).map(async (budget) => {
          const budgetDate = new Date(budget.budget_date);
          let startDate: string;
          let endDate: string;

          if (budget.period === 'weekly') {
            const weekStart = new Date(budgetDate);
            weekStart.setDate(budgetDate.getDate() - budgetDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            startDate = weekStart.toISOString().split('T')[0];
            endDate = weekEnd.toISOString().split('T')[0];
          } else {
            startDate = `${budgetDate.getFullYear()}-${String(budgetDate.getMonth() + 1).padStart(2, '0')}-01`;
            const nextMonth = new Date(budgetDate.getFullYear(), budgetDate.getMonth() + 1, 0);
            endDate = nextMonth.toISOString().split('T')[0];
          }

          const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .gte('expense_date', startDate)
            .lte('expense_date', endDate);

          const spent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

          return {
            ...budget,
            spent
          };
        })
      );

      setOverallBudgets(budgetsWithSpending);
    } catch (error) {
      console.error('Error loading overall budgets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (editingBudget) {
        const { error } = await supabase
          .from('overall_budgets')
          .update({
            amount: parseFloat(formData.amount),
            period: formData.period,
            currency: formData.currency,
            budget_date: formData.budget_date,
          })
          .eq('id', editingBudget.id);

        if (error) throw error;
        toast.success('Overall budget updated successfully!');
      } else {
        const { error } = await supabase
          .from('overall_budgets')
          .insert([
            {
              user_id: user.id,
              amount: parseFloat(formData.amount),
              period: formData.period,
              currency: formData.currency,
              budget_date: formData.budget_date,
            }
          ]);

        if (error) throw error;
        toast.success('Overall budget created successfully!');
      }

      setFormData({ amount: '', period: 'monthly', currency: currency, budget_date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      setEditingBudget(null);
      loadOverallBudgets();
      onBudgetChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save overall budget');
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('overall_budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Overall budget deleted successfully');
      loadOverallBudgets();
      onBudgetChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete overall budget');
    }
  };

  const startEditing = (budget: OverallBudget) => {
    setEditingBudget(budget);
    setFormData({
      amount: budget.amount.toString(),
      period: budget.period,
      currency: budget.currency,
      budget_date: budget.budget_date,
    });
    setShowForm(true);
  };

  const cancelEditing = () => {
    setEditingBudget(null);
    setFormData({ amount: '', period: 'monthly', currency: currency, budget_date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Overall Budget</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <PlusCircle className="w-4 h-4 mr-1" />
          Set Overall Budget
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingBudget ? 'Edit Overall Budget' : 'Set Overall Budget'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select 
                  value={formData.period} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_date">Budget Date</Label>
                <Input
                  id="budget_date"
                  type="date"
                  value={formData.budget_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_date: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={cancelEditing} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : (editingBudget ? 'Update Budget' : 'Set Budget')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {overallBudgets.map((budget) => {
          const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
          const isOverBudget = percentage > 100;
          const currencyOption = currencyOptions.find(opt => opt.value === budget.currency) || currencyOptions[0];
          const CurrencyIcon = currencyOption.icon;
          const symbol = currencyOption.symbol;

          return (
            <Card key={budget.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(budget.budget_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrencyIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {symbol}{budget.spent.toFixed(2)} / {symbol}{budget.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(budget)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBudget(budget.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                />
                <p className={`text-xs mt-1 ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                  {percentage.toFixed(1)}% used
                  {isOverBudget && ' (Over budget!)'}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {overallBudgets.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No overall budget set. Create your first overall budget to track your spending!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OverallBudgetManager;
