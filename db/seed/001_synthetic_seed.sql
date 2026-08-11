INSERT OR IGNORE INTO profiles (id, fixture_id, access_state, profile_kind, label) VALUES
  ('tenant-profile-001', 'tenant-demo', 'USER', 'TENANT', 'مستأجر تجريبي'),
  ('contractor-profile-001', 'contractor-demo', 'USER', 'CONTRACTOR', 'مؤسسة أفق الصيانة'),
  ('operations-profile-001', 'operations-demo', 'USER', 'OPERATIONS', 'إدارة العمليات'),
  ('admin-profile-001', 'admin-demo', 'ADMIN', NULL, 'إدارة المحفظة التجريبية'),
  ('tenant-profile-202', 'tenant-other', 'USER', 'TENANT', 'مستأجر تجريبي خارج النطاق'),
  ('contractor-profile-202', 'contractor-other', 'USER', 'CONTRACTOR', 'مقاول تجريبي خارج النطاق'),
  ('operations-profile-202', 'operations-other', 'USER', 'OPERATIONS', 'فريق عمليات خارج النطاق');

INSERT OR IGNORE INTO properties (
  id, name, location, portfolio_visible, operational_state, occupancy_state,
  payment_state, maintenance_state, readiness_state, open_conditions,
  priority, reason, next_action, conditions_json
) VALUES
  ('property-101', 'فيلا الياسمين', 'الرياض — حي الياسمين', 1, 'يتطلب متابعة', 'شاغر', 'لا يوجد استحقاق', 'تحتاج متابعة', 'يحتاج متابعة', 5, 2,
   'توجد عناصر جاهزية وصيانة وقائية تحتاج متابعة قبل إغلاق السجل التشغيلي.',
   'مراجعة عناصر الجاهزية والصيانة الوقائية دون إيقاف العرض العام.',
   '[{"title":"شهادة السلامة تحتاج تحديثًا","severity":"عالٍ","date":"15 أبريل 2026"},{"title":"صيانة وقائية للتكييف","severity":"متوسط","date":"01 مايو 2026"},{"title":"فحص مضخة المياه الدورية","severity":"متوسط","date":"12 مايو 2026"},{"title":"تحديث سجل مفاتيح الوصول","severity":"منخفض","date":"13 مايو 2026"},{"title":"فحص الحديقة الخارجي","severity":"منخفض","date":"14 مايو 2026"}]'),
  ('property-102', 'شقة النرجس 101', 'الرياض — حي النرجس', 1, 'يتطلب تدخل', 'مشغول', 'متأخر', 'تحتاج إجراء', 'يحتاج متابعة', 4, 1,
   'توجد دفعة شهرية متأخرة وثلاثة طلبات خدمة مفتوحة مرتبطة بالوحدة المشغولة.',
   'تأكيد خطة التحصيل ومتابعة طلبات الخدمة المفتوحة ضمن نفس سجل الوحدة.',
   '[{"title":"دفعة أغسطس الشهرية متأخرة","severity":"عالٍ","date":"10 أغسطس 2026"},{"title":"صيانة تكييف غرفة المعيشة","severity":"متوسط","date":"09 أغسطس 2026"},{"title":"فحص تسرب أسفل الحوض","severity":"متوسط","date":"08 أغسطس 2026"},{"title":"خدمة كهربائية للشرفة","severity":"متوسط","date":"07 أغسطس 2026"}]'),
  ('property-103', 'دوبلكس العقيق', 'الرياض — حي العقيق', 1, 'يتطلب متابعة', 'شاغر', 'لا يوجد استحقاق', 'تحتاج متابعة', 'جاهزة', 2, 3,
   'السجل المالي غير منطبق على وحدة شاغرة، وتوجد متابعتان تشغيليتان منخفضتا الأثر.',
   'إغلاق متابعتي الصيانة الوقائية بعد توثيق الفحص.',
   '[{"title":"استبدال حساس إنارة المدخل","severity":"متوسط","date":"06 مايو 2026"},{"title":"فحص باب المرآب","severity":"منخفض","date":"11 مايو 2026"}]'),
  ('property-104', 'شقة الياسمين 12', 'الرياض — حي الياسمين', 1, 'مستقر', 'شاغر', 'لا يوجد استحقاق', 'سليم', 'جاهزة', 1, 4,
   'السجل مستقر، وتبقى متابعة دورية واحدة منخفضة الأثر.',
   'تأكيد موعد الفحص الوقائي والإبقاء على السجل ضمن المتابعة الدورية.',
   '[{"title":"تأكيد موعد الفحص الوقائي القادم","severity":"منخفض","date":"14 مايو 2026"}]'),
  ('property-105', 'استوديو الملقا', 'الرياض — حي الملقا', 0, NULL, 'شاغر', 'لا يوجد استحقاق', NULL, NULL, 0, NULL, NULL, NULL, '[]'),
  ('property-106', 'فيلا العارض', 'الرياض — حي العارض', 0, NULL, 'شاغر', 'لا يوجد استحقاق', NULL, NULL, 0, NULL, NULL, NULL, '[]'),
  ('property-202', 'أصل تجريبي خارج النطاق', 'الرياض — نطاق تجريبي', 0, NULL, 'مشغول', NULL, NULL, NULL, 0, NULL, NULL, NULL, '[]');

