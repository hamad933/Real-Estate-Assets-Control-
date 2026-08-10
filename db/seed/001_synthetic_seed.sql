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
  ('property-101', 'فيلا الياسمين', 'الرياض — حي الياسمين', 1, 'يتطلب تدخل', 'مشغول', 'متأخر', 'تحتاج إجراء', 'جاهزة', 5, 1,
   'توجد حالات مفتوحة ذات تأثير تشغيلي وتتطلب إجراء خلال 7 أيام.',
   'مراجعة الحالات المفتوحة وتحديث خطة المعالجة.',
   '[{"title":"شهادة السلامة من الدفاع المدني منتهية","severity":"عالٍ","date":"15 أبريل 2026"},{"title":"صيانة تكييف غرفة المعيشة","severity":"متوسط","date":"01 مايو 2026"},{"title":"دفعة إيجار متأخرة","severity":"عالٍ","date":"10 مايو 2026"},{"title":"فحص مضخة المياه الدورية","severity":"متوسط","date":"12 مايو 2026"},{"title":"تحديث سجل مفاتيح الوصول","severity":"منخفض","date":"13 مايو 2026"}]'),
  ('property-102', 'شقة النرجس 101', 'الرياض — حي النرجس', 1, 'يتطلب متابعة', 'مشغول', 'متأخر', 'تحتاج متابعة', 'جاهزة', 3, 2,
   'هناك دفعة متأخرة وطلبا صيانة مفتوحان يحتاجان متابعة منسقة.',
   'تأكيد خطة تحصيل الدفعة وربط طلبي الصيانة بمواعيد تنفيذ محددة.',
   '[{"title":"دفعة شهرية متأخرة","severity":"عالٍ","date":"08 مايو 2026"},{"title":"متابعة تبريد غرفة المعيشة","severity":"متوسط","date":"09 مايو 2026"},{"title":"فحص تسرب أسفل الحوض","severity":"متوسط","date":"10 مايو 2026"}]'),
  ('property-103', 'دوبلكس العقيق', 'الرياض — حي العقيق', 1, 'يتطلب متابعة', 'مشغول', 'سليم', 'تحتاج متابعة', 'جاهزة', 2, 3,
   'الحالة المالية مستقرة، لكن يوجد مساران صيانة يحتاجان إغلاقًا تشغيليًا.',
   'تأكيد موعدي الصيانة ثم مراجعة دليل الإغلاق بعد التنفيذ.',
   '[{"title":"استبدال حساس إنارة المدخل","severity":"متوسط","date":"06 مايو 2026"},{"title":"فحص باب المرآب","severity":"منخفض","date":"11 مايو 2026"}]'),
  ('property-104', 'شقة الياسمين 12', 'الرياض — حي الياسمين', 1, 'مستقر', 'مشغول', 'سليم', 'سليم', 'جاهزة', 1, 4,
   'السجل مستقر، وتبقى متابعة دورية واحدة منخفضة الأثر.',
   'تأكيد موعد الفحص الوقائي والإبقاء على السجل ضمن المتابعة الدورية.',
   '[{"title":"تأكيد موعد الفحص الوقائي القادم","severity":"منخفض","date":"14 مايو 2026"}]'),
  ('property-105', 'استوديو الملقا', 'الرياض — حي الملقا', 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '[]'),
  ('property-106', 'فيلا العارض', 'الرياض — حي العارض', 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '[]');

INSERT OR IGNORE INTO units (id, property_id, name, location, unit_type, bedrooms, bathrooms, area) VALUES
  ('unit-101', 'property-101', 'شقة النرجس 101', 'الرياض — حي النرجس', 'شقة', 2, 2, 135),
  ('unit-tenant-101', 'property-102', 'شقة النرجس 101', 'الرياض — حي النرجس', 'شقة', 2, 2, 135),
  ('unit-202', 'property-104', 'وحدة تجريبية خارج النطاق', 'الرياض — نطاق تجريبي', 'شقة', 1, 1, 70);

