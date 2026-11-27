export type CaseStatus =
  | 'submitted'
  | 'reviewing'
  | 'needs_information'
  | 'approved'
  | 'submitted_to_platform'
  | 'action_taken'
  | 'resolved'
  | 'rejected'
  | 'disputed'
  | 'closed';

export type ComplaintType =
  | 'copyright'
  | 'privacy'
  | 'impersonation'
  | 'harassment'
  | 'deepfake'
  | 'extortion'
  | 'other';

export type EvidenceCategory =
  | 'screenshot'
  | 'ownership_proof'
  | 'identity'
  | 'correspondence'
  | 'threat_log';

export interface EvidenceItem {
  id: string;
  title: string;
  category: EvidenceCategory;
  reference_url?: string;
  file_name?: string;
  sha256_preview?: string;
  has_encrypted_file?: boolean;
  mime_type?: string;
  file_size_bytes?: number;
  notes?: string;
  uploaded_by_role: 'customer' | 'staff';
  uploaded_by_email: string;
  created_at: string;
}

export interface CaseActivityItem {
  id: string;
  activity_type: string;
  message: string;
  visibility: 'customer' | 'staff';
  created_at: string;
}

export interface CaseMessageItem {
  id: string;
  sender_role: 'customer' | 'staff';
  sender_email: string;
  message: string;
  created_at: string;
}

export interface PlatformSubmissionItem {
  id: string;
  platform: string;
  submission_channel: 'web_form' | 'email' | 'platform_portal' | 'api' | 'other';
  status:
    | 'prepared'
    | 'submitted'
    | 'acknowledged'
    | 'under_review'
    | 'action_taken'
    | 'rejected'
    | 'disputed'
    | 'withdrawn';
  external_reference?: string;
  response_summary?: string;
  submitted_at: string;
}

export interface VerificationCheckItem {
  id: string;
  result:
    | 'confirmed_removed'
    | 'still_accessible'
    | 'redirected'
    | 'login_required'
    | 'not_found_unclear';
  checked_url: string;
  notes?: string;
  checked_at: string;
}

export interface ProtectionCase {
  id: string;
  case_number: string;
  customer_email: string;
  customer_name: string;
  title: string;
  platform: string;
  source_url: string;
  complaint_type: ComplaintType;
  description: string;
  status: CaseStatus;
  service_code?: string;
  assigned_to?: string;
  submitted_at: string;
  updated_at: string;
  monitoring_enabled?: boolean;
  last_monitored_at?: string;
  mirrors?: MirrorLinkItem[];
  evidence?: EvidenceItem[];
  activity: CaseActivityItem[];
  messages: CaseMessageItem[];
  submissions: PlatformSubmissionItem[];
  verifications: VerificationCheckItem[];
}

export interface MirrorLinkItem {
  id: string;
  url: string;
  platform?: string;
  status: 'active' | 'removed' | 'pending';
  checked_at?: string;
}

export interface MirrorSummary {
  total: number;
  removed: number;
  active: number;
  pending: number;
}

export type InquiryStatus = 'new' | 'reviewed' | 'converted' | 'archived';

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  language: string;
  status?: InquiryStatus;
  converted_case_id?: string;
  created_at: string;
}

export interface ServicePackage {
  code: string;
  name: string;
  description: string;
  priceUsd: number;
  unitLabel: string;
  slaHours: number;
  badge?: string;
  featured?: boolean;
  ctaLabel: string;
  features: string[];
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  case_id: string;
  case_number: string;
  customer_email: string;
  service_code: string;
  service_name: string;
  amount_usd: number;
  status: 'unpaid' | 'pending_review' | 'paid';
  created_at: string;
}

export interface PaymentSubmission {
  id: string;
  invoice_id: string;
  invoice_number: string;
  customer_email: string;
  method: 'bank_transfer' | 'cash' | 'manual' | 'card_gateway';
  reference: string;
  amount_usd: number;
  status: 'pending_review' | 'approved' | 'rejected';
  whatsapp_status?: 'none' | 'opened' | 'sent_confirmed';
  admin_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
}

export type PlatformRoleName =
  | 'operations_admin'
  | 'case_manager'
  | 'support_agent'
  | 'privacy_officer'
  | 'auditor';

export interface PlatformRoleRecord {
  id: string;
  email: string;
  role: PlatformRoleName;
  status: 'active' | 'suspended';
  granted_by: string;
  created_at: string;
}

export interface AuditEventRecord {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  organization_name: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface VisitorSessionRecord {
  id: string;
  visitor_key: string;
  session_key: string;
  ip_address: string;
  country_code: string;
  region: string;
  city: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  operating_system: string;
  referrer_domain: string;
  landing_page: string;
  last_page: string;
  page_views: number;
  inquiry_submitted: boolean;
  started_at: string;
  last_seen_at: string;
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    code: 'fake_website',
    name: 'Fake Website & Brand Impersonation Removal',
    description:
      'Protect your business from fraudulent websites, cloned pages and fake online stores using your company name, branding or identity to mislead customers.',
    priceUsd: 1500,
    unitLabel: '/ case',
    slaHours: 48,
    ctaLabel: 'Request website removal',
    features: [
      'Website and impersonation evidence review',
      'Documentation of brand misuse and customer deception',
      'Preparation of targeted abuse and hosting-provider reports',
      'Submission coordination and follow-up',
    ],
  },
  {
    code: 'deepfake_video',
    name: 'Deepfake & AI-Generated Video Removal',
    description:
      'Respond to videos that misuse your face, voice or likeness without permission. We help identify reported copies, organize evidence and prepare removal requests for the platforms hosting them.',
    priceUsd: 1000,
    unitLabel: '/ case',
    slaHours: 24,
    badge: 'Specialist review',
    featured: true,
    ctaLabel: 'Discuss deepfake removal',
    features: [
      'Review of reported videos, links and available evidence',
      'Documentation of unauthorized likeness or voice use',
      'Platform-specific reporting and removal requests',
      'Follow-up and outcome updates',
    ],
  },
  {
    code: 'copyright_protection',
    name: 'Copyright & Content Protection',
    description:
      'Take action when your original work is copied, republished, distributed or used without authorization. We help organize ownership evidence and prepare copyright-related removal requests.',
    priceUsd: 900,
    unitLabel: '/ case',
    slaHours: 72,
    ctaLabel: 'Protect my content',
    features: [
      'Review of the original work and reported use',
      'Ownership and infringement evidence checklist',
      'Preparation of copyright complaint materials',
      'Submission follow-up and status updates',
    ],
  },
  {
    code: 'news_reputation',
    name: 'News Article Removal & Reputation Support',
    description:
      'Explore appropriate options for an online news article affecting you or your business. Depending on the facts, possible routes may include a publisher correction, update, anonymization, removal request or search-result de-indexing request.',
    priceUsd: 1400,
    unitLabel: '/ case',
    slaHours: 96,
    ctaLabel: 'Review my article',
    features: [
      'Article and publisher review',
      'Assessment of available correction or removal routes',
      'Preparation of a documented publisher or search-platform request',
      'Follow-up and progress reporting',
    ],
  },
  {
    code: 'image_removal',
    name: 'Image Removal',
    description:
      'Request the removal of an unauthorized or infringing image published on a website or platform. Each request is reviewed individually and supported with relevant evidence and direct URLs.',
    priceUsd: 100,
    unitLabel: '/ image',
    slaHours: 48,
    ctaLabel: 'Request image removal',
    features: [
      'Single-image case review',
      'Evidence and URL assessment',
      'Platform reporting and follow-up',
    ],
  },
  {
    code: 'impostor_account',
    name: 'Impostor Account Removal',
    description:
      'Request action against fake profiles or accounts impersonating you, your business or your brand. We help document the impersonation and prepare the appropriate platform reports.',
    priceUsd: 150,
    unitLabel: '/ account',
    slaHours: 48,
    ctaLabel: 'Request account removal',
    features: [
      'Impersonation evidence review',
      'Account and profile reporting',
      'Follow-up and outcome updates',
    ],
  },
  {
    code: 'video_extortion',
    name: 'Video Takedown (Extortion/Blackmail)',
    description:
      'Request removal of recorded videos shared without authorization, including cases involving extortion, blackmail or demands for money. We help organize the evidence and coordinate platform reports and follow-up.',
    priceUsd: 1000,
    unitLabel: '/ case',
    slaHours: 12,
    badge: 'Priority escalation',
    featured: true,
    ctaLabel: 'Discuss video takedown',
    features: [
      'Review of video links and evidence',
      'Support documenting extortion or blackmail demands',
      'Platform reporting coordination and follow-up',
    ],
  },
  {
    code: 'page_takedown',
    name: 'Page Takedown',
    description:
      'Request the removal of an unauthorized or infringing webpage or page published across relevant platforms. We assess the reported page and help prepare evidence-backed reports.',
    priceUsd: 1250,
    unitLabel: '/ case',
    slaHours: 72,
    ctaLabel: 'Request page takedown',
    features: [
      'Page and infringement assessment',
      'Evidence-backed platform reports',
      'Follow-up across relevant platforms',
    ],
  },
];

export type CaseActionType =
  | 'start_review'
  | 'request_information'
  | 'approve'
  | 'reject'
  | 'mark_submitted'
  | 'mark_action_taken'
  | 'resolve'
  | 'close'
  | 'reopen_dispute';

export const CASE_ACTION_LABELS: Record<CaseActionType, string> = {
  start_review: 'Start review',
  request_information: 'Request information',
  approve: 'Approve',
  reject: 'Reject',
  mark_submitted: 'Mark submitted to platform',
  mark_action_taken: 'Record platform action',
  resolve: 'Mark resolved',
  close: 'Close case',
  reopen_dispute: 'Reopen as disputed',
};

const CASE_TRANSITIONS: Record<CaseStatus, CaseActionType[]> = {
  submitted: ['start_review', 'request_information', 'approve', 'reject'],
  reviewing: ['request_information', 'approve', 'reject'],
  needs_information: ['start_review', 'reject'],
  approved: ['mark_submitted', 'request_information', 'reject'],
  submitted_to_platform: ['mark_action_taken', 'request_information', 'reject'],
  action_taken: ['resolve', 'request_information'],
  resolved: ['close', 'reopen_dispute'],
  rejected: ['close', 'reopen_dispute'],
  disputed: ['start_review', 'close'],
  closed: [],
};

