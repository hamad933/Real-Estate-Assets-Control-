INSERT INTO properties (
  id, name, location, portfolio_visible, operational_state, occupancy_state,
  payment_state, maintenance_state, readiness_state, open_conditions,
  priority, reason, next_action, conditions_json
)
SELECT
  'property-202', 'أصل تجريبي خارج النطاق', 'الرياض — نطاق تجريبي', 0, NULL, 'مشغول',
  NULL, NULL, NULL, 0, NULL, NULL, NULL, '[]'
WHERE EXISTS (SELECT 1 FROM units WHERE id = 'unit-202')
  AND NOT EXISTS (SELECT 1 FROM properties WHERE id = 'property-202');

UPDATE properties
SET operational_state = 'يتطلب متابعة', occupancy_state = 'شاغر', payment_state = 'لا يوجد استحقاق',
    maintenance_state = 'تحتاج متابعة', readiness_state = 'يحتاج متابعة', open_conditions = 5, priority = 2,
    reason = 'توجد عناصر جاهزية وصيانة وقائية تحتاج متابعة قبل إغلاق السجل التشغيلي.',
    next_action = 'مراجعة عناصر الجاهزية والصيانة الوقائية دون إيقاف العرض العام.',
    conditions_json = '[{"title":"شهادة السلامة تحتاج تحديثًا","severity":"عالٍ","date":"15 أبريل 2026"},{"title":"صيانة وقائية للتكييف","severity":"متوسط","date":"01 مايو 2026"},{"title":"فحص مضخة المياه الدورية","severity":"متوسط","date":"12 مايو 2026"},{"title":"تحديث سجل مفاتيح الوصول","severity":"منخفض","date":"13 مايو 2026"},{"title":"فحص الحديقة الخارجي","severity":"منخفض","date":"14 مايو 2026"}]'
WHERE id = 'property-101';

UPDATE properties
SET operational_state = 'يتطلب تدخل', occupancy_state = 'مشغول', payment_state = 'متأخر',
    maintenance_state = 'تحتاج إجراء', readiness_state = 'يحتاج متابعة', open_conditions = 4, priority = 1,
    reason = 'توجد دفعة شهرية متأخرة وثلاثة طلبات خدمة مفتوحة مرتبطة بالوحدة المشغولة.',
    next_action = 'تأكيد خطة التحصيل ومتابعة طلبات الخدمة المفتوحة ضمن نفس سجل الوحدة.',
    conditions_json = '[{"title":"دفعة أغسطس الشهرية متأخرة","severity":"عالٍ","date":"10 أغسطس 2026"},{"title":"صيانة تكييف غرفة المعيشة","severity":"متوسط","date":"09 أغسطس 2026"},{"title":"فحص تسرب أسفل الحوض","severity":"متوسط","date":"08 أغسطس 2026"},{"title":"خدمة كهربائية للشرفة","severity":"متوسط","date":"07 أغسطس 2026"}]'
WHERE id = 'property-102';

UPDATE properties
SET occupancy_state = 'شاغر', payment_state = 'لا يوجد استحقاق'
WHERE id IN ('property-103', 'property-104', 'property-105', 'property-106');

UPDATE units
SET property_id = 'property-101', name = 'فيلا الياسمين', location = 'الرياض — حي الياسمين',
    unit_type = 'فيلا', bedrooms = 5, bathrooms = 5, area = 350
WHERE id = 'unit-101';

UPDATE units
SET property_id = 'property-102', name = 'شقة النرجس 101', location = 'الرياض — حي النرجس',
    unit_type = 'شقة', bedrooms = 2, bathrooms = 2, area = 135
WHERE id = 'unit-tenant-101';

INSERT INTO units (id, property_id, name, location, unit_type, bedrooms, bathrooms, area)
SELECT 'unit-103', 'property-103', 'دوبلكس العقيق', 'الرياض — حي العقيق', 'دوبلكس', 3, 3, 210
WHERE EXISTS (SELECT 1 FROM listings WHERE id = 'aqiq-duplex')
  AND NOT EXISTS (SELECT 1 FROM units WHERE id = 'unit-103');
INSERT INTO units (id, property_id, name, location, unit_type, bedrooms, bathrooms, area)
SELECT 'unit-104', 'property-104', 'شقة الياسمين 12', 'الرياض — حي الياسمين', 'شقة', 2, 2, 110
WHERE EXISTS (SELECT 1 FROM listings WHERE id = 'yasmin-12')
  AND NOT EXISTS (SELECT 1 FROM units WHERE id = 'unit-104');
