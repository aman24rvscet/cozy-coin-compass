import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, Calendar, TrendingUp, PieChart, BarChart3, LineChart, DollarSign, Euro, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart as RechartsLineChart, Line, AreaChart, Area, Pie } from 'recharts';

interface ExpenseData {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
  category: {
    name: string;
    color: string;
  } | null;
}

interface CategorySpending {
  name: string;
  amount: number;
  color: string;
  count: number;
}

interface MonthlyData {
  month: string;
  amount: number;
  expenses: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { currency } = useSettings();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [timeRange, setTimeRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [averagePerDay, setAveragePerDay] = useState(0);

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : '$';
  const CurrencyIcon = currency === 'EUR' ? Euro : currency === 'INR' ? IndianRupee : DollarSign;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };

  const loadAnalyticsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { start, end } = getDateRange();

      // Load expenses with categories
      const { data: expenseData, error } = await supabase
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
        .gte('expense_date', start)
        .lte('expense_date', end)
        .order('expense_date', { ascending: false });

      if (error) throw error;

      const processedExpenses: ExpenseData[] = (expenseData || []).map(expense => ({
        id: expense.id,
        amount: Number(expense.amount),
        description: expense.description || '',
        expense_date: expense.expense_date,
        category: expense.expense_categories ? {
          name: expense.expense_categories.name,
          color: expense.expense_categories.color
        } : null
      }));

      setExpenses(processedExpenses);

      // Calculate category spending
      const categoryMap = new Map<string, CategorySpending>();
      
      processedExpenses.forEach(expense => {
        const categoryName = expense.category?.name || 'Uncategorized';
        const categoryColor = expense.category?.color || '#8884d8';
        
        if (categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName)!;
          existing.amount += expense.amount;
          existing.count += 1;
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            amount: expense.amount,
            color: categoryColor,
            count: 1
          });
        }
      });

      setCategorySpending(Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount));

      // Calculate monthly data for line chart
      const monthlyMap = new Map<string, MonthlyData>();
      processedExpenses.forEach(expense => {
        const month = expense.expense_date.slice(0, 7); // YYYY-MM format
        
        if (monthlyMap.has(month)) {
          const existing = monthlyMap.get(month)!;
          existing.amount += expense.amount;
          existing.expenses += 1;
        } else {
          monthlyMap.set(month, {
            month,
            amount: expense.amount,
            expenses: 1
          });
        }
      });

      setMonthlyData(Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)));

      // Calculate summary stats
      const total = processedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalSpent(total);
      setTotalTransactions(processedExpenses.length);
      
      const daysDiff = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
      setAveragePerDay(total / daysDiff);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="py-4">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Detailed analysis of your spending patterns
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Go to Home"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Time Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="timeRange">Period</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {timeRange === 'custom' && (
                <>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencySymbol}{totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencySymbol}{averagePerDay.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per day spending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categorySpending.length}</div>
              <p className="text-xs text-muted-foreground">
                Different categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Spending Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Amount']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Monthly Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Amount']} />
                  <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Bar Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Category Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categorySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#8884d8">
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Summary</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorySpending.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </TableCell>
                      <TableCell>{category.count}</TableCell>
                      <TableCell className="text-right font-medium">
                        {currencySymbol}{category.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest expenses in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.slice(0, 10).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{expense.description || 'No description'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {currencySymbol}{expense.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