const ACTION_TARGET_STATUS: Record<CaseActionType, CaseStatus> = {
  start_review: 'reviewing',
  request_information: 'needs_information',
  approve: 'approved',
  reject: 'rejected',
  mark_submitted: 'submitted_to_platform',
  mark_action_taken: 'action_taken',
  resolve: 'resolved',
  close: 'closed',
  reopen_dispute: 'disputed',
};

export function getNextCaseActions(status: CaseStatus): { action: CaseActionType; label: string }[] {
  const actions = CASE_TRANSITIONS[status] || [];
  return actions.map((action) => ({
    action,
    label: CASE_ACTION_LABELS[action],
  }));
}

export function applyCaseTransition(
  currentStatus: CaseStatus,
  action: CaseActionType
): CaseStatus | null {
  const allowed = CASE_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(action)) {
    return null;
  }
  return ACTION_TARGET_STATUS[action];
}

export function formatStatusLabel(status: string): string {
  return String(status || 'submitted').replaceAll('_', ' ');
}

export function formatCurrencyUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getServiceByCode(code: string): ServicePackage | undefined {
  return SERVICE_PACKAGES.find((pkg) => pkg.code === code);
}

export type SlaHealth = 'on_track' | 'due_soon' | 'overdue' | 'completed';

export function computeCaseSla(
  c: Pick<ProtectionCase, 'status' | 'complaint_type' | 'service_code' | 'submitted_at'>,
  nowMs: number = Date.now()
): {
  health: SlaHealth;
  targetHours: number;
  elapsedHours: number;
  remainingHours: number;
  label: string;
} {
  if (c.status === 'resolved' || c.status === 'closed' || c.status === 'rejected') {
    const startMs = new Date(c.submitted_at).getTime();
    const elapsedHours = Math.max(1, Math.round((nowMs - startMs) / 3600000));
    return {
      health: 'completed',
      targetHours: 48,
      elapsedHours,
      remainingHours: 0,
      label: 'Closed / completed',
    };
  }

  if (c.status === 'submitted_to_platform' || c.status === 'action_taken') {
    const startMs = new Date(c.submitted_at).getTime();
    const elapsedHours = Math.max(1, Math.round((nowMs - startMs) / 3600000));
    return {
      health: 'on_track',
      targetHours: 72,
      elapsedHours,
      remainingHours: 48,
      label: 'With platform queue',
    };
  }

  const pkg = c.service_code ? getServiceByCode(c.service_code) : undefined;
  let targetHours = pkg?.slaHours ?? 48;
  if (c.complaint_type === 'extortion') targetHours = Math.min(targetHours, 12);
  if (c.complaint_type === 'deepfake') targetHours = Math.min(targetHours, 24);

  const startMs = new Date(c.submitted_at).getTime();
  const elapsedHours = Math.max(0, Math.round((nowMs - startMs) / 3600000));
  const remainingHours = targetHours - elapsedHours;

  if (remainingHours < 0) {
    return {
      health: 'overdue',
      targetHours,
      elapsedHours,
      remainingHours,
      label: `${Math.abs(remainingHours)}h overdue`,
    };
  }
  if (remainingHours <= Math.max(6, Math.round(targetHours * 0.25))) {
    return {
      health: 'due_soon',
      targetHours,
      elapsedHours,
      remainingHours,
      label: `${remainingHours}h remaining`,
    };
  }
  return {
    health: 'on_track',
    targetHours,
    elapsedHours,
    remainingHours,
    label: `${remainingHours}h SLA window`,
  };
}

export type TriageIssueCategory =
  | 'impostor_account'
  | 'fake_website'
  | 'deepfake_video'
  | 'video_extortion'
  | 'image_removal'
  | 'copyright_protection'
  | 'news_reputation'
  | 'page_takedown';

export function evaluateCaseReadiness(input: {
  issueCategory: TriageIssueCategory;
  platform: string;
  hasDirectUrl: boolean;
  hasOwnershipOrId: boolean;
  activeExtortionThreat: boolean;
}): {
  recommendedPackage: ServicePackage;
  readinessScore: number;
  escalationChannel: string;
  turnaroundLabel: string;
  checklist: string[];
} {
  const pkg =
    getServiceByCode(input.issueCategory) || SERVICE_PACKAGES[0];
  let score = 35;
  if (input.hasDirectUrl) score += 30;
  if (input.hasOwnershipOrId) score += 25;
  if (input.platform.trim().length >= 2) score += 10;

  const urgent = input.activeExtortionThreat || input.issueCategory === 'video_extortion';
  const turnaroundHours = urgent ? 12 : pkg.slaHours;

  const channelMap: Record<string, string> = {
    Instagram: 'Meta Rights & Impersonation Queue',
    Facebook: 'Meta IP & Privacy Operations Desk',
    TikTok: 'TikTok Trust & Safety Counter-Abuse Portal',
    YouTube: 'Google / YouTube Legal & Privacy Removal Flow',
    'Website / Domain': 'Registrar WHOIS Abuse & Upstream Host Legal Notice',
    Google: 'Search De-indexing & Publisher Escalation',
  };
  const escalationChannel =
    channelMap[input.platform] || `${input.platform || 'Platform'} Official Trust & Abuse Channel`;

  const checklist: string[] = [
    input.hasDirectUrl
      ? 'Direct offending URL ready for timestamped archival.'
      : 'Collect exact public URL(s) of the profile, post, or webpage.',
    input.hasOwnershipOrId
      ? 'Identity or ownership proof verified for submission packet.'
      : 'Prepare government ID, trademark certificate, or original media proof.',
  ];

  if (urgent) {
    checklist.push('Preserve threatening messages, handles, and payment demands without altering timestamps.');
  } else if (input.issueCategory === 'fake_website') {
    checklist.push('Capture domain WHOIS snapshot and legitimate official website URL for contrast.');
  } else if (input.issueCategory === 'deepfake_video') {
    checklist.push('Include unaltered reference footage or official source publication links.');
  } else {
    checklist.push('Document clear visual screenshots showing how the content affects you.');
  }

  return {
    recommendedPackage: pkg,
    readinessScore: Math.min(100, score),
    escalationChannel,
    turnaroundLabel: `${turnaroundHours}h initial triage SLA`,
    checklist,
  };
}

export function computeCaseStats(cases: ProtectionCase[]): {
  total: number;
  inProgress: number;
  resolved: number;
  needsAttention: number;
} {
  let inProgress = 0;
  let resolved = 0;
  let needsAttention = 0;

  for (const item of cases) {
    if (item.status === 'resolved' || item.status === 'closed') {
      resolved += 1;
    } else if (item.status === 'needs_information') {
      needsAttention += 1;
      inProgress += 1;
    } else if (item.status !== 'rejected') {
      inProgress += 1;
    }
  }

  return {
    total: cases.length,
    inProgress,
    resolved,
    needsAttention,
  };
}

export interface WorkspaceSummaryMetrics {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  needsAttentionCases: number;
  rejectedCases: number;
  completionRatePercent: number;
  averageTurnaroundHours: number | null;
  averageTurnaroundLabel: string;
  resolvedAverageHours: number | null;
  resolvedAverageLabel: string;
}

export function formatTurnaroundDuration(hours: number | null): string {
  if (hours === null || Number.isNaN(hours) || !Number.isFinite(hours)) {
    return '—';
  }
  const safeHours = Math.max(0, hours);
  if (safeHours < 1) {
    return '< 1h';
  }
  if (safeHours < 48) {
    return `${safeHours.toFixed(1).replace(/\.0$/, '')}h`;
  }
  const days = Math.floor(safeHours / 24);
  const remHours = Math.round(safeHours % 24);
  if (remHours === 24) {
    return `${days + 1}d`;
  }
  if (remHours === 0) {
    return `${days}d`;
  }
  return `${days}d ${remHours}h`;
}

export function computeWorkspaceSummaryMetrics(
  cases: Pick<ProtectionCase, 'status' | 'submitted_at' | 'updated_at' | 'activity'>[],
  nowMs: number = Date.now()
): WorkspaceSummaryMetrics {
  const stats = computeCaseStats(cases as ProtectionCase[]);
  let rejectedCases = 0;
  let totalTurnaroundHours = 0;
  let validCount = 0;
  let resolvedTurnaroundHours = 0;
  let resolvedCount = 0;

  for (const item of cases) {
    if (item.status === 'rejected') {
      rejectedCases += 1;
    }

    const startMs = new Date(item.submitted_at).getTime();
    if (Number.isNaN(startMs)) continue;

    const isTerminal =
      item.status === 'resolved' || item.status === 'closed' || item.status === 'rejected';

    let endMs = nowMs;
    if (isTerminal) {
      const terminalAct = (item.activity || []).find(
        (a) =>
          a.activity_type === 'resolved' ||
          a.activity_type === 'closed' ||
          a.activity_type === 'rejected'
      );
      const parsedEnd = new Date(terminalAct?.created_at || item.updated_at).getTime();
      endMs = Number.isNaN(parsedEnd) ? nowMs : parsedEnd;
    }

    const durationHours = Math.max(0, (endMs - startMs) / 3600000);
    totalTurnaroundHours += durationHours;
    validCount += 1;

    if (item.status === 'resolved' || item.status === 'closed') {
      resolvedTurnaroundHours += durationHours;
      resolvedCount += 1;
    }
  }

  const averageTurnaroundHours = validCount > 0 ? totalTurnaroundHours / validCount : null;
  const resolvedAverageHours = resolvedCount > 0 ? resolvedTurnaroundHours / resolvedCount : null;
  const completionRatePercent =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return {
    totalCases: stats.total,
    activeCases: stats.inProgress,
    resolvedCases: stats.resolved,
    needsAttentionCases: stats.needsAttention,
    rejectedCases,
    completionRatePercent,
    averageTurnaroundHours,
    averageTurnaroundLabel: formatTurnaroundDuration(averageTurnaroundHours),
    resolvedAverageHours,
    resolvedAverageLabel: formatTurnaroundDuration(resolvedAverageHours),
  };
}

