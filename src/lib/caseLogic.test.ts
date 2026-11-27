import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCaseTransition,
  buildCaseActivityLogEntries,
  buildCaseChronologicalLog,
  buildCaseEvidencePrintReport,
  buildCaseHistoryCsv,
  buildCaseReportDocument,
  buildCsv,
  buildPlatformAnalyticsCsv,
  buildReportExportFilename,
  buildSingleCaseCertificateData,
  buildStaffQueueCsv,
  buildWorkspaceCaseActivityLog,
  canCustomerRequestRecheck,
  CASE_SCENARIO_TEMPLATES,
  classifyAuditCategory,
  classifyCaseTransitionAlert,
  classifyHttpCheckResult,
  classifyPreviewFileKind,
  computeCasePendingPriority,
  computeCaseJourneyTimeline,
  computeCaseProgression,
  computeCaseSla,
  computeCaseStats,
  computeMirrorSummary,
  computePlatformAnalyticsBreakdown,
  computePlatformOverview,
  computeVerificationSealCode,
  computeWorkspaceAlertSummary,
  computeWorkspaceSummaryMetrics,
  decodeBase64ToUtf8Preview,
  DEFAULT_PENDING_THRESHOLDS,
  deriveDefaultEvidenceTitle,
  evaluateCaseReadiness,
  filterActivityEvents,
  filterAndSortCases,
  filterAndSortInvoices,
  filterCaseActivityLogEntries,
  filterStaffCasesQueue,
  filterWorkspaceCases,
  formatCurrencyUsd,
  formatFileSizeLabel,
  formatTimelineTimestampUtc,
  formatTurnaroundDuration,
  generateTakedownNoticePacket,
  getInquiryTrackingCode,
  getNextCaseActions,
  getServiceByCode,
  hasPlatformPermission,
  isCaseActiveStatus,
  isCaseRemovedTransition,
  isPublicHttpUrlSafe,
  isReappearedSweepFinding,
  mergeActivityEventsIdempotent,
  mergeWorkspaceToastAlerts,
  pickDefaultActiveCaseForUpload,
  resolveCaseActivityVisualStatus,
  SERVICE_PACKAGES,
  summarizeCaseActivityLog,
  summarizeWatchlistSweep,
  validateCaseInput,
  validateEvidenceUploadFile,
  validateInquiryInput,
  validateRecheckRequestInput,
  type AuditEventRecord,
  type InvoiceRecord,
  type ProtectionCase,
} from './caseLogic';

const sampleCases: ProtectionCase[] = [
  {
    id: 'case-1',
    case_number: 'FR-2026-1041',
    customer_email: 'sara@example.com',
    customer_name: 'Sara Kareem',
    title: 'Impersonator Instagram profile using studio photos',
    platform: 'Instagram',
    source_url: 'https://instagram.com/fake_studio_account',
    complaint_type: 'impersonation',
    description: 'Account copies full portfolio and messages clients.',
    status: 'reviewing',
    service_code: 'impostor_account',
    submitted_at: '2026-11-10T10:00:00.000Z',
    updated_at: '2026-11-11T12:00:00.000Z',
    evidence: [],
    activity: [],
    messages: [],
    submissions: [],
    verifications: [],
  },
  {
    id: 'case-2',
    case_number: 'FR-2026-1038',
    customer_email: 'sara@example.com',
    customer_name: 'Sara Kareem',
    title: 'Cloned e-commerce storefront domain',
    platform: 'Website',
    source_url: 'https://fake-brand-shop.example',
    complaint_type: 'impersonation',
    description: 'Fraudulent checkout page imitating our brand.',
    status: 'needs_information',
    service_code: 'fake_website',
    submitted_at: '2026-11-08T09:00:00.000Z',
    updated_at: '2026-11-09T09:00:00.000Z',
    evidence: [],
    activity: [],
    messages: [],
    submissions: [],
    verifications: [],
  },
  {
    id: 'case-3',
    case_number: 'FR-2026-1022',
    customer_email: 'sara@example.com',
    customer_name: 'Sara Kareem',
    title: 'Unauthorized product photography on listing',
    platform: 'Facebook',
    source_url: 'https://facebook.com/example-post',
    complaint_type: 'copyright',
    description: 'Commercial product shots reused without permission.',
    status: 'resolved',
    service_code: 'image_removal',
    submitted_at: '2026-11-01T14:00:00.000Z',
    updated_at: '2026-11-05T16:00:00.000Z',
    evidence: [],
    activity: [],
    messages: [],
    submissions: [],
    verifications: [],
  },
];

test('computeCaseStats accurately tallies total, inProgress, resolved, and needsAttention', () => {
  const stats = computeCaseStats(sampleCases);
  assert.deepEqual(stats, {
    total: 3,
    inProgress: 2,
    resolved: 1,
    needsAttention: 1,
  });
});

test('applyCaseTransition enforces valid state machine transitions', () => {
  assert.equal(applyCaseTransition('submitted', 'start_review'), 'reviewing');
  assert.equal(applyCaseTransition('reviewing', 'approve'), 'approved');
  assert.equal(applyCaseTransition('approved', 'mark_submitted'), 'submitted_to_platform');
  assert.equal(applyCaseTransition('submitted', 'resolve'), null);
  assert.equal(getNextCaseActions('closed').length, 0);
});

test('computeCaseSla flags overdue, due_soon, on_track, and completed states accurately', () => {
  const baseMs = new Date('2026-11-10T10:00:00.000Z').getTime();
  const onTrack = computeCaseSla(sampleCases[0], baseMs + 10 * 3600000);
  assert.equal(onTrack.health, 'on_track');

  const dueSoon = computeCaseSla(sampleCases[0], baseMs + 44 * 3600000);
  assert.equal(dueSoon.health, 'due_soon');

  const overdue = computeCaseSla(sampleCases[0], baseMs + 70 * 3600000);
  assert.equal(overdue.health, 'overdue');

  const resolved = computeCaseSla(sampleCases[2], baseMs + 200 * 3600000);
  assert.equal(resolved.health, 'completed');

  const withPlatform = computeCaseSla(
    { ...sampleCases[0], status: 'submitted_to_platform' },
    baseMs + 200 * 3600000
  );
  assert.equal(withPlatform.health, 'on_track');
  assert.equal(withPlatform.label, 'With platform queue');
});

test('evaluateCaseReadiness computes readiness score, escalation channel, and priority SLA', () => {
  const full = evaluateCaseReadiness({
    issueCategory: 'video_extortion',
    platform: 'TikTok',
    hasDirectUrl: true,
    hasOwnershipOrId: true,
    activeExtortionThreat: true,
  });
  assert.equal(full.readinessScore, 100);
  assert.equal(full.recommendedPackage.code, 'video_extortion');
  assert.equal(full.turnaroundLabel, '12h initial triage SLA');
  assert.match(full.escalationChannel, /TikTok/i);

  const partial = evaluateCaseReadiness({
    issueCategory: 'fake_website',
    platform: 'Website / Domain',
    hasDirectUrl: false,
    hasOwnershipOrId: false,
    activeExtortionThreat: false,
  });
  assert.equal(partial.readinessScore, 45);
  assert.equal(partial.recommendedPackage.priceUsd, 1500);
});

