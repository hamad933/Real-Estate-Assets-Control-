CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  fixture_id TEXT NOT NULL UNIQUE,
  access_state TEXT NOT NULL CHECK (access_state IN ('USER', 'ADMIN')),
  profile_kind TEXT CHECK (profile_kind IN ('TENANT', 'CONTRACTOR', 'OPERATIONS') OR profile_kind IS NULL),
  label TEXT NOT NULL
);

CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  portfolio_visible INTEGER NOT NULL DEFAULT 0 CHECK (portfolio_visible IN (0, 1)),
  operational_state TEXT,
  occupancy_state TEXT,
  payment_state TEXT,
  maintenance_state TEXT,
  readiness_state TEXT,
  open_conditions INTEGER NOT NULL DEFAULT 0,
  priority INTEGER,
  reason TEXT,
  next_action TEXT,
  conditions_json TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE units (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area INTEGER NOT NULL
);

CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  unit_id TEXT REFERENCES units(id) ON DELETE RESTRICT,
  district TEXT NOT NULL,
  district_key TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  type_label TEXT NOT NULL,
  annual_price INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'soon')),
  status_label TEXT NOT NULL,
  summary TEXT NOT NULL,
  amenities_json TEXT NOT NULL,
  map_x REAL NOT NULL,
  map_y REAL NOT NULL
);

CREATE TABLE tenancies (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tenant_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  resource_id TEXT NOT NULL UNIQUE,
  contract_ref TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  annual_rent INTEGER NOT NULL,
  payment_plan TEXT NOT NULL,
  status TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE payment_records (
  id TEXT PRIMARY KEY,
  tenancy_id TEXT NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  paid_date TEXT
);

CREATE TABLE maintenance_records (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tenancy_id TEXT REFERENCES tenancies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  created_date TEXT NOT NULL
);

CREATE TABLE contractor_assignments (
  id TEXT PRIMARY KEY,
  maintenance_id TEXT NOT NULL REFERENCES maintenance_records(id) ON DELETE RESTRICT,
  contractor_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  request_id TEXT NOT NULL,
  status TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE operations_records (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  operations_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  payload_json TEXT NOT NULL
);

CREATE TABLE inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  purpose TEXT NOT NULL,
  proposed_date TEXT NOT NULL,
  period TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  synthetic_name TEXT NOT NULL,
  synthetic_phone TEXT NOT NULL,
  synthetic_email TEXT,
  notes_summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_listings_property ON listings(property_id);
CREATE INDEX idx_tenancies_profile ON tenancies(tenant_profile_id);
CREATE INDEX idx_payments_tenancy ON payment_records(tenancy_id);
CREATE INDEX idx_maintenance_tenancy ON maintenance_records(tenancy_id);
CREATE INDEX idx_assignments_profile ON contractor_assignments(contractor_profile_id);
CREATE INDEX idx_operations_profile ON operations_records(operations_profile_id);
CREATE INDEX idx_inquiries_listing ON inquiries(listing_id);