export function filterAndSortCases(
  cases: ProtectionCase[],
  query: string,
  sort: 'newest' | 'oldest' | 'case_az' | 'status' | 'sla_urgent',
  nowMs: number = Date.now()
): ProtectionCase[] {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? cases.filter((c) =>
        [
          c.id,
          c.case_number,
          c.title,
          c.platform,
          c.status,
          c.customer_name,
          c.customer_email,
        ].some((val) => String(val || '').toLowerCase().includes(normalized))
      )
    : [...cases];

  const slaRank = (c: ProtectionCase): number => {
    if (c.status === 'disputed') return 0;
    const sla = computeCaseSla(c, nowMs);
    if (sla.health === 'overdue') return 1;
    if (c.status === 'needs_information') return 2;
    if (sla.health === 'due_soon') return 3;
    if (sla.health === 'on_track') return 4;
    return 5;
  };

  filtered.sort((a, b) => {
    if (sort === 'oldest') {
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    }
    if (sort === 'case_az') {
      return a.case_number.localeCompare(b.case_number);
    }
    if (sort === 'status') {
      return a.status.localeCompare(b.status);
    }
    if (sort === 'sla_urgent') {
      const rankDiff = slaRank(a) - slaRank(b);
      if (rankDiff !== 0) return rankDiff;
      const slaA = computeCaseSla(a, nowMs);
      const slaB = computeCaseSla(b, nowMs);
      if (slaA.remainingHours !== slaB.remainingHours) {
        return slaA.remainingHours - slaB.remainingHours;
      }
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    }
    return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
  });

  return filtered;
}

export function filterAndSortInvoices(
  invoices: InvoiceRecord[],
  query: string,
  sort: 'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'status'
): InvoiceRecord[] {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? invoices.filter((inv) =>
        [inv.invoice_number, inv.case_number, inv.service_name, inv.status].some((val) =>
          String(val || '').toLowerCase().includes(normalized)
        )
      )
    : [...invoices];

  filtered.sort((a, b) => {
    if (sort === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sort === 'amount_high') {
      return b.amount_usd - a.amount_usd;
    }
    if (sort === 'amount_low') {
      return a.amount_usd - b.amount_usd;
    }
    if (sort === 'status') {
      return a.status.localeCompare(b.status);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return filtered;
}

export function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validateInquiryInput(input: {
  name: string;
  email: string;
  interest: string;
  message: string;
  website?: string;
}): { ok: boolean; error?: string } {
  if (input.website && input.website.trim().length > 0) {
    return { ok: false, error: 'Invalid submission.' };
  }
  if (!input.name || input.name.trim().length < 2) {
    return { ok: false, error: 'Please enter your full name.' };
  }
  if (!validateEmail(input.email || '')) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!input.message || input.message.trim().length < 5) {
    return { ok: false, error: 'Please briefly describe how we can help.' };
  }
  return { ok: true };
}

export function validateCaseInput(input: {
  title: string;
  platform: string;
  source_url: string;
}): { ok: boolean; error?: string } {
  if (!input.title || input.title.trim().length < 3) {
    return { ok: false, error: 'Please provide a descriptive case title.' };
  }
  if (!input.platform || input.platform.trim().length < 2) {
    return { ok: false, error: 'Please specify the affected platform or website.' };
  }
  try {
    const parsed = new URL(input.source_url.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, error: 'Content link must start with http:// or https://.' };
    }
  } catch {
    return { ok: false, error: 'Please provide a valid URL to the reported content.' };
  }
  return { ok: true };
}

export function sanitizeCsvCell(value: unknown): string {
  const raw =
    typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
  const trimmed = raw.replace(/\r?\n/g, ' ');
  const safe = /^[=+\-@\t]/.test(trimmed) ? `'${trimmed}` : trimmed;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildCsv(keys: string[], rows: Record<string, unknown>[]): string {
  const header = keys.map((k) => sanitizeCsvCell(k)).join(',');
  const lines = rows.map((row) => keys.map((k) => sanitizeCsvCell(row[k])).join(','));
  return [header, ...lines].join('\r\n');
}

export function computePlatformOverview(input: {
  customerEmails: string[];
  cases: { status: CaseStatus }[];
  tickets: { status: string }[];
  requests: { status: string }[];
  payments: { status: string }[];
}): {
  organizations: number;
  casesTotal: number;
  casesOpen: number;
  supportTotal: number;
  supportOpen: number;
  requestsTotal: number;
  requestsOpen: number;
  pendingPayments: number;
} {
  const casesOpen = input.cases.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed' && c.status !== 'rejected'
  ).length;
  const supportOpen = input.tickets.filter(
    (t) => t.status !== 'resolved' && t.status !== 'closed'
  ).length;
  const requestsOpen = input.requests.filter(
    (r) => r.status !== 'completed' && r.status !== 'rejected'
  ).length;
  const pendingPayments = input.payments.filter((p) => p.status === 'pending_review').length;

  return {
    organizations: new Set(input.customerEmails).size,
    casesTotal: input.cases.length,
    casesOpen,
    supportTotal: input.tickets.length,
    supportOpen,
    requestsTotal: input.requests.length,
    requestsOpen,
    pendingPayments,
  };
}

export type ActivityCategory =
  | 'security_role'
  | 'payment_billing'
  | 'case_workflow'
  | 'support_privacy'
  | 'system_modification';

export function classifyAuditCategory(action: string, entityType: string): ActivityCategory {
  const act = String(action || '').toLowerCase();
  const ent = String(entityType || '').toLowerCase();

  if (
    ent === 'platform_role' ||
    ent === 'staff_member' ||
    ent === 'staff_invitation' ||
    ent === 'customer' ||
    act.includes('role') ||
    act.includes('access') ||
    act.includes('invitation') ||
    act.includes('auth')
  ) {
    return 'security_role';
  }

  if (ent === 'payment' || ent === 'invoice' || act.includes('payment') || act.includes('invoice')) {
    return 'payment_billing';
  }

  if (
    ent === 'case' ||
    act.includes('case_') ||
    act.includes('submission') ||
    act.includes('verification') ||
    act.includes('evidence')
  ) {
    return 'case_workflow';
  }

  if (
    ent === 'support' ||
    ent === 'data_request' ||
    ent === 'user' ||
    act.includes('support') ||
    act.includes('privacy') ||
    act.includes('profile') ||
    act.includes('data_request')
  ) {
    return 'support_privacy';
  }

  return 'system_modification';
}

export function formatActivityActionLabel(action: string): string {
  const cleaned = String(action || 'system_event').replaceAll('_', ' ').trim();
  if (!cleaned) return 'System event';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function mergeActivityEventsIdempotent(
  existing: AuditEventRecord[],
  incoming: AuditEventRecord | AuditEventRecord[],
  maxItems = 200
): AuditEventRecord[] {
  const list = Array.isArray(incoming) ? incoming : [incoming];
  const byId = new Map<string, AuditEventRecord>();

  for (const item of existing) {
    if (item && item.id) {
      byId.set(item.id, item);
    }
  }
  for (const item of list) {
    if (item && item.id) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, maxItems);
}

export function filterActivityEvents(
  events: AuditEventRecord[],
  opts: { query: string; category: ActivityCategory | 'all' }
): AuditEventRecord[] {
  const q = opts.query.trim().toLowerCase();
  return events.filter((ev) => {
    if (opts.category !== 'all' && classifyAuditCategory(ev.action, ev.entity_type) !== opts.category) {
      return false;
    }
    if (!q) return true;
    const detailsText = ev.details ? JSON.stringify(ev.details) : '';
    return [ev.actor, ev.action, ev.entity_type, ev.entity_id, ev.organization_name, detailsText].some(
      (v) => String(v || '').toLowerCase().includes(q)
    );
  });
}

export type PlatformPermission =
  | 'overview'
  | 'customers'
  | 'payments'
  | 'cases'
  | 'support'
  | 'requests'
  | 'audit'
  | 'reports'
  | 'visitors'
  | 'roles'
  | 'write_cases'
  | 'write_payments'
  | 'write_support'
  | 'write_requests'
  | 'write_roles'
  | 'broadcast';

export const ROLE_PERMISSIONS: Record<PlatformRoleName, PlatformPermission[]> = {
  operations_admin: [
    'overview',
    'customers',
    'payments',
    'cases',
    'support',
    'requests',
    'audit',
    'reports',
    'visitors',
    'roles',
    'write_cases',
    'write_payments',
    'write_support',
    'write_requests',
    'write_roles',
    'broadcast',
  ],
  case_manager: [
    'overview',
    'customers',
    'cases',
    'support',
    'audit',
    'reports',
    'write_cases',
    'write_support',
  ],
  support_agent: [
    'overview',
    'customers',
    'cases',
    'support',
    'audit',
    'write_support',
  ],
  privacy_officer: [
    'overview',
    'customers',
    'requests',
    'audit',
    'reports',
    'write_requests',
  ],
  auditor: [
    'overview',
    'customers',
    'payments',
    'cases',
    'support',
    'requests',
    'audit',
    'reports',
    'visitors',
  ],
};

export function hasPlatformPermission(
  role: PlatformRoleName | string,
  permission: PlatformPermission
): boolean {
  const perms = ROLE_PERMISSIONS[role as PlatformRoleName];
  if (!perms) return false;
  return perms.includes(permission);
}

export function getInquiryTrackingCode(inquiryId: string): string {
  const cleaned = String(inquiryId || '')
    .replace(/^inq-/i, '')
    .trim()
    .toUpperCase();
  return `INQ-${cleaned}`;
}

export function normalizeTrackingCode(code: string): string {
  return String(code || '').trim().toUpperCase();
}

export function generateTakedownNoticePacket(input: {
  caseItem: ProtectionCase;
  customerName: string;
  customerEmail: string;
  organizationName?: string;
  targetChannel?: 'platform_rights' | 'registrar_whois' | 'search_deindex' | 'publisher_legal';
}): { subject: string; channelHint: string; body: string } {
  const { caseItem, customerName, customerEmail } = input;
  const org = input.organizationName || customerName;
  const channel = input.targetChannel || 'platform_rights';

  const channelTitles: Record<typeof channel, string> = {
    platform_rights: `${caseItem.platform} Trust, Safety & Intellectual Property Operations`,
    registrar_whois: 'Domain Registrar & Upstream Hosting Abuse Compliance Desk',
    search_deindex: 'Search Engine Legal Removal & De-Indexing Review Team',
    publisher_legal: 'Online Publisher Legal & Editorial Corrections Desk',
  };

  const routeLabel =
    caseItem.complaint_type === 'copyright'
      ? 'DMCA Copyright Infringement Takedown Notice (17 U.S.C. § 512(c))'
      : caseItem.complaint_type === 'deepfake'
        ? 'Unauthorized Synthetic / Deepfake Likeness Removal Notice'
        : caseItem.complaint_type === 'extortion'
          ? 'URGENT: Non-Consensual Content & Extortion Escalation Notice'
          : caseItem.complaint_type === 'impersonation'
            ? 'Brand & Identity Impersonation Takedown Notice'
            : 'Formal Privacy & Unauthorized Content Removal Request';

  const evidenceLines =
    caseItem.evidence && caseItem.evidence.length > 0
      ? caseItem.evidence
          .map(
            (ev, idx) =>
              `${idx + 1}. ${ev.title} [${ev.category}]${
                ev.sha256_preview ? ` — SHA-256 prefix: ${ev.sha256_preview}` : ''
              }${ev.reference_url ? ` — Ref: ${ev.reference_url}` : ''}`
          )
          .join('\n')
      : '1. Supporting identity/ownership documentation archived in Full Remove encrypted vault.';

  const subject = `[${caseItem.case_number}] ${routeLabel} — ${caseItem.platform}`;
  const body = [
    `TO: ${channelTitles[channel]}`,
    `FROM: Full Remove Operations Desk on behalf of ${org} (${customerEmail})`,
    `CASE REFERENCE: ${caseItem.case_number}`,
    `DATE (UTC): ${new Date().toISOString()}`,
    `SUBJECT: ${subject}`,
    '',
    '1. REPORTED INFRINGING / UNAUTHORIZED URL',
    `Platform / Host: ${caseItem.platform}`,
    `Direct URL: ${caseItem.source_url}`,
    `Classification: ${formatStatusLabel(caseItem.complaint_type).toUpperCase()}`,
    '',
    '2. SUMMARY OF VIOLATION & BASIS FOR REMOVAL',
    caseItem.description || caseItem.title,
    '',
    '3. VERIFIED EVIDENCE INVENTORY',
    evidenceLines,
    '',
    '4. GOOD-FAITH & AUTHORIZATION STATEMENT',
    `We state in good faith that the use or publication of the material at the URL above is not authorized by ${customerName}, their legal representatives, or applicable law. We represent that the information in this notice is accurate and respectfully request expeditious removal or disabling of access.`,
    '',
    'Respectfully submitted,',
    'Full Remove Content Protection & Escalation Operations',
    `Authorized Representative Contact: ops@fremove.com (Ref: ${caseItem.case_number})`,
  ].join('\n');

  return {
    subject,
    channelHint: channelTitles[channel],
    body,
  };
}

export function isPublicHttpUrlSafe(rawUrl: string): { ok: boolean; url?: URL; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(String(rawUrl || '').trim());
  } catch {
    return { ok: false, error: 'Invalid URL format.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only http:// and https:// URLs can be checked.' };
  }
  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]'
  ) {
    return { ok: false, error: 'Internal and loopback hostnames are blocked.' };
  }
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, aStr, bStr] = ipv4Match;
    const a = Number(aStr);
    const b = Number(bStr);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    ) {
      return { ok: false, error: 'Private and link-local IP ranges are blocked.' };
    }
  }
  return { ok: true, url: parsed };
}

