export const en = {
  // Navigation & Header
  nav: {
    groups: "Groups",
    myPage: "My Page",
    manage: "Manage",
    createGroup: "Create Group",
    designSystem: "Design System",
    login: "u-SAINT Login",
    logout: "Logout",
    notifications: "Notifications",
  },
  // Landing Page
  landing: {
    badge: "Official Soongsil Academic Verification · 2026 Matching",
    heroTitlePrefix: "Find Trusted Peers,",
    heroTitleHighlight: "Build Ideal Teams",
    heroTitleSuffix: "for Your Study & Projects.",
    heroSubtitle:
      "CampusMatch connects verified Soongsil University students through official u-SAINT SSO. Zero fake accounts, zero ghosting, 100% genuine academic collaboration.",
    startBtn: "Get Started with u-SAINT",
    browseBtn: "Explore Recruiting Groups",
    seeGroupsBtn: "Browse Studies & Projects",
    trustBadge1: "100% Real Soongsil Students",
    trustBadge2: "Zero Password Retention",
    trustBadge3: "Major & Skill Matchmaking",
    coreFeaturesTitle: "Why Soongsil Students Choose CampusMatch",
    coreFeaturesSubtitle:
      "Eliminating anonymous chat ghosting, free-riders, and mismatched skill sets so you can focus entirely on learning.",
    feature1Title: "100% u-SAINT SSO Verified",
    feature1Desc:
      "Sign in instantly with your student credentials. Real name, department, and academic year are automatically synchronized.",
    feature1Sub: "Verified department & major sync",
    feature2Title: "Zero Password Retention",
    feature2Desc:
      "Portal passwords exist only in transient memory during university handshake. Never stored in any database.",
    feature2Sub: "Stateless JWT session security",
    feature3Title: "Smart Major & Tech Stack Matching",
    feature3Desc:
      "Discover teammates for Capstone Design, coding tests, or hackathons with role quotas (Frontend, Backend, Design).",
    feature3Sub: "Structured role & member quotas",
    statsStudents: "Verified Students",
    statsGroups: "Active Groups",
    statsCompletion: "Project Completion Rate",
    statsVerification: "Identity Verified",
    bottomCtaTitle: "Looking for Great Teammates This Semester?",
    bottomCtaSubtitle:
      "Sign in with your student ID in seconds and collaborate with top peers at Soongsil University.",
  },
  // Login Modal
  loginModal: {
    title: "Soongsil University u-SAINT Login",
    subtitle: "Sign in securely with your student portal credentials",
    studentIdLabel: "Student ID (Student ID)",
    studentIdPlaceholder: "e.g. 20211234",
    passwordLabel: "u-SAINT Password",
    passwordPlaceholder: "Enter your portal password",
    demoFillBtn: "Fill Demo Account (Hong Gildong)",
    demoDept: "Computer Science · 3rd Year",
    submitBtn: "Authenticate & Sign In",
    submittingBtn: "Connecting to u-SAINT...",
    securityGuaranteeTitle: "100% Zero Password Retention Policy",
    securityGuaranteeDesc:
      "Your password is used strictly for in-flight verification with Soongsil University's portal and is never stored in CampusMatch databases.",
    errorMissing: "Please enter both student ID and password.",
    errorInvalidCredentials: "Invalid student ID or u-SAINT password.",
    errorServer: "Failed to connect to the u-SAINT portal server. Please try again.",
    errorNetwork: "Network communication error. Please check your internet connection.",
  },
  // Translate on Demand
  translate: {
    btn: "Translate to English",
    translating: "Translating with Gemini...",
    showOriginal: "Show Original",
    translatedBy: "Translated by Google Gemini AI",
  },
};

export type TranslationDict = typeof en;
