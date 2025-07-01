
-- Add overall budgets table for monthly/weekly budgets
CREATE TABLE public.overall_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period TEXT DEFAULT 'monthly',
  currency TEXT DEFAULT 'USD',
  budget_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for overall budgets
ALTER TABLE public.overall_budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for overall budgets
CREATE POLICY "Users can manage own overall budgets" ON public.overall_budgets FOR ALL USING (true);

-- Add budget_date to existing budgets table for better tracking
ALTER TABLE public.budgets ADD COLUMN budget_date DATE DEFAULT CURRENT_DATE;

-- Create indexes for better query performance
CREATE INDEX idx_overall_budgets_user_date ON public.overall_budgets(user_id, budget_date);
CREATE INDEX idx_budgets_user_date ON public.budgets(user_id, budget_date);
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, expense_date);
