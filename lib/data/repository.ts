import type { AuthenticatedSession } from "@/lib/auth/types";
import type { PublicProperty } from "@/lib/public-data";
import { withDatabase } from "@/lib/data/database";
import type {
  ContractorWorkspaceData,
  OperationsRecordData,
  PersistedInquiry,
  PortfolioOperationsData,
  TenantWorkspaceData
} from "@/lib/data/types";

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function formatRiyals(amount: number) {
  return `${new Intl.NumberFormat("en-US").format(amount)} ريال`;
}

function inquiryDisplayId(id: number) {
  return `INQ-LOCAL-${String(id).padStart(4, "0")}`;
}

function parseInquiryDisplayId(displayId: string) {
  const match = /^INQ-LOCAL-(\d+)$/.exec(displayId);
  return match ? Number(match[1]) : null;
}

type PublicRow = {
  id: string;
  district_key: string;
  listing_type: string;
  type_label: string;
  annual_price: number;
  status: string;
  status_label: string;
  summary: string;
  amenities_json: string;
  map_x: number;
  map_y: number;
  title: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
};

function publicPropertyFromRow(row: PublicRow): PublicProperty {
  return {
    id: row.id,
    title: row.title,
    district: row.district,
    districtKey: row.district_key as PublicProperty["districtKey"],
    type: row.listing_type as PublicProperty["type"],
    typeLabel: row.type_label,
    price: Number(row.annual_price),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    area: Number(row.area),
    status: row.status as PublicProperty["status"],
    statusLabel: row.status_label,
    summary: row.summary,
    amenities: parseJson<string[]>(row.amenities_json),
    mapX: Number(row.map_x),
    mapY: Number(row.map_y)
  };
}

const publicListingQuery = `
  SELECT l.id, l.district_key, l.listing_type, l.type_label, l.annual_price,
         l.status, l.status_label, l.summary, l.amenities_json, l.map_x, l.map_y,
         u.name AS title, u.location AS district,
         u.bedrooms, u.bathrooms, u.area
  FROM listings l
  JOIN units u ON u.id = l.unit_id
  JOIN properties p ON p.id = l.property_id AND p.id = u.property_id
`;

export function listPublicPropertiesFromDatabase(): PublicProperty[] {
  return withDatabase((db) => {
    const rows = db.prepare(`${publicListingQuery} ORDER BY l.rowid`).all() as PublicRow[];
    return rows.map(publicPropertyFromRow);
  });
}

export function getPublicPropertyFromDatabase(id: string): PublicProperty | undefined {
  return withDatabase((db) => {
    const row = db.prepare(`${publicListingQuery} WHERE l.id = ?`).get(id) as PublicRow | undefined;
    return row ? publicPropertyFromRow(row) : undefined;
  });
}

type TenantDetails = {
  documents?: TenantWorkspaceData["documents"];
  notifications?: string[];
};

type TenancyRow = {
  id: string;
  resource_id: string;
  contract_ref: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  annual_rent: number;
  payment_plan: string;
  details_json: string;
  unit_name: string;
  unit_location: string;
};

function tenantWorkspaceFromRow(db: Parameters<Parameters<typeof withDatabase>[0]>[0], row: TenancyRow): TenantWorkspaceData {
  const details = parseJson<TenantDetails>(row.details_json);
  const payments = db.prepare(`
    SELECT id, due_date, amount, status, paid_date
    FROM payment_records
    WHERE tenancy_id = ?
    ORDER BY rowid
  `).all(row.id) as Array<{ id: string; due_date: string; amount: number; status: string; paid_date: string | null }>;
  const nextPayment = payments.find((payment) => payment.status !== "مستلمة") ?? payments.at(-1);

  if (!nextPayment) throw new Error(`Seeded tenancy ${row.id} has no payment records.`);

  const serviceRequests = db.prepare(`
    SELECT id, title, created_date, status
    FROM maintenance_records
    WHERE tenancy_id = ?
    ORDER BY rowid DESC
  `).all(row.id) as Array<{ id: string; title: string; created_date: string; status: string }>;

  return {
    resourceId: row.resource_id,
    unit: {
      name: row.unit_name,
      location: row.unit_location,
      tenancyId: row.id,
      contractId: row.contract_ref,
      contractType: row.contract_type,
      startDate: row.start_date,
      endDate: row.end_date,
      annualRent: formatRiyals(Number(row.annual_rent)),
      paymentPlan: row.payment_plan
    },
    nextPayment: {
      amount: formatRiyals(Number(nextPayment.amount)),
      dueDate: nextPayment.due_date,
      status: nextPayment.status
    },
    paymentHistory: payments.map((payment) => ({
      id: payment.id,
      date: payment.paid_date ?? payment.due_date,
      amount: formatRiyals(Number(payment.amount)),
      status: payment.status
    })),
    serviceRequests: serviceRequests.map((request) => ({
      id: request.id,
      title: request.title,
      date: request.created_date,
      status: request.status
    })),
    documents: details.documents ?? [],
    notifications: details.notifications ?? []
  };
}

