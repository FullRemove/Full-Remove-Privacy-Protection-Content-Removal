import type { LangCode } from './translations';
import type {
  ActivityCategory,
  CasePendingPriorityTier,
  ComplaintType,
  EvidenceCategory,
  PendingThresholdPresetId,
  SlaHealth,
} from '../lib/caseLogic';

export interface PortalCopy {
  common: {
    brand: string;
    languageLabel: string;
    signOut: string;
    refresh: string;
    close: string;
    cancel: string;
    save: string;
    send: string;
    search: string;
    clear: string;
    resetFilters: string;
    viewAll: string;
    exportCsv: string;
    exportPdf: string;
    download: string;
    loading: string;
    noResults: string;
    unassigned: string;
    none: string;
    optional: string;
    usd: string;
    filesCount: (n: number) => string;
  };
  routes: {
    login: string;
    workspace: string;
    staff: string;
    platformOps: string;
    verify: string;
  };
  statuses: Record<string, string>;
  actions: Record<string, string>;
  roles: Record<string, string>;
  sla: Record<SlaHealth, string>;
  priorityBadges: Record<Exclude<CasePendingPriorityTier, 'normal'>, string>;
  thresholdPresets: Record<PendingThresholdPresetId, string>;
  phases: {
    investigation: { label: string; desc: string };
    submission: { label: string; desc: string };
    pending_verification: { label: string; desc: string };
    resolved: { label: string; desc: string };
  };
  journeyMilestones: {
    submission: { label: string; shortLabel: string };
    investigation: { label: string; shortLabel: string };
    platform_action: { label: string; shortLabel: string };
    verification: { label: string; shortLabel: string };
    completed: string;
    actionNeeded: string;
    inProgress: string;
    pending: string;
  };
  activityCategories: Record<ActivityCategory | 'all', string>;
  activityShortTone: Record<ActivityCategory, string>;
  login: {
    backHome: string;
    portalTag: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    sendCode: string;
    sendingCode: string;
    codeSentToast: (email: string) => string;
    devCodePrefix: string;
    codeLabel: string;
    signInBtn: string;
    signingInBtn: string;
    changeEmail: string;
    networkErrorStart: string;
    networkErrorVerify: string;
    codeSendFailed: string;
    codeInvalid: string;
    demoFailed: string;
    demoNetworkError: string;
    demoEyebrow: string;
    demoTitle: string;
    demoSubtitle: string;
    demoCustomerTitle: string;
    demoCustomerDesc: string;
    demoStaffTitle: string;
    demoStaffDesc: string;
    demoAdminTitle: string;
    demoAdminDesc: string;
    securityNote: string;
  };
  workspace: {
    roleLabel: string;
    breadcrumbRoot: string;
    switchToStaff: string;
    openMenu: string;
    newCaseBtn: string;
    loadingText: string;
    loadError: string;
    nav: {
      overview: string;
      cases: string;
      submit: string;
      packages: string;
      billing: string;
      support: string;
      notifications: string;
      account: string;
    };
    summary: {
      title: string;
      subtitle: string;
      resolutionRate: string;
      ofTotal: (resolved: number, total: number) => string;
      activeCasesLabel: string;
      outOfTotal: (total: number) => string;
      awaitingReply: (n: number) => string;
      avgTimeLabel: string;
      acrossSubmissions: (total: number) => string;
      resolvedAvg: (val: string) => string;
    };
    kpis: {
      total: { label: string; note: string };
      inProgress: { label: string; note: string };
      needsAttention: { label: string; note: string };
      resolved: { label: string; note: string };
    };
    search: {
      overviewPlaceholder: string;
      casesPlaceholder: string;
      activeOnly: string;
      allCases: string;
      allStatuses: string;
      shownCount: (shown: number, total: number) => string;
      noMatch: (q: string) => string;
      sortNewest: string;
      sortOldest: string;
      sortCaseAz: string;
      sortStatus: string;
    };
    overview: {
      activeCasesTitle: string;
      recentUpdatesTitle: string;
      noActivityYet: string;
    };
    tracker: {
      detailEyebrow: string;
      overviewTitle: string;
      overviewSubtitle: string;
      liveActive: string;
      reconnecting: string;
      connecting: string;
      syncedAt: (utcTime: string) => string;
      oldestFirst: string;
      newestFirst: string;
      emptyText: string;
      activityLogTitle: string;
      eventsCount: (n: number) => string;
      showFewer: string;
      showAllEvents: (n: number) => string;
      noEvents: string;
      pendingOver: (duration: string, hours: number) => string;
      journeyHeading: string;
    };
    alerts: {
      ariaLabel: string;
      urgentInput: string;
      resolved: string;
      statusAlerts: string;
      popoverTitle: string;
      popoverSummary: (urgent: number, resolved: number) => string;
      resolvedNote: string;
      emptyAlerts: string;
      unreadCount: (n: number) => string;
      viewAllAlerts: string;
      viewResolution: string;
      replyNow: string;
      dismiss: string;
      removedBadge: string;
      removedTitle: string;
      removedBannerDesc: string;
    };
    casesTable: {
      caseNum: string;
      subject: string;
      platform: string;
      files: string;
      journey: string;
      status: string;
      response: string;
    };
    submitForm: {
      title: string;
      subtitle: string;
      caseTitleLabel: string;
      caseTitlePlaceholder: string;
      platformLabel: string;
      platformPlaceholder: string;
      urlLabel: string;
      categoryLabel: string;
      categories: Record<ComplaintType, string>;
      detailsLabel: string;
      detailsPlaceholder: string;
      submitBtn: string;
      readinessEyebrow: string;
      targetSla: string;
      whereWeReport: string;
      suggestedService: string;
      checklistTitle: string;
      createdBanner: (caseNum: string) => string;
      createFailed: string;
    };
    packagesTab: {
      formTitle: string;
      attachBtn: string;
      firstReview: (hours: number) => string;
      selectBtn: string;
      invoiceGenerated: (invNum: string, amount: string) => string;
    };
    billingTab: {
      cardTitle: string;
      autoVerified: string;
      selectUnpaidInvoice: string;
      cardHolderPlaceholder: string;
      cardLast4Placeholder: string;
      payNowBtn: string;
      payingBtn: string;
      manualTitle: string;
      selectInvoice: string;
      methods: {
        bank_transfer: string;
        cash: string;
        manual: string;
      };
      receiptCodePlaceholder: string;
      submitProofBtn: string;
      searchPlaceholder: string;
      sortNewest: string;
      sortAmountHigh: string;
      sortAmountLow: string;
      sortStatus: string;
      cols: {
        invoice: string;
        caseNum: string;
        service: string;
        amount: string;
        status: string;
        receipt: string;
      };
      viewPrint: string;
      statementEyebrow: string;
      billedAccount: string;
      statusDate: string;
      printBtn: string;
      cardSuccess: (ref: string, invNum: string) => string;
      manualSuccess: (ref: string) => string;
    };
    supportTab: {
      formTitle: string;
      subjectPlaceholder: string;
      categories: {
        takedown: string;
        billing: string;
        general: string;
      };
      priorities: {
        normal: string;
        high: string;
      };
      msgPlaceholder: string;
      createBtn: string;
      replyPlaceholder: string;
      replyBtn: string;
      emptyTickets: string;
      createdBanner: (ticketNum: string) => string;
      replyPosted: string;
    };
    notificationsTab: {
      title: (unread: number) => string;
      markAllRead: string;
      markRead: string;
      empty: string;
    };
    accountTab: {
      profileTitle: string;
      fullNamePlaceholder: string;
      phonePlaceholder: string;
      idDocPlaceholder: string;
      photoPlaceholder: string;
      saveProfileBtn: string;
      privacyTitle: string;
      exportJson: string;
      requestExport: string;
      requestDeletion: string;
      notesPlaceholder: string;
      submitRequestBtn: string;
      submittedTitle: string;
      profileSaved: string;
      requestSaved: string;
    };
    caseModal: {
      tabs: {
        timeline: string;
        evidence: (n: number) => string;
        messages: (n: number) => string;
      };
      timelineTitle: string;
      submissionsTitle: string;
      verificationsTitle: string;
      uploadTitle: string;
      evTitlePlaceholder: string;
      evCategories: Record<EvidenceCategory, string>;
      attachFileLabel: string;
      stagedLabel: (name: string, size: string) => string;
      previewFile: string;
      fileNamePlaceholder: string;
      refUrlPlaceholder: string;
      notePlaceholder: string;
      saveEvidenceBtn: string;
      decryptDownload: string;
      noEvidence: string;
      replyPlaceholder: string;
      sendReplyBtn: string;
      noMessages: string;
      evidenceSaved: (hash: string) => string;
      messageSent: string;
    };
    previewModal: {
      eyebrow: string;
      fitView: string;
      fullSize: string;
      textContentLabel: string;
      truncatedNotice: string;
      emptyText: string;
      unsupportedTitle: string;
      unsupportedBody: (fileName: string, mime: string) => string;
      securityNote: string;
      removeFile: string;
      closePreview: string;
      confirmSave: string;
    };
  };
  staff: {
    brandTitle: string;
    consoleLabel: string;
    breadcrumbRoot: string;
    openCentralAdmin: string;
    backToWorkspace: string;
    loadingText: string;
    loadError: string;
    nav: {
      cases: string;
      inquiries: string;
      team: string;
    };
    kpis: {
      total: string;
      open: string;
      waitingClient: string;
      resolved: string;
    };
    filters: {
      searchPlaceholder: string;
      assignedToMe: string;
      sortNewest: string;
      sortOldest: string;
      sortCaseAz: string;
      sortStatus: string;
    };
    casesTable: {
      caseNum: string;
      client: string;
      title: string;
      platform: string;
      owner: string;
      status: string;
      response: string;
    };
    inquiriesTable: {
      sender: string;
      topic: string;
      message: string;
      status: string;
      actions: string;
      convertBtn: string;
      caseOpened: string;
      markReviewed: string;
      convertedToast: (caseNum: string) => string;
      updatedToast: string;
    };
    teamTab: {
      inviteTitle: string;
      emailPlaceholder: string;
      sendInviteBtn: string;
      member: string;
      role: string;
      status: string;
      manage: string;
      makeAdmin: string;
      pauseAccess: string;
      invitedToast: (email: string) => string;
    };
    caseModal: {
      actionsTitle: string;
      assignedTo: string;
      unassignedPool: string;
      draftNoticeBtn: string;
      actionNotePlaceholder: string;
      logSubmissionTitle: string;
      channels: {
        platform_portal: string;
        web_form: string;
        email: string;
      };
      extRefPlaceholder: string;
      subSummaryPlaceholder: string;
      saveSubmissionBtn: string;
      submissionSaved: string;
      verifyTitle: string;
      runUrlCheck: string;
      checkingUrl: string;
      verNotesPlaceholder: string;
      saveVerifyBtn: string;
      verifySaved: string;
      evidenceTitle: (n: number) => string;
      noEvidence: string;
      replyClientTitle: string;
      replyClientPlaceholder: string;
      teamNoteTitle: string;
      teamNotePlaceholder: string;
      saveNoteBtn: string;
      noticeRecorded: (caseNum: string) => string;
    };
    noticeModal: {
      eyebrow: string;
      recipientDesk: string;
      channels: {
        platform_rights: string;
        registrar_whois: string;
        search_deindex: string;
        publisher_legal: string;
      };
      packetLabel: string;
      copyBtn: string;
      copiedBtn: string;
      downloadTxt: string;
      refPlaceholder: string;
      recordBtn: string;
      recordingBtn: string;
    };
  };
  admin: {
    brandTitle: string;
    breadcrumbRoot: string;
    openStaffConsole: string;
    openClientWorkspace: string;
    loadingText: string;
    loadError: string;
    nav: {
      overview: string;
      customers: string;
      payments: string;
      cases: string;
      support: string;
      requests: string;
      audit: string;
      reports: string;
      visitors: string;
      roles: string;
    };
    overviewKpis: {
      customers: { label: string; sub: string };
      cases: { label: string; sub: (attention: number) => string };
      payments: { label: string; sub: string };
      support: { label: string; sub: string };
      requests: { label: string; sub: string };
      inquiries: { label: string; sub: string };
    };
    broadcast: {
      title: string;
      allClients: string;
      subjectPlaceholder: string;
      bodyPlaceholder: string;
      sendBtn: string;
      sentToast: string;
    };
    intake: {
      title: string;
      converted: string;
      convertBtn: string;
      convertedToast: string;
    };
    customersView: {
      registered: string;
      activeBilling: string;
      needingAttention: string;
      cols: {
        organization: string;
        contact: string;
        cases: string;
        invoices: string;
        access: string;
        actions: string;
      };
      profileBtn: string;
      viewCasesBtn: string;
      restoreBtn: string;
      suspendBtn: string;
    };
    paymentsView: {
      cols: {
        invoiceRef: string;
        client: string;
        amount: string;
        status: string;
        decision: string;
      };
      notePlaceholder: string;
      approveBtn: string;
      rejectBtn: string;
    };
    casesView: {
      searchPlaceholder: string;
      clearOrgFilter: (org: string) => string;
      cols: {
        caseNum: string;
        client: string;
        subject: string;
        platform: string;
        owner: string;
        status: string;
        response: string;
      };
    };
    supportView: {
      cols: {
        ticket: string;
        client: string;
        subject: string;
        priority: string;
        status: string;
      };
    };
    requestsView: {
      cols: {
        client: string;
        type: string;
        notes: string;
        status: string;
        action: string;
      };
      notePlaceholder: string;
      completeBtn: string;
    };
    reportsView: {
      startDate: string;
      endDate: string;
      approvedRevenue: string;
      exportCsv: string;
    };
    visitorsView: {
      liveSummary: (online: number, rpm: number, country: string) => string;
      last7Days: string;
      last30Days: string;
      sessions: string;
      uniqueVisitors: string;
      pageViews: string;
      conversions: string;
      trafficTitle: string;
      cols: {
        session: string;
        location: string;
        device: string;
        pages: string;
        views: string;
        inquiry: string;
      };
      convertedTag: string;
    };
    rolesView: {
      formTitle: string;
      emailPlaceholder: string;
      assignBtn: string;
      cols: {
        email: string;
        role: string;
        status: string;
        manage: string;
      };
      activate: string;
      suspend: string;
    };
    profileModal: {
      eyebrow: string;
      email: string;
      phone: string;
      workspace: string;
      idDoc: string;
    };
    caseModal: {
      statusControl: string;
      updateStatusBtn: string;
      ownerTitle: string;
      assignBtn: string;
      replyTitle: string;
      replyPlaceholder: string;
      sendBtn: string;
      privateNoteTitle: string;
      privateNotePlaceholder: string;
      saveNoteBtn: string;
      filingTitle: string;
      refPlaceholder: string;
      filingNotePlaceholder: string;
      saveFilingBtn: string;
      verifyTitle: string;
      verifyNotePlaceholder: string;
      saveVerifyBtn: string;
      evidenceTitle: (n: number) => string;
    };
    ticketModal: {
      replyPlaceholder: string;
      sendReply: string;
      notePlaceholder: string;
      saveNote: string;
      saveStatus: string;
    };
    activityLog: {
      title: string;
      connected: string;
      reconnecting: string;
      connecting: string;
      disconnected: string;
      operatorsOnline: (n: number) => string;
      pause: string;
      resume: string;
      resumeQueued: (n: number) => string;
      fullLog: string;
      searchPlaceholder: string;
      emptyText: string;
      cols: {
        time: string;
        area: string;
        summary: string;
        by: string;
        item: string;
        client: string;
      };
      details: {
        eventId: string;
        timestamp: string;
        actor: string;
        target: string;
      };
    };
  };
  enhancements: {
    quickJump: {
      buttonLabel: string;
      title: string;
      placeholder: string;
      empty: string;
      sectionsLabel: string;
      casesLabel: string;
      hint: string;
    };
    templates: {
      heading: string;
      subtitle: string;
      checklistTitle: string;
      checkUrlOk: string;
      checkUrlTodo: string;
      checkDescOk: string;
      checkDescTodo: string;
      checkProofTip: string;
      items: Record<
        'impostor' | 'private_media' | 'deepfake' | 'brand_clone' | 'copyright',
        { label: string; sampleTitle: string; sampleDesc: string }
      >;
    };
    certificate: {
      downloadBtn: string;
      printableBtn: string;
      copySealBtn: string;
      sealCopied: string;
      printNowBtn: string;
      sealCodeLabel: string;
      mirrorSummaryLabel: string;
      verifyOnlineHint: string;
      title: string;
      subtitle: string;
      caseNumber: string;
      client: string;
      platform: string;
      targetUrl: string;
      status: string;
      submitted: string;
      updated: string;
      filingHeader: string;
      verificationHeader: string;
      evidenceHeader: string;
      noFiling: string;
      noVerification: string;
      noEvidence: string;
      toastDownloaded: (caseNumber: string) => string;
      downloadReportBtn: string;
      evidenceReportTitle: string;
      workspaceReportTitle: string;
      generatedAt: string;
      caseDescription: string;
      evidenceCountLabel: (n: number) => string;
      evidenceColItem: string;
      evidenceColCategory: string;
      evidenceColIntegrity: string;
      evidenceColRecorded: string;
      encryptedVaultLabel: string;
      metadataOnlyLabel: string;
      casesCountLabel: (n: number) => string;
    };
    watchlist: {
      label: string;
      active: string;
      paused: string;
      enableBtn: string;
      pauseBtn: string;
      activeNote: string;
    };
    queueFilters: {
      all: string;
      open: string;
      submitted: string;
      reviewing: string;
      needs_information: string;
      submitted_to_platform: string;
      resolved: string;
      watched: string;
      sortUrgentSla: string;
      exportCsv: string;
      selectedCount: (n: number) => string;
      assignMe: string;
      startReview: string;
      toggleWatch: string;
      clearSelection: string;
      bulkUpdated: (n: number) => string;
      selectAll: string;
    };
    recheck: {
      toggleBtn: string;
      title: string;
      subtitle: string;
      reasonLabel: string;
      reasonPlaceholder: string;
      urlLabel: string;
      urlPlaceholder: string;
      submitBtn: string;
      submittingBtn: string;
      successBanner: (caseNumber: string) => string;
    };
    watchlistSweep: {
      runBtn: string;
      runningBtn: string;
      monitoredCount: (n: number) => string;
      summaryBanner: (checked: number, removed: number, online: number, flagged: number) => string;
    };
    quickReplies: {
      heading: string;
      items: Array<{ id: string; label: string; text: string }>;
    };
    analytics: {
      title: string;
      subtitle: string;
      slaCompliance: string;
      watchedLinks: string;
      overdueCases: string;
      resolutionRate: string;
      byPlatform: string;
      byCategory: string;
      platformCol: string;
      totalCol: string;
      resolvedCol: string;
      rateCol: string;
      avgTurnaroundCol: string;
      exportPlatformCsv: string;
      emptyText: string;
    };
    verifyPage: {
      backHome: string;
      eyebrow: string;
      title: string;
      subtitle: string;
      placeholder: string;
      verifyBtn: string;
      verifyingBtn: string;
      privacyNote: string;
      validBadge: string;
      caseNumber: string;
      platform: string;
      status: string;
      submittedAt: string;
      latestCheck: string;
      mirrorsLabel: string;
      mirrorsCount: (removed: number, total: number) => string;
      notFoundTitle: string;
      notFoundBody: string;
      openLogin: string;
    };
  };
}

