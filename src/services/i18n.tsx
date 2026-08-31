import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "EN" | "HI" | "TE";

export interface Translations {
  // Brand
  brand_name: string;
  brand_tagline: string;

  // Roles
  role_learner: string;
  role_admin: string;
  role_trainer: string;

  // Domains
  domain_all: string;
  domain_statistical: string;
  domain_technical: string;
  domain_digital_gov: string;
  domain_behavioural: string;

  // Navigation
  nav_landing: string;
  nav_dashboard: string;
  nav_skills: string;
  nav_assessment: string;
  nav_skill_gaps: string;
  nav_learning_path: string;
  nav_courses: string;
  nav_training_programmes: string;
  nav_learning: string;
  nav_quizzes: string;
  nav_resources: string;
  nav_assistant: string;
  nav_profile: string;
  nav_certificates: string;
  nav_virtual_labs: string;
  nav_trainer_portal: string;
  nav_admin_analytics: string;
  nav_settings: string;
  nav_signout: string;

  // Dashboard
  dash_welcome: string;
  dash_overall_comp: string;
  dash_cadre_index: string;
  dash_active_gaps: string;
  dash_high_priority_deficits: string;
  dash_courses_completed: string;
  dash_learning_hours: string;
  dash_radar_title: string;
  dash_radar_sub: string;
  dash_current_level: string;
  dash_cadre_target: string;
  dash_view_full_matrix: string;
  dash_recent_recs: string;

  // Assessment
  assess_title: string;
  assess_subtitle: string;
  assess_select_domain: string;
  assess_difficulty: string;
  assess_questions_count: string;
  assess_start_test: string;
  assess_question: string;
  assess_flag_review: string;
  assess_next: string;
  assess_prev: string;
  assess_submit: string;
  assess_review_all: string;
  assess_correct: string;
  assess_incorrect: string;
  assess_official_methodology: string;
  assess_closed_loop_update: string;

  // AI Assistant
  ai_advisory: string;
  ai_copilot_welcome: string;
  ai_synthesizing: string;
  ai_listen: string;
  ai_copy: string;
  ai_copied: string;
  ai_send: string;
  ai_placeholder: string;

  // Actions & Common
  btn_start_learning: string;
  btn_take_assessment: string;
  btn_view_why: string;
  btn_upload_material: string;
  btn_generate_quiz: string;
  btn_update_competency: string;
  btn_view_all: string;
  btn_continue: string;
  btn_review: string;
  btn_elevate: string;
  btn_courses: string;
}

