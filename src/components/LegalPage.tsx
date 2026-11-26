import { ArrowLeft } from 'lucide-react';
import { SITE_TRANSLATIONS, type LangCode } from '../data/translations';
import { LandingHeader } from './LandingHeader';

interface LegalPageProps {
  mode: 'privacy' | 'terms';
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigate: (path: string) => void;
}

const LEGAL_COPY: Record<
  LangCode,
  {
    backHome: string;
    privacyEyebrow: string;
    privacyTitle: string;
    termsEyebrow: string;
    termsTitle: string;
    effective: string;
    privacySections: Array<{ heading: string; body: string }>;
    termsSections: Array<{ heading: string; body: string }>;
  }
> = {
  en: {
    backHome: 'Back to home',
    privacyEyebrow: 'Privacy & Data Care',
    privacyTitle: 'Privacy Notice',
    termsEyebrow: 'Terms of Service',
    termsTitle: 'Terms of Service',
    effective: 'Effective 2026 · Full Remove · contact@fremove.com',
    privacySections: [
      {
        heading: '1. What Information We Collect',
        body: 'We only ask for details needed to review your case, verify who owns the account or content, and send clear takedown reports to the website or social platform.',
      },
      {
        heading: '2. How We Protect Your Files',
        body: 'Uploaded screenshots, ID documents, and links are stored in encrypted storage and visible only to you and the staff handling your case. Internal team notes stay private.',
      },
      {
        heading: '3. Download or Delete Your Data',
        body: 'You can request a copy of your data or ask us to delete your account anytime from your workspace settings, or by emailing contact@fremove.com.',
      },
    ],
    termsSections: [
      {
        heading: '1. Platforms Make the Final Choice',
        body: 'Full Remove prepares your evidence, submits official requests, and tracks the result. Only the hosting website or social platform can decide to remove content under their rules, so removal cannot be guaranteed.',
      },
      {
        heading: '2. Clear Pricing & Review',
        body: 'A team member checks every case before filing. Package prices are one-time fees and are always confirmed with you before work begins.',
      },
      {
        heading: '3. Urgent Safety & Blackmail',
        body: 'If someone is threatening your safety or blackmailing you, save screenshots safely and contact local police or emergency services right away.',
      },
    ],
  },
  ar: {
    backHome: 'العودة للرئيسية',
    privacyEyebrow: 'الخصوصية وحماية البيانات',
    privacyTitle: 'إشعار الخصوصية',
    termsEyebrow: 'شروط الخدمة',
    termsTitle: 'شروط الخدمة',
    effective: 'ساري لعام 2026 · Full Remove · contact@fremove.com',
    privacySections: [
      {
        heading: '1. المعلومات التي نجمعها',
        body: 'نطلب فقط التفاصيل اللازمة لمراجعة حالتك، والتحقق من ملكية الحساب أو المحتوى، وإرسال بلاغات إزالة واضحة إلى الموقع أو المنصة.',
      },
      {
        heading: '2. كيف نحمي ملفاتك',
        body: 'تُحفظ لقطات الشاشة ووثائق الهوية والروابط في تخزين مشفّر ولا يطلع عليها سوى أنت والفريق المسؤول عن حالتك. تبقى ملاحظات الفريق الداخلية سرية.',
      },
      {
        heading: '3. تنزيل بياناتك أو حذفها',
        body: 'يمكنك طلب نسخة من بياناتك أو طلب حذف حسابك في أي وقت من إعدادات مساحتك، أو عبر البريد contact@fremove.com.',
      },
    ],
    termsSections: [
      {
        heading: '1. المنصات تتخذ القرار النهائي',
        body: 'يقوم Full Remove بتجهيز أدلتك وتقديم الطلبات الرسمية ومتابعة النتيجة. القرار النهائي بالإزالة يعود للموقع أو المنصة وفق سياساتها، لذا لا يمكن ضمان الإزالة.',
      },
      {
        heading: '2. تسعير واضح ومراجعة مسبقة',
        body: 'يراجع أحد أعضاء الفريق كل حالة قبل تقديم البلاغ. أسعار الباقات تُدفع لمرة واحدة ويتم تأكيدها معك دائماً قبل بدء العمل.',
      },
      {
        heading: '3. السلامة العاجلة والابتزاز',
        body: 'إذا كان هناك من يهدد سلامتك أو يبتزك، احتفظ بلقطات الشاشة بأمان وتواصل فوراً مع الشرطة المحلية أو خدمات الطوارئ.',
      },
    ],
  },
  ku: {
    backHome: 'گەڕانەوە بۆ سەرەتا',
    privacyEyebrow: 'تایبەتمەندی و پاراستنی داتا',
    privacyTitle: 'ئاگاداریی تایبەتمەندی',
    termsEyebrow: 'مەرجەکانی خزمەتگوزاری',
    termsTitle: 'مەرجەکانی خزمەتگوزاری',
    effective: 'کارپێکراو ٢٠٢٦ · Full Remove · contact@fremove.com',
    privacySections: [
      {
        heading: '١. چ زانیارییەک کۆدەکەینەوە',
        body: 'تەنها ئەو وردەکارییانە داوا دەکەین کە پێویستن بۆ پشکنینی کەیسەکەت، دڵنیابوون لە خاوەندارێتی هەژمار یان ناوەڕۆک، و ناردنی داواکاری فەرمی بۆ ماڵپەڕ یان پلاتفۆرم.',
      },
      {
        heading: '٢. چۆن فایلەکانت دەپارێزین',
        body: 'وێنەی شاشە، ناسنامە و بەستەرە بارکراوەکان بە شێوەیەکی کۆدکراو هەڵدەگیرێن و تەنها تۆ و تیمی بەرپرس لە کەیسەکەت دەتوانن بیانبینن. تێبینییە ناوخۆییەکان نهێنی دەمێننەوە.',
      },
      {
        heading: '٣. داگرتن یان سڕینەوەی داتاکانت',
        body: 'هەر کاتێک دەتوانیت داوای کۆپی داتاکانت یان سڕینەوەی هەژمارەکەت بکەیت لە ڕێکخستنی پانتایی کارەکەت، یان لە ڕێگەی contact@fremove.com.',
      },
    ],
    termsSections: [
      {
        heading: '١. پلاتفۆرمەکان بڕیاری کۆتایی دەدەن',
        body: 'Full Remove بەڵگەکانت ئامادە دەکات، داواکاری فەرمی دەنێرێت و بەدواداچوون دەکات. تەنها ماڵپەڕ یان پلاتفۆرمە خانەخوێیەکە بڕیاری لابردن دەدات بەپێی یاساکانی خۆی، بۆیە لابردن گەرەنتی ناکرێت.',
      },
      {
        heading: '٢. نرخی ڕوون و پشکنینی پێشوەختە',
        body: 'ئەندامێکی تیم پێش ناردن هەموو کەیسێک دەپشکنێت. نرخی پاکێجەکان یەک جار دەدرێت و هەمیشە پێش دەستپێکردن لەگەڵت دووپات دەکرێتەوە.',
      },
      {
        heading: '٣. سەلامەتی بەپەلە و هەڕەشە',
        body: 'ئەگەر کەسێک هەڕەشە لە سەلامەتیت دەکات یان هەوڵی باجگرتنت دەدات، وێنەی شاشە بە پارێزراوی هەڵبگرە و دەستبەجێ پەیوەندی بە پۆلیسی ناوخۆ یان فریاگوزاری بکە.',
      },
    ],
  },
};

