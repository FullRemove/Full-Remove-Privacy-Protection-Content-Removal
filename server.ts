import 'dotenv/config';
import http from 'http';
import express, { type Request, type Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import {
  applyCaseTransition,
  canCustomerRequestRecheck,
  classifyHttpCheckResult,
  computeCaseSla,
  computeCaseStats,
  computeMirrorSummary,
  computePlatformAnalyticsBreakdown,
  computePlatformOverview,
  computeVerificationSealCode,
  getInquiryTrackingCode,
  getServiceByCode,
  hasPlatformPermission,
  isPublicHttpUrlSafe,
  isReappearedSweepFinding,
  normalizeTrackingCode,
  summarizeWatchlistSweep,
  validateCaseInput,
  validateEmail,
  validateInquiryInput,
  validateRecheckRequestInput,
  type AuditEventRecord,
  type CaseActionType,
  type CaseStatus,
  type ComplaintType,
  type EvidenceCategory,
  type InquiryRecord,
  type InvoiceRecord,
  type PaymentSubmission,
  type PlatformPermission,
  type PlatformRoleName,
  type PlatformRoleRecord,
  type ProtectionCase,
  type VerificationCheckItem,
  type VisitorSessionRecord,
  type WatchlistSweepItemResult,
} from './src/lib/caseLogic.ts';

interface UserAccount {
  email: string;
  name: string;
  phone: string;
  workspace_name?: string;
  access_status?: 'active' | 'suspended';
  role: 'customer' | 'owner' | 'admin' | 'analyst' | 'viewer';
  id_document_name?: string;
  id_document_uploaded_at?: string;
  face_photo_name?: string;
  face_photo_uploaded_at?: string;
  created_at: string;
}

interface NotificationRecord {
  id: string;
  user_email: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface SupportMessage {
  id: string;
  sender_role: 'customer' | 'staff';
  sender_email: string;
  visibility?: 'customer' | 'internal';
  message: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_email: string;
  subject: string;
  category: string;
  priority: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'awaiting_customer' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
}

interface DataRequestRecord {
  id: string;
  user_email: string;
  type: 'export' | 'deletion';
  notes: string;
  admin_note?: string;
  status: 'received' | 'in_review' | 'completed' | 'rejected';
  created_at: string;
}

interface StaffMember {
  id: string;
  email: string;
  display_name: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  status: 'active' | 'suspended';
}

interface StaffInvitation {
  id: string;
  invited_email: string;
  role: 'admin' | 'analyst' | 'viewer';
  expires_at: string;
  created_at: string;
}

interface AuthCodeRecord {
  email: string;
  code: string;
  expires_at: number;
}

interface StoreData {
  users: Record<string, UserAccount>;
  sessions: Record<string, string>; // token -> email
  authCodes: Record<string, AuthCodeRecord>;
  inquiries: InquiryRecord[];
  cases: ProtectionCase[];
  notifications: NotificationRecord[];
  invoices: InvoiceRecord[];
  payments: PaymentSubmission[];
  supportTickets: SupportTicket[];
  dataRequests: DataRequestRecord[];
  staffMembers: StaffMember[];
  invitations: StaffInvitation[];
  platformRoles: PlatformRoleRecord[];
  auditLog: AuditEventRecord[];
  visitorSessions: VisitorSessionRecord[];
}

const ENTRY_FILE_PATH = fileURLToPath(import.meta.url);
const APP_ROOT = path.dirname(ENTRY_FILE_PATH);
const ENTRY_FILENAME = path.basename(ENTRY_FILE_PATH);
const IS_PRODUCTION =
  process.env.NODE_ENV === 'production' || ENTRY_FILENAME === 'server.js';

function cleanEnv(name: string): string {
  const val = process.env[name]?.trim() || '';
  if (!val || /^secret value$/i.test(val) || /^my_/i.test(val)) return '';
  return val;
}

const configuredDataDir = cleanEnv('DATA_DIR');
const DATA_DIR = configuredDataDir
  ? path.resolve(APP_ROOT, configuredDataDir)
  : path.join(APP_ROOT, '.data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const VAULT_DIR = path.join(DATA_DIR, 'vault');
const VAULT_KEY_PATH = path.join(VAULT_DIR, '.master.key');

function isSmtpConfigured(): boolean {
  return Boolean(cleanEnv('SMTP_HOST') && cleanEnv('SMTP_USER') && cleanEnv('SMTP_PASS'));
}

async function sendOtpEmailIfConfigured(recipientEmail: string, code: string): Promise<void> {
  const host = cleanEnv('SMTP_HOST');
  const user = cleanEnv('SMTP_USER');
  const pass = cleanEnv('SMTP_PASS');
  if (!host || !user || !pass) return;

  const parsedPort = Number(cleanEnv('SMTP_PORT') || 465);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 465;
  const rawSecure = cleanEnv('SMTP_SECURE');
  const secure = rawSecure ? rawSecure.toLowerCase() === 'true' : port === 465;
  const fromAddress = cleanEnv('FROM_EMAIL') || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Full Remove Portal" <${fromAddress}>`,
    to: recipientEmail,
    subject: `Your Full Remove verification code: ${code}`,
    text: `Your one-time Full Remove verification code is: ${code}\n\nThis code expires in 15 minutes. If you did not request this sign-in, please ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #DCE7F2;border-radius:12px;color:#041E4A;">
      <p style="font-size:12px;font-weight:700;color:#00758A;margin:0 0 8px;">FULL REMOVE · CLIENT PORTAL</p>
      <h2 style="margin:0 0 12px;font-size:20px;">Your sign-in verification code</h2>
      <p style="font-size:14px;line-height:1.5;color:#475569;margin:0 0 18px;">Enter this one-time code to access your private case workspace. It expires in 15 minutes.</p>
      <div style="font-family:monospace;font-size:28px;font-weight:700;letter-spacing:6px;padding:14px 18px;background:#EFF5FA;border:1px solid #DCE7F2;border-radius:8px;text-align:center;color:#041E4A;">${code}</div>
      <p style="font-size:12px;color:#64748b;margin:18px 0 0;">If you did not request this login code, no action is needed.</p>
    </div>`,
  });
}

const rateBuckets = new Map<string, number[]>();

function checkRateLimit(ip: string, bucket: string, maxRequests: number, windowMs: number): boolean {
  const key = `${bucket}:${ip || 'unknown'}`;
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
  if (timestamps.length >= maxRequests) {
    rateBuckets.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return true;
}

function getClientIp(req: Request): string {
  const forwarded = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');
  return forwarded.split(',')[0].trim();
}

function getVaultMasterKey(): Buffer {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
  const envSecret = process.env.VAULT_KEY?.trim();
  if (envSecret) {
    return crypto.createHash('sha256').update(envSecret).digest();
  }
  if (fs.existsSync(VAULT_KEY_PATH)) {
    const hex = fs.readFileSync(VAULT_KEY_PATH, 'utf8').trim();
    if (/^[0-9a-f]{64}$/i.test(hex)) {
      return Buffer.from(hex, 'hex');
    }
  }
  const generated = crypto.randomBytes(32);
  fs.writeFileSync(VAULT_KEY_PATH, generated.toString('hex'), { mode: 0o600 });
  return generated;
}

function encryptAndStoreVaultFile(evidenceId: string, plainBuffer: Buffer): void {
  const key = getVaultMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  const targetPath = path.join(VAULT_DIR, `${evidenceId}.enc`);
  const tmpPath = `${targetPath}.tmp`;
  fs.writeFileSync(tmpPath, combined);
  fs.renameSync(tmpPath, targetPath);
}

function readAndDecryptVaultFile(evidenceId: string): Buffer | null {
  const safeId = path.basename(evidenceId).replace(/[^a-zA-Z0-9_-]/g, '');
  const targetPath = path.join(VAULT_DIR, `${safeId}.enc`);
  if (!fs.existsSync(targetPath)) return null;
  const combined = fs.readFileSync(targetPath);
  if (combined.length < 28) return null;
  const iv = combined.subarray(0, 12);
  const authTag = combined.subarray(12, 28);
  const ciphertext = combined.subarray(28);
  const key = getVaultMasterKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

async function checkUrlAvailabilitySafe(rawUrl: string): Promise<{
  ok: boolean;
  error?: string;
  result: 'confirmed_removed' | 'still_accessible' | 'redirected' | 'login_required' | 'not_found_unclear';
  http_status: number | null;
  diagnostic_note: string;
}> {
  const guard = isPublicHttpUrlSafe(rawUrl);
  if (!guard.ok || !guard.url) {
    return {
      ok: false,
      error: guard.error || 'Unsafe URL blocked.',
      result: 'not_found_unclear',
      http_status: null,
      diagnostic_note: guard.error || 'Blocked URL',
    };
  }
  try {
    const response = await fetch(guard.url.toString(), {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(7000),
      headers: {
        'User-Agent': 'FullRemove-VerificationProbe/1.0 (+https://www.fremove.com)',
      },
    });
    const status = response.status;
    const result = classifyHttpCheckResult(status);
    const location = response.headers.get('location');
    const diagnostic_note = `Live HTTP ${status} probe (${guard.url.hostname})${location ? ` -> ${location.slice(0, 80)}` : ''}`;
    return { ok: true, result, http_status: status, diagnostic_note };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network probe timeout or DNS failure';
    return {
      ok: true,
      result: 'not_found_unclear',
      http_status: null,
      diagnostic_note: `Live probe inconclusive (${msg.slice(0, 120)})`,
    };
  }
}

function createSeedStore(): StoreData {
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();
  const minsAgo = (m: number) => new Date(now - m * 60000).toISOString();

  return {
    users: {
      'sara@example.com': {
        email: 'sara@example.com',
        name: 'Sara Kareem',
        phone: '+964 770 412 8890',
        workspace_name: 'Sara Studio Protection',
        access_status: 'active',
        role: 'customer',
        id_document_name: 'sara-national-id.pdf',
        created_at: daysAgo(18),
      },
      'noor@example.com': {
        email: 'noor@example.com',
        name: 'Noor Al-Mansoor',
        phone: '+964 780 912 3340',
        workspace_name: 'Al-Mansoor Media',
        access_status: 'active',
        role: 'customer',
        id_document_name: 'noor-passport-scan.pdf',
        created_at: daysAgo(9),
      },
      'ops@fremove.com': {
        email: 'ops@fremove.com',
        name: 'Dara Barzani',
        phone: '+964 780 558 6584',
        workspace_name: 'Full Remove Operations',
        access_status: 'active',
        role: 'owner',
        created_at: daysAgo(90),
      },
    },
    sessions: {},
    authCodes: {},
    inquiries: [
      {
        id: 'inq-seed-1',
        name: 'Harem Rasheed',
        email: 'harem@example.com',
        interest: 'Fake Website & Brand Impersonation Removal',
        message: 'A cloned store domain is running ads using our company trademark.',
        language: 'en',
        status: 'new',
        created_at: daysAgo(1),
      },
      {
        id: 'inq-seed-2',
        name: 'Rebin Othman',
        email: 'rebin@example.com',
        interest: 'Impostor Account Removal',
        message: 'Fake TikTok profile reposting private clinic clips to collect booking fees.',
        language: 'ku',
        status: 'reviewed',
        created_at: daysAgo(2),
      },
    ],
    cases: [
      {
        id: 'case-1041',
        case_number: 'FR-2026-1041',
        customer_email: 'sara@example.com',
        customer_name: 'Sara Kareem',
        title: 'Impersonator Instagram profile using studio photos',
        platform: 'Instagram',
        source_url: 'https://instagram.com/sara_studio_official_fake',
        complaint_type: 'impersonation',
        description:
          'An unauthorized profile is reusing my photography portfolio and messaging clients asking for deposits.',
        status: 'submitted_to_platform',
        service_code: 'impostor_account',
        assigned_to: 'amina@fremove.com',
        monitoring_enabled: true,
        last_monitored_at: daysAgo(1),
        submitted_at: daysAgo(4),
        updated_at: daysAgo(1),
        evidence: [
          {
            id: 'ev-1041-a',
            title: 'Impersonation profile full-page capture',
            category: 'screenshot',
            reference_url: 'https://instagram.com/sara_studio_official_fake',
            file_name: 'ig-impersonator-capture.png',
            sha256_preview: 'a94e8f219c4d10b7',
            notes: 'Captured showing stolen studio avatar and bio.',
            uploaded_by_role: 'customer',
            uploaded_by_email: 'sara@example.com',
            created_at: daysAgo(4),
          },
          {
            id: 'ev-1041-b',
            title: 'Official trademark & studio domain certificate',
            category: 'ownership_proof',
            file_name: 'sara-studio-brand-ownership.pdf',
            sha256_preview: '7f11c0384e9021aa',
            notes: 'Verified match against registered profile domain.',
            uploaded_by_role: 'staff',
            uploaded_by_email: 'ops@fremove.com',
            created_at: daysAgo(3),
          },
        ],
        activity: [
          {
            id: 'act-1',
            activity_type: 'submitted',
            message: 'Case received with initial profile URL and evidence summary.',
            visibility: 'customer',
            created_at: daysAgo(4),
          },
          {
            id: 'act-2',
            activity_type: 'reviewing',
            message: 'Analyst verified impersonation evidence and brand ownership match.',
            visibility: 'customer',
            created_at: daysAgo(3),
          },
          {
            id: 'act-3',
            activity_type: 'submitted_to_platform',
            message: 'Official impersonation report submitted via platform portal (Ref #IG-88412).',
            visibility: 'customer',
            created_at: daysAgo(1),
          },
        ],
        messages: [
          {
            id: 'msg-1',
            sender_role: 'staff',
            sender_email: 'ops@fremove.com',
            message:
              'We have documented the impersonation links and submitted the report through Instagram’s official impersonation channel. We will notify you as soon as Meta responds.',
            created_at: daysAgo(1),
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
            submitted_at: daysAgo(1),
          },
        ],
        verifications: [],
      },
      {
        id: 'case-1038',
        case_number: 'FR-2026-1038',
        customer_email: 'sara@example.com',
        customer_name: 'Sara Kareem',
        title: 'Cloned e-commerce storefront imitating company branding',
        platform: 'Website / Domain',
        source_url: 'https://sara-brand-store-demo.example',
        complaint_type: 'impersonation',
        description:
          'Fraudulent website copying our logo, product descriptions, and contact footer to mislead customers.',
        status: 'needs_information',
        service_code: 'fake_website',
        submitted_at: daysAgo(7),
        updated_at: daysAgo(2),
        evidence: [
          {
            id: 'ev-1038-a',
            title: 'Cloned storefront checkout capture',
            category: 'screenshot',
            reference_url: 'https://sara-brand-store-demo.example',
            file_name: 'cloned-checkout-capture.png',
            sha256_preview: '5e29d10f92b3a844',
            uploaded_by_role: 'customer',
            uploaded_by_email: 'sara@example.com',
            created_at: daysAgo(7),
          },
        ],
        activity: [
          {
            id: 'act-4',
            activity_type: 'submitted',
            message: 'Case submitted for fake website & domain abuse review.',
            visibility: 'customer',
            created_at: daysAgo(7),
          },
          {
            id: 'act-5',
            activity_type: 'needs_information',
            message: 'Requested business registration or domain ownership confirmation for registrar abuse filing.',
            visibility: 'customer',
            created_at: daysAgo(2),
          },
        ],
        messages: [
          {
            id: 'msg-2',
            sender_role: 'staff',
            sender_email: 'ops@fremove.com',
            message:
              'To escalate this to the domain registrar and hosting provider, please reply with your official company domain or trademark registration number.',
            created_at: daysAgo(2),
          },
        ],
        submissions: [],
        verifications: [],
      },
      {
        id: 'case-1040',
        case_number: 'FR-2026-1040',
        customer_email: 'noor@example.com',
        customer_name: 'Noor Al-Mansoor',
        title: 'Synthetic deepfake interview clip circulating on TikTok',
        platform: 'TikTok',
        source_url: 'https://www.tiktok.com/@fake_clip_demo/video/98124',
        complaint_type: 'deepfake',
        description:
          'Altered voice and likeness clip fabricated to impersonate our executive spokesperson.',
        status: 'reviewing',
        service_code: 'deepfake_video',
        submitted_at: daysAgo(3),
        updated_at: daysAgo(1),
        evidence: [
          {
            id: 'ev-1040-a',
            title: 'Original keynote audio-visual reference',
            category: 'ownership_proof',
            reference_url: 'https://almansoor.example/keynote-original',
            file_name: 'keynote-reference-frame.png',
            sha256_preview: 'c403ab1829ef7109',
            uploaded_by_role: 'customer',
            uploaded_by_email: 'noor@example.com',
            created_at: daysAgo(3),
          },
        ],
        activity: [
          {
            id: 'act-8',
            activity_type: 'submitted',
            message: 'Deepfake & likeness case opened with source video URL.',
            visibility: 'customer',
            created_at: daysAgo(3),
          },
          {
            id: 'act-9',
            activity_type: 'reviewing',
            message: 'Specialist analyst comparing biometric source reference and upload metadata.',
            visibility: 'customer',
            created_at: daysAgo(1),
          },
        ],
        messages: [
          {
            id: 'msg-3',
            sender_role: 'customer',
            sender_email: 'noor@example.com',
            message: 'Attached original keynote clip URL to prove voice/face tampering.',
            created_at: daysAgo(2),
          },
        ],
        submissions: [],
        verifications: [],
      },
      {
        id: 'case-1022',
        case_number: 'FR-2026-1022',
        customer_email: 'sara@example.com',
        customer_name: 'Sara Kareem',
        title: 'Unauthorized commercial image repost on Facebook page',
        platform: 'Facebook',
        source_url: 'https://facebook.com/example-repost/1022',
        complaint_type: 'copyright',
        description: 'Original studio campaign photograph republished without license.',
        status: 'resolved',
        service_code: 'image_removal',
        monitoring_enabled: true,
        last_monitored_at: daysAgo(6),
        submitted_at: daysAgo(15),
        updated_at: daysAgo(6),
        evidence: [],
        activity: [
          {
            id: 'act-6',
            activity_type: 'submitted',
            message: 'Copyright image removal request submitted.',
            visibility: 'customer',
            created_at: daysAgo(15),
          },
          {
            id: 'act-7',
            activity_type: 'resolved',
            message: 'Platform removed reported post and verification check confirmed URL is unavailable.',
            visibility: 'customer',
            created_at: daysAgo(6),
          },
        ],
        messages: [],
        submissions: [
          {
            id: 'sub-2',
            platform: 'Facebook',
            submission_channel: 'web_form',
            status: 'action_taken',
            external_reference: 'FB-DMCA-4920',
            response_summary: 'Content removed following copyright ownership verification.',
            submitted_at: daysAgo(10),
          },
        ],
        verifications: [
          {
            id: 'ver-1',
            result: 'confirmed_removed',
            checked_url: 'https://facebook.com/example-repost/1022',
            notes: 'Verified across public and signed-out views; post returns unavailable.',
            checked_at: daysAgo(6),
          },
        ],
      },
    ],
    notifications: [
      {
        id: 'not-1',
        user_email: 'sara@example.com',
        title: 'Platform report submitted for FR-2026-1041',
        body: 'Our team filed an official impersonation report with Instagram (Ref #IG-88412).',
        read: false,
        created_at: daysAgo(1),
      },
      {
        id: 'not-2',
        user_email: 'sara@example.com',
        title: 'Action needed on FR-2026-1038',
        body: 'Please confirm your business domain or registration document so we can finalize the registrar abuse report.',
        read: false,
        created_at: daysAgo(2),
      },
      {
        id: 'not-3',
        user_email: 'sara@example.com',
        title: 'Removal verified for FR-2026-1022',
        body: 'Facebook confirmed action on your copyright report and our verification check confirmed removal.',
        read: true,
        created_at: daysAgo(6),
      },
    ],
    invoices: [
      {
        id: 'inv-1001',
        invoice_number: 'INV-2026-1001',
        case_id: 'case-1041',
        case_number: 'FR-2026-1041',
        customer_email: 'sara@example.com',
        service_code: 'impostor_account',
        service_name: 'Impostor Account Removal',
        amount_usd: 150,
        status: 'paid',
        created_at: daysAgo(4),
      },
      {
        id: 'inv-1002',
        invoice_number: 'INV-2026-1002',
        case_id: 'case-1038',
        case_number: 'FR-2026-1038',
        customer_email: 'sara@example.com',
        service_code: 'fake_website',
        service_name: 'Fake Website & Brand Impersonation Removal',
        amount_usd: 1500,
        status: 'unpaid',
        created_at: daysAgo(6),
      },
      {
        id: 'inv-1000',
        invoice_number: 'INV-2026-1000',
        case_id: 'case-1040',
        case_number: 'FR-2026-1040',
        customer_email: 'noor@example.com',
        service_code: 'deepfake_video',
        service_name: 'Deepfake & AI-Generated Video Removal',
        amount_usd: 1000,
        status: 'pending_review',
        created_at: daysAgo(2),
      },
    ],
    payments: [
      {
        id: 'pay-2',
        invoice_id: 'inv-1000',
        invoice_number: 'INV-2026-1000',
        customer_email: 'noor@example.com',
        method: 'bank_transfer',
        reference: 'FIB-77492-ERB',
        amount_usd: 1000,
        status: 'pending_review',
        whatsapp_status: 'none',
        submitted_at: daysAgo(1),
      },
      {
        id: 'pay-1',
        invoice_id: 'inv-1001',
        invoice_number: 'INV-2026-1001',
        customer_email: 'sara@example.com',
        method: 'bank_transfer',
        reference: 'TXN-90281-KRD',
        amount_usd: 150,
        status: 'approved',
        whatsapp_status: 'sent_confirmed',
        reviewed_by: 'ops@fremove.com',
        reviewed_at: daysAgo(4),
        submitted_at: daysAgo(4),
      },
    ],
    supportTickets: [
      {
        id: 'sup-1',
        ticket_number: 'SUP-409',
        customer_email: 'sara@example.com',
        subject: 'Question about registrar abuse documentation for FR-2026-1038',
        category: 'takedown',
        priority: 'normal',
        status: 'awaiting_customer',
        created_at: daysAgo(3),
        updated_at: daysAgo(2),
        messages: [
          {
            id: 'smsg-1',
            sender_role: 'customer',
            sender_email: 'sara@example.com',
            visibility: 'customer',
            message: 'Can I attach a PDF certificate of domain ownership instead of a trademark filing?',
            created_at: daysAgo(3),
          },
          {
            id: 'smsg-2',
            sender_role: 'staff',
            sender_email: 'ops@fremove.com',
            visibility: 'customer',
            message:
              'Yes — a WHOIS/registrar invoice showing your legal business name along with a screenshot of your official website is sufficient for the hosting abuse notice.',
            created_at: daysAgo(2),
          },
        ],
      },
      {
        id: 'sup-2',
        ticket_number: 'SUP-410',
        customer_email: 'noor@example.com',
        subject: 'Confirm receipt of bank transfer FIB-77492-ERB',
        category: 'billing',
        priority: 'high',
        status: 'open',
        created_at: daysAgo(1),
        updated_at: minsAgo(45),
        messages: [
          {
            id: 'smsg-3',
            sender_role: 'customer',
            sender_email: 'noor@example.com',
            visibility: 'customer',
            message: 'We transferred $1,000 for INV-2026-1000 earlier today. Kindly confirm verification.',
            created_at: minsAgo(45),
          },
        ],
      },
    ],
    dataRequests: [
      {
        id: 'dr-1',
        user_email: 'noor@example.com',
        type: 'export',
        notes: 'Requesting compliance archive copy of case evidence logs.',
        status: 'received',
        created_at: daysAgo(1),
      },
    ],
    staffMembers: [
      {
        id: 'staff-1',
        email: 'ops@fremove.com',
        display_name: 'Dara Barzani',
        role: 'owner',
        status: 'active',
      },
      {
        id: 'staff-2',
        email: 'amina@fremove.com',
        display_name: 'Amina Rashid',
        role: 'analyst',
        status: 'active',
      },
      {
        id: 'staff-3',
        email: 'tariq@fremove.com',
        display_name: 'Tariq Saleh',
        role: 'viewer',
        status: 'active',
      },
    ],
    invitations: [],
    platformRoles: [
      {
        id: 'pr-1',
        email: 'ops@fremove.com',
        role: 'operations_admin',
        status: 'active',
        granted_by: 'system',
        created_at: daysAgo(90),
      },
      {
        id: 'pr-2',
        email: 'amina@fremove.com',
        role: 'case_manager',
        status: 'active',
        granted_by: 'ops@fremove.com',
        created_at: daysAgo(45),
      },
      {
        id: 'pr-3',
        email: 'tariq@fremove.com',
        role: 'auditor',
        status: 'active',
        granted_by: 'ops@fremove.com',
        created_at: daysAgo(20),
      },
    ],
    auditLog: [
      {
        id: 'aud-1',
        actor: 'ops@fremove.com',
        action: 'payment_review_approved',
        entity_type: 'payment',
        entity_id: 'pay-1',
        organization_name: 'Sara Studio Protection',
        details: { invoice_number: 'INV-2026-1001', amount_usd: 150 },
        created_at: daysAgo(4),
      },
      {
        id: 'aud-2',
        actor: 'amina@fremove.com',
        action: 'case_submitted_to_platform',
        entity_type: 'case',
        entity_id: 'FR-2026-1041',
        organization_name: 'Sara Studio Protection',
        details: { platform: 'Instagram', external_reference: 'IG-88412' },
        created_at: daysAgo(1),
      },
    ],
    visitorSessions: [
      {
        id: 'vis-1',
        visitor_key: 'v84f91a2',
        session_key: 's112c8e1',
        ip_address: '185.94.210.14',
        country_code: 'IQ',
        region: 'Erbil',
        city: 'Erbil',
        device_type: 'desktop',
        browser: 'Chrome 131',
        operating_system: 'macOS',
        referrer_domain: 'google.com',
        landing_page: '/',
        last_page: '/#pricing',
        page_views: 4,
        inquiry_submitted: true,
        started_at: minsAgo(14),
        last_seen_at: minsAgo(2),
      },
      {
        id: 'vis-2',
        visitor_key: 'v92a11c4',
        session_key: 's302f9b2',
        ip_address: '94.200.45.88',
        country_code: 'AE',
        region: 'Dubai',
        city: 'Dubai',
        device_type: 'mobile',
        browser: 'Safari 18',
        operating_system: 'iOS',
        referrer_domain: 'Direct',
        landing_page: '/',
        last_page: '/#services',
        page_views: 3,
        inquiry_submitted: false,
        started_at: minsAgo(9),
        last_seen_at: minsAgo(1),
      },
      {
        id: 'vis-3',
        visitor_key: 'v71b44e0',
        session_key: 's849a2d5',
        ip_address: '82.132.214.19',
        country_code: 'GB',
        region: 'England',
        city: 'London',
        device_type: 'desktop',
        browser: 'Firefox 132',
        operating_system: 'Windows',
        referrer_domain: 'linkedin.com',
        landing_page: '/privacy',
        last_page: '/login',
        page_views: 2,
        inquiry_submitted: false,
        started_at: minsAgo(36),
        last_seen_at: minsAgo(18),
      },
      {
        id: 'vis-4',
        visitor_key: 'v39c88b7',
        session_key: 's552e1c9',
        ip_address: '185.220.101.4',
        country_code: 'DE',
        region: 'Berlin',
        city: 'Berlin',
        device_type: 'desktop',
        browser: 'Chrome 131',
        operating_system: 'Linux',
        referrer_domain: 'google.de',
        landing_page: '/',
        last_page: '/#process',
        page_views: 5,
        inquiry_submitted: false,
        started_at: daysAgo(1),
        last_seen_at: daysAgo(1),
      },
    ],
  };
}

function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const seed = createSeedStore();
      fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2));
      return seed;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as StoreData;
    const seed = createSeedStore();
    if (!Array.isArray(parsed.platformRoles)) parsed.platformRoles = seed.platformRoles;
    if (!Array.isArray(parsed.auditLog)) parsed.auditLog = seed.auditLog;
    if (!Array.isArray(parsed.visitorSessions)) parsed.visitorSessions = seed.visitorSessions;
    for (const c of parsed.cases || []) {
      if (!Array.isArray(c.evidence)) c.evidence = [];
      if (c.monitoring_enabled === undefined && (c.id === 'case-1041' || c.id === 'case-1022')) {
        c.monitoring_enabled = true;
      }
    }
    for (const inq of parsed.inquiries || []) {
      if (!inq.status) inq.status = 'new';
    }
    return parsed;
  } catch {
    return createSeedStore();
  }
}

