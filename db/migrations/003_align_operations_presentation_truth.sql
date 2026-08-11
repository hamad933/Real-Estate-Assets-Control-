UPDATE operations_records
SET payload_json = json_set(
  payload_json,
  '$.readiness.narrative', 'توجد عناصر مالية وخدمية تحتاج متابعة ضمن الوحدة المشغولة قبل إغلاق السجل التشغيلي.',
  '$.readiness.updatedAt', '11 أغسطس 2026، 10:45 ص',
  '$.readiness.owner', 'إدارة العمليات',
  '$.readiness.dimensions', json('[{"label":"حالة العقار","state":"مكتمل","detail":"هوية العقار والوحدة متطابقتان مع السجل العلائقي.","tone":"good"},{"label":"اكتمال المعلومات الأساسية","state":"مكتمل","detail":"تم توفير المعلومات الأساسية للعقار والوحدة.","tone":"good"},{"label":"الوثائق المطلوبة","state":"يحتاج مراجعة","detail":"توجد متابعة وثائقية قبل الإغلاق التشغيلي.","tone":"warn"},{"label":"حالة الوحدة","state":"مشغول","detail":"الوحدة مرتبطة بعلاقة إيجارية نشطة حتى 14 سبتمبر 2026.","tone":"good"},{"label":"تعليمات الصيانة الملحقة","state":"تم رفعها","detail":"طلبات الخدمة المفتوحة مرتبطة بنفس الوحدة والعلاقة.","tone":"good"},{"label":"جاهزية الإغلاق","state":"يحتاج مراجعة","detail":"يلزم إغلاق الدفعة المتأخرة ومسارات الخدمة المفتوحة.","tone":"warn"}]'),
  '$.readiness.blocker', json('{"title":"دفعة أغسطس ومسارات خدمة مفتوحة","detail":"يلزم متابعة الدفعة المتأخرة وطلبات الخدمة المفتوحة قبل إغلاق الحالة التشغيلية.","due":"10 أغسطس 2026","priority":"متابعة عاجلة","requiredAction":"مراجعة التحصيل وحالة طلبات الخدمة.","assignee":"إدارة العمليات"}'),
  '$.readiness.activity', json('["تم تحديث حالة الدفعة — 10 أغسطس 2026","تم فتح متابعة صيانة التكييف — 09 أغسطس 2026","تمت مراجعة السجل التشغيلي — 11 أغسطس 2026"]'),
  '$.occupancy.alert', 'العلاقة نشطة حتى 14 سبتمبر 2026؛ لذلك يظهر العرض العام للوحدة كمتاح قريبًا لا متاح الآن.',
  '$.payments.collectionMethod', 'متابعة داخلية',
  '$.payments.reminderState', 'متابعة مطلوبة',
  '$.payments.reminderDetail', '11 أغسطس 2026 — متابعة محلية فقط',
  '$.payments.collectionNote', 'لا توجد مراسلة أو عملية دفع خارجية؛ الحالة مستمدة من سجل الدفعات المحلي.',
  '$.payments.activity', json('["استحقاق دفعة أغسطس — 10 أغسطس 2026","تسجيل حالة التأخر — 11 أغسطس 2026"]'),
  '$.maintenance.recentCompleted', json('[{"title":"تنظيف فلتر سابق","detail":"تم إغلاق صيانة وقائية سابقة مستقلة عن الطلب الحالي.","date":"25 يوليو 2026","by":"فريق الخدمة"}]'),
  '$.maintenance.activity', json('["تم إنشاء طلب خدمة كهربائية — 07 أغسطس 2026","تم فتح ملاحظة السباكة — 08 أغسطس 2026","تم إنشاء طلب التكييف — 09 أغسطس 2026"]')
)
WHERE id = 'ops-record-101';

UPDATE operations_records
SET payload_json = json_set(
  payload_json,
  '$.unitMeta', json('{"type":"شقة","bedrooms":"1","bathrooms":"1","area":"70 م²"}'),
  '$.readiness', json('{"status":"مستقر","narrative":"سجل خارج النطاق.","updatedAt":"01 أغسطس 2026","owner":"فريق آخر","counts":{"complete":1,"followUp":0,"blockers":0},"dimensions":[],"evidence":[],"blocker":{"title":"لا يوجد","detail":"لا يوجد","due":"—","priority":"—","requiredAction":"—","assignee":"—"},"activity":[]}'),
  '$.occupancy', json('{"status":"مشغول","relationType":"عقد تجريبي","startDate":"01 يناير 2026","endDate":"31 ديسمبر 2026","occupants":1,"recordState":"نشط","tenant":{"name":"مقنع","recordType":"تركيبي","phone":"—","email":"—"},"term":{"duration":"12 شهرًا","renewalReview":"—","notice":"—","paymentMethod":"—","cadence":"شهري"},"documents":[],"alert":"","activity":[]}'),
  '$.payments', json('{"status":"مجدولة","dueAmount":"1,000 ريال","dueDate":"01 سبتمبر 2026","lastPayment":"—","lastPaymentDate":"—","linkedBalance":"1,000 ريال","cadence":"شهري","collectionMethod":"—","reminderState":"—","reminderDetail":"—","collectionNote":"","rows":[],"documents":[],"activity":[]}'),
  '$.maintenance', json('{"status":"تحت المعالجة","inProgress":0,"awaitingFollowUp":0,"openWork":[],"recentCompleted":[],"evidence":[],"activity":[]}')
)
WHERE id = 'ops-record-202';