INSERT OR IGNORE INTO listings (
  id, property_id, unit_id, district, district_key, listing_type, type_label,
  annual_price, bedrooms, bathrooms, area, status, status_label, summary,
  amenities_json, map_x, map_y
) VALUES
  ('narjis-101', 'property-102', 'unit-tenant-101', 'الرياض — حي النرجس', 'narjis', 'apartment', 'شقة', 72000, 2, 2, 135, 'available', 'متاح الآن', 'شقة هادئة بتوزيع عملي ومساحات معيشة مضاءة طبيعيًا، قريبة من الخدمات اليومية.', '["موقف سيارة","مطبخ مجهز","مصعد","مدخل هادئ"]', 52, 57),
  ('yasmin-villa', 'property-101', NULL, 'الرياض — حي الياسمين', 'yasmin', 'villa', 'فيلا', 150000, 5, 5, 350, 'available', 'متاح الآن', 'فيلا عائلية معاصرة بخصوصية مرتفعة ومساحات واسعة ومجلس مستقل ومواقف داخلية.', '["مجلس مستقل","غرفة معيشة واسعة","غرفة خادمة","موقفان للسيارات"]', 61, 28),
  ('aqiq-duplex', 'property-103', NULL, 'الرياض — حي العقيق', 'aqiq', 'duplex', 'دوبلكس', 98000, 3, 3, 210, 'available', 'متاح الآن', 'دوبلكس عملي بطابقين مع فصل واضح بين المعيشة وغرف النوم ومساحة عائلية مريحة.', '["مدخل مستقل","صالة عائلية","موقف سيارة","مساحة تخزين"]', 21, 63),
  ('malqa-studio', 'property-105', NULL, 'الرياض — حي الملقا', 'malqa', 'studio', 'استوديو', 45000, 1, 1, 45, 'soon', 'متاح قريبًا', 'استوديو مدمج للاستخدام الفردي مع تخطيط بسيط وقرب من محاور الحركة والخدمات.', '["مطبخ مدمج","دخول مستقل","موقف مشترك"]', 69, 72),
  ('yasmin-12', 'property-104', NULL, 'الرياض — حي الياسمين', 'yasmin', 'apartment', 'شقة', 66000, 2, 2, 110, 'available', 'متاح الآن', 'شقة متوازنة ضمن مبنى حديث، مناسبة لمن يريد مساحة مريحة بتكلفة سنوية أقل.', '["مصعد","موقف سيارة","مطبخ مجهز"]', 72, 39),
  ('arid-villa', 'property-106', NULL, 'الرياض — حي العارض', 'arid', 'villa', 'فيلا', 180000, 6, 6, 420, 'available', 'متاح الآن', 'فيلا كبيرة لعائلة تحتاج غرفًا أكثر ومساحات استقبال متعددة ضمن نطاق سكني هادئ.', '["6 غرف نوم","مجلس","غرفة خادمة","موقفان للسيارات"]', 38, 22);

INSERT OR IGNORE INTO tenancies (
  id, unit_id, tenant_profile_id, resource_id, contract_ref, contract_type,
  start_date, end_date, annual_rent, payment_plan, status, details_json
) VALUES
  ('tenancy-101', 'unit-tenant-101', 'tenant-profile-001', 'tenant-resource-101', 'CTR-2025-101', 'عقد إيجار سكني', '15 سبتمبر 2025', '14 سبتمبر 2026', 150000, 'دفعات سنوية', 'نشط',
   '{"serviceRequests":[{"id":"SRV-2025-0891","title":"صيانة تكييف — تبريد ضعيف","date":"01 مايو 2026","status":"مكتمل"},{"id":"SRV-2025-0887","title":"فحص تسرب أسفل الحوض","date":"28 أبريل 2026","status":"مغلق"}],"documents":[{"id":"DOC-LEASE-101","title":"عقد الإيجار","meta":"PDF · 1.2 MB"},{"id":"DOC-RULES-101","title":"ملحق الشروط والأحكام","meta":"PDF · 860 KB"},{"id":"DOC-INVOICE-101","title":"فاتورة سابقة","meta":"PDF · 240 KB"}],"notifications":["تم إصدار إشعار الدفعة القادمة.","تم إغلاق طلب الصيانة SRV-2025-0891."]}'),
  ('tenancy-202', 'unit-202', 'tenant-profile-202', 'tenant-resource-202', 'CTR-DEMO-202', 'عقد تجريبي خارج النطاق', '01 يناير 2026', '31 ديسمبر 2026', 12000, 'دفعات شهرية', 'نشط', '{}');