let activityWss: WebSocketServer | null = null;
let customerWss: WebSocketServer | null = null;
const customerSocketEmails = new Map<WebSocket, string>();

function broadcastPlatformActivity(payload: Record<string, unknown>): void {
  if (!activityWss) return;
  const serialized = JSON.stringify(payload);
  for (const client of activityWss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
}

function sanitizeCaseForCustomer(c: ProtectionCase): ProtectionCase {
  return {
    ...c,
    activity: (c.activity || []).filter((a) => a.visibility === 'customer'),
  };
}

function pushCustomerEvent(targetEmail: string, payload: Record<string, unknown>): void {
  if (!customerWss) return;
  const serialized = JSON.stringify(payload);
  const normalized = targetEmail.trim().toLowerCase();
  for (const client of customerWss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    const ownerEmail = (customerSocketEmails.get(client) || '').toLowerCase();
    if (normalized === 'all_customers' || ownerEmail === normalized) {
      client.send(serialized);
    }
  }
}

function recordAudit(
  store: StoreData,
  actor: string,
  action: string,
  entity_type: string,
  entity_id: string,
  organization_name: string,
  details: Record<string, unknown> = {}
): AuditEventRecord {
  const event: AuditEventRecord = {
    id: 'aud-' + crypto.randomUUID().slice(0, 8),
    actor,
    action,
    entity_type,
    entity_id,
    organization_name,
    details,
    created_at: new Date().toISOString(),
  };
  store.auditLog.unshift(event);
  if (store.auditLog.length > 500) {
    store.auditLog = store.auditLog.slice(0, 500);
  }
  broadcastPlatformActivity({ type: 'activity:created', event });
  return event;
}

function addAndPushNotification(
  store: StoreData,
  notification: NotificationRecord
): void {
  store.notifications.unshift(notification);
  pushCustomerEvent(notification.user_email, {
    type: 'notification:created',
    notification,
  });
}

function saveStore(store: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2));
  fs.renameSync(tmpPath, STORE_PATH);
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = decodeURIComponent(part.slice(idx + 1).trim());
      out[key] = val;
    }
  }
  return out;
}