export function getTenantWorkspace(session: AuthenticatedSession): TenantWorkspaceData | null {
  if (session.accessState !== "USER" || session.profile !== "TENANT") return null;
  const allowed = new Set(session.scope.resourceIds);

  return withDatabase((db) => {
    const rows = db.prepare(`
      SELECT t.id, t.resource_id, t.contract_ref, t.contract_type, t.start_date,
             t.end_date, t.annual_rent, t.payment_plan, t.details_json,
             u.name AS unit_name, u.location AS unit_location
      FROM tenancies t
      JOIN units u ON u.id = t.unit_id
      JOIN profiles p ON p.id = t.tenant_profile_id
      WHERE p.fixture_id = ?
      ORDER BY t.id
    `).all(session.fixtureId) as TenancyRow[];
    const row = rows.find((candidate) => allowed.has(candidate.resource_id));
    return row ? tenantWorkspaceFromRow(db, row) : null;
  });
}

export function getTenantResource(session: AuthenticatedSession, resourceId: string): TenantWorkspaceData | null {
  if (
    session.accessState !== "USER" ||
    session.profile !== "TENANT" ||
    !session.scope.resourceIds.includes(resourceId)
  ) return null;

  return withDatabase((db) => {
    const row = db.prepare(`
      SELECT t.id, t.resource_id, t.contract_ref, t.contract_type, t.start_date,
             t.end_date, t.annual_rent, t.payment_plan, t.details_json,
             u.name AS unit_name, u.location AS unit_location
      FROM tenancies t
      JOIN units u ON u.id = t.unit_id
      JOIN profiles p ON p.id = t.tenant_profile_id
      WHERE p.fixture_id = ? AND t.resource_id = ?
    `).get(session.fixtureId, resourceId) as TenancyRow | undefined;
    return row ? tenantWorkspaceFromRow(db, row) : null;
  });
}

type ContractorDetails = {
  problem?: string;
  propertyName?: string;
  location?: string;
  access?: string;
  parking?: string;
  window?: string;
  priority?: string;
  attachments?: ContractorWorkspaceData["attachments"];
  otherAssigned?: ContractorWorkspaceData["otherAssigned"];
  permittedContact?: string;
};

type AssignmentRow = {
  id: string;
  request_id: string;
  maintenance_status: string;
  details_json: string;
  contractor_name: string;
  title: string;
};

function contractorWorkspaceFromRow(row: AssignmentRow): ContractorWorkspaceData {
  const details = parseJson<ContractorDetails>(row.details_json);
  return {
    contractorName: row.contractor_name,
    assignment: {
      id: row.id,
      requestId: row.request_id,
      title: row.title,
      problem: details.problem ?? "سجل صيانة تركيبي.",
      propertyName: details.propertyName ?? "أصل تجريبي",
      location: details.location ?? "نطاق تجريبي",
      access: details.access ?? "لا توجد تعليمات إضافية.",
      parking: details.parking ?? "لا توجد ملاحظات إضافية.",
      window: details.window ?? "موعد تجريبي",
      priority: details.priority ?? "منخفضة",
      status: row.maintenance_status
    },
    attachments: details.attachments ?? [],
    otherAssigned: details.otherAssigned ?? [],
    permittedContact: details.permittedContact ?? "إدارة العمليات — قناة المهمة فقط"
  };
}

