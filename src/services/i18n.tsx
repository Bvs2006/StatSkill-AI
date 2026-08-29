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
}

const DICTIONARY: Record<Language, Translations> = {
  EN: {
    brand_name: "StatSkill AI",
    brand_tagline: "AI-Powered Competency Intelligence & Personalized Learning Platform for Official Statistics",

    role_learner: "Statistical Official (Learner)",
    role_admin: "Ministry Administrator",
    role_trainer: "Academy Trainer & Evaluator",

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

    btn_start_learning: "Start Course",
    btn_take_assessment: "Take Assessment",
    btn_view_why: "Why Recommended? ↗",
    btn_upload_material: "Upload Training PDF",
    btn_generate_quiz: "Generate & Validate MCQs",
    btn_update_competency: "Apply Closed-Loop Update",
    btn_view_all: "View All",
    btn_continue: "Continue Learning",
    btn_review: "Review Course",
  },
  HI: {
    brand_name: "StatSkill AI (स्टेटस्किल एआई)",
    brand_tagline: "आधिकारिक सांख्यिकी हेतु एआई-संचालित दक्षता इंटेलिजेंस एवं व्यक्तिगत शिक्षण मंच",

    role_learner: "सांख्यिकीय अधिकारी (शिक्षार्थी)",
    role_admin: "मंत्रालय प्रशासक",
    role_trainer: "अकादमी प्रशिक्षक एवं मूल्यांकनकर्ता",

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

    btn_start_learning: "पाठ्यक्रम प्रारंभ करें",
    btn_take_assessment: "मूल्यांकन दें",
    btn_view_why: "अनुशंसा का कारण देखें ↗",
    btn_upload_material: "प्रशिक्षण सामग्री अपलोड करें",
    btn_generate_quiz: "प्रश्न जनरेट करें",
    btn_update_competency: "क्लोज्ड-लूप अपडेट लागू करें",
    btn_view_all: "सभी देखें",
    btn_continue: "जारी रखें",
    btn_review: "समीक्षा करें",
  },
  TE: {
    brand_name: "StatSkill AI (స్టాట్‌స్కిల్ AI)",
    brand_tagline: "అధికారిక గణాంకాల కొరకు AI ఆధారిత నైపుణ్య ఇంటెలిజెన్స్ మరియు వ్యక్తిగతీకరించిన అభ్యాస వేదిక",

    role_learner: "గణాంక అధికారి (అభ్యర్థి)",
    role_admin: "మంత్రిత్వ శాఖ నిర్వాహకుడు",
    role_trainer: "శిక్షకుడు మరియు మూల్యాంకనదారుడు",

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

    btn_start_learning: "కోర్సు ప్రారంభించండి",
    btn_take_assessment: "పరీక్ష రాయండి",
    btn_view_why: "సిఫార్సు వివరణ చూడండి ↗",
    btn_upload_material: "శిక్షణ సామగ్రిని అప్‌లోడ్ చేయండి",
    btn_generate_quiz: "ప్రశ్నలను రూపొందించండి",
    btn_update_competency: "క్లోజ్డ్-లూప్ అప్‌డేట్ వర్తింపజేయండి",
    btn_view_all: "అన్నీ చూడండి",
    btn_continue: "కొనసాగించండి",
    btn_review: "సమీక్షించండి",
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