function getSessionUser(req: Request, store: StoreData): UserAccount | null {
  const cookies = parseCookies(req);
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
  const token = cookies.fr_session || bearer;
  if (!token) return null;
  const email = store.sessions[token];
  if (!email) return null;
  return store.users[email] || null;
}

function createSessionForEmail(store: StoreData, email: string): { token: string; user: UserAccount } {
  const normalized = email.trim().toLowerCase();
  let user = store.users[normalized];
  if (!user) {
    const staffMatch = store.staffMembers.find((m) => m.email.toLowerCase() === normalized);
    const isStaffDomain = normalized.endsWith('@fremove.com');
    user = {
      email: normalized,
      name: staffMatch?.display_name || normalized.split('@')[0].replace(/[._-]/g, ' '),
      phone: '',
      role: staffMatch ? staffMatch.role : isStaffDomain ? 'admin' : 'customer',
      created_at: new Date().toISOString(),
    };
    store.users[normalized] = user;
  }
  const token = crypto.randomBytes(24).toString('hex');
  store.sessions[token] = normalized;
  saveStore(store);
  return { token, user };
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const proto = String(req.headers['x-forwarded-proto'] || '');
  const isHttps = req.secure || proto.includes('https');
  const flags = isHttps
    ? 'Path=/; HttpOnly; SameSite=None; Secure; Partitioned'
    : 'Path=/; HttpOnly; SameSite=Lax';
  res.setHeader(
    'Set-Cookie',
    `fr_session=${encodeURIComponent(token)}; ${flags}; Max-Age=${7 * 86400}`
  );
}

