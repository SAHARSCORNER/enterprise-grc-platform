// Roles and Access Control
export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  HR = 'HR',
  IT = 'IT',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  RISK_MANAGER = 'RISK_MANAGER',
  AUDITOR = 'AUDITOR',
  READ_ONLY = 'READ_ONLY',
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'approve';
export type ModuleName =
  | 'dashboard'
  | 'employees'
  | 'assets'
  | 'risks'
  | 'compliance'
  | 'audits'
  | 'vendors'
  | 'incidents'
  | 'policies'
  | 'audit_logs'
  | 'ai_assistant'
  | 'reports'
  | 'tickets'
  | 'settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

// Employee Domain
export enum EmploymentStatus {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTOR = 'CONTRACTOR',
  INTERN = 'INTERN',
  TERMINATED = 'TERMINATED',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  managerId?: string;
  managerName?: string;
  employmentStatus: EmploymentStatus;
  joiningDate: string;
  terminationDate?: string;
  officeLocation: string;
  skills: string[];
  assignedAssetCount?: number;
  assignedAssets?: Asset[];
  riskScore: number; // 0 - 100
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Asset Domain
export enum AssetCategory {
  LAPTOP = 'LAPTOP',
  DESKTOP = 'DESKTOP',
  SERVER = 'SERVER',
  FIREWALL = 'FIREWALL',
  VPN = 'VPN',
  DATABASE = 'DATABASE',
  MOBILE = 'MOBILE',
  SOFTWARE_LICENSE = 'SOFTWARE_LICENSE',
  CLOUD_RESOURCE = 'CLOUD_RESOURCE',
  PRINTER = 'PRINTER',
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  EXEMPT = 'EXEMPT',
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: AssetStatus;
  riskScore: number; // 0-100
  complianceStatus: ComplianceStatus;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedEmployeeEmail?: string;
  department?: string;
  barcodeDataUrl?: string;
  qrCodeDataUrl?: string;
  specifications?: Record<string, any>;
  cost?: number;
  location?: string;
  isGlobal?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Ticket Domain
export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketCategory {
  IT_ACCESS = 'IT_ACCESS',
  SECURITY_INCIDENT = 'SECURITY_INCIDENT',
  ASSET_REQUEST = 'ASSET_REQUEST',
  COMPLIANCE_QUERY = 'COMPLIANCE_QUERY',
}

export interface Ticket {
  id: string;
  ticketCode: string;
  title: string;
  description: string;
  category: TicketCategory | string;
  priority: TicketPriority;
  status: TicketStatus;
  reporter: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetAssignmentLog {
  id: string;
  assetId: string;
  employeeId: string;
  employeeName: string;
  assignedAt: string;
  unassignedAt?: string;
  assignedBy: string;
  notes?: string;
}

// Risk Management Domain
export enum RiskLikelihood {
  VERY_LOW = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  VERY_HIGH = 5,
}

export enum RiskImpact {
  INSIGNIFICANT = 1,
  MINOR = 2,
  MODERATE = 3,
  MAJOR = 4,
  CRITICAL = 5,
}

export enum RiskStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  MITIGATED = 'MITIGATED',
  ACCEPTED = 'ACCEPTED',
  CLOSED = 'CLOSED',
}

export interface Risk {
  id: string;
  riskId: string; // e.g. RSK-1001
  title: string;
  description: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  score: number; // likelihood * impact (1..25)
  category: string;
  owner: string;
  ownerEmail?: string;
  status: RiskStatus;
  mitigationPlan?: string;
  relatedAssetIds: string[];
  relatedEmployeeIds: string[];
  relatedDepartments: string[];
  createdAt: string;
  updatedAt: string;
}

// Compliance Domain
export enum FrameworkName {
  ISO_27001 = 'ISO 27001',
  SOC_2 = 'SOC 2',
  NIST_CSF = 'NIST CSF',
  CIS_CONTROLS = 'CIS Controls',
}

export enum ControlStatus {
  IMPLEMENTED = 'IMPLEMENTED',
  PARTIALLY_IMPLEMENTED = 'PARTIALLY_IMPLEMENTED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export interface Control {
  id: string;
  controlCode: string; // e.g. A.5.1
  title: string;
  description: string;
  framework: FrameworkName;
  category: string;
  status: ControlStatus;
  owner: string;
  progress: number; // 0 - 100
  evidenceCount: number;
  policyIds: string[];
  updatedAt: string;
}

export interface FrameworkSummary {
  name: FrameworkName;
  totalControls: number;
  implemented: number;
  inProgress: number;
  notImplemented: number;
  compliancePercentage: number;
}

export interface ComplianceGap {
  controlCode: string;
  title: string;
  framework: FrameworkName;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

// Audit Domain
export enum AuditStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  OBSERVATION = 'OBSERVATION',
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  correctiveAction: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
}

export interface Audit {
  id: string;
  auditCode: string; // AUD-2026-01
  title: string;
  scope: string;
  framework: FrameworkName | 'INTERNAL';
  leadAuditor: string;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  findings: AuditFinding[];
  evidenceFiles: string[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

// Vendor Domain
export enum VendorRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string;
  contactEmail: string;
  riskScore: number;
  riskLevel: VendorRiskLevel;
  securityQuestionnaireCompleted: boolean;
  contractExpiryDate: string;
  certificates: { name: string; expiryDate: string }[];
  complianceDocuments: string[];
  createdAt: string;
  updatedAt: string;
}

// Incident Domain
export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  MITIGATED = 'MITIGATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface Incident {
  id: string;
  incidentCode: string; // INC-2026-001
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  owner: string;
  reportedAt: string;
  resolvedAt?: string;
  affectedAssetIds: string[];
  affectedEmployeeIds: string[];
  rootCause?: string;
  lessonsLearned?: string;
  createdAt: string;
  updatedAt: string;
}

// Policy Domain
export enum PolicyStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

export interface Policy {
  id: string;
  policyCode: string; // POL-101
  title: string;
  category: string;
  version: string;
  owner: string;
  status: PolicyStatus;
  effectiveDate: string;
  reviewCycleMonths: number;
  nextReviewDate: string;
  acknowledgementCount: number;
  totalRequiredAcknowledgements: number;
  fileUrl?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

// Notifications
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  module: ModuleName;
  read: boolean;
  timestamp: string;
  linkUrl?: string;
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: ModuleName;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent?: string;
}

// Dashboard KPIs
export interface ExecutiveDashboardKPIs {
  totalEmployees: number;
  totalAssets: number;
  highRiskAssetsCount: number;
  compliancePercentage: number;
  openRisksCount: number;
  pendingAuditsCount: number;
  activeIncidentsCount: number;
  activeVendorsCount: number;
  recentActivities: AuditLogEntry[];
  riskTrend: { date: string; low: number; medium: number; high: number }[];
  complianceTrend: { month: string; percentage: number }[];
  assetCategoryDistribution: { category: string; count: number }[];
}

// WebSockets Socket.IO Events
export enum SocketEvents {
  EMPLOYEE_CREATED = 'employee:created',
  EMPLOYEE_UPDATED = 'employee:updated',
  EMPLOYEE_DELETED = 'employee:deleted',
  EMPLOYEE_ARCHIVED = 'employee:archived',
  EMPLOYEE_RESTORED = 'employee:restored',
  EMPLOYEE_MANAGER_CHANGED = 'employee:manager_changed',
  EMPLOYEE_DUPLICATED = 'employee:duplicated',
  EMPLOYEE_BULK_IMPORTED = 'employee:bulk_imported',
  