test('filterAndSortCases filters across title, platform, status, and case number', () => {
  const byPlatform = filterAndSortCases(sampleCases, 'instagram', 'newest');
  assert.equal(byPlatform.length, 1);
  assert.equal(byPlatform[0].id, 'case-1');

  const sortedAz = filterAndSortCases(sampleCases, '', 'case_az');
  assert.deepEqual(
    sortedAz.map((c) => c.case_number),
    ['FR-2026-1022', 'FR-2026-1038', 'FR-2026-1041']
  );
});

test('filterAndSortInvoices sorts by amount and filters by service name', () => {
  const invoices: InvoiceRecord[] = [
    {
      id: 'inv-1',
      invoice_number: 'INV-1001',
      case_id: 'case-1',
      case_number: 'FR-2026-1041',
      customer_email: 'sara@example.com',
      service_code: 'impostor_account',
      service_name: 'Impostor Account Removal',
      amount_usd: 150,
      status: 'unpaid',
      created_at: '2026-11-10T10:00:00.000Z',
    },
    {
      id: 'inv-2',
      invoice_number: 'INV-1002',
      case_id: 'case-2',
      case_number: 'FR-2026-1038',
      customer_email: 'sara@example.com',
      service_code: 'fake_website',
      service_name: 'Fake Website & Brand Impersonation Removal',
      amount_usd: 1500,
      status: 'paid',
      created_at: '2026-11-11T10:00:00.000Z',
    },
  ];
  const highToLow = filterAndSortInvoices(invoices, '', 'amount_high');
  assert.equal(highToLow[0].amount_usd, 1500);
  const searched = filterAndSortInvoices(invoices, 'impostor', 'newest');
  assert.equal(searched.length, 1);
});

test('validateInquiryInput & validateCaseInput reject invalid inputs and accept valid ones', () => {
  assert.equal(
    validateInquiryInput({
      name: 'A',
      email: 'bad-email',
      interest: 'Image Removal',
      message: 'Help me',
    }).ok,
    false
  );
  assert.equal(
    validateInquiryInput({
      name: 'Layla Hassan',
      email: 'layla@example.com',
      interest: 'Image Removal',
      message: 'Unauthorized photo posted on social media.',
    }).ok,
    true
  );
  assert.equal(
    validateCaseInput({
      title: 'Unauthorized video',
      platform: 'TikTok',
      source_url: 'not-a-url',
    }).ok,
    false
  );
  assert.equal(
    validateCaseInput({
      title: 'Unauthorized video',
      platform: 'TikTok',
      source_url: 'https://www.tiktok.com/@user/video/123',
    }).ok,
    true
  );
});

test('SERVICE_PACKAGES catalog contains all 8 Full Remove services and formats USD cleanly', () => {
  assert.equal(SERVICE_PACKAGES.length, 8);
  const deepfake = getServiceByCode('deepfake_video');
  assert.ok(deepfake);
  assert.equal(formatCurrencyUsd(deepfake.priceUsd), '$1,000');
});

test('buildCsv escapes quotes and prevents spreadsheet formula injection', () => {
  const csv = buildCsv(
    ['name', 'note'],
    [
      { name: '=CMD()', note: 'Normal "quoted" text' },
      { name: 'Sara', note: '+1-234' },
    ]
  );
  assert.match(csv, /"'=CMD\(\)"/);
  assert.match(csv, /"Normal ""quoted"" text"/);
  assert.match(csv, /"'\+1-234"/);
});

test('computePlatformOverview tallies open workloads and pending payments accurately', () => {
  const overview = computePlatformOverview({
    customerEmails: ['sara@example.com', 'sara@example.com', 'noor@example.com'],
    cases: sampleCases,
    tickets: [{ status: 'open' }, { status: 'resolved' }],
    requests: [{ status: 'received' }, { status: 'completed' }],
    payments: [{ status: 'pending_review' }, { status: 'approved' }],
  });
  assert.deepEqual(overview, {
    organizations: 2,
    casesTotal: 3,
    casesOpen: 2,
    supportTotal: 2,
    supportOpen: 1,
    requestsTotal: 2,
    requestsOpen: 1,
    pendingPayments: 1,
  });
});

test('classifyAuditCategory routes administrative and system events into semantic buckets', () => {
  assert.equal(classifyAuditCategory('platform_role_granted', 'platform_role'), 'security_role');
  assert.equal(classifyAuditCategory('payment_review_approved', 'payment'), 'payment_billing');
  assert.equal(classifyAuditCategory('case_status_updated', 'case'), 'case_workflow');
  assert.equal(classifyAuditCategory('privacy_request_reviewed', 'data_request'), 'support_privacy');
  assert.equal(classifyAuditCategory('customer_notice_broadcast', 'notification'), 'system_modification');
});

test('mergeActivityEventsIdempotent deduplicates repeated event IDs and keeps newest-first ordering', () => {
  const initial: AuditEventRecord[] = [
    {
      id: 'aud-1',
      actor: 'ops@fremove.com',
      action: 'case_status_updated',
      entity_type: 'case',
      entity_id: 'FR-2026-1041',
      organization_name: 'Sara Kareem',
      details: { status: 'reviewing' },
      created_at: '2026-11-18T10:00:00.000Z',
    },
  ];

  const dupAndNew: AuditEventRecord[] = [
    {
      ...initial[0],
    },
    {
      id: 'aud-2',
      actor: 'sara@example.com',
      action: 'payment_submitted',
      entity_type: 'payment',
      entity_id: 'pay-99',
      organization_name: 'Sara Kareem',
      details: { amount_usd: 150 },
      created_at: '2026-11-18T10:05:00.000Z',
    },
  ];

  const merged = mergeActivityEventsIdempotent(initial, dupAndNew, 50);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, 'aud-2');
  assert.equal(merged[1].id, 'aud-1');
});

test('filterActivityEvents filters by category and substring across actor, action, and details', () => {
  const items: AuditEventRecord[] = [
    {
      id: 'aud-10',
      actor: 'ops@fremove.com',
      action: 'payment_review_approved',
      entity_type: 'payment',
      entity_id: 'pay-1',
      organization_name: 'Studio North',
      details: { invoice_number: 'INV-2026-1001' },
      created_at: '2026-11-18T10:00:00.000Z',
    },
    {
      id: 'aud-11',
      actor: 'ops@fremove.com',
      action: 'platform_role_granted',
      entity_type: 'platform_role',
      entity_id: 'analyst@fremove.com',
      organization_name: 'Platform-wide',
      details: { role: 'case_manager' },
      created_at: '2026-11-18T10:01:00.000Z',
    },
  ];

  assert.equal(filterActivityEvents(items, { query: '', category: 'payment_billing' }).length, 1);
  assert.equal(filterActivityEvents(items, { query: 'inv-2026-1001', category: 'all' }).length, 1);
  assert.equal(filterActivityEvents(items, { query: 'case_manager', category: 'security_role' }).length, 1);
  assert.equal(filterActivityEvents(items, { query: 'case_manager', category: 'payment_billing' }).length, 0);
});