export const PORTAL_TRANSLATIONS: Record<LangCode, PortalCopy> = {
  en: {
    common: {
      brand: 'Full Remove',
      languageLabel: 'Language switcher',
      signOut: 'Sign out',
      refresh: 'Refresh',
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      send: 'Send',
      search: 'Search',
      clear: 'Clear',
      resetFilters: 'Reset filters',
      viewAll: 'View all',
      exportCsv: 'Export CSV',
      exportPdf: 'Export PDF',
      download: 'Download',
      loading: 'Loading...',
      noResults: 'No matching items found.',
      unassigned: 'Unassigned',
      none: 'None',
      optional: 'Optional',
      usd: 'USD',
      filesCount: (n) => `${n} ${n === 1 ? 'file' : 'files'}`,
    },
    routes: {
      login: 'Sign in · Full Remove',
      workspace: 'My Workspace · Full Remove',
      staff: 'Staff Console · Full Remove',
      platformOps: 'Central Admin · Full Remove',
      verify: 'Verify Removal · Full Remove',
    },
    statuses: {
      submitted: 'Submitted',
      reviewing: 'In review',
      needs_information: 'Needs your reply',
      approved: 'Approved',
      submitted_to_platform: 'Sent to platform',
      action_taken: 'Platform acted',
      resolved: 'Done',
      rejected: 'Closed (not approved)',
      disputed: 'Under re-check',
      closed: 'Closed',
      paid: 'Paid',
      unpaid: 'Unpaid',
      pending_review: 'Waiting review',
      new: 'New',
      reviewed: 'Reviewed',
      archived: 'Archived',
      converted: 'Opened as case',
      open: 'Open',
      in_progress: 'In progress',
      waiting_customer: 'Waiting on client',
      completed: 'Done',
      confirmed_removed: 'Removed',
      still_accessible: 'Still online',
      redirected: 'Redirected',
      login_required: 'Login required',
      active: 'Active',
      suspended: 'Paused',
    },
    actions: {
      start_review: 'Start review',
      request_info: 'Ask client for info',
      request_information: 'Ask client for info',
      approve: 'Approve case',
      mark_submitted: 'Mark sent to platform',
      mark_action: 'Platform took action',
      mark_action_taken: 'Platform took action',
      resolve: 'Mark as done',
      reject: 'Close without approval',
      reopen: 'Reopen review',
      reopen_dispute: 'Reopen review',
      close: 'Close case',
    },
    roles: {
      operations_admin: 'Central Admin',
      case_manager: 'Case Manager',
      support_agent: 'Support Agent',
      privacy_officer: 'Privacy Officer',
      auditor: 'Auditor',
      owner: 'Owner',
      admin: 'Team Admin',
      analyst: 'Reviewer',
      viewer: 'Read-only',
      customer: 'Client',
      staff: 'Staff',
    },
    sla: {
      completed: 'Done',
      on_track: 'On track',
      due_soon: 'Reply soon',
      overdue: 'Needs attention',
    },
    priorityBadges: {
      high_priority: 'High priority',
      urgent: 'Urgent',
    },
    thresholdPresets: {
      strict: 'Priority alerts: 12h / 24h',
      standard: 'Priority alerts: 24h / 48h',
      relaxed: 'Priority alerts: 48h / 72h',
    },
    phases: {
      investigation: {
        label: 'Checking proof',
        desc: 'We review your links, photos, and ownership details.',
      },
      submission: {
        label: 'Sending report',
        desc: 'We submit an official takedown report to the platform.',
      },
      pending_verification: {
        label: 'Waiting on platform',
        desc: 'We follow up and check if the content has been removed.',
      },
      resolved: {
        label: 'Done',
        desc: 'Result checked and final summary saved for your records.',
      },
    },
    journeyMilestones: {
      submission: { label: 'Sent', shortLabel: 'Sent' },
      investigation: { label: 'Team check', shortLabel: 'Check' },
      platform_action: { label: 'Reported', shortLabel: 'Reported' },
      verification: { label: 'Verified', shortLabel: 'Done' },
      completed: 'Done',
      actionNeeded: 'Needs reply',
      inProgress: 'In progress',
      pending: 'Next',
    },
    activityCategories: {
      all: 'All',
      case_workflow: 'Cases & files',
      payment_billing: 'Payments',
      security_role: 'Team & access',
      support_privacy: 'Support & privacy',
      system_modification: 'System',
    },
    activityShortTone: {
      case_workflow: 'Case',
      payment_billing: 'Payment',
      security_role: 'Access',
      support_privacy: 'Support',
      system_modification: 'System',
    },
    login: {
      backHome: 'Back to home',
      portalTag: 'Private Client Portal',
      eyebrow: 'Sign in',
      title: 'Welcome back to Full Remove',
      subtitle:
        'Check your open cases, upload proof safely, view invoices, and message your team using a one-time email code.',
      emailLabel: 'Your email address',
      emailPlaceholder: 'you@example.com',
      sendCode: 'Send one-time login code',
      sendingCode: 'Sending code...',
      codeSentToast: (email) => `We created a one-time login code for ${email}.`,
      devCodePrefix: 'Your login code:',
      codeLabel: '6-digit login code',
      signInBtn: 'Sign in to workspace',
      signingInBtn: 'Signing in...',
      changeEmail: 'Change email',
      networkErrorStart: 'Could not reach the server. Please try again.',
      networkErrorVerify: 'Could not verify the code right now. Please try again.',
      codeSendFailed: 'Could not send login code.',
      codeInvalid: 'That code is invalid or expired.',
      demoFailed: 'Unable to open demo workspace.',
      demoNetworkError: 'Network error starting demo session.',
      demoEyebrow: 'Quick demo access',
      demoTitle: 'Try a sample workspace',
      demoSubtitle:
        'Open a ready-made demo account to explore client tracking, staff reviews, or Central Admin.',
      demoCustomerTitle: 'Customer Demo (sara@example.com)',
      demoCustomerDesc: 'My cases, file uploads, payments & messages',
      demoStaffTitle: 'Staff Console Demo (ops@fremove.com)',
      demoStaffDesc: 'Case queue, website messages & reports',
      demoAdminTitle: 'Central Admin Demo',
      demoAdminDesc: 'Full overview, live activity & team roles',
      securityNote: 'Your session stays private using signed tokens and secure cookies.',
    },
    workspace: {
      roleLabel: 'Client workspace',
      breadcrumbRoot: 'Workspace',
      switchToStaff: 'Open staff console',
      openMenu: 'Open menu',
      newCaseBtn: '+ New case',
      loadingText: 'Loading your workspace...',
      loadError: 'Could not load your workspace.',
      nav: {
        overview: 'Overview',
        cases: 'My cases',
        submit: 'New request',
        packages: 'Services',
        billing: 'Payments',
        support: 'Help & support',
        notifications: 'Alerts',
        account: 'Profile & privacy',
      },
      summary: {
        title: 'Case summary',
        subtitle: 'Your open cases and average reply time at a glance.',
        resolutionRate: 'Completed:',
        ofTotal: (resolved, total) => `${resolved} of ${total}`,
        activeCasesLabel: 'Open cases',
        outOfTotal: (total) => `Out of ${total} total cases`,
        awaitingReply: (n) => `${n} waiting for your reply`,
        avgTimeLabel: 'Average time',
        acrossSubmissions: (total) => `Average time across ${total} cases`,
        resolvedAvg: (val) => `Finished avg: ${val}`,
      },
      kpis: {
        total: { label: 'All cases', note: 'Everything you sent' },
        inProgress: { label: 'In progress', note: 'With our team or platform' },
        needsAttention: { label: 'Needs your reply', note: 'Waiting for extra info' },
        resolved: { label: 'Done', note: 'Checked and closed' },
      },
      search: {
        overviewPlaceholder: 'Search by case number (e.g. FR-2026-1038) or platform...',
        casesPlaceholder: 'Search by case ID, title, or platform...',
        activeOnly: 'Open cases only',
        allCases: 'All cases',
        allStatuses: 'All statuses',
        shownCount: (shown, total) => `Showing ${shown} of ${total}`,
        noMatch: (q) => `No cases match "${q}".`,
        sortNewest: 'Newest first',
        sortOldest: 'Oldest first',
        sortCaseAz: 'Case # A–Z',
        sortStatus: 'Status',
      },
      overview: {
        activeCasesTitle: 'Your cases',
        recentUpdatesTitle: 'Latest updates',
        noActivityYet: 'No updates recorded yet.',
      },
      tracker: {
        detailEyebrow: 'Current step',
        overviewTitle: 'Case progress & log',
        overviewSubtitle: 'Follow each step from checking proof to final confirmation.',
        liveActive: 'Live updates on',
        reconnecting: 'Reconnecting...',
        connecting: 'Connecting...',
        syncedAt: (t) => `Updated ${t} UTC`,
        oldestFirst: 'Oldest → Newest',
        newestFirst: 'Newest first',
        emptyText: 'Send a new case request to track every step and update here.',
        activityLogTitle: 'Step-by-step log',
        eventsCount: (n) => `${n} ${n === 1 ? 'update' : 'updates'}`,
        showFewer: 'Show less',
        showAllEvents: (n) => `Show all ${n} updates`,
        noEvents: 'No updates logged yet.',
        pendingOver: (duration, hours) => `Waiting ${duration} (over ${hours}h)`,
        journeyHeading: 'Progress from start to finish',
      },
      alerts: {
        ariaLabel: 'Case alerts',
        urgentInput: 'Needs reply',
        resolved: 'Done',
        statusAlerts: 'Alerts',
        popoverTitle: 'Case updates',
        popoverSummary: (u, r) => `${u} waiting on you · ${r} done`,
        resolvedNote: 'Checked and completed',
        emptyAlerts: 'You are all caught up — no urgent alerts.',
        unreadCount: (n) => `${n} unread alerts`,
        viewAllAlerts: 'See all alerts',
        viewResolution: 'View result',
        replyNow: 'Reply now',
        dismiss: 'Dismiss',
        removedBadge: 'Removed confirmed',
        removedTitle: 'Content successfully removed',
        removedBannerDesc: 'Removal has been verified. Your closure certificate is ready to download.',
      },
      casesTable: {
        caseNum: 'Case #',
        subject: 'Title',
        platform: 'Platform',
        files: 'Files',
        journey: 'Progress',
        status: 'Status',
        response: 'Update',
      },
      submitForm: {
        title: 'Start a new case',
        subtitle:
          'Share the link and tell us what happened. You can upload screenshots or proof files right after creating the case.',
        caseTitleLabel: 'Short title',
        caseTitlePlaceholder: 'e.g. Fake Instagram account using my name',
        platformLabel: 'App or website',
        platformPlaceholder: 'Instagram, TikTok, Website...',
        urlLabel: 'Link to the content',
        categoryLabel: 'What kind of issue is this?',
        categories: {
          impersonation: 'Fake account or impersonation',
          deepfake: 'Deepfake or AI edit',
          extortion: 'Blackmail or threats',
          copyright: 'Stolen photos, video, or work',
          privacy: 'Private info or media shared',
          harassment: 'Harassment or false posts',
          other: 'Other content issue',
        },
        detailsLabel: 'Tell us what happened',
        detailsPlaceholder: 'Share any helpful details so our team can review quickly...',
        submitBtn: 'Send request',
        readinessEyebrow: 'Case check',
        targetSla: 'First review',
        whereWeReport: 'Where we report',
        suggestedService: 'Suggested plan',
        checklistTitle: 'What helps most',
        createdBanner: (caseNum) => `Case ${caseNum} created. You can now add screenshots or files inside the case.`,
        createFailed: 'Could not create the case. Please check your link and title.',
      },
      packagesTab: {
        formTitle: 'Pick a service for an open case',
        attachBtn: 'Create invoice',
        firstReview: (h) => `First check within ${h}h`,
        selectBtn: 'Choose plan',
        invoiceGenerated: (invNum, amt) => `Invoice ${invNum} ready for ${amt}.`,
      },
      billingTab: {
        cardTitle: 'Pay by card',
        autoVerified: 'Instant confirmation',
        selectUnpaidInvoice: 'Choose an unpaid invoice',
        cardHolderPlaceholder: 'Name on card',
        cardLast4Placeholder: 'Last 4 digits (e.g. 4242)',
        payNowBtn: 'Pay now',
        payingBtn: 'Processing...',
        manualTitle: 'Bank or office transfer',
        selectInvoice: 'Choose invoice',
        methods: {
          bank_transfer: 'Bank transfer / FIB',
          cash: 'Office cash receipt',
          manual: 'Other receipt code',
        },
        receiptCodePlaceholder: 'Transfer receipt or reference #',
        submitProofBtn: 'Send payment proof',
        searchPlaceholder: 'Search invoices...',
        sortNewest: 'Newest first',
        sortAmountHigh: 'Highest amount',
        sortAmountLow: 'Lowest amount',
        sortStatus: 'Status',
        cols: {
          invoice: 'Invoice',
          caseNum: 'Case #',
          service: 'Service',
          amount: 'Amount',
          status: 'Status',
          receipt: 'Receipt',
        },
        viewPrint: 'View / Print',
        statementEyebrow: 'Full Remove Receipt',
        billedAccount: 'Client account',
        statusDate: 'Status & date',
        printBtn: 'Print receipt',
        cardSuccess: (ref, invNum) => `Payment confirmed (${ref}) — ${invNum} is now paid.`,
        manualSuccess: (ref) => `Receipt ${ref} sent to our team for confirmation.`,
      },
      supportTab: {
        formTitle: 'Ask our team for help',
        subjectPlaceholder: 'What do you need help with?',
        categories: {
          takedown: 'Case question',
          billing: 'Payments & receipts',
          general: 'General help',
        },
        priorities: {
          normal: 'Normal',
          high: 'Urgent',
        },
        msgPlaceholder: 'Write your question here...',
        createBtn: 'Send message',
        replyPlaceholder: 'Write a reply...',
        replyBtn: 'Send',
        emptyTickets: 'No support messages yet.',
        createdBanner: (tNum) => `Support request ${tNum} sent.`,
        replyPosted: 'Reply sent.',
      },
      notificationsTab: {
        title: (unread) => `Alerts (${unread} unread)`,
        markAllRead: 'Mark all read',
        markRead: 'Mark read',
        empty: 'No alerts yet.',
      },
      accountTab: {
        profileTitle: 'Your contact & ID details',
        fullNamePlaceholder: 'Full name',
        phonePlaceholder: 'Phone or WhatsApp',
        idDocPlaceholder: 'ID file name (optional, e.g. passport.pdf)',
        photoPlaceholder: 'Verification photo name (optional)',
        saveProfileBtn: 'Save details',
        privacyTitle: 'Your data & privacy',
        exportJson: 'Download my data (JSON)',
        requestExport: 'Ask for a copy of all my data',
        requestDeletion: 'Ask to delete my account data',
        notesPlaceholder: 'Any notes for our privacy team...',
        submitRequestBtn: 'Send request',
        submittedTitle: 'Your privacy requests',
        profileSaved: 'Your details have been saved.',
        requestSaved: 'Your privacy request has been sent.',
      },
      caseModal: {
        tabs: {
          timeline: 'Updates',
          evidence: (n) => `Files (${n})`,
          messages: (n) => `Messages (${n})`,
        },
        timelineTitle: 'Case timeline',
        submissionsTitle: 'Reports sent to platforms',
        verificationsTitle: 'Result checks',
        uploadTitle: 'Upload a screenshot or proof file',
        evTitlePlaceholder: 'What is this file? (e.g. Fake profile screenshot)',
        evCategories: {
          screenshot: 'Screenshot',
          ownership_proof: 'Proof it is yours',
          identity: 'ID confirmation',
          correspondence: 'Emails or notices',
          threat_log: 'Threat or blackmail messages',
        },
        attachFileLabel: 'Choose a file (up to 3 MB)',
        stagedLabel: (name, size) => `Ready: ${name} (${size})`,
        previewFile: 'Preview file',
        fileNamePlaceholder: 'File name (optional)',
        refUrlPlaceholder: 'Related link (optional)',
        notePlaceholder: 'Short note for our team...',
        saveEvidenceBtn: 'Upload file safely',
        decryptDownload: 'Download file',
        noEvidence: 'No files uploaded yet.',
        replyPlaceholder: 'Write a message to your case team...',
        sendReplyBtn: 'Send',
        noMessages: 'No messages yet.',
        evidenceSaved: (hash) => `File saved safely (ID ${hash}).`,
        messageSent: 'Message sent to your team.',
      },
      previewModal: {
        eyebrow: 'File preview',
        fitView: 'Fit to screen',
        fullSize: 'Full size',
        textContentLabel: 'Document text',
        truncatedNotice: 'Showing the first 12,000 characters',
        emptyText: '(Empty file)',
        unsupportedTitle: 'Preview is not available for this file type',
        unsupportedBody: (fileName, mime) =>
          `"${fileName}" (${mime}) is ready to upload and will be stored safely once you submit.`,
        securityNote: 'Stored safely with encryption when uploaded',
        removeFile: 'Remove file',
        closePreview: 'Close',
        confirmSave: 'Save file to case',
      },
    },
    staff: {
      brandTitle: 'Full Remove',
      consoleLabel: 'Team console',
      breadcrumbRoot: 'Staff',
      openCentralAdmin: 'Central Admin',
      backToWorkspace: 'Client view',
      loadingText: 'Loading team queue...',
      loadError: 'Could not load team console.',
      nav: {
        cases: 'Case queue',
        inquiries: 'Website messages',
        team: 'Team',
      },
      kpis: {
        total: 'All cases',
        open: 'Open cases',
        waitingClient: 'Waiting on client',
        resolved: 'Done',
      },
      filters: {
        searchPlaceholder: 'Search by case #, client, platform, or status...',
        assignedToMe: 'My cases only',
        sortNewest: 'Newest first',
        sortOldest: 'Oldest first',
        sortCaseAz: 'Case # A–Z',
        sortStatus: 'Status',
      },
      casesTable: {
        caseNum: 'Case #',
        client: 'Client',
        title: 'Title',
        platform: 'Platform',
        owner: 'Owner',
        status: 'Status',
        response: 'Timer',
      },
      inquiriesTable: {
        sender: 'From',
        topic: 'Topic',
        message: 'Message',
        status: 'Status',
        actions: 'Actions',
        convertBtn: 'Open case',
        caseOpened: 'Case opened',
        markReviewed: 'Mark checked',
        convertedToast: (c) => `Opened new case ${c}.`,
        updatedToast: 'Message updated.',
      },
      teamTab: {
        inviteTitle: 'Invite a teammate',
        emailPlaceholder: 'teammate@fremove.com',
        sendInviteBtn: 'Send invite',
        member: 'Team member',
        role: 'Role',
        status: 'Status',
        manage: 'Actions',
        makeAdmin: 'Make admin',
        pauseAccess: 'Pause',
        invitedToast: (email) => `Invite sent to ${email}.`,
      },
      caseModal: {
        actionsTitle: 'Case steps & owner',
        assignedTo: 'Assigned to:',
        unassignedPool: 'Not assigned yet',
        draftNoticeBtn: 'Draft takedown letter',
        actionNotePlaceholder: 'Optional note for this update...',
        logSubmissionTitle: 'Save platform report details',
        channels: {
          platform_portal: 'Platform help form',
          web_form: 'Website form',
          email: 'Abuse / legal email',
        },
        extRefPlaceholder: 'Platform ticket # (e.g. IG-99104)',
        subSummaryPlaceholder: 'Short summary of what was sent...',
        saveSubmissionBtn: 'Save report log',
        submissionSaved: 'Platform report saved.',
        verifyTitle: 'Check if link is still live',
        runUrlCheck: 'Check link now',
        checkingUrl: 'Checking...',
        verNotesPlaceholder: 'Notes on what you saw...',
        saveVerifyBtn: 'Save check',
        verifySaved: 'Result check saved.',
        evidenceTitle: (n) => `Client files (${n})`,
        noEvidence: 'No files uploaded yet.',
        replyClientTitle: 'Message the client',
        replyClientPlaceholder: 'Write an update the client can see...',
        teamNoteTitle: 'Private team note',
        teamNotePlaceholder: 'Note visible only to staff...',
        saveNoteBtn: 'Save note',
        noticeRecorded: (c) => `Report saved for ${c}.`,
      },
      noticeModal: {
        eyebrow: 'Takedown letter builder',
        recipientDesk: 'Send to:',
        channels: {
          platform_rights: 'Platform safety desk',
          registrar_whois: 'Domain host / registrar',
          search_deindex: 'Search removal',
          publisher_legal: 'Website publisher',
        },
        packetLabel: 'Letter text (editable, with file list)',
        copyBtn: 'Copy letter',
        copiedBtn: 'Copied',
        downloadTxt: 'Download .txt',
        refPlaceholder: 'Report ticket #',
        recordBtn: 'Save as sent',
        recordingBtn: 'Saving...',
      },
    },
    admin: {
      brandTitle: 'Central Admin',
      breadcrumbRoot: 'Admin',
      openStaffConsole: 'Staff console',
      openClientWorkspace: 'Client view',
      loadingText: 'Loading Central Admin...',
      loadError: 'Could not load Central Admin.',
      nav: {
        overview: 'Overview',
        customers: 'Clients',
        payments: 'Payments',
        cases: 'Cases',
        support: 'Support',
        requests: 'Privacy requests',
        audit: 'Live activity',
        reports: 'Reports',
        visitors: 'Site visitors',
        roles: 'Staff roles',
      },
      overviewKpis: {
        customers: { label: 'Clients', sub: 'Active client accounts' },
        cases: { label: 'All cases', sub: (att) => `${att} need attention · open / total` },
        payments: { label: 'Payments to check', sub: 'Transfers waiting for approval' },
        support: { label: 'Support queue', sub: 'Open / total help requests' },
        requests: { label: 'Privacy requests', sub: 'Data download & delete requests' },
        inquiries: { label: 'Website messages', sub: 'New messages from the homepage' },
      },
      broadcast: {
        title: 'Send an alert to clients',
        allClients: 'All client accounts',
        subjectPlaceholder: 'Alert title...',
        bodyPlaceholder: 'Write a short update for their Alerts bell...',
        sendBtn: 'Send alert',
        sentToast: 'Alert sent to client workspace.',
      },
      intake: {
        title: 'Recent website messages',
        converted: 'Case opened',
        convertBtn: 'Open case',
        convertedToast: 'Message turned into an active case.',
      },
      customersView: {
        registered: 'Client accounts',
        activeBilling: 'Active invoices / plans',
        needingAttention: 'Cases waiting on client',
        cols: {
          organization: 'Client / Workspace',
          contact: 'Email',
          cases: 'Cases',
          invoices: 'Invoices',
          access: 'Access',
          actions: 'Actions',
        },
        profileBtn: 'Details',
        viewCasesBtn: 'View cases',
        restoreBtn: 'Restore',
        suspendBtn: 'Pause',
      },
      paymentsView: {
        cols: {
          invoiceRef: 'Invoice & receipt',
          client: 'Client',
          amount: 'Amount',
          status: 'Status',
          decision: 'Review & approve',
        },
        notePlaceholder: 'Short note...',
        approveBtn: 'Approve',
        rejectBtn: 'Reject',
      },
      casesView: {
        searchPlaceholder: 'Search by case #, client, platform, or status...',
        clearOrgFilter: (org) => `Clear filter (${org})`,
        cols: {
          caseNum: 'Case #',
          client: 'Client',
          subject: 'Title',
          platform: 'Platform',
          owner: 'Owner',
          status: 'Status',
          response: 'Timer',
        },
      },
      supportView: {
        cols: {
          ticket: 'Ticket #',
          client: 'Client',
          subject: 'Topic',
          priority: 'Priority',
          status: 'Status',
        },
      },
      requestsView: {
        cols: {
          client: 'Client',
          type: 'Request',
          notes: 'Notes',
          status: 'Status',
          action: 'Action',
        },
        notePlaceholder: 'Note...',
        completeBtn: 'Mark done',
      },
      reportsView: {
        startDate: 'From date',
        endDate: 'To date',
        approvedRevenue: 'Approved total',
        exportCsv: 'Download CSV',
      },
      visitorsView: {
        liveSummary: (online, rpm, country) =>
          `${online} online now · ${rpm} views/min · Top country: ${country}`,
        last7Days: 'Last 7 days',
        last30Days: 'Last 30 days',
        sessions: 'Visits',
        uniqueVisitors: 'Visitors',
        pageViews: 'Page views',
        conversions: 'Messages sent',
        trafficTitle: 'Traffic over the last hour',
        cols: {
          session: 'Visit ID',
          location: 'Location',
          device: 'Device & browser',
          pages: 'First → Last page',
          views: 'Views',
          inquiry: 'Message sent',
        },
        convertedTag: 'Sent',
      },
      rolesView: {
        formTitle: 'Add or update staff role',
        emailPlaceholder: 'team@fremove.com',
        assignBtn: 'Save role',
        cols: {
          email: 'Email',
          role: 'Role',
          status: 'Status',
          manage: 'Action',
        },
        activate: 'Activate',
        suspend: 'Pause',
      },
      profileModal: {
        eyebrow: 'Client details',
        email: 'Email',
        phone: 'Phone',
        workspace: 'Workspace',
        idDoc: 'ID file',
      },
      caseModal: {
        statusControl: 'Change status',
        updateStatusBtn: 'Update status',
        ownerTitle: 'Assigned owner',
        assignBtn: 'Save owner',
        replyTitle: 'Message client',
        replyPlaceholder: 'Write a visible update...',
        sendBtn: 'Send reply',
        privateNoteTitle: 'Private team note',
        privateNotePlaceholder: 'Internal note...',
        saveNoteBtn: 'Save note',
        filingTitle: 'Save platform report',
        refPlaceholder: 'Ticket # (e.g. META-9421)',
        filingNotePlaceholder: 'What was sent...',
        saveFilingBtn: 'Save report',
        verifyTitle: 'Verify outcome',
        verifyNotePlaceholder: 'Check notes...',
        saveVerifyBtn: 'Save check',
        evidenceTitle: (n) => `Uploaded files (${n})`,
      },
      ticketModal: {
        replyPlaceholder: 'Reply to client...',
        sendReply: 'Send reply',
        notePlaceholder: 'Private team note...',
        saveNote: 'Save note',
        saveStatus: 'Update status',
      },
      activityLog: {
        title: 'Live activity log',
        connected: 'Live updates on',
        reconnecting: 'Reconnecting...',
        connecting: 'Connecting...',
        disconnected: 'Disconnected',
        operatorsOnline: (n) => `${n} ${n === 1 ? 'person' : 'people'} online`,
        pause: 'Pause',
        resume: 'Resume',
        resumeQueued: (n) => `Resume (${n} new)`,
        fullLog: 'Full log',
        searchPlaceholder: 'Search by person, action, or item...',
        emptyText: 'No activity matches this filter.',
        cols: {
          time: 'Time',
          area: 'Area',
          summary: 'What happened',
          by: 'By',
          item: 'Item',
          client: 'Client',
        },
        details: {
          eventId: 'Event ID',
          timestamp: 'Time (UTC)',
          actor: 'Person',
          target: 'Target',
        },
      },
    },
    enhancements: {
      quickJump: {
        buttonLabel: 'Quick jump',
        title: 'Quick jump across portal',
        placeholder: 'Type a section name, case ID (e.g. FR-2026-1041), or platform...',
        empty: 'No matching sections or cases.',
        sectionsLabel: 'Sections',
        casesLabel: 'Cases',
        hint: 'Use arrow keys and Enter to jump · Esc to close',
      },
      templates: {
        heading: 'Quick templates',
        subtitle: 'Pick a scenario to pre-fill the right category and helpful details.',
        checklistTitle: 'Case readiness check',
        checkUrlOk: 'Direct link format looks valid',
        checkUrlTodo: 'Add a full link starting with https://',
        checkDescOk: 'Description has clear details',
        checkDescTodo: 'Add at least 15 characters describing the issue',
        checkProofTip: 'After sending, upload a screenshot or ownership proof to speed up review.',
        items: {
          impostor: {
            label: 'Fake / Impostor account',
            sampleTitle: 'Impostor profile using my name and photos',
            sampleDesc:
              'This account is copying my profile photos and messaging people while pretending to be me.',
          },
          private_media: {
            label: 'Private photo / video',
            sampleTitle: 'Private photo or video shared without permission',
            sampleDesc:
              'Private personal media was posted or shared on this channel without my consent.',
          },
          deepfake: {
            label: 'AI / Deepfake content',
            sampleTitle: 'Altered AI video or photo using my face',
            sampleDesc:
              'This post uses an AI-edited face or voice clip impersonating me without permission.',
          },
          brand_clone: {
            label: 'Fake website / Brand clone',
            sampleTitle: 'Clone website imitating our business name and storefront',
            sampleDesc:
              'This website copies our business logo, domain style, or checkout flow to mislead visitors.',
          },
          copyright: {
            label: 'Copyright / Stolen work',
            sampleTitle: 'Re-uploaded original photos or video without permission',
            sampleDesc:
              'Original creative work owned by me was copied and re-posted here without authorization.',
          },
        },
      },
      certificate: {
        downloadBtn: 'Closure certificate (PDF)',
        printableBtn: 'Official Verification Certificate',
        copySealBtn: 'Copy seal code',
        sealCopied: 'Seal copied',
        printNowBtn: 'Print certificate',
        sealCodeLabel: 'Public verification seal',
        mirrorSummaryLabel: 'Tracked links removed',
        verifyOnlineHint: 'Verify authenticity anytime at /verify',
        title: 'Official Case & Removal Summary',
        subtitle: 'Issued from Full Remove verification records',
        caseNumber: 'Case number',
        client: 'Client',
        platform: 'Platform',
        targetUrl: 'Target link',
        status: 'Current status',
        submitted: 'Submitted',
        updated: 'Last updated',
        filingHeader: 'Platform filing record',
        verificationHeader: 'Latest link verification',
        evidenceHeader: 'Archived proof (SHA-256)',
        noFiling: 'No external platform filing recorded yet.',
        noVerification: 'No live link verification check recorded yet.',
        noEvidence: 'No evidence files attached.',
        toastDownloaded: (caseNumber) => `Saved PDF summary for ${caseNumber}.`,
        downloadReportBtn: 'Download Report',
        evidenceReportTitle: 'Case Evidence & Verification Report',
        workspaceReportTitle: 'Workspace Evidence & Case Dossier',
        generatedAt: 'Generated',
        caseDescription: 'Case summary',
        evidenceCountLabel: (n) => `${n} archived ${n === 1 ? 'item' : 'items'}`,
        evidenceColItem: 'Evidence item & notes',
        evidenceColCategory: 'Category',
        evidenceColIntegrity: 'Integrity & encryption',
        evidenceColRecorded: 'Recorded',
        encryptedVaultLabel: 'AES-256-GCM Vault',
        metadataOnlyLabel: 'Metadata record',
        casesCountLabel: (n) => `${n} ${n === 1 ? 'case' : 'cases'}`,
      },
      watchlist: {
        label: 'URL Watchlist',
        active: 'Watching link',
        paused: 'Watch paused',
        enableBtn: 'Enable URL watch',
        pauseBtn: 'Pause URL watch',
        activeNote: 'Staff are keeping this link on active re-check watch.',
      },
      queueFilters: {
        all: 'All',
        open: 'Open',
        submitted: 'New',
        reviewing: 'Reviewing',
        needs_information: 'Needs info',
        submitted_to_platform: 'With platform',
        resolved: 'Done',
        watched: 'Watchlist',
        sortUrgentSla: 'Urgent SLA first',
        exportCsv: 'Export CSV',
        selectedCount: (n) => `${n} selected`,
        assignMe: 'Assign to me',
        startReview: 'Start review',
        toggleWatch: 'Toggle watch',
        clearSelection: 'Clear',
        bulkUpdated: (n) => `Updated ${n} case(s).`,
        selectAll: 'Select all visible cases',
      },
      recheck: {
        toggleBtn: 'Report content returned / Request re-check',
        title: 'Request a compliance re-check',
        subtitle: 'If the link went back online or a similar copy appeared, let our team review it right away.',
        reasonLabel: 'What happened?',
        reasonPlaceholder: 'Describe why this case needs a second check (min 8 characters)...',
        urlLabel: 'New or reappeared link (optional)',
        urlPlaceholder: 'https://...',
        submitBtn: 'Submit re-check request',
        submittingBtn: 'Submitting...',
        successBanner: (caseNumber) => `Re-check opened for ${caseNumber}. Link added to priority watch.`,
      },
      watchlistSweep: {
        runBtn: 'Run watchlist sweep',
        runningBtn: 'Checking links...',
        monitoredCount: (n) => `${n} watched`,
        summaryBanner: (checked, removed, online, flagged) =>
          `Sweep checked ${checked} watched link(s): ${removed} removed, ${online} still accessible${flagged > 0 ? ` (${flagged} reappeared alert)` : ''}.`,
      },
      quickReplies: {
        heading: 'Quick replies:',
        items: [
          {
            id: 'docs_needed',
            label: 'Need ownership proof',
            text: 'Could you share a clear ID or original ownership proof in the Files tab so we can complete this filing?',
          },
          {
            id: 'filed_platform',
            label: 'Filed with platform',
            text: 'We have submitted your official removal packet to the platform team and are monitoring their response.',
          },
          {
            id: 'verify_removed',
            label: 'Removal confirmed',
            text: 'Good news — our live verification confirmed the reported content is no longer accessible online.',
          },
          {
            id: 'recheck_started',
            label: 'Re-check underway',
            text: 'We reopened your case for priority re-check and enabled active link monitoring.',
          },
        ],
      },
      analytics: {
        title: 'Platform & Category Analytics',
        subtitle: 'Resolution rates, active queues, SLA health, and average turnaround per platform.',
        slaCompliance: 'SLA on-track',
        watchedLinks: 'Watched links',
        overdueCases: 'Overdue SLA',
        resolutionRate: 'Overall resolution',
        byPlatform: 'Cases by platform',
        byCategory: 'Cases by category',
        platformCol: 'Platform',
        totalCol: 'Total',
        resolvedCol: 'Done',
        rateCol: 'Resolution %',
        avgTurnaroundCol: 'Avg time',
        exportPlatformCsv: 'Export platform CSV',
        emptyText: 'No cases in this date range.',
      },
      verifyPage: {
        backHome: 'Back to home',
        eyebrow: 'Public Record Check',
        title: 'Verify a Full Remove certificate seal',
        subtitle: 'Enter a certificate seal code (such as FR-SEAL-1022A4) or case number to check current takedown status without exposing private client data.',
        placeholder: 'Enter seal code (e.g. FR-SEAL-1022A4)',
        verifyBtn: 'Verify record',
        verifyingBtn: 'Checking...',
        privacyNote: 'Client names, emails, and private evidence remain strictly hidden.',
        validBadge: 'Authentic Full Remove case record',
        caseNumber: 'Case number',
        platform: 'Platform',
        status: 'Case status',
        submittedAt: 'Opened on',
        latestCheck: 'Latest live check',
        mirrorsLabel: 'Tracked links removed',
        mirrorsCount: (removed, total) => `${removed} of ${total} removed`,
        notFoundTitle: 'No matching record found',
        notFoundBody: 'Double-check the seal code on your PDF certificate or contact the case owner.',
        openLogin: 'Open client portal',
      },
    },
  },

  ar: {
    common: {
      brand: 'Full Remove',
      languageLabel: 'تغيير اللغة',
      signOut: 'تسجيل الخروج',
      refresh: 'تحديث',
      close: 'إغلاق',
      cancel: 'إلغاء',
      save: 'حفظ',
      send: 'إرسال',
      search: 'بحث',
      clear: 'مسح',
      resetFilters: 'إعادة ضبط البحث',
      viewAll: 'عرض الكل',
      exportCsv: 'تصدير CSV',
      exportPdf: 'تصدير PDF',
      download: 'تنزيل',
      loading: 'جارٍ التحميل...',
      noResults: 'لا توجد نتائج مطابقة.',
      unassigned: 'غير معيّن',
      none: 'لا يوجد',
      optional: 'اختياري',
      usd: 'دولار',
      filesCount: (n) => (n === 1 ? 'ملف واحد' : `${n} ملفات`),
    },
    routes: {
      login: 'تسجيل الدخول · Full Remove',
      workspace: 'مساحتي · Full Remove',
      staff: 'لوحة الفريق · Full Remove',
      platformOps: 'الإدارة المركزية · Full Remove',
      verify: 'التحقق من الشهادة · Full Remove',
    },
    statuses: {
      submitted: 'تم الإرسال',
      reviewing: 'قيد المراجعة',
      needs_information: 'بانتظار ردك',
      approved: 'تمت الموافقة',
      submitted_to_platform: 'أُرسل للمنصة',
      action_taken: 'تم الإجراء',
      resolved: 'مكتمل',
      rejected: 'مغلق (غير مقبول)',
      disputed: 'إعادة فحص',
      closed: 'مغلق',
      paid: 'مدفوع',
      unpaid: 'غير مدفوع',
      pending_review: 'بانتظار المراجعة',
      new: 'جديد',
      reviewed: 'تمت المراجعة',
      archived: 'مؤرشف',
      converted: 'فُتحت كحالة',
      open: 'مفتوح',
      in_progress: 'قيد المعالجة',
      waiting_customer: 'بانتظار العميل',
      completed: 'مكتمل',
      confirmed_removed: 'تمت الإزالة',
      still_accessible: 'لا يزال متاحاً',
      redirected: 'تم تحويل الرابط',
      login_required: 'يتطلب تسجيل دخول',
      active: 'نشط',
      suspended: 'موقوف مؤقتاً',
    },
    actions: {
      start_review: 'بدء المراجعة',
      request_info: 'طلب معلومات من العميل',
      request_information: 'طلب معلومات من العميل',
      approve: 'اعتماد الحالة',
      mark_submitted: 'تحديد كمُرسل للمنصة',
      mark_action: 'تم اتخاذ إجراء من المنصة',
      mark_action_taken: 'تم اتخاذ إجراء من المنصة',
      resolve: 'تحديد كمكتمل',
      reject: 'إغلاق بدون موافقة',
      reopen: 'إعادة فتح المراجعة',
      reopen_dispute: 'إعادة فتح المراجعة',
      close: 'إغلاق الحالة',
    },
    roles: {
      operations_admin: 'مدير مركزي',
      case_manager: 'مدير حالات',
      support_agent: 'موظف دعم',
      privacy_officer: 'مسؤول خصوصية',
      auditor: 'مدقق',
      owner: 'المالك',
      admin: 'مشرف الفريق',
      analyst: 'مراجع',
      viewer: 'قراءة فقط',
      customer: 'عميل',
      staff: 'فريق العمل',
    },
    sla: {
      completed: 'مكتمل',
      on_track: 'ضمن الوقت',
      due_soon: 'يحتاج متابعة قريباً',
      overdue: 'يحتاج انتباه',
    },
    priorityBadges: {
      high_priority: 'أولوية عالية',
      urgent: 'عاجل',
    },
    thresholdPresets: {
      strict: 'تنبيهات التأخير: ١٢ / ٢٤ ساعة',
      standard: 'تنبيهات التأخير: ٢٤ / ٤٨ ساعة',
      relaxed: 'تنبيهات التأخير: ٤٨ / ٧٢ ساعة',
    },
    phases: {
      investigation: {
        label: 'فحص الإثباتات',
        desc: 'نراجع الروابط والصور وإثبات الهوية أو الملكية.',
      },
      submission: {
        label: 'إرسال البلاغ',
        desc: 'نرسل بلاغ إزالة رسمي إلى المنصة المعنية.',
      },
      pending_verification: {
        label: 'متابعة المنصة',
        desc: 'نتابع الرد ونتحقق مما إذا تمت إزالة المحتوى.',
      },
      resolved: {
        label: 'مكتمل',
        desc: 'تم التحقق من النتيجة وحفظ الملخص النهائي لك.',
      },
    },
    journeyMilestones: {
      submission: { label: 'أُرسل', shortLabel: 'أُرسل' },
      investigation: { label: 'فحص الفريق', shortLabel: 'الفحص' },
      platform_action: { label: 'أُبلغت المنصة', shortLabel: 'البلاغ' },
      verification: { label: 'تم التحقق', shortLabel: 'مكتمل' },
      completed: 'مكتمل',
      actionNeeded: 'يحتاج ردك',
      inProgress: 'قيد التنفيذ',
      pending: 'الخطوة التالية',
    },
    activityCategories: {
      all: 'الكل',
      case_workflow: 'الحالات والملفات',
      payment_billing: 'المدفوعات',
      security_role: 'الفريق والصلاحيات',
      support_privacy: 'الدعم والخصوصية',
      system_modification: 'النظام',
    },
    activityShortTone: {
      case_workflow: 'حالة',
      payment_billing: 'دفع',
      security_role: 'صلاحية',
      support_privacy: 'دعم',
      system_modification: 'نظام',
    },
    login: {
      backHome: 'العودة للرئيسية',
      portalTag: 'بوابة العملاء الخاصة',
      eyebrow: 'تسجيل الدخول',
      title: 'أهلاً بك في Full Remove',
      subtitle:
        'تابع حالاتك المفتوحة، وارفع ملفات الإثبات بأمان، واطلع على الفواتير، وتواصل مع الفريق عبر رمز لمرة واحدة.',
      emailLabel: 'بريدك الإلكتروني',
      emailPlaceholder: 'you@example.com',
      sendCode: 'إرسال رمز الدخول',
      sendingCode: 'جارٍ الإرسال...',
      codeSentToast: (email) => `تم إنشاء رمز دخول لمرة واحدة للبريد ${email}.`,
      devCodePrefix: 'رمز الدخول الخاص بك:',
      codeLabel: 'رمز التحقق من ٦ أرقام',
      signInBtn: 'الدخول إلى المساحة',
      signingInBtn: 'جارٍ الدخول...',
      changeEmail: 'تغيير البريد',
      networkErrorStart: 'تعذر الاتصال بالخادم. حاول مرة أخرى.',
      networkErrorVerify: 'تعذر التحقق من الرمز الآن. حاول مرة أخرى.',
      codeSendFailed: 'تعذر إرسال رمز الدخول.',
      codeInvalid: 'الرمز غير صحيح أو منتهي الصلاحية.',
      demoFailed: 'تعذر فتح الحساب التجريبي.',
      demoNetworkError: 'حدث خطأ أثناء بدء الجلسة التجريبية.',
      demoEyebrow: 'دخول تجريبي سريع',
      demoTitle: 'جرّب مساحة جاهزة',
      demoSubtitle:
        'افتح حساباً تجريبياً لاستعراض بوابة العميل أو لوحة الفريق أو الإدارة المركزية.',
      demoCustomerTitle: 'تجربة العميل (sara@example.com)',
      demoCustomerDesc: 'متابعة الحالات والملفات والمدفوعات والرسائل',
      demoStaffTitle: 'تجربة لوحة الفريق (ops@fremove.com)',
      demoStaffDesc: 'قائمة الحالات ورسائل الموقع والتقارير',
      demoAdminTitle: 'تجربة الإدارة المركزية',
      demoAdminDesc: 'نظرة شاملة والنشاط المباشر وصلاحيات الفريق',
      securityNote: 'تبقى جلستك محمية باستخدام رموز موقّعة وملفات تعريف ارتباط آمنة.',
    },
    workspace: {
      roleLabel: 'مساحة العميل',
      breadcrumbRoot: 'مساحتي',
      switchToStaff: 'فتح لوحة الفريق',
      openMenu: 'فتح القائمة',
      newCaseBtn: '+ حالة جديدة',
      loadingText: 'جارٍ تحميل مساحتك...',
      loadError: 'تعذر تحميل مساحة العمل.',
      nav: {
        overview: 'نظرة عامة',
        cases: 'حالاتي',
        submit: 'طلب جديد',
        packages: 'الخدمات',
        billing: 'المدفوعات',
        support: 'المساعدة والدعم',
        notifications: 'التنبيهات',
        account: 'الملف والخصوصية',
      },
      summary: {
        title: 'ملخص الحالات',
        subtitle: 'حالاتك المفتوحة ومتوسط سرعة الاستجابة في مكان واحد.',
        resolutionRate: 'المكتمل:',
        ofTotal: (resolved, total) => `${resolved} من ${total}`,
        activeCasesLabel: 'الحالات المفتوحة',
        outOfTotal: (total) => `من أصل ${total} حالة`,
        awaitingReply: (n) => `${n} بانتظار ردك`,
        avgTimeLabel: 'متوسط الوقت',
        acrossSubmissions: (total) => `متوسط الوقت عبر ${total} حالة`,
        resolvedAvg: (val) => `متوسط المكتمل: ${val}`,
      },
      kpis: {
        total: { label: 'كل الحالات', note: 'جميع الطلبات المرسلة' },
        inProgress: { label: 'قيد التنفيذ', note: 'مع الفريق أو المنصة' },
        needsAttention: { label: 'يحتاج ردك', note: 'بانتظار معلومات إضافية' },
        resolved: { label: 'مكتمل', note: 'تم التحقق والإغلاق' },
      },
      search: {
        overviewPlaceholder: 'ابحث برقم الحالة (مثل FR-2026-1038) أو اسم المنصة...',
        casesPlaceholder: 'ابحث برقم الحالة أو العنوان أو المنصة...',
        activeOnly: 'المفتوحة فقط',
        allCases: 'كل الحالات',
        allStatuses: 'كل الحالات',
        shownCount: (shown, total) => `عرض ${shown} من ${total}`,
        noMatch: (q) => `لا توجد حالات مطابقة لـ "${q}".`,
        sortNewest: 'الأحدث أولاً',
        sortOldest: 'الأقدم أولاً',
        sortCaseAz: 'رقم الحالة أ–ي',
        sortStatus: 'حسب الحالة',
      },
      overview: {
        activeCasesTitle: 'حالاتك',
        recentUpdatesTitle: 'آخر التحديثات',
        noActivityYet: 'لا توجد تحديثات بعد.',
      },
      tracker: {
        detailEyebrow: 'المرحلة الحالية',
        overviewTitle: 'تقدّم الحالات والسجل الزمني',
        overviewSubtitle: 'تابع كل خطوة من فحص الإثباتات حتى التأكيد النهائي.',
        liveActive: 'التحديث المباشر متصل',
        reconnecting: 'إعادة الاتصال...',
        connecting: 'جارٍ الاتصال...',
        syncedAt: (t) => `آخر تحديث ${t} UTC`,
        oldestFirst: 'الأقدم ← الأحدث',
        newestFirst: 'الأحدث أولاً',
        emptyText: 'أرسل طلباً جديداً لمتابعة جميع الخطوات والتحديثات هنا.',
        activityLogTitle: 'سجل الخطوات',
        eventsCount: (n) => (n === 1 ? 'تحديث واحد' : `${n} تحديثات`),
        showFewer: 'عرض أقل',
        showAllEvents: (n) => `عرض كل ${n} التحديثات`,
        noEvents: 'لا توجد تحديثات مسجلة بعد.',
        pendingOver: (duration, hours) => `بانتظار ${duration} (أكثر من ${hours} ساعة)`,
        journeyHeading: 'مسار الحالة من البداية للنهاية',
      },
      alerts: {
        ariaLabel: 'تنبيهات الحالات',
        urgentInput: 'يحتاج ردك',
        resolved: 'مكتمل',
        statusAlerts: 'التنبيهات',
        popoverTitle: 'تحديثات الحالات',
        popoverSummary: (u, r) => `${u} بانتظار ردك · ${r} مكتمل`,
        resolvedNote: 'تم الفحص والإنجاز',
        emptyAlerts: 'لا توجد تنبيهات عاجلة حالياً.',
        unreadCount: (n) => `${n} تنبيهات غير مقروءة`,
        viewAllAlerts: 'عرض كل التنبيهات',
        viewResolution: 'عرض النتيجة',
        replyNow: 'الرد الآن',
        dismiss: 'إخفاء',
        removedBadge: 'تمت إزالة المحتوى',
        removedTitle: 'تمت إزالة المحتوى بنجاح',
        removedBannerDesc: 'تم التحقق من إزالة المحتوى. شهادة الإغلاق الخاصة بك جاهزة للتنزيل.',
      },
      casesTable: {
        caseNum: 'رقم الحالة',
        subject: 'العنوان',
        platform: 'المنصة',
        files: 'الملفات',
        journey: 'التقدم',
        status: 'الوضع',
        response: 'المتابعة',
      },
      submitForm: {
        title: 'بدء حالة جديدة',
        subtitle:
          'أضف الرابط واشرح ما حدث. يمكنك إرفاق لقطات الشاشة والملفات مباشرة بعد إنشاء الحالة.',
        caseTitleLabel: 'عنوان مختصر',
        caseTitlePlaceholder: 'مثال: حساب مزيف باسمي على إنستغرام',
        platformLabel: 'التطبيق أو الموقع',
        platformPlaceholder: 'Instagram، TikTok، موقع إلكتروني...',
        urlLabel: 'رابط المحتوى',
        categoryLabel: 'ما نوع المشكلة؟',
        categories: {
          impersonation: 'حساب مزيف أو انتحال شخصية',
          deepfake: 'فيديو مزيف أو تعديل بالذكاء الاصطناعي',
          extortion: 'ابتزاز أو تهديد',
          copyright: 'صور أو أعمال مسروقة',
          privacy: 'نشر معلومات أو صور خاصة',
          harassment: 'مضايقة أو منشورات مسيئة',
          other: 'مشكلة محتوى أخرى',
        },
        detailsLabel: 'اشرح ما حدث',
        detailsPlaceholder: 'أضف أي تفاصيل تساعد فريقنا على مراجعة الحالة بسرعة...',
        submitBtn: 'إرسال الطلب',
        readinessEyebrow: 'فحص الجاهزية',
        targetSla: 'أول مراجعة',
        whereWeReport: 'جهة البلاغ',
        suggestedService: 'الخدمة المناسبة',
        checklistTitle: 'ما يساعدنا أكثر',
        createdBanner: (caseNum) => `تم إنشاء الحالة ${caseNum}. يمكنك الآن رفع الصور أو الإثباتات داخلها.`,
        createFailed: 'تعذر إنشاء الحالة. تأكد من إدخال العنوان والرابط بشكل صحيح.',
      },
      packagesTab: {
        formTitle: 'اختيار خدمة لحالة مفتوحة',
        attachBtn: 'إنشاء فاتورة',
        firstReview: (h) => `أول مراجعة خلال ${h} ساعة`,
        selectBtn: 'اختر الخدمة',
        invoiceGenerated: (invNum, amt) => `تم إنشاء الفاتورة ${invNum} بمبلغ ${amt}.`,
      },
      billingTab: {
        cardTitle: 'الدفع بالبطاقة',
        autoVerified: 'تأكيد فوري',
        selectUnpaidInvoice: 'اختر فاتورة غير مدفوعة',
        cardHolderPlaceholder: 'الاسم على البطاقة',
        cardLast4Placeholder: 'آخر ٤ أرقام (مثال: 4242)',
        payNowBtn: 'ادفع الآن',
        payingBtn: 'جارٍ التأكيد...',
        manualTitle: 'تحويل بنكي أو دفع في المكتب',
        selectInvoice: 'اختر الفاتورة',
        methods: {
          bank_transfer: 'تحويل بنكي / FIB',
          cash: 'إيصال دفع نقدي',
          manual: 'رقم إيصال آخر',
        },
        receiptCodePlaceholder: 'رقم إيصال التحويل أو المرجع',
        submitProofBtn: 'إرسال إثبات الدفع',
        searchPlaceholder: 'ابحث في الفواتير...',
        sortNewest: 'الأحدث أولاً',
        sortAmountHigh: 'الأعلى مبلغاً',
        sortAmountLow: 'الأقل مبلغاً',
        sortStatus: 'الحالة',
        cols: {
          invoice: 'الفاتورة',
          caseNum: 'رقم الحالة',
          service: 'الخدمة',
          amount: 'المبلغ',
          status: 'الحالة',
          receipt: 'الإيصال',
        },
        viewPrint: 'عرض / طباعة',
        statementEyebrow: 'إيصال Full Remove',
        billedAccount: 'حساب العميل',
        statusDate: 'الحالة والتاريخ',
        printBtn: 'طباعة الإيصال',
        cardSuccess: (ref, invNum) => `تم تأكيد الدفع (${ref}) — الفاتورة ${invNum} مدفوعة الآن.`,
        manualSuccess: (ref) => `تم إرسال الإيصال ${ref} للمراجعة والتأكيد.`,
      },
      supportTab: {
        formTitle: 'اسأل فريق الدعم',
        subjectPlaceholder: 'بماذا يمكننا مساعدتك؟',
        categories: {
          takedown: 'سؤال عن حالة',
          billing: 'المدفوعات والفواتير',
          general: 'استفسار عام',
        },
        priorities: {
          normal: 'عادي',
          high: 'عاجل',
        },
        msgPlaceholder: 'اكتب رسالتك هنا...',
        createBtn: 'إرسال الرسالة',
        replyPlaceholder: 'اكتب رداً...',
        replyBtn: 'إرسال',
        emptyTickets: 'لا توجد طلبات دعم بعد.',
        createdBanner: (tNum) => `تم إرسال طلب الدعم ${tNum}.`,
        replyPosted: 'تم إرسال الرد.',
      },
      notificationsTab: {
        title: (unread) => `التنبيهات (${unread} غير مقروءة)`,
        markAllRead: 'تحديد الكل كمقروء',
        markRead: 'تحديد كمقروء',
        empty: 'لا توجد تنبيهات حالياً.',
      },
      accountTab: {
        profileTitle: 'بيانات التواصل والتحقق',
        fullNamePlaceholder: 'الاسم الكامل',
        phonePlaceholder: 'رقم الهاتف أو واتساب',
        idDocPlaceholder: 'اسم ملف الهوية (اختياري، مثل passport.pdf)',
        photoPlaceholder: 'اسم صورة التحقق (اختياري)',
        saveProfileBtn: 'حفظ البيانات',
        privacyTitle: 'بياناتك وخصوصيتك',
        exportJson: 'تنزيل بياناتي (JSON)',
        requestExport: 'طلب نسخة من جميع بياناتي',
        requestDeletion: 'طلب حذف بيانات حسابي',
        notesPlaceholder: 'ملاحظات إضافية لفريق الخصوصية...',
        submitRequestBtn: 'إرسال الطلب',
        submittedTitle: 'طلبات الخصوصية المرسلة',
        profileSaved: 'تم حفظ بياناتك بنجاح.',
        requestSaved: 'تم إرسال طلب الخصوصية للمراجعة.',
      },
      caseModal: {
        tabs: {
          timeline: 'التحديثات',
          evidence: (n) => `الملفات (${n})`,
          messages: (n) => `الرسائل (${n})`,
        },
        timelineTitle: 'سجل الحالة',
        submissionsTitle: 'البلاغات المرسلة للمنصات',
        verificationsTitle: 'نتائج الفحص',
        uploadTitle: 'رفع لقطة شاشة أو ملف إثبات',
        evTitlePlaceholder: 'وصف الملف (مثال: لقطة للحساب المزيف)',
        evCategories: {
          screenshot: 'لقطة شاشة',
          ownership_proof: 'إثبات ملكية',
          identity: 'تأكيد الهوية',
          correspondence: 'رسائل أو بلاغات',
          threat_log: 'سجل تهديد أو ابتزاز',
        },
        attachFileLabel: 'اختر ملفاً (بحد أقصى ٣ ميجابايت)',
        stagedLabel: (name, size) => `جاهز للرفع: ${name} (${size})`,
        previewFile: 'معاينة الملف',
        fileNamePlaceholder: 'اسم الملف (اختياري)',
        refUrlPlaceholder: 'رابط ذو صلة (اختياري)',
        notePlaceholder: 'ملاحظة قصيرة للفريق...',
        saveEvidenceBtn: 'حفظ الملف بأمان',
        decryptDownload: 'تنزيل الملف',
        noEvidence: 'لم يتم رفع ملفات بعد.',
        replyPlaceholder: 'اكتب رسالة لفريق حالتك...',
        sendReplyBtn: 'إرسال',
        noMessages: 'لا توجد رسائل بعد.',
        evidenceSaved: (hash) => `تم حفظ الملف بأمان (مرجع ${hash}).`,
        messageSent: 'تم إرسال رسالتك إلى الفريق.',
      },
      previewModal: {
        eyebrow: 'معاينة الملف',
        fitView: 'ملاءمة الشاشة',
        fullSize: 'الحجم الكامل',
        textContentLabel: 'محتوى المستند',
        truncatedNotice: 'عرض أول ١٢٬٠٠٠ حرف',
        emptyText: '(ملف فارغ)',
        unsupportedTitle: 'المعاينة المباشرة غير متاحة لهذا النوع من الملفات',
        unsupportedBody: (fileName, mime) =>
          `الملف "${fileName}" (${mime}) جاهز وسيتم حفظه مشفراً عند الإرسال.`,
        securityNote: 'يُحفظ مشفراً بأمان عند إضافته للحالة',
        removeFile: 'إزالة الملف',
        closePreview: 'إغلاق',
        confirmSave: 'حفظ الملف في الحالة',
      },
    },
    staff: {
      brandTitle: 'Full Remove',
      consoleLabel: 'لوحة الفريق',
      breadcrumbRoot: 'الفريق',
      openCentralAdmin: 'الإدارة المركزية',
      backToWorkspace: 'واجهة العميل',
      loadingText: 'جارٍ تحميل قائمة العمل...',
      loadError: 'تعذر تحميل لوحة الفريق.',
      nav: {
        cases: 'قائمة الحالات',
        inquiries: 'رسائل الموقع',
        team: 'أعضاء الفريق',
      },
      kpis: {
        total: 'كل الحالات',
        open: 'الحالات المفتوحة',
        waitingClient: 'بانتظار العميل',
        resolved: 'مكتمل',
      },
      filters: {
        searchPlaceholder: 'ابحث برقم الحالة أو العميل أو المنصة...',
        assignedToMe: 'حالاتي فقط',
        sortNewest: 'الأحدث أولاً',
        sortOldest: 'الأقدم أولاً',
        sortCaseAz: 'رقم الحالة أ–ي',
        sortStatus: 'الحالة',
      },
      casesTable: {
        caseNum: 'رقم الحالة',
        client: 'العميل',
        title: 'العنوان',
        platform: 'المنصة',
        owner: 'المسؤول',
        status: 'الحالة',
        response: 'المؤقت',
      },
      inquiriesTable: {
        sender: 'المرسل',
        topic: 'الموضوع',
        message: 'الرسالة',
        status: 'الحالة',
        actions: 'الإجراءات',
        convertBtn: 'فتح حالة',
        caseOpened: 'تم فتح حالة',
        markReviewed: 'تحديد كمقروء',
        convertedToast: (c) => `تم تحويل الرسالة إلى الحالة ${c}.`,
        updatedToast: 'تم تحديث الرسالة.',
      },
      teamTab: {
        inviteTitle: 'دعوة عضو جديد للفريق',
        emailPlaceholder: 'teammate@fremove.com',
        sendInviteBtn: 'إرسال الدعوة',
        member: 'العضو',
        role: 'الدور',
        status: 'الحالة',
        manage: 'إدارة',
        makeAdmin: 'تعيين مشرف',
        pauseAccess: 'إيقاف مؤقت',
        invitedToast: (email) => `تم إرسال الدعوة إلى ${email}.`,
      },
      caseModal: {
        actionsTitle: 'خطوات الحالة والمسؤول',
        assignedTo: 'معيّن إلى:',
        unassignedPool: 'غير معيّن بعد',
        draftNoticeBtn: 'إنشاء رسالة إزالة',
        actionNotePlaceholder: 'ملاحظة اختيارية مع هذا الإجراء...',
        logSubmissionTitle: 'حفظ تفاصيل البلاغ للمنصة',
        channels: {
          platform_portal: 'بوابة المنصة',
          web_form: 'نموذج ويب رسمي',
          email: 'بريد البلاغات القانوني',
        },
        extRefPlaceholder: 'رقم مرجع المنصة (مثل IG-99104)',
        subSummaryPlaceholder: 'ملخص ما تم إرساله...',
        saveSubmissionBtn: 'حفظ البلاغ',
        submissionSaved: 'تم حفظ سجل البلاغ.',
        verifyTitle: 'التحقق من حالة الرابط',
        runUrlCheck: 'فحص الرابط الآن',
        checkingUrl: 'جارٍ الفحص...',
        verNotesPlaceholder: 'ملاحظات الفحص...',
        saveVerifyBtn: 'حفظ النتيجة',
        verifySaved: 'تم حفظ نتيجة الفحص.',
        evidenceTitle: (n) => `ملفات العميل (${n})`,
        noEvidence: 'لا توجد ملفات مرفوعة بعد.',
        replyClientTitle: 'مراسلة العميل',
        replyClientPlaceholder: 'رد يظهر للعميل...',
        teamNoteTitle: 'ملاحظة داخلية للفريق',
        teamNotePlaceholder: 'ملاحظة خاصة بالموظفين فقط...',
        saveNoteBtn: 'حفظ الملاحظة',
        noticeRecorded: (c) => `تم تسجيل البلاغ للحالة ${c}.`,
      },
      noticeModal: {
        eyebrow: 'منشئ خطاب الإزالة',
        recipientDesk: 'الجهة المستلمة:',
        channels: {
          platform_rights: 'فريق أمان المنصة',
          registrar_whois: 'مستضيف الموقع / المسجّل',
          search_deindex: 'إزالة من نتائج البحث',
          publisher_legal: 'الناشر أو الموقع',
        },
        packetLabel: 'نص الخطاب (قابل للتعديل مع قائمة الإثباتات)',
        copyBtn: 'نسخ النص',
        copiedBtn: 'تم النسخ',
        downloadTxt: 'تنزيل .txt',
        refPlaceholder: 'رقم المرجع',
        recordBtn: 'حفظ كمُرسل',
        recordingBtn: 'جارٍ الحفظ...',
      },
    },
    admin: {
      brandTitle: 'الإدارة المركزية',
      breadcrumbRoot: 'الإدارة',
      openStaffConsole: 'لوحة الفريق',
      openClientWorkspace: 'واجهة العميل',
      loadingText: 'جارٍ تحميل الإدارة المركزية...',
      loadError: 'تعذر تحميل الإدارة المركزية.',
      nav: {
        overview: 'نظرة عامة',
        customers: 'العملاء',
        payments: 'المدفوعات',
        cases: 'الحالات',
        support: 'الدعم',
        requests: 'طلبات الخصوصية',
        audit: 'النشاط المباشر',
        reports: 'التقارير',
        visitors: 'زوار الموقع',
        roles: 'صلاحيات الفريق',
      },
      overviewKpis: {
        customers: { label: 'العملاء', sub: 'حسابات العملاء النشطة' },
        cases: { label: 'كل الحالات', sub: (att) => `${att} تحتاج متابعة · مفتوح / الإجمالي` },
        payments: { label: 'مدفوعات للمراجعة', sub: 'حوالات بانتظار التأكيد' },
        support: { label: 'قائمة الدعم', sub: 'طلبات مفتوحة / الإجمالي' },
        requests: { label: 'طلبات الخصوصية', sub: 'طلبات تنزيل أو حذف البيانات' },
        inquiries: { label: 'رسائل الموقع', sub: 'رسائل جديدة من الصفحة الرئيسية' },
      },
      broadcast: {
        title: 'إرسال تنبيه للعملاء',
        allClients: 'جميع حسابات العملاء',
        subjectPlaceholder: 'عنوان التنبيه...',
        bodyPlaceholder: 'اكتب رسالة قصيرة تصل لجرس تنبيهات العميل...',
        sendBtn: 'إرسال التنبيه',
        sentToast: 'تم إرسال التنبيه إلى العميل.',
      },
      intake: {
        title: 'أحدث رسائل الموقع',
        converted: 'تم فتح حالة',
        convertBtn: 'فتح حالة',
        convertedToast: 'تم تحويل الرسالة إلى حالة نشطة.',
      },
      customersView: {
        registered: 'حسابات العملاء',
        activeBilling: 'الفواتير والخطط النشطة',
        needingAttention: 'حالات بانتظار العميل',
        cols: {
          organization: 'العميل / المساحة',
          contact: 'البريد',
          cases: 'الحالات',
          invoices: 'الفواتير',
          access: 'الوصول',
          actions: 'الإجراءات',
        },
        profileBtn: 'التفاصيل',
        viewCasesBtn: 'الحالات',
        restoreBtn: 'تفعيل',
        suspendBtn: 'إيقاف مؤقت',
      },
      paymentsView: {
        cols: {
          invoiceRef: 'الفاتورة والمرجع',
          client: 'العميل',
          amount: 'المبلغ',
          status: 'الحالة',
          decision: 'المراجعة والاعتماد',
        },
        notePlaceholder: 'ملاحظة قصيرة...',
        approveBtn: 'اعتماد',
        rejectBtn: 'رفض',
      },
      casesView: {
        searchPlaceholder: 'ابحث برقم الحالة أو العميل أو المنصة...',
        clearOrgFilter: (org) => `إلغاء التصفية (${org})`,
        cols: {
          caseNum: 'رقم الحالة',
          client: 'العميل',
          subject: 'العنوان',
          platform: 'المنصة',
          owner: 'المسؤول',
          status: 'الحالة',
          response: 'المؤقت',
        },
      },
      supportView: {
        cols: {
          ticket: 'رقم التذكرة',
          client: 'العميل',
          subject: 'الموضوع',
          priority: 'الأولوية',
          status: 'الحالة',
        },
      },
      requestsView: {
        cols: {
          client: 'العميل',
          type: 'النوع',
          notes: 'الملاحظات',
          status: 'الحالة',
          action: 'الإجراء',
        },
        notePlaceholder: 'ملاحظة...',
        completeBtn: 'تم التنفيذ',
      },
      reportsView: {
        startDate: 'من تاريخ',
        endDate: 'إلى تاريخ',
        approvedRevenue: 'إجمالي المبالغ المعتمدة',
        exportCsv: 'تنزيل CSV',
      },
      visitorsView: {
        liveSummary: (online, rpm, country) =>
          `${online} متصل الآن · ${rpm} زيارة/دقيقة · أعلى بلد: ${country}`,
        last7Days: 'آخر ٧ أيام',
        last30Days: 'آخر ٣٠ يوماً',
        sessions: 'الزيارات',
        uniqueVisitors: 'الزوار',
        pageViews: 'مشاهدات الصفحات',
        conversions: 'الرسائل المرسلة',
        trafficTitle: 'الزيارات خلال الساعة الأخيرة',
        cols: {
          session: 'رقم الجلسة',
          location: 'الموقع',
          device: 'الجهاز والمتصفح',
          pages: 'الصفحة الأولى ← الأخيرة',
          views: 'المشاهدات',
          inquiry: 'أرسل رسالة',
        },
        convertedTag: 'أُرسلت',
      },
      rolesView: {
        formTitle: 'إضافة أو تعديل صلاحية موظف',
        emailPlaceholder: 'team@fremove.com',
        assignBtn: 'حفظ الصلاحية',
        cols: {
          email: 'البريد',
          role: 'الصلاحية',
          status: 'الحالة',
          manage: 'الإجراء',
        },
        activate: 'تفعيل',
        suspend: 'إيقاف',
      },
      profileModal: {
        eyebrow: 'بيانات العميل',
        email: 'البريد',
        phone: 'الهاتف',
        workspace: 'المساحة',
        idDoc: 'ملف الهوية',
      },
      caseModal: {
        statusControl: 'تغيير الحالة',
        updateStatusBtn: 'تحديث الحالة',
        ownerTitle: 'الموظف المسؤول',
        assignBtn: 'حفظ المسؤول',
        replyTitle: 'مراسلة العميل',
        replyPlaceholder: 'رسالة يراها العميل...',
        sendBtn: 'إرسال الرد',
        privateNoteTitle: 'ملاحظة داخلية',
        privateNotePlaceholder: 'ملاحظة للفريق فقط...',
        saveNoteBtn: 'حفظ الملاحظة',
        filingTitle: 'حفظ بلاغ المنصة',
        refPlaceholder: 'رقم المرجع (مثل META-9421)',
        filingNotePlaceholder: 'تفاصيل البلاغ...',
        saveFilingBtn: 'حفظ البلاغ',
        verifyTitle: 'تأكيد النتيجة',
        verifyNotePlaceholder: 'ملاحظات الفحص...',
        saveVerifyBtn: 'حفظ الفحص',
        evidenceTitle: (n) => `الملفات المرفوعة (${n})`,
      },
      ticketModal: {
        replyPlaceholder: 'الرد على العميل...',
        sendReply: 'إرسال الرد',
        notePlaceholder: 'ملاحظة داخلية...',
        saveNote: 'حفظ الملاحظة',
        saveStatus: 'تحديث الحالة',
      },
      activityLog: {
        title: 'سجل النشاط المباشر',
        connected: 'متصل مباشرة',
        reconnecting: 'إعادة الاتصال...',
        connecting: 'جارٍ الاتصال...',
        disconnected: 'غير متصل',
        operatorsOnline: (n) => (n === 1 ? 'موظف واحد متصل' : `${n} موظفين متصلين`),
        pause: 'إيقاف مؤقت',
        resume: 'استئناف',
        resumeQueued: (n) => `استئناف (${n} جديد)`,
        fullLog: 'السجل الكامل',
        searchPlaceholder: 'ابحث بالاسم أو الإجراء أو العنصر...',
        emptyText: 'لا يوجد نشاط مطابق للبحث.',
        cols: {
          time: 'الوقت',
          area: 'القسم',
          summary: 'ما حدث',
          by: 'بواسطة',
          item: 'العنصر',
          client: 'العميل',
        },
        details: {
          eventId: 'رقم الحدث',
          timestamp: 'الوقت (UTC)',
          actor: 'المنفّذ',
          target: 'الهدف',
        },
      },
    },
    enhancements: {
      quickJump: {
        buttonLabel: 'انتقال سريع',
        title: 'الانتقال السريع في البوابة',
        placeholder: 'اكتب اسم قسم أو رقم حالة (مثل FR-2026-1041) أو منصة...',
        empty: 'لا توجد أقسام أو حالات مطابقة.',
        sectionsLabel: 'الأقسام',
        casesLabel: 'الحالات',
        hint: 'استخدم الأسهم و Enter للانتقال · Esc للإغلاق',
      },
      templates: {
        heading: 'قوالب سريعة',
        subtitle: 'اختر نوع المشكلة لتعبئة التصنيف والتفاصيل المناسبة بسرعة.',
        checklistTitle: 'فحص جاهزية الطلب',
        checkUrlOk: 'صيغة الرابط المباشر صحيحة',
        checkUrlTodo: 'أضف رابطاً كاملاً يبدأ بـ https://',
        checkDescOk: 'الوصف يحتوي على تفاصيل واضحة',
        checkDescTodo: 'اكتب 15 حرفاً على الأقل لوصف المشكلة',
        checkProofTip: 'بعد الإرسال، أرفق لقطة شاشة أو إثبات ملكية لتسريع المراجعة.',
        items: {
          impostor: {
            label: 'حساب مزيف أو منتحل',
            sampleTitle: 'حساب منتحل يستخدم اسمي وصوري',
            sampleDesc:
              'هذا الحساب ينسخ صوري الشخصية ويتواصل مع الآخرين منتحلاً هويتي.',
          },
          private_media: {
            label: 'صور أو فيديو خاص',
            sampleTitle: 'نشر صور أو مقاطع خاصة دون إذن',
            sampleDesc:
              'تم نشر محتوى شخصي خاص بي على هذه القناة أو الصفحة دون موافقتي.',
          },
          deepfake: {
            label: 'محتوى ذكاء اصطناعي مزيف',
            sampleTitle: 'مقطع أو صورة معدّلة بالذكاء الاصطناعي لوجهي',
            sampleDesc:
              'هذا المنشور يستخدم تعديلاً بالذكاء الاصطناعي لوجهي أو صوتي دون إذن.',
          },
          brand_clone: {
            label: 'موقع مزيف أو تقليد علامة',
            sampleTitle: 'موقع مقلّد ينتحل اسم نشاطنا ومتجرنا',
            sampleDesc:
              'هذا الموقع ينسخ شعارنا وهويتنا أو صفحة الدفع لتضليل العملاء.',
          },
          copyright: {
            label: 'حقوق نشر / عمل مسروق',
            sampleTitle: 'إعادة نشر صور أو أعمال أصلية دون إذن',
            sampleDesc:
              'تم نسخ أعمالي الأصلية وإعادة نشرها هنا دون تصريح أو موافقة.',
          },
        },
      },
      certificate: {
        downloadBtn: 'شهادة الإغلاق (PDF)',
        printableBtn: 'شهادة التحقق الرسمية',
        copySealBtn: 'نسخ رمز التحقق',
        sealCopied: 'تم النسخ',
        printNowBtn: 'طباعة الشهادة',
        sealCodeLabel: 'رمز التحقق العام',
        mirrorSummaryLabel: 'الروابط المزالة',
        verifyOnlineHint: 'تحقق من صحة الشهادة عبر /verify',
        title: 'ملخص الإزالة والتحقق الرسمي',
        subtitle: 'صادر من سجلات التحقق في Full Remove',
        caseNumber: 'رقم الحالة',
        client: 'العميل',
        platform: 'المنصة',
        targetUrl: 'الرابط المستهدف',
        status: 'الحالة الحالية',
        submitted: 'تاريخ الإرسال',
        updated: 'آخر تحديث',
        filingHeader: 'سجل البلاغ للمنصة',
        verificationHeader: 'آخر فحص للرابط',
        evidenceHeader: 'الأدلة المؤرشفة (SHA-256)',
        noFiling: 'لم يُسجَّل بلاغ خارجي للمنصة بعد.',
        noVerification: 'لم يُجرَ فحص مباشر للرابط بعد.',
        noEvidence: 'لا توجد ملفات أدلة مرفقة.',
        toastDownloaded: (caseNumber) => `تم حفظ شهادة PDF للحالة ${caseNumber}.`,
        downloadReportBtn: 'تحميل التقرير',
        evidenceReportTitle: 'تقرير أدلة الحالة والتحقق الرسمي',
        workspaceReportTitle: 'ملف أدلة وتقارير الحالات الشامل',
        generatedAt: 'تاريخ الإصدار',
        caseDescription: 'ملخص الحالة',
        evidenceCountLabel: (n) => `${n} ${n === 1 ? 'مرفق موثّق' : 'مرفقات موثّقة'}`,
        evidenceColItem: 'الدليل والملاحظات',
        evidenceColCategory: 'التصنيف',
        evidenceColIntegrity: 'التحقق والتشفير',
        evidenceColRecorded: 'تاريخ التوثيق',
        encryptedVaultLabel: 'خزنة AES-256-GCM',
        metadataOnlyLabel: 'سجل بيانات',
        casesCountLabel: (n) => `${n} ${n === 1 ? 'حالة' : 'حالات'}`,
      },
      watchlist: {
        label: 'مراقبة الرابط',
        active: 'تحت المراقبة',
        paused: 'المراقبة متوقفة',
        enableBtn: 'تفعيل مراقبة الرابط',
        pauseBtn: 'إيقاف المراقبة',
        activeNote: 'يتابع الفريق إعادة فحص هذا الرابط للتأكد من بقائه محذوفاً.',
      },
      queueFilters: {
        all: 'الكل',
        open: 'المفتوحة',
        submitted: 'جديدة',
        reviewing: 'قيد المراجعة',
        needs_information: 'تحتاج معلومات',
        submitted_to_platform: 'لدى المنصة',
        resolved: 'مكتملة',
        watched: 'قائمة المراقبة',
        sortUrgentSla: 'الأكثر استعجالاً أولاً',
        exportCsv: 'تصدير CSV',
        selectedCount: (n) => `${n} محددة`,
        assignMe: 'تعيين لي',
        startReview: 'بدء المراجعة',
        toggleWatch: 'تبديل المراقبة',
        clearSelection: 'مسح',
        bulkUpdated: (n) => `تم تحديث ${n} حالة.`,
        selectAll: 'تحديد كل الحالات الظاهرة',
      },
      recheck: {
        toggleBtn: 'الإبلاغ عن عودة المحتوى / طلب إعادة فحص',
        title: 'طلب إعادة فحص ومراجعة',
        subtitle: 'إذا عاد الرابط للظهور أو نُشرت نسخة مطابقة، أبلغنا ليراجعها الفريق فوراً.',
        reasonLabel: 'ماذا حدث؟',
        reasonPlaceholder: 'اشرح سبب طلب إعادة الفحص (٨ أحرف على الأقل)...',
        urlLabel: 'الرابط الجديد أو العائد (اختياري)',
        urlPlaceholder: 'https://...',
        submitBtn: 'إرسال طلب إعادة الفحص',
        submittingBtn: 'جارٍ الإرسال...',
        successBanner: (caseNumber) => `تم فتح إعادة الفحص للحالة ${caseNumber} وتفعيل المراقبة.`,
      },
      watchlistSweep: {
        runBtn: 'فحص كل الروابط المراقَبة',
        runningBtn: 'جارٍ فحص الروابط...',
        monitoredCount: (n) => `${n} تحت المراقبة`,
        summaryBanner: (checked, removed, online, flagged) =>
          `تم فحص ${checked} رابط(روابط) مراقبة: ${removed} محذوف، ${online} لا يزال متاحاً${flagged > 0 ? ` (${flagged} تنبيه عودة)` : ''}.`,
      },
      quickReplies: {
        heading: 'ردود سريعة:',
        items: [
          {
            id: 'docs_needed',
            label: 'طلب إثبات ملكية',
            text: 'يرجى رفع صورة هوية أو إثبات ملكية واضح في تبويب الملفات لنتمكن من إكمال البلاغ.',
          },
          {
            id: 'filed_platform',
            label: 'أُرسل للمنصة',
            text: 'أرسلنا ملف الإزالة الرسمي إلى فريق المنصة ونتابع الرد معهم باستمرار.',
          },
          {
            id: 'verify_removed',
            label: 'تأكيد الإزالة',
            text: 'خبر سار — أكد الفحص المباشر أن المحتوى المبلَّغ عنه لم يعد متاحاً على الإنترنت.',
          },
          {
            id: 'recheck_started',
            label: 'بدء إعادة الفحص',
            text: 'أعدنا فتح حالتك للفحص العاجل وفعّلنا المراقبة الدورية للرابط.',
          },
        ],
      },
      analytics: {
        title: 'تحليلات المنصات والفئات',
        subtitle: 'نسب الإنجاز، الحالات النشطة، الالتزام بالوقت، ومتوسط المدة لكل منصة.',
        slaCompliance: 'الالتزام بالوقت',
        watchedLinks: 'روابط مراقبة',
        overdueCases: 'حالات متأخرة',
        resolutionRate: 'نسبة الإنجاز',
        byPlatform: 'الحالات حسب المنصة',
        byCategory: 'الحالات حسب النوع',
        platformCol: 'المنصة',
        totalCol: 'الإجمالي',
        resolvedCol: 'مكتمل',
        rateCol: 'نسبة الحل %',
        avgTurnaroundCol: 'متوسط المدة',
        exportPlatformCsv: 'تصدير CSV للمنصات',
        emptyText: 'لا توجد حالات ضمن هذه الفترة.',
      },
      verifyPage: {
        backHome: 'العودة للرئيسية',
        eyebrow: 'التحقق العام',
        title: 'التحقق من شهادة Full Remove',
        subtitle: 'أدخل رمز الختم (مثل FR-SEAL-1022A4) أو رقم الحالة للتحقق من حالة الإزالة دون كشف أي بيانات خاصة.',
        placeholder: 'أدخل رمز التحقق (مثال: FR-SEAL-1022A4)',
        verifyBtn: 'تحقق الآن',
        verifyingBtn: 'جارٍ التحقق...',
        privacyNote: 'تبقى أسماء العملاء والبريد والأدلة الخاصة مخفية بالكامل.',
        validBadge: 'سجل رسمي موثق لدى Full Remove',
        caseNumber: 'رقم الحالة',
        platform: 'المنصة',
        status: 'حالة الطلب',
        submittedAt: 'تاريخ الفتح',
        latestCheck: 'آخر فحص مباشر',
        mirrorsLabel: 'الروابط المزالة',
        mirrorsCount: (removed, total) => `تمت إزالة ${removed} من ${total}`,
        notFoundTitle: 'لم يتم العثور على سجل مطابق',
        notFoundBody: 'تأكد من صحة رمز التحقق في شهادة الـ PDF أو تواصل مع صاحب الحالة.',
        openLogin: 'فتح بوابة العملاء',
      },
    },
  },

  ku: {
    common: {
      brand: 'Full Remove',
      languageLabel: 'گۆڕینی زمان',
      signOut: 'چوونەدەرەوە',
      refresh: 'نوێکردنەوە',
      close: 'داخستن',
      cancel: 'پاشگەزبوونەوە',
      save: 'پاشەکەوت',
      send: 'ناردن',
      search: 'گەڕان',
      clear: 'سڕینەوە',
      resetFilters: 'پاککردنەوەی فلتەر',
      viewAll: 'بینینی هەمووی',
      exportCsv: 'داگرتنی CSV',
      exportPdf: 'داگرتنی PDF',
      download: 'داگرتن',
      loading: 'چاوەڕوان بە...',
      noResults: 'هیچ ئەنجامێک نەدۆزرایەوە.',
      unassigned: 'دیاری نەکراوە',
      none: 'نییە',
      optional: 'ئارەزوومەندانە',
      usd: 'دۆلار',
      filesCount: (n) => `${n} فایل`,
    },
    routes: {
      login: 'چوونەژوورەوە · Full Remove',
      workspace: 'شوێنکاری من · Full Remove',
      staff: 'پانێڵی تیم · Full Remove',
      platformOps: 'بەڕێوەبردنی ناوەندی · Full Remove',
      verify: 'پشتڕاستکردنەوەی بڕوانامە · Full Remove',
    },
    statuses: {
      submitted: 'نێردرا',
      reviewing: 'لە پێداچوونەوەدایە',
      needs_information: 'چاوەڕوانی وەڵامی تۆیە',
      approved: 'پەسەندکرا',
      submitted_to_platform: 'نێردرا بۆ پلاتفۆرم',
      action_taken: 'ڕێکار گیرایەبەر',
      resolved: 'تەواوبوو',
      rejected: 'داخراو (پەسەندنەکرا)',
      disputed: 'پێداچوونەوەی دووبارە',
      closed: 'داخراو',
      paid: 'پارەدراو',
      unpaid: 'نەدراو',
      pending_review: 'چاوەڕوانی پشکنینە',
      new: 'نوێ',
      reviewed: 'پشکنرا',
      archived: 'ئەرشیفکراو',
      converted: 'کرایە کەیس',
      open: 'کراوە',
      in_progress: 'لە کارکردندایە',
      waiting_customer: 'چاوەڕوانی بەکارهێنەرە',
      completed: 'تەواوبوو',
      confirmed_removed: 'لابراوە',
      still_accessible: 'هێشتا ماوە',
      redirected: 'ئاراستەکراوەتەوە',
      login_required: 'چوونەژوورەوە پێویستە',
      active: 'چالاک',
      suspended: 'ڕاگیراو',
    },
    actions: {
      start_review: 'دەستپێکردنی پێداچوونەوە',
      request_info: 'داوای زانیاری لە بەکارهێنەر',
      request_information: 'داوای زانیاری لە بەکارهێنەر',
      approve: 'پەسەندکردنی کەیس',
      mark_submitted: 'نیشانکردن وەک نێردراو',
      mark_action: 'پلاتفۆرم هەنگاوی نا',
      mark_action_taken: 'پلاتفۆرم هەنگاوی نا',
      resolve: 'تەواوکردنی کەیس',
      reject: 'داخستن بەبێ پەسەندکردن',
      reopen: 'کردنەوەی دووبارە',
      reopen_dispute: 'کردنەوەی دووبارە',
      close: 'داخستنی کەیس',
    },
    roles: {
      operations_admin: 'بەڕێوەبەری ناوەندی',
      case_manager: 'بەڕێوەبەری کەیس',
      support_agent: 'کارمەندی هاوکاری',
      privacy_officer: 'بەرپرسی نهێنی',
      auditor: 'چاودێر',
      owner: 'خاوەن',
      admin: 'سەرپەرشتیاری تیم',
      analyst: 'پێداچوونەوەر',
      viewer: 'تەنها خوێندنەوە',
      customer: 'بەکارهێنەر',
      staff: 'ستاف',
    },
    sla: {
      completed: 'تەواوبوو',
      on_track: 'لە کاتی خۆیدایە',
      due_soon: 'پێویستی بە وەڵامە',
      overdue: 'پێویستی بە سەرنجە',
    },
    priorityBadges: {
      high_priority: 'گرنگی بەرز',
      urgent: 'بەپەلە',
    },
    thresholdPresets: {
      strict: 'ئاگادارکردنەوەی دواکەوتن: ١٢ / ٢٤ کاتژمێر',
      standard: 'ئاگادارکردنەوەی دواکەوتن: ٢٤ / ٤٨ کاتژمێر',
      relaxed: 'ئاگادارکردنەوەی دواکەوتن: ٤٨ / ٧٢ کاتژمێر',
    },
    phases: {
      investigation: {
        label: 'پشکنینی بەڵگە',
        desc: 'ئێمە لینک و وێنە و بەڵگەکانی خاوەندارێتی دەپشکنین.',
      },
      submission: {
        label: 'ناردنی سکاڵا',
        desc: 'داواکاریی فەرمی بۆ پلاتفۆرمەکە دەنێرین.',
      },
      pending_verification: {
        label: 'چاوەڕوانی پلاتفۆرم',
        desc: 'بەدواداچوون دەکەین و دەپشکنین ئایا ناوەڕۆکەکە لابراوە.',
      },
      resolved: {
        label: 'تەواوبوو',
        desc: 'ئەنجامەکە پشکنرا و کۆتا ڕاپۆرت بۆ تۆ پاشەکەوت کرا.',
      },
    },
    journeyMilestones: {
      submission: { label: 'نێردرا', shortLabel: 'نێردرا' },
      investigation: { label: 'پشکنینی تیم', shortLabel: 'پشکنین' },
      platform_action: { label: 'ڕاگەیەندرا', shortLabel: 'ناردن' },
      verification: { label: 'پشتڕاستکرایەوە', shortLabel: 'تەواو' },
      completed: 'تەواوبوو',
      actionNeeded: 'وەڵام پێویستە',
      inProgress: 'لە کارکردندایە',
      pending: 'هەنگاوی دواتر',
    },
    activityCategories: {
      all: 'هەمووی',
      case_workflow: 'کەیس و فایل',
      payment_billing: 'پارەدان',
      security_role: 'تیم و دەسەڵات',
      support_privacy: 'هاوکاری و نهێنی',
      system_modification: 'سیستەم',
    },
    activityShortTone: {
      case_workflow: 'کەیس',
      payment_billing: 'پارەدان',
      security_role: 'دەسەڵات',
      support_privacy: 'هاوکاری',
      system_modification: 'سیستەم',
    },
    login: {
      backHome: 'گەڕانەوە بۆ سەرەکی',
      portalTag: 'پۆرتاڵی تایبەتی بەکارهێنەر',
      eyebrow: 'چوونەژوورەوە',
      title: 'بەخێربێیتەوە بۆ Full Remove',
      subtitle:
        'سەیری کەیسە کراوەکانت بکە، بەڵگەکان بە پارێزراوی باربکە، پسوڵەکان ببینە، و بە کۆدێکی یەکجارەکی قسە لەگەڵ تیمەکە بکە.',
      emailLabel: 'ئیمەیڵەکەت',
      emailPlaceholder: 'you@example.com',
      sendCode: 'ناردنی کۆدی چوونەژوورەوە',
      sendingCode: 'دەنێردرێت...',
      codeSentToast: (email) => `کۆدێکی یەکجارەکی بۆ ${email} دروستکرا.`,
      devCodePrefix: 'کۆدی چوونەژوورەوەت:',
      codeLabel: 'کۆدی ٦ ژمارەیی',
      signInBtn: 'چوونە ناو شوێنکار',
      signingInBtn: 'دەچێتەژوورەوە...',
      changeEmail: 'گۆڕینی ئیمەیڵ',
      networkErrorStart: 'پەیوەندی بە سێرڤەرەوە نەکرا. تکایە دووبارە هەوڵبدە.',
      networkErrorVerify: 'پشکنینی کۆد سەرکەوتوو نەبوو. دووبارە هەوڵبدە.',
      codeSendFailed: 'ناردنی کۆد سەرکەوتوو نەبوو.',
      codeInvalid: 'ئەم کۆدە هەڵەیە یان بەسەرچووە.',
      demoFailed: 'کردنەوەی هەژماری نموونەیی سەرکەوتوو نەبوو.',
      demoNetworkError: 'هەڵەی پەیوەندی لە کردنەوەی نموونە.',
      demoEyebrow: 'تاقیکردنەوەی خێرا',
      demoTitle: 'شوێنکارێکی نموونەیی تاقیبکەرەوە',
      demoSubtitle:
        'هەژمارێکی ئامادە بکەرەوە بۆ بینینی شوێنکاری بەکارهێنەر، پانێڵی تیم، یان بەڕێوەبردنی ناوەندی.',
      demoCustomerTitle: 'نموونەی بەکارهێنەر (sara@example.com)',
      demoCustomerDesc: 'کەیسەکان، فایلەکان، پارەدان و نامەکان',
      demoStaffTitle: 'نموونەی پانێڵی تیم (ops@fremove.com)',
      demoStaffDesc: 'کەیسەکان، نامەکانی ماڵپەڕ و ڕاپۆرتەکان',
      demoAdminTitle: 'نموونەی بەڕێوەبردنی ناوەندی',
      demoAdminDesc: 'پوختەی گشتی، چالاکی ڕاستەوخۆ و ڕۆڵەکان',
      securityNote: 'چوونەژوورەوەکەت بە تۆکنی واژۆکراو و کوکی پارێزراو پارێزگاری لێدەکرێت.',
    },
    workspace: {
      roleLabel: 'شوێنکاری بەکارهێنەر',
      breadcrumbRoot: 'شوێنکار',
      switchToStaff: 'کردنەوەی پانێڵی تیم',
      openMenu: 'کردنەوەی لیست',
      newCaseBtn: '+ کەیسی نوێ',
      loadingText: 'شوێنکارەکەت دەکرێتەوە...',
      loadError: 'کردنەوەی شوێنکار سەرکەوتوو نەبوو.',
      nav: {
        overview: 'پوختە',
        cases: 'کەیسەکانم',
        submit: 'داواکاری نوێ',
        packages: 'خزمەتگوزارییەکان',
        billing: 'پارەدان',
        support: 'یارمەتی و هاوکاری',
        notifications: 'ئاگادارکردنەوە',
        account: 'هەژمار و نهێنی',
      },
      summary: {
        title: 'پوختەی کەیسەکان',
        subtitle: 'کەیسە کراوەکانت و تێکڕای کاتی وەڵامدانەوە بە خێرایی.',
        resolutionRate: 'تەواوبوو:',
        ofTotal: (resolved, total) => `${resolved} لە ${total}`,
        activeCasesLabel: 'کەیسە کراوەکان',
        outOfTotal: (total) => `لە کۆی ${total} کەیس`,
        awaitingReply: (n) => `${n} چاوەڕوانی وەڵامی تۆن`,
        avgTimeLabel: 'تێکڕای کات',
        acrossSubmissions: (total) => `تێکڕای کات لە ${total} کەیسدا`,
        resolvedAvg: (val) => `تێکڕای تەواوبووەکان: ${val}`,
      },
      kpis: {
        total: { label: 'هەموو کەیسەکان', note: 'کۆی داواکارییەکانت' },
        inProgress: { label: 'لە کارکردندایە', note: 'لای تیم یان پلاتفۆرم' },
        needsAttention: { label: 'وەڵامی تۆی دەوێت', note: 'پێویستی بە زانیاری زیادەیە' },
        resolved: { label: 'تەواوبوو', note: 'پشکنراو و داخراو' },
      },
      search: {
        overviewPlaceholder: 'گەڕان بە ژمارەی کەیس (نموونە: FR-2026-1038) یان پلاتفۆرم...',
        casesPlaceholder: 'گەڕان بە ژمارەی کەیس، ناونیشان، یان پلاتفۆرم...',
        activeOnly: 'تەنها کەیسە کراوەکان',
        allCases: 'هەموو کەیسەکان',
        allStatuses: 'هەموو دۆخەکان',
        shownCount: (shown, total) => `پیشاندانی ${shown} لە ${total}`,
        noMatch: (q) => `هیچ کەیسێک لەگەڵ "${q}" نەگونجا.`,
        sortNewest: 'نوێترین یەکەم',
        sortOldest: 'کۆنترین یەکەم',
        sortCaseAz: 'ژمارەی کەیس A–Z',
        sortStatus: 'بەپێی دۆخ',
      },
      overview: {
        activeCasesTitle: 'کەیسەکانت',
        recentUpdatesTitle: 'دوایین نوێکارییەکان',
        noActivityYet: 'هێشتا هیچ نوێکارییەک نییە.',
      },
      tracker: {
        detailEyebrow: 'قۆناغی ئێستا',
        overviewTitle: 'پێشکەوتنی کەیس و تۆماری کاتی',
        overviewSubtitle: 'هەموو هەنگاوەکان لە پشکنینی بەڵگەوە تا پشتڕاستکردنەوەی کۆتایی ببینە.',
        liveActive: 'نوێکاری ڕاستەوخۆ چالاکە',
        reconnecting: 'پەیوەندیکردنەوە...',
        connecting: 'پەیوەندی دەبەسترێت...',
        syncedAt: (t) => `نوێکرایەوە ${t} UTC`,
        oldestFirst: 'کۆنترین ← نوێترین',
        newestFirst: 'نوێترین یەکەم',
        emptyText: 'داواکارییەکی نوێ بنێرە بۆ شوێنکەوتنی هەموو هەنگاوەکان لێرە.',
        activityLogTitle: 'تۆماری هەنگاوەکان',
        eventsCount: (n) => `${n} نوێکاری`,
        showFewer: 'کەمتر پیشان بدە',
        showAllEvents: (n) => `بینینی هەموو ${n} نوێکارییەکە`,
        noEvents: 'هێشتا هیچ نوێکارییەک تۆمار نەکراوە.',
        pendingOver: (duration, hours) => `چاوەڕوانە ${duration} (زیاتر لە ${hours} کاتژمێر)`,
        journeyHeading: 'ڕێڕەوی کەیس لە سەرەتاوە تا کۆتایی',
      },
      alerts: {
        ariaLabel: 'ئاگادارکردنەوەی کەیس',
        urgentInput: 'وەڵام پێویستە',
        resolved: 'تەواوبوو',
        statusAlerts: 'ئاگادارییەکان',
        popoverTitle: 'نوێکاری کەیسەکان',
        popoverSummary: (u, r) => `${u} چاوەڕوانی تۆیە · ${r} تەواوبوو`,
        resolvedNote: 'پشکنرا و تەواوکرا',
        emptyAlerts: 'هەموو شتێک ڕێکە — هیچ ئاگادارییەکی بەپەلە نییە.',
        unreadCount: (n) => `${n} ئاگاداری نەخوێندراوە`,
        viewAllAlerts: 'بینینی هەموو ئاگادارییەکان',
        viewResolution: 'بینینی ئەنجام',
        replyNow: 'ئێستا وەڵام بدەرەوە',
        dismiss: 'لابردن',
        removedBadge: 'سڕینەوە پشتڕاستکرایەوە',
        removedTitle: 'ناوەڕۆک بە سەرکەوتوویی لابرا',
        removedBannerDesc: 'لابردنی ناوەڕۆک پشتڕاستکرایەوە. بڕوانامەی داخستنەکەت ئامادەیە بۆ داگرتن.',
      },
      casesTable: {
        caseNum: 'کەیس #',
        subject: 'ناونیشان',
        platform: 'پلاتفۆرم',
        files: 'فایلەکان',
        journey: 'پێشکەوتن',
        status: 'دۆخ',
        response: 'کات',
      },
      submitForm: {
        title: 'دەستپێکردنی کەیسی نوێ',
        subtitle:
          'لینکەکە بنێرە و پێمان بڵێ چی ڕوویداوە. دەتوانیت ڕاستەوخۆ دوای دروستکردن وێنە و بەڵگە باربکەیت.',
        caseTitleLabel: 'ناونیشانی کورت',
        caseTitlePlaceholder: 'نموونە: هەژماری ساختە بە ناوی من لە ئینستاگرام',
        platformLabel: 'ئەپ یان ماڵپەڕ',
        platformPlaceholder: 'Instagram، TikTok، ماڵپەڕ...',
        urlLabel: 'لینکی ناوەڕۆکەکە',
        categoryLabel: 'جۆری کێشەکە چییە؟',
        categories: {
          impersonation: 'هەژماری ساختە یان بەکارهێنانی ناو',
          deepfake: 'دیپفەیک یان دەستکاری زیرەکی دەستکرد',
          extortion: 'هەڕەشە و ڕەشبگیری',
          copyright: 'وێنە یان کاری دزراو',
          privacy: 'بڵاوکردنەوەی زانیاری یان وێنەی تایبەت',
          harassment: 'گێچەڵ یان پۆستی زیانبەخش',
          other: 'کێشەی تری ناوەڕۆک',
        },
        detailsLabel: 'ڕوونکردنەوەی ڕووداوەکە',
        detailsPlaceholder: 'وردەکاری پێویست بنووسە تا تیمەکەمان خێراتر پشکنینی بۆ بکات...',
        submitBtn: 'ناردنی داواکاری',
        readinessEyebrow: 'پشکنینی ئامادەیی',
        targetSla: 'یەکەم پێداچوونەوە',
        whereWeReport: 'شوێنی سکاڵا',
        suggestedService: 'خزمەتگوزاری گونجاو',
        checklistTitle: 'چی زیاتر یارمەتیدەرە',
        createdBanner: (caseNum) => `کەیسی ${caseNum} دروستکرا. ئێستا دەتوانیت وێنە و بەڵگە باربکەیت.`,
        createFailed: 'دروستکردنی کەیس سەرکەوتوو نەبوو. تکایە ناونیشان و لینک بپشکنە.',
      },
      packagesTab: {
        formTitle: 'دیاریکردنی خزمەتگوزاری بۆ کەیسێک',
        attachBtn: 'دروستکردنی پسوڵە',
        firstReview: (h) => `یەکەم پشکنین لە ماوەی ${h} کاتژمێردا`,
        selectBtn: 'هەڵبژاردن',
        invoiceGenerated: (invNum, amt) => `پسوڵەی ${invNum} بە بڕی ${amt} ئامادەکرا.`,
      },
      billingTab: {
        cardTitle: 'پارەدان بە کارت',
        autoVerified: 'پشتڕاستکردنەوەی خێرا',
        selectUnpaidInvoice: 'پسوڵەیەکی نەدراو هەڵبژێرە',
        cardHolderPlaceholder: 'ناوی سەر کارت',
        cardLast4Placeholder: '٤ ژمارەی کۆتایی (نموونە: 4242)',
        payNowBtn: 'ئێستا پارە بدە',
        payingBtn: 'جێبەجێ دەکرێت...',
        manualTitle: 'حەواڵەی بانکی یان پارەدانی دەستی',
        selectInvoice: 'پسوڵە هەڵبژێرە',
        methods: {
          bank_transfer: 'حەواڵەی بانکی / FIB',
          cash: 'پسوڵەی کاش لە نووسینگە',
          manual: 'کۆدی پسوڵەی تر',
        },
        receiptCodePlaceholder: 'کۆدی پسوڵە یان ژمارەی حەواڵە',
        submitProofBtn: 'ناردنی بەڵگەی پارەدان',
        searchPlaceholder: 'گەڕان لە پسوڵەکان...',
        sortNewest: 'نوێترین یەکەم',
        sortAmountHigh: 'بەرزترین بڕ',
        sortAmountLow: 'نزمترین بڕ',
        sortStatus: 'دۆخ',
        cols: {
          invoice: 'پسوڵە',
          caseNum: 'کەیس #',
          service: 'خزمەتگوزاری',
          amount: 'بڕ',
          status: 'دۆخ',
          receipt: 'پسوڵە',
        },
        viewPrint: 'بینین / چاپ',
        statementEyebrow: 'پسوڵەی Full Remove',
        billedAccount: 'هەژماری بەکارهێنەر',
        statusDate: 'دۆخ و بەروار',
        printBtn: 'چاپکردنی پسوڵە',
        cardSuccess: (ref, invNum) => `پارەدان پەسەندکرا (${ref}) — ${invNum} ئێستا دراوە.`,
        manualSuccess: (ref) => `پسوڵەی ${ref} بۆ تیمی پێداچوونەوە نێردرا.`,
      },
      supportTab: {
        formTitle: 'پرسیار لە تیمەکەمان بکە',
        subjectPlaceholder: 'چۆن دەتوانین یارمەتیت بدەین؟',
        categories: {
          takedown: 'پرسیار لەسەر کەیس',
          billing: 'پارەدان و پسوڵەکان',
          general: 'پرسیاری گشتی',
        },
        priorities: {
          normal: 'ئاسایی',
          high: 'بەپەلە',
        },
        msgPlaceholder: 'نامەکەت لێرە بنووسە...',
        createBtn: 'ناردنی نامە',
        replyPlaceholder: 'وەڵام بنووسە...',
        replyBtn: 'ناردن',
        emptyTickets: 'هێشتا هیچ داواکاری هاوکاری نییە.',
        createdBanner: (tNum) => `داواکاری هاوکاری ${tNum} نێردرا.`,
        replyPosted: 'وەڵامەکەت نێردرا.',
      },
      notificationsTab: {
        title: (unread) => `ئاگادارکردنەوەکان (${unread} نەخوێندراوە)`,
        markAllRead: 'هەمووی وەک خوێندراو دیاری بکە',
        markRead: 'وەک خوێندراو',
        empty: 'هیچ ئاگادارکردنەوەیەک نییە.',
      },
      accountTab: {
        profileTitle: 'زانیاری پەیوەندی و ناسنامە',
        fullNamePlaceholder: 'ناوی تەواو',
        phonePlaceholder: 'ژمارەی مۆبایل یان واتساپ',
        idDocPlaceholder: 'ناوی فایلی ناسنامە (ئارەزوومەندانە، وەک passport.pdf)',
        photoPlaceholder: 'ناوی وێنەی دڵنیاکردنەوە (ئارەزوومەندانە)',
        saveProfileBtn: 'پاشەکەوتکردنی زانیاری',
        privacyTitle: 'زانیاری و نهێنیپارێزی تۆ',
        exportJson: 'داگرتنی زانیارییەکانم (JSON)',
        requestExport: 'داوای کۆپی هەموو زانیارییەکانم',
        requestDeletion: 'داوای سڕینەوەی زانیاری هەژمارەکەم',
        notesPlaceholder: 'تێبینی بۆ تیمی نهێنی...',
        submitRequestBtn: 'ناردنی داواکاری',
        submittedTitle: 'داواکارییە نێردراوەکانی نهێنی',
        profileSaved: 'زانیارییەکانت پاشەکەوت کران.',
        requestSaved: 'داواکاری نهێنیت بۆ پێداچوونەوە نێردرا.',
      },
      caseModal: {
        tabs: {
          timeline: 'نوێکارییەکان',
          evidence: (n) => `فایلەکان (${n})`,
          messages: (n) => `نامەکان (${n})`,
        },
        timelineTitle: 'کاتبەندی کەیس',
        submissionsTitle: 'سکاڵا نێردراوەکان بۆ پلاتفۆرم',
        verificationsTitle: 'پشکنینی ئەنجام',
        uploadTitle: 'بارکردنی وێنەی شاشە یان بەڵگە',
        evTitlePlaceholder: 'ناونیشانی فایل (نموونە: وێنەی هەژمارە ساختەکە)',
        evCategories: {
          screenshot: 'وێنەی شاشە',
          ownership_proof: 'بەڵگەی خاوەندارێتی',
          identity: 'پشتڕاستکردنەوەی ناسنامە',
          correspondence: 'ئیمەیڵ و نامەکان',
          threat_log: 'بەڵگەی هەڕەشە و ڕەشبگیری',
        },
        attachFileLabel: 'فایلێک هەڵبژێرە (تا ٣ مێگابایت)',
        stagedLabel: (name, size) => `ئامادەیە: ${name} (${size})`,
        previewFile: 'پێشبینینی فایل',
        fileNamePlaceholder: 'ناوی فایل (ئارەزوومەندانە)',
        refUrlPlaceholder: 'لینکی پەیوەندیدار (ئارەزوومەندانە)',
        notePlaceholder: 'تێبینییەکی کورت بۆ تیمەکە...',
        saveEvidenceBtn: 'پاشەکەوتکردنی فایل بە پارێزراوی',
        decryptDownload: 'داگرتنی فایل',
        noEvidence: 'هێشتا هیچ فایلێک بارنەکراوە.',
        replyPlaceholder: 'نامەیەک بۆ تیمی کەیسەکەت بنووسە...',
        sendReplyBtn: 'ناردن',
        noMessages: 'هێشتا هیچ نامەیەک نییە.',
        evidenceSaved: (hash) => `فایلەکە بە پارێزراوی پاشەکەوت کرا (ناسەرەوە ${hash}).`,
        messageSent: 'نامەکەت بۆ تیمەکە نێردرا.',
      },
      previewModal: {
        eyebrow: 'پێشبینینی فایل',
        fitView: 'گونجاندن لەگەڵ شاشە',
        fullSize: 'قەبارەی تەواو',
        textContentLabel: 'ناوەڕۆکی بەڵگەنامە',
        truncatedNotice: 'پیشاندانی یەکەم ١٢٬٠٠٠ پیت',
        emptyText: '(فایلی بەتاڵ)',
        unsupportedTitle: 'پێشبینینی ڕاستەوخۆ بۆ ئەم جۆرە فایلە بەردەست نییە',
        unsupportedBody: (fileName, mime) =>
          `فایلی "${fileName}" (${mime}) ئامادەیە و بە شێوەی کۆدکراو پاشەکەوت دەکرێت کاتێک دەینێریت.`,
        securityNote: 'بە شێوەی پارێزراو و کۆدکراو هەڵدەگیرێت',
        removeFile: 'لابردنی فایل',
        closePreview: 'داخستن',
        confirmSave: 'پاشەکەوتکردن لە کەیسدا',
      },
    },
    staff: {
      brandTitle: 'Full Remove',
      consoleLabel: 'پانێڵی تیم',
      breadcrumbRoot: 'تیم',
      openCentralAdmin: 'بەڕێوەبردنی ناوەندی',
      backToWorkspace: 'دیمەنی بەکارهێنەر',
      loadingText: 'لیستی کارەکان دەکرێتەوە...',
      loadError: 'کردنەوەی پانێڵی تیم سەرکەوتوو نەبوو.',
      nav: {
        cases: 'لیستی کەیسەکان',
        inquiries: 'نامەکانی ماڵپەڕ',
        team: 'ئەندامانی تیم',
      },
      kpis: {
        total: 'هەموو کەیسەکان',
        open: 'کەیسە کراوەکان',
        waitingClient: 'چاوەڕوانی بەکارهێنەر',
        resolved: 'تەواوبوو',
      },
      filters: {
        searchPlaceholder: 'گەڕان بە ژمارەی کەیس، بەکارهێنەر، یان پلاتفۆرم...',
        assignedToMe: 'تەنها کەیسەکانم',
        sortNewest: 'نوێترین یەکەم',
        sortOldest: 'کۆنترین یەکەم',
        sortCaseAz: 'کەیس A–Z',
        sortStatus: 'دۆخ',
      },
      casesTable: {
        caseNum: 'کەیس #',
        client: 'بەکارهێنەر',
        title: 'ناونیشان',
        platform: 'پلاتفۆرم',
        owner: 'بەرپرس',
        status: 'دۆخ',
        response: 'کات',
      },
      inquiriesTable: {
        sender: 'نێردەر',
        topic: 'بابەت',
        message: 'نامە',
        status: 'دۆخ',
        actions: 'کردارەکان',
        convertBtn: 'کردنەوەی کەیس',
        caseOpened: 'کەیس کرایەوە',
        markReviewed: 'نیشانکردن وەک پشکنراو',
        convertedToast: (c) => `نامەکە بوو بە کەیسی ${c}.`,
        updatedToast: 'نامەکە نوێکرایەوە.',
      },
      teamTab: {
        inviteTitle: 'بانگهێشتکردنی هاوکار',
        emailPlaceholder: 'teammate@fremove.com',
        sendInviteBtn: 'ناردنی بانگهێشت',
        member: 'ئەندام',
        role: 'ڕۆڵ',
        status: 'دۆخ',
        manage: 'کردار',
        makeAdmin: 'بکەرە سەرپەرشتیار',
        pauseAccess: 'ڕاگرتن',
        invitedToast: (email) => `بانگهێشت نێردرا بۆ ${email}.`,
      },
      caseModal: {
        actionsTitle: 'هەنگاوەکان و بەرپرس',
        assignedTo: 'سپێردراوە بە:',
        unassignedPool: 'هێشتا نەسپێردراوە',
        draftNoticeBtn: 'ئامادەکردنی نامەی لابردن',
        actionNotePlaceholder: 'تێبینی ئارەزوومەندانە بۆ ئەم گۆڕانکارییە...',
        logSubmissionTitle: 'تۆمارکردنی زانیاری ناردن بۆ پلاتفۆرم',
        channels: {
          platform_portal: 'فۆڕمی ناو پلاتفۆرم',
          web_form: 'فۆڕمی فەرمی وێب',
          email: 'ئیمەیڵی یاسایی / سکاڵا',
        },
        extRefPlaceholder: 'ژمارەی تیکێتی پلاتفۆرم (وەک IG-99104)',
        subSummaryPlaceholder: 'پوختەی ئەوەی نێردراوە...',
        saveSubmissionBtn: 'پاشەکەوتکردن',
        submissionSaved: 'تۆماری سکاڵا پاشەکەوت کرا.',
        verifyTitle: 'پشکنینی دۆخی لینک',
        runUrlCheck: 'ئێستا لینکەکە بپشکنە',
        checkingUrl: 'دەپشکنرێت...',
        verNotesPlaceholder: 'تێبینی پشکنین...',
        saveVerifyBtn: 'پاشەکەوتی پشکنین',
        verifySaved: 'ئەنجامی پشکنین تۆمارکرا.',
        evidenceTitle: (n) => `فایلەکانی بەکارهێنەر (${n})`,
        noEvidence: 'هێشتا هیچ فایلێک نییە.',
        replyClientTitle: 'نامە بۆ بەکارهێنەر',
        replyClientPlaceholder: 'وەڵامێک کە بەکارهێنەر دەیبینێت...',
        teamNoteTitle: 'تێبینی تایبەتی تیم',
        teamNotePlaceholder: 'تەنها بۆ ستاف دیارە...',
        saveNoteBtn: 'پاشەکەوتکردن',
        noticeRecorded: (c) => `سکاڵاکە بۆ ${c} تۆمارکرا.`,
      },
      noticeModal: {
        eyebrow: 'ئامادەکاری نامەی لابردن',
        recipientDesk: 'دەنێردرێت بۆ:',
        channels: {
          platform_rights: 'بەشی سەلامەتی پلاتفۆرم',
          registrar_whois: 'هۆست یان تۆمارکەری دۆمەین',
          search_deindex: 'لابردن لە گەڕان',
          publisher_legal: 'بڵاوکەرەوەی ماڵپەڕ',
        },
        packetLabel: 'دەقی نامەکە (دەستکاریدەکرێت، لەگەڵ لیستی بەڵگەکان)',
        copyBtn: 'کۆپیکردن',
        copiedBtn: 'کۆپی کرا',
        downloadTxt: 'داگرتنی .txt',
        refPlaceholder: 'ژمارەی سەرچاوە',
        recordBtn: 'تۆمارکردن وەک نێردراو',
        recordingBtn: 'تۆمار دەکرێت...',
      },
    },
    admin: {
      brandTitle: 'بەڕێوەبردنی ناوەندی',
      breadcrumbRoot: 'ئادمین',
      openStaffConsole: 'پانێڵی تیم',
      openClientWorkspace: 'دیمەنی بەکارهێنەر',
      loadingText: 'بەڕێوەبردنی ناوەندی دەکرێتەوە...',
      loadError: 'کردنەوەی بەڕێوەبردنی ناوەندی سەرکەوتوو نەبوو.',
      nav: {
        overview: 'پوختە',
        customers: 'بەکارهێنەران',
        payments: 'پارەدانەکان',
        cases: 'کەیسەکان',
        support: 'هاوکاری',
        requests: 'داواکاری نهێنی',
        audit: 'چالاکی ڕاستەوخۆ',
        reports: 'ڕاپۆرتەکان',
        visitors: 'سەردانکەران',
        roles: 'ڕۆڵەکانی تیم',
      },
      overviewKpis: {
        customers: { label: 'بەکارهێنەران', sub: 'هەژمارە چالاکەکان' },
        cases: { label: 'هەموو کەیسەکان', sub: (att) => `${att} پێویستی بە سەرنجە · کراوە / کۆی گشتی` },
        payments: { label: 'پارەدان بۆ پشکنین', sub: 'حەواڵە چاوەڕوانکراوەکان' },
        support: { label: 'لیستی هاوکاری', sub: 'کراوە / کۆی داواکارییەکان' },
        requests: { label: 'داواکاری نهێنی', sub: 'داواکاری داگرتن یان سڕینەوە' },
        inquiries: { label: 'نامەکانی ماڵپەڕ', sub: 'نامە نوێیەکانی سەرەکی' },
      },
      broadcast: {
        title: 'ناردنی ئاگاداری بۆ بەکارهێنەران',
        allClients: 'هەموو هەژمارەکان',
        subjectPlaceholder: 'ناونیشانی ئاگاداری...',
        bodyPlaceholder: 'پەیامێکی کورت بنووسە بۆ زەنگی ئاگادارکردنەوەی بەکارهێنەر...',
        sendBtn: 'ناردنی ئاگاداری',
        sentToast: 'ئاگادارکردنەوەکە بۆ بەکارهێنەر نێردرا.',
      },
      intake: {
        title: 'دوایین نامەکانی ماڵپەڕ',
        converted: 'کەیس کرایەوە',
        convertBtn: 'کردنەوەی کەیس',
        convertedToast: 'نامەکە گۆڕدرا بۆ کەیسی چالاک.',
      },
      customersView: {
        registered: 'هەژمارە تۆمارکراوەکان',
        activeBilling: 'پسوڵە و پلانە چالاکەکان',
        needingAttention: 'کەیسە چاوەڕوانکراوەکان',
        cols: {
          organization: 'بەکارهێنەر / شوێنکار',
          contact: 'ئیمەیڵ',
          cases: 'کەیس',
          invoices: 'پسوڵە',
          access: 'دۆخ',
          actions: 'کردارەکان',
        },
        profileBtn: 'وردەکاری',
        viewCasesBtn: 'کەیسەکان',
        restoreBtn: 'چالاککردنەوە',
        suspendBtn: 'ڕاگرتن',
      },
      paymentsView: {
        cols: {
          invoiceRef: 'پسوڵە و ژمارە',
          client: 'بەکارهێنەر',
          amount: 'بڕ',
          status: 'دۆخ',
          decision: 'پشکنین و بڕیار',
        },
        notePlaceholder: 'تێبینی کورت...',
        approveBtn: 'پەسەندکردن',
        rejectBtn: 'ڕەتکردنەوە',
      },
      casesView: {
        searchPlaceholder: 'گەڕان بە ژمارەی کەیس، بەکارهێنەر، پلاتفۆرم...',
        clearOrgFilter: (org) => `سڕینەوەی فلتەر (${org})`,
        cols: {
          caseNum: 'کەیس #',
          client: 'بەکارهێنەر',
          subject: 'ناونیشان',
          platform: 'پلاتفۆرم',
          owner: 'بەرپرس',
          status: 'دۆخ',
          response: 'کات',
        },
      },
      supportView: {
        cols: {
          ticket: 'تیکێت #',
          client: 'بەکارهێنەر',
          subject: 'بابەت',
          priority: 'گرنگی',
          status: 'دۆخ',
        },
      },
      requestsView: {
        cols: {
          client: 'بەکارهێنەر',
          type: 'جۆر',
          notes: 'تێبینی',
          status: 'دۆخ',
          action: 'کردار',
        },
        notePlaceholder: 'تێبینی...',
        completeBtn: 'تەواوکرا',
      },
      reportsView: {
        startDate: 'لە بەرواری',
        endDate: 'تا بەرواری',
        approvedRevenue: 'کۆی گشتی پەسەندکراو',
        exportCsv: 'داگرتنی CSV',
      },
      visitorsView: {
        liveSummary: (online, rpm, country) =>
          `${online} ئێستا سەرهێڵن · ${rpm} بینین/خولەک · زۆرترین وڵات: ${country}`,
        last7Days: '٧ ڕۆژی ڕابردوو',
        last30Days: '٣٠ ڕۆژی ڕابردوو',
        sessions: 'سەردانەکان',
        uniqueVisitors: 'سەردانکەران',
        pageViews: 'بینینی پەڕەکان',
        conversions: 'نامەی نێردراو',
        trafficTitle: 'هاتوچۆ لە کاتژمێری ڕابردوودا',
        cols: {
          session: 'کۆدی سەردان',
          location: 'شوێن',
          device: 'ئامێر و وێبگەڕ',
          pages: 'یەکەم ← کۆتا پەڕە',
          views: 'بینین',
          inquiry: 'نامە',
        },
        convertedTag: 'نێردرا',
      },
      rolesView: {
        formTitle: 'زیادکردن یان نوێکردنەوەی ڕۆڵ',
        emailPlaceholder: 'team@fremove.com',
        assignBtn: 'پاشەکەوتکردنی ڕۆڵ',
        cols: {
          email: 'ئیمەیڵ',
          role: 'ڕۆڵ',
          status: 'دۆخ',
          manage: 'کردار',
        },
        activate: 'چالاککردن',
        suspend: 'ڕاگرتن',
      },
      profileModal: {
        eyebrow: 'وردەکاری بەکارهێنەر',
        email: 'ئیمەیڵ',
        phone: 'مۆبایل',
        workspace: 'شوێنکار',
        idDoc: 'فایلی ناسنامە',
      },
      caseModal: {
        statusControl: 'گۆڕینی دۆخ',
        updateStatusBtn: 'نوێکردنەوەی دۆخ',
        ownerTitle: 'بەرپرسی کەیس',
        assignBtn: 'پاشەکەوتی بەرپرس',
        replyTitle: 'وەڵام بۆ بەکارهێنەر',
        replyPlaceholder: 'پەیامێکی دیار بۆ بەکارهێنەر...',
        sendBtn: 'ناردنی وەڵام',
        privateNoteTitle: 'تێبینی ناوخۆیی',
        privateNotePlaceholder: 'تێبینی تایبەتی تیم...',
        saveNoteBtn: 'پاشەکەوت',
        filingTitle: 'تۆمارکردنی سکاڵای پلاتفۆرم',
        refPlaceholder: 'ژمارە (وەک META-9421)',
        filingNotePlaceholder: 'چی نێردرا...',
        saveFilingBtn: 'پاشەکەوتی سکاڵا',
        verifyTitle: 'پشتڕاستکردنەوەی ئەنجام',
        verifyNotePlaceholder: 'تێبینی پشکنین...',
        saveVerifyBtn: 'پاشەکەوتی پشکنین',
        evidenceTitle: (n) => `فایلە بارکراوەکان (${n})`,
      },
      ticketModal: {
        replyPlaceholder: 'وەڵام بۆ بەکارهێنەر...',
        sendReply: 'ناردنی وەڵام',
        notePlaceholder: 'تێبینی تایبەتی تیم...',
        saveNote: 'پاشەکەوت',
        saveStatus: 'نوێکردنەوەی دۆخ',
      },
      activityLog: {
        title: 'تۆماری چالاکی ڕاستەوخۆ',
        connected: 'پەیوەندی ڕاستەوخۆ چالاکە',
        reconnecting: 'پەیوەندیکردنەوە...',
        connecting: 'پەیوەندی دەبەسترێت...',
        disconnected: 'پەیوەندی پچڕا',
        operatorsOnline: (n) => `${n} کەس سەرهێڵە`,
        pause: 'وەستان',
        resume: 'بەردەوامبوون',
        resumeQueued: (n) => `بەردەوامبوون (${n} نوێ)`,
        fullLog: 'تۆماری تەواو',
        searchPlaceholder: 'گەڕان بە ناو، کردار، یان بابەت...',
        emptyText: 'هیچ چالاکییەک لەگەڵ فلتەرەکە ناگونجێت.',
        cols: {
          time: 'کات',
          area: 'بەش',
          summary: 'چی ڕوویدا',
          by: 'لەلایەن',
          item: 'بابەت',
          client: 'بەکارهێنەر',
        },
        details: {
          eventId: 'کۆدی ڕووداو',
          timestamp: 'کات (UTC)',
          actor: 'ئەنجامدەر',
          target: 'ئامانج',
        },
      },
    },
    enhancements: {
      quickJump: {
        buttonLabel: 'بازدانی خێرا',
        title: 'بازدانی خێرا لە پۆرتاڵدا',
        placeholder: 'ناوی بەش، کۆدی کەیس (وەک FR-2026-1041)، یان پلاتفۆرم بنووسە...',
        empty: 'هیچ بەش یان کەیسێکی گونجاو نەدۆزرایەوە.',
        sectionsLabel: 'بەشەکان',
        casesLabel: 'کەیسەکان',
        hint: 'تیرەکان و Enter بەکاربهێنە · Esc بۆ داخستن',
      },
      templates: {
        heading: 'قاڵبی خێرا',
        subtitle: 'جۆرێک هەڵبژێرە بۆ پڕکردنەوەی خێرای جۆری سکاڵا و وردەکارییەکان.',
        checklistTitle: 'پشکنینی ئامادەیی داواکاری',
        checkUrlOk: 'شێوازی بەستەری ڕاستەوخۆ دروستە',
        checkUrlTodo: 'بەستەرێکی تەواو بنووسە کە بە https:// دەست پێبکات',
        checkDescOk: 'ڕوونکردنەوەکە وردەکاری پێویستی تێدایە',
        checkDescTodo: 'لانی کەم ١٥ پیت دەربارەی کێشەکە بنووسە',
        checkProofTip: 'دوای ناردن، وێنەی شاشە یان بەڵگەی خاوەندارێتی باربکە بۆ پشکنینی خێراتر.',
        items: {
          impostor: {
            label: 'هەژماری ساختە / خۆناساندن',
            sampleTitle: 'هەژماری ساختە ناو و وێنەکانم بەکاردەهێنێت',
            sampleDesc:
              'ئەم هەژمارە وێنەکانمی کۆپی کردووە و بە ناوی منەوە پەیام بۆ خەڵک دەنێرێت.',
          },
          private_media: {
            label: 'وێنە یان ڤیدیۆی تایبەت',
            sampleTitle: 'بڵاوکردنەوەی وێنە یان ڤیدیۆی تایبەت بێ ڕەزامەندی',
            sampleDesc:
              'میدیای کەسیی تایبەتم لەم کەناڵە یان پەڕەیە بێ ڕەزامەندیی خۆم بڵاوکراوەتەوە.',
          },
          deepfake: {
            label: 'ناوەڕۆکی زیرەکی دەستکرد',
            sampleTitle: 'ڤیدیۆ یان وێنەی دەستکاریکراوی AI بە ڕوخسارم',
            sampleDesc:
              'ئەم پۆستە دەستکاری زیرەکی دەستکرد بۆ ڕوخسار یان دەنگم بەکاردەهێنێت بێ مۆڵەت.',
          },
          brand_clone: {
            label: 'ماڵپەڕی ساختە / لاساییکردنەوە',
            sampleTitle: 'ماڵپەڕی ساختە ناو و براندی کارەکەمان بەکاردەهێنێت',
            sampleDesc:
              'ئەم ماڵپەڕە لۆگۆ و شێوازی فرۆشگاکەمانی کۆپی کردووە بۆ هەڵخەڵەتاندنی سەردانکەران.',
          },
          copyright: {
            label: 'مافی لەبەرگرتنەوە / کاری دزراو',
            sampleTitle: 'دووبارە بڵاوکردنەوەی وێنە یان بەرهەمی ڕەسەن بێ مۆڵەت',
            sampleDesc:
              'کاری داهێنەرانەی خۆم لێرە بێ ڕەزامەندی کۆپی کراوە و بڵاوکراوەتەوە.',
          },
        },
      },
      certificate: {
        downloadBtn: 'بڕوانامەی داخستن (PDF)',
        printableBtn: 'بڕوانامەی فەرمی پشتڕاستکردنەوە',
        copySealBtn: 'کۆپیکردنی کۆدی مۆر',
        sealCopied: 'کۆپی کرا',
        printNowBtn: 'چاپکردنی بڕوانامە',
        sealCodeLabel: 'کۆدی پشتڕاستکردنەوەی گشتی',
        mirrorSummaryLabel: 'بەستەرە لابراوەکان',
        verifyOnlineHint: 'لە هەر کاتێکدا لە /verify دڵنیاببەوە',
        title: 'پوختەی فەرمی لابردن و پشتڕاستکردنەوە',
        subtitle: 'دەرچوو لە تۆمارەکانی پشتڕاستکردنەوەی Full Remove',
        caseNumber: 'کۆدی کەیس',
        client: 'کڕیار',
        platform: 'پلاتفۆرم',
        targetUrl: 'بەستەری ئامانج',
        status: 'دۆخی ئێستا',
        submitted: 'نێردراوە لە',
        updated: 'دوایین نوێکردنەوە',
        filingHeader: 'تۆماری ناردن بۆ پلاتفۆرم',
        verificationHeader: 'دوایین پشکنینی بەستەر',
        evidenceHeader: 'بەڵگە ئەرشیفکراوەکان (SHA-256)',
        noFiling: 'هێشتا هیچ ناردنێکی دەرەکی تۆمار نەکراوە.',
        noVerification: 'هێشتا پشکنینی ڕاستەوخۆی بەستەر ئەنجام نەدراوە.',
        noEvidence: 'هیچ فایلێکی بەڵگە هاوپێچ نەکراوە.',
        toastDownloaded: (caseNumber) => `بڕوانامەی PDF بۆ ${caseNumber} پاشەکەوت کرا.`,
        downloadReportBtn: 'داگرتنی ڕاپۆرت',
        evidenceReportTitle: 'ڕاپۆرتی بەڵگەکانی کەیس و پشتڕاستکردنەوەی فەرمی',
        workspaceReportTitle: 'دۆسیەی گشتی بەڵگە و کەیسەکان',
        generatedAt: 'دەرچوو لە',
        caseDescription: 'پوختەی کەیس',
        evidenceCountLabel: (n) => `${n} بەڵگەی تۆمارکراو`,
        evidenceColItem: 'بەڵگە و تێبینی',
        evidenceColCategory: 'جۆر',
        evidenceColIntegrity: 'دڵنیایی و شفرەکردن',
        evidenceColRecorded: 'کاتی تۆمارکردن',
        encryptedVaultLabel: 'قاسەی AES-256-GCM',
        metadataOnlyLabel: 'تۆماری داتا',
        casesCountLabel: (n) => `${n} دۆسیە`,
      },
      watchlist: {
        label: 'چاودێری بەستەر',
        active: 'لەژێر چاودێریدایە',
        paused: 'چاودێری وەستاوە',
        enableBtn: 'چالاککردنی چاودێری بەستەر',
        pauseBtn: 'وەستاندنی چاودێری',
        activeNote: 'تیمەکە بەردەوام چاودێری ئەم بەستەرە دەکات بۆ دڵنیابوون لە مانەوەی لابردنەکە.',
      },
      queueFilters: {
        all: 'هەموو',
        open: 'کراوەکان',
        submitted: 'نوێ',
        reviewing: 'لە پشکنیندایە',
        needs_information: 'زانیاری پێویستە',
        submitted_to_platform: 'لای پلاتفۆرم',
        resolved: 'تەواوبوو',
        watched: 'لیستی چاودێری',
        sortUrgentSla: 'بەپەلەترین SLA یەکەم',
        exportCsv: 'هەناردەی CSV',
        selectedCount: (n) => `${n} هەڵبژێردراوە`,
        assignMe: 'بیدە بە خۆم',
        startReview: 'دەستپێکردنی پشکنین',
        toggleWatch: 'گۆڕینی چاودێری',
        clearSelection: 'پاککردنەوە',
        bulkUpdated: (n) => `${n} کەیس نوێکرایەوە.`,
        selectAll: 'هەڵبژاردنی هەموو کەیسە پیشاندراوەکان',
      },
      recheck: {
        toggleBtn: 'گەڕانەوەی ناوەڕۆک ڕابگەیەنە / داوای پشکنینەوەی دووبارە',
        title: 'داواکردنی پشکنینی دووبارە',
        subtitle: 'ئەگەر لینکەکە دووبارە کارا بووەوە یان کۆپی هاوشێوە بڵاوکرایەوە، تیمەکەمان بەخێرایی دەیپشکنێتەوە.',
        reasonLabel: 'چی ڕوویداوە؟',
        reasonPlaceholder: 'ڕوونیکەرەوە بۆچی ئەم کەیسە پێویستی بە پشکنینی دووبارەیە (لانی کەم ٨ پیت)...',
        urlLabel: 'لینکی نوێ یان گەڕاوە (ئارەزوومەندانە)',
        urlPlaceholder: 'https://...',
        submitBtn: 'ناردنی داواکاری پشکنینی دووبارە',
        submittingBtn: 'دەنێردرێت...',
        successBanner: (caseNumber) => `پشکنینی دووبارە بۆ ${caseNumber} کرایەوە و چاودێری چالاککرا.`,
      },
      watchlistSweep: {
        runBtn: 'پشکنینی گشتیی لیستی چاودێری',
        runningBtn: 'لینکەکان دەپشکنرێن...',
        monitoredCount: (n) => `${n} چاودێریکراو`,
        summaryBanner: (checked, removed, online, flagged) =>
          `${checked} لینکی چاودێریکراو پشکنرا: ${removed} لابراوە، ${online} هێشتا ماوە${flagged > 0 ? ` (${flagged} ئاگاداری گەڕانەوە)` : ''}.`,
      },
      quickReplies: {
        heading: 'وەڵامە خێراکان:',
        items: [
          {
            id: 'docs_needed',
            label: 'بەڵگەی خاوەندارێتی',
            text: 'تکایە ناسنامە یان بەڵگەی ڕوونی خاوەندارێتی لە بەشی فایلەکان باربکە بۆ تەواوکردنی سکاڵاکە.',
          },
          {
            id: 'filed_platform',
            label: 'نێردرا بۆ پلاتفۆرم',
            text: 'ڕاپۆرتی فەرمیی لابردنمان بۆ تیمی پلاتفۆرمەکە نارد و بەدواداچوون بۆ وەڵامەکە دەکەین.',
          },
          {
            id: 'verify_removed',
            label: 'لابردن پشتڕاستکرایەوە',
            text: 'هەواڵێکی خۆش — پشکنینی ڕاستەوخۆ پشتڕاستی کردەوە کە ناوەڕۆکەکە چیتر لەسەر هێڵ نەماوە.',
          },
          {
            id: 'recheck_started',
            label: 'پشکنینی دووبارە دەستیپێکرد',
            text: 'کەیسەکەتمان بۆ پشکنینی بەپەلەی دووبارە کردەوە و چاودێری بەردەوامی لینکمان چالاک کرد.',
          },
        ],
      },
      analytics: {
        title: 'شیکاری پلاتفۆرم و جۆرەکان',
        subtitle: 'ڕێژەی تەواوبوون، کەیسە چالاکەکان، پابەندبوون بە کات، و تێکڕای ماوە بۆ هەر پلاتفۆرمێک.',
        slaCompliance: 'پابەندبوون بە SLA',
        watchedLinks: 'لینکی چاودێریکراو',
        overdueCases: 'کەیسە دواکەوتووەکان',
        resolutionRate: 'ڕێژەی چارەسەر',
        byPlatform: 'کەیسەکان بەپێی پلاتفۆرم',
        byCategory: 'کەیسەکان بەپێی جۆر',
        platformCol: 'پلاتفۆرم',
        totalCol: 'کۆ',
        resolvedCol: 'تەواوبوو',
        rateCol: 'ڕێژە %',
        avgTurnaroundCol: 'تێکڕای کات',
        exportPlatformCsv: 'هەناردەی CSV پلاتفۆرمەکان',
        emptyText: 'لەم ماوەیەدا هیچ کەیسێک نییە.',
      },
      verifyPage: {
        backHome: 'گەڕانەوە بۆ سەرەتا',
        eyebrow: 'پشکنینی گشتی تۆمار',
        title: 'پشتڕاستکردنەوەی مۆری بڕوانامەی Full Remove',
        subtitle: 'کۆدی مۆرەکە (وەک FR-SEAL-1022A4) یان کۆدی کەیس بنووسە بۆ بینینی دۆخی لابردن بێ ئاشکراکردنی زانیاری کەسی.',
        placeholder: 'کۆدی مۆر بنووسە (نموونە: FR-SEAL-1022A4)',
        verifyBtn: 'پشتڕاستکردنەوە',
        verifyingBtn: 'دەپشکنرێت...',
        privacyNote: 'ناوی کڕیار، ئیمەیڵ و بەڵگە تایبەتەکان بە نهێنی دەپارێزرێن.',
        validBadge: 'تۆماری فەرمی و پشتڕاستکراوی Full Remove',
        caseNumber: 'کۆدی کەیس',
        platform: 'پلاتفۆرم',
        status: 'دۆخی کەیس',
        submittedAt: 'کرایەوە لە',
        latestCheck: 'دوایین پشکنین',
        mirrorsLabel: 'بەستەرە لابراوەکان',
        mirrorsCount: (removed, total) => `${removed} لە ${total} لابراون`,
        notFoundTitle: 'هیچ تۆمارێکی هاوتا نەدۆزرایەوە',
        notFoundBody: 'دڵنیاببەوە لە کۆدی مۆرەکە لەسەر بڕوانامەی PDF یان پەیوەندی بە خاوەنی کەیسەکەوە بکە.',
        openLogin: 'کردنەوەی پانێڵی کڕیار',
      },
    },
  },
};

