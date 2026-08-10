export const tenantWorkspaceFixture = {
  unit: {
    name: "شقة النرجس 101",
    location: "الرياض — حي النرجس",
    tenancyId: "tenancy-101",
    contractId: "CTR-2025-101",
    contractType: "عقد إيجار سكني",
    startDate: "15 سبتمبر 2025",
    endDate: "14 سبتمبر 2026",
    annualRent: "150,000 ريال",
    paymentPlan: "دفعات سنوية"
  },
  nextPayment: {
    amount: "6,000 ريال",
    dueDate: "15 سبتمبر 2026",
    status: "مجدولة"
  },
  paymentHistory: [
    { id: "PAY-2025-0915", date: "15 سبتمبر 2025", amount: "150,000 ريال", status: "مستلمة" },
    { id: "INV-2026-0915", date: "15 سبتمبر 2026", amount: "6,000 ريال", status: "قادمة" }
  ],
  serviceRequests: [
    { id: "SRV-2025-0891", title: "صيانة تكييف — تبريد ضعيف", date: "01 مايو 2026", status: "مكتمل" },
    { id: "SRV-2025-0887", title: "فحص تسرب أسفل الحوض", date: "28 أبريل 2026", status: "مغلق" }
  ],
  documents: [
    { id: "DOC-LEASE-101", title: "عقد الإيجار", meta: "PDF · 1.2 MB" },
    { id: "DOC-RULES-101", title: "ملحق الشروط والأحكام", meta: "PDF · 860 KB" },
    { id: "DOC-INVOICE-101", title: "فاتورة سابقة", meta: "PDF · 240 KB" }
  ],
  notifications: [
    "تم إصدار إشعار الدفعة القادمة.",
    "تم إغلاق طلب الصيانة SRV-2025-0891."
  ]
};

export const contractorWorkspaceFixture = {
  contractorName: "مؤسسة أفق الصيانة",
  assignment: {
    id: "work-order-501",
    requestId: "SRV-2025-0891",
    title: "صيانة تكييف",
    problem: "التبريد ضعيف في غرفة المعيشة. يرجى فحص المكيف وتنظيف الفلاتر وفحص مستوى وسيط التبريد عند الحاجة.",
    propertyName: "شقة النرجس 101",
    location: "الرياض — حي النرجس",
    access: "الدخول من البوابة الرئيسية؛ التنسيق مع جهة الاتصال قبل الوصول.",
    parking: "موقف الزوار متاح أسفل المبنى.",
    window: "01 مايو 2026 · 10:00 ص — 01:00 م",
    priority: "متوسطة",
    status: "بانتظار الوصول"
  },
  attachments: [
    { title: "سجل طلب الخدمة", meta: "Service_Report_0891.pdf" },
    { title: "مقطع فيديو", meta: "video_20250501.mp4" },
    { title: "صورة من البلاغ", meta: "IMG_20250501_1045.jpg" }
  ],
  otherAssigned: [
    { id: "work-order-501", title: "صيانة تكييف — المهمة الحالية", when: "اليوم · 10:00 ص" }
  ],
  permittedContact: "إدارة العمليات — قناة المهمة فقط"
};

export const portfolioOperationsFixture = {
  portfolioName: "جميع المحافظ",
  totals: {
    openConditions: 27,
    activeRecords: 48,
    followUp: 12
  },
  records: [
    {
      id: "property-101",
      name: "فيلا الياسمين",
      location: "الرياض — حي الياسمين",
      operationalState: "يتطلب تدخل",
      occupancy: "مشغول",
      payments: "متأخر",
      maintenance: "تحتاج إجراء",
      readiness: "جاهزة",
      open: 5,
      priority: 1
    },
    {
      id: "property-102",
      name: "شقة النرجس 101",
      location: "الرياض — حي النرجس",
      operationalState: "يتطلب متابعة",
      occupancy: "مشغول",
      payments: "متأخر",
      maintenance: "تحتاج متابعة",
      readiness: "جاهزة",
      open: 3,
      priority: 2
    },
    {
      id: "property-103",
      name: "دوبلكس العقيق",
      location: "الرياض — حي العقيق",
      operationalState: "يتطلب متابعة",
      occupancy: "مشغول",
      payments: "سليم",
      maintenance: "تحتاج متابعة",
      readiness: "جاهزة",
      open: 2,
      priority: 3
    },
    {
      id: "property-104",
      name: "شقة الياسمين 12",
      location: "الرياض — حي الياسمين",
      operationalState: "مستقر",
      occupancy: "مشغول",
      payments: "سليم",
      maintenance: "سليم",
      readiness: "جاهزة",
      open: 1,
      priority: 4
    }
  ],
  selected: {
    name: "فيلا الياسمين",
    location: "الرياض — حي الياسمين",
    reason: "توجد حالات مفتوحة ذات تأثير تشغيلي وتتطلب إجراء خلال 7 أيام.",
    conditions: [
      { title: "شهادة السلامة من الدفاع المدني منتهية", severity: "عالٍ", date: "15 أبريل 2026" },
      { title: "صيانة تكييف غرفة المعيشة", severity: "متوسط", date: "01 مايو 2026" },
      { title: "دفعة إيجار متأخرة", severity: "عالٍ", date: "10 مايو 2026" }
    ],
    nextAction: "مراجعة الحالات المفتوحة وتحديث خطة المعالجة."
  }
};