INSERT OR IGNORE INTO units (id, property_id, name, location, unit_type, bedrooms, bathrooms, area) VALUES
  ('unit-101', 'property-101', 'فيلا الياسمين', 'الرياض — حي الياسمين', 'فيلا', 5, 5, 350),
  ('unit-tenant-101', 'property-102', 'شقة النرجس 101', 'الرياض — حي النرجس', 'شقة', 2, 2, 135),
  ('unit-103', 'property-103', 'دوبلكس العقيق', 'الرياض — حي العقيق', 'دوبلكس', 3, 3, 210),
  ('unit-104', 'property-104', 'شقة الياسمين 12', 'الرياض — حي الياسمين', 'شقة', 2, 2, 110),
  ('unit-105', 'property-105', 'استوديو الملقا', 'الرياض — حي الملقا', 'استوديو', 1, 1, 45),
  ('unit-106', 'property-106', 'فيلا العارض', 'الرياض — حي العارض', 'فيلا', 6, 6, 420),
  ('unit-202', 'property-202', 'وحدة تجريبية خارج النطاق', 'الرياض — نطاق تجريبي', 'شقة', 1, 1, 70);

INSERT OR IGNORE INTO listings (
  id, property_id, unit_id, district, district_key, listing_type, type_label,
  annual_price, bedrooms, bathrooms, area, status, status_label, summary,
  amenities_json, map_x, map_y
) VALUES
  ('narjis-101', 'property-102', 'unit-tenant-101', 'الرياض — حي النرجس', 'narjis', 'apartment', 'شقة', 72000, 2, 2, 135, 'soon', 'متاح قريبًا', 'شقة هادئة بتوزيع عملي ومساحات معيشة مضاءة طبيعيًا، متاحة قريبًا بعد انتهاء العلاقة الإيجارية الحالية.', '["موقف سيارة","مطبخ مجهز","مصعد","مدخل هادئ"]', 52, 57),
  ('yasmin-villa', 'property-101', 'unit-101', 'الرياض — حي الياسمين', 'yasmin', 'villa', 'فيلا', 150000, 5, 5, 350, 'available', 'متاح الآن', 'فيلا عائلية معاصرة بخصوصية مرتفعة ومساحات واسعة ومجلس مستقل ومواقف داخلية.', '["مجلس مستقل","غرفة معيشة واسعة","غرفة خادمة","موقفان للسيارات"]', 61, 28),
  ('aqiq-duplex', 'property-103', 'unit-103', 'الرياض — حي العقيق', 'aqiq', 'duplex', 'دوبلكس', 98000, 3, 3, 210, 'available', 'متاح الآن', 'دوبلكس عملي بطابقين مع فصل واضح بين المعيشة وغرف النوم ومساحة عائلية مريحة.', '["مدخل مستقل","صالة عائلية","موقف سيارة","مساحة تخزين"]', 21, 63),
  ('malqa-studio', 'property-105', 'unit-105', 'الرياض — حي الملقا', 'malqa', 'studio', 'استوديو', 45000, 1, 1, 45, 'soon', 'متاح قريبًا', 'استوديو مدمج للاستخدام الفردي مع تخطيط بسيط وقرب من محاور الحركة والخدمات.', '["مطبخ مدمج","دخول مستقل","موقف مشترك"]', 69, 72),
  ('yasmin-12', 'property-104', 'unit-104', 'الرياض — حي الياسمين', 'yasmin', 'apartment', 'شقة', 66000, 2, 2, 110, 'available', 'متاح الآن', 'شقة متوازنة ضمن مبنى حديث، مناسبة لمن يريد مساحة مريحة بتكلفة سنوية أقل.', '["مصعد","موقف سيارة","مطبخ مجهز"]', 72, 39),
  ('arid-villa', 'property-106', 'unit-106', 'الرياض — حي العارض', 'arid', 'villa', 'فيلا', 180000, 6, 6, 420, 'available', 'متاح الآن', 'فيلا كبيرة لعائلة تحتاج غرفًا أكثر ومساحات استقبال متعددة ضمن نطاق سكني هادئ.', '["6 غرف نوم","مجلس","غرفة خادمة","موقفان للسيارات"]', 38, 22);

