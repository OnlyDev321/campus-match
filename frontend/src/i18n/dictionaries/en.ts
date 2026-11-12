export const en = {
  // Navigation & Header
  nav: {
    groups: "Groups",
    myPage: "My Page",
    manage: "Manage",
    createGroup: "Create Group",
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
  // Profile Card (My Page)
  profile: {
    verified: "u-SAINT Verified",
    yearBadge: "Year {year}",
  },
  // My Page header
  myPage: {
    breadcrumbRoot: "My Workspace",
    breadcrumbCampus: "Soongsil Campus",
    subtitle: "View your student profile and contact details, verified through u-SAINT.",
  },
  // My Timetable (My Page, u-SAINT ZCMW2102)
  timetable: {
    title: "My Timetable",
    term: "{year} · {semester}",
    secondSemester: "Semester 2",
    fetchedAt: "Loaded from u-SAINT at sign-in · {time} (KST)",
    days: { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat" },
    daysLong: { MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday", SAT: "Saturday" },
    today: "Today",
    period: "Period {n}",
    daySelector: "Choose a day",
    loading: "Loading your timetable…",
    empty: "No classes are registered for {term}.",
    dayEmpty: "No classes on {day}.",
    unavailableTitle: "We couldn't load your timetable from u-SAINT.",
    unavailableDesc: "Your profile and sign-in are not affected. Sign in again to try loading it.",
    notFetchedTitle: "Your timetable isn't loaded yet",
    notFetched: "Sign in again to load your timetable from u-SAINT.",
    signInAgain: "Sign in again",
    untimedNote: "Classes without a fixed time aren't shown in the u-SAINT timetable.",
  },
  // My Group Card (My Page & Manage)
  myGroupCard: {
    leader: "Leader",
    member: "Member",
    membersLabel: "members",
    open: "Open",
    reviewApplications: "Review applications",
    pendingCount: "{count} pending",
  },
  // Group status (study_groups.status)
  groupStatus: {
    RECRUITING: "RECRUITING",
    COMPLETED: "COMPLETED",
    CLOSED: "CLOSED",
  },
  // Manage (Leader reviews join requests)
  manage: {
    title: "Manage Applications",
    listTitle: "My Groups",
    subtitle: "Groups you lead and groups you've joined. Open a group you lead to review its join requests.",
    ledColumnTitle: "Groups I lead",
    memberColumnTitle: "Groups I'm a member of",
    ledEmpty: "You aren't leading any groups yet.",
    memberEmpty: "You haven't joined any groups as a member yet.",
    createGroup: "Create a group",
    browseGroups: "Browse groups",
    groupsError: "We couldn't load your groups.",
    backToManage: "Back to My Groups",
    applicationsTitle: "Pending join requests",
    pendingEmpty: "No pending applications for this group.",
    notAvailableTitle: "This group isn't available",
    notAvailableDesc: "It doesn't exist, or you aren't its leader.",
    applicationsError: "We couldn't load the applications.",
    retry: "Try again",
  },
  // Application Card (Leader view)
  applicationCard: {
    applied: "Applied {time}",
    accept: "Accept",
    reject: "Reject",
  },
  // Normalized API errors (lib/api.ts → ApiErrorCode)
  manageDetails: {
    "blocked": "Management changes are unavailable until the backend supports these APIs and verifies the group leader. No changes will be saved.",
    "members": "Group members",
    "membersEmpty": "No members are listed.",
    "editTitle": "Review group changes",
    "groupTitle": "Group title",
    "description": "Description",
    "capacity": "Member capacity",
    "recruitment": "Recruitment status",
    "titleRule": "Required. Use 150 characters or fewer.",
    "descriptionRule": "Required. Describe the group’s goals and requirements.",
    "capacityRule": "Enter a positive whole number, at least the current member count, up to 2,147,483,647.",
    "statusRule": "Recruiting requires an available seat. Completed requires capacity to equal the current member count.",
    "invalidDraft": "Please check the fields marked invalid and follow their instructions.",
    "save": "Save changes",
    "notSaved": "Saving and recruitment changes are pending backend integration. Leaving or refreshing discards this draft.",
    "confirmAccept": "Confirm accepting this applicant",
    "confirmReject": "Confirm rejecting this applicant",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  apiErrors: {
    NETWORK_ERROR: "Can't reach the server. Please check your connection.",
    UNAUTHORIZED: "Your session has expired. Please sign in again.",
    FORBIDDEN: "You don't have permission to do this.",
    NOT_FOUND: "The requested item could not be found.",
    SERVER_ERROR: "Something went wrong on the server. Please try again.",
  },
};

export type TranslationDict = typeof en;