const assignmentQuery = `
  SELECT a.id, a.request_id, a.details_json,
         p.label AS contractor_name, m.title, m.status AS maintenance_status
  FROM contractor_assignments a
  JOIN profiles p ON p.id = a.contractor_profile_id
  JOIN maintenance_records m ON m.id = a.maintenance_id AND m.id = a.request_id
`;

export function getContractorWorkspace(session: AuthenticatedSession): ContractorWorkspaceData | null {
  if (session.accessState !== "USER" || session.profile !== "CONTRACTOR") return null;
  const allowed = new Set(session.scope.assignmentIds);

  return withDatabase((db) => {
    const rows = db.prepare(`${assignmentQuery} WHERE p.fixture_id = ? ORDER BY a.id`).all(session.fixtureId) as AssignmentRow[];
    const row = rows.find((candidate) => allowed.has(candidate.id));
    return row ? contractorWorkspaceFromRow(row) : null;
  });
}

export function getContractorAssignment(session: AuthenticatedSession, assignmentId: string): ContractorWorkspaceData | null {
  if (
    session.accessState !== "USER" ||
    session.profile !== "CONTRACTOR" ||
    !session.scope.assignmentIds.includes(assignmentId)
  ) return null;

  return withDatabase((db) => {
    const row = db.prepare(`${assignmentQuery} WHERE p.fixture_id = ? AND a.id = ?`).get(session.fixtureId, assignmentId) as AssignmentRow | undefined;
    return row ? contractorWorkspaceFromRow(row) : null;
  });
}