test('hasPlatformPermission enforces RBAC read/write boundaries per role', () => {
  assert.equal(hasPlatformPermission('operations_admin', 'write_roles'), true);
  assert.equal(hasPlatformPermission('operations_admin', 'write_payments'), true);
  assert.equal(hasPlatformPermission('auditor', 'audit'), true);
  assert.equal(hasPlatformPermission('auditor', 'write_cases'), false);
  assert.equal(hasPlatformPermission('auditor', 'write_payments'), false);
  assert.equal(hasPlatformPermission('support_agent', 'write_support'), true);
  assert.equal(hasPlatformPermission('support_agent', 'write_payments'), false);
  assert.equal(hasPlatformPermission('privacy_officer', 'write_requests'), true);
  assert.equal(hasPlatformPermission('privacy_officer', 'write_roles'), false);
});

test('generateTakedownNoticePacket creates DMCA and impersonation notices with evidence SHA-256 inventory', () => {
  const c: ProtectionCase = {
    ...sampleCases[2],
    evidence: [
      {
        id: 'ev-1',
        title: 'Original RAW File Certificate',
        category: 'ownership_proof',
        sha256_preview: '9f8e7d6c5b4a3210',
        uploaded_by_role: 'customer',
        uploaded_by_email: 'sara@example.com',
        created_at: '2026-11-10T10:00:00.000Z',
      },
    ],
  };

  const dmca = generateTakedownNoticePacket({
    caseItem: c,
    customerName: 'Sara Kareem',
    customerEmail: 'sara@example.com',
    targetChannel: 'platform_rights',
  });
  assert.match(dmca.subject, /DMCA Copyright Infringement/i);
  assert.match(dmca.body, /17 U\.S\.C\. § 512\(c\)/);
  assert.match(dmca.body, /9f8e7d6c5b4a3210/);
  assert.match(dmca.body, /https:\/\/facebook\.com\/example-post/);
});

test('getInquiryTrackingCode formats consistent tracking code', () => {
  assert.equal(getInquiryTrackingCode('inq-ab12cd34'), 'INQ-AB12CD34');
});

test('isPublicHttpUrlSafe blocks loopback/RFC1918 addresses and classifyHttpCheckResult maps HTTP codes', () => {
  assert.equal(isPublicHttpUrlSafe('http://127.0.0.1:3000/api').ok, false);
  assert.equal(isPublicHttpUrlSafe('http://169.254.169.254/latest/meta-data').ok, false);
  assert.equal(isPublicHttpUrlSafe('http://192.168.1.10').ok, false);
  assert.equal(isPublicHttpUrlSafe('http://localhost:8080').ok, false);
  assert.equal(isPublicHttpUrlSafe('file:///etc/passwd').ok, false);
  assert.equal(isPublicHttpUrlSafe('https://instagram.com/fake_profile').ok, true);

  assert.equal(classifyHttpCheckResult(404), 'confirmed_removed');
  assert.equal(classifyHttpCheckResult(410), 'confirmed_removed');
  assert.equal(classifyHttpCheckResult(403), 'login_required');
  assert.equal(classifyHttpCheckResult(302), 'redirected');
  assert.equal(classifyHttpCheckResult(200), 'still_accessible');
});

test('computeCaseProgression maps case statuses accurately across 4 operational phases', () => {
  const inv = computeCaseProgression({ status: 'reviewing', submissions: [], verifications: [] });
  assert.equal(inv.currentPhaseId, 'investigation');
  assert.equal(inv.currentPhaseLabel, 'Investigation');
  assert.equal(inv.phases[0].state, 'current');
  assert.equal(inv.phases[1].state, 'upcoming');

  const sub = computeCaseProgression({
    status: 'submitted_to_platform',
    submissions: [],
    verifications: [],
  });
  assert.equal(sub.currentPhaseId, 'submission');
  assert.equal(sub.progressPercent, 50);
  assert.equal(sub.phases[0].state, 'completed');
  assert.equal(sub.phases[1].state, 'current');

  const pendingVer = computeCaseProgression({
    status: 'action_taken',
    submissions: [],
    verifications: [],
  });
  assert.equal(pendingVer.currentPhaseId, 'pending_verification');
  assert.equal(pendingVer.currentPhaseLabel, 'Pending Verification');
  assert.equal(pendingVer.progressPercent, 75);
  assert.equal(pendingVer.phases[0].state, 'completed');
  assert.equal(pendingVer.phases[1].state, 'completed');
  assert.equal(pendingVer.phases[2].state, 'current');

  const resolved = computeCaseProgression({ status: 'resolved', submissions: [], verifications: [] });
  assert.equal(resolved.currentPhaseId, 'resolved');
  assert.equal(resolved.progressPercent, 100);
  assert.ok(resolved.phases.every((p) => p.state === 'completed'));

  const needsInfo = computeCaseProgression({
    status: 'needs_information',
    submissions: [],
    verifications: [],
  });
  assert.equal(needsInfo.exceptionFlag, 'needs_information');
  assert.equal(needsInfo.phases[0].state, 'attention');
});

test('buildCaseChronologicalLog orders timestamped events chronologically, emits Evidence uploaded & Platform responded, deduplicates uploads, and strips staff-only notes', () => {
  const richCase: ProtectionCase = {
    ...sampleCases[0],
    evidence: [
      {
        id: 'ev-100',
        title: 'Impersonation screenshot',
        category: 'screenshot',
        file_name: 'ig-fake.png',
        sha256_preview: 'a94e8f219c4d10b7',
        has_encrypted_file: true,
        uploaded_by_role: 'customer',
        uploaded_by_email: 'sara@example.com',
        created_at: '2026-11-10T11:00:00.000Z',
      },
    ],
    activity: [
      {
        id: 'act-1',
        activity_type: 'submitted',
        message: 'Case received for triage.',
        visibility: 'customer',
        created_at: '2026-11-10T10:00:00.000Z',
      },
      {
        id: 'act-internal',
        activity_type: 'internal_note',
        message: 'INTERNAL STAFF ONLY DO NOT LEAK',
        visibility: 'staff',
        created_at: '2026-11-10T10:30:00.000Z',
      },
      {
        id: 'act-dup-ev',
        activity_type: 'evidence_added',
        message: 'Evidence archived (AES-256-GCM encrypted): "Impersonation screenshot" (a94e8f219c4d10b7).',
        visibility: 'customer',
        created_at: '2026-11-10T11:00:00.000Z',
      },
      {
        id: 'act-2',
        activity_type: 'submitted_to_platform',
        message: 'Filed formal impersonation packet.',
        visibility: 'customer',
        created_at: '2026-11-11T09:00:00.000Z',
      },
    ],
    submissions: [
      {
        id: 'sub-1',
        platform: 'Instagram',
        submission_channel: 'platform_portal',
        status: 'under_review',
        external_reference: 'IG-88412',
        response_summary: 'Acknowledged by Meta Rights & Impersonation queue.',
        submitted_at: '2026-11-11T09:00:00.000Z',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        sender_role: 'staff',
        sender_email: 'ops@fremove.com',
        message: 'Instagram queue confirmed receipt.',
        created_at: '2026-11-11T12:00:00.000Z',
      },
    ],
    verifications: [
      {
        id: 'ver-1',
        result: 'confirmed_removed',
        checked_url: 'https://instagram.com/fake_studio_account',
        notes: 'HTTP 404 Not Found',
        checked_at: '2026-11-12T15:30:00.000Z',
      },
    ],
  };

  const asc = buildCaseChronologicalLog(richCase, 'asc');
  assert.equal(asc.length, 6);
  assert.equal(
    asc.some((e) => e.detail.includes('INTERNAL STAFF ONLY DO NOT LEAK')),
    false
  );
  assert.deepEqual(
    asc.map((e) => e.label),
    [
      'Case submitted',
      'Evidence uploaded',
      'Submitted to platform',
      'Platform responded',
      'Specialist message',
      'Verification check',
    ]
  );
  assert.match(asc[1].meta || '', /SHA256:a94e8f219c4d10b7/);
  assert.match(asc[1].meta || '', /AES-256-GCM/);
  assert.match(asc[3].detail, /Meta Rights & Impersonation queue/);
  assert.equal(formatTimelineTimestampUtc(asc[5].timestamp), '2026-11-12 15:30 UTC');

  const desc = buildCaseChronologicalLog(richCase, 'desc');
  assert.equal(desc[0].label, 'Verification check');
  assert.equal(desc[desc.length - 1].label, 'Case submitted');
});