export function classifyHttpCheckResult(statusCode: number): VerificationCheckItem['result'] {
  if (statusCode === 404 || statusCode === 410 || statusCode === 451) {
    return 'confirmed_removed';
  }
  if (statusCode === 401 || statusCode === 403) {
    return 'login_required';
  }
  if (statusCode >= 300 && statusCode < 400) {
    return 'redirected';
  }
  if (statusCode >= 200 && statusCode < 300) {
    return 'still_accessible';
  }
  return 'not_found_unclear';
}

export type CaseProgressionPhaseId =
  | 'investigation'
  | 'submission'
  | 'pending_verification'
  | 'resolved';

export interface CaseProgressionStep {
  id: CaseProgressionPhaseId;
  stepNumber: string;
  label: string;
  description: string;
  state: 'completed' | 'current' | 'upcoming' | 'attention';
}

export interface CaseProgressionState {
  currentPhaseId: CaseProgressionPhaseId;
  currentPhaseLabel: string;
  progressPercent: number;
  exceptionFlag: 'none' | 'needs_information' | 'rejected' | 'disputed';
  exceptionNote: string | null;
  phases: CaseProgressionStep[];
}

export function computeCaseProgression(
  c: Pick<ProtectionCase, 'status' | 'submissions' | 'verifications'>
): CaseProgressionState {
  const baseSteps: { id: CaseProgressionPhaseId; stepNumber: string; label: string; description: string }[] = [
    {
      id: 'investigation',
      stepNumber: '01',
      label: 'Investigation',
      description: 'Evidence audit, URL capture & legal route review',
    },
    {
      id: 'submission',
      stepNumber: '02',
      label: 'Submission',
      description: 'Formal takedown filed with platform or host',
    },
    {
      id: 'pending_verification',
      stepNumber: '03',
      label: 'Pending Verification',
      description: 'Platform action logged; live URL permanence checks',
    },
    {
      id: 'resolved',
      stepNumber: '04',
      label: 'Resolved',
      description: 'Removal verified & file archived',
    },
  ];

  const status = c.status;
  let activeIdx = 0;
  let progressPercent = 25;
  let exceptionFlag: CaseProgressionState['exceptionFlag'] = 'none';
  let exceptionNote: string | null = null;
  let allDone = false;

  if (status === 'resolved' || status === 'closed') {
    activeIdx = 3;
    progressPercent = 100;
    allDone = true;
  } else if (status === 'action_taken') {
    activeIdx = 2;
    progressPercent = 75;
  } else if (status === 'submitted_to_platform') {
    activeIdx = 1;
    progressPercent = 50;
  } else if (status === 'approved') {
    activeIdx = 0;
    progressPercent = 35;
  } else if (status === 'needs_information') {
    activeIdx = 0;
    progressPercent = 25;
    exceptionFlag = 'needs_information';
    exceptionNote = 'Awaiting requested documentation or clarification from customer.';
  } else if (status === 'disputed') {
    activeIdx = (c.submissions?.length || 0) > 0 ? 1 : 0;
    progressPercent = activeIdx === 1 ? 50 : 25;
    exceptionFlag = 'disputed';
    exceptionNote = 'Escalated for secondary dispute or counter-notice review.';
  } else if (status === 'rejected') {
    activeIdx = (c.submissions?.length || 0) > 0 ? 1 : 0;
    progressPercent = activeIdx === 1 ? 50 : 25;
    exceptionFlag = 'rejected';
    exceptionNote = 'Case rejected or halted by platform / compliance review.';
  } else {
    // 'submitted' | 'reviewing'
    activeIdx = 0;
    progressPercent = status === 'reviewing' ? 30 : 20;
  }

  const phases: CaseProgressionStep[] = baseSteps.map((step, idx) => {
    let state: CaseProgressionStep['state'] = 'upcoming';
    if (allDone) {
      state = 'completed';
    } else if (idx < activeIdx) {
      state = 'completed';
    } else if (idx === activeIdx) {
      state = exceptionFlag !== 'none' ? 'attention' : 'current';
    }
    return {
      ...step,
      state,
    };
  });

  return {
    currentPhaseId: baseSteps[activeIdx].id,
    currentPhaseLabel: baseSteps[activeIdx].label,
    progressPercent,
    exceptionFlag,
    exceptionNote,
    phases,
  };
}

export type CaseTimelineEventCategory =
  | 'submitted'
  | 'status'
  | 'evidence'
  | 'submission'
  | 'platform_response'
  | 'verification'
  | 'message';

export interface CaseTimelineEvent {
  id: string;
  timestamp: string;
  label: string;
  detail: string;
  category: CaseTimelineEventCategory;
  meta?: string;
}

export function formatTimelineTimestampUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || '');
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
}

function activityTypeMeta(activityType: string): {
  label: string;
  category: CaseTimelineEventCategory;
  rank: number;
} {
  switch (activityType) {
    case 'submitted':
      return { label: 'Case submitted', category: 'submitted', rank: 10 };
    case 'evidence_added':
      return { label: 'Evidence uploaded', category: 'evidence', rank: 20 };
    case 'reviewing':
      return { label: 'Investigation started', category: 'status', rank: 30 };
    case 'needs_information':
      return { label: 'Information requested', category: 'status', rank: 32 };
    case 'approved':
      return { label: 'Approved for filing', category: 'status', rank: 35 };
    case 'submitted_to_platform':
      return { label: 'Submitted to platform', category: 'submission', rank: 40 };
    case 'action_taken':
      return { label: 'Platform action taken', category: 'platform_response', rank: 55 };
    case 'resolved':
      return { label: 'Case resolved', category: 'status', rank: 70 };
    case 'rejected':
      return { label: 'Case rejected', category: 'status', rank: 70 };
    case 'disputed':
      return { label: 'Dispute reopened', category: 'status', rank: 70 };
    case 'closed':
      return { label: 'Case closed', category: 'status', rank: 75 };
    default:
      return { label: formatActivityActionLabel(activityType), category: 'status', rank: 38 };
  }
}

