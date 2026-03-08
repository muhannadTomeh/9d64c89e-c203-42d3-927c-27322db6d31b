
-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  company_id UUID REFERENCES public.companies(id),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Seasons table
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT,
  bags_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  oil_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  tanks JSONB NOT NULL DEFAULT '[]'::jsonb,
  return_amount JSONB NOT NULL DEFAULT '{"oil":0,"cash":0}'::jsonb,
  tanks_payment JSONB NOT NULL DEFAULT '{"plastic":0,"metal":0,"oil":0,"cash":0}'::jsonb,
  total JSONB NOT NULL DEFAULT '{"oil":0,"cash":0}'::jsonb,
  notes TEXT,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oil_return_percentage NUMERIC NOT NULL DEFAULT 25,
  oil_buy_price NUMERIC NOT NULL DEFAULT 20,
  oil_sell_price NUMERIC NOT NULL DEFAULT 25,
  cash_return_price NUMERIC NOT NULL DEFAULT 5,
  tank_prices JSONB NOT NULL DEFAULT '{"plastic":15,"metal":25}'::jsonb,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Workers table
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT,
  type TEXT NOT NULL DEFAULT 'hourly',
  hourly_rate NUMERIC,
  shift_rate NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Worker shifts table
CREATE TABLE public.worker_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  hours NUMERIC,
  shifts NUMERIC,
  amount NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.worker_shifts ENABLE ROW LEVEL SECURITY;

-- Worker payments table
CREATE TABLE public.worker_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.worker_payments ENABLE ROW LEVEL SECURITY;

-- Oil trades table
CREATE TABLE public.oil_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'buy',
  amount NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  person_name TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.oil_trades ENABLE ROW LEVEL SECURITY;

-- Expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$$;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own companies" ON public.companies FOR SELECT USING (
  id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can insert companies" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own companies" ON public.companies FOR UPDATE USING (
  id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can read own seasons" ON public.seasons FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can insert seasons" ON public.seasons FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update own seasons" ON public.seasons FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage own customers" ON public.customers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own invoices" ON public.invoices FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own settings" ON public.settings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own workers" ON public.workers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own worker_shifts" ON public.worker_shifts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own worker_payments" ON public.worker_payments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own oil_trades" ON public.oil_trades FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own expenses" ON public.expenses FOR ALL USING (user_id = auth.uid());

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id UUID;
  new_season_id UUID;
BEGIN
  INSERT INTO public.companies (name) VALUES ('شركتي') RETURNING id INTO new_company_id;
  INSERT INTO public.seasons (company_id, name, year, is_active) VALUES (new_company_id, 'موسم ' || EXTRACT(YEAR FROM now())::text, EXTRACT(YEAR FROM now())::integer, true) RETURNING id INTO new_season_id;
  INSERT INTO public.user_profiles (id, role, company_id) VALUES (NEW.id, 'admin', new_company_id);
  INSERT INTO public.settings (user_id, season_id) VALUES (NEW.id, new_season_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
