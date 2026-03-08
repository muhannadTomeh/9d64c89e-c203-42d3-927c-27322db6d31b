
DROP POLICY "Users can insert companies" ON public.companies;
CREATE POLICY "Users can insert companies" ON public.companies FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