INSERT OR IGNORE INTO payment_records (id, tenancy_id, period, due_date, amount, status, paid_date) VALUES
  ('PAY-2025-0915', 'tenancy-101', 'دفعة 2025', '15 سبتمبر 2025', 150000, 'مستلمة', '15 سبتمبر 2025'),
  ('INV-2026-0915', 'tenancy-101', 'دفعة قادمة', '15 سبتمبر 2026', 6000, 'مجدولة', NULL),
  ('PAY-DEMO-202', 'tenancy-202', 'دفعة خارج النطاق', '01 سبتمبر 2026', 1000, 'مجدولة', NULL);

INSERT OR IGNORE INTO maintenance_records (id, unit_id, tenancy_id, title, detail, status, priority, created_date) VALUES
  ('SRV-2025-0891', 'unit-101', NULL, 'صيانة تكييف', 'التبريد ضعيف في غرفة المعيشة.', 'قيد التنفيذ', 'متوسطة', '09 أغسطس 2026'),
  ('SRV-2026-0892', 'unit-101', NULL, 'ملاحظة سباكة', 'تسرب خفيف أسفل حوض المطبخ.', 'بانتظار المتابعة', 'منخفضة', '08 أغسطس 2026'),
  ('SRV-2026-0887', 'unit-101', NULL, 'خدمة كهربائية', 'إضاءة الشرفة لا تعمل.', 'تم الإسناد', 'متوسطة', '07 أغسطس 2026'),
  ('SRV-DEMO-502', 'unit-202', NULL, 'مهمة خارج النطاق', 'سجل تركيبي لا يخص جلسة المقاول الحالية.', 'بانتظار الوصول', 'منخفضة', '01 أغسطس 2026');

INSERT OR IGNORE INTO contractor_assignments (
  id, maintenance_id, contractor_profile_id, request_id, status, details_json
) VALUES
  ('work-order-501', 'SRV-2025-0891', 'contractor-profile-001', 'SRV-2025-0891', 'بانتظار الوصول',
   '{"problem":"التبريد ضعيف في غرفة المعيشة. يرجى فحص المكيف وتنظيف الفلاتر وفحص مستوى وسيط التبريد عند الحاجة.","propertyName":"شقة النرجس 101","location":"الرياض — حي النرجس","access":"الدخول من البوابة الرئيسية؛ التنسيق مع جهة الاتصال قبل الوصول.","parking":"موقف الزوار متاح أسفل المبنى.","window":"01 مايو 2026 · 10:00 ص — 01:00 م","priority":"متوسطة","attachments":[{"title":"سجل طلب الخدمة","meta":"Service_Report_0891.pdf"},{"title":"مقطع فيديو","meta":"video_20250501.mp4"},{"title":"صورة من البلاغ","meta":"IMG_20250501_1045.jpg"}],"otherAssigned":[{"id":"work-order-501","title":"صيانة تكييف — المهمة الحالية","when":"اليوم · 10:00 ص"}],"permittedContact":"إدارة العمليات — قناة المهمة فقط"}'),
  ('work-order-502', 'SRV-DEMO-502', 'contractor-profile-202', 'SRV-DEMO-502', 'بانتظار الوصول', '{}');