INSERT OR IGNORE INTO tenancies (
  id, unit_id, tenant_profile_id, resource_id, contract_ref, contract_type,
  start_date, end_date, annual_rent, payment_plan, status, details_json
) VALUES
  ('tenancy-101', 'unit-tenant-101', 'tenant-profile-001', 'tenant-resource-101', 'CTR-2025-101', 'عقد إيجار سكني', '15 سبتمبر 2025', '14 سبتمبر 2026', 72000, 'دفعات شهرية', 'نشط',
   '{"documents":[{"id":"DOC-LEASE-101","title":"عقد الإيجار","meta":"PDF · 1.2 MB"},{"id":"DOC-RULES-101","title":"ملحق الشروط والأحكام","meta":"PDF · 860 KB"},{"id":"DOC-INVOICE-101","title":"فاتورة سابقة","meta":"PDF · 240 KB"}],"notifications":["دفعة أغسطس مستحقة منذ 10 أغسطس 2026.","طلب الصيانة SRV-2026-0891 بانتظار الوصول ضمن نافذة التنفيذ المحددة."]}'),
  ('tenancy-202', 'unit-202', 'tenant-profile-202', 'tenant-resource-202', 'CTR-DEMO-202', 'عقد تجريبي خارج النطاق', '01 يناير 2026', '31 ديسمبر 2026', 12000, 'دفعات شهرية', 'نشط', '{}');

INSERT OR IGNORE INTO payment_records (id, tenancy_id, period, due_date, amount, status, paid_date) VALUES
  ('PAY-2026-0510', 'tenancy-101', 'مايو 2026', '10 مايو 2026', 6000, 'مستلمة', '10 مايو 2026'),
  ('PAY-2026-0610', 'tenancy-101', 'يونيو 2026', '10 يونيو 2026', 6000, 'مستلمة', '10 يونيو 2026'),
  ('PAY-2026-0710', 'tenancy-101', 'يوليو 2026', '10 يوليو 2026', 6000, 'مستلمة', '10 يوليو 2026'),
  ('INV-2026-0810', 'tenancy-101', 'أغسطس 2026', '10 أغسطس 2026', 6000, 'متأخرة', NULL),
  ('PAY-DEMO-202', 'tenancy-202', 'دفعة خارج النطاق', '01 سبتمبر 2026', 1000, 'مجدولة', NULL);

