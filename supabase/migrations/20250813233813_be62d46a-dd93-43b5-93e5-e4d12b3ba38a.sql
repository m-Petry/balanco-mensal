-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication required)
CREATE POLICY "Anyone can manage categories" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Anyone can manage transactions" 
ON public.transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default categories (without custom IDs)
INSERT INTO public.categories (name, color, type) VALUES
  ('Salário', '#22c55e', 'income'),
  ('Freelance', '#10b981', 'income'),
  ('Investimentos', '#059669', 'income'),
  ('Bônus', '#047857', 'income'),
  ('Moradia', '#ef4444', 'expense'),
  ('Alimentação', '#f97316', 'expense'),
  ('Transporte', '#eab308', 'expense'),
  ('Saúde', '#ec4899', 'expense'),
  ('Educação', '#8b5cf6', 'expense'),
  ('Lazer', '#06b6d4', 'expense'),
  ('Compras', '#84cc16', 'expense'),
  ('Contas', '#6366f1', 'expense'),
  ('Seguros', '#f59e0b', 'expense'),
  ('Outros', '#64748b', 'expense');

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_categories_type ON public.categories(type);