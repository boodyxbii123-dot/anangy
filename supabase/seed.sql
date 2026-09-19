-- ============================================================
-- asnangy. — sample data for development
-- Run after schema.sql. Safe to re-run (uses upserts by unique
-- keys where practical); safe to delete once you have real data.
-- ============================================================

insert into categories (condition, tooth_type, label, description, sort_order) values
  ('sound', 'anterior', 'Sound — Anterior', 'Healthy, unrestored anterior specimens.', 1),
  ('sound', 'premolar', 'Sound — Premolar', 'Healthy, unrestored premolar specimens.', 2),
  ('sound', 'molar', 'Sound — Molar', 'Healthy, unrestored molar specimens.', 3),
  ('semi_sound', 'anterior', 'Semi Sound — Anterior', 'Minor wear or minimal restoration, anterior.', 4),
  ('semi_sound', 'premolar', 'Semi Sound — Premolar', 'Minor wear or minimal restoration, premolar.', 5),
  ('semi_sound', 'molar', 'Semi Sound — Molar', 'Minor wear or minimal restoration, molar.', 6),
  ('caries', 'anterior', 'Caries — Anterior', 'Carious lesions present, anterior.', 7),
  ('caries', 'premolar', 'Caries — Premolar', 'Carious lesions present, premolar.', 8),
  ('caries', 'molar', 'Caries — Molar', 'Carious lesions present, molar.', 9)
on conflict (condition, tooth_type) do nothing;

-- All 27 Egyptian governorates get a shipping zone by default (same
-- placeholder price) so every customer sees their governorate at
-- checkout from day one. Adjust prices per governorate from the
-- admin's Shipping page, or select a subset there and apply a
-- different price to just those.
insert into shipping_zones (governorate, price, enabled) values
  ('القاهرة', 60, true),
  ('الجيزة', 60, true),
  ('الإسكندرية', 70, true),
  ('الدقهلية', 70, true),
  ('البحر الأحمر', 90, true),
  ('البحيرة', 70, true),
  ('الفيوم', 70, true),
  ('الغربية', 70, true),
  ('الإسماعيلية', 75, true),
  ('المنوفية', 70, true),
  ('المنيا', 80, true),
  ('القليوبية', 65, true),
  ('الوادي الجديد', 100, true),
  ('السويس', 75, true),
  ('أسوان', 90, true),
  ('أسيوط', 85, true),
  ('بني سويف', 75, true),
  ('بورسعيد', 75, true),
  ('دمياط', 70, true),
  ('الشرقية', 70, true),
  ('جنوب سيناء', 100, true),
  ('كفر الشيخ', 70, true),
  ('مطروح', 90, true),
  ('الأقصر', 90, true),
  ('قنا', 85, true),
  ('شمال سيناء', 100, true),
  ('سوهاج', 85, true)
on conflict (governorate) do nothing;

insert into products
  (name, sku, price, condition, tooth_type, description, stock_quantity, available, image_urls)
values
  ('Upper First Molar', 'ASN-MOL-001', 250, 'sound', 'molar',
   'Extracted tooth specimen intended for educational and dental training purposes.',
   5, true, '{}'),
  ('Lower Second Premolar', 'ASN-PRE-004', 180, 'sound', 'premolar',
   'Extracted tooth specimen intended for educational and dental training purposes.',
   8, true, '{}'),
  ('Upper Central Incisor', 'ASN-ANT-002', 150, 'semi_sound', 'anterior',
   'Extracted tooth specimen with minor wear, intended for educational and dental training purposes.',
   6, true, '{}'),
  ('Lower First Molar — Carious', 'ASN-MOL-009', 220, 'caries', 'molar',
   'Extracted tooth specimen showing carious lesions, intended for caries-detection and restorative training.',
   3, true, '{}')
on conflict (sku) do nothing;