INSERT INTO units (id, property_id, name, location, unit_type, bedrooms, bathrooms, area)
SELECT 'unit-105', 'property-105', 'استوديو الملقا', 'الرياض — حي الملقا', 'استوديو', 1, 1, 45
WHERE EXISTS (SELECT 1 FROM listings WHERE id = 'malqa-studio')
  AND NOT EXISTS (SELECT 1 FROM units WHERE id = 'unit-105');
INSERT INTO units (id, property_id, name, location, unit_type, bedrooms, bathrooms, area)
SELECT 'unit-106', 'property-106', 'فيلا العارض', 'الرياض — حي العارض', 'فيلا', 6, 6, 420
WHERE EXISTS (SELECT 1 FROM listings WHERE id = 'arid-villa')
  AND NOT EXISTS (SELECT 1 FROM units WHERE id = 'unit-106');

UPDATE units
SET property_id = 'property-202', name = 'وحدة تجريبية خارج النطاق', location = 'الرياض — نطاق تجريبي'
WHERE id = 'unit-202' AND EXISTS (SELECT 1 FROM properties WHERE id = 'property-202');

UPDATE listings SET unit_id = 'unit-101' WHERE id = 'yasmin-villa' AND EXISTS (SELECT 1 FROM units WHERE id = 'unit-101');
UPDATE listings SET unit_id = 'unit-tenant-101', status = 'soon', status_label = 'متاح قريبًا',
  annual_price = 72000,
  summary = 'شقة هادئة بتوزيع عملي ومساحات معيشة مضاءة طبيعيًا، متاحة قريبًا بعد انتهاء العلاقة الإيجارية الحالية.'
WHERE id = 'narjis-101' AND EXISTS (SELECT 1 FROM units WHERE id = 'unit-tenant-101');
UPDATE listings SET unit_id = 'unit-103' WHERE id = 'aqiq-duplex' AND EXISTS (SELECT 1 FROM units WHERE id = 'unit-103');
UPDATE listings SET unit_id = 'unit-104' WHERE id = 'yasmin-12' AND EXISTS (SELECT 1 FROM units WHERE id = 'unit-104');
UPDATE listings SET unit_id = 'unit-105' WHERE id = 'malqa-studio' AND EXISTS (SELECT 1 FROM units WHERE id = 'unit-105');
UPDATE listings SET unit_id = 'unit-106' WHERE id = 'arid-villa' AND EXISTS (SELECT 1 FROM units WHERE id = 'unit-106');

UPDATE tenancies
SET annual_rent = 72000, payment_plan = 'دفعات شهرية',
    details_json = '{"documents":[{"id":"DOC-LEASE-101","title":"عقد الإيجار","meta":"PDF · 1.2 MB"},{"id":"DOC-RULES-101","title":"ملحق الشروط والأحكام","meta":"PDF · 860 KB"},{"id":"DOC-INVOICE-101","title":"فاتورة سابقة","meta":"PDF · 240 KB"}],"notifications":["دفعة أغسطس مستحقة منذ 10 أغسطس 2026.","طلب الصيانة SRV-2026-0891 بانتظار الوصول ضمن نافذة التنفيذ المحددة."]}'
WHERE id = 'tenancy-101';

DELETE FROM payment_records WHERE tenancy_id = 'tenancy-101';
INSERT INTO payment_records (id, tenancy_id, period, due_date, amount, status, paid_date)
SELECT 'PAY-2026-0510', 'tenancy-101', 'مايو 2026', '10 مايو 2026', 6000, 'مستلمة', '10 مايو 2026'
WHERE EXISTS (SELECT 1 FROM tenancies WHERE id = 'tenancy-101');
INSERT INTO payment_records (id, tenancy_id, period, due_date, amount, status, paid_date)
SELECT 'PAY-2026-0610', 'tenancy-101', 'يونيو 2026', '10 يونيو 2026', 6000, 'مستلمة', '10 يونيو 2026'
WHERE EXISTS (SELECT 1 FROM tenancies WHERE id = 'tenancy-101');
INSERT INTO payment_records (id, tenancy_id, period, due_date, amount, status, paid_date)
SELECT 'PAY-2026-0710', 'tenancy-101', 'يوليو 2026', '10 يوليو 2026', 6000, 'مستلمة', '10 يوليو 2026'
WHERE EXISTS (SELECT 1 FROM tenancies WHERE id = 'tenancy-101');
INSERT INTO payment_records (id, tenancy_id, period, due_date, amount, status, paid_date)
SELECT 'INV-2026-0810', 'tenancy-101', 'أغسطس 2026', '10 أغسطس 2026', 6000, 'متأخرة', NULL
WHERE EXISTS (SELECT 1 FROM tenancies WHERE id = 'tenancy-101');

