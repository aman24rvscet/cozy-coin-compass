import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Trash2, DollarSign, Euro, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import OverallBudgetManager from './OverallBudgetManager';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Budget {
  id: string;
  amount: number;
  period: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  spent: number;
  currency?: string;
}

interface BudgetManagerProps {
  onBudgetChange: () => void;
  refreshKey?: number;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ onBudgetChange, refreshKey }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(false);

  const currencyOptions = [
    { value: 'USD', label: 'USD', icon: DollarSign },
    { value: 'EUR', label: 'EUR', icon: Euro },
    { value: 'INR', label: 'INR', icon: IndianRupee },
  ];

  useEffect(() => {
    if (user) {
      loadBudgets();
      loadCategories();
    }
  }, [user, refreshKey]);

  const loadCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBudgets = async () => {
    if (!user) return;

    try {
      const { data: budgetData, error } = await supabase
        .from('budgets')
        .select(`
          id,
          amount,
          period,
          expense_categories (
            id,
            name,
            color
          ),
          currency
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Get spending for each budget category this month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const budgetsWithSpending = await Promise.all(
        (budgetData || []).map(async (budget) => {
          const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .eq('category_id', budget.expense_categories.id)
            .gte('expense_date', `${currentMonth}-01`);

          const spent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

          return {
            id: budget.id,
            amount: budget.amount,
            period: budget.period,
            category: {
              id: budget.expense_categories.id,
              name: budget.expense_categories.name,
              color: budget.expense_categories.color
            },
            spent,
            currency: budget.currency
          };
        })
      );

      setBudgets(budgetsWithSpending);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: user.id,
            category_id: formData.categoryId,
            amount: parseFloat(formData.amount),
            period: formData.period,
            currency: formData.currency,
          }
        ]);

      if (error) throw error;

      toast.success('Budget created successfully!');
      setFormData({ categoryId: '', amount: '', period: 'monthly', currency: 'USD' });
      setShowForm(false);
      loadBudgets();
      onBudgetChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Budget deleted successfully');
      loadBudgets();
      onBudgetChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Budget Section */}
      <OverallBudgetManager onBudgetChange={onBudgetChange} refreshKey={refreshKey} />
      
      {/* Category Budgets Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Category Budgets</h3>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Category Budget
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
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
                      <SelectItem value="yearly">Yearly</SelectItem>
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
                        <SelectItem key={option.value} value={option.value} className="flex items-center gap-2">
                          <option.icon className="w-4 h-4 inline-block mr-1" />
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Budget'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {budgets.map((budget) => {
            const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            const isOverBudget = percentage > 100;
            const currencyOption = currencyOptions.find(opt => opt.value === (budget.currency || 'USD')) || currencyOptions[0];
            const CurrencyIcon = currencyOption.icon;
            const currencySymbol = currencyOption.value === 'USD' ? '$' : currencyOption.value === 'EUR' ? '€' : '₹';

            return (
              <Card key={budget.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium" style={{ color: budget.category.color }}>
                        {budget.category.name}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {currencySymbol}{budget.spent.toFixed(2)} / {currencySymbol}{budget.amount.toFixed(2)}
                      </span>
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

          {budgets.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No budgets set. Create your first budget to track spending!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
