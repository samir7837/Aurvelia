-- FAQs table
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs public read"
ON public.faqs FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin manage faqs"
ON public.faqs FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER faqs_touch_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Site content (CMS key/value)
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site content public read"
ON public.site_content FOR SELECT
USING (true);

CREATE POLICY "admin manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_content_touch_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Review moderation by admins
CREATE POLICY "admin moderate reviews update"
ON public.reviews FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin moderate reviews delete"
ON public.reviews FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Contact message moderation by admins
CREATE POLICY "admin update contact"
ON public.contact_messages FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed some FAQs and site content
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('Are Aurvelia products suitable for sensitive skin?', 'Yes. Our formulas are fragrance-conscious, dermatologist-informed, and patch-test friendly. We always recommend doing a patch test before first use.', 'Products', 1),
('Are your products cruelty-free?', 'Absolutely. Aurvelia is 100% cruelty-free. We never test on animals at any stage of development.', 'Products', 2),
('How long does shipping take?', 'Orders are dispatched within 24-48 hours and typically arrive within 3-6 business days across India.', 'Shipping', 3),
('What is your return policy?', 'We offer a 14-day return window for unopened products. Reach out to our support team to initiate a return.', 'Orders', 4),
('Where are Aurvelia products made?', 'All Aurvelia products are proudly formulated and manufactured in India under strict quality standards.', 'General', 5);

INSERT INTO public.site_content (key, value) VALUES
('our_story', '{"heading":"Our Story","body":"Aurvelia was born from a simple belief: effective skincare should be honest, accessible, and made for Indian skin. Frustrated by overpriced products with hidden ingredients, our founders set out to build a brand rooted in transparency and clinical results. Every formula is developed with proven actives, no unnecessary fillers, and a deep respect for your skin barrier. Made in India, for the world."}'::jsonb);