INSERT INTO maintenance_records (id, unit_id, tenancy_id, title, detail, status, priority, created_date)
SELECT 'SRV-2026-0891', 'unit-tenant-101', 'tenancy-101', 'صيانة تكييف', 'التبريد ضعيف في غرفة المعيشة.', 'بانتظار الوصول', 'متوسطة', '09 أغسطس 2026'
WHERE EXISTS (SELECT 1 FROM tenancies WHERE id = 'tenancy-101')
  AND NOT EXISTS (SELECT 1 FROM maintenance_records WHERE id = 'SRV-2026-0891');

UPDATE contractor_assignments
SET maintenance_id = 'SRV-2026-0891', request_id = 'SRV-2026-0891', status = 'بانتظار الوصول',
    details_json = '{"problem":"التبريد ضعيف في غرفة المعيشة. يرجى فحص المكيف وتنظيف الفلاتر وفحص مستوى وسيط التبريد عند الحاجة.","propertyName":"شقة النرجس 101","location":"الرياض — حي النرجس","access":"الدخول من البوابة الرئيسية؛ التنسيق عبر قناة المهمة قبل الوصول.","parking":"موقف الزوار متاح أسفل المبنى.","window":"12 أغسطس 2026 · 10:00 ص — 01:00 م","priority":"متوسطة","attachments":[{"title":"سجل طلب الخدمة","meta":"Service_Report_0891.pdf"},{"title":"مقطع فيديو","meta":"video_20260809.mp4"},{"title":"صورة من البلاغ","meta":"IMG_20260809_1045.jpg"}],"otherAssigned":[{"id":"work-order-501","title":"صيانة تكييف — المهمة الحالية","when":"12 أغسطس · 10:00 ص"}],"permittedContact":"إدارة العمليات — قناة المهمة فقط"}'
WHERE id = 'work-order-501' AND EXISTS (SELECT 1 FROM maintenance_records WHERE id = 'SRV-2026-0891');

DELETE FROM maintenance_records
WHERE id = 'SRV-2025-0891'
  AND NOT EXISTS (SELECT 1 FROM contractor_assignments WHERE maintenance_id = 'SRV-2025-0891');

UPDATE maintenance_records
SET unit_id = 'unit-tenant-101', tenancy_id = 'tenancy-101', status = 'بانتظار الوصول', created_date = '09 أغسطس 2026'
WHERE id = 'SRV-2026-0891';
UPDATE maintenance_records
SET unit_id = 'unit-tenant-101', tenancy_id = 'tenancy-101', status = 'بانتظار المتابعة', created_date = '08 أغسطس 2026'
WHERE id = 'SRV-2026-0892';
UPDATE maintenance_records
SET unit_id = 'unit-tenant-101', tenancy_id = 'tenancy-101', status = 'تم الإسناد', created_date = '07 أغسطس 2026'
WHERE id = 'SRV-2026-0887';
UPDATE maintenance_records SET unit_id = 'unit-202', tenancy_id = 'tenancy-202' WHERE id = 'SRV-DEMO-502';

UPDATE operations_records
SET property_id = 'property-102', unit_id = 'unit-tenant-101',
    payload_json = json_set(
      payload_json,
      '$.propertyId', 'property-102',
      '$.propertyName', 'شقة النرجس 101',
      '$.propertyLocation', 'الرياض — حي النرجس',
      '$.unitId', 'unit-tenant-101',
      '$.unitName', 'شقة النرجس 101',
      '$.unitLocation', 'الرياض — حي النرجس',
      '$.occupancy.startDate', '15 سبتمبر 2025',
      '$.occupancy.endDate', '14 سبتمبر 2026',
      '$.occupancy.term.cadence', 'شهري',
      '$.payments.dueDate', '10 أغسطس 2026',
      '$.payments.lastPaymentDate', '10 يوليو 2026',
      '$.payments.cadence', 'شهري',
      '$.maintenance.openWork[0].id', 'SRV-2026-0891',
      '$.maintenance.openWork[0].state', 'بانتظار الوصول'
    )
WHERE id = 'ops-record-101';

UPDATE operations_records
SET property_id = 'property-202', unit_id = 'unit-202',
    payload_json = json_set(
      payload_json,
      '$.propertyId', 'property-202',
      '$.propertyName', 'أصل تجريبي خارج النطاق',
      '$.propertyLocation', 'الرياض — نطاق تجريبي'
    )
WHERE id = 'ops-record-202' AND EXISTS (SELECT 1 FROM properties WHERE id = 'property-202');
