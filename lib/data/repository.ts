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

export function getPublicPropertyFromDatabase(id: string): PublicProperty | undefined {
  return withDatabase((db) => {
    const row = db.prepare(`
      SELECT id, district, district_key, listing_type, type_label, annual_price,
             bedrooms, bathrooms, area, status, status_label, summary,
             amenities_json, map_x, map_y
      FROM listings
      WHERE id = ?
    `).get(id) as Record<string, unknown> | undefined;

    if (!row) return undefined;
    const propertyRow = db.prepare("SELECT name FROM properties WHERE id = (SELECT property_id FROM listings WHERE id = ?)").get(id) as { name: string };

    return {
      id: String(row.id),
      title: propertyRow.name,
      district: String(row.district),
      districtKey: String(row.district_key) as PublicProperty["districtKey"],
      type: String(row.listing_type) as PublicProperty["type"],
      typeLabel: String(row.type_label),
      price: Number(row.annual_price),
      bedrooms: Number(row.bedrooms),
      bathrooms: Number(row.bathrooms),
      area: Number(row.area),
      status: String(row.status) as PublicProperty["status"],
      statusLabel: String(row.status_label),
      summary: String(row.summary),
      amenities: parseJson<string[]>(String(row.amenities_json)),
      mapX: Number(row.map_x),
      mapY: Number(row.map_y)
    };
  });
}

type TenantDetails = {
  serviceRequests?: TenantWorkspaceData["serviceRequests"];
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
    serviceRequests: details.serviceRequests ?? [],
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
  status: string;
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
      status: row.status
    },
    attachments: details.attachments ?? [],
    otherAssigned: details.otherAssigned ?? [],
    permittedContact: details.permittedContact ?? "إدارة العمليات — قناة المهمة فقط"
  };
}

export function getContractorWorkspace(session: AuthenticatedSession): ContractorWorkspaceData | null {
  if (session.accessState !== "USER" || session.profile !== "CONTRACTOR") return null;
  const allowed = new Set(session.scope.assignmentIds);

  return withDatabase((db) => {
    const rows = db.prepare(`
      SELECT a.id, a.request_id, a.status, a.details_json,
             p.label AS contractor_name, m.title
      FROM contractor_assignments a
      JOIN profiles p ON p.id = a.contractor_profile_id
      JOIN maintenance_records m ON m.id = a.maintenance_id
      WHERE p.fixture_id = ?
      ORDER BY a.id
    `).all(session.fixtureId) as AssignmentRow[];
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
    const row = db.prepare(`
      SELECT a.id, a.request_id, a.status, a.details_json,
             p.label AS contractor_name, m.title
      FROM contractor_assignments a
      JOIN profiles p ON p.id = a.contractor_profile_id
      JOIN maintenance_records m ON m.id = a.maintenance_id
      WHERE p.fixture_id = ? AND a.id = ?
    `).get(session.fixtureId, assignmentId) as AssignmentRow | undefined;
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
    const result = db.prepare(`
      UPDATE contractor_assignments
      SET status = ?
      WHERE id = ?
        AND contractor_profile_id = (SELECT id FROM profiles WHERE fixture_id = ?)
    `).run(status, assignmentId, session.fixtureId);
    return Number(result.changes) === 1;
  });
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
      JOIN units u ON u.id = o.unit_id
      WHERE profile.fixture_id = ? AND o.id = ?
    `).get(session.fixtureId, recordId) as Record<string, unknown> | undefined;
    if (!row) return null;

    const payload = parseJson<OperationsRecordData>(String(row.payload_json));
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

    return {
      portfolioName: "جميع المحافظ",
      totals: { openConditions: 27, activeRecords: 48, followUp: 12 },
      records: rows.map((row) => ({
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
      }))
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
      SELECT l.id, l.district, p.name AS property_title
      FROM listings l
      JOIN properties p ON p.id = l.property_id
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
             i.created_at, l.district, p.name AS property_title
      FROM inquiries i
      JOIN listings l ON l.id = i.listing_id
      JOIN properties p ON p.id = l.property_id
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
