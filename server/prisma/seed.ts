import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Refactored GRC Database Seeding (20 Employees & Global Assets)...');

  // Clean existing tables
  await prisma.ticket.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.policyAcknowledgement.deleteMany({});
  await prisma.policy.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.auditFinding.deleteMany({});
  await prisma.audit.deleteMany({});
  await prisma.control.deleteMany({});
  await prisma.risk.deleteMany({});
  await prisma.assetAssignmentLog.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create System Users
  console.log('👤 Creating System Users...');
  const users = [
    { email: 'admin@enterprise.grc', name: 'System Administrator', role: 'ADMINISTRATOR', department: 'IT Operations' },
    { email: 'hr@enterprise.grc', name: 'Sarah HR Manager', role: 'HR', department: 'Human Resources' },
    { email: 'it@enterprise.grc', name: 'David IT Lead', role: 'IT', department: 'IT Operations' },
    { email: 'compliance@enterprise.grc', name: 'Elena Compliance Lead', role: 'COMPLIANCE_OFFICER', department: 'Legal & Compliance' },
    { email: 'risk@enterprise.grc', name: 'Robert Risk Manager', role: 'RISK_MANAGER', department: 'Cybersecurity' },
    { email: 'auditor@enterprise.grc', name: 'Arthur Auditor', role: 'AUDITOR', department: 'Legal & Compliance' },
    { email: 'readonly@enterprise.grc', name: 'Guest Viewer', role: 'READ_ONLY', department: 'Executive Leadership' },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        department: u.department,
      },
    });
  }

  // 2. Create EXACTLY 20 Employees in a 4-Tier Tree Hierarchy
  console.log('👥 Creating 20 Employees with 4-tier tree hierarchy...');

  // Tier 1: CEO
  const ceo = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1001',
      firstName: 'Victoria',
      lastName: 'Vance',
      email: 'victoria.vance@enterprise.grc',
      phone: '+1 (555) 010-1001',
      department: 'Executive Leadership',
      designation: 'Chief Executive Officer',
      joiningDate: '2020-01-15',
      officeLocation: 'Headquarters (New York)',
      skills: JSON.stringify(['Executive Leadership', 'Strategic Governance', 'Risk Management']),
      riskScore: 8,
      employmentStatus: 'FULL_TIME',
    },
  });

  // Tier 2: CTO, CISO, CFO (Report to CEO)
  const cto = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1002',
      firstName: 'Marcus',
      lastName: 'Sterling',
      email: 'marcus.sterling@enterprise.grc',
      phone: '+1 (555) 010-1002',
      department: 'Executive Leadership',
      designation: 'Chief Technology Officer',
      managerId: ceo.id,
      managerName: 'Victoria Vance',
      joiningDate: '2020-03-01',
      officeLocation: 'Headquarters (New York)',
      skills: JSON.stringify(['Cloud Architecture', 'Infrastructure', 'IT Strategy']),
      riskScore: 12,
      employmentStatus: 'FULL_TIME',
    },
  });

  const ciso = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1003',
      firstName: 'Helena',
      lastName: 'Blackwood',
      email: 'helena.blackwood@enterprise.grc',
      phone: '+1 (555) 010-1003',
      department: 'Executive Leadership',
      designation: 'Chief Information Security Officer',
      managerId: ceo.id,
      managerName: 'Victoria Vance',
      joiningDate: '2020-04-10',
      officeLocation: 'Headquarters (New York)',
      skills: JSON.stringify(['Cybersecurity', 'ISO 27001', 'Threat Intelligence']),
      riskScore: 15,
      employmentStatus: 'FULL_TIME',
    },
  });

  const cfo = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1004',
      firstName: 'Arthur',
      lastName: 'Pendelton',
      email: 'arthur.pendelton@enterprise.grc',
      phone: '+1 (555) 010-1004',
      department: 'Executive Leadership',
      designation: 'Chief Financial Officer',
      managerId: ceo.id,
      managerName: 'Victoria Vance',
      joiningDate: '2021-02-01',
      officeLocation: 'Headquarters (New York)',
      skills: JSON.stringify(['Financial Governance', 'Audit', 'Risk Analysis']),
      riskScore: 10,
      employmentStatus: 'FULL_TIME',
    },
  });

  // Tier 3: Directors & Managers (Report to Tier 2)
  const vpEng = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1005',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@enterprise.grc',
      department: 'Engineering',
      designation: 'VP of Software Engineering',
      managerId: cto.id,
      managerName: 'Marcus Sterling',
      joiningDate: '2021-05-15',
      officeLocation: 'Headquarters (New York)',
      skills: JSON.stringify(['Software Architecture', 'DevOps', 'Agile']),
      riskScore: 18,
      employmentStatus: 'FULL_TIME',
    },
  });

  const itDir = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1006',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@enterprise.grc',
      department: 'IT Operations',
      designation: 'IT Operations Director',
      managerId: cto.id,
      managerName: 'Marcus Sterling',
      joiningDate: '2021-06-20',
      officeLocation: 'London Tech Hub',
      skills: JSON.stringify(['Network Systems', 'Asset Management', 'Data Centers']),
      riskScore: 22,
      employmentStatus: 'FULL_TIME',
    },
  });

  const secMgr = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1007',
      firstName: 'Robert',
      lastName: 'Chen',
      email: 'robert.chen@enterprise.grc',
      department: 'Cybersecurity',
      designation: 'Security Operations Manager',
      managerId: ciso.id,
      managerName: 'Helena Blackwood',
      joiningDate: '2021-08-01',
      officeLocation: 'San Francisco Innovation Lab',
      skills: JSON.stringify(['Incident Response', 'SIEM', 'SOC Operations']),
      riskScore: 25,
      employmentStatus: 'FULL_TIME',
    },
  });

  const compOfficer = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1008',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@enterprise.grc',
      department: 'Legal & Compliance',
      designation: 'Lead Compliance Officer',
      managerId: ciso.id,
      managerName: 'Helena Blackwood',
      joiningDate: '2022-01-10',
      officeLocation: 'Headquarters (New York)',
      skills: JSON.stringify(['ISO 27001', 'SOC 2', 'NIST CSF']),
      riskScore: 14,
      employmentStatus: 'FULL_TIME',
    },
  });

  const hrLead = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-1009',
      firstName: 'Rachel',
      lastName: 'Green',
      email: 'rachel.green@enterprise.grc',
      department: 'Human Resources',
      designation: 'Head of Human Resources',
      managerId: cfo.id,
      managerName: 'Arthur Pendelton',
      joiningDate: '2022-02-15',
      officeLocation: 'Headquarters (New York)',
      skills: JSON.stringify(['People Ops', 'Talent', 'Compliance']),
      riskScore: 10,
      employmentStatus: 'FULL_TIME',
    },
  });

  // Tier 4: Individual Contributors & Engineers (11 Employees -> Total 20)
  const tier4 = [
    { code: 'EMP-1010', fn: 'Lucas', ln: 'Vance', dept: 'Engineering', desig: 'Senior Infrastructure Lead', mgr: vpEng },
    { code: 'EMP-1011', fn: 'Maya', ln: 'Lin', dept: 'Engineering', desig: 'Backend Engineering Lead', mgr: vpEng },
    { code: 'EMP-1012', fn: 'Oliver', ln: 'Wright', dept: 'Engineering', desig: 'DevOps Architect', mgr: vpEng },
    { code: 'EMP-1013', fn: 'Sophia', ln: 'Alvarez', dept: 'Engineering', desig: 'QA Lead Engineer', mgr: vpEng },
    { code: 'EMP-1014', fn: 'Ethan', ln: 'Hawke', dept: 'IT Operations', desig: 'Senior Systems Administrator', mgr: itDir },
    { code: 'EMP-1015', fn: 'Chloe', ln: 'Bennett', dept: 'IT Operations', desig: 'Network Infrastructure Engineer', mgr: itDir },
    { code: 'EMP-1016', fn: 'Gabriel', ln: 'Santos', dept: 'Cybersecurity', desig: 'Senior Threat Analyst', mgr: secMgr },
    { code: 'EMP-1017', fn: 'Naomi', ln: 'Campbell', dept: 'Cybersecurity', desig: 'Penetration Tester & Ethical Hacker', mgr: secMgr },
    { code: 'EMP-1018', fn: 'Benjamin', ln: 'Franklin', dept: 'Legal & Compliance', desig: 'Senior Regulatory Analyst', mgr: compOfficer },
    { code: 'EMP-1019', fn: 'Zoe', ln: 'Kravitz', dept: 'Human Resources', desig: 'HR Specialist & Onboarding Lead', mgr: hrLead },
    { code: 'EMP-1020', fn: 'Xavier', ln: 'Woods', dept: 'Finance & Accounting', desig: 'Financial Audit Analyst', mgr: cfo },
  ];

  const allEmployees = [ceo, cto, ciso, cfo, vpEng, itDir, secMgr, compOfficer, hrLead];

  for (const t4 of tier4) {
    const emp = await prisma.employee.create({
      data: {
        employeeCode: t4.code,
        firstName: t4.fn,
        lastName: t4.ln,
        email: `${t4.fn.toLowerCase()}.${t4.ln.toLowerCase()}@enterprise.grc`,
        phone: `+1 (555) 010-${t4.code.split('-')[1]}`,
        department: t4.dept,
        designation: t4.desig,
        managerId: t4.mgr.id,
        managerName: `${t4.mgr.firstName} ${t4.mgr.lastName}`,
        joiningDate: '2023-01-10',
        officeLocation: 'Headquarters (New York)',
        skills: JSON.stringify(['Cybersecurity', 'Infrastructure', 'Node.js', 'System Admin']),
        riskScore: Math.floor(Math.random() * 40) + 10,
        employmentStatus: 'FULL_TIME',
      },
    });
    allEmployees.push(emp);
  }

  // 3. Create Global Assets & Individual Assets
  console.log('💻 Creating Global Infrastructure Assets & Individual Assets...');

  // Global Shared Assets (Printers, Main Enterprise Firewalls, Global Servers)
  const globalAssets = [
    { name: 'Enterprise Central Multifunction Printer', tag: 'AST-GLOB-01', cat: 'PRINTER', sn: 'SN-GLOB-PRINT-01', loc: 'Headquarters Floor 4', cost: 4500 },
    { name: 'Global Executive Conference Printer', tag: 'AST-GLOB-02', cat: 'PRINTER', sn: 'SN-GLOB-PRINT-02', loc: 'Executive Boardroom', cost: 3200 },
    { name: 'Primary Enterprise Perimeter Firewall Palo Alto PA-5250', tag: 'AST-GLOB-03', cat: 'FIREWALL', sn: 'SN-PA5250-9081', loc: 'NY Data Center Rack 1', cost: 45000, risk: 65 },
    { name: 'Backup Core Firewall Fortinet FortiGate-3000F', tag: 'AST-GLOB-04', cat: 'FIREWALL', sn: 'SN-FG3000-1102', loc: 'London Data Center Rack 2', cost: 38000, risk: 30 },
    { name: 'Global Active Directory & LDAP Core Controller Server', tag: 'AST-GLOB-05', cat: 'SERVER', sn: 'SN-DELL-R750-AD01', loc: 'Primary Data Center', cost: 18500, risk: 50 },
    { name: 'Global Production Database Cluster (PostgreSQL Primary)', tag: 'AST-GLOB-06', cat: 'DATABASE', sn: 'SN-DELL-R750-DB01', loc: 'Primary Data Center', cost: 24000, risk: 55 },
  ];

  for (const ga of globalAssets) {
    await prisma.asset.create({
      data: {
        assetTag: ga.tag,
        name: ga.name,
        category: ga.cat,
        serialNumber: ga.sn,
        purchaseDate: '2023-01-01',
        warrantyExpiry: '2028-12-31',
        status: 'AVAILABLE',
        riskScore: ga.risk || 15,
        complianceStatus: 'COMPLIANT',
        location: ga.loc,
        cost: ga.cost,
        isGlobal: true,
      },
    });
  }

  // Individual Employee Assets (Laptops, Mobile Devices, VPN Keys)
  for (let i = 0; i < allEmployees.length; i++) {
    const emp = allEmployees[i];
    await prisma.asset.create({
      data: {
        assetTag: `AST-LAP-${2001 + i}`,
        name: `${emp.firstName}'s MacBook Pro M3 Max`,
        category: 'LAPTOP',
        serialNumber: `SN-MBP-M3-${3000 + i}`,
        purchaseDate: '2023-06-15',
        warrantyExpiry: '2026-06-15',
        status: 'ASSIGNED',
        riskScore: Math.floor(Math.random() * 30) + 10,
        complianceStatus: 'COMPLIANT',
        assignedEmployeeId: emp.id,
        department: emp.department,
        cost: 3400,
        isGlobal: false,
      },
    });
  }

  // 4. Create Sample Security/IT Tickets for Ticket Raise Module
  console.log('🎫 Creating GRC & IT Service Tickets...');
  const tickets = [
    { code: 'TCK-2026-01', title: 'Request for AWS Production Environment Access', desc: 'Need IAM role read access to production S3 buckets for compliance audit.', cat: 'IT_ACCESS', prio: 'HIGH', status: 'IN_PROGRESS', rep: 'Elena Rostova', assign: 'David Miller' },
    { code: 'TCK-2026-02', title: 'Phishing Email Investigation - Suspicious Link', desc: 'Employee reported suspicious login prompt from impersonated Office 365 domain.', cat: 'SECURITY_INCIDENT', prio: 'CRITICAL', status: 'OPEN', rep: 'Gabriel Santos', assign: 'Robert Chen' },
    { code: 'TCK-2026-03', title: 'Hardware Asset Request: Ergonomic Dual Monitor', desc: 'Developer requesting secondary 4K monitor setup for engineering workstation.', cat: 'ASSET_REQUEST', prio: 'LOW', status: 'RESOLVED', rep: 'Lucas Vance', assign: 'Ethan Hawke' },
    { code: 'TCK-2026-04', title: 'ISO 27001 Statement of Applicability Review Query', desc: 'Review requested on Annex A.8.1 physical security control implementation.', cat: 'COMPLIANCE_QUERY', prio: 'MEDIUM', status: 'OPEN', rep: 'Benjamin Franklin', assign: 'Elena Rostova' },
  ];

  for (const t of tickets) {
    await prisma.ticket.create({
      data: {
        ticketCode: t.code,
        title: t.title,
        description: t.desc,
        category: t.cat,
        priority: t.prio,
        status: t.status,
        reporter: t.rep,
        assignedTo: t.assign,
      },
    });
  }

  // 5. Create Audits for Audit Analyzer
  console.log('🔍 Creating Sample Audits...');
  const audit1 = await prisma.audit.create({
    data: {
      auditCode: 'AUD-2026-ISO-01',
      title: 'ISO 27001:2022 Annual Surveillance & Information Security Audit',
      scope: 'Enterprise Infrastructure, Data Centers, IAM Access, Encryption & Incident Management',
      framework: 'ISO 27001',
      leadAuditor: 'Arthur Auditor',
      startDate: '2026-01-10',
      endDate: '2026-01-25',
      status: 'UNDER_REVIEW',
      approvalStatus: 'PENDING',
    },
  });

  await prisma.auditFinding.createMany({
    data: [
      {
        auditId: audit1.id,
        title: 'MFA Enforcement Exemption on Staging VPN Endpoint',
        description: 'Staging environment VPN gateway lacks mandatory MFA enforcement for 3 external contractor accounts.',
        severity: 'MAJOR',
        correctiveAction: 'Enforce SSO MFA policies across all staging and UAT VPN gateways immediately.',
        dueDate: '2026-02-28',
        status: 'OPEN',
      },
      {
        auditId: audit1.id,
        title: 'Quarterly Access Rights Review Log Delay',
        description: 'Q4 2025 privilege access review sign-off was completed 14 days past the scheduled deadline.',
        severity: 'MINOR',
        correctiveAction: 'Automate quarterly privilege access review reminders via GRC Ticket engine.',
        dueDate: '2026-03-15',
        status: 'IN_PROGRESS',
      },
    ],
  });

  // 6. Create Risk Register Items
  console.log('⚠️ Creating Risks...');
  await prisma.risk.createMany({
    data: [
      {
        riskId: 'RSK-1001',
        title: 'Unencrypted Data Transmission on Legacy API Endpoint',
        description: 'Internal microservice API transmits telemetry data over HTTP without TLS 1.3 encryption.',
        likelihood: 4,
        impact: 4,
        score: 16,
        category: 'Cybersecurity',
        owner: 'Helena Blackwood',
        status: 'OPEN',
        mitigationPlan: 'Upgrade legacy endpoints to enforce HTTPS/TLS 1.3.',
      },
      {
        riskId: 'RSK-1002',
        title: 'Third-Party SaaS Vendor Security Assessment Gap',
        description: 'Vendor Security questionnaires missing for 2 SaaS tools used in marketing.',
        likelihood: 3,
        impact: 3,
        score: 9,
        category: 'Vendor Management',
        owner: 'Elena Rostova',
        status: 'IN_REVIEW',
        mitigationPlan: 'Conduct vendor risk assessment questionnaire prior to contract renewal.',
      },
    ],
  });

  console.log('✅ Enterprise GRC Database Seeding Completed (20 Employees, Global Assets, Tickets, Audits)!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
