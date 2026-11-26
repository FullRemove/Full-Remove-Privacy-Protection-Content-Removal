export type LangCode = 'en' | 'ar' | 'ku';

export interface SiteCopy {
  dir: 'ltr' | 'rtl';
  htmlLang: 'en' | 'ar' | 'ckb';
  metaTitle: string;
  metaDescription: string;
  nav: {
    services: string;
    process: string;
    approach: string;
    pricing: string;
    faq: string;
    talkToTeam: string;
    getStarted: string;
    contact: string;
  };
  hero: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    lead: string;
    primaryCta: string;
    secondaryCta: string;
    note: string;
    cardLabel: string;
    cardStatus: string;
    cardTitle: string;
    cardSub: string;
    steps: { title: string; sub: string; state: string; done?: boolean; active?: boolean }[];
    floatingStrong: string;
    floatingText: string;
  };
  trust: {
    label: string;
    items: string[];
  };
  servicesSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: { category: string; title: string; body: string }[];
  };
  processSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    platforms: string[];
    steps: { number: string; title: string; body: string }[];
  };
  approachSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    cards: { title: string; body: string }[];
  };
  pricingSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    footnote: string;
    plans: {
      code: string;
      name: string;
      desc: string;
      unit: string;
      badge?: string;
      cta: string;
      features: string[];
    }[];
  };
  outcomesSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    liveActivity: (verified: number, resolved: number, total: number) => string;
    metrics: { value: string; label: string; detail: string }[];
    channelsTitle: string;
    channels: { platform: string; pathway: string; focus: string }[];
  };
  estimatorSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    issueLabel: string;
    platformLabel: string;
    urlToggle: string;
    proofToggle: string;
    extortionToggle: string;
    readinessLabel: string;
    suggestedLabel: string;
    channelLabel: string;
    slaLabel: string;
    urgentSlaText: string;
    standardSlaText: (hours: number) => string;
    checklistTitle: string;
    useInInquiryCta: string;
    openWorkspaceCta: string;
  };
  faqSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: { q: string; a: string }[];
  };
  contactSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    makeInquiry: string;
    whatsappCta: string;
    referencePrefix: string;
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      serviceLabel: string;
      otherOption: string;
      messageLabel: string;
      messagePlaceholder: string;
      submitBtn: string;
      sendingBtn: string;
      sendingNote: string;
      successNote: string;
      errorNote: string;
    };
    tracker: {
      heading: string;
      placeholder: string;
      button: string;
      checking: string;
      notFound: string;
      statusLabel: string;
      openedCaseLabel: string;
    };
  };
  widget: {
    launch: string;
    title: string;
    intro: string;
    waTitle: string;
    waSub: string;
    callTitle: string;
    callSub: string;
    emailTitle: string;
    emailSub: string;
    inquiryTitle: string;
    inquirySub: string;
    foot: string;
  };
  footer: {
    tagline: string;
    exploreTitle: string;
    resourcesTitle: string;
    touchTitle: string;
    verifyLink: string;
    privacyLink: string;
    termsLink: string;
    whatsappLabel: string;
    emailLabel: string;
    inquiryLink: string;
    copyright: string;
    motto: string;
    disclaimer: string;
  };
}

