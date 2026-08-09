export const publicListings = [
  {
    id: "listing-101",
    title: "شقة تجريبية 101",
    district: "حي تجريبي — شمال المدينة",
    price: "96,000",
    meta: "3 غرف · 2 حمام · 146 م²"
  },
  {
    id: "listing-102",
    title: "وحدة سكنية تجريبية 102",
    district: "حي تجريبي — المنطقة الوسطى",
    price: "118,000",
    meta: "4 غرف · 3 حمامات · 188 م²"
  }
];

export const operationsFixture = {
  propertyId: "property-101",
  propertyName: "مبنى تجريبي 101",
  readiness: "جاهز للمراجعة",
  completion: 82,
  openChecks: 3,
  recordId: "ops-record-101",
  outsideRecordId: "ops-record-202"
};

export const tenantFixture = {
  tenantId: "tenant-001",
  propertyName: "شقة تجريبية 101",
  tenancyId: "tenancy-101",
  resourceId: "tenant-resource-101",
  outsideResourceId: "tenant-resource-202",
  nextPayment: "6,000 ريال",
  nextDate: "15 سبتمبر 2026",
  serviceState: "لا توجد طلبات حرجة"
};

export const contractorFixture = {
  contractorId: "contractor-001",
  assignmentId: "work-order-501",
  outsideAssignmentId: "work-order-502",
  propertyName: "مبنى تجريبي 101",
  task: "فحص تسرّب مياه — وحدة 03",
  status: "قيد التنفيذ"
};

export const adminFixture = {
  portfolioName: "محفظة تجريبية A",
  activeAssets: 48,
  attentionItems: 12,
  criticalItems: 2,
  properties: [
    { id: "property-101", name: "مبنى تجريبي 101", state: "مستقر", attention: "منخفض" },
    { id: "property-201", name: "مبنى تجريبي 201", state: "مراجعة", attention: "متوسط" },
    { id: "property-301", name: "مبنى تجريبي 301", state: "يتطلب إجراء", attention: "مرتفع" }
  ]
};