test('formatTurnaroundDuration and computeWorkspaceSummaryMetrics calculate active cases and average turnaround across submissions', () => {
  assert.equal(formatTurnaroundDuration(null), '—');
  assert.equal(formatTurnaroundDuration(0.4), '< 1h');
  assert.equal(formatTurnaroundDuration(18.5), '18.5h');
  assert.equal(formatTurnaroundDuration(48), '2d');
  assert.equal(formatTurnaroundDuration(60), '2d 12h');

  const nowMs = new Date('2026-11-12T10:00:00.000Z').getTime();
  // sampleCases:
  // case-1 (reviewing): submitted 2026-11-10T10:00Z -> 48h active
  // case-2 (needs_information): submitted 2026-11-08T09:00Z -> 97h active
  // case-3 (resolved): submitted 2026-11-01T14:00Z, updated 2026-11-05T16:00Z -> 98h completed
  // avg across all 3 submissions = (48 + 97 + 98) / 3 = 81h = 3d 9h
  const metrics = computeWorkspaceSummaryMetrics(sampleCases, nowMs);
  assert.equal(metrics.totalCases, 3);
  assert.equal(metrics.activeCases, 2);
  assert.equal(metrics.resolvedCases, 1);
  assert.equal(metrics.needsAttentionCases, 1);
  assert.equal(metrics.completionRatePercent, 33);
  assert.equal(metrics.averageTurnaroundHours, 81);
  assert.equal(metrics.averageTurnaroundLabel, '3d 9h');
  assert.equal(metrics.resolvedAverageHours, 98);
  assert.equal(metrics.resolvedAverageLabel, '4d 2h');

  const emptyMetrics = computeWorkspaceSummaryMetrics([], nowMs);
  assert.equal(emptyMetrics.activeCases, 0);
  assert.equal(emptyMetrics.averageTurnaroundHours, null);
  assert.equal(emptyMetrics.averageTurnaroundLabel, '—');
});

test('classifyPreviewFileKind, formatFileSizeLabel, and decodeBase64ToUtf8Preview support images, PDFs, and UTF-8 documents safely', () => {
  assert.equal(classifyPreviewFileKind('image/png', 'capture.png'), 'image');
  assert.equal(classifyPreviewFileKind('', 'evidence.WEBP'), 'image');
  assert.equal(classifyPreviewFileKind('application/pdf', 'notice.pdf'), 'pdf');
  assert.equal(classifyPreviewFileKind('text/plain', 'whois.txt'), 'text');
  assert.equal(classifyPreviewFileKind('application/json', 'headers.json'), 'text');
  assert.equal(classifyPreviewFileKind('application/zip', 'archive.zip'), 'unsupported');

  assert.equal(formatFileSizeLabel(512), '512 B');
  assert.equal(formatFileSizeLabel(15360), '15 KB');
  assert.equal(formatFileSizeLabel(1.5 * 1024 * 1024), '1.50 MB');

  const sampleB64 = Buffer.from('WHOIS domain proof: fremove-demo.example', 'utf8').toString('base64');
  const decoded = decodeBase64ToUtf8Preview(sampleB64, 20);
  assert.equal(decoded.text, 'WHOIS domain proof: ');
  assert.equal(decoded.truncated, true);

  const full = decodeBase64ToUtf8Preview(`data:text/plain;base64,${sampleB64}`);
  assert.equal(full.text, 'WHOIS domain proof: fremove-demo.example');
  assert.equal(full.truncated, false);
});

test('computeCasePendingPriority classifies High Priority and Urgent cases beyond configurable thresholds while ignoring terminal cases', () => {
  const case1StartMs = new Date(sampleCases[0].submitted_at).getTime();

  // Within <= 48h -> normal (no escalation badge)
  const atBoundary = computeCasePendingPriority(
    sampleCases[0],
    DEFAULT_PENDING_THRESHOLDS,
    case1StartMs + 48 * 3600000
  );
  assert.equal(atBoundary.tier, 'normal');
  assert.equal(atBoundary.badgeLabel, null);
  assert.equal(atBoundary.thresholdExceededHours, null);

  // Strictly > 48h and <= 120h -> High Priority
  const highPriority = computeCasePendingPriority(
    sampleCases[0],
    DEFAULT_PENDING_THRESHOLDS,
    case1StartMs + 72 * 3600000
  );
  assert.equal(highPriority.tier, 'high_priority');
  assert.equal(highPriority.badgeLabel, 'High Priority');
  assert.equal(highPriority.thresholdExceededHours, 48);
  assert.equal(highPriority.pendingDurationLabel, '3d');

  // Strictly > 120h -> Urgent
  const urgent = computeCasePendingPriority(
    sampleCases[0],
    DEFAULT_PENDING_THRESHOLDS,
    case1StartMs + 144 * 3600000
  );
  assert.equal(urgent.tier, 'urgent');
  assert.equal(urgent.badgeLabel, 'Urgent');
  assert.equal(urgent.thresholdExceededHours, 120);
  assert.equal(urgent.pendingDurationLabel, '6d');

  // Custom stricter threshold (24h / 72h) elevates a 72.5h pending case to Urgent
  const stricter = computeCasePendingPriority(
    sampleCases[0],
    { highPriorityHours: 24, urgentHours: 72 },
    case1StartMs + 72.5 * 3600000
  );
  assert.equal(stricter.tier, 'urgent');
  assert.equal(stricter.badgeLabel, 'Urgent');

  // Terminal cases ('resolved', 'closed', 'rejected') never show pending escalation badges regardless of age
  const agedNowMs = case1StartMs + 500 * 3600000;
  for (const terminalStatus of ['resolved', 'closed', 'rejected'] as const) {
    const terminalResult = computeCasePendingPriority(
      { ...sampleCases[2], status: terminalStatus },
      { highPriorityHours: 1, urgentHours: 2 },
      agedNowMs
    );
    assert.equal(terminalResult.tier, 'normal');
    assert.equal(terminalResult.badgeLabel, null);
  }
});

