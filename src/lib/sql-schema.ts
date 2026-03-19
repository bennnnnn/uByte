/**
 * SQL tutorial database schema + seed data.
 *
 * This preamble is automatically prepended to every SQL code submission
 * so users query a realistic "company" database without writing CREATE TABLE
 * or INSERT statements themselves — just like querying a real database.
 *
 * Tables:
 *   departments  — 5 rows   (id, name, manager, budget, location)
 *   employees    — 15 rows  (id, name, department_id, job_title, salary, hire_date)
 *   projects     — 8 rows   (id, name, department_id, status, budget, deadline)
 *   customers    — 10 rows  (id, name, email, country, joined_date)
 *   orders       — 18 rows  (id, customer_id, product, amount, order_date, status)
 */

export const SQL_PREAMBLE = `
-- ── Schema setup (hidden from users) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departments (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  manager  TEXT NOT NULL,
  budget   INTEGER NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  job_title     TEXT NOT NULL,
  salary        INTEGER NOT NULL,
  hire_date     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  status        TEXT NOT NULL,
  budget        INTEGER NOT NULL,
  deadline      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  country     TEXT NOT NULL,
  joined_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  product     TEXT NOT NULL,
  amount      REAL NOT NULL,
  order_date  TEXT NOT NULL,
  status      TEXT NOT NULL
);

-- ── Departments ──────────────────────────────────────────────────────────────

INSERT INTO departments VALUES
  (1, 'Engineering',  'Alice Chen',   2400000, 'San Francisco'),
  (2, 'Marketing',    'Bob Taylor',   800000,  'New York'),
  (3, 'Sales',        'Carol Davis',  1200000, 'Chicago'),
  (4, 'HR',           'Dan Wilson',   500000,  'Austin'),
  (5, 'Data Science', 'Eva Martinez', 1600000, 'San Francisco');

-- ── Employees ────────────────────────────────────────────────────────────────

INSERT INTO employees VALUES
  (1,  'Alice Chen',    1, 'VP Engineering',      185000, '2018-03-15'),
  (2,  'James Park',    1, 'Senior Engineer',      145000, '2019-07-22'),
  (3,  'Priya Sharma',  1, 'Engineer',             118000, '2021-01-10'),
  (4,  'Liam Foster',   1, 'Junior Engineer',       92000, '2022-06-01'),
  (5,  'Noah Kim',      1, 'DevOps Engineer',      128000, '2020-09-14'),
  (6,  'Bob Taylor',    2, 'VP Marketing',         162000, '2017-11-03'),
  (7,  'Sophia Lee',    2, 'Marketing Manager',    108000, '2020-04-18'),
  (8,  'Ethan Brown',   2, 'Content Strategist',    85000, '2021-08-30'),
  (9,  'Carol Davis',   3, 'VP Sales',             172000, '2016-05-20'),
  (10, 'Olivia Jones',  3, 'Account Executive',     98000, '2021-02-12'),
  (11, 'Aiden Garcia',  3, 'Sales Rep',             72000, '2022-09-05'),
  (12, 'Dan Wilson',    4, 'HR Director',          130000, '2019-03-28'),
  (13, 'Mia Robinson',  4, 'HR Specialist',         78000, '2021-11-15'),
  (14, 'Eva Martinez',  5, 'Head of Data Science', 195000, '2018-08-07'),
  (15, 'Lucas White',   5, 'Data Scientist',       138000, '2020-12-01');

-- ── Projects ─────────────────────────────────────────────────────────────────

INSERT INTO projects VALUES
  (1, 'Platform Rewrite',    1, 'active',    650000, '2025-12-31'),
  (2, 'API v3',              1, 'active',    280000, '2025-06-30'),
  (3, 'ML Pipeline',         5, 'active',    420000, '2025-09-15'),
  (4, 'Brand Refresh',       2, 'completed', 180000, '2024-12-01'),
  (5, 'Q1 Campaign',         2, 'active',     95000, '2025-03-31'),
  (6, 'CRM Integration',     3, 'active',    310000, '2025-07-31'),
  (7, 'Talent Platform',     4, 'planning',  140000, '2025-11-30'),
  (8, 'Customer Analytics',  5, 'active',    390000, '2025-08-31');

-- ── Customers ────────────────────────────────────────────────────────────────

INSERT INTO customers VALUES
  (1,  'Acme Corp',        'billing@acme.com',       'USA',     '2021-01-15'),
  (2,  'TechStart GmbH',   'ap@techstart.de',        'Germany', '2021-06-22'),
  (3,  'Globex Ltd',       'finance@globex.co.uk',   'UK',      '2020-09-10'),
  (4,  'NovaSoft',         'orders@novasoft.io',     'Canada',  '2022-02-28'),
  (5,  'Pinnacle Inc',     'admin@pinnacle.com',     'USA',     '2019-11-05'),
  (6,  'SkyLine Systems',  'billing@skyline.net',    'USA',     '2023-01-18'),
  (7,  'BrightPath',       'info@brightpath.com.au', 'Australia','2022-07-14'),
  (8,  'Vertex Solutions', 'ap@vertex.ca',           'Canada',  '2021-03-30'),
  (9,  'Momentum Co',      'accounts@momentum.com',  'USA',     '2020-05-25'),
  (10, 'Apex Digital',     'billing@apexdigital.com','USA',     '2023-04-09');

-- ── Orders ───────────────────────────────────────────────────────────────────

INSERT INTO orders VALUES
  (1,  1, 'Enterprise Plan',    24000.00, '2024-01-15', 'paid'),
  (2,  1, 'Support Add-on',      3600.00, '2024-01-15', 'paid'),
  (3,  2, 'Pro Plan',           12000.00, '2024-02-01', 'paid'),
  (4,  3, 'Enterprise Plan',    24000.00, '2024-01-20', 'paid'),
  (5,  3, 'Training Package',    8500.00, '2024-03-10', 'paid'),
  (6,  4, 'Starter Plan',        4800.00, '2024-02-14', 'pending'),
  (7,  5, 'Enterprise Plan',    24000.00, '2023-11-01', 'paid'),
  (8,  5, 'Enterprise Plan',    24000.00, '2024-11-01', 'paid'),
  (9,  6, 'Pro Plan',           12000.00, '2024-03-01', 'paid'),
  (10, 7, 'Starter Plan',        4800.00, '2024-01-28', 'paid'),
  (11, 8, 'Pro Plan',           12000.00, '2024-02-20', 'pending'),
  (12, 9, 'Enterprise Plan',    24000.00, '2022-05-25', 'paid'),
  (13, 9, 'Enterprise Plan',    24000.00, '2023-05-25', 'paid'),
  (14, 9, 'Enterprise Plan',    24000.00, '2024-05-25', 'paid'),
  (15,10, 'Pro Plan',           12000.00, '2024-04-09', 'paid'),
  (16, 1, 'Training Package',    8500.00, '2024-04-15', 'pending'),
  (17, 2, 'Support Add-on',      3600.00, '2024-04-20', 'paid'),
  (18, 5, 'Training Package',    8500.00, '2024-04-22', 'paid');

-- ── End of preamble — user query runs below ──────────────────────────────────
`.trimStart();
