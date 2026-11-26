import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Download,
  Pause,
  Play,
  Radio,
  Search,
  Users,
} from 'lucide-react';
import { PORTAL_TRANSLATIONS, translateActivitySummary } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import { getAuthToken } from '../lib/authClient';
import {
  buildCsv,
  classifyAuditCategory,
  filterActivityEvents,
  formatActivityActionLabel,
  mergeActivityEventsIdempotent,
  type ActivityCategory,
  type AuditEventRecord,
} from '../lib/caseLogic';

export type WsConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

interface RealTimeActivityLogProps {
  initialEvents?: AuditEventRecord[];
  mode?: 'compact' | 'full';
  onOpenFullView?: () => void;
  onLiveEvent?: (event: AuditEventRecord) => void;
  lang?: LangCode;
}

const CATEGORY_IDS: (ActivityCategory | 'all')[] = [
  'all',
  'case_workflow',
  'payment_billing',
  'security_role',
  'support_privacy',
  'system_modification',
];

const CATEGORY_TEXT_CLASS: Record<ActivityCategory, string> = {
  case_workflow: 'text-[#0057B8]',
  payment_billing: 'text-emerald-700',
  security_role: 'text-amber-700',
  support_privacy: 'text-[#00758A]',
  system_modification: 'text-[#041E4A]',
};