test('buildCaseReportDocument, buildCaseHistoryCsv, and buildReportExportFilename compile complete case histories and status reports safely', () => {
  const nowMs = new Date('2026-11-14T10:00:00.000Z').getTime();
  const casesWithHistory: ProtectionCase[] = [
    {
      ...sampleCases[0],
      evidence: [
        {
          id: 'ev-export-1',
          title: 'Account impersonation capture',
          category: 'screenshot',
          file_name: 'ig-capture.png',
          sha256_preview: '1234abcd5678ef90',
          uploaded_by_role: 'customer',
          uploaded_by_email: 'sara@example.com',
          created_at: '2026-11-10T12:00:00.000Z',
        },
      ],
      activity: [
        {
          id: 'act-exp-1',
          activity_type: 'submitted',
          message: 'Initial case filed.',
          visibility: 'customer',
          created_at: '2026-11-10T10:00:00.000Z',
        },
      ],
      submissions: [
        {
          id: 'sub-exp-1',
          platform: 'Instagram',
          submission_channel: 'platform_portal',
          status: 'acknowledged',
          external_reference: 'IG-9921',
          response_summary: 'Escalated to Rights Desk.',
          submitted_at: '2026-11-11T09:00:00.000Z',
        },
      ],
    },
    sampleCases[2],
  ];

  const report = buildCaseReportDocument({
    cases: casesWithHistory,
    user: { name: 'Sara Kareem', email: 'sara@example.com' },
    thresholds: { highPriorityHours: 48, urgentHours: 120 },
    nowMs,
  });

  assert.equal(report.accountName, 'Sara Kareem');
  assert.equal(report.summary.totalCases, 2);
  assert.equal(report.summary.activeCases, 1);
  assert.equal(report.rows.length, 2);
  assert.equal(report.rows[0].priorityLabel, 'High Priority'); // 96h pending > 48h
  assert.equal(report.rows[0].evidenceCount, 1);
  assert.equal(report.rows[0].timeline.length, 3); // submitted + evidence + platform responded
  assert.equal(report.rows[1].priorityLabel, 'Normal'); // resolved case

  const csv = buildCaseHistoryCsv({
    cases: [
      {
        ...casesWithHistory[0],
        title: '=FORMULA_RISK("test")',
      },
      casesWithHistory[1],
    ],
    user: { name: 'Sara Kareem', email: 'sara@example.com' },
    thresholds: { highPriorityHours: 48, urgentHours: 120 },
    nowMs,
  });

  assert.match(csv, /"Case Number","Title","Platform"/);
  assert.match(csv, /"'=FORMULA_RISK\(""test""\)"/);
  assert.match(csv, /"High Priority"/);
  assert.match(csv, /Evidence uploaded: Account impersonation capture/);
  assert.match(csv, /Platform responded: Instagram: Escalated to Rights Desk/);

  assert.equal(
    buildReportExportFilename('csv', 'all', nowMs),
    'full-remove-case-report-2026-11-14.csv'
  );
  assert.equal(
    buildReportExportFilename('pdf', 'FR-2026-1041', nowMs),
    'full-remove-case-report-fr-2026-1041-2026-11-14.pdf'
  );
});

test('classifyCaseTransitionAlert, computeWorkspaceAlertSummary, and mergeWorkspaceToastAlerts detect Resolved & urgent input transitions idempotently', () => {
  const nowMs = new Date('2026-11-11T10:00:00.000Z').getTime();

  // Initial load without prevCase returns null (handled by persistent badge summary instead of toast spam)
  assert.equal(classifyCaseTransitionAlert(undefined, sampleCases[2], undefined, nowMs), null);

  // Transition to 'resolved' triggers resolved alert
  const resolvedAlert = classifyCaseTransitionAlert(
    sampleCases[0],
    { ...sampleCases[0], status: 'resolved', updated_at: '2026-11-11T10:00:00.000Z' },
    undefined,
    nowMs
  );
  assert.ok(resolvedAlert);
  assert.equal(resolvedAlert.kind, 'resolved');
  assert.match(resolvedAlert.headline, /FR-2026-1041 marked Resolved/);

  // Transition to 'needs_information' triggers urgent_input alert
  const needsInfoAlert = classifyCaseTransitionAlert(
    sampleCases[0],
    { ...sampleCases[0], status: 'needs_information', updated_at: '2026-11-11T10:05:00.000Z' },
    undefined,
    nowMs
  );
  assert.ok(needsInfoAlert);
  assert.equal(needsInfoAlert.kind, 'urgent_input');
  assert.match(needsInfoAlert.headline, /requires urgent input/);

  // Non-changing refresh returns null
  assert.equal(
    classifyCaseTransitionAlert(sampleCases[2], sampleCases[2], undefined, nowMs),
    null
  );

  // Deduplicated toast queue
  const queue1 = mergeWorkspaceToastAlerts([], resolvedAlert);
  const queue2 = mergeWorkspaceToastAlerts(queue1, resolvedAlert);
  const queue3 = mergeWorkspaceToastAlerts(queue2, needsInfoAlert);
  assert.equal(queue2.length, 1);
  assert.equal(queue3.length, 2);
  assert.equal(queue3[0].kind, 'urgent_input');

  // Persistent badge summary tracks both urgent input and resolved cases
  const badgeSummary = computeWorkspaceAlertSummary(
    sampleCases,
    { highPriorityHours: 48, urgentHours: 120 },
    new Date('2026-11-12T10:00:00.000Z').getTime()
  );
  assert.equal(badgeSummary.urgentCount, 1); // case-2 needs_information
  assert.equal(badgeSummary.resolvedCount, 1); // case-3 resolved
  assert.equal(badgeSummary.urgentInputCases[0].caseItem.case_number, 'FR-2026-1038');
});

test('filterWorkspaceCases filters active cases by case ID, case number, and platform, and computeCaseJourneyTimeline tracks Submission to Verification', () => {
  assert.equal(isCaseActiveStatus('reviewing'), true);
  assert.equal(isCaseActiveStatus('needs_information'), true);
  assert.equal(isCaseActiveStatus('resolved'), false);
  assert.equal(isCaseActiveStatus('closed'), false);
  assert.equal(isCaseActiveStatus('rejected'), false);

  const activeOnly = filterWorkspaceCases(sampleCases, { query: '', activeOnly: true });
  assert.deepEqual(
    activeOnly.map((c) => c.case_number),
    ['FR-2026-1041', 'FR-2026-1038']
  );

  // Filter by internal case ID
  const byId = filterWorkspaceCases(sampleCases, { query: 'case-2', activeOnly: true });
  assert.equal(byId.length, 1);
  assert.equal(byId[0].case_number, 'FR-2026-1038');

  // Filter active cases by platform name
  const byPlatform = filterWorkspaceCases(sampleCases, { query: 'Instagram', activeOnly: true });
  assert.equal(byPlatform.length, 1);
  assert.equal(byPlatform[0].case_number, 'FR-2026-1041');

  // Resolved platform filtered out when activeOnly=true
  assert.equal(
    filterWorkspaceCases(sampleCases, { query: 'Facebook', activeOnly: true }).length,
    0
  );

  // Journey timeline mapping from Submission -> Verification
  const reviewingJourney = computeCaseJourneyTimeline(sampleCases[0]);
  assert.equal(reviewingJourney.progressPercent, 38);
  assert.equal(reviewingJourney.milestones[0].state, 'completed'); // Submission
  assert.equal(reviewingJourney.milestones[1].state, 'current'); // Investigation
  assert.equal(reviewingJourney.milestones[3].state, 'upcoming'); // Verification

  const actionTakenJourney = computeCaseJourneyTimeline({
    ...sampleCases[0],
    status: 'action_taken',
  });
  assert.equal(actionTakenJourney.progressPercent, 85);
  assert.equal(actionTakenJourney.milestones[2].state, 'completed');
  assert.equal(actionTakenJourney.milestones[3].state, 'current');

  const resolvedJourney = computeCaseJourneyTimeline(sampleCases[2]);
  assert.equal(resolvedJourney.progressPercent, 100);
  assert.equal(resolvedJourney.tone, 'emerald');
  assert.ok(resolvedJourney.milestones.every((m) => m.state === 'completed'));
});