export const SITE_TRANSLATIONS: Record<LangCode, SiteCopy> = {
  en: {
    dir: 'ltr',
    htmlLang: 'en',
    metaTitle: 'Full Remove — Online Privacy & Content Removal Services',
    metaDescription:
      'Dedicated case specialists who archive evidence, file official takedowns, and verify removal of fake accounts, leaked media, deepfakes, and scam websites.',
    nav: {
      services: 'What we remove',
      process: 'How it works',
      approach: 'Why us',
      pricing: 'Pricing',
      faq: 'FAQ',
      talkToTeam: 'Contact team',
      getStarted: 'Open client portal',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Online Privacy & Content Removal',
      titlePrefix: 'Remove harmful content and ',
      titleHighlight: 'protect your name online.',
      lead: 'When someone steals your photos, clones your business site, or publishes private media without consent, platforms ignore vague complaints. Full Remove preserves your evidence, files official takedown requests, and tracks every step until verified.',
      primaryCta: 'Preview your case plan',
      secondaryCta: 'View one-time pricing',
      note: 'Human case specialists · Encrypted evidence vault · Real-time case tracking',
      cardLabel: 'Live workflow example',
      cardStatus: 'In progress',
      cardTitle: 'Impersonation & Photo Takedown',
      cardSub: '4 clear stages from intake to verified removal',
      steps: [
        { title: 'Case received', sub: 'Links & details archived', state: 'Done', done: true },
        { title: 'Proof verified', sub: 'ID & ownership checked', state: 'Done', done: true },
        { title: 'Filing sent', sub: 'Escalated to platform', state: 'Active', active: true },
        { title: 'Removal check', sub: 'Live URL verified gone', state: 'Next' },
      ],
      floatingStrong: 'Clear evidence. Real action.',
      floatingText: 'Every filing tracked transparently.',
    },
    trust: {
      label: 'How every case is handled',
      items: [
        'Strict confidentiality',
        'Time-stamped evidence',
        'Human specialists',
        'Verified outcomes',
      ],
    },
    servicesSection: {
      eyebrow: 'Services we cover',
      heading: 'Focused takedown support for every kind of online abuse.',
      intro:
        'Each platform has strict rules on what counts as an actionable violation. We organize your links, identity proof, and screenshots into structured filings sent directly to the right review team.',
      items: [
        {
          category: 'Impersonation',
          title: 'Fake profiles & stolen identities',
          body: 'Someone pretending to be you or your business to deceive followers or customers? We match your verified identity against the fake account and submit official impersonation filings.',
        },
        {
          category: 'Brand & Domains',
          title: 'Copycat websites & scam stores',
          body: 'Fraudulent sites cloning your logo, domain name, or storefront to trick buyers? We document the brand infringement and report the domain directly to its web host and registrar.',
        },
        {
          category: 'Private Media',
          title: 'Leaked photos & private videos',
          body: 'Personal images or recordings shared without your permission? We record exact source links and file urgent non-consensual media removal notices across hosting sites.',
        },
        {
          category: 'AI & Deepfakes',
          title: 'Deepfakes, face swaps & cloned voices',
          body: 'AI-manipulated videos or synthetic audio misusing your likeness? We assemble side-by-side comparison proof and escalate synthetic media reports for priority review.',
        },
        {
          category: 'Copyright',
          title: 'Stolen work & unauthorized reposts',
          body: 'Original photos, videos, courses, or designs republished without permission? We verify your creation records and submit formal copyright and DMCA takedown claims.',
        },
        {
          category: 'Harassment',
          title: 'Targeted abuse, threats & false posts',
          body: 'Repeated harassment, doxxing, or defamatory posts harming your reputation? We preserve full post context and timestamps so trust-and-safety teams can act decisively.',
        },
        {
          category: 'Urgent Safety',
          title: 'Blackmail & extortion threats',
          body: 'Someone threatening to publish private media unless you pay? We lock your threat logs safely in encrypted storage and prioritize urgent platform takedowns. If you are in immediate danger, contact local police right away.',
        },
        {
          category: 'Search & News',
          title: 'Damaging articles & search results',
          body: 'Outdated, false, or harmful news pages appearing under your name or brand? We evaluate whether a publisher correction, content removal, or search de-indexing request applies.',
        },
      ],
    },
    processSection: {
      eyebrow: 'How it works',
      heading: 'Four clear steps from your first link to confirmed removal.',
      intro:
        'You never have to guess which form to fill out or wonder whether anyone read your report. Every case moves through one transparent workflow inside your private workspace.',
      platforms: ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'X', 'Websites & Search'],
      steps: [
        {
          number: '01',
          title: 'Submit the link & context',
          body: 'Open a case in minutes by naming the platform, pasting the exact URL, and attaching any screenshots or ownership files you already have.',
        },
        {
          number: '02',
          title: 'Specialist evidence review',
          body: 'A case specialist checks your links within 12–48 hours and notifies you immediately if an ID match or extra screenshot will strengthen your filing.',
        },
        {
          number: '03',
          title: 'Official platform filing',
          body: 'We prepare a policy-aligned takedown packet and submit it directly through the platform, web host, or registrar channel responsible for enforcement.',
        },
        {
          number: '04',
          title: 'Live verification & certificate',
          body: 'We follow up on platform replies, run live availability checks on the reported link, and issue a verifiable closure record once removal is confirmed.',
        },
      ],
    },
    approachSection: {
      eyebrow: 'Honest & accountable',
      heading: 'Built on clear evidence, human review, and plain truth.',
      intro:
        'Only the platform or website host holds final authority to remove content. Our commitment is to give your case the strongest possible submission and keep you honestly informed.',
      cards: [
        {
          title: 'Real human review',
          body: 'Every filing is reviewed and submitted manually by a trained specialist—never blasted through generic automated scripts.',
        },
        {
          title: 'Policy-grade proof',
          body: 'We pair exact offending URLs with dated screenshots and verified ownership or identity records that trust-and-safety teams accept.',
        },
        {
          title: 'Live case timeline',
          body: 'Follow every milestone inside your portal, message your case handler directly, and export PDF or CSV records whenever needed.',
        },
        {
          title: 'No false guarantees',
          body: 'Platforms decide under their own rules, so no ethical service can guarantee removal. We guarantee meticulous preparation and transparent updates.',
        },
      ],
    },
    pricingSection: {
      eyebrow: 'Transparent pricing',
      heading: 'Flat, one-time pricing per case—no subscriptions.',
      intro:
        'You pay only once for the specific takedown service you need. Select a plan below to pre-fill an inquiry, or let our team confirm the exact scope before work starts.',
      footnote:
        'All prices are one-time USD fees with no recurring charges. Final scope is always confirmed with you after case review. Because independent platforms and publishers control final takedown decisions, removal cannot be guaranteed. In active safety or extortion emergencies, preserve all messages and contact local authorities immediately.',
      plans: [
        {
          code: 'fake_website',
          name: 'Fake Website Removal',
          desc: 'Shut down fraudulent websites, phishing pages, and clone stores misusing your company name, logo, or products.',
          unit: '/ case',
          cta: 'Select website takedown',
          features: [
            'Full review of cloned pages & domain records',
            'Brand misuse documentation for hosts',
            'Abuse filings to web hosts & registrars',
            'Follow-up until final host decision',
          ],
        },
        {
          code: 'deepfake_video',
          name: 'Deepfake & AI Video Removal',
          desc: 'Remove synthetic videos, face swaps, or AI voice clones using your likeness without permission.',
          unit: '/ case',
          badge: 'Specialist care',
          cta: 'Select deepfake removal',
          features: [
            'Audit of original & re-uploaded video links',
            'Side-by-side likeness & identity proof',
            'Escalated filings to hosting platforms',
            'Live check & removal confirmation',
          ],
        },
        {
          code: 'copyright_protection',
          name: 'Copyright & Stolen Work',
          desc: 'Protect original photos, videos, designs, or written work copied and republished online without your license.',
          unit: '/ case',
          cta: 'Protect my original work',
          features: [
            'Comparison of original vs. copied content',
            'Ownership proof checklist & prep',
            'Formal DMCA & copyright filing',
            'Platform response tracking',
          ],
        },
        {
          code: 'news_reputation',
          name: 'News Article & Search Help',
          desc: 'Address damaging news articles or harmful search results through publisher outreach, corrections, or de-indexing.',
          unit: '/ case',
          cta: 'Request article review',
          features: [
            'Publisher & search snippet evaluation',
            'Clear assessment of realistic options',
            'Written request to editor or search team',
            'Status tracking & summary report',
          ],
        },
        {
          code: 'image_removal',
          name: 'Photo Removal',
          desc: 'Take down an unauthorized private or stolen photograph from a website or social profile with documented proof.',
          unit: '/ image',
          cta: 'Remove a photo',
          features: [
            'Dedicated single-image case review',
            'Direct URL & screenshot archival',
            'Platform notice & follow-up check',
          ],
        },
        {
          code: 'impostor_account',
          name: 'Fake Account Removal',
          desc: 'Remove impersonation profiles pretending to be you or your business on Instagram, Facebook, TikTok, or X.',
          unit: '/ account',
          cta: 'Remove fake account',
          features: [
            'Official ID vs. fake profile match',
            'Targeted impersonation report filing',
            'Verified takedown confirmation',
          ],
        },
        {
          code: 'video_extortion',
          name: 'Extortion Video Takedown',
          desc: 'Urgent, confidential handling for unauthorized videos linked to blackmail, threats, or financial extortion.',
          unit: '/ case',
          badge: 'Priority care',
          cta: 'Get urgent video help',
          features: [
            'Rapid 12-hour priority case review',
            'Encrypted storage of threat evidence',
            'Urgent safety escalation to platforms',
          ],
        },
        {
          code: 'page_takedown',
          name: 'Page & Post Takedown',
          desc: 'Remove a specific public post, listing, or webpage violating your personal privacy or platform safety rules.',
          unit: '/ case',
          cta: 'Request post removal',
          features: [
            'Page & policy-violation assessment',
            'Evidence-backed platform submission',
            'Follow-up until final verification',
          ],
        },
      ],
    },
    outcomesSection: {
      eyebrow: 'Why proof matters',
      heading: 'Structured filings get taken seriously by review teams.',
      intro:
        'Unorganized reports sit unanswered. We verify every URL, preserve tamper-evident file records, and route each case to the exact enforcement desk handling that platform.',
      liveActivity: (verified, resolved, total) =>
        `Live platform activity: ${verified} link checks completed · ${resolved} of ${total} active records resolved`,
      metrics: [
        {
          value: '12–48h',
          label: 'Fast specialist review',
          detail: 'New cases are reviewed within 48 hours—or within 12 hours for active extortion threats.',
        },
        {
          value: '100%',
          label: 'Human-prepared filings',
          detail: 'Every submission is written and verified by a case specialist for the target platform.',
        },
        {
          value: 'SHA-256',
          label: 'Tamper-evident proof vault',
          detail: 'Uploaded screenshots, IDs, and threat logs receive dated cryptographic verification hashes.',
        },
        {
          value: 'End-to-end',
          label: 'Private client workspace',
          detail: 'Track phases, chat securely with staff, and download official PDF verification certificates.',
        },
      ],
      channelsTitle: 'Where we submit official takedown requests',
      channels: [
        {
          platform: 'Meta (Instagram & Facebook)',
          pathway: 'Impersonation & Rights Enforcement',
          focus: 'Fake accounts, stolen personal photos, cloned business pages',
        },
        {
          platform: 'TikTok & YouTube',
          pathway: 'Privacy, Safety & Likeness Desk',
          focus: 'Deepfake clips, private video leaks, harassment or extortion uploads',
        },
        {
          platform: 'Web Hosts & Domain Registrars',
          pathway: 'Abuse & Brand Infringement Notice',
          focus: 'Phishing sites, scam storefronts, lookalike brand domains',
        },
        {
          platform: 'Search Engines & Publishers',
          pathway: 'Editorial & De-indexing Outreach',
          focus: 'Damaging news articles and harmful search result links',
        },
      ],
    },
    estimatorSection: {
      eyebrow: 'Quick case check',
      heading: 'See your best removal path in 30 seconds.',
      intro:
        'Choose your issue, select where the content appears, and check what proof you currently have to preview the matching service, review speed, and readiness checklist.',
      issueLabel: '1. What issue are you dealing with?',
      platformLabel: '2. Where is it hosted or posted?',
      urlToggle: 'I already have the direct link (URL) to the content',
      proofToggle: 'I can provide my ID or proof of ownership',
      extortionToggle: 'Someone is actively threatening or blackmailing me',
      readinessLabel: 'Case readiness',
      suggestedLabel: 'Recommended service',
      channelLabel: 'Target enforcement channel',
      slaLabel: 'Expected first review',
      urgentSlaText: 'Within 12 hours (priority)',
      standardSlaText: (hours) => `Within ${hours} hours`,
      checklistTitle: 'What helps speed up approval',
      useInInquiryCta: 'Pre-fill inquiry with these details',
      openWorkspaceCta: 'Sign in to open case',
    },
    faqSection: {
      eyebrow: 'Common questions',
      heading: 'Straight answers before you start.',
      intro:
        'Everything you need to know about privacy, timelines, evidence requirements, and how platform decisions work.',
      items: [
        {
          q: 'Can you guarantee the content will be taken down?',
          a: 'No honest company can guarantee removal, because the website host or social platform makes the final decision under its own policies. What we guarantee is careful evidence verification, well-structured official filings, active follow-up, and transparent live updates.',
        },
        {
          q: 'Who prepares and submits the reports?',
          a: 'Trained Full Remove specialists manually review every approved case and submit tailored reports through the platform or host’s official takedown channels.',
        },
        {
          q: 'What should I have ready to start a case?',
          a: 'You only need the platform name, the direct link to the offending post, profile, or site, a short description of what happened, and any screenshots or identity/ownership proof you have.',
        },
        {
          q: 'Which platforms and websites do you support?',
          a: 'We handle Instagram, Facebook, TikTok, YouTube, X, Google search links, independent websites, blogs, news publishers, and domain registrars.',
        },
        {
          q: 'How do I follow updates on my case?',
          a: 'Inside your private client workspace you can see live stage progress, direct replies from your specialist, real-time status alerts, and downloadable PDF certificates or CSV records.',
        },
        {
          q: 'How fast does a takedown usually happen?',
          a: 'Our team completes initial review within 12 to 48 hours. Once filed, final decision times vary by platform—usually from a few days to a couple of weeks—and we keep checking and following up until confirmed.',
        },
      ],
    },
    contactSection: {
      eyebrow: 'Talk to our team',
      heading: 'Share what happened. We will show you the clearest next step.',
      intro:
        'Not ready to create an account yet? Send a confidential message directly to our specialists, or look up an earlier inquiry using your tracking code.',
      makeInquiry: 'Send a message',
      whatsappCta: 'Chat privately on WhatsApp',
      referencePrefix: 'Tracking code',
      form: {
        nameLabel: 'Your name',
        namePlaceholder: 'Full name',
        emailLabel: 'Email address',
        emailPlaceholder: 'you@example.com',
        serviceLabel: 'Which service fits best?',
        otherOption: 'Other privacy or takedown question',
        messageLabel: 'Brief summary',
        messagePlaceholder: 'Tell us what happened and paste any links you want us to review…',
        submitBtn: 'Send confidential message →',
        sendingBtn: 'Sending…',
        sendingNote: 'Encrypting and delivering your inquiry to our review team…',
        successNote: 'Message received. Our team at contact@fremove.com will reply shortly.',
        errorNote: 'Unable to send right now. Please try again or email contact@fremove.com.',
      },
      tracker: {
        heading: 'Check an earlier inquiry',
        placeholder: 'Tracking code (e.g. INQ-SEED-1)',
        button: 'Check status',
        checking: 'Checking…',
        notFound: 'No inquiry found with that tracking code.',
        statusLabel: 'Current status',
        openedCaseLabel: 'Linked case',
      },
    },
    widget: {
      launch: 'Need help?',
      title: 'Speak with Full Remove',
      intro: 'Choose the quickest private way to reach our team—no sign-up needed.',
      waTitle: 'WhatsApp chat',
      waSub: 'Private direct message',
      callTitle: 'Call our specialists',
      callSub: '+964 780 558 6584',
      emailTitle: 'Send an email',
      emailSub: 'contact@fremove.com',
      inquiryTitle: 'Send a confidential note',
      inquirySub: 'Jump to the quick form below',
      foot: 'For urgent blackmail or safety issues, call or message us on WhatsApp directly.',
    },
    footer: {
      tagline:
        'Specialist online privacy protection, evidence preservation, and official content removal support.',
      exploreTitle: 'Navigation',
      resourcesTitle: 'Resources',
      touchTitle: 'Direct Contact',
      verifyLink: 'Verify certificate',
      privacyLink: 'Privacy notice',
      termsLink: 'Terms of service',
      whatsappLabel: 'WhatsApp: +964 780 558 6584',
      emailLabel: 'Email: contact@fremove.com',
      inquiryLink: 'Send an inquiry',
      copyright: '© 2026 Full Remove. All rights reserved.',
      motto: 'Private, evidence-led, and human.',
      disclaimer:
        'Full Remove prepares evidence and submits takedown requests on your behalf. We are an independent service and are not affiliated with any social network, web host, or search engine; final removal decisions belong strictly to those platforms.',
    },
  },

  ar: {
    dir: 'rtl',
    htmlLang: 'ar',
    metaTitle: 'Full Remove — حماية الخصوصية وإزالة المحتوى الضار',
    metaDescription:
      'مساعدة بشرية متخصصة لتوثيق الأدلة وإرسال بلاغات رسمية لإزالة الحسابات الوهمية، الصور المسربة، التزييف العميق، والمواقع المزيفة.',
    nav: {
      services: 'ما نساعد في إزالته',
      process: 'كيف نعمل',
      approach: 'لماذا نحن',
      pricing: 'الأسعار',
      faq: 'الأسئلة الشائعة',
      talkToTeam: 'تواصل مع الفريق',
      getStarted: 'دخول بوابة العملاء',
      contact: 'اتصل بنا',
    },
    hero: {
      eyebrow: 'حماية الخصوصية وإزالة المحتوى الرقمي',
      titlePrefix: 'أزِل المحتوى الضار ',
      titleHighlight: 'واستعد السيطرة على اسمك أونلاين.',
      lead: 'عندما يسرق أحدهم صورك أو يقلّد موقع شركتك أو ينشر مقاطع خاصة دون إذنك، غالباً ما تتجاهل المنصات البلاغات العشوائية. فريق Full Remove يحفظ أدلتك بشكل آمن، ويقدّم بلاغات رسمية متكاملة، ويتابع حالتك خطوة بخطوة حتى تأكيد النتيجة.',
      primaryCta: 'افحص خيارات حالتك',
      secondaryCta: 'اطّلع على الأسعار الواضحة',
      note: 'مختصون حقيقيون · حفظ مشفّر للأدلة · متابعة مباشرة خطوة بخطوة',
      cardLabel: 'مثال حي لمسار الحالة',
      cardStatus: 'قيد التنفيذ',
      cardTitle: 'إزالة حساب منتحل وصور خاصة',
      cardSub: '4 مراحل واضحة من الاستلام حتى تأكيد الإزالة',
      steps: [
        { title: 'استلام الطلب', sub: 'حفظ الروابط والتفاصيل', state: 'مكتمل', done: true },
        { title: 'فحص الإثبات', sub: 'مطابقة الهوية والملكية', state: 'مكتمل', done: true },
        { title: 'إرسال البلاغ', sub: 'رُفع لفريق المنصة', state: 'نشط', active: true },
        { title: 'تأكيد الإزالة', sub: 'فحص الرابط بعد الحذف', state: 'التالي' },
      ],
      floatingStrong: 'أدلة واضحة. إجراء حقيقي.',
      floatingText: 'كل خطوة موثقة بشفافية.',
    },
    trust: {
      label: 'كيف نتعامل مع كل حالة',
      items: ['سرية تامة', 'أدلة موثقة بالتاريخ', 'فريق بشري مختص', 'نتائج مؤكدة بالتحقق'],
    },
    servicesSection: {
      eyebrow: 'الخدمات التي نغطيها',
      heading: 'دعم متخصص لإزالة كل أنواع التعدي والانتهاك الرقمي.',
      intro:
        'تضع كل منصة شروطاً دقيقة لقبول البلاغات. نحن نرتّب الروابط وإثباتات الهوية ولقطات الشاشة في ملف رسمي متكامل يُرسل مباشرة إلى الجهة المسؤولة عن التنفيذ.',
      items: [
        {
          category: 'انتحال الشخصية',
          title: 'الحسابات الوهمية وانتحال الهوية',
          body: 'شخص ينتحل اسمك أو حساب عملك لخداع الناس؟ نطابق هويتك الحقيقية مع الحساب المزيف ونرفع بلاغ انتحال رسمي لإغلاقه.',
        },
        {
          category: 'المواقع والعلامات',
          title: 'المواقع المزيفة والمتاجر المقلدة',
          body: 'موقع احتيالي يستخدم شعار شركتك أو نطاقاً مشابهاً لخداع العملاء؟ نوثق التعدي على العلامة ونراسل شركة الاستضافة ومسجّل النطاق مباشرة.',
        },
        {
          category: 'الوسائط الخاصة',
          title: 'الصور المسربة والفيديوهات الخاصة',
          body: 'صور أو تسجيلات شخصية نُشرت دون موافقتك؟ نوثق الروابط الدقيقة ونرسل طلبات إزالة عاجلة للمحتوى المنشور دون إذن.',
        },
        {
          category: 'الذكاء الاصطناعي',
          title: 'التزييف العميق وتقليد الصوت والوجه',
          body: 'فيديوهات معدلة بالذكاء الاصطناعي أو أصوات مستنسخة تستغل ملامحك؟ نجهز مقارنة مرجعية واضحة ونصعّد البلاغ للمراجعة ذات الأولوية.',
        },
        {
          category: 'حقوق الملكية',
          title: 'سرقة الأعمال وإعادة النشر بغير إذن',
          body: 'صورك أو مقاطعك أو تصاميمك أُعيد نشرها دون ترخيص؟ نرتّب إثباتات الملكية وتاريخ الإنشاء ونقدّم مطالبات حقوق نشر (DMCA) رسمية.',
        },
        {
          category: 'الإساءة والتشهير',
          title: 'المضايقة المستمرة والتهديد والتشهير',
          body: 'إساءات متكررة أو نشر بيانات خاصة أو منشورات تسيء لسمعتك؟ نجمع السجل الكامل بالتواريخ لتتمكن فرق الأمان من اتخاذ إجراء.',
        },
        {
          category: 'حماية عاجلة',
          title: 'الابتزاز والتهديد بنشر الملفات',
          body: 'شخص يهدد بنشر ملفاتك الخاصة مقابل المال؟ نحفظ أدلة التهديد في خزنة مشفّرة ونعطي الأولوية العاجلة لبلاغات الإزالة. وإذا كنت في خطر مباشر، تواصل فوراً مع الشرطة المحلية.',
        },
        {
          category: 'الأخبار والبحث',
          title: 'المقالات الضارة ونتائج البحث',
          body: 'أخبار غير دقيقة أو روابط قديمة تضر باسمك أو شركتك؟ نقيّم أنسب خيار عملي سواء بطلب التصحيح من الناشر أو الحذف أو إزالة الفهرسة من البحث.',
        },
      ],
    },
    processSection: {
      eyebrow: 'آلية العمل',
      heading: '4 خطوات واضحة من إرسال الرابط حتى تأكيد الإزالة.',
      intro:
        'لن تحتاج إلى تخمين النماذج المعقدة أو الانتظار دون إجابة. كل حالة تسير في مسار واحد شفاف داخل بوابة حسابك الخاصة.',
      platforms: ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'X', 'المواقع والبحث'],
      steps: [
        {
          number: '01',
          title: 'أرسل الرابط والتفاصيل',
          body: 'افتح حالة خلال دقائق بذكر اسم المنصة ولصق الرابط المباشر وإرفاق أي لقطات شاشة أو مستندات لديك.',
        },
        {
          number: '02',
          title: 'مراجعة المختص للأدلة',
          body: 'يفحص فريقنا الروابط خلال 12 إلى 48 ساعة، ويخبرك فوراً إذا كنا نحتاج مطابقة هوية أو لقطة أوضح لتقوية البلاغ.',
        },
        {
          number: '03',
          title: 'تقديم البلاغ الرسمي',
          body: 'نُعد ملف إزالة متوافقاً مع سياسات المنصة ونرسله مباشرة عبر القناة الرسمية للمنصة أو شركة الاستضافة.',
        },
        {
          number: '04',
          title: 'التحقق المباشر والشهادة',
          body: 'نتابع ردود المنصة، ونفحص الرابط مباشرة للتأكد من اختفائه، ثم نصدر لك شهادة إغلاق قابلة للتحقق.',
        },
      ],
    },
    approachSection: {
      eyebrow: 'أمانة وموثوقية',
      heading: 'عمل يستند إلى الأدلة والمراجعة البشرية والوضوح الكامل.',
      intro:
        'القرار النهائي بالحذف يعود دائماً للمنصة أو المستضيف. دورنا أن نمنح طلبك أقوى ملف ممكن وأن نضعك في الصورة بصدق في كل مرحلة.',
      cards: [
        {
          title: 'مراجعة بشرية حقيقية',
          body: 'كل بلاغ يراجعه ويرسله مختص حقيقي يدوياً—دون الاعتماد على أدوات إرسال آلية عشوائية.',
        },
        {
          title: 'ملفات بمعايير المنصات',
          body: 'نجمع الروابط الدقيقة مع لقطات الشاشة المؤرخة وإثباتات الهوية أو الملكية التي تقبلها فرق المراجعة.',
        },
        {
          title: 'جدول زمني حي للحالة',
          body: 'تابع كل مرحلة مباشرة في حسابك، وتحدث مع مسؤول حالتك، وصدّر تقارير PDF أو CSV في أي وقت.',
        },
        {
          title: 'دون وعود زائفة',
          body: 'المنصات تقرر وفق قوانينها، لذا لا نعد بإزالة مضمونة؛ بل نضمن إعداداً دقيقاً ومتابعة جادة وتحديثات صادقة.',
        },
      ],
    },
    pricingSection: {
      eyebrow: 'أسعار واضحة',
      heading: 'رسوم ثابتة تُدفع مرة واحدة لكل حالة — دون اشتراكات.',
      intro:
        'تدفع مرة واحدة فقط مقابل خدمة الإزالة التي تحتاجها. اختر الخدمة المناسبة لتعبئة طلب سريع، وسنؤكد معك نطاق العمل بالكامل قبل البدء.',
      footnote:
        'جميع الأسعار بالدولار الأمريكي وتُدفع لمرة واحدة دون أي رسوم شهرية متكررة. يتم تأكيد النطاق النهائي بعد مراجعة تفاصيل الحالة. وبما أن المنصات والناشرين يتخذون القرارات النهائية بشكل مستقل، لا يمكن ضمان الإزالة. في حالات الابتزاز أو التهديد الفوري، احتفظ بجميع الرسائل وتواصل مع الجهات الأمنية المحلية فوراً.',
      plans: [
        {
          code: 'fake_website',
          name: 'إزالة المواقع المزيفة',
          desc: 'إغلاق المواقع الاحتيالية وصفحات التصيد والمتاجر المقلدة التي تستغل اسم شركتك أو شعارها.',
          unit: '/ حالة',
          cta: 'اختيار إزالة الموقع',
          features: [
            'فحص شامل للصفحات المزيفة وبيانات النطاق',
            'توثيق انتحال العلامة التجارية للمستضيفين',
            'رفع بلاغات الإساءة للاستضافة ومسجّل النطاق',
            'متابعة مستمرة حتى صدور القرار النهائي',
          ],
        },
        {
          code: 'deepfake_video',
          name: 'إزالة التزييف العميق وفيديو الذكاء الاصطناعي',
          desc: 'إزالة الفيديوهات المركبة أو المقاطع التي تستخدم وجهك أو صوتك بالذكاء الاصطناعي دون موافقتك.',
          unit: '/ حالة',
          badge: 'عناية متخصصة',
          cta: 'اختيار إزالة التزييف',
          features: [
            'فحص الروابط والنسخ المعاد نشرها',
            'إعداد إثبات مقارنة للهوية والملامح',
            'تصعيد مباشر لمنصات الاستضافة',
            'فحص حي وتأكيد إزالة المحتوى',
          ],
        },
        {
          code: 'copyright_protection',
          name: 'حماية حقوق النشر والأعمال المسروقة',
          desc: 'حماية صورك أو فيديوهاتك أو تصاميمك الأصلية التي أُعيد نشرها أونلاين دون إذن أو ترخيص.',
          unit: '/ حالة',
          cta: 'احمِ أعمالي الأصلية',
          features: [
            'مقارنة العمل الأصلي مع النسخ المسروقة',
            'قائمة تجهيز إثباتات الملكية',
            'تقديم بلاغ حقوق نشر (DMCA) رسمي',
            'متابعة الردود وتحديث الحالة',
          ],
        },
        {
          code: 'news_reputation',
          name: 'المقالات الإخبارية ونتائج البحث',
          desc: 'معالجة الأخبار الضارة أو الروابط المسيئة في نتائج البحث عبر مراسلة الناشر أو طلب التصحيح أو إزالة الفهرسة.',
          unit: '/ حالة',
          cta: 'طلب مراجعة المقال',
          features: [
            'تقييم المقال والجهة الناشرة ونتائج البحث',
            'توضيح الخيارات الواقعية المتاحة لحالتك',
            'صياغة طلب رسمي للناشر أو محرك البحث',
            'متابعة الحالة وتقديم ملخص نهائي',
          ],
        },
        {
          code: 'image_removal',
          name: 'إزالة صورة',
          desc: 'حذف صورة شخصية خاصة أو مسروقة منشورة على موقع أو حساب اجتماعي استناداً إلى أدلة موثقة.',
          unit: '/ صورة',
          cta: 'إزالة صورة',
          features: [
            'مراجعة مخصصة لحالة صورة واحدة',
            'أرشفة الرابط المباشر ولقطة الشاشة',
            'تقديم البلاغ ومتابعة التحقق',
          ],
        },
        {
          code: 'impostor_account',
          name: 'إزالة الحسابات الوهمية',
          desc: 'حذف الحسابات المنتحلة التي تتظاهر بأنها أنت أو شركتك على إنستغرام أو فيسبوك أو تيك توك أو X.',
          unit: '/ حساب',
          cta: 'إزالة حساب مزيف',
          features: [
            'مطابقة الهوية الرسمية مع الحساب المنتحل',
            'رفع بلاغ انتحال عبر القناة الرسمية',
            'تأكيد النتيجة بعد الإغلاق',
          ],
        },
        {
          code: 'video_extortion',
          name: 'إزالة فيديوهات الابتزاز',
          desc: 'تعامل عاجل وسري مع المقاطع المنشورة دون إذن والمرتبطة بالابتزاز أو التهديد أو المطالب المالية.',
          unit: '/ حالة',
          badge: 'أولوية قصوى',
          cta: 'طلب مساعدة عاجلة',
          features: [
            'مراجعة سريعة ذات أولوية خلال 12 ساعة',
            'حفظ مشفّر وآمن لأدلة التهديد',
            'تصعيد عاجل لفرق السلامة في المنصات',
          ],
        },
        {
          code: 'page_takedown',
          name: 'إزالة صفحة أو منشور',
          desc: 'حذف منشور محدد أو صفحة عامة تنتهك خصوصيتك أو تخالف سياسات الأمان في المنصة.',
          unit: '/ حالة',
          cta: 'طلب إزالة صفحة',
          features: [
            'فحص الصفحة وتحديد المخالفة بدقة',
            'تقديم ملف مدعوم بالأدلة للمنصة',
            'متابعة مستمرة حتى تأكيد النتيجة',
          ],
        },
      ],
    },
    outcomesSection: {
      eyebrow: 'لماذا تصنع الأدلة الفارق',
      heading: 'الملفات المنظمة تحظى باستجابة أسرع من فرق المراجعة.',
      intro:
        'الشكاوى غير الواضحة تُهمل. نحن نتحقق من كل رابط، ونحفظ ملفات الإثبات ببصمة تحقق مؤرخة، ونوجّه كل بلاغ إلى القسم المسؤول مباشرة.',
      liveActivity: (verified, resolved, total) =>
        `نشاط مباشر: تم إنجاز ${verified} فحص رابط · وحل ${resolved} من أصل ${total} سجل`,
      metrics: [
        {
          value: '12–48 ساعة',
          label: 'مراجعة أولية سريعة',
          detail: 'تُراجع الحالات الجديدة خلال 48 ساعة، أو خلال 12 ساعة في حالات الابتزاز العاجلة.',
        },
        {
          value: '100%',
          label: 'بلاغات بمراجعة بشرية',
          detail: 'كل طلب يُكتب ويُدقق يدوياً من مختص بما يناسب سياسات المنصة المستهدفة.',
        },
        {
          value: 'SHA-256',
          label: 'خزنة أدلة مؤرخة ومحمية',
          detail: 'تحصل لقطات الشاشة والهويات وسجلات التهديد على بصمة تحقق رقمية مؤرخة.',
        },
        {
          value: 'متكامل',
          label: 'بوابة متابعة خاصة',
          detail: 'راقب مراحل التقدم، وتواصل مع الفريق، وحمّل شهادات التحقق بصيغة PDF.',
        },
      ],
      channelsTitle: 'الجهات والقنوات التي نرفع إليها البلاغات الرسمية',
      channels: [
        {
          platform: 'Meta (إنستغرام وفيسبوك)',
          pathway: 'قسم انتحال الهوية والحقوق',
          focus: 'الحسابات الوهمية، الصور المسروقة، وصفحات الأعمال المقلدة',
        },
        {
          platform: 'TikTok و YouTube',
          pathway: 'مكتب السلامة والخصوصية والملامح',
          focus: 'مقاطع التزييف العميق، الفيديوهات الخاصة المسربة، والابتزاز',
        },
        {
          platform: 'شركات الاستضافة ومسجّلو النطاقات',
          pathway: 'بلاغات إساءة الاستخدام والعلامة التجارية',
          focus: 'مواقع التصيد، المتاجر الوهمية، والنطاقات المقلدة',
        },
        {
          platform: 'محركات البحث والناشرون',
          pathway: 'طلبات التصحيح وإزالة الفهرسة',
          focus: 'المقالات الإخبارية الضارة وروابط نتائج البحث المؤذية',
        },
      ],
    },
    estimatorSection: {
      eyebrow: 'فحص سريع للحالة',
      heading: 'تعرّف على المسار الأنسب لحالتك خلال 30 ثانية.',
      intro:
        'حدد نوع المشكلة والمنصة والأدلة المتوفرة لديك لمعاينة الخدمة المقترحة، سرعة المراجعة المتوقعة، وما يساعد على تسريع قبول البلاغ.',
      issueLabel: '1. ما المشكلة التي تواجهها؟',
      platformLabel: '2. أين نُشر المحتوى؟',
      urlToggle: 'لدي الرابط المباشر (URL) للمحتوى أو الحساب',
      proofToggle: 'أستطيع تقديم هويتي أو إثبات ملكية العمل',
      extortionToggle: 'يتضمن الأمر تهديداً أو ابتزازاً حالياً',
      readinessLabel: 'جاهزية الملف',
      suggestedLabel: 'الخدمة المناسبة',
      channelLabel: 'جهة الإبلاغ المستهدفة',
      slaLabel: 'موعد المراجعة الأولى',
      urgentSlaText: 'خلال 12 ساعة (أولوية قصوى)',
      standardSlaText: (hours) => `خلال ${hours} ساعة`,
      checklistTitle: 'ما الذي يساعد على سرعة التنفيذ',
      useInInquiryCta: 'تعبئة رسالة بهذه التفاصيل',
      openWorkspaceCta: 'سجّل الدخول لفتح الحالة',
    },
    faqSection: {
      eyebrow: 'أسئلة شائعة',
      heading: 'إجابات واضحة ومباشرة قبل أن تبدأ.',
      intro: 'كل ما تحتاج معرفته حول الخصوصية، المدة الزمنية، الأدلة المطلوبة، وآلية قرارات المنصات.',
      items: [
        {
          q: 'هل يمكنكم ضمان إزالة المحتوى؟',
          a: 'لا يمكن لأي جهة صادقة ضمان الإزالة، لأن المنصة أو شركة الاستضافة هي التي تتخذ القرار النهائي وفق سياساتها. ما نضمنه هو تجهيز ملف قوي مدعوم بالأدلة، ومتابعة مستمرة، وتحديثات واضحة وصادقة.',
        },
        {
          q: 'من الذي يُعدّ ويرسل البلاغات؟',
          a: 'يتولى مختصو Full Remove مراجعة كل حالة مقبولة يدوياً وإرسال البلاغات المصاغة بدقة عبر القنوات الرسمية لكل منصة أو مستضيف.',
        },
        {
          q: 'ما الذي أحتاج لتجهيزه عند البدء؟',
          a: 'يكفي اسم المنصة، والرابط المباشر للمنشور أو الحساب أو الموقع، ووصف قصير لما حدث، وأي لقطات شاشة أو إثبات هوية أو ملكية متوفر لديك.',
        },
        {
          q: 'ما المنصات والمواقع التي تغطونها؟',
          a: 'نغطي إنستغرام، فيسبوك، تيك توك، يوتيوب، منصة X، نتائج بحث Google، والمواقع المستقلة والمتاجر الإلكترونية والناشرين.',
        },
        {
          q: 'كيف أتابع التحديثات على حالتي؟',
          a: 'تظهر داخل بوابة حسابك الخاصة مراحل التقدم خطوة بخطوة، وردود المختص المسؤول عن حالتك، والتنبيهات الفورية، مع إمكانية تنزيل تقارير PDF أو CSV.',
        },
        {
          q: 'كم يستغرق تنفيذ الطلب عادةً؟',
          a: 'ينجز فريقنا المراجعة الأولى خلال 12 إلى 48 ساعة. وبعد إرسال البلاغ للمنصة، تختلف مدة الرد من بضعة أيام إلى أسبوعين حسب المنصة، ونستمر في المتابعة حتى التحقق النهائي.',
        },
      ],
    },
    contactSection: {
      eyebrow: 'تحدث مع فريقنا',
      heading: 'أخبرنا بما حدث، وسنرشدك إلى أوضح خطوة تالية.',
      intro:
        'لست مستعداً لإنشاء حساب الآن؟ أرسل رسالة سرية مباشرة إلى مختصينا، أو استخدم رمز المتابعة للاطلاع على حالة رسالة سابقة.',
      makeInquiry: 'أرسل رسالة',
      whatsappCta: 'تحدث بسرية عبر واتساب',
      referencePrefix: 'رمز المتابعة',
      form: {
        nameLabel: 'الاسم',
        namePlaceholder: 'الاسم الكامل',
        emailLabel: 'البريد الإلكتروني',
        emailPlaceholder: 'you@example.com',
        serviceLabel: 'ما الخدمة الأقرب لحالتك؟',
        otherOption: 'استفسار آخر عن الخصوصية أو الإزالة',
        messageLabel: 'ملخص الحالة',
        messagePlaceholder: 'اشرح لنا باختصار ما حدث وألصق الروابط التي تريد مراجعتها…',
        submitBtn: 'إرسال الرسالة بسرية ←',
        sendingBtn: 'جارٍ الإرسال…',
        sendingNote: 'يتم تشفير رسالتك وإرسالها بأمان إلى فريق المراجعة…',
        successNote: 'تم استلام رسالتك بنجاح. سيتواصل معك فريقنا عبر contact@fremove.com قريباً.',
        errorNote: 'تعذر الإرسال حالياً. يرجى المحاولة مجدداً أو مراسلتنا على contact@fremove.com.',
      },
      tracker: {
        heading: 'متابعة رسالة سابقة',
        placeholder: 'رمز المتابعة (مثال: INQ-SEED-1)',
        button: 'تحقق من الحالة',
        checking: 'جارٍ التحقق…',
        notFound: 'لم نعثر على رسالة بهذا الرمز.',
        statusLabel: 'الحالة الحالية',
        openedCaseLabel: 'الحالة المرتبطة',
      },
    },
    widget: {
      launch: 'هل تحتاج مساعدة؟',
      title: 'تواصل مع Full Remove',
      intro: 'اختر أسرع وسيلة سرية للتواصل مع فريقنا — دون الحاجة لتسجيل حساب.',
      waTitle: 'محادثة واتساب',
      waSub: 'رسالة خاصة ومباشرة',
      callTitle: 'اتصل بالمختصين',
      callSub: '+964 780 558 6584',
      emailTitle: 'أرسل بريداً إلكترونياً',
      emailSub: 'contact@fremove.com',
      inquiryTitle: 'أرسل رسالة سرية هنا',
      inquirySub: 'انتقل للنموذج السريع بالأسفل',
      foot: 'في حالات الابتزاز أو الخطر العاجل، اتصل بنا أو راسلنا على واتساب مباشرة.',
    },
    footer: {
      tagline:
        'حماية متخصصة للخصوصية الرقمية، وحفظ الأدلة، وتقديم طلبات إزالة المحتوى الرسمية.',
      exploreTitle: 'التنقل',
      resourcesTitle: 'روابط مهمة',
      touchTitle: 'تواصل مباشر',
      verifyLink: 'التحقق من شهادة',
      privacyLink: 'إشعار الخصوصية',
      termsLink: 'شروط الخدمة',
      whatsappLabel: 'واتساب: +964 780 558 6584',
      emailLabel: 'البريد: contact@fremove.com',
      inquiryLink: 'أرسل استفساراً',
      copyright: '© 2026 Full Remove. جميع الحقوق محفوظة.',
      motto: 'خصوصية وأدلة وعمل إنساني دقيق.',
      disclaimer:
        'تساعد Full Remove في توثيق الأدلة وإرسال طلبات الإزالة بالنيابة عنك. نحن خدمة مستقلة ولسنا تابعين لأي منصة تواصل أو شركة استضافة أو محرك بحث؛ والقرار النهائي بالحذف يعود حصراً لتلك المنصات.',
    },
  },

  ku: {
    dir: 'rtl',
    htmlLang: 'ckb',
    metaTitle: 'Full Remove — پاراستنی نهێنی و لابردنی ناوەڕۆکی زیانبەخش',
    metaDescription:
      'پسپۆڕانی مرۆیی بۆ پاراستنی بەڵگە و ناردنی داواکاری فەرمی بۆ لابردنی هەژماری ساختە، وێنەی دزەپێکراو، دیپفەیک و ماڵپەڕی ساختە.',
    nav: {
      services: 'چی لادەبەین',
      process: 'چۆن کار دەکات',
      approach: 'بۆچی ئێمە',
      pricing: 'نرخەکان',
      faq: 'پرسیارە باوەکان',
      talkToTeam: 'پەیوەندی بە تیمەوە',
      getStarted: 'کردنەوەی پۆرتاڵی کڕیار',
      contact: 'پەیوەندی',
    },
    hero: {
      eyebrow: 'پاراستنی نهێنی و لابردنی ناوەڕۆکی سەرهێڵ',
      titlePrefix: 'ناوەڕۆکی زیانبەخش لاببە و ',
      titleHighlight: 'ناوی خۆت بپارێزە.',
      lead: 'کاتێک کەسێک وێنەکانت دەدزێت، ماڵپەڕی کارەکەت کۆپی دەکات یان ڤیدیۆی تایبەت بێ ڕەزامەندی بڵاودەکاتەوە، پلاتفۆرمەکان سکاڵای ناڕوون پشتگوێ دەخەن. Full Remove بەڵگەکانت دەپارێزێت، داواکاری فەرمی دەنێرێت و تا دڵنیابوون بەدواداچوون دەکات.',
      primaryCta: 'بژاردەکانی کەیسەکەت ببینە',
      secondaryCta: 'نرخی یەکجارە ببینە',
      note: 'پسپۆڕانی مرۆیی · خەزێنەی کۆدکراوی بەڵگە · بەدواداچوونی ڕاستەوخۆ',
      cardLabel: 'نموونەی زیندووی کار',
      cardStatus: 'لە پرۆسەدایە',
      cardTitle: 'لابردنی هەژماری ساختە و وێنە',
      cardSub: '٤ قۆناغی ڕوون لە وەرگرتنەوە تا دڵنیابوون',
      steps: [
        { title: 'کەیس وەرگیرا', sub: 'بەستەر و وردەکاری پارێزرا', state: 'تەواو', done: true },
        { title: 'بەڵگە پشکنرا', sub: 'ناسنامە و خاوەندارێتی دڵنیاکرا', state: 'تەواو', done: true },
        { title: 'ڕاپۆرت نێردرا', sub: 'گەیشتە تیمی پلاتفۆرم', state: 'چالاک', active: true },
        { title: 'پشکنینی کۆتایی', sub: 'دڵنیابوون لە نەمان', state: 'دواتر' },
      ],
      floatingStrong: 'بەڵگەی ڕوون. کرداری ڕاستەقینە.',
      floatingText: 'هەموو هەنگاوێک بە شەفافی دەپارێزرێت.',
    },
    trust: {
      label: 'شێوازی مامەڵەکردن لەگەڵ هەموو کەیسێک',
      items: ['نهێنیپارێزیی تەواو', 'بەڵگەی مێژوودار', 'پسپۆڕانی مرۆیی', 'ئەنجامی پشکنراو'],
    },
    servicesSection: {
      eyebrow: 'ئەو خزمەتگوزارییانەی پێشکەشی دەکەین',
      heading: 'پشتگیریی ورد بۆ لابردنی هەموو جۆرە پێشێلکارییەکی سەرهێڵ.',
      intro:
        'هەر پلاتفۆرمێک مەرجی توندی هەیە بۆ قبوڵکردنی سکاڵا. ئێمە بەستەر، ناسنامە و وێنەی شاشەکانت دەکەینە فایلێکی فەرمی کە ڕاستەوخۆ دەگاتە تیمی بەرپرس.',
      items: [
        {
          category: 'خۆبەناساندنی ساختە',
          title: 'پڕۆفایلی ساختە و دزینی ناسنامە',
          body: 'کەسێک خۆی وەک تۆ یان کاروبارەکەت دەناسێنێت بۆ هەڵخەڵەتاندنی خەڵک؟ ناسنامە ڕاستەقینەکەت لەگەڵ هەژمارە ساختەکە بەراورد دەکەین و سکاڵای فەرمی تۆمار دەکەین.',
        },
        {
          category: 'ماڵپەڕ و براند',
          title: 'ماڵپەڕی کۆپی و فرۆشگای ساختە',
          body: 'ماڵپەڕی فێڵبازانە لۆگۆ یان دۆمەینی کارەکەت بەکاردەهێنن؟ پێشێلکاریی براندەکە دەسەلمێنین و ڕاپۆرت بۆ هۆست و تۆمارکەری دۆمەین دەنێرین.',
        },
        {
          category: 'میدیای تایبەت',
          title: 'وێنەی دزەپێکراو و ڤیدیۆی تایبەت',
          body: 'وێنە یان تۆماری کەسی بێ مۆڵەت بڵاوکراوەتەوە؟ بەستەرە ڕاستەقینەکان تۆمار دەکەین و داواکاری بەپەلەی لابردن بۆ ماڵپەڕەکان دەنێرین.',
        },
        {
          category: 'زیرەکی دەستکرد',
          title: 'دیپفەیک، گۆڕینی ڕووخسار و دەنگ',
          body: 'ڤیدیۆی دەستکاریکراوی AI یان دەنگی کلۆنکراو بەکارهاتووە؟ بەڵگەی بەراوردکاری ئامادە دەکەین و ڕاپۆرتەکە بە پەلە دەنێرین بۆ تیمی سەلامەتی.',
        },
        {
          category: 'مافی لەبەرگرتنەوە',
          title: 'بەرهەمی دزراو و بڵاوکردنەوەی بێ مۆڵەت',
          body: 'وێنە، ڤیدیۆ، کۆرس یان دیزاینەکانت بێ مۆڵەت کۆپی کراون؟ تۆمارەکانی خاوەندارێتی ڕێکدەخەین و سکاڵای فەرمیی DMCA و مافی لەبەرگرتنەوە پێشکەش دەکەین.',
        },
        {
          category: 'ئازاردان و ناوزڕاندن',
          title: 'هەراسانکردن، هەڕەشە و پۆستی ناڕاست',
          body: 'ئازاردانی دووبارە، بڵاوکردنەوەی زانیاری کەسی یان ناوزڕاندن؟ هەموو بەروار و وێنەکان ڕێکدەخەین تا تیمەکانی سەلامەتی بڕیاری یەکلاکەرەوە بدەن.',
        },
        {
          category: 'فریاکەوتنی بەپەلە',
          title: 'باجگیری و هەڕەشەی بڵاوکردنەوە',
          body: 'کەسێک هەڕەشە دەکات فایلی تایبەتت بڵاوبکاتەوە ئەگەر پارە نەدەیت؟ بەڵگەکان بە کۆدکراوی دەپارێزین و بە پەلە داوای لابردن دەکەین. ئەگەر لە مەترسیدایت، دەستبەجێ پەیوەندی بە پۆلیسی ناوخۆوە بکە.',
        },
        {
          category: 'هەواڵ و گەڕان',
          title: 'بابەتی زیانبەخش و ئەنجامی گەڕان',
          body: 'بابەتی هەواڵی کۆن یان ناڕاست لەسەر ناوت یان کۆمپانیاکەت دەردەکەوێت؟ هەڵدەسەنگێنین کام ڕێگە گونجاوترە: ڕاستکردنەوە، لابردن یان سڕینەوە لە گەڕان.',
        },
      ],
    },
    processSection: {
      eyebrow: 'چۆنیەتی کارکردن',
      heading: '٤ هەنگاوی ڕوون لە ناردنی یەکەم بەستەرەوە تا دڵنیابوون.',
      intro:
        'هەرگیز پێویست ناکات مەزەندە بکەیت کام فۆڕم پڕبکەیتەوە یان بێ وەڵام بمێنیتەوە. هەموو کەیسێک بە یەک ڕێڕەوی شەفافدا دەڕوات لە پانتایی تایبەتی خۆتدا.',
      platforms: ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'X', 'ماڵپەڕ و گەڕان'],
      steps: [
        {
          number: '01',
          title: 'بەستەر و زانیاری بنێرە',
          body: 'لە چەند خولەکێکدا کەیسێک بکەرەوە بە ناوهێنانی پلاتفۆرم، دانانی بەستەرە ڕاستەوخۆکە و هاوپێچکردنی وێنەی شاشەکان.',
        },
        {
          number: '02',
          title: 'پشکنینی پسپۆڕ بۆ بەڵگەکان',
          body: 'تیمەکەمان لە ١٢ تا ٤٨ کاتژمێردا بەستەرەکان دەپشکنێت و دەستبەجێ پێت دەڵێت ئەگەر ناسنامە یان وێنەیەکی تر فایلەکە بەهێزتر بکات.',
        },
        {
          number: '03',
          title: 'پێشکەشکردنی سکاڵای فەرمی',
          body: 'فایلێکی هاوتەریب لەگەڵ یاساکانی پلاتفۆرم ئامادە دەکەین و ڕاستەوخۆ دەیگەیەنینە کەناڵی فەرمیی پلاتفۆرم یان هۆستەکە.',
        },
        {
          number: '04',
          title: 'دڵنیابوونی زیندوو و بڕوانامە',
          body: 'بەدواداچوون بۆ وەڵامەکان دەکەین، بەستەرەکە دەپشکنین تا دڵنیابین نەماوە، پاشان تۆماری فەرمیی داخستنت پێ دەدەین.',
        },
      ],
    },
    approachSection: {
      eyebrow: 'ڕاستگۆ و بەرپرسیار',
      heading: 'لەسەر بەڵگەی ڕوون، پشکنینی مرۆیی و ڕاستگۆیی بنیاتنراوە.',
      intro:
        'تەنها پلاتفۆرم یان هۆستەکە دەسەڵاتی کۆتایی لابردنی ناوەڕۆکی هەیە. ئەرکی ئێمە پێشکەشکردنی بەهێزترین فایل و پێدانی زانیاری ڕاستەقینەیە لە هەموو هەنگاوێکدا.',
      cards: [
        {
          title: 'پشکنینی مرۆیی ڕاستەقینە',
          body: 'هەموو سکاڵایەک بە دەستی لەلایەن پسپۆڕێکەوە دەپشکنرێت و دەنێردرێت—هەرگیز بە بۆتی خۆکار نانێردرێت.',
        },
        {
          title: 'بەڵگە بە ستانداردی پلاتفۆرم',
          body: 'بەستەرە وردەکان لەگەڵ وێنەی مێژوودار و بەڵگەی ناسنامە یان خاوەندارێتی کۆدەکەینەوە کە تیمەکان قبوڵی دەکەن.',
        },
        {
          title: 'ڕێڕەوی زیندووی کەیس',
          body: 'هەموو قۆناغەکان لە پۆرتاڵەکەتدا ببینە، قسە لەگەڵ تیمی کەیسەکەت بکە و فایلەکانت وەک PDF یان CSV دابگرە.',
        },
        {
          title: 'بەڵێنی ناڕاست نادەین',
          body: 'پلاتفۆرمەکان بەپێی یاسای خۆیان بڕیار دەدەن، بۆیە گەرەنتی لابردن نادەین؛ بەڵکو گەرەنتی ئامادەکاری ورد و ڕاستگۆیی دەکەین.',
        },
      ],
    },
    pricingSection: {
      eyebrow: 'نرخی شەفاف',
      heading: 'نرخی جێگیر و یەکجارە بۆ هەر کەیسێک — بێ ئابوونە.',
      intro:
        'تەنها یەک جار پارە دەدەیت بۆ ئەو خزمەتگوزارییەی پێویستتە. پاکێجێک هەڵبژێرە بۆ ناردنی زانیاری سەرەتایی، پێش دەستپێکردن سنووری تەواوت بۆ دووپات دەکەینەوە.',
      footnote:
        'هەموو نرخەکان بە دۆلاری ئەمریکین و تەنها یەک جار دەدرێن بێ هیچ پارەدانێکی مانگانە. سنووری کۆتایی هەمیشە دوای پشکنینی کەیسەکەت پشتڕاست دەکرێتەوە. لەبەر ئەوەی پلاتفۆرمەکان سەربەخۆ بڕیار دەدەن، لابردن گەرەنتی ناکرێت. لە کاتی مەترسی یان باجگیری بەپەلەدا، نامەکان بپارێزە و پەیوەندی بە پۆلیسەوە بکە.',
      plans: [
        {
          code: 'fake_website',
          name: 'لابردنی ماڵپەڕی ساختە',
          desc: 'داخستنی ماڵپەڕی فێڵبازانە، پەڕەی ساختە و فرۆشگای کۆپی کە ناو و لۆگۆی کۆمپانیاکەت دەقۆزنەوە.',
          unit: '/ کەیس',
          cta: 'هەڵبژاردنی لابردنی ماڵپەڕ',
          features: [
            'پشکنینی تەواوی ماڵپەڕ و تۆماری دۆمەین',
            'بەڵگەدارکردنی بەکارهێنانی نایاسایی براند',
            'ناردنی سکاڵا بۆ هۆست و تۆمارکەری دۆمەین',
            'بەدواداچوون تا بڕیاری کۆتایی هۆستەکە',
          ],
        },
        {
          code: 'deepfake_video',
          name: 'لابردنی دیپفەیک و ڤیدیۆی AI',
          desc: 'لابردنی ڤیدیۆی دروستکراو بە زیرەکی دەستکرد، گۆڕینی ڕووخسار یان دەنگ بێ ڕەزامەندیی تۆ.',
          unit: '/ کەیس',
          badge: 'چاودێری پسپۆڕانە',
          cta: 'هەڵبژاردنی لابردنی دیپفەیک',
          features: [
            'پشکنینی ڤیدیۆ سەرەکی و کۆپییەکان',
            'بەڵگەی بەراوردکاری ڕووخسار و ناسنامە',
            'ناردنی بەپەلە بۆ پلاتفۆرمی خانەخوێ',
            'پشکنینی زیندوو و دڵنیابوون لە لابردن',
          ],
        },
        {
          code: 'copyright_protection',
          name: 'مافی لەبەرگرتنەوە و بەرهەمی دزراو',
          desc: 'پاراستنی وێنە، ڤیدیۆ، دیزاین یان نووسینی ڕەسەن کە بێ مۆڵەت بڵاوکراوەتەوە.',
          unit: '/ کەیس',
          cta: 'پاراستنی بەرهەمەکانم',
          features: [
            'بەراوردکردنی بەرهەمی ڕەسەن و دزراو',
            'ڕێکخستنی لیستی بەڵگەی خاوەندارێتی',
            'پێشکەشکردنی سکاڵای فەرمی DMCA',
            'چاودێریکردنی وەڵامی پلاتفۆرم',
          ],
        },
        {
          code: 'news_reputation',
          name: 'بابەتی هەواڵ و ئەنجامی گەڕان',
          desc: 'چارەسەرکردنی هەواڵی زیانبەخش یان ئەنجامی گەڕان لە ڕێگەی پەیوەندی بە بڵاوکەرەوە، ڕاستکردنەوە یان لابردن لە گەڕان.',
          unit: '/ کەیس',
          cta: 'داوای پشکنینی بابەت',
          features: [
            'هەڵسەنگاندنی بابەت، بڵاوکەرەوە و گەڕان',
            'ڕوونکردنەوەی بژاردە واقعی و گونجاوەکان',
            'ناردنی داواکاری نووسراو بۆ سەرنووسەر یان گەڕان',
            'پوختەی بەدواداچوون و ئەنجام',
          ],
        },
        {
          code: 'image_removal',
          name: 'لابردنی وێنە',
          desc: 'سڕینەوەی وێنەیەکی کەسی یان دزراو لە ماڵپەڕ یان پڕۆفایلێکی سۆشیاڵ میدیا بە بەڵگەی تەواوەوە.',
          unit: '/ وێنە',
          cta: 'لابردنی وێنە',
          features: [
            'پشکنینی تایبەت بۆ یەک وێنە',
            'پاراستنی بەستەری ڕاستەوخۆ و وێنەی شاشە',
            'ناردنی سکاڵا و پشکنینی بەدواداچوون',
          ],
        },
        {
          code: 'impostor_account',
          name: 'لابردنی هەژماری ساختە',
          desc: 'لابردنی پڕۆفایلە ساختەکان کە خۆیان بە ناوی تۆ یان کارەکەت دەناسێنن لە Instagram، Facebook، TikTok یان X.',
          unit: '/ هەژمار',
          cta: 'لابردنی هەژماری ساختە',
          features: [
            'بەراوردکردنی ناسنامە و هەژمارە ساختەکە',
            'ناردنی سکاڵای فەرمی خۆبەناساندن',
            'پشتڕاستکردنەوەی داخستنی هەژمار',
          ],
        },
        {
          code: 'video_extortion',
          name: 'لابردنی ڤیدیۆی باجگیری',
          desc: 'مامەڵەی بەپەلە و نهێنی بۆ ڤیدیۆی بێ مۆڵەت کە پەیوەندی بە هەڕەشە و داواکاری پارەوە هەیە.',
          unit: '/ کەیس',
          badge: 'ئەولەویەتی بەپەلە',
          cta: 'داواکردنی یارمەتی بەپەلە',
          features: [
            'پشکنینی خێرا لە ماوەی ١٢ کاتژمێردا',
            'پاراستنی کۆدکراوی بەڵگەکانی هەڕەشە',
            'ناردنی بەپەلە بۆ تیمی سەلامەتی پلاتفۆرم',
          ],
        },
        {
          code: 'page_takedown',
          name: 'لابردنی پەڕە یان پۆست',
          desc: 'سڕینەوەی پۆست یان پەڕەیەکی گشتی دیاریکراو کە نهێنی تۆ یان یاساکانی سەلامەتی پێشێل دەکات.',
          unit: '/ کەیس',
          cta: 'داوای لابردنی پەڕە',
          features: [
            'پشکنینی پەڕە و جۆری پێشێلکاری',
            'فایلی سکاڵای پشتبەستوو بە بەڵگە',
            'بەدواداچوون تا دڵنیابوونی کۆتایی',
          ],
        },
      ],
    },
    outcomesSection: {
      eyebrow: 'بۆچی بەڵگە گرنگە',
      heading: 'فایلی ڕێکخراو زووتر لەلایەن تیمەکانەوە کاری لەسەر دەکرێت.',
      intro:
        'سکاڵای ناڕوون بێ وەڵام دەمێنێتەوە. ئێمە هەموو بەستەرێک دەپشکنین، بەڵگەکان بە مۆری کات دەپارێزین و کەیسەکە دەگەیەنینە بەشی پەیوەندیدار.',
      liveActivity: (verified, resolved, total) =>
        `چالاکی زیندوو: ${verified} پشکنینی بەستەر تەواوبوو · ${resolved} لە ${total} کەیس چارەسەرکراون`,
      metrics: [
        {
          value: '12–48 ك',
          label: 'پشکنینی خێرای پسپۆڕ',
          detail: 'کەیسە نوێیەکان لە ماوەی ٤٨ کاتژمێردا—یان ١٢ کاتژمێر بۆ هەڕەشەی بەپەلە—دەپشکنرێن.',
        },
        {
          value: '100%',
          label: 'ئامادەکردنی مرۆیی',
          detail: 'هەموو سکاڵایەک بە دەستی پسپۆڕێک بەپێی یاسای پلاتفۆرمی مەبەست دەنووسرێت.',
        },
        {
          value: 'SHA-256',
          label: 'خەزێنەی پارێزراوی بەڵگە',
          detail: 'وێنەی شاشە، ناسنامە و تۆمارەکان پەنجەمۆری دیجیتاڵی و کاتیان پێ دەدرێت.',
        },
        {
          value: 'تەواو',
          label: 'پۆرتاڵی تایبەتی کڕیار',
          detail: 'قۆناغەکان ببینە، قسە لەگەڵ تیم بکە و بڕوانامەی فەرمیی PDF دابگرە.',
        },
      ],
      channelsTitle: 'ئەو لایەنە فەرمییانەی سکاڵاکانیان بۆ دەنێرین',
      channels: [
        {
          platform: 'Meta (Instagram و Facebook)',
          pathway: 'بەشی خۆبەناساندن و مافەکان',
          focus: 'هەژماری ساختە، وێنەی کەسی دزراو، پەڕەی کاروباری کۆپیکراو',
        },
        {
          platform: 'TikTok و YouTube',
          pathway: 'مێزی سەلامەتی، نهێنی و ڕووخسار',
          focus: 'ڤیدیۆی دیپفەیک، دزەپێکردنی تایبەت، هەراسانکردن یان باجگیری',
        },
        {
          platform: 'هۆست و تۆمارکەرانی دۆمەین',
          pathway: 'ئاگاداریی خراپ بەکارهێنان و براند',
          focus: 'ماڵپەڕی فێڵبازانە، فرۆشگای ساختە، دۆمەینی هاوشێوەی براند',
        },
        {
          platform: 'بزوێنەرەکانی گەڕان و بڵاوکەرەوەکان',
          pathway: 'داواکاری ڕاستکردنەوە و لابردن لە گەڕان',
          focus: 'بابەتی هەواڵی زیانبەخش و بەستەرە زیانبەخشەکانی گەڕان',
        },
      ],
    },
    estimatorSection: {
      eyebrow: 'پشکنینی خێرای کەیس',
      heading: 'لە ٣٠ چرکەدا باشترین ڕێگای لابردن بزانە.',
      intro:
        'جۆری کێشە، پلاتفۆرم و ئەو بەڵگانەی لاتن هەڵبژێرە بۆ بینینی خزمەتگوزاریی گونجاو، کاتی پشکنین و لیستی ئامادەکاری.',
      issueLabel: '١. چ جۆرە کێشەیەکت هەیە؟',
      platformLabel: '٢. لە کوێ بڵاوکراوەتەوە؟',
      urlToggle: 'بەستەری ڕاستەوخۆی (URL) ناوەڕۆکەکەم لایە',
      proofToggle: 'دەتوانم ناسنامە یان بەڵگەی خاوەندارێتی بدەم',
      extortionToggle: 'کەسێک ئێستا هەڕەشەم لێ دەکات یان باجم لێ دەسەنێت',
      readinessLabel: 'ئامادەیی کەیس',
      suggestedLabel: 'خزمەتگوزاری پێشنیارکراو',
      channelLabel: 'کەناڵی فەرمیی سکاڵا',
      slaLabel: 'کاتی یەکەم پشکنین',
      urgentSlaText: 'لە ماوەی ١٢ کاتژمێردا (بەپەلە)',
      standardSlaText: (hours) => `لە ماوەی ${hours} کاتژمێردا`,
      checklistTitle: 'چی یارمەتی پەسەندکردنی خێرا دەدات',
      useInInquiryCta: 'پڕکردنەوەی نامە بەم وردەکارییانە',
      openWorkspaceCta: 'چوونەژوورەوە بۆ کردنەوەی کەیس',
    },
    faqSection: {
      eyebrow: 'پرسیارە باوەکان',
      heading: 'وەڵامی ڕاستەوخۆ پێش دەستپێکردن.',
      intro: 'هەموو زانیارییەک دەربارەی نهێنیپارێزی، کات، بەڵگەکان و چۆنیەتی بڕیاردانی پلاتفۆرمەکان.',
      items: [
        {
          q: 'ئایا گەرەنتی دەکەن ناوەڕۆکەکە لاببرێت؟',
          a: 'هیچ لایەنێکی ڕاستگۆ ناتوانێت گەرەنتی لابردن بدات، چونکە ماڵپەڕ یان پلاتفۆرمەکە بڕیاری کۆتایی بەپێی یاساکانی خۆی دەدات. ئەوەی ئێمە گەرەنتی دەکەین پشکنینی وردی بەڵگە، ناردنی فایلی فەرمی بەهێز، بەدواداچوون و نوێکردنەوەی ڕاستگۆیانەیە.',
        },
        {
          q: 'کێ ڕاپۆرتەکان ئامادە دەکات و دەیاننێرێت؟',
          a: 'پسپۆڕانی ڕاهێنراوی Full Remove هەموو کەیسێکی پەسەندکراو بە دەستی دەپشکنن و ڕاپۆرتی گونجاو لە ڕێگەی کەناڵە فەرمییەکانەوە دەنێرن.',
        },
        {
          q: 'چی پێویستە ئامادە بکەم بۆ دەستپێکردن؟',
          a: 'تەنها ناوی پلاتفۆرم، بەستەری ڕاستەوخۆی پۆست یان هەژمارەکە، کورتەیەک لەوەی ڕوویداوە و هەر وێنەی شاشە یان بەڵگەی ناسنامە و خاوەندارێتییەک بەسە.',
        },
        {
          q: 'کام پلاتفۆرم و ماڵپەڕانە دەگرێتەوە؟',
          a: 'کار لەسەر Instagram، Facebook، TikTok، YouTube، X، بەستەرەکانی گەڕانی Google، ماڵپەڕە سەربەخۆکان، فرۆشگاکان و بڵاوکەرەوەکان دەکەین.',
        },
        {
          q: 'چۆن ئاگاداری پێشکەوتنی کەیسەکەم بم؟',
          a: 'لە پۆرتاڵی تایبەتی خۆتدا قۆناغ بە قۆناغ، وەڵامی پسپۆڕەکەت، ئاگادارکردنەوەی دەستبەجێ و بڕوانامەی PDF یان خشتەی CSV دەبینیت.',
        },
        {
          q: 'ماوەی جێبەجێکردن بەگشتی چەند دەخایەنێت؟',
          a: 'تیمەکەمان لە ١٢ تا ٤٨ کاتژمێردا پشکنینی سەرەتایی تەواو دەکات. دوای ناردن بۆ پلاتفۆرم، ماوەی وەڵام بەپێی پلاتفۆرمەکە دەگۆڕێت و ئێمە تا دڵنیابوون بەدواداچوون دەکەین.',
        },
      ],
    },
    contactSection: {
      eyebrow: 'لەگەڵ تیمەکەمان قسە بکە',
      heading: 'پێمان بڵێ چی ڕوویداوە؛ ڕوونترین هەنگاوی داهاتووت نیشان دەدەین.',
      intro:
        'ئامادە نیت هێشتا هەژمار دروست بکەیت؟ نامەیەکی نهێنی ڕاستەوخۆ بۆ پسپۆڕەکانمان بنێرە یان بە کۆدی بەدواداچوون سەیری پەیامێکی پێشوو بکە.',
      makeInquiry: 'ناردنی نامە',
      whatsappCta: 'لە واتساپ بە نهێنی قسە بکە',
      referencePrefix: 'کۆدی بەدواداچوون',
      form: {
        nameLabel: 'ناوت',
        namePlaceholder: 'ناوی تەواو',
        emailLabel: 'ئیمەیڵ',
        emailPlaceholder: 'you@example.com',
        serviceLabel: 'کام خزمەتگوزاری گونجاوترە؟',
        otherOption: 'پرسیارێکی تری نهێنی یان لابردن',
        messageLabel: 'پوختەی کێشەکە',
        messagePlaceholder: 'بە کورتی ڕوونی بکەرەوە چی ڕوویداوە و بەستەرەکان دابنێ…',
        submitBtn: 'ناردنی نامەی نهێنی ←',
        sendingBtn: 'دەنێردرێت…',
        sendingNote: 'نامەکەت کۆد دەکرێت و بە پارێزراوی دەگاتە تیمی پشکنین…',
        successNote: 'نامەکەت گەیشت. تیمەکەمان لە contact@fremove.com بە زوویی وەڵامت دەداتەوە.',
        errorNote: 'ئێستا نەتوانرا بنێردرێت. تکایە دووبارە هەوڵ بدەوە یان ئیمەیڵ بنێرە بۆ contact@fremove.com.',
      },
      tracker: {
        heading: 'پشکنینی نامەیەکی پێشوو',
        placeholder: 'کۆدی بەدواداچوون (وەک: INQ-SEED-1)',
        button: 'پشکنین',
        checking: 'دەپشکنرێت…',
        notFound: 'هیچ نامەیەک بەم کۆدە نەدۆزرایەوە.',
        statusLabel: 'دۆخی ئێستا',
        openedCaseLabel: 'کەیسی پەیوەندیدار',
      },
    },
    widget: {
      launch: 'پێویستت بە یارمەتییە؟',
      title: 'لەگەڵ Full Remove قسە بکە',
      intro: 'خێراترین ڕێگای نهێنی هەڵبژێرە بۆ پەیوەندی—بێ دروستکردنی هەژمار.',
      waTitle: 'چاتی واتساپ',
      waSub: 'نامەی ڕاستەوخۆ و تایبەت',
      callTitle: 'پەیوەندی بە پسپۆڕانەوە',
      callSub: '+964 780 558 6584',
      emailTitle: 'ناردنی ئیمەیڵ',
      emailSub: 'contact@fremove.com',
      inquiryTitle: 'ناردنی نامەیەکی نهێنی',
      inquirySub: 'بچۆرە سەر فۆڕمە خێراکەی خوارەوە',
      foot: 'بۆ هەڕەشە و باجگیری بەپەلە، ڕاستەوخۆ پەیوەندی بکە یان لە واتساپ نامە بنێرە.',
    },
    footer: {
      tagline:
        'پاراستنی پسپۆڕانەی نهێنی سەرهێڵ، پاراستنی بەڵگە و ناردنی داواکاری فەرمی بۆ لابردنی ناوەڕۆک.',
      exploreTitle: 'گەڕان',
      resourcesTitle: 'بەستەرەکان',
      touchTitle: 'پەیوەندیی ڕاستەوخۆ',
      verifyLink: 'دڵنیابوون لە بڕوانامە',
      privacyLink: 'ئاگاداریی تایبەتمەندی',
      termsLink: 'مەرجەکانی خزمەتگوزاری',
      whatsappLabel: 'واتساپ: +964 780 558 6584',
      emailLabel: 'ئیمەیڵ: contact@fremove.com',
      inquiryLink: 'ناردنی داواکاری',
      copyright: '© 2026 Full Remove. هەموو مافەکان پارێزراون.',
      motto: 'نهێنی، پشتبەستوو بە بەڵگە و مرۆیی.',
      disclaimer:
        'Full Remove بەڵگەکان ئامادە دەکات و داواکاری لابردن لە بری تۆ دەنێرێت. ئێمە خزمەتگوزارییەکی سەربەخۆین و پەیوەندیمان بە هیچ تۆڕێکی کۆمەڵایەتی، هۆست یان بزوێنەرێکی گەڕانەوە نییە؛ بڕیاری کۆتایی تەنها لای ئەو پلاتفۆرمانەیە.',
    },
  },
};