function formatRelativeTime(iso: string, lang: LangCode): string {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (lang === 'ar') {
    if (diffSec < 10) return 'الآن';
    if (diffSec < 60) return `منذ ${diffSec}ث`;
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin}د`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `منذ ${diffHr}س`;
    return iso.slice(0, 10);
  }
  if (lang === 'ku') {
    if (diffSec < 10) return 'ئێستا';
    if (diffSec < 60) return `${diffSec}چ پێش`;
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin}خ پێش`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}ک پێش`;
    return iso.slice(0, 10);
  }
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return iso.slice(0, 10);
}

export function RealTimeActivityLog({
  initialEvents = [],
  mode = 'full',
  onOpenFullView,
  onLiveEvent,
  lang = 'en',
}: RealTimeActivityLogProps) {
  const [events, setEvents] = useState<AuditEventRecord[]>(() =>
    mergeActivityEventsIdempotent([], initialEvents, 200)
  );
  const [bufferedEvents, setBufferedEvents] = useState<AuditEventRecord[]>([]);
  const [paused, setPaused] = useState(false);
  const [connectionState, setConnectionState] = useState<WsConnectionState>('connecting');
  const [connectedOperators, setConnectedOperators] = useState<number>(1);
  const [category, setCategory] = useState<ActivityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<Record<string, boolean>>({});

  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onLiveEventRef = useRef(onLiveEvent);
  onLiveEventRef.current = onLiveEvent;

  const t = PORTAL_TRANSLATIONS[lang];
  const logCopy = t.admin.activityLog;

  useEffect(() => {
    if (initialEvents.length > 0) {
      setEvents((prev) => mergeActivityEventsIdempotent(prev, initialEvents, 200));
    }
  }, [initialEvents]);

  useEffect(() => {
    let isUnmounted = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let attempt = 0;

    const connect = () => {
      if (isUnmounted) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const token = getAuthToken();
      const wsUrl = `${proto}//${window.location.host}/ws/platform-activity${
        token ? `?token=${encodeURIComponent(token)}` : ''
      }`;

      setConnectionState(attempt === 0 ? 'connecting' : 'reconnecting');

      try {
        ws = new WebSocket(wsUrl);
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        if (isUnmounted) return;
        attempt = 0;
        setConnectionState('connected');
        heartbeatTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (msgEvent) => {
        if (isUnmounted) return;
        try {
          const payload = JSON.parse(String(msgEvent.data));
          if (payload.type === 'activity:init' && Array.isArray(payload.events)) {
            setEvents((prev) => mergeActivityEventsIdempotent(prev, payload.events, 200));
            if (typeof payload.connected_operators === 'number') {
              setConnectedOperators(Math.max(1, payload.connected_operators));
            }
          } else if (payload.type === 'activity:created' && payload.event) {
            const incoming = payload.event as AuditEventRecord;
            if (onLiveEventRef.current) {
              onLiveEventRef.current(incoming);
            }
            if (pausedRef.current) {
              setBufferedEvents((prev) => mergeActivityEventsIdempotent(prev, incoming, 100));
            } else {
              setEvents((prev) => mergeActivityEventsIdempotent(prev, incoming, 200));
              setRecentIds((prev) => ({ ...prev, [incoming.id]: true }));
              setTimeout(() => {
                if (!isUnmounted) {
                  setRecentIds((prev) => {
                    const next = { ...prev };
                    delete next[incoming.id];
                    return next;
                  });
                }
              }, 3500);
            }
          } else if (
            payload.type === 'presence:update' &&
            typeof payload.connected_operators === 'number'
          ) {
            setConnectedOperators(Math.max(1, payload.connected_operators));
          }
        } catch {
          // Ignore invalid JSON payloads
        }
      };

      ws.onerror = () => {};

      ws.onclose = () => {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        if (!isUnmounted) {
          scheduleReconnect();
        }
      };
    };

    const scheduleReconnect = () => {
      if (isUnmounted) return;
      attempt += 1;
      setConnectionState('reconnecting');
      const delayMs = Math.min(10000, 1000 * Math.pow(2, Math.min(attempt - 1, 3)));
      reconnectTimer = setTimeout(connect, delayMs);
    };

    connect();

    return () => {
      isUnmounted = true;
      setConnectionState('disconnected');
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  const togglePause = () => {
    if (paused) {
      if (bufferedEvents.length > 0) {
        setEvents((prev) => mergeActivityEventsIdempotent(prev, bufferedEvents, 200));
        setBufferedEvents([]);
      }
      setPaused(false);
    } else {
      setPaused(true);
    }
  };

  const filteredEvents = useMemo(
    () => filterActivityEvents(events, { query: searchQuery, category }),
    [events, searchQuery, category]
  );

  const visibleEvents = mode === 'compact' ? filteredEvents.slice(0, 10) : filteredEvents;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    for (const ev of events) {
      const cat = classifyAuditCategory(ev.action, ev.entity_type);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [events]);

  const exportCsv = () => {
    const rows = filteredEvents.map((ev) => ({
      id: ev.id,
      created_at: ev.created_at,
      category: classifyAuditCategory(ev.action, ev.entity_type),
      actor: ev.actor,
      action: ev.action,
      entity_type: ev.entity_type,
      entity_id: ev.entity_id,
      organization_name: ev.organization_name,
      details: JSON.stringify(ev.details || {}),
    }));
    if (rows.length === 0) return;
    const csv = buildCsv(Object.keys(rows[0]), rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fullremove-realtime-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusText =
    connectionState === 'connected'
      ? logCopy.connected
      : connectionState === 'reconnecting'
        ? logCopy.reconnecting
        : connectionState === 'connecting'
          ? logCopy.connecting
          : logCopy.disconnected;

  return (
    <section
      data-testid="realtime-activity-log"
      aria-label={logCopy.title}
      className="rounded-2xl border border-[#DCE7F2] bg-white shadow-xs overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFF5FA] px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0057B8]" />
            <h2 className="font-display text-base font-bold text-[#041E4A]">{logCopy.title}</h2>
          </div>

          <div
            data-testid="ws-connection-status"
            data-state={connectionState}
            className="flex items-center gap-1.5 text-xs font-medium"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connectionState === 'connected'
                  ? 'bg-emerald-600'
                  : connectionState === 'reconnecting' || connectionState === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
              }`}
            />
            <span
              className={
                connectionState === 'connected'
                  ? 'text-emerald-700'
                  : connectionState === 'reconnecting' || connectionState === 'connecting'
                    ? 'text-amber-700'
                    : 'text-rose-700'
              }
            >
              {statusText}
            </span>
          </div>

          <span className="hidden sm:inline text-slate-200">|</span>

          <div className="flex items-center gap-1.5 text-xs tabular-nums text-slate-500">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>{logCopy.operatorsOnline(connectedOperators)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="activity-pause-toggle"
            onClick={togglePause}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              paused
                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border-[#DCE7F2] bg-[#F7FAFC] text-[#041E4A] hover:border-[#00869E]/45 hover:bg-[#EFF5FA]'
            }`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span>
              {paused
                ? bufferedEvents.length > 0
                  ? logCopy.resumeQueued(bufferedEvents.length)
                  : logCopy.resume
                : logCopy.pause}
            </span>
          </button>

          {mode === 'full' && (
            <button
              type="button"
              onClick={exportCsv}
              disabled={filteredEvents.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-medium text-[#041E4A] hover:border-[#00869E]/45 hover:bg-[#EFF5FA] disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.common.exportCsv}</span>
            </button>
          )}

          {mode === 'compact' && onOpenFullView && (
            <button
              type="button"
              onClick={onOpenFullView}
              className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer"
            >
              <span>{logCopy.fullLog}</span>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFF5FA] bg-[#F7FAFC] px-5 py-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label={logCopy.title}
        >
          {CATEGORY_IDS.map((catId) => {
            const active = category === catId;
            const count = categoryCounts[catId] || 0;
            return (
              <button
                key={catId}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`activity-cat-${catId}`}
                onClick={() => setCategory(catId)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'border border-[#0057B8]/30 bg-white text-[#0057B8] font-semibold shadow-2xs'
                    : 'border border-transparent text-slate-600 hover:bg-white/75 hover:text-[#041E4A]'
                }`}
              >
                <span>{t.activityCategories[catId]}</span>
                <span className="ms-1.5 font-mono text-[11px] tabular-nums text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            data-testid="activity-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={logCopy.searchPlaceholder}
            className="w-full rounded-lg border border-[#DCE7F2] bg-white py-1.5 ps-9 pe-3 text-xs text-[#041E4A] placeholder:text-slate-400 outline-none focus:border-[#0057B8]"
          />
        </div>
      </div>

      {/* Stream Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead>
            <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
              <th className="w-8 px-3 py-3" aria-label={t.common.search} />
              <th className="px-4 py-3 text-start">{logCopy.cols.time}</th>
              <th className="px-4 py-3 text-start">{logCopy.cols.area}</th>
              <th className="px-4 py-3 text-start">{logCopy.cols.summary}</th>
              <th className="px-4 py-3 text-start">{logCopy.cols.by}</th>
              <th className="px-4 py-3 text-start">{logCopy.cols.item}</th>
              <th className="px-4 py-3 text-start">{logCopy.cols.client}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFF5FA]">
            {visibleEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-slate-400" />
                    <span>{logCopy.emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleEvents.map((ev) => {
                const cat = classifyAuditCategory(ev.action, ev.entity_type);
                const tone = {
                  label: t.activityShortTone[cat],
                  textClass: CATEGORY_TEXT_CLASS[cat],
                };
                const isExpanded = expandedId === ev.id;
                const isFresh = Boolean(recentIds[ev.id]);

                return (
                  <FragmentRow
                    key={ev.id}
                    ev={ev}
                    tone={tone}
                    lang={lang}
                    isExpanded={isExpanded}
                    isFresh={isFresh}
                    onToggle={() => setExpandedId(isExpanded ? null : ev.id)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface FragmentRowProps {
  ev: AuditEventRecord;
  tone: { label: string; textClass: string };
  lang: LangCode;
  isExpanded: boolean;
  isFresh: boolean;
  onToggle: () => void;
}

function summarizeAuditDetails(details?: Record<string, unknown>): string {
  if (!details) return '';
  const entries = Object.entries(details).filter(
    ([, val]) => val !== undefined && val !== null && val !== ''
  );
  if (entries.length === 0) return '';
  return entries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join(' · ');
}

function FragmentRow({ ev, tone, lang, isExpanded, isFresh, onToggle }: FragmentRowProps) {
  const detailSummary = summarizeAuditDetails(ev.details);
  const detailsCopy = PORTAL_TRANSLATIONS[lang].admin.activityLog.details;
  const fallbackSummary = formatActivityActionLabel(ev.action);
  const summaryLabel = translateActivitySummary(ev.action, fallbackSummary, lang);

  return (
    <>
      <tr
        data-testid={`activity-row-${ev.id}`}
        data-action={ev.action}
        onClick={onToggle}
        className={`transition-colors cursor-pointer ${
          isFresh ? 'bg-[#EFF7FC]' : 'hover:bg-[#F7FAFC]'
        }`}
      >
        <td className="px-3 py-3 text-slate-400">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-[#0057B8]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          )}
        </td>
        <td
          className="px-4 py-3 font-mono text-[11px] tabular-nums text-slate-500 whitespace-nowrap"
          title={ev.created_at}
        >
          <span dir="ltr">{ev.created_at.slice(11, 19)}</span>{' '}
          <span className="font-sans text-slate-400">({formatRelativeTime(ev.created_at, lang)})</span>
        </td>
        <td className={`px-4 py-3 text-xs font-semibold whitespace-nowrap ${tone.textClass}`}>
          {tone.label}
        </td>
        <td className="px-4 py-3 max-w-[260px]">
          <div className="font-medium text-[#041E4A] truncate">{summaryLabel}</div>
          <div
            className="font-mono text-[10px] text-slate-500 truncate"
            dir="ltr"
            title={detailSummary || ev.action}
          >
            {detailSummary || ev.action}
          </div>
        </td>
        <td
          className="px-4 py-3 font-mono text-[11px] text-slate-700 max-w-[180px] truncate"
          dir="ltr"
          title={ev.actor}
        >
          {ev.actor}
        </td>
        <td
          className="px-4 py-3 font-mono text-[11px] text-slate-600 max-w-[170px] truncate"
          dir="ltr"
          title={`${ev.entity_type}:${ev.entity_id}`}
        >
          {ev.entity_type}:{ev.entity_id}
        </td>
        <td
          className="px-4 py-3 text-slate-700 max-w-[180px] truncate"
          title={ev.organization_name || ''}
        >
          {ev.organization_name || '—'}
        </td>
      </tr>
      {isExpanded && (
        <tr data-testid={`activity-detail-${ev.id}`} className="bg-[#F7FAFC]">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-xs text-slate-700 pb-3 border-b border-[#DCE7F2]">
              <div>
                <div className="text-[11px] font-medium text-slate-500">{detailsCopy.eventId}</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#041E4A] break-all" dir="ltr">
                  {ev.id}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{detailsCopy.timestamp}</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#041E4A] tabular-nums" dir="ltr">
                  {ev.created_at}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{detailsCopy.actor}</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#041E4A] break-all" dir="ltr">
                  {ev.actor}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{detailsCopy.target}</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#0057B8] break-all" dir="ltr">
                  {ev.entity_type}:{ev.entity_id}
                </div>
              </div>
            </div>
            <pre
              dir="ltr"
              className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-700 text-start"
            >
              {JSON.stringify(ev.details || {}, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