test('filterStaffCasesQueue, buildStaffQueueCsv, CASE_SCENARIO_TEMPLATES, and buildSingleCaseCertificateData work accurately', () => {
  const openQueue = filterStaffCasesQueue(sampleCases, { statusFilter: 'open' });
  assert.deepEqual(
    openQueue.map((c) => c.case_number),
    ['FR-2026-1041', 'FR-2026-1038']
  );

  const resolvedQueue = filterStaffCasesQueue(sampleCases, { statusFilter: 'resolved' });
  assert.deepEqual(
    resolvedQueue.map((c) => c.case_number),
    ['FR-2026-1022']
  );

  const byAssignee = filterStaffCasesQueue(
    [{ ...sampleCases[0], assigned_to: 'amina@fremove.com' }, sampleCases[1]],
    {
      statusFilter: 'all',
      assigneeEmail: 'amina@fremove.com',
    }
  );
  assert.equal(byAssignee.length, 1);
  assert.equal(byAssignee[0].case_number, 'FR-2026-1041');

  const csv = buildStaffQueueCsv(sampleCases);
  assert.match(csv, /"Case Number","Customer","Customer Email"/);
  assert.match(csv, /"FR-2026-1041","Sara Kareem"/);
  assert.match(csv, /"FR-2026-1022"/);

  assert.equal(CASE_SCENARIO_TEMPLATES.length, 5);
  assert.ok(CASE_SCENARIO_TEMPLATES.some((tpl) => tpl.id === 'deepfake' && tpl.complaintType === 'deepfake'));

  const cert = buildSingleCaseCertificateData({
    ...sampleCases[2],
    monitoring_enabled: true,
    evidence: [
      {
        id: 'ev-cert-1',
        title: 'Screenshot proof',
        category: 'screenshot',
        sha256_preview: 'abcd1234ef567890',
        uploaded_by_role: 'customer',
        uploaded_by_email: 'sara@example.com',
        created_at: '2026-11-01T15:00:00.000Z',
      },
    ],
    verifications: [
      {
        id: 'ver-cert-1',
        result: 'confirmed_removed',
        checked_url: 'https://facebook.com/example-resolved',
        notes: 'HTTP 404 verified',
        checked_at: '2026-11-05T16:00:00.000Z',
      },
    ],
  });
  assert.equal(cert.caseNumber, 'FR-2026-1022');
  assert.equal(cert.verificationSealCode, 'FR-SEAL-1022A4');
  assert.equal(computeVerificationSealCode('FR-2026-1022'), 'FR-SEAL-1022A4');
  assert.equal(cert.mirrorSummary.total, 1);
  assert.equal(cert.mirrorSummary.removed, 1);
  const customMirrorSummary = computeMirrorSummary({
    ...sampleCases[0],
    mirrors: [
      { id: 'm1', url: 'https://x.com/1', status: 'removed' },
      { id: 'm2', url: 'https://x.com/2', status: 'active' },
      { id: 'm3', url: 'https://x.com/3', status: 'pending' },
    ],
  });
  assert.deepEqual(customMirrorSummary, { total: 3, removed: 1, active: 1, pending: 1 });
  assert.equal(cert.monitoringEnabled, true);
  assert.equal(cert.latestVerification?.result, 'confirmed_removed');
  assert.equal(cert.evidenceHashes[0].sha256, 'abcd1234ef567890');
});

test('canCustomerRequestRecheck, validateRecheckRequestInput, watched filter, sla_urgent sort, summarizeWatchlistSweep, and computePlatformAnalyticsBreakdown', () => {
  // Eligibility checks
  assert.equal(canCustomerRequestRecheck('resolved'), true);
  assert.equal(canCustomerRequestRecheck('closed'), true);
  assert.equal(canCustomerRequestRecheck('rejected'), true);
  assert.equal(canCustomerRequestRecheck('action_taken'), true);
  assert.equal(canCustomerRequestRecheck('reviewing'), false);
  assert.equal(canCustomerRequestRecheck('disputed'), false);

  // Validation checks (min reason + optional SSRF-safe public URL)
  assert.equal(validateRecheckRequestInput({ reason: 'short' }).ok, false);
  assert.equal(
    validateRecheckRequestInput({
      reason: 'The fake profile reappeared online yesterday.',
      url: 'http://127.0.0.1/internal',
    }).ok,
    false
  );
  const validRecheck = validateRecheckRequestInput({
    reason: 'The removed post was re-uploaded under a mirror link.',
    url: 'https://instagram.com/reupload-link',
  });
  assert.equal(validRecheck.ok, true);
  assert.equal(validRecheck.reappearedUrl, 'https://instagram.com/reupload-link');

  // Watched queue filter & Urgent SLA sort
  const mixedCases: ProtectionCase[] = [
    { ...sampleCases[2], monitoring_enabled: true }, // resolved, watched
    { ...sampleCases[0], monitoring_enabled: false }, // reviewing
    { ...sampleCases[1], status: 'disputed', monitoring_enabled: true }, // disputed, watched
  ];
  const watched = filterStaffCasesQueue(mixedCases, { statusFilter: 'watched' });
  assert.equal(watched.length, 2);

  const urgentSorted = filterStaffCasesQueue(mixedCases, {
    sort: 'sla_urgent',
    nowMs: new Date('2026-11-15T10:00:00.000Z').getTime(),
  });
  assert.equal(urgentSorted[0].status, 'disputed');
  assert.equal(urgentSorted[urgentSorted.length - 1].status, 'resolved');

  // Watchlist sweep summary
  assert.equal(isReappearedSweepFinding('resolved', 'still_accessible'), true);
  assert.equal(isReappearedSweepFinding('reviewing', 'still_accessible'), false);
  const sweep = summarizeWatchlistSweep([
    {
      caseId: 'c1',
      caseNumber: 'FR-1',
      previousStatus: 'resolved',
      checkedUrl: 'https://example.com/1',
      result: 'still_accessible',
      httpStatus: 200,
      diagnosticNote: 'HTTP 200',
      reappearedAlert: true,
    },
    {
      caseId: 'c2',
      caseNumber: 'FR-2',
      previousStatus: 'reviewing',
      checkedUrl: 'https://example.com/2',
      result: 'confirmed_removed',
      httpStatus: 404,
      diagnosticNote: 'HTTP 404',
      reappearedAlert: false,
    },
    {
      caseId: 'c3',
      caseNumber: 'FR-3',
      previousStatus: 'reviewing',
      checkedUrl: 'https://example.com/3',
      result: 'redirected',
      httpStatus: 302,
      diagnosticNote: 'HTTP 302',
      reappearedAlert: false,
    },
  ]);
  assert.equal(sweep.checkedCount, 3);
  assert.equal(sweep.removedCount, 1);
  assert.equal(sweep.stillOnlineCount, 1);
  assert.equal(sweep.flaggedReappearedCount, 1);
  assert.equal(sweep.otherCount, 1);

  // Platform & category analytics breakdown + empty edge case
  const emptyBreakdown = computePlatformAnalyticsBreakdown([]);
  assert.equal(emptyBreakdown.totalCases, 0);
  assert.equal(emptyBreakdown.byPlatform.length, 0);

  const nowMs = new Date('2026-11-12T10:00:00.000Z').getTime();
  const breakdown = computePlatformAnalyticsBreakdown(mixedCases, nowMs);
  assert.equal(breakdown.totalCases, 3);
  assert.equal(breakdown.watchedCount, 2);
  assert.equal(breakdown.overallResolutionRatePercent, 33);
  assert.equal(breakdown.byPlatform.length, 3);
  assert.ok(breakdown.byCategory.some((row) => row.complaintType === 'copyright' && row.resolved === 1));

  const platformCsv = buildPlatformAnalyticsCsv(breakdown);
  assert.match(platformCsv, /"Platform","Total Cases","Active Cases","Resolved Cases"/);
  assert.match(platformCsv, /"Instagram"/);
});

