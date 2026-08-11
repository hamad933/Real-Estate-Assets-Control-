export type OperationsRecordData = {
  recordId: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  unitId: string;
  unitName: string;
  unitLocation: string;
  unitMeta: { type: string; bedrooms: string; bathrooms: string; area: string };
  readiness: {
    status: string;
    narrative: string;
    updatedAt: string;
    owner: string;
    counts: { complete: number; followUp: number; blockers: number };
    dimensions: Array<{ label: string; state: string; detail: string; tone: string }>;
    evidence: Array<{ name: string; meta: string; state: string }>;
    blocker: { title: string; detail: string; due: string; priority: string; requiredAction: string; assignee: string };
    activity: string[];
  };
  occupancy: {
    status: string;
    relationType: string;
    startDate: string;
    endDate: string;
    occupants: number;
    recordState: string;
    tenant: { name: string; recordType: string; phone: string; email: string };
    term: { duration: string; renewalReview: string; notice: string; paymentMethod: string; cadence: string };
    documents: Array<{ name: string; meta: string }>;
    alert: string;
    activity: string[];
  };
  payments: {
    status: string;
    dueAmount: string;
    dueDate: string;
    lastPayment: string;
    lastPaymentDate: string;
    linkedBalance: string;
    cadence: string;
    collectionMethod: string;
    reminderState: string;
    reminderDetail: string;
    collectionNote: string;
    rows: Array<{ period: string; due: string; amount: string; status: string; paid: string }>;
    documents: string[];
    activity: string[];
  };
  maintenance: {
    status: string;
    inProgress: number;
    awaitingFollowUp: number;
    openWork: Array<{
      id: string;
      title: string;
      detail: string;
      priority: string;
      priorityTone: string;
      assignee: string;
      created: string;
      state: string;
    }>;
    recentCompleted: Array<{ title: string; detail: string; date: string; by: string }>;
    evidence: string[];
    activity: string[];
  };
};

export type OperationsSection = "readiness" | "occupancy" | "payments" | "maintenance";

export type TenantWorkspaceData = {
  resourceId: string;
  unit: {
    name: string;
    location: string;
    tenancyId: string;
    contractId: string;
    contractType: string;
    startDate: string;
    endDate: string;
    annualRent: string;
    paymentPlan: string;
  };
  nextPayment: { amount: string; dueDate: string; status: string };
  paymentHistory: Array<{ id: string; date: string; amount: string; status: string }>;
  serviceRequests: Array<{ id: string; title: string; date: string; status: string }>;
  documents: Array<{ id: string; title: string; meta: string }>;
  notifications: string[];
};

export type ContractorWorkspaceData = {
  contractorName: string;
  assignment: {
    id: string;
    requestId: string;
    title: string;
    problem: string;
    propertyName: string;
    location: string;
    access: string;
    parking: string;
    window: string;
    priority: string;
    status: string;
  };
  attachments: Array<{ title: string; meta: string }>;
  otherAssigned: Array<{ id: string; title: string; when: string }>;
  permittedContact: string;
};

export type PortfolioOperationsData = {
  portfolioName: string;
  totals: { openConditions: number; activeRecords: number; followUp: number };
  records: Array<{
    id: string;
    name: string;
    location: string;
    operationalState: string;
    occupancy: string;
    payments: string;
    maintenance: string;
    readiness: string;
    open: number;
    priority: number;
    reason: string;
    conditions: Array<{ title: string; severity: string; date: string }>;
    nextAction: string;
  }>;
};

export type PersistedInquiry = {
  displayId: string;
  listingId: string;
  propertyTitle: string;
  district: string;
  purpose: string;
  proposedDate: string;
  period: string;
  contactMethod: string;
  createdAt: string;
};