  ASSET_CREATED = 'asset:created',
  ASSET_UPDATED = 'asset:updated',
  ASSET_DELETED = 'asset:deleted',
  ASSET_ASSIGNED = 'asset:assigned',
  ASSET_REMOVED = 'asset:removed',
  
  RISK_CREATED = 'risk:created',
  RISK_UPDATED = 'risk:updated',
  RISK_DELETED = 'risk:deleted',
  
  COMPLIANCE_UPDATED = 'compliance:updated',
  
  AUDIT_CREATED = 'audit:created',
  AUDIT_UPDATED = 'audit:updated',
  AUDIT_COMPLETED = 'audit:completed',
  
  VENDOR_CREATED = 'vendor:created',
  VENDOR_UPDATED = 'vendor:updated',
  
  INCIDENT_CREATED = 'incident:created',
  INCIDENT_UPDATED = 'incident:updated',
  INCIDENT_CLOSED = 'incident:closed',
  
  POLICY_CREATED = 'policy:created',
  POLICY_APPROVED = 'policy:approved',
  POLICY_EXPIRED = 'policy:expired',
  
  NOTIFICATION_NEW = 'notification:new',
  AUDIT_LOG_NEW = 'audit_log:new',
  
  TICKET_CREATED = 'ticket:created',
  TICKET_UPDATED = 'ticket:updated',
  TICKET_DELETED = 'ticket:deleted',
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// React Flow Network Graph Nodes & Edges
export interface NetworkNodeData {
  label: string;
  type: 'department' | 'employee' | 'asset' | 'manager';
  code?: string;
  role?: string;
  category?: string;
  riskScore?: number;
  status?: string;
  avatarUrl?: string;
  details?: Record<string, any>;
}

export interface NetworkEdgeData {
  relationship: 'MANAGES' | 'OWNS' | 'ASSIGNED_TO' | 'BELONGS_TO';
  animated?: boolean;
}
