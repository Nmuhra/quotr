-- Quotr Initial Schema
-- Creates the core tables for quote generation and business management

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "http";

-- ─────────────────────────────────────────────────────────────────
-- BUSINESSES TABLE
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core info
  name text NOT NULL DEFAULT 'My Business',
  trade_type text NOT NULL DEFAULT 'general',

  -- Contact
  email text,
  phone text,
  address text,
  registration_number text,
  vat_number text,

  -- Branding
  logo_url text,

  -- Billing / PayFast
  bank_name text,
  bank_branch text,
  bank_account text,
  payfast_token text,

  -- Subscription
  subscription_status text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamp with time zone NOT NULL,
  subscription_ends_at timestamp with time zone,

  -- Quote defaults
  default_deposit_pct integer DEFAULT 30,
  default_payment_terms text DEFAULT 'Due on invoice',
  default_validity_days integer DEFAULT 30,
  default_vat_enabled boolean DEFAULT false,
  default_vat_rate numeric(5,2) DEFAULT 15.00,

  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,

  -- Indexes
  CONSTRAINT unique_owner UNIQUE(owner_id),
  CONSTRAINT positive_deposit_pct CHECK (default_deposit_pct >= 0 AND default_deposit_pct <= 100),
  CONSTRAINT positive_validity_days CHECK (default_validity_days > 0)
);

CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX idx_businesses_deleted_at ON public.businesses(deleted_at);

-- ─────────────────────────────────────────────────────────────────
-- CLIENTS TABLE
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  name text NOT NULL,
  email text,
  phone text,
  address text,

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX idx_clients_business_id ON public.clients(business_id);

-- ─────────────────────────────────────────────────────────────────
-- LINE ITEM TEMPLATES TABLE
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.line_item_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  description text NOT NULL,
  rate_type text NOT NULL, -- 'fixed' or 'hourly'
  rate numeric(10,2) NOT NULL,
  category text, -- e.g. 'labour', 'materials', 'travel'
  sort_order integer DEFAULT 0,

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX idx_line_item_templates_business_id ON public.line_item_templates(business_id);

-- ─────────────────────────────────────────────────────────────────
-- QUOTES TABLE
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Public sharing
  public_token text UNIQUE NOT NULL,

  -- Status
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'signed', 'invoiced', 'paid', 'expired'

  -- Data
  title text DEFAULT 'Quotation',
  scope_of_work text,
  deposit_pct numeric(5,2),
  payment_terms text,
  validity_days integer,
  vat_enabled boolean,
  vat_rate numeric(5,2),

  -- Dates
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  signed_at timestamp with time zone,
  signed_by_name text,

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE INDEX idx_quotes_business_id ON public.quotes(business_id);
CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_quotes_public_token ON public.quotes(public_token);
CREATE INDEX idx_quotes_status ON public.quotes(status);

-- ─────────────────────────────────────────────────────────────────
-- QUOTE LINE ITEMS TABLE
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quote_line_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,

  description text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  rate numeric(10,2) NOT NULL,

  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_line_items_quote_id ON public.quote_line_items(quote_id);

-- ─────────────────────────────────────────────────────────────────
-- INVOICES TABLE
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,

  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'

  amount_total numeric(10,2) NOT NULL,
  amount_paid numeric(10,2) DEFAULT 0,
  deposit_amount numeric(10,2),

  payfast_payment_id text,

  issued_at timestamp with time zone DEFAULT now(),
  due_at timestamp with time zone,
  paid_at timestamp with time zone,

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_business_id ON public.invoices(business_id);
CREATE INDEX idx_invoices_quote_id ON public.invoices(quote_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);

-- ─────────────────────────────────────────────────────────────────
-- PUSH TOKENS TABLE (for Firebase FCM)
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  token text NOT NULL UNIQUE,
  platform text NOT NULL, -- 'ios', 'android', 'web'

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_tokens_business_id ON public.push_tokens(business_id);

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Businesses: users can view/edit their own
CREATE POLICY businesses_select ON public.businesses
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY businesses_insert ON public.businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY businesses_update ON public.businesses
  FOR UPDATE USING (owner_id = auth.uid());

-- Clients: users can view/edit their own business's clients
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

-- Line item templates: users can view/edit their own business's templates
CREATE POLICY line_item_templates_select ON public.line_item_templates
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
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

-- Quotes: users can view/edit their own business's quotes
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

-- Invoices: users can view/edit their own business's invoices
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

-- Push tokens: users can view/edit their own business's tokens
CREATE POLICY push_tokens_select ON public.push_tokens
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));
CREATE POLICY push_tokens_insert ON public.push_tokens
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_id AND owner_id = auth.uid()
  ));

-- ─────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────

-- Update updated_at on any row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER line_item_templates_updated_at BEFORE UPDATE ON public.line_item_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER push_tokens_updated_at BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create business record on user signup
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

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
