import { jsPDF } from 'jspdf';
import {
  formatTimelineTimestampUtc,
  type CaseReportDocument,
  type SingleCaseCertificateData,
} from './caseLogic';

export function generateCaseReportPdfBlob(docData: CaseReportDocument): Blob {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - 18) {
      pdf.addPage();
      y = 16;
    }
  };

  const writeWrapped = (
    text: string,
    x: number,
    maxWidth: number,
    lineHeight: number,
    fontSize: number,
    style: 'normal' | 'bold' = 'normal',
    color: [number, number, number] = [30, 41, 59]
  ) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text || '', maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight + 1);
      pdf.text(line, x, y);
      y += lineHeight;
    }
  };

  // Top Banner
  pdf.setFillColor(6, 13, 23);
  pdf.rect(0, 0, pageWidth, 34, 'F');
  pdf.setFillColor(56, 189, 248);
  pdf.rect(0, 34, pageWidth, 1.2, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('FULL REMOVE — CASE HISTORY & STATUS REPORT', margin, 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Personal Records Archive · Generated ${docData.generatedAtUtcLabel}`,
    margin,
    21
  );
  pdf.text(
    `Account: ${docData.accountName}${docData.accountEmail ? ` (${docData.accountEmail})` : ''}`,
    margin,
    27
  );

  y = 43;

  // Summary Metrics Strip
  pdf.setFillColor(245, 247, 250);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

  const kpis = [
    { label: 'TOTAL CASES', value: String(docData.summary.totalCases) },
    { label: 'ACTIVE CASES', value: String(docData.summary.activeCases) },
    { label: 'RESOLVED', value: `${docData.summary.resolvedCases} (${docData.summary.completionRatePercent}%)` },
    { label: 'AVG TURNAROUND', value: docData.summary.averageTurnaroundLabel },
  ];
  const colW = contentWidth / kpis.length;
  kpis.forEach((kpi, idx) => {
    const cx = margin + idx * colW + 4;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(kpi.label, cx, y + 6.5);
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text(kpi.value, cx, y + 14.5);
  });

  y += 25;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    `Escalation threshold configuration: High Priority > ${docData.thresholdSpec.highPriorityHours}h · Urgent > ${docData.thresholdSpec.urgentHours}h`,
    margin,
    y
  );
  y += 8;

  // Status Matrix Overview
  writeWrapped(
    'CASE STATUS OVERVIEW',
    margin,
    contentWidth,
    5,
    10,
    'bold',
    [15, 23, 42]
  );
  y += 1.5;

  if (docData.rows.length === 0) {
    writeWrapped(
      'No case records matched the current export filter.',
      margin,
      contentWidth,
      5,
      9,
      'normal',
      [100, 116, 139]
    );
  } else {
    // Table Header
    ensureSpace(10);
    pdf.setFillColor(15, 23, 42);
    pdf.rect(margin, y, contentWidth, 7, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(248, 250, 252);
    pdf.text('CASE #', margin + 2, y + 4.7);
    pdf.text('PLATFORM', margin + 30, y + 4.7);
    pdf.text('PHASE', margin + 64, y + 4.7);
    pdf.text('PRIORITY', margin + 102, y + 4.7);
    pdf.text('STATUS', margin + 130, y + 4.7);
    pdf.text('SLA', margin + 158, y + 4.7);
    y += 7;

    docData.rows.forEach((row, index) => {
      ensureSpace(8);
      if (index % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y, contentWidth, 7, 'F');
      }
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, y + 7, margin + contentWidth, y + 7);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.8);
      pdf.setTextColor(37, 99, 235);
      pdf.text(row.caseNumber.slice(0, 16), margin + 2, y + 4.7);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      pdf.text(row.platform.slice(0, 19), margin + 30, y + 4.7);
      pdf.text(`${row.progressionPhase} (${row.progressPercent}%)`.slice(0, 24), margin + 64, y + 4.7);

      if (row.priorityTier === 'urgent') {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(190, 18, 60);
      } else if (row.priorityTier === 'high_priority') {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(180, 83, 9);
      } else {
        pdf.setTextColor(71, 85, 105);
      }
      pdf.text(row.priorityLabel, margin + 102, y + 4.7);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      pdf.text(row.statusLabel.toUpperCase().slice(0, 16), margin + 130, y + 4.7);
      pdf.text(row.slaLabel.slice(0, 16), margin + 158, y + 4.7);
      y += 7;
    });
  }

  // Detailed Case Dossiers + Chronological Histories
  for (const row of docData.rows) {
    y += 8;
    ensureSpace(32);

    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(margin, y, contentWidth, 12, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${row.caseNumber} — ${row.platform} (${row.statusLabel.toUpperCase()})`, margin + 3, y + 5.2);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text(
      `Phase: ${row.progressionPhase} (${row.progressPercent}%)  ·  Priority: ${row.priorityLabel}  ·  Submitted: ${row.submittedAtUtc}`,
      margin + 3,
      y + 10
    );
    y += 16;

    writeWrapped(row.title, margin, contentWidth, 5, 10, 'bold', [15, 23, 42]);
    writeWrapped(`Reported URL: ${row.sourceUrl}`, margin, contentWidth, 4.2, 8.2, 'normal', [37, 99, 235]);
    if (row.description) {
      y += 1;
      writeWrapped(row.description, margin, contentWidth, 4.4, 8.5, 'normal', [51, 65, 85]);
    }

    if (row.evidenceSummary.length > 0) {
      y += 2;
      writeWrapped(
        `Evidence Vault (${row.evidenceSummary.length}):`,
        margin,
        contentWidth,
        4.4,
        8.3,
        'bold',
        [15, 23, 42]
      );
      for (const item of row.evidenceSummary) {
        writeWrapped(`• ${item}`, margin + 3, contentWidth - 3, 4, 8, 'normal', [51, 65, 85]);
      }
    }

    if (row.submissionsSummary.length > 0) {
      y += 2;
      writeWrapped(
        `Platform Submissions (${row.submissionsSummary.length}):`,
        margin,
        contentWidth,
        4.4,
        8.3,
        'bold',
        [15, 23, 42]
      );
      for (const item of row.submissionsSummary) {
        writeWrapped(`• ${item}`, margin + 3, contentWidth - 3, 4, 8, 'normal', [51, 65, 85]);
      }
    }

    if (row.verificationsSummary.length > 0) {
      y += 2;
      writeWrapped(
        `Verification Checks (${row.verificationsSummary.length}):`,
        margin,
        contentWidth,
        4.4,
        8.3,
        'bold',
        [15, 23, 42]
      );
      for (const item of row.verificationsSummary) {
        writeWrapped(`• ${item}`, margin + 3, contentWidth - 3, 4, 8, 'normal', [51, 65, 85]);
      }
    }

    y += 2;
    writeWrapped(
      `Chronological Activity Log (${row.timeline.length} events):`,
      margin,
      contentWidth,
      4.4,
      8.3,
      'bold',
      [15, 23, 42]
    );
    if (row.timeline.length === 0) {
      writeWrapped('• No recorded events yet.', margin + 3, contentWidth - 3, 4, 8, 'normal', [100, 116, 139]);
    } else {
      for (const ev of row.timeline) {
        const lineText = `${formatTimelineTimestampUtc(ev.timestamp)}  |  ${ev.label}: ${ev.detail}${
          ev.meta ? ` [${ev.meta}]` : ''
        }`;
        writeWrapped(lineText, margin + 3, contentWidth - 3, 4, 7.8, 'normal', [51, 65, 85]);
      }
    }
  }

  // Page Footer across all pages
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    pdf.setPage(p);
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Full Remove · Customer Case History & Status Report', margin, pageHeight - 8.5);
    pdf.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 8.5);
  }

  return pdf.output('blob');
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function generateSingleCaseCertificatePdfBlob(cert: SingleCaseCertificateData): Blob {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - 20) {
      pdf.addPage();
      y = 18;
    }
  };

  const writeLine = (
    text: string,
    fontSize = 9.5,
    style: 'normal' | 'bold' = 'normal',
    color: [number, number, number] = [30, 41, 59],
    indent = 0
  ) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text || '', contentWidth - indent) as string[];
    for (const line of lines) {
      ensureSpace(6);
      pdf.text(line, margin + indent, y);
      y += 4.8;
    }
  };

  // Header
  pdf.setFillColor(6, 13, 23);
  pdf.rect(0, 0, pageWidth, 38, 'F');
  pdf.setFillColor(16, 185, 129);
  pdf.rect(0, 38, pageWidth, 1.4, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(255, 255, 255);
  pdf.text('FULL REMOVE — CASE VERIFICATION SUMMARY', margin, 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184);
  pdf.text(`Case ${cert.caseNumber}  ·  Seal: ${cert.verificationSealCode}  ·  Issued ${formatTimelineTimestampUtc(new Date().toISOString())}`, margin, 24);
  pdf.text(`Status: ${cert.status.replaceAll('_', ' ').toUpperCase()}  ·  URL Watchlist: ${cert.monitoringEnabled ? 'Active' : 'Standard'}  ·  Mirrors: ${cert.mirrorSummary.removed}/${cert.mirrorSummary.total} removed`, margin, 30);

  y = 48;

  // Case identity card
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, contentWidth, 42, 1.5, 1.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(cert.title.slice(0, 82), margin + 4, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.8);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`Client: ${cert.customerName} (${cert.customerEmail})`, margin + 4, y + 15);
  pdf.text(`Platform: ${cert.platform}  ·  Category: ${cert.complaintType}`, margin + 4, y + 21);
  pdf.text(`Target URL: ${cert.sourceUrl.slice(0, 82)}`, margin + 4, y + 27);
  pdf.text(
    `Opened: ${formatTimelineTimestampUtc(cert.submittedAt)}  ·  Last updated: ${formatTimelineTimestampUtc(cert.updatedAt)}`,
    margin + 4,
    y + 33
  );
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(16, 120, 80);
  pdf.text(`Public Verification Seal: ${cert.verificationSealCode} (verify at /verify)`, margin + 4, y + 39);
  y += 50;

  // Platform Filing Record
  writeLine('PLATFORM FILING RECORD', 10, 'bold', [15, 23, 42]);
  y += 1;
  if (cert.latestSubmission) {
    writeLine(
      `${cert.latestSubmission.platform} via ${cert.latestSubmission.channel} · Ref: ${cert.latestSubmission.externalRef}`,
      9.2,
      'bold',
      [37, 99, 235],
      2
    );
    writeLine(
      `Submitted ${formatTimelineTimestampUtc(cert.latestSubmission.submittedAt)} — ${cert.latestSubmission.summary}`,
      9,
      'normal',
      [51, 65, 85],
      2
    );
  } else {
    writeLine('No external platform filing recorded yet.', 9, 'normal', [100, 116, 139], 2);
  }

  y += 5;
  writeLine('VERIFICATION CHECK RESULT', 10, 'bold', [15, 23, 42]);
  y += 1;
  if (cert.latestVerification) {
    const isRemoved = cert.latestVerification.result === 'confirmed_removed';
    writeLine(
      `Outcome: ${cert.latestVerification.result.replaceAll('_', ' ').toUpperCase()} (${formatTimelineTimestampUtc(cert.latestVerification.checkedAt)})`,
      9.2,
      'bold',
      isRemoved ? [22, 163, 74] : [180, 83, 9],
      2
    );
    writeLine(`Checked URL: ${cert.latestVerification.checkedUrl}`, 8.8, 'normal', [51, 65, 85], 2);
    if (cert.latestVerification.notes) {
      writeLine(`Notes: ${cert.latestVerification.notes}`, 8.8, 'normal', [71, 85, 105], 2);
    }
  } else {
    writeLine('No live verification check recorded yet.', 9, 'normal', [100, 116, 139], 2);
  }

  y += 5;
  writeLine(`ARCHIVED EVIDENCE INVENTORY (${cert.evidenceHashes.length})`, 10, 'bold', [15, 23, 42]);
  y += 1;
  if (cert.evidenceHashes.length === 0) {
    writeLine('No evidence files attached.', 9, 'normal', [100, 116, 139], 2);
  } else {
    for (const item of cert.evidenceHashes) {
      writeLine(
        `• ${item.title} [${item.category}] — SHA-256: ${item.sha256} (${formatTimelineTimestampUtc(item.createdAt)})`,
        8.6,
        'normal',
        [51, 65, 85],
        2
      );
    }
  }

  // Footer
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Full Remove Digital Protection · Confidential Verification Summary', margin, pageHeight - 10);

  return pdf.output('blob');
}

