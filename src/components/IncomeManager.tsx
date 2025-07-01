import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, DollarSign, Euro, IndianRupee, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface IncomeSource {
  id: string;
  source_type: 'salary' | 'additional';
  amount: number;
  description: string | null;
  frequency: string;
  is_active: boolean;
  currency: string;
}

interface IncomeManagerProps {
  onIncomeChange: () => void;
  refreshKey?: number;
}

const IncomeManager: React.FC<IncomeManagerProps> = ({ onIncomeChange, refreshKey }) => {
  const { user } = useAuth();
  const { currency } = useSettings();
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sourceType: 'salary' as 'salary' | 'additional',
    amount: '',
    description: '',
    frequency: 'monthly',
    currency: currency
  });
  const [loading, setLoading] = useState(false);

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
      loadIncomeSources();
    }
  }, [user, refreshKey]);

  const loadIncomeSources = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        source_type: item.source_type as 'salary' | 'additional'
      }));
      
      setIncomeSources(typedData);
    } catch (error) {
      console.error('Error loading income sources:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('income_sources')
        .insert([
          {
            user_id: user.id,
            source_type: formData.sourceType,
            amount: parseFloat(formData.amount),
            description: formData.description || null,
            frequency: formData.frequency,
            currency: formData.currency
          }
        ]);

      if (error) throw error;

      toast.success('Income source added successfully!');
      setFormData({
        sourceType: 'salary',
        amount: '',
        description: '',
        frequency: 'monthly',
        currency: currency
      });
      setShowForm(false);
      loadIncomeSources();
      onIncomeChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add income source');
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('income_sources')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast.success('Income source updated');
      loadIncomeSources();
      onIncomeChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update income source');
    }
  };

  const deleteIncomeSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Income source deleted');
      loadIncomeSources();
      onIncomeChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete income source');
    }
  };

  const totalMonthlyIncome = incomeSources
    .filter(source => source.is_active)
    .reduce((total, source) => {
      let monthlyAmount = source.amount;
      if (source.frequency === 'weekly') {
        monthlyAmount = source.amount * 4.33; // Average weeks per month
      } else if (source.frequency === 'yearly') {
        monthlyAmount = source.amount / 12;
      }
      return total + monthlyAmount;
    }, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Income Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Monthly Income: {getCurrencySymbol(currency)}{totalMonthlyIncome.toFixed(2)}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Income
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Income Source</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceType">Type</Label>
                <Select 
                  value={formData.sourceType} 
                  onValueChange={(value: 'salary' | 'additional') => 
                    setFormData(prev => ({ ...prev, sourceType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="additional">Additional Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Main job, Freelance work, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add Income'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {incomeSources.map((source) => {
          const CurrencyIcon = getCurrencyIcon(source.currency);
          const currencySymbol = getCurrencySymbol(source.currency);

          return (
            <Card key={source.id} className={!source.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {source.source_type === 'salary' ? 'Salary' : 'Additional Income'}
                      </span>
                      {source.description && (
                        <span className="text-sm text-muted-foreground">
                          - {source.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <CurrencyIcon className="w-4 h-4" />
                      <span>{currencySymbol}{source.amount.toFixed(2)}</span>
                      <span>•</span>
                      <span className="capitalize">{source.frequency}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={() => toggleActiveStatus(source.id, source.is_active)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIncomeSource(source.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {incomeSources.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No income sources added yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IncomeManager;