export function buildCaseChronologicalLog(
  caseItem: Pick<
    ProtectionCase,
    'evidence' | 'activity' | 'messages' | 'submissions' | 'verifications'
  >,
  order: 'asc' | 'desc' = 'asc'
): CaseTimelineEvent[] {
  interface RankedEvent {
    event: CaseTimelineEvent;
    ms: number;
    rank: number;
  }

  const items: RankedEvent[] = [];
  const evidenceList = caseItem.evidence || [];
  const evidenceTitles = new Set(evidenceList.map((ev) => ev.title.trim().toLowerCase()));
  const evidenceHashes = new Set(
    evidenceList.map((ev) => (ev.sha256_preview || '').trim().toLowerCase()).filter(Boolean)
  );

  // 1. Evidence vault items -> 'Evidence uploaded'
  for (const ev of evidenceList) {
    const filePart = ev.file_name ? ` (${ev.file_name})` : '';
    const notesPart = ev.notes ? ` — ${ev.notes}` : '';
    const metaParts = [
      ev.uploaded_by_role === 'staff' ? 'Analyst upload' : 'Customer upload',
      ev.sha256_preview ? `SHA256:${ev.sha256_preview}` : '',
      ev.has_encrypted_file ? 'AES-256-GCM' : '',
    ].filter(Boolean);

    items.push({
      ms: new Date(ev.created_at).getTime() || 0,
      rank: 20,
      event: {
        id: `ev-${ev.id}`,
        timestamp: ev.created_at,
        label: 'Evidence uploaded',
        detail: `${ev.title}${filePart}${notesPart}`,
        category: 'evidence',
        meta: metaParts.join(' · ') || undefined,
      },
    });
  }

  // 2. Customer-visible workflow activity (deduplicating redundant evidence_added entries)
  for (const act of caseItem.activity || []) {
    if (act.visibility !== 'customer') continue;

    if (act.activity_type === 'evidence_added') {
      const msgLower = act.message.toLowerCase();
      const matchedExisting =
        Array.from(evidenceTitles).some((t) => t && msgLower.includes(t)) ||
        Array.from(evidenceHashes).some((h) => h && msgLower.includes(h));
      if (matchedExisting) {
        continue;
      }
    }

    const meta = activityTypeMeta(act.activity_type);
    items.push({
      ms: new Date(act.created_at).getTime() || 0,
      rank: meta.rank,
      event: {
        id: `act-${act.id}`,
        timestamp: act.created_at,
        label: meta.label,
        detail: act.message,
        category: meta.category,
      },
    });
  }

  // 3. Platform filings & platform responses
  for (const sub of caseItem.submissions || []) {
    const hasPlatformResponse =
      Boolean(sub.response_summary && sub.response_summary.trim()) ||
      ['acknowledged', 'under_review', 'action_taken', 'rejected', 'disputed'].includes(sub.status);

    const metaParts = [
      formatStatusLabel(sub.status),
      sub.external_reference ? `Ref #${sub.external_reference}` : '',
    ].filter(Boolean);

    if (hasPlatformResponse) {
      items.push({
        ms: new Date(sub.submitted_at).getTime() || 0,
        rank: 50,
        event: {
          id: `sub-${sub.id}`,
          timestamp: sub.submitted_at,
          label: 'Platform responded',
          detail: `${sub.platform}: ${sub.response_summary || formatStatusLabel(sub.status)}`,
          category: 'platform_response',
          meta: metaParts.join(' · ') || undefined,
        },
      });
    } else {
      items.push({
        ms: new Date(sub.submitted_at).getTime() || 0,
        rank: 42,
        event: {
          id: `sub-${sub.id}`,
          timestamp: sub.submitted_at,
          label: 'Platform filing submitted',
          detail: `${sub.platform} via ${formatStatusLabel(sub.submission_channel)}`,
          category: 'submission',
          meta: metaParts.join(' · ') || undefined,
        },
      });
    }
  }

  // 4. Case messages (customer & staff)
  for (const msg of caseItem.messages || []) {
    items.push({
      ms: new Date(msg.created_at).getTime() || 0,
      rank: 58,
      event: {
        id: `msg-${msg.id}`,
        timestamp: msg.created_at,
        label: msg.sender_role === 'staff' ? 'Specialist message' : 'Customer message',
        detail: msg.message,
        category: 'message',
        meta: msg.sender_email,
      },
    });
  }

  // 5. Live URL removal verification checks
  for (const ver of caseItem.verifications || []) {
    items.push({
      ms: new Date(ver.checked_at).getTime() || 0,
      rank: 65,
      event: {
        id: `ver-${ver.id}`,
        timestamp: ver.checked_at,
        label: 'Verification check',
        detail: `${formatStatusLabel(ver.result)}${ver.notes ? ` — ${ver.notes}` : ''}`,
        category: 'verification',
        meta: ver.checked_url,
      },
    });
  }

  items.sort((a, b) => {
    const diff = order === 'desc' ? b.ms - a.ms : a.ms - b.ms;
    if (diff !== 0) return diff;
    return order === 'desc' ? b.rank - a.rank : a.rank - b.rank;
  });

  return items.map((entry) => entry.event);
}

export type PreviewFileKind = 'image' | 'pdf' | 'text' | 'unsupported';

export function classifyPreviewFileKind(mimeType?: string, fileName?: string): PreviewFileKind {
  const mime = String(mimeType || '').trim().toLowerCase();
  const ext = String(fileName || '').trim().toLowerCase().split('.').pop() || '';

  if (
    mime === 'image/png' ||
    mime === 'image/jpeg' ||
    mime === 'image/jpg' ||
    mime === 'image/webp' ||
    mime === 'image/gif' ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)
  ) {
    return 'image';
  }

  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }

  if (
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    ['txt', 'csv', 'json', 'log', 'md'].includes(ext)
  ) {
    return 'text';
  }

  return 'unsupported';
}

export function formatFileSizeLabel(bytes: number): string {
  const safe = Math.max(0, Number.isFinite(bytes) ? bytes : 0);
  if (safe < 1024) {
    return `${Math.round(safe)} B`;
  }
  if (safe < 1024 * 1024) {
    return `${Math.max(1, Math.round(safe / 1024))} KB`;
  }
  return `${(safe / (1024 * 1024)).toFixed(2)} MB`;
}

export function decodeBase64ToUtf8Preview(
  base64: string,
  maxChars = 12000
): { text: string; truncated: boolean } {
  const cleaned = String(base64 || '')
    .replace(/^data:[^;]+;base64,/, '')
    .trim();
  if (!cleaned) {
    return { text: '', truncated: false };
  }
  try {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (decoded.length > maxChars) {
      return { text: decoded.slice(0, maxChars), truncated: true };
    }
    return { text: decoded, truncated: false };
  } catch {
    return { text: '', truncated: false };
  }
}

export type CasePendingPriorityTier = 'normal' | 'high_priority' | 'urgent';

export interface CasePendingThresholdConfig {
  highPriorityHours: number;
  urgentHours: number;
}

export type PendingThresholdPresetId = 'strict' | 'standard' | 'relaxed';

export interface PendingThresholdPreset extends CasePendingThresholdConfig {
  id: PendingThresholdPresetId;
  label: string;
}

export const PENDING_THRESHOLD_PRESETS: PendingThresholdPreset[] = [
  {
    id: 'strict',
    label: 'Threshold: 24h / 72h',
    highPriorityHours: 24,
    urgentHours: 72,
  },
  {
    id: 'standard',
    label: 'Threshold: 48h / 120h',
    highPriorityHours: 48,
    urgentHours: 120,
  },
  {
    id: 'relaxed',
    label: 'Threshold: 72h / 168h',
    highPriorityHours: 72,
    urgentHours: 168,
  },
];

export const DEFAULT_PENDING_THRESHOLDS: CasePendingThresholdConfig = {
  highPriorityHours: 48,
  urgentHours: 120,
};

export function getPendingThresholdPreset(
  presetId: PendingThresholdPresetId | string
): PendingThresholdPreset {
  return (
    PENDING_THRESHOLD_PRESETS.find((p) => p.id === presetId) || PENDING_THRESHOLD_PRESETS[1]
  );
}

export interface CasePendingPriorityResult {
  tier: CasePendingPriorityTier;
  badgeLabel: 'High Priority' | 'Urgent' | null;
  pendingHours: number;
  pendingDurationLabel: string;
  thresholdExceededHours: number | null;
}

export function computeCasePendingPriority(
  c: Pick<ProtectionCase, 'status' | 'submitted_at'>,
  thresholds: CasePendingThresholdConfig = DEFAULT_PENDING_THRESHOLDS,
  nowMs: number = Date.now()
): CasePendingPriorityResult {
  if (c.status === 'resolved' || c.status === 'closed' || c.status === 'rejected') {
    return {
      tier: 'normal',
      badgeLabel: null,
      pendingHours: 0,
      pendingDurationLabel: '—',
      thresholdExceededHours: null,
    };
  }

  const startMs = new Date(c.submitted_at).getTime();
  if (Number.isNaN(startMs)) {
    return {
      tier: 'normal',
      badgeLabel: null,
      pendingHours: 0,
      pendingDurationLabel: '—',
      thresholdExceededHours: null,
    };
  }

  const highPriorityHours = Math.max(0, thresholds.highPriorityHours);
  const urgentHours = Math.max(highPriorityHours, thresholds.urgentHours);
  const pendingHours = Math.max(0, (nowMs - startMs) / 3600000);
  const pendingDurationLabel = formatTurnaroundDuration(pendingHours);

  if (pendingHours > urgentHours) {
    return {
      tier: 'urgent',
      badgeLabel: 'Urgent',
      pendingHours,
      pendingDurationLabel,
      thresholdExceededHours: urgentHours,
    };
  }

  if (pendingHours > highPriorityHours) {
    return {
      tier: 'high_priority',
      badgeLabel: 'High Priority',
      pendingHours,
      pendingDurationLabel,
      thresholdExceededHours: highPriorityHours,
    };
  }

  return {
    tier: 'normal',
    badgeLabel: null,
    pendingHours,
    pendingDurationLabel,
    thresholdExceededHours: null,
  };
}

export interface CaseReportRow {
  caseNumber: string;
  title: string;
  platform: string;
  sourceUrl: string;
  complaintType: string;
  statusLabel: string;
  progressionPhase: string;
  progressPercent: number;
  priorityLabel: 'Normal' | 'High Priority' | 'Urgent';
  priorityTier: CasePendingPriorityTier;
  pendingDuration: string;
  slaLabel: string;
  evidenceCount: number;
  evidenceSummary: string[];
  submissionsCount: number;
  submissionsSummary: string[];
  verificationsCount: number;
  verificationsSummary: string[];
  submittedAtUtc: string;
  updatedAtUtc: string;
  description: string;
  timeline: CaseTimelineEvent[];
}

export interface CaseReportDocument {
  generatedAtIso: string;
  generatedAtUtcLabel: string;
  accountName: string;
  accountEmail: string;
  thresholdSpec: CasePendingThresholdConfig;
  summary: WorkspaceSummaryMetrics;
  rows: CaseReportRow[];
}

export function buildReportExportFilename(
  extension: 'csv' | 'pdf',
  scope: string = 'all',
  nowMs: number = Date.now()
): string {
  const isoDate = new Date(nowMs).toISOString().slice(0, 10);
  const cleanedScope = String(scope || 'all')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleanedScope || cleanedScope === 'all') {
    return `full-remove-case-report-${isoDate}.${extension}`;
  }
  return `full-remove-case-report-${cleanedScope}-${isoDate}.${extension}`;
}