export function updateContractorAssignmentStatus(
  session: AuthenticatedSession,
  assignmentId: string,
  status: string
): boolean {
  if (
    session.accessState !== "USER" ||
    session.profile !== "CONTRACTOR" ||
    !session.scope.assignmentIds.includes(assignmentId)
  ) return false;

  return withDatabase((db) => {
    const assignment = db.prepare(`
      SELECT a.maintenance_id
      FROM contractor_assignments a
      JOIN profiles p ON p.id = a.contractor_profile_id
      WHERE a.id = ? AND p.fixture_id = ?
    `).get(assignmentId, session.fixtureId) as { maintenance_id: string } | undefined;
    if (!assignment) return false;

    db.exec("BEGIN IMMEDIATE");
    try {
      const assignmentResult = db.prepare("UPDATE contractor_assignments SET status = ? WHERE id = ?").run(status, assignmentId);
      const maintenanceResult = db.prepare("UPDATE maintenance_records SET status = ? WHERE id = ?").run(status, assignment.maintenance_id);
      if (Number(assignmentResult.changes) !== 1 || Number(maintenanceResult.changes) !== 1) {
        throw new Error("Unable to keep assignment and maintenance status aligned.");
      }
      db.exec("COMMIT");
      return true;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  });
}

function cadenceLabel(plan: string) {
  if (plan.includes("شهرية")) return "شهري";
  if (plan.includes("سنوية")) return "سنوي";
  return plan;
}

function operationsPaymentState(status: string) {
  return status === "مستلمة" ? "مدفوعة" : status;
}

export function getOperationsRecord(
  session: AuthenticatedSession,
  recordId: string
): OperationsRecordData | null {
  if (
    session.accessState !== "USER" ||
    session.profile !== "OPERATIONS" ||
    !session.scope.operationalRecordIds.includes(recordId)
  ) return null;

  return withDatabase((db) => {
    const row = db.prepare(`
      SELECT o.payload_json,
             p.id AS property_id, p.name AS property_name, p.location AS property_location,
             u.id AS unit_id, u.name AS unit_name, u.location AS unit_location,
             u.unit_type, u.bedrooms, u.bathrooms, u.area
      FROM operations_records o
      JOIN profiles profile ON profile.id = o.operations_profile_id
      JOIN properties p ON p.id = o.property_id
      JOIN units u ON u.id = o.unit_id AND u.property_id = p.id
      WHERE profile.fixture_id = ? AND o.id = ?
    `).get(session.fixtureId, recordId) as Record<string, unknown> | undefined;
    if (!row) return null;

    const payload = parseJson<OperationsRecordData>(String(row.payload_json));
    const tenancy = db.prepare(`
      SELECT id, contract_type, start_date, end_date, payment_plan, status
      FROM tenancies
      WHERE unit_id = ? AND status = 'نشط'
      ORDER BY rowid
      LIMIT 1
    `).get(String(row.unit_id)) as {
      id: string;
      contract_type: string;
      start_date: string;
      end_date: string;
      payment_plan: string;
      status: string;
    } | undefined;

    const payments = tenancy
      ? db.prepare(`
          SELECT period, due_date, amount, status, paid_date
          FROM payment_records
          WHERE tenancy_id = ?
          ORDER BY rowid
        `).all(tenancy.id) as Array<{ period: string; due_date: string; amount: number; status: string; paid_date: string | null }>
      : [];
    const nextPayment = payments.find((payment) => payment.status !== "مستلمة");
    const lastPayment = [...payments].reverse().find((payment) => payment.status === "مستلمة");

    const maintenance = db.prepare(`
      SELECT m.id, m.title, m.detail, m.status, m.priority, m.created_date,
             COALESCE(cp.label, 'مزود الخدمة المعتمد') AS assignee
      FROM maintenance_records m
      LEFT JOIN contractor_assignments a ON a.maintenance_id = m.id
      LEFT JOIN profiles cp ON cp.id = a.contractor_profile_id
      WHERE m.unit_id = ? AND m.status NOT IN ('مغلق', 'مكتمل')
      ORDER BY m.rowid
    `).all(String(row.unit_id)) as Array<{
      id: string;
      title: string;
      detail: string;
      status: string;
      priority: string;
      created_date: string;
      assignee: string;
    }>;

    return {
      ...payload,
      recordId,
      propertyId: String(row.property_id),
      propertyName: String(row.property_name),
      propertyLocation: String(row.property_location),
      unitId: String(row.unit_id),
      unitName: String(row.unit_name),
      unitLocation: String(row.unit_location),
      unitMeta: {
        type: String(row.unit_type),
        bedrooms: String(row.bedrooms),
        bathrooms: String(row.bathrooms),
        area: `${String(row.area)} م²`
      },
      occupancy: tenancy
        ? {
            ...payload.occupancy,
            status: "مشغول",
            relationType: tenancy.contract_type,
            startDate: tenancy.start_date,
            endDate: tenancy.end_date,
            recordState: tenancy.status,
            term: {
              ...payload.occupancy.term,
              cadence: cadenceLabel(tenancy.payment_plan)
            }
          }
        : {
            ...payload.occupancy,
            status: "شاغر",
            recordState: "غير مشغول"
          },
      payments: {
        ...payload.payments,
        status: nextPayment?.status === "متأخرة" ? "يوجد مبلغ متأخر" : nextPayment ? "يوجد مبلغ مستحق" : "لا يوجد مبلغ مستحق",
        dueAmount: nextPayment ? formatRiyals(Number(nextPayment.amount)) : "0 ريال",
        dueDate: nextPayment?.due_date ?? "—",
        lastPayment: lastPayment ? formatRiyals(Number(lastPayment.amount)) : "—",
        lastPaymentDate: lastPayment?.paid_date ?? "—",
        linkedBalance: nextPayment ? formatRiyals(Number(nextPayment.amount)) : "0 ريال",
        cadence: tenancy ? cadenceLabel(tenancy.payment_plan) : "—",
        rows: payments.map((payment) => ({
          period: payment.period,
          due: payment.due_date,
          amount: formatRiyals(Number(payment.amount)),
          status: operationsPaymentState(payment.status),
          paid: payment.paid_date ?? "—"
        }))
      },
      maintenance: {
        ...payload.maintenance,
        status: maintenance.length > 0 ? "تحت المعالجة" : "مستقر",
        inProgress: maintenance.filter((item) => ["في الموقع", "قيد التنفيذ", "تم رفع تقرير التنفيذ"].includes(item.status)).length,
        awaitingFollowUp: maintenance.filter((item) => item.status === "بانتظار المتابعة").length,
        openWork: maintenance.map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.detail,
          priority: item.priority,
          priorityTone: item.priority === "منخفضة" ? "good" : "warn",
          assignee: item.assignee,
          created: item.created_date,
          state: item.status
        }))
      }
    };
  });
}