function clearSessionCookie(req: Request, res: Response): void {
  const proto = String(req.headers['x-forwarded-proto'] || '');
  const isHttps = req.secure || proto.includes('https');
  const flags = isHttps
    ? 'Path=/; HttpOnly; SameSite=None; Secure; Partitioned'
    : 'Path=/; HttpOnly; SameSite=Lax';
  res.setHeader('Set-Cookie', `fr_session=; ${flags}; Max-Age=0`);
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '6mb' }));

  // Production readiness & liveness health endpoint
  app.get('/api/health', (_req, res) => {
    const store = loadStore();
    const distReady = fs.existsSync(path.join(APP_ROOT, 'dist', 'index.html'));
    let storageWritable = false;
    try {
      fs.accessSync(DATA_DIR, fs.constants.W_OK);
      storageWritable = true;
    } catch {
      storageWritable = false;
    }
    res.json({
      ok: true,
      status: 'healthy',
      mode: IS_PRODUCTION ? 'production' : 'development',
      dist_ready: distReady,
      storage_writable: storageWritable,
      smtp_configured: isSmtpConfigured(),
      demo_login_enabled: process.env.ALLOW_DEMO_LOGIN !== 'false',
      uptime_seconds: Math.round(process.uptime()),
      ws_operators: activityWss ? activityWss.clients.size : 0,
      ws_customers: customerWss ? customerWss.clients.size : 0,
      total_cases: store.cases.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Live anonymized operational stats for Landing Page
  app.get('/api/public-metrics', (_req, res) => {
    const store = loadStore();
    const resolvedCases = store.cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
    const activeCases = store.cases.filter(
      (c) => c.status !== 'resolved' && c.status !== 'closed' && c.status !== 'rejected'
    ).length;
    const verifiedChecks = store.cases.reduce((acc, c) => acc + (c.verifications?.length || 0), 0);
    const archivedEvidence = store.cases.reduce((acc, c) => acc + (c.evidence?.length || 0), 0);
    res.json({
      resolved_cases: resolvedCases,
      active_cases: activeCases,
      verified_checks: verifiedChecks,
      archived_evidence: archivedEvidence,
      supported_platforms: 6,
    });
  });

  // Public Seal / Certificate Verification Endpoint (anonymized)
  app.get('/api/public-verify', (req, res) => {
    if (!checkRateLimit(getClientIp(req), 'public_verify', 40, 60000)) {
      res.status(429).json({ verified: false, error: 'Too many verification requests. Please wait a minute.' });
      return;
    }
    const rawCode = String(req.query.code || '').trim().toUpperCase();
    if (!rawCode) {
      res.status(400).json({ verified: false, error: 'Verification seal code is required.' });
      return;
    }
    const store = loadStore();
    const match = store.cases.find(
      (c) =>
        computeVerificationSealCode(c.case_number) === rawCode ||
        c.case_number.toUpperCase() === rawCode
    );
    if (!match) {
      res.status(404).json({ verified: false, error: 'No matching record found.' });
      return;
    }
    const latestVerification =
      match.verifications && match.verifications.length > 0
        ? {
            result: match.verifications[0].result,
            checked_at: match.verifications[0].checked_at,
          }
        : null;
    res.json({
      verified: true,
      case_number: match.case_number,
      verification_seal_code: computeVerificationSealCode(match.case_number),
      platform: match.platform,
      complaint_type: match.complaint_type,
      status: match.status,
      submitted_at: match.submitted_at,
      updated_at: match.updated_at,
      monitoring_enabled: Boolean(match.monitoring_enabled),
      latest_verification: latestVerification,
      mirror_summary: computeMirrorSummary(match),
    });
  });

  // Public Confidential Inquiry Status Tracker
  app.get('/api/public-inquiry/track', (req, res) => {
    if (!checkRateLimit(getClientIp(req), 'inquiry_track', 30, 60000)) {
      res.status(429).json({ ok: false, error: 'Too many tracking requests. Please wait a minute.' });
      return;
    }
    const rawCode = normalizeTrackingCode(String(req.query.code || ''));
    if (!rawCode) {
      res.status(400).json({ ok: false, error: 'Reference code is required.' });
      return;
    }
    const store = loadStore();
    const match = store.inquiries.find((i) => getInquiryTrackingCode(i.id) === rawCode);
    if (!match) {
      res.status(404).json({ ok: false, error: 'No matching inquiry reference found.' });
      return;
    }
    const linkedCase = match.converted_case_id
      ? store.cases.find((c) => c.id === match.converted_case_id)
      : undefined;
    res.json({
      ok: true,
      tracking_code: getInquiryTrackingCode(match.id),
      status: match.status || 'new',
      interest: match.interest,
      created_at: match.created_at,
      linked_case_number: linkedCase?.case_number || null,
      linked_case_status: linkedCase?.status || null,
    });
  });

  // Public inquiry endpoint
  app.post('/api/public-inquiry', (req, res) => {
    if (!checkRateLimit(getClientIp(req), 'public_inquiry', 12, 60000)) {
      res.status(429).json({ ok: false, error: 'Rate limit exceeded. Please try again shortly.' });
      return;
    }
    const {
      name = '',
      email = '',
      interest = '',
      message = '',
      website = '',
      language = 'en',
      session_key = '',
    } = req.body || {};
    const check = validateInquiryInput({ name, email, interest, message, website });
    if (!check.ok) {
      res.status(400).json({ ok: false, error: check.error });
      return;
    }

    const store = loadStore();
    const id = 'inq-' + crypto.randomUUID().slice(0, 8);
    const record: InquiryRecord = {
      id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      interest: String(interest || 'Other privacy or content issue').trim(),
      message: String(message).trim(),
      language: String(language || 'en'),
      status: 'new',
      created_at: new Date().toISOString(),
    };
    store.inquiries.unshift(record);
    if (session_key) {
      const matched = store.visitorSessions.find((v) => v.session_key === String(session_key));
      if (matched) {
        matched.inquiry_submitted = true;
        matched.last_seen_at = record.created_at;
      }
    }
    recordAudit(store, record.email, 'public_inquiry_submitted', 'inquiry', record.id, record.name, {
      interest: record.interest,
      language: record.language,
    });
    saveStore(store);
    res.json({
      ok: true,
      id: record.id,
      tracking_code: getInquiryTrackingCode(record.id),
      message: 'Inquiry sent successfully.',
    });
  });

  // Public visitor analytics recording
  app.post('/api/public-visit', (req, res) => {
    const store = loadStore();
    const {
      visitor_key = '',
      session_key = '',
      page = '/',
      referrer = 'Direct',
      device_type = 'desktop',
      browser = 'Web browser',
      operating_system = 'Unknown',
    } = req.body || {};
    const now = new Date().toISOString();
    const sKey = String(session_key || crypto.randomUUID().slice(0, 8)).slice(0, 16);
    const vKey = String(visitor_key || crypto.randomUUID().slice(0, 8)).slice(0, 16);
    const existing = store.visitorSessions.find((v) => v.session_key === sKey);
    if (existing) {
      existing.last_page = String(page || '/');
      existing.page_views += 1;
      existing.last_seen_at = now;
    } else {
      const forwarded = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');
      const ip = forwarded.split(',')[0].trim();
      store.visitorSessions.unshift({
        id: 'vis-' + crypto.randomUUID().slice(0, 8),
        visitor_key: vKey,
        session_key: sKey,
        ip_address: ip,
        country_code: String(req.headers['cf-ipcountry'] || 'IQ').toUpperCase().slice(0, 2),
        region: '',
        city: '',
        device_type: device_type === 'mobile' || device_type === 'tablet' ? device_type : 'desktop',
        browser: String(browser).slice(0, 40),
        operating_system: String(operating_system).slice(0, 40),
        referrer_domain: String(referrer || 'Direct').slice(0, 80),
        landing_page: String(page || '/').slice(0, 80),
        last_page: String(page || '/').slice(0, 80),
        page_views: 1,
        inquiry_submitted: false,
        started_at: now,
        last_seen_at: now,
      });
      if (store.visitorSessions.length > 300) {
        store.visitorSessions = store.visitorSessions.slice(0, 300);
      }
    }
    saveStore(store);
    res.json({ ok: true });
  });

  // Auth capabilities endpoint for Login UI
  app.get('/api/auth/config', (_req, res) => {
    res.json({
      ok: true,
      demo_login_enabled: process.env.ALLOW_DEMO_LOGIN !== 'false',
      smtp_configured: isSmtpConfigured(),
    });
  });

  // Auth endpoints
  app.post('/api/auth/start', async (req, res) => {
    if (!checkRateLimit(getClientIp(req), 'auth_start', 10, 60000)) {
      res.status(429).json({ ok: false, error: 'Too many sign-in attempts. Please wait a minute.' });
      return;
    }
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    if (!validateEmail(email)) {
      res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
      return;
    }
    const store = loadStore();
    const existing = store.users[email];
    if (existing?.access_status === 'suspended') {
      res.status(403).json({ ok: false, error: 'This workspace account is currently suspended.' });
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    store.authCodes[email] = {
      email,
      code,
      expires_at: Date.now() + 15 * 60 * 1000,
    };
    saveStore(store);

    const smtpActive = isSmtpConfigured();
    if (smtpActive) {
      try {
        await sendOtpEmailIfConfigured(email, code);
      } catch (err) {
        console.error('SMTP email send failed:', err);
        res.status(502).json({
          ok: false,
          error: 'Unable to send verification email. Please verify your SMTP configuration.',
        });
        return;
      }
    }

    const allowDevCode = !smtpActive && process.env.ALLOW_DEV_LOGIN_CODE !== 'false';
    res.json({
      ok: true,
      email,
      delivery: smtpActive ? 'email' : 'preview',
      ...(allowDevCode ? { dev_code: code } : {}),
    });
  });

  app.post('/api/auth/verify', (req, res) => {
    if (!checkRateLimit(getClientIp(req), 'auth_verify', 15, 60000)) {
      res.status(429).json({ ok: false, error: 'Too many verification attempts. Wait a minute.' });
      return;
    }
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const code = String(req.body?.code || '').trim();
    const store = loadStore();
    const pending = store.authCodes[email];
    if (!pending || pending.expires_at < Date.now() || pending.code !== code) {
      res.status(400).json({ ok: false, error: 'That verification code is invalid or expired.' });
      return;
    }
    if (store.users[email]?.access_status === 'suspended') {
      res.status(403).json({ ok: false, error: 'This workspace account is suspended.' });
      return;
    }
    delete store.authCodes[email];
    const { token, user } = createSessionForEmail(store, email);
    recordAudit(
      store,
      user.email,
      'user_authenticated',
      'auth',
      user.role,
      getCustomerWorkspaceName(store, user.email),
      { method: 'otp' }
    );
    saveStore(store);
    setSessionCookie(req, res, token);
    res.json({ ok: true, user, token });
  });

  app.post('/api/auth/demo', (req, res) => {
    if (process.env.ALLOW_DEMO_LOGIN === 'false') {
      res.status(403).json({ ok: false, error: 'Demo access is disabled in production mode.' });
      return;
    }
    const role = req.body?.role === 'staff' ? 'staff' : 'customer';
    const email = role === 'staff' ? 'ops@fremove.com' : 'sara@example.com';
    const store = loadStore();
    const { token, user } = createSessionForEmail(store, email);
    recordAudit(
      store,
      user.email,
      'user_authenticated',
      'auth',
      user.role,
      getCustomerWorkspaceName(store, user.email),
      { method: 'demo' }
    );
    saveStore(store);
    setSessionCookie(req, res, token);
    res.json({ ok: true, user, token });
  });

  app.get('/api/auth/session', (req, res) => {
    const store = loadStore();
    const user = getSessionUser(req, store);
    res.json({ user });
  });

  app.post('/api/auth/signout', (req, res) => {
    const store = loadStore();
    const cookies = parseCookies(req);
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
    const token = cookies.fr_session || bearer;
    if (token) {
      delete store.sessions[token];
      saveStore(store);
    }
    clearSessionCookie(req, res);
    res.json({ ok: true });
  });

  function requireActiveUser(req: Request, res: Response, store: StoreData): UserAccount | null {
    const user = getSessionUser(req, store);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return null;
    }
    if (user.access_status === 'suspended') {
      res.status(403).json({ error: 'Workspace access is currently suspended by Central Operations.' });
      return null;
    }
    return user;
  }

  // Customer workspace endpoint
  app.get('/api/workspace', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;

    const userCases = store.cases
      .filter((c) => c.customer_email === user.email)
      .map(sanitizeCaseForCustomer);

    const notices = store.notifications.filter((n) => n.user_email === user.email);
    const invoices = store.invoices.filter((i) => i.customer_email === user.email);
    const payments = store.payments.filter((p) => p.customer_email === user.email);
    const supportTickets = store.supportTickets.filter((t) => t.customer_email === user.email);
    const dataRequests = store.dataRequests.filter((r) => r.user_email === user.email);

    const recentActivity = userCases
      .flatMap((c) =>
        c.activity.map((a) => ({
          ...a,
          case_number: c.case_number,
          case_title: c.title,
        }))
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

    res.json({
      user,
      stats: computeCaseStats(userCases),
      cases: userCases,
      recentActivity,
      notifications: notices,
      invoices,
      payments,
      supportTickets,
      dataRequests,
    });
  });

  app.post('/api/cases', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;

    const { title = '', platform = '', source_url = '', complaint_type = 'privacy', description = '' } =
      req.body || {};
    const valid = validateCaseInput({ title, platform, source_url });
    if (!valid.ok) {
      res.status(400).json({ error: valid.error });
      return;
    }

    const now = new Date().toISOString();
    const nextNum = 1042 + store.cases.length;
    const newCase: ProtectionCase = {
      id: 'case-' + crypto.randomUUID().slice(0, 8),
      case_number: `FR-2026-${nextNum}`,
      customer_email: user.email,
      customer_name: user.name || user.email,
      title: String(title).trim(),
      platform: String(platform).trim(),
      source_url: String(source_url).trim(),
      complaint_type: (complaint_type as ComplaintType) || 'privacy',
      description: String(description).trim(),
      status: 'submitted',
      submitted_at: now,
      updated_at: now,
      activity: [
        {
          id: 'act-' + crypto.randomUUID().slice(0, 8),
          activity_type: 'submitted',
          message: 'Case submitted for analyst review.',
          visibility: 'customer',
          created_at: now,
        },
      ],
      evidence: [],
      messages: [],
      submissions: [],
      verifications: [],
    };

    store.cases.unshift(newCase);
    addAndPushNotification(store, {
      id: 'not-' + crypto.randomUUID().slice(0, 8),
      user_email: user.email,
      title: `Case ${newCase.case_number} received`,
      body: `We received "${newCase.title}" and queued it for human review.`,
      read: false,
      created_at: now,
    });
    recordAudit(
      store,
      user.email,
      'case_submitted',
      'case',
      newCase.case_number,
      getCustomerWorkspaceName(store, user.email),
      { platform: newCase.platform, complaint_type: newCase.complaint_type }
    );
    saveStore(store);
    const safeNewCase = sanitizeCaseForCustomer(newCase);
    pushCustomerEvent(user.email, { type: 'case:updated', case: safeNewCase });
    res.json({ ok: true, case: safeNewCase });
  });

  app.post('/api/cases/:id/evidence', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target || (target.customer_email !== user.email && user.role === 'customer')) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    const {
      title = '',
      category = 'screenshot',
      reference_url = '',
      file_name = '',
      file_content_base64 = '',
      mime_type = '',
      notes = '',
    } = req.body || {};
    if (!String(title).trim()) {
      res.status(400).json({ error: 'Evidence title is required.' });
      return;
    }

    const evId = 'ev-' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();
    let fileBuffer: Buffer | null = null;
    if (typeof file_content_base64 === 'string' && file_content_base64.trim().length > 0) {
      const cleaned = file_content_base64.replace(/^data:[^;]+;base64,/, '').trim();
      fileBuffer = Buffer.from(cleaned, 'base64');
      if (fileBuffer.length > 3 * 1024 * 1024) {
        res.status(400).json({ error: 'Uploaded evidence file exceeds 3 MB maximum limit.' });
        return;
      }
    }

    const digest = fileBuffer
      ? crypto.createHash('sha256').update(fileBuffer).digest('hex').slice(0, 16)
      : crypto
          .createHash('sha256')
          .update(`${target.id}|${title}|${file_name}|${reference_url}|${now}`)
          .digest('hex')
          .slice(0, 16);

    if (fileBuffer) {
      encryptAndStoreVaultFile(evId, fileBuffer);
    }

    if (!Array.isArray(target.evidence)) target.evidence = [];
    const item = {
      id: evId,
      title: String(title).trim().slice(0, 160),
      category: (
        ['screenshot', 'ownership_proof', 'identity', 'correspondence', 'threat_log'].includes(
          String(category)
        )
          ? category
          : 'screenshot'
      ) as EvidenceCategory,
      reference_url: String(reference_url).trim() || undefined,
      file_name: String(file_name).trim() || undefined,
      sha256_preview: digest,
      has_encrypted_file: Boolean(fileBuffer),
      mime_type: fileBuffer ? String(mime_type || 'application/octet-stream').slice(0, 100) : undefined,
      file_size_bytes: fileBuffer ? fileBuffer.length : undefined,
      notes: String(notes).trim() || undefined,
      uploaded_by_role: (user.role === 'customer' ? 'customer' : 'staff') as 'customer' | 'staff',
      uploaded_by_email: user.email,
      created_at: now,
    };
    target.evidence.unshift(item);
    target.activity.push({
      id: 'act-' + crypto.randomUUID().slice(0, 8),
      activity_type: 'evidence_added',
      message: `Evidence archived${fileBuffer ? ' (AES-256-GCM encrypted)' : ''}: "${item.title}" (${digest}).`,
      visibility: 'customer',
      created_at: now,
    });
    target.updated_at = now;
    recordAudit(
      store,
      user.email,
      user.role === 'customer' ? 'case_evidence_uploaded' : 'case_evidence_added',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email),
      {
        evidence_title: item.title,
        category: item.category,
        sha256_preview: digest,
        encrypted_binary: Boolean(fileBuffer),
      }
    );
    saveStore(store);
    pushCustomerEvent(target.customer_email, {
      type: 'case:updated',
      case: sanitizeCaseForCustomer(target),
    });
    res.json({
      ok: true,
      evidence: item,
      case: user.role === 'customer' ? sanitizeCaseForCustomer(target) : target,
    });
  });

  app.get('/api/cases/:id/evidence/:evidenceId/download', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target || (target.customer_email !== user.email && user.role === 'customer')) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    const ev = (target.evidence || []).find((e) => e.id === req.params.evidenceId);
    if (!ev || !ev.has_encrypted_file) {
      res.status(404).json({ error: 'Encrypted evidence binary not found for this item.' });
      return;
    }
    const plain = readAndDecryptVaultFile(ev.id);
    if (!plain) {
      res.status(404).json({ error: 'Vault binary file is missing or corrupted.' });
      return;
    }
    recordAudit(
      store,
      user.email,
      'evidence_downloaded',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email),
      { evidence_id: ev.id, file_name: ev.file_name }
    );
    saveStore(store);
    const safeFilename = (ev.file_name || `${ev.id}.bin`).replace(/[^a-zA-Z0-9._-]/g, '_');
    res.setHeader('Content-Type', ev.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.send(plain);
  });

  app.post('/api/cases/:id/messages', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target || (target.customer_email !== user.email && user.role === 'customer')) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    const text = String(req.body?.message || '').trim();
    if (!text) {
      res.status(400).json({ error: 'Please enter a message.' });
      return;
    }
    const now = new Date().toISOString();
    target.messages.push({
      id: 'msg-' + crypto.randomUUID().slice(0, 8),
      sender_role: user.role === 'customer' ? 'customer' : 'staff',
      sender_email: user.email,
      message: text,
      created_at: now,
    });
    target.updated_at = now;
    recordAudit(
      store,
      user.email,
      user.role === 'customer' ? 'customer_case_message' : 'staff_case_message',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email)
    );
    saveStore(store);
    pushCustomerEvent(target.customer_email, {
      type: 'case:updated',
      case: sanitizeCaseForCustomer(target),
    });
    res.json({
      ok: true,
      case: user.role === 'customer' ? sanitizeCaseForCustomer(target) : target,
    });
  });

  app.post('/api/cases/:id/reopen-check', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    if (user.role === 'viewer') {
      res.status(403).json({ error: 'Read-only role cannot submit re-check requests.' });
      return;
    }
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target || (target.customer_email !== user.email && user.role === 'customer')) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    if (!canCustomerRequestRecheck(target.status)) {
      res.status(400).json({
        error: 'Only resolved, closed, actioned, or rejected cases can be submitted for a re-check.',
      });
      return;
    }
    const check = validateRecheckRequestInput({
      reason: String(req.body?.reason || ''),
      url: String(req.body?.reappeared_url || ''),
    });
    if (!check.ok) {
      res.status(400).json({ error: check.error });
      return;
    }

    const now = new Date().toISOString();
    const noteText = check.reappearedUrl
      ? `Re-check requested: ${check.reason} (Reported URL: ${check.reappearedUrl})`
      : `Re-check requested: ${check.reason}`;

    target.status = 'disputed';
    target.monitoring_enabled = true;
    target.updated_at = now;
    target.activity.push({
      id: 'act-' + crypto.randomUUID().slice(0, 8),
      activity_type: 'disputed',
      message: noteText,
      visibility: 'customer',
      created_at: now,
    });
    target.messages.push({
      id: 'msg-' + crypto.randomUUID().slice(0, 8),
      sender_role: user.role === 'customer' ? 'customer' : 'staff',
      sender_email: user.email,
      message: noteText,
      created_at: now,
    });

    addAndPushNotification(store, {
      id: 'not-' + crypto.randomUUID().slice(0, 8),
      user_email: target.customer_email,
      title: `Re-check opened for ${target.case_number}`,
      body: 'Our team received your re-check request and placed this link under priority monitoring.',
      read: false,
      created_at: now,
    });

    recordAudit(
      store,
      user.email,
      'customer_recheck_requested',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email),
      { reappeared_url: check.reappearedUrl || null }
    );
    saveStore(store);

    const safeCase = sanitizeCaseForCustomer(target);
    pushCustomerEvent(target.customer_email, { type: 'case:updated', case: safeCase });
    pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });

    res.json({
      ok: true,
      case: user.role === 'customer' ? safeCase : target,
    });
  });

  app.patch('/api/profile', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const { name, phone, id_document_name, face_photo_name, clear_id_document, clear_face_photo } =
      req.body || {};
    if (typeof name === 'string' && name.trim()) user.name = name.trim().slice(0, 120);
    if (typeof phone === 'string') user.phone = phone.trim().slice(0, 30);
    if (typeof id_document_name === 'string' && id_document_name.trim()) {
      user.id_document_name = id_document_name.trim();
      user.id_document_uploaded_at = new Date().toISOString();
    }
    if (clear_id_document) {
      delete user.id_document_name;
      delete user.id_document_uploaded_at;
    }
    if (typeof face_photo_name === 'string' && face_photo_name.trim()) {
      user.face_photo_name = face_photo_name.trim();
      user.face_photo_uploaded_at = new Date().toISOString();
    }
    if (clear_face_photo) {
      delete user.face_photo_name;
      delete user.face_photo_uploaded_at;
    }
    store.users[user.email] = user;
    recordAudit(
      store,
      user.email,
      'customer_profile_updated',
      'user',
      user.email,
      getCustomerWorkspaceName(store, user.email),
      {
        updated_id_doc: Boolean(id_document_name || clear_id_document),
        updated_face_photo: Boolean(face_photo_name || clear_face_photo),
      }
    );
    saveStore(store);
    res.json({ ok: true, user });
  });

  app.post('/api/data-requests', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const type = req.body?.type === 'deletion' ? 'deletion' : 'export';
    const notes = String(req.body?.notes || '').trim();
    const record: DataRequestRecord = {
      id: 'dr-' + crypto.randomUUID().slice(0, 8),
      user_email: user.email,
      type,
      notes,
      status: 'received',
      created_at: new Date().toISOString(),
    };
    store.dataRequests.unshift(record);
    recordAudit(
      store,
      user.email,
      `privacy_${type}_requested`,
      'data_request',
      record.id,
      getCustomerWorkspaceName(store, user.email),
      { type }
    );
    saveStore(store);
    res.json({ ok: true, request: record });
  });

  app.get('/api/account/export', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const payload = {
      exported_at: new Date().toISOString(),
      account: user,
      cases: store.cases.filter((c) => c.customer_email === user.email).map(sanitizeCaseForCustomer),
      invoices: store.invoices.filter((i) => i.customer_email === user.email),
      support_tickets: store.supportTickets.filter((t) => t.customer_email === user.email),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="full-remove-account-export.json"');
    res.send(JSON.stringify(payload, null, 2));
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    for (const n of store.notifications) {
      if (n.user_email === user.email) {
        n.read = true;
      }
    }
    saveStore(store);
    res.json({ ok: true });
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const target = store.notifications.find(
      (n) => n.id === req.params.id && n.user_email === user.email
    );
    if (target) {
      target.read = true;
      saveStore(store);
    }
    res.json({ ok: true });
  });

  app.post('/api/billing/attach-package', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const { case_id, service_code } = req.body || {};
    const targetCase = store.cases.find(
      (c) => c.id === case_id && c.customer_email === user.email
    );
    const pkg = getServiceByCode(String(service_code || ''));
    if (!targetCase || !pkg) {
      res.status(400).json({ error: 'Please select both a valid case and service package.' });
      return;
    }
    targetCase.service_code = pkg.code;
    const now = new Date().toISOString();
    const invoice: InvoiceRecord = {
      id: 'inv-' + crypto.randomUUID().slice(0, 8),
      invoice_number: `INV-2026-${1003 + store.invoices.length}`,
      case_id: targetCase.id,
      case_number: targetCase.case_number,
      customer_email: user.email,
      service_code: pkg.code,
      service_name: pkg.name,
      amount_usd: pkg.priceUsd,
      status: 'unpaid',
      created_at: now,
    };
    store.invoices.unshift(invoice);
    recordAudit(
      store,
      user.email,
      'invoice_generated',
      'invoice',
      invoice.invoice_number,
      getCustomerWorkspaceName(store, user.email),
      { case_number: targetCase.case_number, service_code: pkg.code, amount_usd: pkg.priceUsd }
    );
    saveStore(store);
    res.json({ ok: true, invoice });
  });

  app.post('/api/billing/payments', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const { invoice_id, method = 'bank_transfer', reference = '' } = req.body || {};
    const invoice = store.invoices.find(
      (i) => i.id === invoice_id && i.customer_email === user.email
    );
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }
    if (!String(reference).trim()) {
      res.status(400).json({ error: 'Please enter your transfer or receipt reference.' });
      return;
    }
    const now = new Date().toISOString();
    const payment: PaymentSubmission = {
      id: 'pay-' + crypto.randomUUID().slice(0, 8),
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer_email: user.email,
      method: method === 'cash' || method === 'manual' ? method : 'bank_transfer',
      reference: String(reference).trim(),
      amount_usd: invoice.amount_usd,
      status: 'pending_review',
      submitted_at: now,
    };
    invoice.status = 'pending_review';
    store.payments.unshift(payment);
    recordAudit(
      store,
      user.email,
      'payment_submitted',
      'payment',
      payment.id,
      getCustomerWorkspaceName(store, user.email),
      {
        invoice_number: invoice.invoice_number,
        amount_usd: invoice.amount_usd,
        method: payment.method,
      }
    );
    saveStore(store);
    res.json({ ok: true, payment });
  });

  app.post('/api/billing/instant-checkout', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const { invoice_id, cardholder_name = '', card_last4 = '' } = req.body || {};
    const invoice = store.invoices.find(
      (i) => i.id === invoice_id && i.customer_email === user.email
    );
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }
    if (invoice.status === 'paid') {
      res.status(400).json({ error: 'This invoice is already paid.' });
      return;
    }
    const cleanName = String(cardholder_name).trim();
    const cleanLast4 = String(card_last4).replace(/\D/g, '').slice(-4);
    if (cleanName.length < 2 || cleanLast4.length !== 4) {
      res.status(400).json({ error: 'Valid cardholder name and 4-digit card ending are required.' });
      return;
    }

    const now = new Date().toISOString();
    const txRef = `CARD-${cleanLast4}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const payment: PaymentSubmission = {
      id: 'pay-' + crypto.randomUUID().slice(0, 8),
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      customer_email: user.email,
      method: 'card_gateway',
      reference: txRef,
      amount_usd: invoice.amount_usd,
      status: 'approved',
      reviewed_by: 'gateway-auto',
      reviewed_at: now,
      submitted_at: now,
    };
    invoice.status = 'paid';
    store.payments.unshift(payment);
    addAndPushNotification(store, {
      id: 'not-' + crypto.randomUUID().slice(0, 8),
      user_email: user.email,
      title: `Instant payment settled for ${invoice.invoice_number}`,
      body: `Online card payment (${txRef}) approved for $${invoice.amount_usd}. Your case is prioritized for platform submission.`,
      read: false,
      created_at: now,
    });
    recordAudit(
      store,
      user.email,
      'payment_instant_settled',
      'payment',
      payment.id,
      getCustomerWorkspaceName(store, user.email),
      {
        invoice_number: invoice.invoice_number,
        amount_usd: invoice.amount_usd,
        reference: txRef,
        cardholder_name: cleanName,
      }
    );
    saveStore(store);
    res.json({ ok: true, payment, invoice });
  });

  app.post('/api/support', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const { subject = '', category = 'general', priority = 'normal', message = '' } =
      req.body || {};
    if (!String(subject).trim() || !String(message).trim()) {
      res.status(400).json({ error: 'Subject and message are required.' });
      return;
    }
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: 'sup-' + crypto.randomUUID().slice(0, 8),
      ticket_number: `SUP-${410 + store.supportTickets.length}`,
      customer_email: user.email,
      subject: String(subject).trim(),
      category: String(category),
      priority: String(priority),
      status: 'open',
      created_at: now,
      updated_at: now,
      messages: [
        {
          id: 'smsg-' + crypto.randomUUID().slice(0, 8),
          sender_role: 'customer',
          sender_email: user.email,
          message: String(message).trim(),
          created_at: now,
        },
      ],
    };
    store.supportTickets.unshift(ticket);
    recordAudit(
      store,
      user.email,
      'support_ticket_opened',
      'support',
      ticket.ticket_number,
      getCustomerWorkspaceName(store, user.email),
      { category: ticket.category, priority: ticket.priority }
    );
    saveStore(store);
    res.json({ ok: true, ticket });
  });

  app.post('/api/support/:id/reply', (req, res) => {
    const store = loadStore();
    const user = requireActiveUser(req, res, store);
    if (!user) return;
    const ticket = store.supportTickets.find((t) => t.id === req.params.id);
    if (!ticket || (ticket.customer_email !== user.email && user.role === 'customer')) {
      res.status(404).json({ error: 'Support ticket not found.' });
      return;
    }
    const message = String(req.body?.message || '').trim();
    if (!message) {
      res.status(400).json({ error: 'Reply message cannot be empty.' });
      return;
    }
    const now = new Date().toISOString();
    ticket.messages.push({
      id: 'smsg-' + crypto.randomUUID().slice(0, 8),
      sender_role: user.role === 'customer' ? 'customer' : 'staff',
      sender_email: user.email,
      message,
      created_at: now,
    });
    ticket.status = user.role === 'customer' ? 'open' : 'awaiting_customer';
    ticket.updated_at = now;
    if (user.role !== 'customer') {
      addAndPushNotification(store, {
        id: 'not-' + crypto.randomUUID().slice(0, 8),
        user_email: ticket.customer_email,
        title: `Support reply on ${ticket.ticket_number}`,
        body: message.slice(0, 140),
        read: false,
        created_at: now,
      });
    }
    recordAudit(
      store,
      user.email,
      user.role === 'customer' ? 'support_customer_reply' : 'support_staff_reply',
      'support',
      ticket.ticket_number,
      getCustomerWorkspaceName(store, ticket.customer_email)
    );
    saveStore(store);
    res.json({ ok: true, ticket });
  });

  // Staff Operations API
  function requireStaff(req: Request, res: Response, store: StoreData): UserAccount | null {
    const user = getSessionUser(req, store);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return null;
    }
    if (!['owner', 'admin', 'analyst', 'viewer'].includes(user.role)) {
      res.status(403).json({ error: 'Staff authorization required.' });
      return null;
    }
    return user;
  }

  app.get('/api/staff/workspace', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    const stats = computeCaseStats(store.cases);
    res.json({
      organization: { name: 'Full Remove Operations' },
      current_role: user.role,
      user,
      totals: {
        total: stats.total,
        open: stats.inProgress,
        needs_information: stats.needsAttention,
        resolved: stats.resolved,
      },
      cases: store.cases,
      inquiries: store.inquiries,
      staff: store.staffMembers,
      invitations: store.invitations,
    });
  });

  app.post('/api/staff/cases/bulk-action', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    if (user.role === 'viewer') {
      res.status(403).json({ error: 'Read-only role cannot modify cases.' });
      return;
    }

    const rawIds: unknown[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const ids = Array.from(
      new Set(
        rawIds
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
          .map((id) => id.trim())
      )
    ).slice(0, 50);

    const action = String(req.body?.action || '').trim();
    if (ids.length === 0) {
      res.status(400).json({ error: 'Select at least one case first.' });
      return;
    }
    if (!['assign_self', 'start_review', 'toggle_monitor'].includes(action)) {
      res.status(400).json({ error: 'Unsupported bulk case action.' });
      return;
    }

    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const caseId of ids) {
      const target = store.cases.find((c) => c.id === caseId);
      if (!target) continue;

      if (action === 'assign_self') {
        target.assigned_to = user.email;
        target.updated_at = now;
        target.activity.push({
          id: 'act-' + crypto.randomUUID().slice(0, 8),
          activity_type: 'analyst_assigned',
          message: `Assigned to analyst ${user.email} (bulk action).`,
          visibility: 'staff',
          created_at: now,
        });
        updatedCount++;
      } else if (action === 'start_review') {
        const nextStatus = applyCaseTransition(target.status, 'start_review');
        if (!nextStatus) continue;
        target.status = nextStatus;
        target.updated_at = now;
        target.activity.push({
          id: 'act-' + crypto.randomUUID().slice(0, 8),
          activity_type: nextStatus,
          message: 'Case status updated to reviewing.',
          visibility: 'customer',
          created_at: now,
        });
        updatedCount++;
      } else if (action === 'toggle_monitor') {
        const nextMonitor = !target.monitoring_enabled;
        target.monitoring_enabled = nextMonitor;
        if (nextMonitor) target.last_monitored_at = now;
        target.updated_at = now;
        target.activity.push({
          id: 'act-' + crypto.randomUUID().slice(0, 8),
          activity_type: 'watchlist_monitor',
          message: nextMonitor
            ? 'Automated URL watchlist monitoring enabled.'
            : 'Automated URL watchlist monitoring paused.',
          visibility: 'customer',
          created_at: now,
        });
        updatedCount++;
      }

      pushCustomerEvent(target.customer_email, {
        type: 'case:updated',
        case: sanitizeCaseForCustomer(target),
      });
    }

    if (updatedCount > 0) {
      recordAudit(
        store,
        user.email,
        `bulk_${action}`,
        'case',
        `${updatedCount} cases`,
        'Staff Queue',
        { case_ids: ids, updated_count: updatedCount }
      );
      saveStore(store);
    }

    res.json({
      ok: true,
      updated_count: updatedCount,
      cases: store.cases,
    });
  });

  app.post('/api/staff/cases/:id/action', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    if (user.role === 'viewer') {
      res.status(403).json({ error: 'Read-only role cannot modify cases.' });
      return;
    }
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    const { action, message = '' } = req.body || {};
    const now = new Date().toISOString();

    if (action === 'toggle_monitor') {
      const nextMonitor =
        typeof req.body?.enabled === 'boolean' ? req.body.enabled : !target.monitoring_enabled;
      target.monitoring_enabled = nextMonitor;
      if (nextMonitor) {
        target.last_monitored_at = now;
      }
      target.updated_at = now;
      const summary = nextMonitor
        ? 'Automated URL watchlist monitoring enabled.'
        : 'Automated URL watchlist monitoring paused.';
      target.activity.push({
        id: 'act-' + crypto.randomUUID().slice(0, 8),
        activity_type: 'watchlist_monitor',
        message: summary,
        visibility: 'customer',
        created_at: now,
      });
      recordAudit(
        store,
        user.email,
        nextMonitor ? 'case_monitor_enabled' : 'case_monitor_paused',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email)
      );
      saveStore(store);
      pushCustomerEvent(target.customer_email, {
        type: 'case:updated',
        case: sanitizeCaseForCustomer(target),
      });
      res.json({ ok: true, case: target, message: summary });
      return;
    }

    if (action === 'assign') {
      const assignee = String(req.body?.assignee || '').trim().toLowerCase();
      target.assigned_to = assignee || undefined;
      target.updated_at = now;
      target.activity.push({
        id: 'act-' + crypto.randomUUID().slice(0, 8),
        activity_type: 'analyst_assigned',
        message: assignee ? `Assigned to analyst ${assignee}.` : 'Case returned to unassigned triage pool.',
        visibility: 'staff',
        created_at: now,
      });
      recordAudit(
        store,
        user.email,
        'case_assigned',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email),
        { assigned_to: assignee || 'unassigned' }
      );
      saveStore(store);
      pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
      res.json({ ok: true, case: target, message: assignee ? `Assigned to ${assignee}` : 'Unassigned' });
      return;
    }

    if (action === 'internal_note') {
      if (!String(message).trim()) {
        res.status(400).json({ error: 'Note text is required.' });
        return;
      }
      target.activity.push({
        id: 'act-' + crypto.randomUUID().slice(0, 8),
        activity_type: 'internal_note',
        message: String(message).trim(),
        visibility: 'staff',
        created_at: now,
      });
      target.updated_at = now;
      recordAudit(
        store,
        user.email,
        'case_internal_note',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email)
      );
      saveStore(store);
      res.json({ ok: true, case: target, message: 'Internal note saved.' });
      return;
    }

    if (action === 'reply_customer') {
      if (!String(message).trim()) {
        res.status(400).json({ error: 'Reply text is required.' });
        return;
      }
      target.messages.push({
        id: 'msg-' + crypto.randomUUID().slice(0, 8),
        sender_role: 'staff',
        sender_email: user.email,
        message: String(message).trim(),
        created_at: now,
      });
      addAndPushNotification(store, {
        id: 'not-' + crypto.randomUUID().slice(0, 8),
        user_email: target.customer_email,
        title: `New team reply on ${target.case_number}`,
        body: String(message).trim().slice(0, 140),
        read: false,
        created_at: now,
      });
      pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
      pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
      target.updated_at = now;
      recordAudit(
        store,
        user.email,
        'case_customer_reply',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email)
      );
      saveStore(store);
      res.json({ ok: true, case: target, message: 'Reply sent to customer.' });
      return;
    }

    const nextStatus: CaseStatus | null = applyCaseTransition(
      target.status,
      action as CaseActionType
    );
    if (!nextStatus) {
      res.status(400).json({ error: 'Invalid status transition for this case.' });
      return;
    }
    target.status = nextStatus;
    target.updated_at = now;
    const summary =
      action === 'request_information' && String(message).trim()
        ? `Staff requested information: ${String(message).trim()}`
        : `Case status updated to ${nextStatus.replaceAll('_', ' ')}.`;
    target.activity.push({
      id: 'act-' + crypto.randomUUID().slice(0, 8),
      activity_type: nextStatus,
      message: summary,
      visibility: 'customer',
      created_at: now,
    });
    addAndPushNotification(store, {
      id: 'not-' + crypto.randomUUID().slice(0, 8),
      user_email: target.customer_email,
      title: `Case ${target.case_number} updated`,
      body: summary,
      read: false,
      created_at: now,
    });
    pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
    pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
    recordAudit(
      store,
      user.email,
      'case_status_updated',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email),
      { status: nextStatus, action }
    );
    saveStore(store);
    res.json({ ok: true, case: target, message: summary });
  });

  app.post('/api/staff/cases/:id/submissions', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    const {
      platform = '',
      submission_channel = 'web_form',
      status = 'submitted',
      external_reference = '',
      response_summary = '',
    } = req.body || {};
    if (!String(platform).trim()) {
      res.status(400).json({ error: 'Platform name is required.' });
      return;
    }
    const now = new Date().toISOString();
    target.submissions.push({
      id: 'sub-' + crypto.randomUUID().slice(0, 8),
      platform: String(platform).trim(),
      submission_channel,
      status,
      external_reference: String(external_reference).trim() || undefined,
      response_summary: String(response_summary).trim() || undefined,
      submitted_at: now,
    });
    target.updated_at = now;
    recordAudit(
      store,
      user.email,
      'platform_submission_logged',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email),
      { platform, external_reference }
    );
    saveStore(store);
    pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
    pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
    res.json({ ok: true, case: target });
  });

  app.post('/api/staff/cases/:id/verifications', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    const { result = 'confirmed_removed', checked_url = '', notes = '' } = req.body || {};
    if (!String(checked_url).trim()) {
      res.status(400).json({ error: 'Checked URL is required.' });
      return;
    }
    const now = new Date().toISOString();
    target.verifications.push({
      id: 'ver-' + crypto.randomUUID().slice(0, 8),
      result,
      checked_url: String(checked_url).trim(),
      notes: String(notes).trim() || undefined,
      checked_at: now,
    });
    target.updated_at = now;
    recordAudit(
      store,
      user.email,
      'removal_verification_logged',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email),
      { result, checked_url }
    );
    saveStore(store);
    pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
    pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
    res.json({ ok: true, case: target });
  });

  app.post('/api/staff/cases/:id/check-url', async (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    const target = store.cases.find((c) => c.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    const checkedUrl = String(req.body?.checked_url || target.source_url || '').trim();
    const probe = await checkUrlAvailabilitySafe(checkedUrl);
    if (!probe.ok) {
      res.status(400).json({ error: probe.diagnostic_note });
      return;
    }
    const now = new Date().toISOString();
    const verification: VerificationCheckItem = {
      id: 'ver-' + crypto.randomUUID().slice(0, 8),
      result: probe.result,
      checked_url: checkedUrl,
      notes: probe.diagnostic_note,
      checked_at: now,
    };
    target.verifications.push(verification);
    target.updated_at = now;
    if (probe.result === 'confirmed_removed') {
      addAndPushNotification(store, {
        id: 'not-' + crypto.randomUUID().slice(0, 8),
        user_email: target.customer_email,
        title: `Live check confirmed removal on ${target.case_number}`,
        body: probe.diagnostic_note,
        read: false,
        created_at: now,
      });
      pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
    }
    recordAudit(
      store,
      user.email,
      'removal_verification_checked',
      'case',
      target.case_number,
      getCustomerWorkspaceName(store, target.customer_email),
      { result: probe.result, http_status: probe.http_status, checked_url: checkedUrl }
    );
    saveStore(store);
    pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
    if (probe.result !== 'confirmed_removed') {
      pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
    }
    res.json({
      ok: true,
      verification,
      http_status: probe.http_status,
      diagnostic_note: probe.diagnostic_note,
      case: target,
    });
  });

  async function executeWatchlistSweep(
    store: StoreData,
    actorEmail: string,
    targetIds?: string[]
  ) {
    const idSet =
      Array.isArray(targetIds) && targetIds.length > 0 ? new Set(targetIds.map(String)) : null;
    const watchedCases = store.cases
      .filter((c) => Boolean(c.monitoring_enabled) && (!idSet || idSet.has(c.id)))
      .slice(0, 20);

    const now = new Date().toISOString();
    const results: WatchlistSweepItemResult[] = [];

    for (let i = 0; i < watchedCases.length; i += 4) {
      const batch = watchedCases.slice(i, i + 4);
      const settled = await Promise.all(
        batch.map(async (c) => {
          const probe = await checkUrlAvailabilitySafe(c.source_url);
          return { c, probe };
        })
      );

      for (const { c, probe } of settled) {
        const previousStatus = c.status;
        const resultType = probe.result;
        const reappearedAlert = isReappearedSweepFinding(previousStatus, resultType);

        const verification: VerificationCheckItem = {
          id: 'ver-' + crypto.randomUUID().slice(0, 8),
          result: resultType,
          checked_url: c.source_url,
          notes: `[Watchlist sweep] ${probe.diagnostic_note}`,
          checked_at: now,
        };
        c.verifications.push(verification);
        c.last_monitored_at = now;
        c.updated_at = now;

        if (reappearedAlert) {
          addAndPushNotification(store, {
            id: 'not-' + crypto.randomUUID().slice(0, 8),
            user_email: c.customer_email,
            title: `Watchlist alert on ${c.case_number}`,
            body: `Automated check detected the link may still be accessible (${probe.diagnostic_note}).`,
            read: false,
            created_at: now,
          });
          pushCustomerEvent(c.customer_email, { type: 'workspace:refresh' });
        }

        pushCustomerEvent(c.customer_email, {
          type: 'case:updated',
          case: sanitizeCaseForCustomer(c),
        });

        results.push({
          caseId: c.id,
          caseNumber: c.case_number,
          previousStatus,
          checkedUrl: c.source_url,
          result: resultType,
          httpStatus: probe.http_status,
          diagnosticNote: probe.diagnostic_note,
          reappearedAlert,
        });
      }
    }

    const summary = summarizeWatchlistSweep(results);
    recordAudit(
      store,
      actorEmail,
      'watchlist_sweep_completed',
      'case',
      `${summary.checkedCount} watched links`,
      'Watchlist Monitor',
      { ...summary }
    );
    saveStore(store);

    return {
      summary,
      results,
      checked_at: now,
    };
  }

  app.post('/api/staff/watchlist/sweep', async (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    if (user.role === 'viewer') {
      res.status(403).json({ error: 'Read-only role cannot run watchlist sweeps.' });
      return;
    }
    const targetIds = Array.isArray(req.body?.ids)
      ? req.body.ids.filter((id: unknown): id is string => typeof id === 'string')
      : undefined;
    const sweep = await executeWatchlistSweep(store, user.email, targetIds);
    res.json({
      ok: true,
      ...sweep,
      cases: store.cases,
    });
  });

  app.post('/api/staff/invitations', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const role = req.body?.role === 'admin' || req.body?.role === 'viewer' ? req.body.role : 'analyst';
    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Valid staff email required.' });
      return;
    }
    const inv: StaffInvitation = {
      id: 'inv-' + crypto.randomUUID().slice(0, 8),
      invited_email: email,
      role,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };
    store.invitations.unshift(inv);
    recordAudit(
      store,
      user.email,
      'staff_invitation_created',
      'staff_invitation',
      inv.invited_email,
      'Full Remove Operations',
      { role }
    );
    saveStore(store);
    res.json({ ok: true, invitation: inv });
  });

  app.post('/api/staff/team/:id/role', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    const member = store.staffMembers.find((m) => m.id === req.params.id);
    if (!member) {
      res.status(404).json({ error: 'Staff member not found.' });
      return;
    }
    if (req.body?.action === 'suspend') {
      member.status = 'suspended';
    } else if (req.body?.role) {
      member.role = req.body.role;
    }
    recordAudit(
      store,
      user.email,
      req.body?.action === 'suspend' ? 'staff_member_suspended' : 'staff_role_updated',
      'staff_member',
      member.email,
      'Full Remove Operations',
      { role: member.role, status: member.status }
    );
    saveStore(store);
    res.json({ ok: true, member });
  });

  function convertInquiryToCaseRecord(store: StoreData, inq: InquiryRecord, actorEmail: string): ProtectionCase {
    const now = new Date().toISOString();
    const customerEmail = inq.email.trim().toLowerCase();
    if (!store.users[customerEmail]) {
      store.users[customerEmail] = {
        email: customerEmail,
        name: inq.name,
        phone: '',
        workspace_name: `${inq.name} Protection`,
        access_status: 'active',
        role: 'customer',
        created_at: now,
      };
    }
    const nextNum = 1042 + store.cases.length;
    const interestLow = inq.interest.toLowerCase();
    const complaintType: ComplaintType = interestLow.includes('deepfake')
      ? 'deepfake'
      : interestLow.includes('extortion') || interestLow.includes('blackmail')
        ? 'extortion'
        : interestLow.includes('copyright') || interestLow.includes('image')
          ? 'copyright'
          : interestLow.includes('website') || interestLow.includes('impostor') || interestLow.includes('account')
            ? 'impersonation'
            : 'privacy';

    const newCase: ProtectionCase = {
      id: 'case-' + crypto.randomUUID().slice(0, 8),
      case_number: `FR-2026-${nextNum}`,
      customer_email: customerEmail,
      customer_name: inq.name,
      title: `${inq.interest} (${inq.name})`.slice(0, 120),
      platform: 'Submitted via Web Inquiry',
      source_url: 'https://www.fremove.com/intake-pending-url',
      complaint_type: complaintType,
      description: inq.message,
      status: 'reviewing',
      submitted_at: now,
      updated_at: now,
      evidence: [],
      activity: [
        {
          id: 'act-' + crypto.randomUUID().slice(0, 8),
          activity_type: 'reviewing',
          message: `Converted from public inquiry ${inq.id} by ${actorEmail}.`,
          visibility: 'customer',
          created_at: now,
        },
      ],
      messages: [],
      submissions: [],
      verifications: [],
    };
    store.cases.unshift(newCase);
    inq.status = 'converted';
    inq.converted_case_id = newCase.id;
    addAndPushNotification(store, {
      id: 'not-' + crypto.randomUUID().slice(0, 8),
      user_email: customerEmail,
      title: `Inquiry opened as ${newCase.case_number}`,
      body: `Our operations team opened case ${newCase.case_number} from your confidential inquiry.`,
      read: false,
      created_at: now,
    });
    pushCustomerEvent(customerEmail, { type: 'workspace:refresh' });
    recordAudit(
      store,
      actorEmail,
      'inquiry_converted_to_case',
      'case',
      newCase.case_number,
      getCustomerWorkspaceName(store, customerEmail),
      { inquiry_id: inq.id }
    );
    return newCase;
  }

  app.post('/api/staff/inquiries/:id/action', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;
    const inq = store.inquiries.find((i) => i.id === req.params.id);
    if (!inq) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    const { action = 'mark_reviewed' } = req.body || {};
    if (action === 'convert_to_case') {
      if (inq.status === 'converted' && inq.converted_case_id) {
        const existing = store.cases.find((c) => c.id === inq.converted_case_id);
        res.json({ ok: true, inquiry: inq, case: existing });
        return;
      }
      const created = convertInquiryToCaseRecord(store, inq, user.email);
      saveStore(store);
      res.json({ ok: true, inquiry: inq, case: created });
      return;
    }
    inq.status = action === 'archive' ? 'archived' : 'reviewed';
    recordAudit(store, user.email, `inquiry_${inq.status}`, 'inquiry', inq.id, inq.name);
    saveStore(store);
    res.json({ ok: true, inquiry: inq });
  });

  // Central Admin Operations / Platform Control Center API
  const ALL_PLATFORM_SECTIONS = [
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
  ];

  function getCustomerWorkspaceName(store: StoreData, email: string): string {
    const u = store.users[email];
    return u?.workspace_name || u?.name || email;
  }

  function resolvePlatformRole(store: StoreData, user: UserAccount): PlatformRoleName {
    const match = store.platformRoles.find(
      (r) => r.email.toLowerCase() === user.email.toLowerCase() && r.status === 'active'
    );
    if (match) return match.role;
    return user.role === 'owner' || user.role === 'admin' ? 'operations_admin' : 'case_manager';
  }

  const PLATFORM_VIEW_PERMISSION_MAP: Record<string, PlatformPermission> = {
    overview: 'overview',
    customers: 'customers',
    customer_profile: 'customers',
    payments: 'payments',
    cases: 'cases',
    case: 'cases',
    support: 'support',
    ticket: 'support',
    requests: 'requests',
    audit: 'audit',
    reports: 'reports',
    visitors: 'visitors',
    roles: 'roles',
  };

  app.get('/api/platform/operations', (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;

    const view = String(req.query.view || 'overview');
    const current_role = resolvePlatformRole(store, user);
    const actor = user.email;
    const sections = ALL_PLATFORM_SECTIONS.filter((sec) => {
      const perm = PLATFORM_VIEW_PERMISSION_MAP[sec];
      return perm ? hasPlatformPermission(current_role, perm) : false;
    });

    const requiredViewPerm = PLATFORM_VIEW_PERMISSION_MAP[view];
    if (!requiredViewPerm) {
      res.status(400).json({ error: 'Unknown platform operations view.' });
      return;
    }
    if (!hasPlatformPermission(current_role, requiredViewPerm)) {
      res.status(403).json({
        error: `Role "${current_role}" lacks permission "${requiredViewPerm}" for this section.`,
      });
      return;
    }

    const customerUsers = Object.values(store.users).filter((u) => u.role === 'customer');
    const customerEmails = customerUsers.map((u) => u.email);

    if (view === 'overview') {
      const ov = computePlatformOverview({
        customerEmails,
        cases: store.cases,
        tickets: store.supportTickets,
        requests: store.dataRequests,
        payments: store.payments,
      });
      const slaAttention = store.cases.filter((c) => {
        const sla = computeCaseSla(c);
        return sla.health === 'overdue' || sla.health === 'due_soon';
      }).length;
      const inquiriesNew = store.inquiries.filter((i) => !i.status || i.status === 'new').length;
      res.json({
        current_role,
        actor,
        sections,
        overview: {
          organizations: ov.organizations,
          cases: { total: ov.casesTotal, open: ov.casesOpen, sla_attention: slaAttention },
          support: { total: ov.supportTotal, open: ov.supportOpen },
          requests: { total: ov.requestsTotal, open: ov.requestsOpen },
          pending_payments: ov.pendingPayments,
          inquiries_new: inquiriesNew,
        },
        inquiries: store.inquiries,
        events: store.auditLog.slice(0, 50),
      });
      return;
    }

    if (view === 'customers') {
      const customers = customerUsers.map((u) => {
        const userCases = store.cases.filter((c) => c.customer_email === u.email);
        const userTickets = store.supportTickets.filter((t) => t.customer_email === u.email);
        const userInvoices = store.invoices.filter((i) => i.customer_email === u.email);
        const latestInv = userInvoices[0];
        return {
          organization_id: u.email,
          account_name: u.name || u.email,
          email: u.email,
          phone: u.phone || '',
          workspace_name: u.workspace_name || `${u.name || 'Customer'} Workspace`,
          plan_code: latestInv?.service_code || userCases[0]?.service_code || 'starter',
          subscription_status: latestInv ? latestInv.status : 'none',
          invoice_count: userInvoices.length,
          case_count: userCases.length,
          support_count: userTickets.length,
          registered_at: u.created_at,
          access_status: u.access_status || 'active',
        };
      });
      const attention = store.cases.filter((c) => c.status === 'needs_information').length;
      const activeSubs = customers.filter(
        (c) => c.subscription_status === 'paid' || c.subscription_status === 'pending_review'
      ).length;
      res.json({
        current_role,
        actor,
        sections,
        summary: {
          registered: customers.length,
          active_subscriptions: activeSubs,
          attention,
        },
        customers,
      });
      return;
    }

    if (view === 'payments') {
      const payments = store.payments.map((p) => {
        const u = store.users[p.customer_email];
        const inv = store.invoices.find((i) => i.id === p.invoice_id);
        return {
          id: p.id,
          invoice_id: p.invoice_id,
          invoice_number: p.invoice_number,
          plan_code: inv?.service_code || '',
          service_name: inv?.service_name || '',
          customer_reference: p.reference,
          organization_name: getCustomerWorkspaceName(store, p.customer_email),
          customer_name: u?.name || p.customer_email,
          customer_email: p.customer_email,
          phone_number: u?.phone || '',
          amount: p.amount_usd,
          currency: 'USD',
          method: p.method,
          status: p.status,
          invoice_status: inv?.status || 'unpaid',
          whatsapp_status: p.whatsapp_status || 'none',
          admin_note: p.admin_note || '',
          created_at: p.submitted_at,
        };
      });
      res.json({ current_role, actor, sections, payments });
      return;
    }

    if (view === 'customer_profile') {
      const id = String(req.query.id || '');
      const pay = store.payments.find((p) => p.id === id);
      const email = pay?.customer_email || id;
      const u = store.users[email];
      if (!u) {
        res.status(404).json({ error: 'Customer profile not found.' });
        return;
      }
      res.json({
        current_role,
        actor,
        sections,
        customer: {
          full_name: u.name,
          email: u.email,
          phone_number: u.phone,
          workspace_name: getCustomerWorkspaceName(store, u.email),
          access_status: u.access_status || 'active',
          profile_created_at: u.created_at,
          profile_updated_at: u.id_document_uploaded_at || u.created_at,
          identity_document_name: u.id_document_name || '',
          identity_photo_name: u.face_photo_name || '',
        },
      });
      return;
    }

    if (view === 'cases') {
      const orgFilter = String(req.query.organization_id || '').trim().toLowerCase();
      const filteredCases = orgFilter
        ? store.cases.filter((c) => c.customer_email.toLowerCase() === orgFilter)
        : store.cases;
      const cases = filteredCases.map((c) => {
        const inv = store.invoices.find((i) => i.case_id === c.id);
        const pay = inv ? store.payments.find((p) => p.invoice_id === inv.id) : undefined;
        return {
          ...c,
          organization_name: getCustomerWorkspaceName(store, c.customer_email),
          invoice_number: inv?.invoice_number || null,
          invoice_status: inv?.status || null,
          payment_id: pay?.id || null,
          payment_status: pay?.status || null,
          last_activity_at: c.updated_at,
        };
      });
      res.json({ current_role, actor, sections, cases });
      return;
    }

    if (view === 'case') {
      const id = String(req.query.id || '');
      const c = store.cases.find((x) => x.id === id);
      if (!c) {
        res.status(404).json({ error: 'Case not found.' });
        return;
      }
      res.json({
        current_role,
        actor,
        sections,
        case: {
          ...c,
          organization_name: getCustomerWorkspaceName(store, c.customer_email),
        },
        evidence: c.evidence || [],
        activity: c.activity,
        messages: c.messages,
        submissions: c.submissions,
        verifications: c.verifications,
      });
      return;
    }

    if (view === 'support') {
      const tickets = store.supportTickets.map((t) => {
        const u = store.users[t.customer_email];
        const lastMsg = t.messages[t.messages.length - 1];
        return {
          ...t,
          organization_name: getCustomerWorkspaceName(store, t.customer_email),
          customer_name: u?.name || t.customer_email,
          unread_count:
            t.status === 'open' && lastMsg?.sender_role === 'customer' ? 1 : 0,
          last_activity_at: t.updated_at,
        };
      });
      res.json({ current_role, actor, sections, tickets });
      return;
    }

    if (view === 'ticket') {
      const id = String(req.query.id || '');
      const t = store.supportTickets.find((x) => x.id === id);
      if (!t) {
        res.status(404).json({ error: 'Support ticket not found.' });
        return;
      }
      const u = store.users[t.customer_email];
      res.json({
        current_role,
        actor,
        sections,
        ticket: {
          ...t,
          organization_name: getCustomerWorkspaceName(store, t.customer_email),
          customer_name: u?.name || t.customer_email,
        },
        messages: t.messages,
      });
      return;
    }

    if (view === 'requests') {
      const requests = store.dataRequests.map((r) => {
        const u = store.users[r.user_email];
        return {
          id: r.id,
          request_type: r.type,
          notes: r.notes,
          admin_note: r.admin_note || '',
          status: r.status,
          created_at: r.created_at,
          customer_email: r.user_email,
          customer_name: u?.name || r.user_email,
          organization_name: getCustomerWorkspaceName(store, r.user_email),
        };
      });
      res.json({ current_role, actor, sections, requests });
      return;
    }

    if (view === 'audit') {
      res.json({ current_role, actor, sections, events: store.auditLog });
      return;
    }

    if (view === 'roles') {
      res.json({ current_role, actor, sections, roles: store.platformRoles });
      return;
    }

    if (view === 'reports') {
      const startDate = String(req.query.start_date || '');
      const endDate = String(req.query.end_date || '');
      const inRange = (iso?: string) => {
        if (!iso) return true;
        const d = iso.slice(0, 10);
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      };

      const filteredCases = store.cases.filter((c) => inRange(c.submitted_at));
      const filteredPayments = store.payments.filter((p) => inRange(p.submitted_at));
      const approvedUsd = filteredPayments
        .filter((p) => p.status === 'approved')
        .reduce((acc, p) => acc + p.amount_usd, 0);

      const reportSections = {
        customers: customerUsers.filter((u) => inRange(u.created_at)),
        cases: filteredCases,
        support: store.supportTickets.filter((t) => inRange(t.created_at)),
        privacy_requests: store.dataRequests.filter((r) => inRange(r.created_at)),
        invoices: store.invoices.filter((i) => inRange(i.created_at)),
        payments: filteredPayments,
        submissions: filteredCases.flatMap((c) =>
          c.submissions.map((s) => ({ case_number: c.case_number, ...s }))
        ),
        verifications: filteredCases.flatMap((c) =>
          c.verifications.map((v) => ({ case_number: c.case_number, ...v }))
        ),
        audit: store.auditLog.filter((a) => inRange(a.created_at)),
        invitations: store.invitations.filter((i) => inRange(i.created_at)),
        notifications: store.notifications.filter((n) => inRange(n.created_at)),
      };

      const counts: Record<string, number> = {};
      for (const [k, list] of Object.entries(reportSections)) {
        counts[k] = list.length;
      }

      res.json({
        current_role,
        actor,
        sections,
        reports: {
          generated_at: new Date().toISOString(),
          range: { start_date: startDate, end_date: endDate },
          revenue: approvedUsd > 0 ? { USD: approvedUsd } : {},
          counts,
          sections: reportSections,
          breakdown: computePlatformAnalyticsBreakdown(filteredCases),
        },
      });
      return;
    }

    if (view === 'visitors') {
      const days = Number(req.query.days || 30) || 30;
      const cutoff = Date.now() - days * 86400000;
      const sessions = store.visitorSessions.filter(
        (v) => new Date(v.last_seen_at).getTime() >= cutoff
      );
      const uniqueVisitors = new Set(sessions.map((s) => s.visitor_key)).size;
      const pageViews = sessions.reduce((acc, s) => acc + s.page_views, 0);
      const inquiries = sessions.filter((s) => s.inquiry_submitted).length;

      const fiveMinAgo = Date.now() - 5 * 60000;
      const online = sessions.filter((s) => new Date(s.last_seen_at).getTime() >= fiveMinAgo);

      const countryCounts: Record<string, number> = {};
      const pageCounts: Record<string, number> = {};
      for (const s of sessions) {
        const c = s.country_code || 'IQ';
        countryCounts[c] = (countryCounts[c] || 0) + 1;
        pageCounts[s.last_page || '/'] = (pageCounts[s.last_page || '/'] || 0) + s.page_views;
      }
      const topCountry =
        Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

      const traffic = Array.from({ length: 12 }, (_, idx) => {
        const labelMin = (11 - idx) * 5;
        const base = idx >= 9 ? online.length * 2 + 1 : Math.max(1, (idx % 4) + 1);
        return { bucket: `${labelMin}m`, requests: base };
      });

      res.json({
        current_role,
        actor,
        sections,
        analytics: {
          days,
          generated_at: new Date().toISOString(),
          summary: {
            sessions: sessions.length,
            unique_visitors: uniqueVisitors,
            page_views: pageViews,
            inquiries,
          },
          realtime: {
            visitors_online: online.length,
            requests_per_min: Math.max(1, online.length * 2),
            top_country: topCountry,
            traffic,
            top_pages: Object.entries(pageCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([page_path, views]) => ({ page_path, views })),
            countries: Object.entries(countryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([country_code, count]) => ({ country_code, count })),
            locations: online.map((o) => ({ country_code: o.country_code })),
          },
          sessions,
        },
      });
      return;
    }

    res.status(400).json({ error: 'Unknown platform operations view.' });
  });

  const PLATFORM_ACTION_PERMISSION_MAP: Record<string, PlatformPermission> = {
    payment_review: 'write_payments',
    payment_whatsapp_status: 'write_payments',
    case_note: 'write_cases',
    case_reply: 'write_cases',
    case_status: 'write_cases',
    case_assign: 'write_cases',
    case_toggle_monitor: 'write_cases',
    case_submission: 'write_cases',
    case_verification: 'write_cases',
    check_url: 'write_cases',
    watchlist_sweep: 'write_cases',
    inquiry_convert: 'write_cases',
    support_note: 'write_support',
    support_reply: 'write_support',
    support_status: 'write_support',
    request_review: 'write_requests',
    customer_status: 'write_roles',
    set_role: 'write_roles',
    suspend_role: 'write_roles',
    broadcast_notice: 'broadcast',
  };

  app.post('/api/platform/operations', async (req, res) => {
    const store = loadStore();
    const user = requireStaff(req, res, store);
    if (!user) return;

    const { action = '', id = '' } = req.body || {};
    const current_role = resolvePlatformRole(store, user);
    const requiredActionPerm = PLATFORM_ACTION_PERMISSION_MAP[String(action)];
    if (!requiredActionPerm) {
      res.status(400).json({ error: 'Unsupported platform operation action.' });
      return;
    }
    if (!hasPlatformPermission(current_role, requiredActionPerm)) {
      res.status(403).json({
        error: `Role "${current_role}" does not permit action "${action}".`,
      });
      return;
    }
    const now = new Date().toISOString();

    if (action === 'payment_review') {
      const payment = store.payments.find((p) => p.id === id);
      if (!payment) {
        res.status(404).json({ error: 'Payment not found.' });
        return;
      }
      const decision = req.body?.decision === 'approved' ? 'approved' : 'rejected';
      const note = String(req.body?.admin_note || '').trim();
      payment.status = decision;
      payment.admin_note = note || undefined;
      payment.reviewed_by = user.email;
      payment.reviewed_at = now;

      const invoice = store.invoices.find((i) => i.id === payment.invoice_id);
      if (invoice) {
        invoice.status = decision === 'approved' ? 'paid' : 'unpaid';
      }

      const orgName = getCustomerWorkspaceName(store, payment.customer_email);
      addAndPushNotification(store, {
        id: 'not-' + crypto.randomUUID().slice(0, 8),
        user_email: payment.customer_email,
        title: `Payment ${decision} for ${payment.invoice_number}`,
        body:
          note ||
          (decision === 'approved'
            ? `Your payment (${payment.reference}) was approved and your case is cleared for action.`
            : `Your payment (${payment.reference}) could not be confirmed. Please contact support.`),
        read: false,
        created_at: now,
      });
      pushCustomerEvent(payment.customer_email, { type: 'workspace:refresh' });
      recordAudit(store, user.email, `payment_review_${decision}`, 'payment', payment.id, orgName, {
        invoice_number: payment.invoice_number,
        note,
      });
      saveStore(store);
      res.json({ ok: true, payment });
      return;
    }

    if (action === 'payment_whatsapp_status') {
      const payment = store.payments.find((p) => p.id === id);
      if (!payment) {
        res.status(404).json({ error: 'Payment not found.' });
        return;
      }
      const status = req.body?.status === 'sent_confirmed' ? 'sent_confirmed' : 'opened';
      payment.whatsapp_status = status;
      recordAudit(
        store,
        user.email,
        `payment_whatsapp_${status}`,
        'payment',
        payment.id,
        getCustomerWorkspaceName(store, payment.customer_email),
        { invoice_number: payment.invoice_number }
      );
      saveStore(store);
      res.json({ ok: true, payment });
      return;
    }

    if (action === 'case_note' || action === 'case_reply' || action === 'case_status') {
      const target = store.cases.find((c) => c.id === id);
      if (!target) {
        res.status(404).json({ error: 'Case not found.' });
        return;
      }
      const orgName = getCustomerWorkspaceName(store, target.customer_email);
      const msg = String(req.body?.message || '').trim();
      if (action === 'case_note') {
        if (!msg) {
          res.status(400).json({ error: 'Internal note text is required.' });
          return;
        }
        target.activity.push({
          id: 'act-' + crypto.randomUUID().slice(0, 8),
          activity_type: 'internal_note',
          message: msg,
          visibility: 'staff',
          created_at: now,
        });
        recordAudit(store, user.email, 'case_internal_note', 'case', target.case_number, orgName);
      } else if (action === 'case_reply') {
        if (!msg) {
          res.status(400).json({ error: 'Reply text is required.' });
          return;
        }
        target.messages.push({
          id: 'msg-' + crypto.randomUUID().slice(0, 8),
          sender_role: 'staff',
          sender_email: user.email,
          message: msg,
          created_at: now,
        });
        addAndPushNotification(store, {
          id: 'not-' + crypto.randomUUID().slice(0, 8),
          user_email: target.customer_email,
          title: `New message on ${target.case_number}`,
          body: msg.slice(0, 140),
          read: false,
          created_at: now,
        });
        pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
        recordAudit(store, user.email, 'case_customer_reply', 'case', target.case_number, orgName);
      } else {
        const status = String(req.body?.status || 'reviewing') as CaseStatus;
        target.status = status;
        const summary = msg || `Central Admin updated case status to ${status.replaceAll('_', ' ')}.`;
        target.activity.push({
          id: 'act-' + crypto.randomUUID().slice(0, 8),
          activity_type: status,
          message: summary,
          visibility: 'customer',
          created_at: now,
        });
        addAndPushNotification(store, {
          id: 'not-' + crypto.randomUUID().slice(0, 8),
          user_email: target.customer_email,
          title: `Case ${target.case_number} updated`,
          body: summary,
          read: false,
          created_at: now,
        });
        pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
        recordAudit(store, user.email, 'case_status_updated', 'case', target.case_number, orgName, {
          status,
        });
      }
      target.updated_at = now;
      saveStore(store);
      if (action === 'case_reply' || action === 'case_status') {
        pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
      }
      res.json({ ok: true, case: target });
      return;
    }

    if (action === 'case_toggle_monitor') {
      const target = store.cases.find((c) => c.id === id);
      if (!target) {
        res.status(404).json({ error: 'Case not found.' });
        return;
      }
      const nextMonitor =
        typeof req.body?.enabled === 'boolean' ? req.body.enabled : !target.monitoring_enabled;
      target.monitoring_enabled = nextMonitor;
      if (nextMonitor) target.last_monitored_at = now;
      target.updated_at = now;
      target.activity.push({
        id: 'act-' + crypto.randomUUID().slice(0, 8),
        activity_type: 'watchlist_monitor',
        message: nextMonitor
          ? 'Automated URL watchlist monitoring enabled.'
          : 'Automated URL watchlist monitoring paused.',
        visibility: 'customer',
        created_at: now,
      });
      recordAudit(
        store,
        user.email,
        nextMonitor ? 'case_monitor_enabled' : 'case_monitor_paused',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email)
      );
      saveStore(store);
      pushCustomerEvent(target.customer_email, {
        type: 'case:updated',
        case: sanitizeCaseForCustomer(target),
      });
      res.json({ ok: true, case: target });
      return;
    }

    if (action === 'case_assign') {
      const target = store.cases.find((c) => c.id === id);
      if (!target) {
        res.status(404).json({ error: 'Case not found.' });
        return;
      }
      const assignee = String(req.body?.assignee || '').trim().toLowerCase();
      target.assigned_to = assignee || undefined;
      target.updated_at = now;
      target.activity.push({
        id: 'act-' + crypto.randomUUID().slice(0, 8),
        activity_type: 'analyst_assigned',
        message: assignee ? `Assigned to analyst ${assignee}.` : 'Case unassigned in Central Admin.',
        visibility: 'staff',
        created_at: now,
      });
      recordAudit(
        store,
        user.email,
        'case_assigned',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email),
        { assigned_to: assignee || 'unassigned' }
      );
      saveStore(store);
      pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
      res.json({ ok: true, case: target });
      return;
    }

    if (action === 'check_url') {
      const target = store.cases.find((c) => c.id === id);
      if (!target) {
        res.status(404).json({ error: 'Case not found.' });
        return;
      }
      const checkedUrl = String(req.body?.checked_url || target.source_url || '').trim();
      const probe = await checkUrlAvailabilitySafe(checkedUrl);
      if (!probe.ok) {
        res.status(400).json({ error: probe.diagnostic_note });
        return;
      }
      const verification: VerificationCheckItem = {
        id: 'ver-' + crypto.randomUUID().slice(0, 8),
        result: probe.result,
        checked_url: checkedUrl,
        notes: probe.diagnostic_note,
        checked_at: now,
      };
      target.verifications.push(verification);
      target.updated_at = now;
      if (probe.result === 'confirmed_removed') {
        addAndPushNotification(store, {
          id: 'not-' + crypto.randomUUID().slice(0, 8),
          user_email: target.customer_email,
          title: `Live check confirmed removal on ${target.case_number}`,
          body: probe.diagnostic_note,
          read: false,
          created_at: now,
        });
        pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
      }
      recordAudit(
        store,
        user.email,
        'removal_verification_checked',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email),
        { result: probe.result, http_status: probe.http_status, checked_url: checkedUrl }
      );
      saveStore(store);
      pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
      if (probe.result !== 'confirmed_removed') {
        pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
      }
      res.json({
        ok: true,
        verification,
        http_status: probe.http_status,
        diagnostic_note: probe.diagnostic_note,
        case: target,
      });
      return;
    }

    if (action === 'watchlist_sweep') {
      const targetIds = Array.isArray(req.body?.ids)
        ? req.body.ids.filter((x: unknown): x is string => typeof x === 'string')
        : undefined;
      const sweep = await executeWatchlistSweep(store, user.email, targetIds);
      res.json({
        ok: true,
        ...sweep,
      });
      return;
    }

    if (action === 'support_note' || action === 'support_reply' || action === 'support_status') {
      const ticket = store.supportTickets.find((t) => t.id === id);
      if (!ticket) {
        res.status(404).json({ error: 'Support ticket not found.' });
        return;
      }
      const orgName = getCustomerWorkspaceName(store, ticket.customer_email);
      const msg = String(req.body?.message || '').trim();
      if (action === 'support_note') {
        if (!msg) {
          res.status(400).json({ error: 'Internal note text is required.' });
          return;
        }
        ticket.messages.push({
          id: 'smsg-' + crypto.randomUUID().slice(0, 8),
          sender_role: 'staff',
          sender_email: user.email,
          visibility: 'internal',
          message: msg,
          created_at: now,
        });
        recordAudit(store, user.email, 'support_internal_note', 'support', ticket.ticket_number, orgName);
      } else if (action === 'support_reply') {
        if (!msg) {
          res.status(400).json({ error: 'Reply text is required.' });
          return;
        }
        ticket.messages.push({
          id: 'smsg-' + crypto.randomUUID().slice(0, 8),
          sender_role: 'staff',
          sender_email: user.email,
          visibility: 'customer',
          message: msg,
          created_at: now,
        });
        ticket.status = 'waiting_customer';
        addAndPushNotification(store, {
          id: 'not-' + crypto.randomUUID().slice(0, 8),
          user_email: ticket.customer_email,
          title: `Support reply on ${ticket.ticket_number}`,
          body: msg.slice(0, 140),
          read: false,
          created_at: now,
        });
        pushCustomerEvent(ticket.customer_email, { type: 'workspace:refresh' });
        recordAudit(store, user.email, 'support_reply', 'support', ticket.ticket_number, orgName);
      } else {
        const status = String(req.body?.status || 'in_progress') as SupportTicket['status'];
        ticket.status = status;
        recordAudit(store, user.email, 'support_status_updated', 'support', ticket.ticket_number, orgName, {
          status,
        });
      }
      ticket.updated_at = now;
      saveStore(store);
      res.json({ ok: true, ticket });
      return;
    }

    if (action === 'request_review') {
      const reqItem = store.dataRequests.find((r) => r.id === id);
      if (!reqItem) {
        res.status(404).json({ error: 'Privacy request not found.' });
        return;
      }
      const status = String(req.body?.status || 'in_review') as DataRequestRecord['status'];
      const note = String(req.body?.admin_note || '').trim();
      reqItem.status = status;
      reqItem.admin_note = note || undefined;
      const orgName = getCustomerWorkspaceName(store, reqItem.user_email);
      addAndPushNotification(store, {
        id: 'not-' + crypto.randomUUID().slice(0, 8),
        user_email: reqItem.user_email,
        title: `Privacy ${reqItem.type} request updated`,
        body: note || `Status updated to ${status.replaceAll('_', ' ')}.`,
        read: false,
        created_at: now,
      });
      pushCustomerEvent(reqItem.user_email, { type: 'workspace:refresh' });
      recordAudit(store, user.email, 'privacy_request_reviewed', 'data_request', reqItem.id, orgName, {
        status,
        note,
      });
      saveStore(store);
      res.json({ ok: true, request: reqItem });
      return;
    }

    if (action === 'customer_status') {
      const email = String(req.body?.organization_id || '').toLowerCase();
      const targetUser = store.users[email];
      if (!targetUser) {
        res.status(404).json({ error: 'Customer account not found.' });
        return;
      }
      const nextStatus = req.body?.status === 'suspended' ? 'suspended' : 'active';
      targetUser.access_status = nextStatus;
      recordAudit(
        store,
        user.email,
        `customer_access_${nextStatus}`,
        'customer',
        email,
        getCustomerWorkspaceName(store, email),
        { status: nextStatus }
      );
      saveStore(store);
      res.json({ ok: true, access_status: nextStatus });
      return;
    }

    if (action === 'set_role') {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const role = String(req.body?.role || 'operations_admin') as PlatformRoleName;
      if (!validateEmail(email)) {
        res.status(400).json({ error: 'Valid administrator email is required.' });
        return;
      }
      const existing = store.platformRoles.find((r) => r.email.toLowerCase() === email);
      if (existing) {
        existing.role = role;
        existing.status = 'active';
        existing.granted_by = user.email;
      } else {
        store.platformRoles.unshift({
          id: 'pr-' + crypto.randomUUID().slice(0, 8),
          email,
          role,
          status: 'active',
          granted_by: user.email,
          created_at: now,
        });
      }
      recordAudit(store, user.email, 'platform_role_granted', 'platform_role', email, 'Platform-wide', {
        role,
      });
      saveStore(store);
      res.json({ ok: true });
      return;
    }

    if (action === 'suspend_role') {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const existing = store.platformRoles.find((r) => r.email.toLowerCase() === email);
      if (!existing) {
        res.status(404).json({ error: 'Platform role record not found.' });
        return;
      }
      existing.status = existing.status === 'suspended' ? 'active' : 'suspended';
      recordAudit(
        store,
        user.email,
        `platform_role_${existing.status}`,
        'platform_role',
        email,
        'Platform-wide'
      );
      saveStore(store);
      res.json({ ok: true });
      return;
    }

    if (action === 'case_submission') {
      const target = store.cases.find((c) => c.id === id);
      if (!target) {
        res.status(404).json({ error: 'Case not found.' });
        return;
      }
      const {
        platform = target.platform,
        submission_channel = 'platform_portal',
        status = 'submitted',
        external_reference = '',
        response_summary = '',
      } = req.body || {};
      target.submissions.push({
        id: 'sub-' + crypto.randomUUID().slice(0, 8),
        platform: String(platform).trim() || target.platform,
        submission_channel,
        status,
        external_reference: String(external_reference).trim() || undefined,
        response_summary: String(response_summary).trim() || undefined,
        submitted_at: now,
      });
      target.updated_at = now;
      recordAudit(
        store,
        user.email,
        'platform_submission_logged',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email),
        { platform, external_reference }
      );
      saveStore(store);
      pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
      pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
      res.json({ ok: true, case: target });
      return;
    }

    if (action === 'case_verification') {
      const target = store.cases.find((c) => c.id === id);
      if (!target) {
        res.status(404).json({ error: 'Case not found.' });
        return;
      }
      const { result = 'confirmed_removed', checked_url = target.source_url, notes = '' } =
        req.body || {};
      target.verifications.push({
        id: 'ver-' + crypto.randomUUID().slice(0, 8),
        result,
        checked_url: String(checked_url).trim() || target.source_url,
        notes: String(notes).trim() || undefined,
        checked_at: now,
      });
      target.updated_at = now;
      recordAudit(
        store,
        user.email,
        'removal_verification_logged',
        'case',
        target.case_number,
        getCustomerWorkspaceName(store, target.customer_email),
        { result, checked_url }
      );
      saveStore(store);
      pushCustomerEvent(target.customer_email, { type: 'case:updated', case: sanitizeCaseForCustomer(target) });
      pushCustomerEvent(target.customer_email, { type: 'workspace:refresh' });
      res.json({ ok: true, case: target });
      return;
    }

    if (action === 'broadcast_notice') {
      const title = String(req.body?.title || '').trim();
      const body = String(req.body?.body || '').trim();
      const target = String(req.body?.target || 'all_customers').trim().toLowerCase();
      if (!title || !body) {
        res.status(400).json({ error: 'Notice title and message are required.' });
        return;
      }
      const recipients =
        target === 'all_customers'
          ? Object.values(store.users)
              .filter((u) => u.role === 'customer')
              .map((u) => u.email)
          : [target];
      for (const recipient of recipients) {
        addAndPushNotification(store, {
          id: 'not-' + crypto.randomUUID().slice(0, 8),
          user_email: recipient,
          title,
          body,
          read: false,
          created_at: now,
        });
        pushCustomerEvent(recipient, { type: 'workspace:refresh' });
      }
      recordAudit(
        store,
        user.email,
        'customer_notice_broadcast',
        'notification',
        target,
        target === 'all_customers'
          ? 'All Customer Workspaces'
          : getCustomerWorkspaceName(store, target),
        { title, recipient_count: recipients.length }
      );
      saveStore(store);
      res.json({ ok: true, recipient_count: recipients.length });
      return;
    }

    if (action === 'inquiry_convert') {
      const inq = store.inquiries.find((i) => i.id === id);
      if (!inq) {
        res.status(404).json({ error: 'Inquiry not found.' });
        return;
      }
      if (inq.status === 'converted' && inq.converted_case_id) {
        const existing = store.cases.find((c) => c.id === inq.converted_case_id);
        res.json({ ok: true, inquiry: inq, case: existing });
        return;
      }
      const created = convertInquiryToCaseRecord(store, inq, user.email);
      saveStore(store);
      res.json({ ok: true, inquiry: inq, case: created });
      return;
    }

    res.status(400).json({ error: 'Unsupported platform operation action.' });
  });

  if (IS_PRODUCTION) {
    const distDir = path.join(APP_ROOT, 'dist');
    const indexHtmlPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.warn(
        `[Full Remove] Production bundle not found at ${indexHtmlPath}. Run "npm run build" before starting.`
      );
    }
    app.use(
      express.static(distDir, {
        maxAge: '7d',
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.use('/api/*', (_req, res) => {
      res.status(404).json({ error: 'API endpoint not found.' });
    });
    app.get('*', (_req, res) => {
      if (!fs.existsSync(indexHtmlPath)) {
        res
          .status(503)
          .type('text/plain')
          .send('Application build missing. Run "npm run build" and restart the Node.js app.');
        return;
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexHtmlPath);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const rawPort = process.env.PORT?.trim();
  const listenTarget: string | number =
    rawPort && Number.isNaN(Number(rawPort)) ? rawPort : Number(rawPort || 3000);
  const listenHost = process.env.HOST?.trim() || '0.0.0.0';
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  activityWss = wss;
  const customerSocketServer = new WebSocketServer({ noServer: true });
  customerWss = customerSocketServer;

  function parseRawCookieHeader(cookieHeader: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const part of cookieHeader.split(';')) {
      const idx = part.indexOf('=');
      if (idx > -1) {
        out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
      }
    }
    return out;
  }

  function broadcastPresence(): void {
    broadcastPlatformActivity({
      type: 'presence:update',
      connected_operators: wss.clients.size,
    });
  }

  httpServer.on('upgrade', (req, socket, head) => {
    const host = req.headers.host || 'localhost:3000';
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(req.url || '/', `http://${host}`);
    } catch {
      socket.destroy();
      return;
    }

    if (
      parsedUrl.pathname !== '/ws/platform-activity' &&
      parsedUrl.pathname !== '/ws/customer-notifications'
    ) {
      return;
    }

    const store = loadStore();
    const cookies = parseRawCookieHeader(req.headers.cookie || '');
    const queryToken = parsedUrl.searchParams.get('token')?.trim() || '';
    const authHeader = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    const token = queryToken || authHeader || cookies.fr_session || '';
    const email = token ? store.sessions[token] : '';
    const user = email ? store.users[email] : null;

    if (parsedUrl.pathname === '/ws/customer-notifications') {
      if (!user || user.access_status === 'suspended') {
        socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      customerSocketServer.handleUpgrade(req, socket, head, (ws) => {
        customerSocketServer.emit('connection', ws, req, user);
      });
      return;
    }

    if (!user || !['owner', 'admin', 'analyst', 'viewer'].includes(user.role)) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, user);
    });
  });

  wss.on('connection', (ws: WebSocket, _req: http.IncomingMessage, user: UserAccount) => {
    const store = loadStore();
    ws.send(
      JSON.stringify({
        type: 'activity:init',
        events: store.auditLog.slice(0, 100),
        connected_operators: wss.clients.size,
        operator_email: user.email,
      })
    );
    broadcastPresence();

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', ts: new Date().toISOString() }));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      broadcastPresence();
    });
  });

  customerSocketServer.on(
    'connection',
    (ws: WebSocket, _req: http.IncomingMessage, user: UserAccount) => {
      customerSocketEmails.set(ws, user.email.toLowerCase());
      ws.send(
        JSON.stringify({
          type: 'customer_ws:ready',
          email: user.email,
        })
      );
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(String(raw));
          if (msg?.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', ts: new Date().toISOString() }));
          }
        } catch {
          // Ignore malformed messages
        }
      });
      ws.on('close', () => {
        customerSocketEmails.delete(ws);
      });
    }
  );

  // Keep WebSocket connections alive through Hostinger Nginx/LiteSpeed reverse proxies
  const wsHeartbeatTimer = setInterval(() => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    }
    for (const client of customerSocketServer.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    }
  }, 25_000);
  wsHeartbeatTimer.unref();

  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down Full Remove server...`);
    clearInterval(wsHeartbeatTimer);
    httpServer.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  if (typeof listenTarget === 'string') {
    httpServer.listen(listenTarget, () => {
      console.log(`Full Remove server running on socket ${listenTarget} (${IS_PRODUCTION ? 'production' : 'development'})`);
    });
  } else {
    httpServer.listen(listenTarget, listenHost, () => {
      console.log(`Full Remove server running on http://${listenHost}:${listenTarget} (${IS_PRODUCTION ? 'production' : 'development'})`);
    });
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