export function buildCaseReportDocument(input: {
  cases: ProtectionCase[];
  user: { name?: string; email?: string };
  thresholds?: CasePendingThresholdConfig;
  nowMs?: number;
}): CaseReportDocument {
  const nowMs = input.nowMs ?? Date.now();
  const thresholds = input.thresholds ?? DEFAULT_PENDING_THRESHOLDS;
  const generatedAtIso = new Date(nowMs).toISOString();
  const generatedAtUtcLabel = formatTimelineTimestampUtc(generatedAtIso);
  const summary = computeWorkspaceSummaryMetrics(input.cases, nowMs);

  const rows: CaseReportRow[] = input.cases.map((c) => {
    const prog = computeCaseProgression(c);
    const sla = computeCaseSla(c, nowMs);
    const priority = computeCasePendingPriority(c, thresholds, nowMs);
    const timeline = buildCaseChronologicalLog(c, 'asc');
    const evidenceList = c.evidence || [];
    const submissionsList = c.submissions || [];
    const verificationsList = c.verifications || [];

    return {
      caseNumber: c.case_number,
      title: c.title,
      platform: c.platform,
      sourceUrl: c.source_url,
      complaintType: formatStatusLabel(c.complaint_type),
      statusLabel: formatStatusLabel(c.status),
      progressionPhase: prog.currentPhaseLabel,
      progressPercent: prog.progressPercent,
      priorityLabel: priority.badgeLabel || 'Normal',
      priorityTier: priority.tier,
      pendingDuration: priority.pendingDurationLabel,
      slaLabel: sla.label,
      evidenceCount: evidenceList.length,
      evidenceSummary: evidenceList.map(
        (ev) =>
          `${ev.title} [${formatStatusLabel(ev.category)}]${ev.file_name ? ` (${ev.file_name})` : ''}${
            ev.sha256_preview ? ` · SHA256:${ev.sha256_preview}` : ''
          }`
      ),
      submissionsCount: submissionsList.length,
      submissionsSummary: submissionsList.map(
        (sub) =>
          `${sub.platform} (${formatStatusLabel(sub.status)})${
            sub.external_reference ? ` · Ref #${sub.external_reference}` : ''
          }${sub.response_summary ? ` — ${sub.response_summary}` : ''}`
      ),
      verificationsCount: verificationsList.length,
      verificationsSummary: verificationsList.map(
        (ver) =>
          `${formatStatusLabel(ver.result)} · ${ver.checked_url}${
            ver.notes ? ` — ${ver.notes}` : ''
          }`
      ),
      submittedAtUtc: formatTimelineTimestampUtc(c.submitted_at),
      updatedAtUtc: formatTimelineTimestampUtc(c.updated_at),
      description: c.description || '',
      timeline,
    };
  });

  return {
    generatedAtIso,
    generatedAtUtcLabel,
    accountName: input.user.name?.trim() || 'Workspace Customer',
    accountEmail: input.user.email?.trim() || '',
    thresholdSpec: {
      highPriorityHours: thresholds.highPriorityHours,
      urgentHours: thresholds.urgentHours,
    },
    summary,
    rows,
  };
}

export function buildCaseHistoryCsv(input: {
  cases: ProtectionCase[];
  user: { name?: string; email?: string };
  thresholds?: CasePendingThresholdConfig;
  nowMs?: number;
}): string {
  const report = buildCaseReportDocument(input);
  const headers = [
    'Case Number',
    'Title',
    'Platform',
    'Complaint Type',
    'Target URL',
    'Status',
    'Progression Phase',
    'Progress %',
    'Priority Badge',
    'Pending Duration',
    'SLA Status',
    'Submitted (UTC)',
    'Updated (UTC)',
    'Evidence Count',
    'Evidence Vault Inventory',
    'Platform Submissions',
    'Verification Checks',
    'Chronological Events Count',
    'Chronological Activity History',
  ];

  const csvRows = report.rows.map((row) => ({
    'Case Number': row.caseNumber,
    Title: row.title,
    Platform: row.platform,
    'Complaint Type': row.complaintType,
    'Target URL': row.sourceUrl,
    Status: row.statusLabel.toUpperCase(),
    'Progression Phase': row.progressionPhase,
    'Progress %': `${row.progressPercent}%`,
    'Priority Badge': row.priorityLabel,
    'Pending Duration': row.pendingDuration,
    'SLA Status': row.slaLabel,
    'Submitted (UTC)': row.submittedAtUtc,
    'Updated (UTC)': row.updatedAtUtc,
    'Evidence Count': row.evidenceCount,
    'Evidence Vault Inventory': row.evidenceSummary.join(' | ') || 'None',
    'Platform Submissions': row.submissionsSummary.join(' | ') || 'None',
    'Verification Checks': row.verificationsSummary.join(' | ') || 'None',
    'Chronological Events Count': row.timeline.length,
    'Chronological Activity History':
      row.timeline
        .map(
          (ev) =>
            `[${formatTimelineTimestampUtc(ev.timestamp)}] ${ev.label}: ${ev.detail}${
              ev.meta ? ` (${ev.meta})` : ''
            }`
        )
        .join(' | ') || 'No recorded events',
  }));

  return buildCsv(headers, csvRows);
}

export type WorkspaceCaseAlertKind = 'resolved' | 'urgent_input';

export interface WorkspaceCaseAlert {
  id: string;
  dedupeKey: string;
  caseId: string;
  caseNumber: string;
  title: string;
  platform: string;
  kind: WorkspaceCaseAlertKind;
  status: CaseStatus;
  headline: string;
  detail: string;
  createdAt: string;
}

export interface WorkspaceAlertBadgeItem {
  caseItem: ProtectionCase;
  reason: 'needs_information' | 'urgent_threshold';
  label: string;
}

export interface WorkspaceAlertSummary {
  urgentInputCases: WorkspaceAlertBadgeItem[];
  resolvedCases: ProtectionCase[];
  urgentCount: number;
  resolvedCount: number;
}

function isCaseMarkedRemoved(caseItem: ProtectionCase): boolean {
  if (caseItem.status === 'resolved') return true;
  const verifications = caseItem.verifications;
  if (!verifications || verifications.length === 0) return false;
  let latest = verifications[verifications.length - 1];
  for (const v of verifications) {
    if (v.checked_at && latest?.checked_at && v.checked_at > latest.checked_at) {
      latest = v;
    }
  }
  return latest?.result === 'confirmed_removed';
}

export function isCaseRemovedTransition(
  prevCase: ProtectionCase | undefined,
  nextCase: ProtectionCase
): boolean {
  if (!prevCase) return false;
  return !isCaseMarkedRemoved(prevCase) && isCaseMarkedRemoved(nextCase);
}

export function classifyCaseTransitionAlert(
  prevCase: ProtectionCase | undefined,
  nextCase: ProtectionCase,
  thresholds: CasePendingThresholdConfig = DEFAULT_PENDING_THRESHOLDS,
  nowMs: number = Date.now()
): WorkspaceCaseAlert | null {
  if (!prevCase) {
    return null;
  }

  const timestamp = nextCase.updated_at || new Date(nowMs).toISOString();

  if (
    (nextCase.status === 'resolved' && prevCase.status !== 'resolved') ||
    isCaseRemovedTransition(prevCase, nextCase)
  ) {
    return {
      id: `alert-${nextCase.id}-resolved-${timestamp}`,
      dedupeKey: `${nextCase.id}:resolved:${timestamp}`,
      caseId: nextCase.id,
      caseNumber: nextCase.case_number,
      title: nextCase.title,
      platform: nextCase.platform,
      kind: 'resolved',
      status: nextCase.status,
      headline: `${nextCase.case_number} marked Resolved`,
      detail: `${nextCase.platform} case "${nextCase.title}" has been verified and completed.`,
      createdAt: timestamp,
    };
  }

  const prevPriority = computeCasePendingPriority(prevCase, thresholds, nowMs);
  const nextPriority = computeCasePendingPriority(nextCase, thresholds, nowMs);

  const becameNeedsInfo =
    nextCase.status === 'needs_information' && prevCase.status !== 'needs_information';
  const escalatedUrgent = nextPriority.tier === 'urgent' && prevPriority.tier !== 'urgent';

  if (becameNeedsInfo || escalatedUrgent) {
    return {
      id: `alert-${nextCase.id}-urgent-${timestamp}`,
      dedupeKey: `${nextCase.id}:urgent_input:${nextCase.status}:${nextPriority.tier}:${timestamp}`,
      caseId: nextCase.id,
      caseNumber: nextCase.case_number,
      title: nextCase.title,
      platform: nextCase.platform,
      kind: 'urgent_input',
      status: nextCase.status,
      headline: becameNeedsInfo
        ? `${nextCase.case_number} requires urgent input`
        : `${nextCase.case_number} escalated to Urgent`,
      detail: becameNeedsInfo
        ? `Clarification or supporting documentation requested for ${nextCase.platform}.`
        : `Case pending ${nextPriority.pendingDurationLabel} without resolution (${nextCase.platform}).`,
      createdAt: timestamp,
    };
  }

  return null;
}

export function computeWorkspaceAlertSummary(
  cases: ProtectionCase[],
  thresholds: CasePendingThresholdConfig = DEFAULT_PENDING_THRESHOLDS,
  nowMs: number = Date.now()
): WorkspaceAlertSummary {
  const urgentInputCases: WorkspaceAlertBadgeItem[] = [];
  const resolvedCases: ProtectionCase[] = [];

  for (const item of cases) {
    if (item.status === 'resolved') {
      resolvedCases.push(item);
      continue;
    }

    const priority = computeCasePendingPriority(item, thresholds, nowMs);
    if (item.status === 'needs_information') {
      urgentInputCases.push({
        caseItem: item,
        reason: 'needs_information',
        label: 'Needs customer input',
      });
    } else if (priority.tier === 'urgent') {
      urgentInputCases.push({
        caseItem: item,
        reason: 'urgent_threshold',
        label: `Urgent · Pending ${priority.pendingDurationLabel}`,
      });
    }
  }

  return {
    urgentInputCases,
    resolvedCases,
    urgentCount: urgentInputCases.length,
    resolvedCount: resolvedCases.length,
  };
}

export function mergeWorkspaceToastAlerts(
  existing: WorkspaceCaseAlert[],
  incoming: WorkspaceCaseAlert,
  maxItems = 4
): WorkspaceCaseAlert[] {
  const filtered = existing.filter((item) => item.dedupeKey !== incoming.dedupeKey);
  return [incoming, ...filtered].slice(0, maxItems);
}

export function isCaseActiveStatus(status: CaseStatus): boolean {
  return status !== 'resolved' && status !== 'closed' && status !== 'rejected';
}

export function filterWorkspaceCases(
  cases: ProtectionCase[],
  opts: {
    query: string;
    activeOnly?: boolean;
    sort?: 'newest' | 'oldest' | 'case_az' | 'status';
  }
): ProtectionCase[] {
  const pool = opts.activeOnly ? cases.filter((c) => isCaseActiveStatus(c.status)) : cases;
  return filterAndSortCases(pool, opts.query, opts.sort || 'newest');
}

export type CaseJourneyMilestoneId =
  | 'submission'
  | 'investigation'
  | 'platform_action'
  | 'verification';

export interface CaseJourneyMilestone {
  id: CaseJourneyMilestoneId;
  label: string;
  shortLabel: string;
  state: 'completed' | 'current' | 'upcoming' | 'attention';
  dateLabel?: string;
}

export interface CaseJourneyTimelineState {
  progressPercent: number;
  tone: 'sky' | 'emerald' | 'amber' | 'rose';
  currentStageLabel: string;
  milestones: CaseJourneyMilestone[];
}

export function computeCaseJourneyTimeline(
  c: Pick<
    ProtectionCase,
    'status' | 'submitted_at' | 'updated_at' | 'submissions' | 'verifications'
  >
): CaseJourneyTimelineState {
  const status = c.status;
  const submittedDate = c.submitted_at ? c.submitted_at.slice(0, 10) : undefined;
  const platformDate = c.submissions?.[0]?.submitted_at
    ? c.submissions[0].submitted_at.slice(0, 10)
    : undefined;
  const verificationDate = c.verifications?.[0]?.checked_at
    ? c.verifications[0].checked_at.slice(0, 10)
    : status === 'resolved' || status === 'closed'
      ? c.updated_at?.slice(0, 10)
      : undefined;

  let stepState: [
    CaseJourneyMilestone['state'],
    CaseJourneyMilestone['state'],
    CaseJourneyMilestone['state'],
    CaseJourneyMilestone['state'],
  ] = ['current', 'upcoming', 'upcoming', 'upcoming'];
  let progressPercent = 18;
  let tone: CaseJourneyTimelineState['tone'] = 'sky';
  let currentStageLabel = 'Submitted for intake';

  if (status === 'resolved' || status === 'closed') {
    stepState = ['completed', 'completed', 'completed', 'completed'];
    progressPercent = 100;
    tone = 'emerald';
    currentStageLabel = 'Verification complete';
  } else if (status === 'action_taken') {
    stepState = ['completed', 'completed', 'completed', 'current'];
    progressPercent = 85;
    tone = 'sky';
    currentStageLabel = 'Pending final verification';
  } else if (status === 'submitted_to_platform') {
    stepState = ['completed', 'completed', 'current', 'upcoming'];
    progressPercent = 66;
    tone = 'sky';
    currentStageLabel = 'Awaiting platform action';
  } else if (status === 'approved') {
    stepState = ['completed', 'completed', 'current', 'upcoming'];
    progressPercent = 52;
    tone = 'sky';
    currentStageLabel = 'Ready for platform filing';
  } else if (status === 'reviewing') {
    stepState = ['completed', 'current', 'upcoming', 'upcoming'];
    progressPercent = 38;
    tone = 'sky';
    currentStageLabel = 'Under analyst review';
  } else if (status === 'needs_information') {
    stepState = ['completed', 'attention', 'upcoming', 'upcoming'];
    progressPercent = 32;
    tone = 'amber';
    currentStageLabel = 'Awaiting customer input';
  } else if (status === 'disputed') {
    const hasSub = (c.submissions?.length || 0) > 0;
    stepState = hasSub
      ? ['completed', 'completed', 'attention', 'upcoming']
      : ['completed', 'attention', 'upcoming', 'upcoming'];
    progressPercent = hasSub ? 60 : 35;
    tone = 'amber';
    currentStageLabel = 'Dispute under review';
  } else if (status === 'rejected') {
    const hasSub = (c.submissions?.length || 0) > 0;
    stepState = hasSub
      ? ['completed', 'completed', 'attention', 'upcoming']
      : ['completed', 'attention', 'upcoming', 'upcoming'];
    progressPercent = hasSub ? 55 : 28;
    tone = 'rose';
    currentStageLabel = 'Halted / rejected';
  }

  return {
    progressPercent,
    tone,
    currentStageLabel,
    milestones: [
      {
        id: 'submission',
        label: 'Submission',
        shortLabel: 'Submitted',
        state: stepState[0],
        dateLabel: submittedDate,
      },
      {
        id: 'investigation',
        label: 'Investigation',
        shortLabel: 'Review',
        state: stepState[1],
      },
      {
        id: 'platform_action',
        label: 'Platform Action',
        shortLabel: 'Platform',
        state: stepState[2],
        dateLabel: platformDate,
      },
      {
        id: 'verification',
        label: 'Verification',
        shortLabel: 'Verified',
        state: stepState[3],
        dateLabel: verificationDate,
      },
    ],
  };
}

export type StaffQueueStatusFilter =
  | 'all'
  | 'open'
  | 'submitted'
  | 'reviewing'
  | 'needs_information'
  | 'submitted_to_platform'
  | 'resolved'
  | 'watched';

export function filterStaffCasesQueue<T extends ProtectionCase>(
  cases: T[],
  opts: {
    query?: string;
    statusFilter?: StaffQueueStatusFilter;
    assigneeEmail?: string;
    sort?: 'newest' | 'oldest' | 'case_az' | 'status' | 'sla_urgent';
    nowMs?: number;
  }
): T[] {
  const statusFilter = opts.statusFilter || 'all';
  let pool = cases;
  if (statusFilter === 'open') {
    pool = pool.filter((c) => isCaseActiveStatus(c.status));
  } else if (statusFilter === 'resolved') {
    pool = pool.filter((c) => c.status === 'resolved' || c.status === 'closed');
  } else if (statusFilter === 'submitted_to_platform') {
    pool = pool.filter((c) => c.status === 'submitted_to_platform' || c.status === 'action_taken');
  } else if (statusFilter === 'watched') {
    pool = pool.filter((c) => Boolean(c.monitoring_enabled));
  } else if (statusFilter !== 'all') {
    pool = pool.filter((c) => c.status === statusFilter);
  }
  if (opts.assigneeEmail) {
    const target = opts.assigneeEmail.toLowerCase();
    pool = pool.filter((c) => (c.assigned_to || '').toLowerCase() === target);
  }
  return filterAndSortCases(pool, opts.query || '', opts.sort || 'newest', opts.nowMs) as T[];
}

export function buildStaffQueueCsv(cases: ProtectionCase[], nowMs = Date.now()): string {
  const headers = [
    'Case Number',
    'Customer',
    'Customer Email',
    'Title',
    'Platform',
    'Complaint Type',
    'Status',
    'Assigned To',
    'Watchlist Monitoring',
    'SLA Health',
    'Target URL',
    'Submitted At',
    'Updated At',
  ];
  const rows = cases.map((c) => {
    const sla = computeCaseSla(c, nowMs);
    return {
      'Case Number': c.case_number,
      Customer: c.customer_name,
      'Customer Email': c.customer_email,
      Title: c.title,
      Platform: c.platform,
      'Complaint Type': c.complaint_type,
      Status: c.status,
      'Assigned To': c.assigned_to || 'Unassigned',
      'Watchlist Monitoring': c.monitoring_enabled ? 'Active' : 'Off',
      'SLA Health': sla.label,
      'Target URL': c.source_url,
      'Submitted At': c.submitted_at,
      'Updated At': c.updated_at,
    };
  });
  return buildCsv(headers, rows);
}

export interface CaseScenarioTemplate {
  id: 'impostor' | 'private_media' | 'deepfake' | 'brand_clone' | 'copyright';
  complaintType: ComplaintType;
  defaultPlatform: string;
  recommendedEvidence: EvidenceCategory[];
}

export const CASE_SCENARIO_TEMPLATES: CaseScenarioTemplate[] = [
  {
    id: 'impostor',
    complaintType: 'impersonation',
    defaultPlatform: 'Instagram',
    recommendedEvidence: ['screenshot', 'identity'],
  },
  {
    id: 'private_media',
    complaintType: 'privacy',
    defaultPlatform: 'Telegram',
    recommendedEvidence: ['screenshot', 'ownership_proof'],
  },
  {
    id: 'deepfake',
    complaintType: 'deepfake',
    defaultPlatform: 'TikTok',
    recommendedEvidence: ['screenshot', 'identity'],
  },
  {
    id: 'brand_clone',
    complaintType: 'impersonation',
    defaultPlatform: 'Website / Domain',
    recommendedEvidence: ['ownership_proof', 'screenshot'],
  },
  {
    id: 'copyright',
    complaintType: 'copyright',
    defaultPlatform: 'YouTube',
    recommendedEvidence: ['ownership_proof', 'screenshot'],
  },
];

export function computeMirrorSummary(c: ProtectionCase): MirrorSummary {
  const mirrors = Array.isArray(c.mirrors) ? c.mirrors : [];
  if (mirrors.length > 0) {
    let removed = 0;
    let active = 0;
    let pending = 0;
    for (const m of mirrors) {
      if (m.status === 'removed') removed += 1;
      else if (m.status === 'active') active += 1;
      else pending += 1;
    }
    return { total: mirrors.length, removed, active, pending };
  }
  const hasConfirmedRemoval =
    c.status === 'resolved' ||
    c.status === 'closed' ||
    c.verifications?.some((v) => v.result === 'confirmed_removed');
  return {
    total: 1,
    removed: hasConfirmedRemoval ? 1 : 0,
    active: hasConfirmedRemoval ? 0 : 1,
    pending: 0,
  };
}

export function computeVerificationSealCode(caseNumber: string): string {
  const clean = String(caseNumber || '').trim().toUpperCase();
  const tailDigits = clean.split('-').pop()?.replace(/[^A-Z0-9]/g, '') || '0000';
  let sum = 35;
  for (let i = 0; i < clean.length; i += 1) {
    sum = (sum + clean.charCodeAt(i)) % 256;
  }
  const suffix = sum.toString(16).toUpperCase().padStart(2, '0');
  return `FR-SEAL-${tailDigits}${suffix}`;
}

export interface SingleCaseCertificateData {
  caseNumber: string;
  verificationSealCode: string;
  title: string;
  customerName: string;
  customerEmail: string;
  platform: string;
  sourceUrl: string;
  complaintType: ComplaintType;
  status: CaseStatus;
  submittedAt: string;
  updatedAt: string;
  monitoringEnabled: boolean;
  mirrorSummary: MirrorSummary;
  latestSubmission: {
    platform: string;
    channel: string;
    externalRef: string;
    submittedAt: string;
    summary: string;
  } | null;
  latestVerification: {
    result: VerificationCheckItem['result'];
    checkedUrl: string;
    checkedAt: string;
    notes: string;
  } | null;
  evidenceHashes: Array<{
    title: string;
    category: EvidenceCategory;
    sha256: string;
    createdAt: string;
  }>;
}

export function buildSingleCaseCertificateData(c: ProtectionCase): SingleCaseCertificateData {
  const latestSub = c.submissions && c.submissions.length > 0 ? c.submissions[0] : null;
  const latestVer = c.verifications && c.verifications.length > 0 ? c.verifications[0] : null;
  return {
    caseNumber: c.case_number,
    verificationSealCode: computeVerificationSealCode(c.case_number),
    title: c.title,
    customerName: c.customer_name,
    customerEmail: c.customer_email,
    platform: c.platform,
    sourceUrl: c.source_url,
    complaintType: c.complaint_type,
    status: c.status,
    submittedAt: c.submitted_at,
    updatedAt: c.updated_at,
    monitoringEnabled: Boolean(c.monitoring_enabled),
    mirrorSummary: computeMirrorSummary(c),
    latestSubmission: latestSub
      ? {
          platform: latestSub.platform,
          channel: latestSub.submission_channel,
          externalRef: latestSub.external_reference || 'Internal Filing',
          submittedAt: latestSub.submitted_at,
          summary: latestSub.response_summary || 'Submitted to platform team.',
        }
      : null,
    latestVerification: latestVer
      ? {
          result: latestVer.result,
          checkedUrl: latestVer.checked_url,
          checkedAt: latestVer.checked_at,
          notes: latestVer.notes || '',
        }
      : null,
    evidenceHashes: (c.evidence || []).map((ev) => ({
      title: ev.title,
      category: ev.category,
      sha256: ev.sha256_preview || 'unhashed',
      createdAt: ev.created_at,
    })),
  };
}

export interface CaseEvidencePrintEntry {
  id: string;
  title: string;
  category: EvidenceCategory;
  fileName: string;
  referenceUrl: string;
  sha256: string;
  encryptedVault: boolean;
  uploadedByRole: 'customer' | 'staff';
  uploadedByEmail: string;
  notes: string;
  createdAt: string;
}

export interface CaseEvidencePrintSection {
  certificate: SingleCaseCertificateData;
  description: string;
  evidenceItems: CaseEvidencePrintEntry[];
}

export interface CaseEvidencePrintReport {
  generatedAt: string;
  accountName: string;
  accountEmail: string;
  isMultiCase: boolean;
  totalCases: number;
  totalEvidenceItems: number;
  encryptedEvidenceCount: number;
  sections: CaseEvidencePrintSection[];
}

export function buildCaseEvidencePrintReport(
  cases: ProtectionCase[],
  user?: { name?: string; email?: string },
  nowMs: number = Date.now()
): CaseEvidencePrintReport {
  const safeCases = Array.isArray(cases) ? cases : [];
  const sections: CaseEvidencePrintSection[] = safeCases.map((c) => ({
    certificate: buildSingleCaseCertificateData(c),
    description: c.description || '',
    evidenceItems: (c.evidence || []).map((ev) => ({
      id: ev.id,
      title: ev.title,
      category: ev.category,
      fileName: ev.file_name || '',
      referenceUrl: ev.reference_url || '',
      sha256: ev.sha256_preview || 'unhashed',
      encryptedVault: Boolean(ev.has_encrypted_file),
      uploadedByRole: ev.uploaded_by_role,
      uploadedByEmail: ev.uploaded_by_email,
      notes: ev.notes || '',
      createdAt: ev.created_at,
    })),
  }));

  const totalEvidenceItems = sections.reduce((sum, sec) => sum + sec.evidenceItems.length, 0);
  const encryptedEvidenceCount = sections.reduce(
    (sum, sec) => sum + sec.evidenceItems.filter((item) => item.encryptedVault).length,
    0
  );

  return {
    generatedAt: new Date(nowMs).toISOString(),
    accountName: user?.name || safeCases[0]?.customer_name || 'Client Workspace',
    accountEmail: user?.email || safeCases[0]?.customer_email || '',
    isMultiCase: safeCases.length !== 1,
    totalCases: safeCases.length,
    totalEvidenceItems,
    encryptedEvidenceCount,
    sections,
  };
}

export function canCustomerRequestRecheck(status: CaseStatus): boolean {
  return (
    status === 'resolved' ||
    status === 'closed' ||
    status === 'rejected' ||
    status === 'action_taken'
  );
}

export function validateRecheckRequestInput(input: {
  reason: string;
  url?: string;
}): { ok: boolean; error?: string; reason: string; reappearedUrl?: string } {
  const reason = String(input.reason || '').trim();
  if (reason.length < 8) {
    return {
      ok: false,
      error: 'Please write a short note (at least 8 characters) explaining why a re-check is needed.',
      reason,
    };
  }
  const rawUrl = String(input.url || '').trim();
  if (rawUrl) {
    const guard = isPublicHttpUrlSafe(rawUrl);
    if (!guard.ok || !guard.url) {
      return {
        ok: false,
        error: guard.error || 'Please provide a valid public http:// or https:// link.',
        reason,
      };
    }
    return { ok: true, reason: reason.slice(0, 1200), reappearedUrl: guard.url.toString() };
  }
  return { ok: true, reason: reason.slice(0, 1200) };
}

export interface WatchlistSweepItemResult {
  caseId: string;
  caseNumber: string;
  previousStatus: CaseStatus;
  checkedUrl: string;
  result: VerificationCheckItem['result'];
  httpStatus: number | null;
  diagnosticNote: string;
  reappearedAlert: boolean;
}

export interface WatchlistSweepSummary {
  checkedCount: number;
  removedCount: number;
  stillOnlineCount: number;
  flaggedReappearedCount: number;
  otherCount: number;
}

export function isReappearedSweepFinding(
  previousStatus: CaseStatus,
  probeResult: VerificationCheckItem['result']
): boolean {
  return (
    (previousStatus === 'resolved' ||
      previousStatus === 'closed' ||
      previousStatus === 'action_taken') &&
    probeResult === 'still_accessible'
  );
}

export function summarizeWatchlistSweep(items: WatchlistSweepItemResult[]): WatchlistSweepSummary {
  let removedCount = 0;
  let stillOnlineCount = 0;
  let flaggedReappearedCount = 0;
  let otherCount = 0;
  for (const item of items) {
    if (item.result === 'confirmed_removed') {
      removedCount += 1;
    } else if (item.result === 'still_accessible') {
      stillOnlineCount += 1;
    } else {
      otherCount += 1;
    }
    if (item.reappearedAlert) {
      flaggedReappearedCount += 1;
    }
  }
  return {
    checkedCount: items.length,
    removedCount,
    stillOnlineCount,
    flaggedReappearedCount,
    otherCount,
  };
}

export interface PlatformBreakdownRow {
  platform: string;
  total: number;
  active: number;
  resolved: number;
  needsAttention: number;
  resolutionRatePercent: number;
  averageHours: number | null;
  averageLabel: string;
}

export interface CategoryBreakdownRow {
  complaintType: ComplaintType;
  total: number;
  active: number;
  resolved: number;
  resolutionRatePercent: number;
}

export interface PlatformAnalyticsBreakdown {
  totalCases: number;
  watchedCount: number;
  overdueCount: number;
  slaCompliancePercent: number;
  overallResolutionRatePercent: number;
  byPlatform: PlatformBreakdownRow[];
  byCategory: CategoryBreakdownRow[];
}

export function computePlatformAnalyticsBreakdown(
  cases: ProtectionCase[],
  nowMs: number = Date.now()
): PlatformAnalyticsBreakdown {
  if (cases.length === 0) {
    return {
      totalCases: 0,
      watchedCount: 0,
      overdueCount: 0,
      slaCompliancePercent: 0,
      overallResolutionRatePercent: 0,
      byPlatform: [],
      byCategory: [],
    };
  }

  let watchedCount = 0;
  let overdueCount = 0;
  let resolvedTotal = 0;

  const platformBuckets = new Map<string, ProtectionCase[]>();
  const categoryBuckets = new Map<ComplaintType, ProtectionCase[]>();

  for (const c of cases) {
    if (c.monitoring_enabled) watchedCount += 1;
    const sla = computeCaseSla(c, nowMs);
    if (sla.health === 'overdue') overdueCount += 1;
    if (c.status === 'resolved' || c.status === 'closed') resolvedTotal += 1;

    const pKey = (c.platform || 'Other').trim() || 'Other';
    const pList = platformBuckets.get(pKey);
    if (pList) pList.push(c);
    else platformBuckets.set(pKey, [c]);

    const catKey = c.complaint_type || 'other';
    const cList = categoryBuckets.get(catKey);
    if (cList) cList.push(c);
    else categoryBuckets.set(catKey, [c]);
  }

  const byPlatform: PlatformBreakdownRow[] = Array.from(platformBuckets.entries())
    .map(([platform, list]) => {
      const stats = computeCaseStats(list);
      const metrics = computeWorkspaceSummaryMetrics(list, nowMs);
      return {
        platform,
        total: list.length,
        active: stats.inProgress,
        resolved: stats.resolved,
        needsAttention: stats.needsAttention,
        resolutionRatePercent: list.length > 0 ? Math.round((stats.resolved / list.length) * 100) : 0,
        averageHours: metrics.averageTurnaroundHours,
        averageLabel: metrics.averageTurnaroundLabel,
      };
    })
    .sort((a, b) => b.total - a.total || a.platform.localeCompare(b.platform));

  const byCategory: CategoryBreakdownRow[] = Array.from(categoryBuckets.entries())
    .map(([complaintType, list]) => {
      const stats = computeCaseStats(list);
      return {
        complaintType,
        total: list.length,
        active: stats.inProgress,
        resolved: stats.resolved,
        resolutionRatePercent: list.length > 0 ? Math.round((stats.resolved / list.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total || a.complaintType.localeCompare(b.complaintType));

  return {
    totalCases: cases.length,
    watchedCount,
    overdueCount,
    slaCompliancePercent: Math.round(((cases.length - overdueCount) / cases.length) * 100),
    overallResolutionRatePercent: Math.round((resolvedTotal / cases.length) * 100),
    byPlatform,
    byCategory,
  };
}

export function buildPlatformAnalyticsCsv(breakdown: PlatformAnalyticsBreakdown): string {
  const headers = [
    'Platform',
    'Total Cases',
    'Active Cases',
    'Resolved Cases',
    'Needs Attention',
    'Resolution Rate %',
    'Average Turnaround',
  ];
  const rows = breakdown.byPlatform.map((row) => ({
    Platform: row.platform,
    'Total Cases': row.total,
    'Active Cases': row.active,
    'Resolved Cases': row.resolved,
    'Needs Attention': row.needsAttention,
    'Resolution Rate %': `${row.resolutionRatePercent}%`,
    'Average Turnaround': row.averageLabel,
  }));
  return buildCsv(headers, rows);
}