export function translateStatus(status: string, lang: LangCode): string {
  const mapped = PORTAL_TRANSLATIONS[lang].statuses[status];
  if (mapped) return mapped;
  return status.replaceAll('_', ' ');
}

export function translateActionLabel(action: string, fallback: string, lang: LangCode): string {
  return PORTAL_TRANSLATIONS[lang].actions[action] || fallback;
}

export function translateRole(role: string, lang: LangCode): string {
  return PORTAL_TRANSLATIONS[lang].roles[role] || role.replaceAll('_', ' ');
}

export function translateSlaLabel(
  sla: { health: SlaHealth; label: string },
  lang: LangCode
): string {
  if (lang === 'en') {
    if (sla.label === 'With platform queue') return 'With platform';
    return PORTAL_TRANSLATIONS.en.sla[sla.health] || sla.label;
  }
  if (sla.label === 'With platform queue') {
    return PORTAL_TRANSLATIONS[lang].statuses.submitted_to_platform;
  }
  return PORTAL_TRANSLATIONS[lang].sla[sla.health] || sla.label;
}

export function translateTimelineLabel(
  category: string,
  fallbackLabel: string,
  lang: LangCode
): string {
  if (lang === 'en') {
    switch (category) {
      case 'submitted':
        return 'Case opened';
      case 'evidence':
        return 'Evidence uploaded';
      case 'submission':
        return 'Sent to platform';
      case 'platform_response':
        return 'Platform responded';
      case 'verification':
        return 'Result checked';
      case 'message':
        return 'Message';
      default:
        return PORTAL_TRANSLATIONS.en.statuses[category] || fallbackLabel;
    }
  }
  if (lang === 'ar') {
    switch (category) {
      case 'submitted':
        return 'تم فتح الحالة';
      case 'evidence':
        return 'تم رفع إثبات';
      case 'submission':
        return 'أُرسل للمنصة';
      case 'platform_response':
        return 'ردّت المنصة';
      case 'verification':
        return 'تم فحص النتيجة';
      case 'message':
        return 'رسالة';
      default:
        return PORTAL_TRANSLATIONS.ar.statuses[category] || fallbackLabel;
    }
  }
  switch (category) {
    case 'submitted':
      return 'کەیس کرایەوە';
    case 'evidence':
      return 'بەڵگە بارکرا';
    case 'submission':
      return 'نێردرا بۆ پلاتفۆرم';
    case 'platform_response':
      return 'پلاتفۆرم وەڵامی دایەوە';
    case 'verification':
      return 'ئەنجام پشکنرا';
    case 'message':
      return 'نامە';
    default:
      return PORTAL_TRANSLATIONS.ku.statuses[category] || fallbackLabel;
  }
}