test('isCaseRemovedTransition and classifyCaseTransitionAlert detect Removed transitions accurately', () => {
  const nowMs = new Date('2026-11-27T08:00:00.000Z').getTime();

  // Initial hydration (undefined prevCase) must not fire celebration
  assert.equal(isCaseRemovedTransition(undefined, sampleCases[2]), false);

  // Already resolved case staying resolved must not re-fire celebration
  assert.equal(isCaseRemovedTransition(sampleCases[2], sampleCases[2]), false);

  // Transition from reviewing -> resolved fires celebration
  const resolvedNext: ProtectionCase = {
    ...sampleCases[0],
    status: 'resolved',
    updated_at: '2026-11-27T08:00:00.000Z',
  };
  assert.equal(isCaseRemovedTransition(sampleCases[0], resolvedNext), true);

  // Verification appended at end with confirmed_removed (even before status changes) fires celebration & alert
  const verifiedRemovedNext: ProtectionCase = {
    ...sampleCases[0],
    status: 'action_taken',
    updated_at: '2026-11-27T08:05:00.000Z',
    verifications: [
      {
        id: 'ver-old',
        result: 'still_accessible',
        checked_url: sampleCases[0].source_url,
        checked_at: '2026-11-26T10:00:00.000Z',
      },
      {
        id: 'ver-new',
        result: 'confirmed_removed',
        checked_url: sampleCases[0].source_url,
        checked_at: '2026-11-27T08:05:00.000Z',
      },
    ],
  };
  assert.equal(isCaseRemovedTransition(sampleCases[0], verifiedRemovedNext), true);
  assert.equal(isCaseRemovedTransition(verifiedRemovedNext, verifiedRemovedNext), false);

  const alert = classifyCaseTransitionAlert(sampleCases[0], verifiedRemovedNext, undefined, nowMs);
  assert.ok(alert);
  assert.equal(alert.kind, 'resolved');
});

test('buildCaseEvidencePrintReport compiles single-case and workspace forensic evidence reports', () => {
  const nowMs = new Date('2026-11-27T08:30:00.000Z').getTime();
  const caseWithEvidence: ProtectionCase = {
    ...sampleCases[0],
    evidence: [
      {
        id: 'ev-rep-1',
        title: 'Profile screenshot capture',
        category: 'screenshot',
        file_name: 'ig-impostor.png',
        reference_url: 'https://instagram.com/fake_studio_account',
        sha256_preview: '9f8e7d6c5b4a3210',
        has_encrypted_file: true,
        uploaded_by_role: 'customer',
        uploaded_by_email: 'sara@example.com',
        notes: 'Captured prior to takedown filing.',
        created_at: '2026-11-10T11:30:00.000Z',
      },
      {
        id: 'ev-rep-2',
        title: 'Copyright registration reference',
        category: 'ownership_proof',
        sha256_preview: '11223344aabbccdd',
        has_encrypted_file: false,
        uploaded_by_role: 'staff',
        uploaded_by_email: 'ops@fremove.com',
        created_at: '2026-11-10T12:00:00.000Z',
      },
    ],
  };

  const singleReport = buildCaseEvidencePrintReport(
    [caseWithEvidence],
    { name: 'Sara Kareem', email: 'sara@example.com' },
    nowMs
  );
  assert.equal(singleReport.isMultiCase, false);
  assert.equal(singleReport.totalCases, 1);
  assert.equal(singleReport.totalEvidenceItems, 2);
  assert.equal(singleReport.encryptedEvidenceCount, 1);
  assert.equal(singleReport.generatedAt, '2026-11-27T08:30:00.000Z');
  assert.equal(singleReport.sections[0].evidenceItems[0].fileName, 'ig-impostor.png');
  assert.equal(singleReport.sections[0].evidenceItems[0].encryptedVault, true);
  assert.equal(singleReport.sections[0].evidenceItems[1].encryptedVault, false);

  const dossier = buildCaseEvidencePrintReport(
    [caseWithEvidence, sampleCases[2]],
    { name: 'Sara Kareem', email: 'sara@example.com' },
    nowMs
  );
  assert.equal(dossier.isMultiCase, true);
  assert.equal(dossier.totalCases, 2);
  assert.equal(dossier.totalEvidenceItems, 2);
});

