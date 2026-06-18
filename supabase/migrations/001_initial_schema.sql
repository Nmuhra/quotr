-- Quotr Database Setup - Minimal Migration
-- Works with existing schema, adds only what's missing

-- ─────────────────────────────────────────────────────────────────
-- FUNCTION: handle_new_user
-- Creates a business record when a user signs up
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.businesses (
    owner_id,
    name,
    trade_type,
    subscription_status,
    trial_ends_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'trade_type', 'general'),
    'trial',
    now() + interval '30 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────────
-- TRIGGER: on_auth_user_created
-- Fires when a new user signs up
-- ─────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- FUNCTION: handle_updated_at
-- Auto-updates the updated_at timestamp on row changes
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────
-- TRIGGERS: updated_at maintenance
-- ─────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS businesses_updated_at ON public.businesses;
CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS clients_updated_at ON public.clients;
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS quotes_updated_at ON public.quotes;
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS line_item_templates_updated_at ON public.line_item_templates;
CREATE TRIGGER line_item_templates_updated_at BEFORE UPDATE ON public.line_item_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- RLS POLICIES (Row Level Security)
-- Users can only see/edit their own business data
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;

-- Businesses: users own their own business record
DROP POLICY IF EXISTS businesses_select ON public.businesses;
DROP POLICY IF EXISTS businesses_insert ON public.businesses;
DROP POLICY IF EXISTS businesses_update ON public.businesses;

CREATE POLICY businesses_select ON public.businesses
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY businesses_insert ON public.businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY businesses_update ON public.businesses
  FOR UPDATE USING (owner_id = auth.uid());

-- Clients: users can access clients in their business
DROP POLICY IF EXISTS clients_select ON public.clients;
DROP POLICY IF EXISTS clients_insert ON public.clients;
DROP POLICY IF EXISTS clients_update ON public.clients;

CREATE POLICY clients_select ON public.clients
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY clients_insert ON public.clients
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY clients_update ON public.clients
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));

-- Quotes: users can access quotes in their business
DROP POLICY IF EXISTS quotes_select ON public.quotes;
DROP POLICY IF EXISTS quotes_insert ON public.quotes;
DROP POLICY IF EXISTS quotes_update ON public.quotes;

CREATE POLICY quotes_select ON public.quotes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY quotes_insert ON public.quotes
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY quotes_update ON public.quotes
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));

-- Quote line items: inherit from parent quote
DROP POLICY IF EXISTS quote_line_items_select ON public.quote_line_items;
DROP POLICY IF EXISTS quote_line_items_insert ON public.quote_line_items;
DROP POLICY IF EXISTS quote_line_items_update ON public.quote_line_items;

CREATE POLICY quote_line_items_select ON public.quote_line_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.businesses b ON b.id = q.business_id
    WHERE q.id = quote_id AND b.owner_id = auth.uid()
  ));
CREATE POLICY quote_line_items_insert ON public.quote_line_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.businesses b ON b.id = q.business_id
    WHERE q.id = quote_id AND b.owner_id = auth.uid()
  ));
CREATE POLICY quote_line_items_update ON public.quote_line_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.quotes q
    JOIN public.businesses b ON b.id = q.business_id
    WHERE q.id = quote_id AND b.owner_id = auth.uid()
  ));

-- Invoices: users can access invoices in their business
DROP POLICY IF EXISTS invoices_select ON public.invoices;
DROP POLICY IF EXISTS invoices_insert ON public.invoices;
DROP POLICY IF EXISTS invoices_update ON public.invoices;

CREATE POLICY invoices_select ON public.invoices
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY invoices_insert ON public.invoices
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY invoices_update ON public.invoices
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));

-- Line item templates: users can access templates for their business
DROP POLICY IF EXISTS line_item_templates_select ON public.line_item_templates;
DROP POLICY IF EXISTS line_item_templates_insert ON public.line_item_templates;
DROP POLICY IF EXISTS line_item_templates_update ON public.line_item_templates;

CREATE POLICY line_item_templates_select ON public.line_item_templates
  FOR SELECT USING (
    business_id IS NULL OR EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );
CREATE POLICY line_item_templates_insert ON public.line_item_templates
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY line_item_templates_update ON public.line_item_templates
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));

-- Push tokens: users can manage their own push tokens
DROP POLICY IF EXISTS push_tokens_select ON public.push_tokens;
DROP POLICY IF EXISTS push_tokens_insert ON public.push_tokens;

CREATE POLICY push_tokens_select ON public.push_tokens
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY push_tokens_insert ON public.push_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());