export function getAdminPortfolio(session: AuthenticatedSession): PortfolioOperationsData | null {
  if (session.accessState !== "ADMIN") return null;

  return withDatabase((db) => {
    const rows = db.prepare(`
      SELECT id, name, location, operational_state, occupancy_state, payment_state,
             maintenance_state, readiness_state, open_conditions, priority, reason,
             next_action, conditions_json
      FROM properties
      WHERE portfolio_visible = 1
      ORDER BY priority, id
    `).all() as Array<Record<string, unknown>>;

    const records = rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      location: String(row.location),
      operationalState: String(row.operational_state),
      occupancy: String(row.occupancy_state),
      payments: String(row.payment_state),
      maintenance: String(row.maintenance_state),
      readiness: String(row.readiness_state),
      open: Number(row.open_conditions),
      priority: Number(row.priority),
      reason: String(row.reason),
      conditions: parseJson<PortfolioOperationsData["records"][number]["conditions"]>(String(row.conditions_json)),
      nextAction: String(row.next_action)
    }));

    return {
      portfolioName: "جميع المحافظ",
      totals: {
        openConditions: records.reduce((sum, record) => sum + record.open, 0),
        activeRecords: records.length,
        followUp: records.reduce(
          (sum, record) => sum + record.conditions.filter((condition) => condition.severity !== "منخفض").length,
          0
        )
      },
      records
    };
  });
}

export type CreateInquiryInput = {
  listingId: string;
  purpose: "visit" | "question" | "availability";
  proposedDate: string;
  period: "morning" | "afternoon" | "evening";
  contactMethod: "phone" | "message" | "email";
};

export function createInquiry(input: CreateInquiryInput): PersistedInquiry {
  return withDatabase((db) => {
    const listing = db.prepare(`
      SELECT l.id, u.location AS district, u.name AS property_title
      FROM listings l
      JOIN units u ON u.id = l.unit_id
      WHERE l.id = ?
    `).get(input.listingId) as { id: string; district: string; property_title: string } | undefined;
    if (!listing) throw new Error("Unknown synthetic listing.");

    const result = db.prepare(`
      INSERT INTO inquiries (
        listing_id, purpose, proposed_date, period, contact_method,
        synthetic_name, synthetic_phone, synthetic_email, notes_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.listingId,
      input.purpose,
      input.proposedDate,
      input.period,
      input.contactMethod,
      "زائر تجريبي",
      "0500000000",
      input.contactMethod === "email" ? "visitor@example.test" : null,
      "لم تُحفظ بيانات الاتصال أو الملاحظات المدخلة؛ هذا سجل تنسيق تركيبي محلي فقط."
    );
    const id = Number(result.lastInsertRowid);

    const created = db.prepare("SELECT created_at FROM inquiries WHERE id = ?").get(id) as { created_at: string };
    return {
      displayId: inquiryDisplayId(id),
      listingId: input.listingId,
      propertyTitle: listing.property_title,
      district: listing.district,
      purpose: input.purpose,
      proposedDate: input.proposedDate,
      period: input.period,
      contactMethod: input.contactMethod,
      createdAt: created.created_at
    };
  });
}

export function getInquiry(displayId: string): PersistedInquiry | null {
  const id = parseInquiryDisplayId(displayId);
  if (!id) return null;

  return withDatabase((db) => {
    const row = db.prepare(`
      SELECT i.listing_id, i.purpose, i.proposed_date, i.period, i.contact_method,
             i.created_at, u.location AS district, u.name AS property_title
      FROM inquiries i
      JOIN listings l ON l.id = i.listing_id
      JOIN units u ON u.id = l.unit_id
      WHERE i.id = ?
    `).get(id) as Record<string, unknown> | undefined;
    if (!row) return null;

    return {
      displayId: inquiryDisplayId(id),
      listingId: String(row.listing_id),
      propertyTitle: String(row.property_title),
      district: String(row.district),
      purpose: String(row.purpose),
      proposedDate: String(row.proposed_date),
      period: String(row.period),
      contactMethod: String(row.contact_method),
      createdAt: String(row.created_at)
    };
  });
}
