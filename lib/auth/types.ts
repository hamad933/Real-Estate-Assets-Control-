export type GlobalAccessState = "VISITOR" | "USER" | "ADMIN";
export type UserProfile = "TENANT" | "CONTRACTOR" | "OPERATIONS";
export type Workspace = UserProfile | "ADMIN";

export type TenantScope = {
  tenantId: string;
  tenancyIds: string[];
  resourceIds: string[];
};

export type ContractorScope = {
  contractorId: string;
  assignmentIds: string[];
};

export type OperationsScope = {
  teamId: string;
  propertyIds: string[];
  operationalRecordIds: string[];
};

export type UserSession =
  | {
      fixtureId: "tenant-demo";
      accessState: "USER";
      profile: "TENANT";
      scope: TenantScope;
    }
  | {
      fixtureId: "contractor-demo";
      accessState: "USER";
      profile: "CONTRACTOR";
      scope: ContractorScope;
    }
  | {
      fixtureId: "operations-demo";
      accessState: "USER";
      profile: "OPERATIONS";
      scope: OperationsScope;
    };

export type AdminSession = {
  fixtureId: "admin-demo";
  accessState: "ADMIN";
  profile: null;
  scope: {
    portfolioScope: "SYNTHETIC_DEMO";
  };
};

export type AuthenticatedSession = UserSession | AdminSession;
