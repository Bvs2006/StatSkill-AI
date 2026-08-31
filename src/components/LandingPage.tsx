import React, { useState } from "react";
import { type Screen } from "../App";
import { getCourses, getCourseImage, DEFAULT_COMPETENCIES_CATALOGUE } from "../services/storageService";
import { useLanguage } from "../services/i18n";

interface LandingPageProps {
  onEnterApp: (screen?: Screen) => void;
  onDemoLogin: (role: "learner" | "trainer" | "admin") => void;
}

export function LandingPage({ onEnterApp, onDemoLogin }: LandingPageProps) {
  const { t, lang, setLang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const courses = getCourses();

  const categories = [
    {
      id: "national_accounts",
      title: lang === "HI" ? "राष्ट्रीय लेखा एवं जीवीए" : lang === "TE" ? "జాతీయ ఖాతాలు & GVA" : "National Accounts & GVA",
      subtitle: lang === "HI" ? "यूएन एसएनए 2008, इनपुट-आउटपुट टेबल, जीडीपी आधार संशोधन" : lang === "TE" ? "UN SNA 2008, ఇన్‌పుట్-అవుట్‌పుట్ పట్టికలు, GDP పునర్నిర్మాణం" : "UN SNA 2008, Input-Output Tables, GDP Rebasing",
      courseCount: "45 Courses",
      icon: "📊",
      bgGradient: "from-blue-600 to-indigo-700",
      accent: "bg-blue-50 text-blue-700",
    },
    {
      id: "survey_sampling",
      title: lang === "HI" ? "सर्वेक्षण प्रतिचयन एवं पीएलएफएस" : lang === "TE" ? "సర్వే శాంప్లింగ్ & PLFS" : "Survey Sampling & PLFS",
      subtitle: lang === "HI" ? "द्वि-चरणीय प्रतिचयन, पीपीएस, गुणक गणना" : lang === "TE" ? "రెండు-దశల శాంప్లింగ్, PPS, గుణకాల సూత్రాలు" : "Two-Stage Sampling, PPS, Multiplier Math",
      courseCount: "38 Courses",
      icon: "📋",
      bgGradient: "from-emerald-600 to-teal-700",
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      id: "price_indices",
      title: lang === "HI" ? "मूल्य सूचकांक एवं मुद्रास्फीति" : lang === "TE" ? "ధరల సూచికలు & ద్రవ్యోల్బణం" : "Price Indices & Inflation",
      subtitle: lang === "HI" ? "सीपीआई, डब्ल्यूपीआई, संशोधित लासपेयर्स संकलन" : lang === "TE" ? "CPI, WPI, సవరించిన లాస్పెయర్స్ పద్ధతి" : "CPI, WPI, Modified Laspeyres Compilation",
      courseCount: "24 Courses",
      icon: "🏷️",
      bgGradient: "from-amber-500 to-orange-600",
      accent: "bg-amber-50 text-amber-800",
    },
    {
      id: "data_science",
      title: lang === "HI" ? "डेटा विज्ञान एवं पायथन/आर" : lang === "TE" ? "డేటా సైన్స్ & పైథాన్/ఆర్" : "Data Science & Python/R",
      subtitle: lang === "HI" ? "एनएसएसओ माइक्रोडाटा विश्लेषण, पांडास ऑटोमेशन" : lang === "TE" ? "NSSO మైక్రోడేటా విశ్లేషణ, పాండాస్ ఆటోమేషన్" : "NSSO Microdata Parsing, Pandas Automation",
      courseCount: "52 Courses",
      icon: "🐍",
      bgGradient: "from-purple-600 to-indigo-800",
      accent: "bg-purple-50 text-purple-700",
    },
    {
      id: "data_privacy",
      title: lang === "HI" ? "डेटा गोपनीयता एवं प्रशासन" : lang === "TE" ? "డేటా గోప్యత & పాలన" : "Data Privacy & Governance",
      subtitle: lang === "HI" ? "डीपीडीपी अधिनियम 2023, सांख्यिकीय प्रकटीकरण नियंत्रण" : lang === "TE" ? "DPDP చట్టం 2023, డేటా గోప్యతా నియమాలు" : "DPDP Act 2023, Statistical Disclosure Control",
      courseCount: "18 Courses",
      icon: "🔒",
      bgGradient: "from-rose-600 to-red-700",
      accent: "bg-rose-50 text-rose-700",
    },
    {
      id: "sdgs",
      title: lang === "HI" ? "एसडीजी एवं राष्ट्रीय संकेतक" : lang === "TE" ? "SDGs & జాతీయ సూచికలు" : "SDGs & National Indicators",
      subtitle: lang === "HI" ? "राष्ट्रीय संकेतक ढांचा (NIF), नीति आयोग सूचकांक" : lang === "TE" ? "జాతీయ సూచికల ఫ్రేమ్‌వర్క్ (NIF), నీతి ఆయోగ్ ఇండెక్స్" : "National Indicator Framework, NITI Aayog Index",
      courseCount: "29 Courses",
      icon: "🌐",
      bgGradient: "from-cyan-600 to-blue-700",
      accent: "bg-cyan-50 text-cyan-700",
    },
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      activeCategory === "all" ||
      (activeCategory === "national_accounts" && c.category.includes("National Accounts")) ||
      (activeCategory === "survey_sampling" && (c.category.includes("Survey") || c.category.includes("Sampling"))) ||
      (activeCategory === "data_science" && (c.category.includes("Data") || c.category.includes("Python") || c.category.includes("Technical"))) ||
      (activeCategory === "governance" && (c.category.includes("Governance") || c.category.includes("Privacy")));
    return matchesSearch && matchesCat;
  });

  const faqs = [
    {
      q: lang === "HI" ? "क्लोज्ड-लूप दक्षता इंजन कैसे कार्य करता है?" : lang === "TE" ? "క్లోజ్డ్-లూప్ కాంపిటెన్సీ ఇంజిన్ ఎలా పనిచేస్తుంది?" : "How does the Closed-Loop Competency Engine work?",
      a: lang === "HI" ? "स्टेटस्किल एआई 4 चरणों में काम करता है: 1) एआई आधारित प्रश्नोत्तरी से दक्षता का परीक्षण, 2) संवर्ग मानकों के विरुद्ध सटीक कौशल अंतराल की पहचान, 3) व्यक्तिगत एनएसएसटीए/आईजीओटी शिक्षण पथ, और 4) सिद्ध प्रवीणता पर क्रिप्टोग्राफिक ऑडिट ट्रेल के साथ स्तर पदोन्नति।" : lang === "TE" ? "స్టాట్‌స్కిల్ AI 4 దశల చక్రంలో పనిచేస్తుంది: 1) AI పరీక్షల ద్వారా సామర్థ్య అంచనా, 2) కేడర్ ప్రమాణాల ఆధారంగా నైపుణ్య లోపాల గుర్తింపు, 3) వ్యక్తిగతీకరించిన NSSTA/iGOT అభ్యాస మార్గాలు, మరియు 4) ధృవీకరించిన నైపుణ్యంతో స్థాయి పెంపు." : "StatSkill AI operates on a continuous 4-stage cycle: 1) Assess diagnostic skills with AI MCQs, 2) Identify exact skill gaps against Indian Statistical Service cadre benchmarks, 3) Deliver personalized NSSTA/iGOT learning paths, and 4) Elevate competency levels with cryptographic audit logging upon demonstrated mastery.",
    },
    {
      q: lang === "HI" ? "क्या स्टेटस्किल एआई iGOT कर्मयोगी से जुड़ा है?" : lang === "TE" ? "స్టాట్‌స్కిల్ AI iGOT కర్మయోగితో అనుసంధానించబడిందా?" : "Is StatSkill AI integrated with iGOT Karmayogi (Sunbird)?",
      a: lang === "HI" ? "हाँ। यह मंच मिशन कर्मयोगी (DoPT) और सनबर्ड एपीआई मानकों का पालन करता है, जिससे पाठ्यक्रमों की खोज, सीपीडी क्रेडिट का मिलान और डिजिटल प्रमाणपत्र जारी करना संभव होता है।" : lang === "TE" ? "అవును. ఈ వేదిక మిషన్ కర్మయోగి (DoPT) మరియు సన్‌బర్డ్ API ప్రమాణాలకు అనుగుణంగా ఉంటుంది, ఇది కోర్సుల గుర్తింపు మరియు ధృవపత్రాల జారీని సులభతరం చేస్తుంది." : "Yes. The platform includes a native iGOT Karmayogi adapter adhering to Mission Karmayogi (DoPT) and Sunbird API specifications, allowing seamless course discovery, CPD credits synchronization, and W3C Verifiable Credential issuance.",
    },
    {
      q: lang === "HI" ? "क्या वर्चुअल लैब के लिए पायथन या आर इंस्टॉल करना आवश्यक है?" : lang === "TE" ? "వర్చువల్ ల్యాబ్‌లను అమలు చేయడానికి పైథాన్ లేదా ఆర్ ఇన్‌స్టాల్ చేయాలా?" : "Do I need Python or R installed locally to run Virtual Labs?",
      a: lang === "HI" ? "नहीं! वर्चुअल लैब सीधे ब्राउज़र में वेबअसेंबली (Pyodide WASM) द्वारा चलती हैं। अधिकारी बिना किसी इंस्टॉलेशन के वास्तविक सांख्यिकीय डेटा पर कोड चला सकते हैं।" : lang === "TE" ? "అవసరం లేదు! వర్చువల్ ల్యాబ్‌లు బ్రౌజర్‌లోనే Pyodide WebAssembly (WASM) ద్వారా నడుస్తాయి. ఎటువంటి సాఫ్ట్‌వేర్ ఇన్‌స్టాల్ చేయకుండానే కోడ్ రన్ చేయవచ్చు." : "No! The Virtual Labs run in-browser using client-side Pyodide WebAssembly (WASM). Statistical officers can execute real survey multiplier weighting and CPI compilation scripts with zero installation or server overhead.",
    },
    {
      q: lang === "HI" ? "एआई ट्यूटर तकनीकी प्रश्नों के उत्तर कैसे देता है?" : lang === "TE" ? "AI ట్యూటర్ సాంకేతిక ప్రశ్నలకు ఎలా సమాధానం ఇస్తుంది?" : "How does the in-lecture AI Tutor answer technical questions?",
      a: lang === "HI" ? "एआई ट्यूटर आधिकारिक मंत्रालय नियमावलियों (SNA 2008, PLFS, DPDP Act 2023) पर प्रशिक्षित भाषा मॉडल और RAG इंजन का उपयोग करके सूत्र और कोड समझाता है।" : lang === "TE" ? "AI ట్యూటర్ అధికారిక MoSPI మాన్యువల్స్ (SNA 2008, PLFS, DPDP చట్టం) ఆధారంగా ఖచ్చితమైన సూత్రాలు మరియు కోడ్ ఉదాహరణలను అందిస్తుంది." : "The AI Tutor utilizes Groq LLaMA 3.3 70B along with a built-in statistical intelligence engine grounded in official MoSPI manuals (UN SNA 2008, PLFS sampling guidelines, DPDP Act 2023) to provide instant formula breakdowns and Python code examples.",
    },
    {
      q: lang === "HI" ? "क्या मंत्रालय प्रशासक कौशल अंतराल हीटमैप देख सकते हैं?" : lang === "TE" ? "మంత్రిత్వ నిర్వాహకులు నైపుణ్య లోపాల హీట్‌మ్యాప్‌లను చూడవచ్చా?" : "Can Ministry Administrators track organizational skill gap heatmaps?",
      a: lang === "HI" ? "हाँ। एडमिन कंसोल वास्तविक समय में प्रभाग-वार दक्षता विश्लेषण, विभाग-वार कौशल अंतराल हीटमैप और संवर्ग तत्परता रिपोर्ट प्रदान करता है।" : lang === "TE" ? "అవును. అడ్మిన్ పోర్టల్ విభాగాల వారీగా నైపుణ్య విశ్లేషణ, డిపార్ట్‌మెంట్ హీట్‌మ్యాప్‌లు మరియు నివేదికలను అందిస్తుంది." : "Yes. The Admin Console provides real-time division-level competency analytics, department skill-gap heatmaps, course completion tracking, and cadre readiness reporting.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* ──────────────────────────────────────────────
          1. Top Navigation Bar
      ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0B3D66] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-[#0B3D66] tracking-tight">StatSkill AI</span>
              <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                MoSPI · NSSTA
              </span>
            </div>
            <p className="text-[10px] text-gray-500 hidden sm:block">
              {lang === "HI"
                ? "राष्ट्रीय सांख्यिकीय क्षमता विकास एवं इंटेलिजेंस मंच"
                : lang === "TE"
                ? "జాతీయ గణాంక సామర్థ్య అభివృద్ధి మరియు ఇంటెలిజెన్స్ వేదిక"
                : "National Statistical Capacity Intelligence Platform"}
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-600">
          <a href="#categories" className="hover:text-[#0B3D66] transition-colors">
            {lang === "HI" ? "दक्षता डोमेन" : lang === "TE" ? "నైపుణ్య విభాగాలు" : "Competency Domains"}
          </a>
          <a href="#features" className="hover:text-[#0B3D66] transition-colors">
            {lang === "HI" ? "क्लोज्ड-लूप विशेषताएं" : lang === "TE" ? "క్లోజ్డ్-లూప్ ఫీచర్లు" : "Closed-Loop Features"}
          </a>
          <a href="#courses" className="hover:text-[#0B3D66] transition-colors">
            {lang === "HI" ? "पाठ्यक्रम" : lang === "TE" ? "కోర్సులు" : "Popular Courses"}
          </a>
          <a href="#faq" className="hover:text-[#0B3D66] transition-colors">
            {lang === "HI" ? "सामान्य प्रश्न (FAQ)" : lang === "TE" ? "ప్రశ్నలు (FAQ)" : "FAQ"}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multilingual Selector */}
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5 text-xs font-bold shrink-0">
            {(["EN", "HI", "TE"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === l ? "bg-white text-[#0B3D66] shadow-xs" : "text-gray-400 hover:text-gray-600 cursor-pointer"
                }`}
              >
                {l === "EN" ? "EN" : l === "HI" ? "हिं" : "తె"}
              </button>
            ))}
          </div>

          <button
            onClick={() => onEnterApp("login")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B3D66] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
          >
            {lang === "HI" ? "लॉग इन" : lang === "TE" ? "లాగిన్" : "Sign In"}
          </button>
          <button
            onClick={() => onEnterApp("dashboard")}
            className="px-4 py-2 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{lang === "HI" ? "मंच खोलें" : lang === "TE" ? "వేదికను తెరవండి" : "Launch Platform"}</span>
            <span>→</span>
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────
          2. Hero Section (Gradient Banner with Curve)
      ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1864A6] via-[#0F4C81] to-[#0B3D66] text-white pt-12 pb-20 md:pb-28 px-4 md:px-8">
        {/* Subtle Background Glows and Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-amber-200 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              {lang === "HI"
                ? "✨ आधिकारिक सांख्यिकी हेतु एआई-संचालित दक्षता इंटेलिजेंस"
                : lang === "TE"
                ? "✨ అధికారిక గణాంకాల కొరకు AI ఆధారిత నైపుణ్య ఇంటెలిజెన్స్"
                : "✨ AI-Powered Competency Intelligence for Official Statistics"}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-serif max-w-4xl mx-auto leading-[1.15]">
            {lang === "HI" ? (
              <>
                कहीं भी, कभी भी सीखें। <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-white bg-clip-text text-transparent">
                  आधिकारिक सांख्यिकीय प्रशासन को सशक्त बनाएं।
                </span>
              </>
            ) : lang === "TE" ? (
              <>
                ఎక్కడైనా, ఎప్పుడైనా నేర్చుకోండి. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-white bg-clip-text text-transparent">
                  అధికారిక గణాంక పాలనను బలోపేతం చేయండి.
                </span>
              </>
            ) : (
              <>
                Learn Anywhere, Anytime. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-white bg-clip-text text-transparent">
                  Elevate Official Statistical Governance.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            {lang === "HI"
              ? "सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI), NSSTA और iGOT कर्मयोगी हेतु एकीकृत शिक्षण मंच। अपनी दक्षताओं का मूल्यांकन करें और संवर्ग मानकों को उन्नत करें।"
              : lang === "TE"
              ? "MoSPI, NSSTA మరియు iGOT కర్మయోగి కొరకు సమగ్ర క్లోజ్డ్-లూప్ అభ్యాస వేదిక. మీ నైపుణ్య లోపాలను అంచనా వేసి అధికారిక గణాంక పద్ధతులలో ప్రావీణ్యం సాధించండి."
              : "The unified closed-loop capacity building platform for MoSPI, NSSTA, and iGOT Karmayogi. Assess competency deficits, master official survey methodologies, and advance your cadre milestones."}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-6 bg-white p-1.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20">
            <span className="pl-3 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "HI"
                  ? "एसएनए 2008, पीएलएफएस प्रतिचयन, सीपीआई, पायथन खोजें..."
                  : lang === "TE"
                  ? "SNA 2008, PLFS శాంప్లింగ్, CPI, పైథాన్ శోధించండి..."
                  : "Search UN SNA 2008, PLFS sampling, CPI, Python labs..."
              }
              className="flex-1 px-2 py-2.5 text-xs text-gray-800 focus:outline-none placeholder-gray-400"
            />
            <button
              onClick={() => {
                const el = document.getElementById("courses");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-5 py-2.5 bg-[#FF7A00] hover:bg-[#e06a00] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {lang === "HI" ? "खोजें" : lang === "TE" ? "అన్వేషించండి" : "Explore"}
            </button>
          </div>

          {/* Demo Quick Logins */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs flex-wrap">
            <span className="text-blue-200 text-[11px]">
              {lang === "HI" ? "त्वरित डेमो लॉगिन:" : lang === "TE" ? "డెమో లాగిన్:" : "Instant Persona Demo:"}
            </span>
            <button
              onClick={() => onDemoLogin("learner")}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-all cursor-pointer"
            >
              {lang === "HI" ? "👤 सांख्यिकीय अधिकारी" : lang === "TE" ? "👤 గణాంక అధికారి" : "👤 Official (Learner)"}
            </button>
            <button
              onClick={() => onDemoLogin("trainer")}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-amber-200 text-[11px] font-bold transition-all cursor-pointer"
            >
              {lang === "HI" ? "🎓 प्रशिक्षक स्टूडियो" : lang === "TE" ? "🎓 శిక్షకుల స్టూడియో" : "🎓 Trainer (RAG Bank)"}
            </button>
            <button
              onClick={() => onDemoLogin("admin")}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-emerald-200 text-[11px] font-bold transition-all cursor-pointer"
            >
              {lang === "HI" ? "👑 मंत्रालय प्रशासक" : lang === "TE" ? "👑 మంత్రిత్వ నిర్వాహకుడు" : "👑 Ministry Admin"}
            </button>
          </div>

          {/* Hero Visual Presentation */}
          <div className="relative mt-8 max-w-2xl mx-auto pt-4">
            {/* Floating Left Card */}
            <div className="absolute -left-4 sm:left-0 top-1/3 -translate-y-1/2 bg-white/95 backdrop-blur-md text-gray-800 p-3.5 rounded-2xl shadow-2xl border border-white/40 text-left z-20 hidden sm:block animate-in fade-in slide-in-from-left duration-500">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-amber-500">4.9</span>
                <div className="text-amber-400 text-xs">★★★★★</div>
              </div>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Top-rated capacity hub</p>
              <p className="text-[9px] text-gray-400">15,000+ Statistical Officers</p>
            </div>

            {/* Floating Right Card */}
            <div className="absolute -right-4 sm:right-0 top-1/3 -translate-y-1/2 bg-white/95 backdrop-blur-md text-gray-800 p-3.5 rounded-2xl shadow-2xl border border-white/40 text-left z-20 hidden sm:block animate-in fade-in slide-in-from-right duration-500">
              <div className="flex items-center gap-1.5 text-[#0B3D66] font-bold text-sm">
                <span>🏛️ 500+</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold">ACCREDITED</span>
              </div>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">NSSTA &amp; iGOT Modules</p>
              <p className="text-[9px] text-gray-400">W3C Verifiable Credentials</p>
            </div>

            {/* Center Graphic */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-blue-300 p-1.5 shadow-2xl relative">
              <div className="w-full h-full rounded-full bg-[#0B3D66] flex flex-col items-center justify-center p-4 text-center border-4 border-white/20 overflow-hidden relative">
                <div className="text-5xl mb-2">🇮🇳</div>
                <div className="text-xs font-bold text-white tracking-wide uppercase">MoSPI &amp; NSSTA</div>
                <div className="text-[10px] text-amber-300 mt-0.5">Capacity Intelligence Hub</div>
                <div className="mt-2 text-[9px] text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">
                  Closed-Loop Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          3. Top Competency Domains (Grid Cards)
      ────────────────────────────────────────────── */}
      <section id="categories" className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider">
            {lang === "HI" ? "आधिकारिक पाठ्यक्रम एवं वर्गीकरण" : lang === "TE" ? "అధికారిక పాఠ్యప్రణాళిక మరియు వర్గీకరణ" : "Official Curriculum & Taxonomy"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3D66] font-serif">
            {lang === "HI" ? "प्रमुख सांख्यिकीय दक्षता डोमेन देखें" : lang === "TE" ? "ప్రధాన గణాంక నైపుణ్య విభాగాలను అన్వేషించండి" : "Explore Top Statistical Competency Domains"}
          </h2>
          <p className="text-xs text-gray-500">
            {lang === "HI"
              ? "भारतीय सांख्यिकी सेवा (ISS) मानकों के अनुरूप संरचित शिक्षण एवं नैदानिक मूल्यांकन।"
              : lang === "TE"
              ? "భారత గణాంక సేవల (ISS) మార్గదర్శకాలకు అనుగుణంగా రూపొందించిన అభ్యాసం."
              : "Structured learning and diagnostic assessments aligned with Indian Statistical Service (ISS) competency guidelines."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                const el = document.getElementById("courses");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cat.accent}`}>
                    {cat.courseCount}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0B3D66] group-hover:text-[#FF7A00] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{cat.subtitle}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#0B3D66]">
                <span>{lang === "HI" ? "दक्षताएं देखें" : lang === "TE" ? "నైపుణ్యాలను చూడండి" : "Explore Competencies"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          4. Why Thousands of Officers Trust Us (Bento Grid)
      ────────────────────────────────────────────── */}
      <section id="features" className="py-16 md:py-24 bg-[#F7F9FB] border-y border-gray-100 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[11px] font-bold text-[#0B3D66] uppercase tracking-wider">
              {lang === "HI" ? "स्वायत्त इंटेलिजेंस आर्किटेक्चर" : lang === "TE" ? "స్వయంప్రతిపత్తి ఇంటెలిజెన్స్ ఆర్కిటెక్చర్" : "Autonomous Intelligence Architecture"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3D66] font-serif">
              {lang === "HI" ? "मंत्रालय एवं राज्य अधिकारी स्टेटस्किल एआई पर भरोसा क्यों करते हैं" : lang === "TE" ? "అధికారులు స్టాట్‌స్కిల్ AIని ఎందుకు ఎంచుకుంటున్నారు" : "Why MoSPI & State DES Officers Choose StatSkill AI"}
            </h2>
            <p className="text-xs text-gray-500">
              {lang === "HI"
                ? "पारंपरिक प्रशिक्षण को क्लोज्ड-लूप इंटेलिजेंस सिस्टम में बदलना।"
                : lang === "TE"
                ? "సాధారణ శిక్షణను క్లోజ్డ్-లూప్ ఇంటెలిజెన్స్ వ్యవస్థగా మార్చడం."
                : "Transforming capacity building from static training into a closed-loop intelligence system."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Closed-Loop */}
            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col justify-between md:col-span-2 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center text-xl font-bold">
                  🔄
                </div>
                <h3 className="text-base font-bold text-[#0B3D66]">
                  {lang === "HI"
                    ? "निरंतर क्लोज्ड-लूप दक्षता उन्नयन"
                    : lang === "TE"
                    ? "నిరంతర క్లోజ్డ్-లూప్ నైపుణ్య పెంపు"
                    : "Continuous Closed-Loop Competency Elevation"}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lang === "HI"
                    ? "प्रत्येक चरण मूल्यांकन → अंतराल निदान → शिक्षण → स्तर पदोन्नति चक्र पर कार्य करता है। अधिकारी नैदानिक परीक्षा देते हैं, कौशल अंतराल रडार देखते हैं और डिजिटल ऑडिट ट्रेल के साथ अपनी दक्षता को अपग्रेड करते हैं।"
                    : lang === "TE"
                    ? "ప్రతి ప్రక్రియ మూల్యాంకనం → లోపాల గుర్తింపు → అభ్యాసం → స్థాయి పెంపు చక్రంలో నడుస్తుంది. పరీక్షలు రాసి, రాడార్ ప్రొఫైల్ చూసి డిజిటల్ ధృవీకరణతో స్థాయిని పెంచుకోవచ్చు."
                    : "Every interaction operates on the strict Assess → Gap → Learn → Elevate cycle. Officers take diagnostic assessments, view granular skill gap radar profiles, consume tailored micro-modules, and automatically elevate their official competency levels with signed cryptographic audit trails."}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-gray-500 flex-wrap">
                <span className="bg-gray-100 px-2.5 py-1 rounded-lg">✍️ {lang === "HI" ? "एआई प्रश्नोत्तरी" : lang === "TE" ? "AI క్విజ్" : "AI Diagnostic MCQs"}</span>
                <span className="bg-gray-100 px-2.5 py-1 rounded-lg">⚖️ {lang === "HI" ? "कौशल अंतराल मैट्रिक्स" : lang === "TE" ? "నైపుణ్య లోపాల మ్యాట్రిక్స్" : "Skill Deficit Matrix"}</span>
                <span className="bg-gray-100 px-2.5 py-1 rounded-lg">⚡ {lang === "HI" ? "त्वरित स्तर पदोन्नति" : lang === "TE" ? "స్థాయి పెంపు" : "Instant Elevation"}</span>
              </div>
            </div>

            {/* Bento Card 2: AI Copilot & Tutor */}
            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B3D66] flex items-center justify-center text-xl font-bold">
                  🤖
                </div>
                <h3 className="text-base font-bold text-[#0B3D66]">
                  {lang === "HI"
                    ? "संदर्भ-जागरूक एआई सांख्यिकी ट्यूटर"
                    : lang === "TE"
                    ? "AI గణాంక ట్యూటర్"
                    : "Contextual In-Lecture AI Statistical Tutor"}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lang === "HI"
                    ? "व्याख्यान के दौरान एसएनए 2008, पीएलएफएस गुणक या लासपेयर्स सूचकांक के बारे में प्रश्न पूछें और चरणबद्ध सूत्र व कोड प्राप्त करें।"
                    : lang === "TE"
                    ? "SNA 2008, PLFS గుణకాలు లేదా CPI సూచీలపై పాఠ్యాంశాల మధ్యలోనే నేరుగా సందేహాలు అడిగి సూత్రాల వివరణ పొందండి."
                    : "Ask questions directly about UN SNA 2008, PLFS multipliers, or CPI Laspeyres indices while watching lectures or reviewing slides. Receive step-by-step formula breakdowns and Python scripts."}
                </p>
              </div>
              <div className="mt-6">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Powered by LLaMA 3.3 70B &amp; RAG
                </span>
              </div>
            </div>

            {/* Bento Card 3: Virtual Labs */}
            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
                  🧪
                </div>
                <h3 className="text-base font-bold text-[#0B3D66]">
                  {lang === "HI" ? "ब्राउज़र में पायथन और एसक्यूएल लैब" : lang === "TE" ? "బ్రౌజర్‌లో పైథాన్ & SQL ల్యాబ్‌లు" : "In-Browser Python & SQL Virtual Labs"}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lang === "HI"
                    ? "Pyodide WebAssembly (WASM) के माध्यम से बिना किसी स्थानीय सॉफ्टवेयर के सीधे ब्राउज़र में सांख्यिकीय डेटा पर पायथन कोड चलाएं।"
                    : lang === "TE"
                    ? "Pyodide WebAssembly (WASM) ద్వారా ఎటువంటి సాఫ్ట్‌వేర్ ఇన్‌స్టాల్ చేయకుండానే బ్రౌజర్‌లోనే సర్వే డేటాపై కోడ్ రన్ చేయండి."
                    : "Run high-performance survey analysis directly in your browser using Pyodide WebAssembly (WASM). Practice calculating all-India CPI aggregations and survey weights on real datasets."}
                </p>
              </div>
              <div className="mt-6">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                  {lang === "HI" ? "बिना इंस्टॉलेशन के उपलब्ध" : lang === "TE" ? "ఇన్‌స్టాలేషన్ అవసరం లేదు" : "Zero Local Installation Required"}
                </span>
              </div>
            </div>

            {/* Bento Card 4: iGOT Karmayogi */}
            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col justify-between md:col-span-3 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                  🏛️
                </div>
                <h3 className="text-base font-bold text-[#0B3D66]">
                  {lang === "HI"
                    ? "iGOT कर्मयोगी (सनबर्ड) एकीकरण एवं सीपीडी प्रमाणन"
                    : lang === "TE"
                    ? "iGOT కర్మయోగి అనుసంధానం & CPD అక్రిడిటేషన్"
                    : "iGOT Karmayogi (Sunbird) Integration & CPD Accreditation"}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lang === "HI"
                    ? "मिशन कर्मयोगी (DoPT) डिजिटल बुनियादी ढांचे के साथ निर्बाध एकीकरण। वार्षिक सतत व्यावसायिक विकास (सीपीडी) घंटों को ट्रैक करें और पदोन्नति हेतु डिजिटल क्रेडेंशियल्स प्राप्त करें।"
                    : lang === "TE"
                    ? "మిషన్ కర్మయోగి డిజిటల్ వ్యవస్థతో సంపూర్ణ సమన్వయం. వార్షిక నిరంతర వృత్తిపరమైన అభివృద్ధి (CPD) గంటలను ట్రాక్ చేసి ధృవీకరించిన సర్టిఫికెట్లు పొందండి."
                    : "Seamless interoperability with Mission Karmayogi (DoPT) digital infrastructure. Track annual Continuous Professional Development (CPD) hours, fulfill cadre promotion benchmarks, and export verifiable digital credentials."}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-gray-500 flex-wrap">
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">Sunbird API Adapter</span>
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">{lang === "HI" ? "50 वार्षिक सीपीडी घंटे" : lang === "TE" ? "50 వార్షిక CPD గంటలు" : "50 Annual CPD Hours Tracker"}</span>
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">W3C Verifiable Credentials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          5. Explore Most Popular Courses
      ────────────────────────────────────────────── */}
      <section id="courses" className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider">
            Curated National Course Catalogue
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3D66] font-serif">
            Explore Accredited Training Modules
          </h2>
          <p className="text-xs text-gray-500">
            Learn from top NSSTA faculty, international experts, and senior Indian Statistical Service officers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {[
            { id: "all", label: "All Courses" },
            { id: "national_accounts", label: "National Accounts" },
            { id: "survey_sampling", label: "Survey Sampling" },
            { id: "data_science", label: "Data Science & Python" },
            { id: "governance", label: "Digital Governance" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? "bg-[#0B3D66] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.slice(0, 6).map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Course Card Photographic Header */}
                <div className="h-44 relative overflow-hidden bg-slate-950 select-none">
                  <img
                    src={getCourseImage(c)}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-black/30" />

                  <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-white">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xs">
                        {c.level || "Intermediate"}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-md">
                        {c.provider} Karmayogi
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white border border-blue-400/30 shadow-xs">
                        {c.category}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white">
                        {c.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-sm font-bold text-[#0B3D66] group-hover:text-[#FF7A00] transition-colors line-clamp-2 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{c.description}</p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 font-medium border-t border-gray-100">
                    <span className="text-emerald-700 font-bold">📜 {c.cpdHours || 12} CPD Hours</span>
                    <span className="text-amber-500 font-bold">★ {c.rating || 4.9}</span>
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onEnterApp("courses")}
                  className="w-full py-2.5 bg-[#0B3D66] group-hover:bg-gradient-to-r group-hover:from-[#FF7A00] group-hover:to-[#FF8C1A] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
                >
                  <span>Start Learning Course</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => onEnterApp("courses")}
            className="px-6 py-3 rounded-2xl bg-blue-50 text-[#0B3D66] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
          >
            View All 50+ Accredited Modules →
          </button>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          6. Officer Stories & Testimonials
      ────────────────────────────────────────────── */}
      <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-b from-[#F7F9FB] to-white border-t border-gray-100 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[11px] font-bold text-[#0B3D66] uppercase tracking-wider">
              Nationwide Officer Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3D66] font-serif">
              Stories from Our Statistical Officers
            </h2>
            <p className="text-xs text-gray-500">
              How StatSkill AI is accelerating career progression and national survey accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "The closed-loop assessment pinpointed my GVA compilation gaps and recommended the exact NSSTA modules needed for our division's national accounts rebasing."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-[#0B3D66] text-white flex items-center justify-center text-xs font-bold">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Dr. Rajesh Sharma, ISS</div>
                  <div className="text-[10px] text-gray-500">Director, Labour Statistics (MoSPI)</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "The in-browser Python virtual labs allowed me to practice PLFS multiplier weighting on real datasets without IT approval or server setup."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  PS
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Pooja Sundaram</div>
                  <div className="text-[10px] text-gray-500">Senior Statistical Officer, State DES</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "StatSkill AI's In-Lecture Tutor instantly clarifies UN SNA 2008 standards and double-deflation methods whenever I'm reviewing quarterly GDP algorithms."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-bold">
                  AS
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Amitabh Sen</div>
                  <div className="text-[10px] text-gray-500">Assistant Director, National Accounts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          7. Frequently Asked Questions (Accordion)
      ────────────────────────────────────────────── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider">
            Official Guidelines &amp; Platform Support
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3D66] font-serif">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-500">
            Everything you need to know about the platform, accreditation, and closed-loop learning.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const open = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setActiveFaq(open ? null : idx)}
                  className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs md:text-sm text-[#0B3D66] hover:bg-gray-50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-base text-gray-400 font-normal shrink-0">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <div className="px-4 md:px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/40 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          8. Call to Action Banner
      ────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#0B3D66] via-[#124D80] to-[#FF7A00] p-8 md:p-14 text-white text-center shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />

          <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-amber-200">
            Mission Karmayogi Aligned
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif max-w-2xl mx-auto leading-tight">
            Ready to Elevate Your Statistical Competencies?
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
            Join thousands of officers advancing their careers with personalized AI-driven learning pathways.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => onEnterApp("assessment")}
              className="px-6 py-3 bg-white text-[#0B3D66] hover:bg-gray-100 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              ✍️ Take AI Competency Assessment
            </button>
            <button
              onClick={() => onEnterApp("dashboard")}
              className="px-6 py-3 bg-[#0B3D66] hover:bg-[#082e4f] text-white border border-white/30 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Enter Officer Portal →
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          9. Footer (Dark Navy)
      ────────────────────────────────────────────── */}
      <footer className="bg-[#07243D] text-gray-300 text-xs pt-16 pb-12 border-t border-white/10 px-4 md:px-8 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-base">
                S
              </div>
              <span className="text-base font-bold text-white tracking-tight">StatSkill AI</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              AI-Powered Competency Intelligence Platform for India's Ministry of Statistics and Programme Implementation (MoSPI) and NSSTA.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <div className="text-white font-bold text-xs uppercase tracking-wider">Quick Navigation</div>
            <ul className="space-y-1.5 text-[11px] text-gray-400">
              <li>
                <button onClick={() => onEnterApp("dashboard")} className="hover:text-white transition-colors">
                  Officer Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onEnterApp("assessment")} className="hover:text-white transition-colors">
                  AI Competency Assessment
                </button>
              </li>
              <li>
                <button onClick={() => onEnterApp("skill_gaps")} className="hover:text-white transition-colors">
                  Skill Gap Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onEnterApp("courses")} className="hover:text-white transition-colors">
                  Accredited Courses
                </button>
              </li>
              <li>
                <button onClick={() => onEnterApp("labs")} className="hover:text-white transition-colors">
                  Virtual Labs (Pyodide)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <div className="text-white font-bold text-xs uppercase tracking-wider">Statistical Domains</div>
            <ul className="space-y-1.5 text-[11px] text-gray-400">
              <li>UN SNA 2008 &amp; GVA Compilation</li>
              <li>Periodic Labour Force Survey (PLFS)</li>
              <li>Consumer Price Index (CPI Laspeyres)</li>
              <li>DPDP Act 2023 &amp; Disclosure Control</li>
              <li>Python &amp; SQL for Census Analytics</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2.5">
            <div className="text-white font-bold text-xs uppercase tracking-wider">Official Inquiries</div>
            <p className="text-[11px] text-gray-400">
              National Statistical Systems Training Academy (NSSTA), Plot No. 22, Knowledge Park-II, Greater Noida, UP - 201310
            </p>
            <div className="text-[11px] text-amber-300 font-mono">support.nssta@nic.in</div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 pb-20 md:pb-0 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            © 2026 Ministry of Statistics and Programme Implementation (MoSPI), Government of India. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onEnterApp("login")} className="hover:text-gray-300 transition-colors cursor-pointer">
              Officer Portal
            </button>
            <button onClick={() => onDemoLogin("trainer")} className="hover:text-gray-300 transition-colors cursor-pointer">
              Trainer Portal
            </button>
            <button onClick={() => onDemoLogin("admin")} className="hover:text-gray-300 transition-colors cursor-pointer">
              Admin Console
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar for Landing Page */}
      <nav
        aria-label="Mobile Landing Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-200 px-1 py-1 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] pointer-events-auto"
      >
        {[
          { id: "dashboard" as const, label: "Home", icon: "🏛️" },
          { id: "skills" as const, label: "Skills", icon: "🎯" },
          { id: "courses" as const, label: "Courses", icon: "📚" },
          { id: "labs" as const, label: "Sandbox", icon: "💻" },
          { id: "assistant" as const, label: "AI Tutor", icon: "🤖" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEnterApp(item.id);
            }}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer select-none touch-manipulation min-h-[48px] active:scale-95 text-gray-600 hover:text-[#0B3D66] font-medium"
          >
            <span className="text-lg leading-none mb-0.5 pointer-events-none">{item.icon}</span>
            <span className="text-[10px] tracking-tight pointer-events-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