export function LegalPage({ mode, lang, onChangeLang, onNavigate }: LegalPageProps) {
  const copy = SITE_TRANSLATIONS[lang];
  const legal = LEGAL_COPY[lang];
  const isPrivacy = mode === 'privacy';
  const sections = isPrivacy ? legal.privacySections : legal.termsSections;

  return (
    <div dir={copy.dir} className="min-h-screen bg-[#F7FAFC] text-[#041E4A]">
      <LandingHeader lang={lang} onChangeLang={onChangeLang} onNavigate={onNavigate} subpage />

      <main className="mx-auto max-w-[820px] px-5 py-14 sm:px-8">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#041E4A] cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span>{legal.backHome}</span>
        </button>

        <div className="mt-6 rounded-2xl border border-[#DCE7F2] bg-white p-7 sm:p-10 shadow-[0_12px_32px_-22px_rgba(4,30,74,0.1)]">
          <div className="border-b border-slate-200 pb-6">
            <p className="text-xs font-semibold text-[#00758A]">
              {isPrivacy ? legal.privacyEyebrow : legal.termsEyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#041E4A] sm:text-4xl">
              {isPrivacy ? legal.privacyTitle : legal.termsTitle}
            </h1>
            <p className="mt-2 text-xs text-slate-500">{legal.effective}</p>
          </div>

          <article className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-lg font-semibold text-[#041E4A]">
                  {section.heading}
                </h2>
                <p className="mt-2">{section.body}</p>
              </section>
            ))}
          </article>
        </div>
      </main>
    </div>
  );
}
