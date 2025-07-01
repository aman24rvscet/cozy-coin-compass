
-- Add salary and additional income tracking table
CREATE TABLE public.income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'salary', -- 'salary' or 'additional'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT DEFAULT 'USD',
  frequency TEXT DEFAULT 'monthly', -- 'monthly', 'weekly', 'one-time'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for income sources
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for income sources
CREATE POLICY "Users can manage own income sources" ON public.income_sources FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_income_sources_user_date ON public.income_sources(user_id, income_date);
CREATE INDEX idx_income_sources_user_type ON public.income_sources(user_id, source_type);
