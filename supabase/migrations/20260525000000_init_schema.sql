-- SQL Migration: 20260525000000_init_schema.sql
-- Description: Initialize schema for BillFlow ERP system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (Extends Supabase Auth profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    logo_url TEXT,
    invoice_prefix VARCHAR(10) DEFAULT 'BF',
    currency VARCHAR(10) DEFAULT 'INR',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Branches table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Staff mapping table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_business_category UNIQUE (business_id, name)
);

-- 6. Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    sku VARCHAR(100),
    purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (gst_rate >= 0),
    stock_qty DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    low_stock_threshold DECIMAL(12, 2) DEFAULT 5.00,
    expiry_date DATE,
    batch_no VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    gstin VARCHAR(15),
    credit_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00, -- positive balance = customer owes business (Udhar)
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_business_customer_phone UNIQUE (business_id, phone)
);

-- 8. Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    gst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'unpaid', 'partially_paid')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_business_invoice_number UNIQUE (business_id, invoice_number)
);

-- 9. Invoice items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    qty DECIMAL(12, 2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    gst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'credit')),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    transaction_ref VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Credits ledger (Udhar history)
CREATE TABLE IF NOT EXISTS public.credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('due', 'payment')), -- due: customer owes, payment: customer cleared balance
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Stock movements table (Audit trail)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    qty DECIMAL(12, 2) NOT NULL, -- negative for deduction, positive for addition
    type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'purchase', 'return', 'audit', 'adjustment')),
    reference_id UUID, -- links to invoice_id, purchase_id, etc.
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Subscriptions table (SaaS Licensing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    razorpay_sub_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Printer settings table
CREATE TABLE IF NOT EXISTS public.printer_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    printer_type VARCHAR(50) NOT NULL DEFAULT 'browser' CHECK (printer_type IN ('browser', 'usb', 'network', 'bluetooth')),
    connection_string VARCHAR(255), -- IP for network, COM/Port for USB, MAC for Bluetooth
    paper_size_mm INTEGER DEFAULT 80 CHECK (paper_size_mm IN (58, 80)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. WhatsApp delivery logs
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVENTORY MANAGEMENT AUTOMATION: Auto-update stock count on product sales
CREATE OR REPLACE FUNCTION public.decrease_stock_on_invoice_item()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = stock_qty - NEW.qty
    WHERE id = NEW.product_id;
    
    INSERT INTO public.stock_movements (product_id, qty, type, reference_id, notes)
    VALUES (NEW.product_id, -NEW.qty, 'sale', NEW.invoice_id, 'Stock deducted automatically from sale.');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_decrease_stock_on_sale
AFTER INSERT ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.decrease_stock_on_invoice_item();


-- UDHAR (CREDIT) AUTOMATION: Auto-increment credit balance if credit payment method is used
CREATE OR REPLACE FUNCTION public.apply_invoice_credit_balance()
RETURNS TRIGGER AS $$
DECLARE
    credit_amount DECIMAL(12, 2);
BEGIN
    -- Sum payments of type 'credit' (Udhar)
    SELECT COALESCE(SUM(amount), 0.00) INTO credit_amount
    FROM public.payments
    WHERE invoice_id = NEW.id AND payment_method = 'credit';
    
    IF credit_amount > 0 AND NEW.customer_id IS NOT NULL THEN
        -- Add to customer's balance
        UPDATE public.customers
        SET credit_balance = credit_balance + credit_amount
        WHERE id = NEW.customer_id;
        
        -- Insert history log
        INSERT INTO public.credits (customer_id, invoice_id, type, amount, notes)
        VALUES (NEW.customer_id, NEW.id, 'due', credit_amount, 'Automatic balance due from transaction.');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_apply_credit_on_invoice
AFTER INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.apply_invoice_credit_balance();


-- Update updated_at timestamps automatically
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_printer_settings_updated_at BEFORE UPDATE ON public.printer_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE OR REPLACE TRIGGER update_whatsapp_logs_updated_at BEFORE UPDATE ON public.whatsapp_logs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