test('buildCaseActivityLogEntries & buildWorkspaceCaseActivityLog track status updates and admin actions cleanly', () => {
  const richCase: ProtectionCase = {
    ...sampleCases[0],
    evidence: [
      {
        id: 'ev-staff-1',
        title: 'Trademark registration verification',
        category: 'ownership_proof',
        file_name: 'trademark-cert.pdf',
        sha256_preview: 'aa11bb22cc33dd44',
        uploaded_by_role: 'staff',
        uploaded_by_email: 'ops@fremove.com',
        notes: 'Confirmed matching registrant.',
        created_at: '2026-11-10T11:00:00.000Z',
      },
      {
        id: 'ev-client-1',
        title: 'Client screenshot',
        category: 'screenshot',
        uploaded_by_role: 'customer',
        uploaded_by_email: 'sara@example.com',
        created_at: '2026-11-10T10:05:00.000Z',
      },
    ],
    activity: [
      {
        id: 'act-1',
        activity_type: 'submitted',
        message: 'Case opened by client.',
        visibility: 'customer',
        created_at: '2026-11-10T10:00:00.000Z',
      },
      {
        id: 'act-staff-only',
        activity_type: 'internal_note',
        message: 'Confidential analyst triage memo.',
        visibility: 'staff',
        created_at: '2026-11-10T10:30:00.000Z',
      },
      {
        id: 'act-2',
        activity_type: 'reviewing',
        message: 'Investigation started by specialist team.',
        visibility: 'customer',
        created_at: '2026-11-10T12:00:00.000Z',
      },
      {
        id: 'act-3',
        activity_type: 'watchlist_monitor',
        message: 'Automated URL watchlist monitoring enabled.',
        visibility: 'customer',
        created_at: '2026-11-10T13:00:00.000Z',
      },
    ],
    submissions: [
      {
        id: 'sub-1',
        platform: 'Instagram',
        submission_channel: 'platform_portal',
        status: 'under_review',
        external_reference: 'IG-99201',
        response_summary: 'Acknowledged by Meta Rights queue.',
        submitted_at: '2026-11-10T14:00:00.000Z',
      },
    ],
    verifications: [
      {
        id: 'ver-1',
        result: 'confirmed_removed',
        checked_url: 'https://instagram.com/fake_studio_account',
        notes: '[Watchlist sweep] HTTP 404 Not Found',
        checked_at: '2026-11-10T15:00:00.000Z',
      },
    ],
    messages: [
      {
        id: 'msg-staff-1',
        sender_role: 'staff',
        sender_email: 'ops@fremove.com',
        message: 'Filing submitted; tracking removal.',
        created_at: '2026-11-10T14:15:00.000Z',
      },
      {
        id: 'msg-client-1',
        sender_role: 'customer',
        sender_email: 'sara@example.com',
        message: 'Thank you!',
        created_at: '2026-11-10T14:30:00.000Z',
      },
    ],
  };

  const entries = buildCaseActivityLogEntries(richCase);
  assert.equal(entries.some((e) => e.description.includes('Confidential analyst triage memo')), false);
  assert.equal(entries.some((e) => e.description === 'Thank you!'), false);

  const summary = summarizeCaseActivityLog(entries);
  assert.equal(summary.statusUpdates, 2); // submitted, reviewing
  assert.equal(summary.adminActions, 5); // staff_evidence, watchlist_monitor, platform_response, staff_message, watchlist_sweep
  assert.equal(summary.total, 7);

  // Default newest-first ordering puts watchlist_sweep (15:00) first
  assert.equal(entries[0].eventType, 'watchlist_sweep');
  assert.equal(entries[0].actorRole, 'system');

  // Ascending order puts submitted (10:00) first
  const ascEntries = filterCaseActivityLogEntries(entries, { order: 'asc' });
  assert.equal(ascEntries[0].eventType, 'submitted');
  assert.equal(ascEntries[0].kind, 'status_update');

  // Filter by kind and query across workspace
  const workspaceLog = buildWorkspaceCaseActivityLog([richCase, sampleCases[1]], {
    kind: 'admin_action',
    query: 'IG-99201',
  });
  assert.equal(workspaceLog.length, 1);
  assert.equal(workspaceLog[0].eventType, 'platform_response');
  assert.equal(workspaceLog[0].caseNumber, richCase.case_number);

  const statusOnly = buildWorkspaceCaseActivityLog([richCase, sampleCases[1]], {
    caseId: richCase.id,
    kind: 'status_update',
  });
  assert.equal(statusOnly.length, 2);

  // Visual status chip classification checks
  assert.equal(resolveCaseActivityVisualStatus(ascEntries[0]), 'pending'); // submitted
  assert.equal(
    resolveCaseActivityVisualStatus(entries.find((e) => e.eventType === 'reviewing')!),
    'in_progress'
  );
  assert.equal(
    resolveCaseActivityVisualStatus(entries.find((e) => e.eventType === 'platform_response')!),
    'in_progress'
  );
  assert.equal(
    resolveCaseActivityVisualStatus(entries.find((e) => e.eventType === 'watchlist_sweep')!),
    'resolved'
  );
  assert.equal(
    resolveCaseActivityVisualStatus({
      eventType: 'rejected',
      statusTag: 'rejected',
      description: 'Case closed without approval.',
    }),
    'attention'
  );
});

test('validateEvidenceUploadFile, deriveDefaultEvidenceTitle, and pickDefaultActiveCaseForUpload validate PDFs/JPEGs/PNGs and select active cases', () => {
  const pdfOk = validateEvidenceUploadFile({
    name: 'ownership-cert.PDF',
    type: 'application/pdf',
    size: 256_000,
  });
  assert.deepEqual(pdfOk, {
    ok: true,
    kind: 'pdf',
    normalizedMime: 'application/pdf',
    extension: 'pdf',
  });

  const jpegOk = validateEvidenceUploadFile({
    name: 'capture.jpeg',
    type: '',
    size: 120_000,
  });
  assert.deepEqual(jpegOk, {
    ok: true,
    kind: 'image',
    normalizedMime: 'image/jpeg',
    extension: 'jpeg',
  });

  const pngOk = validateEvidenceUploadFile({
    name: 'proof.png',
    type: 'image/png',
    size: 512_000,
  });
  assert.deepEqual(pngOk, {
    ok: true,
    kind: 'image',
    normalizedMime: 'image/png',
    extension: 'png',
  });

  assert.deepEqual(
    validateEvidenceUploadFile({ name: 'script.exe', type: 'application/x-msdownload', size: 1000 }),
    { ok: false, reason: 'unsupported_type' }
  );

  assert.deepEqual(
    validateEvidenceUploadFile({ name: 'huge.png', type: 'image/png', size: 4 * 1024 * 1024 }),
    { ok: false, reason: 'file_too_large' }
  );

  assert.equal(deriveDefaultEvidenceTitle('trademark_proof.pdf'), 'trademark_proof');
  assert.equal(deriveDefaultEvidenceTitle(''), 'Supporting evidence');

  const picked = pickDefaultActiveCaseForUpload(sampleCases);
  assert.ok(picked);
  assert.equal(picked.id, sampleCases[0].id);

  assert.equal(pickDefaultActiveCaseForUpload([sampleCases[2]]), null);
});

test('filterWorkspaceCases searches by case ID, title, raw status, and resolved status label', () => {
  const resolver = (status: string) =>
    ({
      reviewing: 'In review',
      needs_information: 'Needs your reply',
      resolved: 'Done',
    })[status] || status;

  assert.deepEqual(
    filterWorkspaceCases(sampleCases, {
      query: 'FR-2026-1038',
      statusLabelResolver: resolver,
    }).map((c) => c.id),
    ['case-2']
  );

  assert.deepEqual(
    filterWorkspaceCases(sampleCases, {
      query: 'Cloned e-commerce',
      statusLabelResolver: resolver,
    }).map((c) => c.id),
    ['case-2']
  );

  assert.deepEqual(
    filterWorkspaceCases(sampleCases, {
      query: 'Needs your reply',
      statusLabelResolver: resolver,
    }).map((c) => c.id),
    ['case-2']
  );

  assert.deepEqual(
    filterWorkspaceCases(sampleCases, {
      query: 'needs information',
      statusLabelResolver: resolver,
    }).map((c) => c.id),
    ['case-2']
  );

  assert.deepEqual(
    filterWorkspaceCases(sampleCases, {
      query: 'In review',
      statusLabelResolver: resolver,
    }).map((c) => c.id),
    ['case-1']
  );

  assert.deepEqual(
    filterWorkspaceCases(sampleCases, {
      query: 'Done',
      statusLabelResolver: resolver,
    }).map((c) => c.id),
    ['case-3']
  );
});