INSERT OR IGNORE INTO operations_records (id, property_id, unit_id, operations_profile_id, payload_json) VALUES
  ('ops-record-101', 'property-101', 'unit-101', 'operations-profile-001',
   '{"recordId":"ops-record-101","propertyId":"property-101","propertyName":"فيلا الياسمين","propertyLocation":"الرياض — حي الياسمين","unitId":"unit-101","unitName":"شقة النرجس 101","unitLocation":"الرياض — حي النرجس","unitMeta":{"type":"شقة","bedrooms":"2","bathrooms":"2","area":"135 م²"},"readiness":{"status":"يحتاج إجراء","narrative":"تم تقييم الجاهزية التشغيلية بناءً على المعلومات والوثائق وحالة الأصل. توجد عناصر تحتاج متابعة قبل الإغلاق التشغيلي.","updatedAt":"09 مايو 2025، 10:45 ص","owner":"إدارة العمليات","counts":{"complete":6,"followUp":3,"blockers":1},"dimensions":[{"label":"حالة العقار","state":"مكتمل","detail":"العقار متاح للمراجعة ولا توجد حجوزات تشغيلية قائمة.","tone":"good"},{"label":"اكتمال المعلومات الأساسية","state":"مكتمل","detail":"تم توفير المعلومات الأساسية للعقار والوحدة.","tone":"good"},{"label":"الوثائق المطلوبة","state":"يحتاج مراجعة","detail":"شهادة السلامة تحتاج تحديثًا قبل الاعتماد النهائي.","tone":"warn"},{"label":"حالة الوحدة","state":"مكتمل","detail":"الوحدة نظيفة وجاهزة للسكن بعد الصيانة الأخيرة.","tone":"good"},{"label":"تعليمات الصيانة الملحقة","state":"تم رفعها","detail":"الملاحظات التشغيلية موثقة ضمن السجل التجريبي.","tone":"good"},{"label":"جاهزية التسليم / الإشغال","state":"يحتاج مراجعة","detail":"يلزم تأكيد إقفال عنصر السلامة قبل التسليم.","tone":"warn"}],"evidence":[{"name":"شهادة الملكية","meta":"PDF · 1.2 MB","state":"سارية"},{"name":"شهادة السلامة","meta":"PDF · 1.4 MB","state":"منتهية في 20 أبريل 2025"},{"name":"تقرير الصيانة الأخير","meta":"PDF · 2.1 MB","state":"موثق"},{"name":"صور الوحدة الداخلية","meta":"10 صور","state":"موثق"}],"blocker":{"title":"شهادة السلامة غير محدثة","detail":"تحتاج شهادة السلامة إلى تحديث قبل الاعتماد التشغيلي النهائي.","due":"20 أبريل 2025","priority":"متابعة عاجلة","requiredAction":"تحديث شهادة السلامة ضمن سجل الأدلة.","assignee":"مدير السلامة"},"activity":["تم فحص معاينة الوحدة — 08 مايو 2025، 02:30 م","تم رفع تقرير الصيانة — 08 مايو 2025، 03:15 م","تم تحديث حالة الوثائق — 08 مايو 2025، 04:20 م","تم فتح عنصر يحتاج إجراء — 09 مايو 2025، 10:30 ص"]},"occupancy":{"status":"مشغول","relationType":"عقد سكني","startDate":"01 سبتمبر 2025","endDate":"31 أغسطس 2026","occupants":2,"recordState":"نشط","tenant":{"name":"مستأجر مسجل","recordType":"عقد إيجار سكني","phone":"05× ××× ××××","email":"musta***@mail.com"},"term":{"duration":"12 شهرًا","renewalReview":"01 أغسطس 2026","notice":"30 يومًا قبل تاريخ النهاية","paymentMethod":"تحويل بنكي","cadence":"شهري"},"documents":[{"name":"عقد","meta":"PDF · 1.8 MB"},{"name":"ملحق","meta":"PDF · 0.9 MB"},{"name":"استلام / تسليم","meta":"PDF · 1.3 MB"},{"name":"نموذج إشغال","meta":"PDF · 0.6 MB"},{"name":"ملاحظات موثقة","meta":"PDF · 0.7 MB"}],"alert":"تم تعديل نموذج استلام / تسليم بتاريخ 05 مايو 2025. يلزم الرجوع إلى النسخة المحدثة قبل أي اعتماد.","activity":["إنشاء السجل — 01 سبتمبر 2025، 10:15 ص","توثيق استلام الوحدة — 02 سبتمبر 2025، 11:40 ص","تحديث حالة الإشغال — 03 سبتمبر 2025، 02:25 م","إضافة ملاحظة موثقة — 05 مايو 2026، 03:30 م"]},"payments":{"status":"يوجد مبلغ مستحق","dueAmount":"6,000 ريال","dueDate":"15 أغسطس 2026","lastPayment":"6,000 ريال","lastPaymentDate":"15 يوليو 2026","linkedBalance":"6,000 ريال","cadence":"شهري","collectionMethod":"اتصال هاتفي","reminderState":"تم إرسال تذكير","reminderDetail":"08 أغسطس 2026 — عبر رسالة نصية","collectionNote":"تم التواصل مع المستأجر ضمن هذا السجل التجريبي، وتم توثيق المتابعة دون أي تكامل محاسبي أو مصرفي.","rows":[{"period":"مايو 2026","due":"15 مايو 2026","amount":"6,000 ريال","status":"مدفوعة","paid":"15 مايو 2026"},{"period":"يونيو 2026","due":"15 يونيو 2026","amount":"6,000 ريال","status":"مدفوعة","paid":"15 يونيو 2026"},{"period":"يوليو 2026","due":"15 يوليو 2026","amount":"6,000 ريال","status":"مدفوعة","paid":"15 يوليو 2026"},{"period":"أغسطس 2026","due":"15 أغسطس 2026","amount":"6,000 ريال","status":"مستحقة","paid":"—"}],"documents":["إيصال آخر دفعة (يوليو 2026)","سجل الدفعة (يوليو 2026)","ملاحظة تحصيل موثقة (08 أغسطس 2026)"],"activity":["استحقاق دفعة أغسطس 2026 — 15 أغسطس 2026","إرسال تذكير بالدفعة — 08 أغسطس 2026","تسجيل ملاحظة تحصيل — 08 أغسطس 2026","تسديد الدفعة السابقة — 15 يوليو 2026"]},"maintenance":{"status":"تحت المعالجة","inProgress":1,"awaitingFollowUp":1,"openWork":[{"id":"SRV-2026-0891","title":"صيانة تكييف","detail":"التبريد ضعيف في غرفة المعيشة.","priority":"متوسطة","priorityTone":"warn","assignee":"فريق الخدمة المعتمد","created":"09 أغسطس 2026","state":"قيد التنفيذ"},{"id":"SRV-2026-0892","title":"ملاحظة سباكة","detail":"تسرب خفيف أسفل حوض المطبخ.","priority":"منخفضة","priorityTone":"good","assignee":"مزود الخدمة المعتمد","created":"08 أغسطس 2026","state":"بانتظار المتابعة"},{"id":"SRV-2026-0887","title":"خدمة كهربائية","detail":"إضاءة الشرفة لا تعمل.","priority":"متوسطة","priorityTone":"warn","assignee":"مزود الخدمة المعتمد","created":"07 أغسطس 2026","state":"تم الإسناد"}],"recentCompleted":[{"title":"تنظيف فلتر المكيف","detail":"تم تنظيف فلتر المكيف وصيانة الوحدة الداخلية.","date":"25 يوليو 2026","by":"فريق الخدمة"},{"title":"معالجة رطوبة الحمام الرئيسي","detail":"تمت معالجة مصدر الرطوبة وإصلاح السيليكون.","date":"20 يوليو 2026","by":"مزود الخدمة المعتمد"},{"title":"تثبيت حامل تلفاز","detail":"تم تثبيت الحامل في غرفة المعيشة.","date":"15 يوليو 2026","by":"فريق الخدمة"}],"evidence":["IMG_20260809_1045.jpg","Service_Report_0891.pdf","Tech_Note_Plumbing.png","Work_Order_0887.pdf"],"activity":["تم إنشاء طلب خدمة كهربائية — 07 أغسطس 2026","تمت الإحالة إلى مزود معتمد — 08 أغسطس 2026","بدأ العمل في الموقع — 09 أغسطس 2026","تم تحديث حالة ملاحظة السباكة — 09 أغسطس 2026"]}}'),
  ('ops-record-202', 'property-104', 'unit-202', 'operations-profile-202',
   '{"recordId":"ops-record-202","propertyId":"property-104","propertyName":"سجل تجريبي خارج النطاق","propertyLocation":"نطاق تجريبي","unitId":"unit-202","unitName":"وحدة تجريبية خارج النطاق","unitLocation":"نطاق تجريبي"}');