INSERT OR IGNORE INTO maintenance_records (id, unit_id, tenancy_id, title, detail, status, priority, created_date) VALUES
  ('SRV-2026-0891', 'unit-tenant-101', 'tenancy-101', 'صيانة تكييف', 'التبريد ضعيف في غرفة المعيشة.', 'بانتظار الوصول', 'متوسطة', '09 أغسطس 2026'),
  ('SRV-2026-0892', 'unit-tenant-101', 'tenancy-101', 'ملاحظة سباكة', 'تسرب خفيف أسفل حوض المطبخ.', 'بانتظار المتابعة', 'منخفضة', '08 أغسطس 2026'),
  ('SRV-2026-0887', 'unit-tenant-101', 'tenancy-101', 'خدمة كهربائية', 'إضاءة الشرفة لا تعمل.', 'تم الإسناد', 'متوسطة', '07 أغسطس 2026'),
  ('SRV-DEMO-502', 'unit-202', 'tenancy-202', 'مهمة خارج النطاق', 'سجل تركيبي لا يخص جلسة المقاول الحالية.', 'بانتظار الوصول', 'منخفضة', '01 أغسطس 2026');

INSERT OR IGNORE INTO contractor_assignments (
  id, maintenance_id, contractor_profile_id, request_id, status, details_json
) VALUES
  ('work-order-501', 'SRV-2026-0891', 'contractor-profile-001', 'SRV-2026-0891', 'بانتظار الوصول',
   '{"problem":"التبريد ضعيف في غرفة المعيشة. يرجى فحص المكيف وتنظيف الفلاتر وفحص مستوى وسيط التبريد عند الحاجة.","propertyName":"شقة النرجس 101","location":"الرياض — حي النرجس","access":"الدخول من البوابة الرئيسية؛ التنسيق عبر قناة المهمة قبل الوصول.","parking":"موقف الزوار متاح أسفل المبنى.","window":"12 أغسطس 2026 · 10:00 ص — 01:00 م","priority":"متوسطة","attachments":[{"title":"سجل طلب الخدمة","meta":"Service_Report_0891.pdf"},{"title":"مقطع فيديو","meta":"video_20260809.mp4"},{"title":"صورة من البلاغ","meta":"IMG_20260809_1045.jpg"}],"otherAssigned":[{"id":"work-order-501","title":"صيانة تكييف — المهمة الحالية","when":"12 أغسطس · 10:00 ص"}],"permittedContact":"إدارة العمليات — قناة المهمة فقط"}'),
  ('work-order-502', 'SRV-DEMO-502', 'contractor-profile-202', 'SRV-DEMO-502', 'بانتظار الوصول', '{}');