export function translateActivitySummary(action: string, fallback: string, lang: LangCode): string {
  if (lang === 'en') return fallback;
  const mapAr: Record<string, string> = {
    case_created: 'تم إنشاء حالة جديدة',
    evidence_uploaded: 'تم رفع ملف إثبات',
    case_status_changed: 'تم تحديث وضع الحالة',
    case_assigned: 'تم تعيين مسؤول للحالة',
    case_reply: 'رد جديد على الحالة',
    case_internal_note: 'ملاحظة داخلية للفريق',
    case_submission_logged: 'تم تسجيل بلاغ منصة',
    case_verification_logged: 'تم تسجيل فحص النتيجة',
    live_url_checked: 'تم فحص الرابط مباشرة',
    payment_submitted: 'تم إرسال إثبات دفع',
    payment_approved: 'تم اعتماد الدفع',
    payment_rejected: 'تم رفض الدفع',
    instant_card_paid: 'تم الدفع الفوري بالبطاقة',
    broadcast_notice: 'تم إرسال تنبيه للعملاء',
    inquiry_submitted: 'رسالة جديدة من الموقع',
    inquiry_converted: 'تم تحويل رسالة إلى حالة',
    role_updated: 'تم تحديث صلاحية موظف',
    role_suspended: 'تم تعديل وصول موظف',
    support_ticket_created: 'تم فتح طلب دعم',
    support_reply: 'رد جديد على الدعم',
    data_request_created: 'تم إرسال طلب خصوصية',
    data_request_completed: 'تم تنفيذ طلب الخصوصية',
    customer_recheck_requested: 'طلب العميل إعادة فحص الحالة',
    watchlist_sweep_completed: 'تم فحص قائمة المراقبة الدورية',
  };
  const mapKu: Record<string, string> = {
    case_created: 'کەیسی نوێ دروستکرا',
    evidence_uploaded: 'فایلی بەڵگە بارکرا',
    case_status_changed: 'دۆخی کەیس نوێکرایەوە',
    case_assigned: 'بەرپرس بۆ کەیس دیاریکرا',
    case_reply: 'وەڵامی نوێ لەسەر کەیس',
    case_internal_note: 'تێبینی ناوخۆیی تیم',
    case_submission_logged: 'سکاڵای پلاتفۆرم تۆمارکرا',
    case_verification_logged: 'ئەنجامی پشکنین تۆمارکرا',
    live_url_checked: 'لینک ڕاستەوخۆ پشکنرا',
    payment_submitted: 'بەڵگەی پارەدان نێردرا',
    payment_approved: 'پارەدان پەسەندکرا',
    payment_rejected: 'پارەدان ڕەتکرایەوە',
    instant_card_paid: 'پارەدانی خێرا بە کارت',
    broadcast_notice: 'ئاگاداری بۆ بەکارهێنەران نێردرا',
    inquiry_submitted: 'نامەی نوێ لە ماڵپەڕەوە',
    inquiry_converted: 'نامە کرایە کەیسی چالاک',
    role_updated: 'ڕۆڵی تیم نوێکرایەوە',
    role_suspended: 'دەسەڵاتی ئەندام گۆڕدرا',
    support_ticket_created: 'داواکاری هاوکاری کرایەوە',
    support_reply: 'وەڵامی نوێ بۆ هاوکاری',
    data_request_created: 'داواکاری نهێنی نێردرا',
    data_request_completed: 'داواکاری نهێنی جێبەجێکرا',
    customer_recheck_requested: 'بەکارهێنەر داوای پشکنینی دووبارەی کرد',
    watchlist_sweep_completed: 'پشکنینی لیستی چاودێری تەواوبوو',
  };
  const table = lang === 'ar' ? mapAr : mapKu;
  return table[action] || fallback;
}