const DICTIONARY: Record<Language, Translations> = {
  EN: {
    brand_name: "StatSkill AI",
    brand_tagline: "AI-Powered Competency Intelligence & Personalized Learning Platform for Official Statistics",

    role_learner: "Statistical Official (Learner)",
    role_admin: "Ministry Administrator",
    role_trainer: "Academy Trainer & Evaluator",

    domain_all: "All Domains",
    domain_statistical: "Statistical Methodologies",
    domain_technical: "Data Science & Computing",
    domain_digital_gov: "Digital Governance & Privacy",
    domain_behavioural: "Behavioural & Leadership",

    nav_landing: "Overview",
    nav_dashboard: "Dashboard",
    nav_skills: "My Skills",
    nav_assessment: "Competency Assessment",
    nav_skill_gaps: "Skill Gaps",
    nav_learning_path: "Learning Path",
    nav_courses: "Courses",
    nav_training_programmes: "NSSTA Programmes",
    nav_learning: "My Learning",
    nav_quizzes: "Quizzes",
    nav_resources: "Resources",
    nav_assistant: "AI Assistant",
    nav_profile: "My Profile",
    nav_certificates: "Credentials",
    nav_virtual_labs: "Virtual Sandboxes",
    nav_trainer_portal: "Trainer Portal",
    nav_admin_analytics: "Administrator Portal",
    nav_settings: "Settings",
    nav_signout: "Sign Out",

    dash_welcome: "Welcome back",
    dash_overall_comp: "Overall Competency",
    dash_cadre_index: "Cadre Proficiency Index",
    dash_active_gaps: "Active Skill Gaps",
    dash_high_priority_deficits: "High Priority Deficits",
    dash_courses_completed: "Courses Completed",
    dash_learning_hours: "Learning Hours",
    dash_radar_title: "Competency Radar Overview",
    dash_radar_sub: "Current Proficiency vs MoSPI Cadre Benchmark",
    dash_current_level: "Current Level",
    dash_cadre_target: "Cadre Target",
    dash_view_full_matrix: "View Full Matrix →",
    dash_recent_recs: "Explainable AI Recommendations",

    assess_title: "Competency Assessment",
    assess_subtitle: "Adaptive multi-domain examination grounded in official statistical methodologies.",
    assess_select_domain: "Select Assessment Track",
    assess_difficulty: "Difficulty Calibration",
    assess_questions_count: "Examination Size",
    assess_start_test: "Begin Examination",
    assess_question: "Question",
    assess_flag_review: "Flag for Review",
    assess_next: "Next Question",
    assess_prev: "Previous",
    assess_submit: "Submit for Evaluation",
    assess_review_all: "All Questions",
    assess_correct: "Correct",
    assess_incorrect: "Incorrect",
    assess_official_methodology: "Official Methodology & Rationale",
    assess_closed_loop_update: "Apply Closed-Loop Elevate",

    ai_advisory: "StatSkill Official Advisory",
    ai_copilot_welcome: "Welcome to StatSkill AI Copilot",
    ai_synthesizing: "StatSkill AI synthesizing response...",
    ai_listen: "Listen",
    ai_copy: "Copy",
    ai_copied: "Copied",
    ai_send: "Send",
    ai_placeholder: "Ask about sampling formulas, national accounts, Python automation, DPDP Act 2023...",

    btn_start_learning: "Start Course",
    btn_take_assessment: "Take Assessment",
    btn_view_why: "Why Recommended? ↗",
    btn_upload_material: "Upload Training PDF",
    btn_generate_quiz: "Generate & Validate MCQs",
    btn_update_competency: "Apply Closed-Loop Update",
    btn_view_all: "View All",
    btn_continue: "Continue Learning",
    btn_review: "Review Course",
    btn_elevate: "Elevate",
    btn_courses: "Courses",
  },
  HI: {
    brand_name: "StatSkill AI (स्टेटस्किल एआई)",
    brand_tagline: "आधिकारिक सांख्यिकी हेतु एआई-संचालित दक्षता इंटेलिजेंस एवं व्यक्तिगत शिक्षण मंच",

    role_learner: "सांख्यिकीय अधिकारी (शिक्षार्थी)",
    role_admin: "मंत्रालय प्रशासक",
    role_trainer: "अकादमी प्रशिक्षक एवं मूल्यांकनकर्ता",

    domain_all: "सभी डोमेन",
    domain_statistical: "सांख्यिकीय पद्धतियाँ",
    domain_technical: "डेटा विज्ञान एवं कम्प्यूटिंग",
    domain_digital_gov: "डिजिटल प्रशासन एवं गोपनीयता",
    domain_behavioural: "व्यावहारिक एवं नेतृत्व",

    nav_landing: "अवलोकन",
    nav_dashboard: "डैशबोर्ड",
    nav_skills: "मेरी दक्षता",
    nav_assessment: "दक्षता मूल्यांकन",
    nav_skill_gaps: "कौशल अंतराल",
    nav_learning_path: "शिक्षण पथ",
    nav_courses: "पाठ्यक्रम",
    nav_training_programmes: "एनएसएसटीए कार्यक्रम",
    nav_learning: "मेरा शिक्षण",
    nav_quizzes: "प्रश्नोत्तरी",
    nav_resources: "संसाधन",
    nav_assistant: "एआई सहायक",
    nav_profile: "मेरी प्रोफ़ाइल",
    nav_certificates: "डिजिटल प्रमाणपत्र",
    nav_virtual_labs: "वर्चुअल प्रयोगशालाएं",
    nav_trainer_portal: "प्रशिक्षक पोर्टल",
    nav_admin_analytics: "प्रशासक पोर्टल",
    nav_settings: "सेटिंग्स",
    nav_signout: "लॉग आउट",

    dash_welcome: "स्वागत है",
    dash_overall_comp: "कुल दक्षता स्कोर",
    dash_cadre_index: "संवर्ग प्रवीणता सूचकांक",
    dash_active_gaps: "सक्रिय कौशल अंतराल",
    dash_high_priority_deficits: "उच्च प्राथमिकता अंतराल",
    dash_courses_completed: "पूर्ण किए गए पाठ्यक्रम",
    dash_learning_hours: "शिक्षण घंटे",
    dash_radar_title: "दक्षता रडार अवलोकन",
    dash_radar_sub: "वर्तमान प्रवीणता बनाम मंत्रालय मानक",
    dash_current_level: "वर्तमान स्तर",
    dash_cadre_target: "संवर्ग लक्ष्य",
    dash_view_full_matrix: "पूरा मैट्रिक्स देखें →",
    dash_recent_recs: "स्पष्टीकरणीय एआई सिफारिशें",

    assess_title: "दक्षता मूल्यांकन परीक्षा",
    assess_subtitle: "आधिकारिक सांख्यिकीय पद्धतियों पर आधारित अनुकूली बहु-डोमेन परीक्षा।",
    assess_select_domain: "मूल्यांकन ट्रैक चुनें",
    assess_difficulty: "कठिनाई स्तर",
    assess_questions_count: "प्रश्नों की संख्या",
    assess_start_test: "परीक्षा प्रारंभ करें",
    assess_question: "प्रश्न",
    assess_flag_review: "समीक्षा हेतु चिह्नित करें",
    assess_next: "अगला प्रश्न",
    assess_prev: "पिछला",
    assess_submit: "मूल्यांकन हेतु सबमिट करें",
    assess_review_all: "सभी प्रश्न",
    assess_correct: "सही",
    assess_incorrect: "गलत",
    assess_official_methodology: "आधिकारिक पद्धति एवं तर्क",
    assess_closed_loop_update: "क्लोज्ड-लूप स्तर पदोन्नति लागू करें",

    ai_advisory: "स्टेटस्किल आधिकारिक सलाह",
    ai_copilot_welcome: "स्टेटस्किल एआई कोपायलट में आपका स्वागत है",
    ai_synthesizing: "स्टेटस्किल एआई उत्तर तैयार कर रहा है...",
    ai_listen: "सुनें",
    ai_copy: "कॉपी करें",
    ai_copied: "कॉपी हो गया",
    ai_send: "भेजें",
    ai_placeholder: "प्रतिचयन सूत्र, राष्ट्रीय लेखा, पायथन ऑटोमेशन, डीपीडीपी अधिनियम 2023 के बारे में पूछें...",

    btn_start_learning: "पाठ्यक्रम प्रारंभ करें",
    btn_take_assessment: "मूल्यांकन दें",
    btn_view_why: "अनुशंसा का कारण देखें ↗",
    btn_upload_material: "प्रशिक्षण सामग्री अपलोड करें",
    btn_generate_quiz: "प्रश्न जनरेट करें",
    btn_update_competency: "क्लोज्ड-लूप अपडेट लागू करें",
    btn_view_all: "सभी देखें",
    btn_continue: "जारी रखें",
    btn_review: "समीक्षा करें",
    btn_elevate: "स्तर बढ़ाएं",
    btn_courses: "पाठ्यक्रम",
  },
  TE: {
    brand_name: "StatSkill AI (స్టాట్‌స్కిల్ AI)",
    brand_tagline: "అధికారిక గణాంకాల కొరకు AI ఆధారిత నైపుణ్య ఇంటెలిజెన్స్ మరియు వ్యక్తిగతీకరించిన అభ్యాస వేదిక",

    role_learner: "గణాంక అధికారి (అభ్యర్థి)",
    role_admin: "మంత్రిత్వ శాఖ నిర్వాహకుడు",
    role_trainer: "శిక్షకుడు మరియు మూల్యాంకనదారుడు",

    domain_all: "అన్ని విభాగాలు",
    domain_statistical: "గణాంక పద్ధతులు",
    domain_technical: "డేటా సైన్స్ మరియు కంప్యూటింగ్",
    domain_digital_gov: "డిజిటల్ పాలన మరియు గోప్యత",
    domain_behavioural: "ప్రవర్తనా మరియు నాయకత్వ నైపుణ్యాలు",

    nav_landing: "అవలోకనం",
    nav_dashboard: "డ్యాష్‌బోర్డ్",
    nav_skills: "నా నైపుణ్యాలు",
    nav_assessment: "నైపుణ్య మూల్యాంకనం",
    nav_skill_gaps: "నైపుణ్య లోపాలు",
    nav_learning_path: "అభ్యాస మార్గం",
    nav_courses: "కోర్సులు",
    nav_training_programmes: "NSSTA కార్యక్రమాలు",
    nav_learning: "నా అభ్యాసం",
    nav_quizzes: "క్విజ్‌లు",
    nav_resources: "వనరులు",
    nav_assistant: "AI సహాయకుడు",
    nav_profile: "నా ప్రొఫైల్",
    nav_certificates: "ధృవపత్రాలు",
    nav_virtual_labs: "వర్చువల్ ల్యాబ్‌లు",
    nav_trainer_portal: "శిక్షకుల పోర్టల్",
    nav_admin_analytics: "నిర్వాహక పోర్టల్",
    nav_settings: "సెట్టింగ్‌లు",
    nav_signout: "లాగ్ అవుట్",

    dash_welcome: "స్వాగతం",
    dash_overall_comp: "మొత్తం నైపుణ్య సూచిక",
    dash_cadre_index: "కేడర్ నైపుణ్య స్థాయి",
    dash_active_gaps: "నైపుణ్య లోపాలు",
    dash_high_priority_deficits: "అధిక ప్రాధాన్యత లోపాలు",
    dash_courses_completed: "పూర్తయిన కోర్సులు",
    dash_learning_hours: "అభ్యాస సమయం (గంటలు)",
    dash_radar_title: "నైపుణ్య రాడార్ విశ్లేషణ",
    dash_radar_sub: "ప్రస్తుత సామర్థ్యం వర్సెస్ అధికారిక ప్రమాణాలు",
    dash_current_level: "ప్రస్తుత స్థాయి",
    dash_cadre_target: "లక్ష్య స్థాయి",
    dash_view_full_matrix: "పూర్తి మ్యాట్రిక్స్ చూడండి →",
    dash_recent_recs: "వివరణాత్మక AI సిఫార్సులు",

    assess_title: "నైపుణ్య మూల్యాంకన పరీక్ష",
    assess_subtitle: "అధికారిక గణాంక పద్ధతుల ఆధారంగా రూపొందించిన పరీక్ష.",
    assess_select_domain: "పరీక్షా విభాగాన్ని ఎంచుకోండి",
    assess_difficulty: "క్లిష్టత స్థాయి",
    assess_questions_count: "ప్రశ్నల సంఖ్య",
    assess_start_test: "పరీక్షను ప్రారంభించండి",
    assess_question: "ప్రశ్న",
    assess_flag_review: "సమీక్ష కోసం ఫ్లాగ్ చేయండి",
    assess_next: "తదుపరి ప్రశ్న",
    assess_prev: "మునుపటిది",
    assess_submit: "మూల్యాంకనం కోసం సమర్పించండి",
    assess_review_all: "అన్ని ప్రశ్నలు",
    assess_correct: "సరియైనవి",
    assess_incorrect: "తప్పులు",
    assess_official_methodology: "అధికారిక గణాంక సూత్రం మరియు వివరణ",
    assess_closed_loop_update: "క్లోజ్డ్-లూప్ స్థాయి పెంపును వర్తింపజేయండి",

    ai_advisory: "స్టాట్‌స్కిల్ అధికారిక మార్గదర్శకత్వం",
    ai_copilot_welcome: "స్టాట్‌స్కిల్ AI సహాయకుడికి స్వాగతం",
    ai_synthesizing: "స్టాట్‌స్కిల్ AI సమాధానాన్ని సిద్ధం చేస్తోంది...",
    ai_listen: "వినండి",
    ai_copy: "కాపీ చేయండి",
    ai_copied: "కాపీ చేయబడింది",
    ai_send: "పంపండి",
    ai_placeholder: "శాంప్లింగ్ సూత్రాలు, జాతీయ ఖాతాలు, పైథాన్ ఆటోమేషన్, DPDP చట్టం 2023 గురించి అడగండి...",

    btn_start_learning: "కోర్సు ప్రారంభించండి",
    btn_take_assessment: "పరీక్ష రాయండి",
    btn_view_why: "సిఫార్సు వివరణ చూడండి ↗",
    btn_upload_material: "శిక్షణ సామగ్రిని అప్‌లోడ్ చేయండి",
    btn_generate_quiz: "ప్రశ్నలను రూపొందించండి",
    btn_update_competency: "క్లోజ్డ్-లూప్ అప్‌డేట్ వర్తింపజేయండి",
    btn_view_all: "అన్నీ చూడండి",
    btn_continue: "కొనసాగించండి",
    btn_review: "సమీక్షించండి",
    btn_elevate: "స్థాయిని పెంచండి",
    btn_courses: "కోర్సులు",
  },
};

const LANG_STORAGE_KEY = "statskill_platform_language";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "EN",
  setLang: () => {},
  t: (key) => DICTIONARY.EN[key] || (key as string),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (saved === "EN" || saved === "HI" || saved === "TE") return saved;
    }
    return "EN";
  });

  function setLang(newLang: Language) {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    }
  }

  function t(key: keyof Translations): string {
    return DICTIONARY[lang]?.[key] || DICTIONARY.EN[key] || (key as string);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