INSERT OR IGNORE INTO operations_records (id, property_id, unit_id, operations_profile_id, payload_json) VALUES
  ('ops-record-101', 'property-102', 'unit-tenant-101', 'operations-profile-001',
   '{"recordId":"ops-record-101","propertyId":"property-102","propertyName":"شقة النرجس 101","propertyLocation":"الرياض — حي النرجس","unitId":"unit-tenant-101","unitName":"شقة النرجس 101","unitLocation":"الرياض — حي النرجس","unitMeta":{"type":"شقة","bedrooms":"2","bathrooms":"2","area":"135 م²"},"readiness":{"status":"يحتاج إجراء","narrative":"توجد عناصر مالية وخدمية تحتاج متابعة ضمن الوحدة المشغولة قبل إغلاق السجل التشغيلي.","updatedAt":"11 أغسطس 2026، 10:45 ص","owner":"إدارة العمليات","counts":{"complete":6,"followUp":3,"blockers":1},"dimensions":[{"label":"حالة العقار","state":"مكتمل","detail":"هوية العقار والوحدة متطابقتان مع السجل العلائقي.","tone":"good"},{"label":"اكتمال المعلومات الأساسية","state":"مكتمل","detail":"تم توفير المعلومات الأساسية للعقار والوحدة.","tone":"good"},{"label":"الوثائق المطلوبة","state":"يحتاج مراجعة","detail":"توجد متابعة وثائقية قبل الإغلاق التشغيلي.","tone":"warn"},{"label":"حالة الوحدة","state":"مشغول","detail":"الوحدة مرتبطة بعلاقة إيجارية نشطة حتى 14 سبتمبر 2026.","tone":"good"},{"label":"تعليمات الصيانة الملحقة","state":"تم رفعها","detail":"طلبات الخدمة المفتوحة مرتبطة بنفس الوحدة والعلاقة.","tone":"good"},{"label":"جاهزية الإغلاق","state":"يحتاج مراجعة","detail":"يلزم إغلاق الدفعة المتأخرة ومسارات الخدمة المفتوحة.","tone":"warn"}],"evidence":[{"name":"مرجع العلاقة الإيجارية","meta":"PDF تركيبي","state":"ساري"},{"name":"سجل الدفعات","meta":"سجل محلي","state":"متابعة"},{"name":"تقرير الصيانة","meta":"PDF تركيبي","state":"موثق"}],"blocker":{"title":"دفعة أغسطس ومسارات خدمة مفتوحة","detail":"يلزم متابعة الدفعة المتأخرة وطلبات الخدمة المفتوحة قبل إغلاق الحالة التشغيلية.","due":"10 أغسطس 2026","priority":"متابعة عاجلة","requiredAction":"مراجعة التحصيل وحالة طلبات الخدمة.","assignee":"إدارة العمليات"},"activity":["تم تحديث حالة الدفعة — 10 أغسطس 2026","تم فتح متابعة صيانة التكييف — 09 أغسطس 2026","تمت مراجعة السجل التشغيلي — 11 أغسطس 2026"]},"occupancy":{"status":"مشغول","relationType":"عقد إيجار سكني","startDate":"15 سبتمبر 2025","endDate":"14 سبتمبر 2026","occupants":2,"recordState":"نشط","tenant":{"name":"مستأجر مسجل","recordType":"عقد إيجار سكني","phone":"05× ××× ××××","email":"musta***@mail.com"},"term":{"duration":"12 شهرًا","renewalReview":"15 أغسطس 2026","notice":"30 يومًا قبل تاريخ النهاية","paymentMethod":"تحويل بنكي","cadence":"شهري"},"documents":[{"name":"عقد","meta":"PDF · 1.8 MB"},{"name":"ملحق","meta":"PDF · 0.9 MB"},{"name":"استلام / تسليم","meta":"PDF · 1.3 MB"}],"alert":"العلاقة نشطة حتى 14 سبتمبر 2026؛ لذلك يظهر العرض العام للوحدة كمتاح قريبًا لا متاح الآن.","activity":["إنشاء السجل — 15 سبتمبر 2025","تحديث حالة الإشغال — 10 أغسطس 2026"]},"payments":{"status":"يوجد مبلغ متأخر","dueAmount":"6,000 ريال","dueDate":"10 أغسطس 2026","lastPayment":"6,000 ريال","lastPaymentDate":"10 يوليو 2026","linkedBalance":"6,000 ريال","cadence":"شهري","collectionMethod":"متابعة داخلية","reminderState":"متابعة مطلوبة","reminderDetail":"11 أغسطس 2026 — متابعة محلية فقط","collectionNote":"لا توجد مراسلة أو عملية دفع خارجية؛ الحالة مستمدة من سجل الدفعات المحلي.","rows":[{"period":"مايو 2026","due":"10 مايو 2026","amount":"6,000 ريال","status":"مدفوعة","paid":"10 مايو 2026"},{"period":"يونيو 2026","due":"10 يونيو 2026","amount":"6,000 ريال","status":"مدفوعة","paid":"10 يونيو 2026"},{"period":"يوليو 2026","due":"10 يوليو 2026","amount":"6,000 ريال","status":"مدفوعة","paid":"10 يوليو 2026"},{"period":"أغسطس 2026","due":"10 أغسطس 2026","amount":"6,000 ريال","status":"متأخرة","paid":"—"}],"documents":["إيصال دفعة يوليو 2026","سجل استحقاق أغسطس 2026"],"activity":["استحقاق دفعة أغسطس — 10 أغسطس 2026","تسجيل حالة التأخر — 11 أغسطس 2026"]},"maintenance":{"status":"تحت المعالجة","inProgress":0,"awaitingFollowUp":1,"openWork":[{"id":"SRV-2026-0891","title":"صيانة تكييف","detail":"التبريد ضعيف في غرفة المعيشة.","priority":"متوسطة","priorityTone":"warn","assignee":"مؤسسة أفق الصيانة","created":"09 أغسطس 2026","state":"بانتظار الوصول"},{"id":"SRV-2026-0892","title":"ملاحظة سباكة","detail":"تسرب خفيف أسفل حوض المطبخ.","priority":"منخفضة","priorityTone":"good","assignee":"مزود الخدمة المعتمد","created":"08 أغسطس 2026","state":"بانتظار المتابعة"},{"id":"SRV-2026-0887","title":"خدمة كهربائية","detail":"إضاءة الشرفة لا تعمل.","priority":"متوسطة","priorityTone":"warn","assignee":"مزود الخدمة المعتمد","created":"07 أغسطس 2026","state":"تم الإسناد"}],"recentCompleted":[{"title":"تنظيف فلتر سابق","detail":"تم إغلاق صيانة وقائية سابقة مستقلة عن الطلب الحالي.","date":"25 يوليو 2026","by":"فريق الخدمة"}],"evidence":["IMG_20260809_1045.jpg","Service_Report_0891.pdf","Tech_Note_Plumbing.png","Work_Order_0887.pdf"],"activity":["تم إنشاء طلب خدمة كهربائية — 07 أغسطس 2026","تم فتح ملاحظة السباكة — 08 أغسطس 2026","تم إنشاء طلب التكييف — 09 أغسطس 2026"]}}'),
  ('ops-record-202', 'property-202', 'unit-202', 'operations-profile-202',
   '{"recordId":"ops-record-202","propertyId":"property-202","propertyName":"أصل تجريبي خارج النطاق","propertyLocation":"الرياض — نطاق تجريبي","unitId":"unit-202","unitName":"وحدة تجريبية خارج النطاق","unitLocation":"الرياض — نطاق تجريبي","unitMeta":{"type":"شقة","bedrooms":"1","bathrooms":"1","area":"70 م²"},"readiness":{"status":"مستقر","narrative":"سجل خارج النطاق.","updatedAt":"01 أغسطس 2026","owner":"فريق آخر","counts":{"complete":1,"followUp":0,"blockers":0},"dimensions":[],"evidence":[],"blocker":{"title":"لا يوجد","detail":"لا يوجد","due":"—","priority":"—","requiredAction":"—","assignee":"—"},"activity":[]},"occupancy":{"status":"مشغول","relationType":"عقد تجريبي","startDate":"01 يناير 2026","endDate":"31 ديسمبر 2026","occupants":1,"recordState":"نشط","tenant":{"name":"مقنع","recordType":"تركيبي","phone":"—","email":"—"},"term":{"duration":"12 شهرًا","renewalReview":"—","notice":"—","paymentMethod":"—","cadence":"شهري"},"documents":[],"alert":"","activity":[]},"payments":{"status":"مجدولة","dueAmount":"1,000 ريال","dueDate":"01 سبتمبر 2026","lastPayment":"—","lastPaymentDate":"—","linkedBalance":"1,000 ريال","cadence":"شهري","collectionMethod":"—","reminderState":"—","reminderDetail":"—","collectionNote":"","rows":[],"documents":[],"activity":[]},"maintenance":{"status":"تحت المعالجة","inProgress":0,"awaitingFollowUp":0,"openWork":[],"recentCompleted":[],"evidence":[],"activity":[]}}');
