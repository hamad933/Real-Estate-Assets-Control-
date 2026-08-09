import { cookies } from "next/headers";
import type { AuthenticatedSession } from "@/lib/auth/types";

export const SESSION_COOKIE = "rp04_demo_session";

export const syntheticSessions = {
  "tenant-demo": {
    fixtureId: "tenant-demo",
    accessState: "USER",
    profile: "TENANT",
    scope: {
      tenantId: "tenant-001",
      tenancyIds: ["tenancy-101"],
      resourceIds: ["tenant-resource-101"]
    }
  },
  "contractor-demo": {
    fixtureId: "contractor-demo",
    accessState: "USER",
    profile: "CONTRACTOR",
    scope: {
      contractorId: "contractor-001",
      assignmentIds: ["work-order-501"]
    }
  },
  "operations-demo": {
    fixtureId: "operations-demo",
    accessState: "USER",
    profile: "OPERATIONS",
    scope: {
      teamId: "operations-north-01",
      propertyIds: ["property-101"],
      operationalRecordIds: ["ops-record-101"]
    }
  },
  "admin-demo": {
    fixtureId: "admin-demo",
    accessState: "ADMIN",
    profile: null,
    scope: {
      portfolioScope: "SYNTHETIC_DEMO"
    }
  }
} satisfies Record<string, AuthenticatedSession>;

export type SyntheticSessionId = keyof typeof syntheticSessions;

export function sessionFromFixtureId(value: string | undefined): AuthenticatedSession | null {
  if (!value) return null;
  return value in syntheticSessions
    ? syntheticSessions[value as SyntheticSessionId]
    : null;
}

export async function getSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  return sessionFromFixtureId(cookieStore.get(SESSION_COOKIE)?.value);
}
