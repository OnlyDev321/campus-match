import { TranslationDict } from "./en";

export const ko: TranslationDict = {
  nav: {
    groups: "스터디 탐색",
    myPage: "마이페이지",
    manage: "팀 관리",
    createGroup: "그룹 생성",
    designSystem: "디자인 시스템",
    login: "u-SAINT 로그인",
    logout: "로그아웃",
    notifications: "알림",
  },
  landing: {
    badge: "숭실대학교 공식 학사 연동 · 2026학년도 스터디 매칭",
    heroTitlePrefix: "신뢰할 수 있는 학우와,",
    heroTitleHighlight: "완벽한 스터디 & 프로젝트 팀",
    heroTitleSuffix: "을 완성하세요.",
    heroSubtitle:
      "CampusMatch는 숭실대학교 u-SAINT 포털 단일 인증(SSO)으로 100% 신원이 검증된 학생들만 참여하는 캠퍼스 전용 팀원 매칭 플랫폼입니다.",
    startBtn: "숭실대 u-SAINT으로 시작하기",
    browseBtn: "모집 중인 그룹 미리보기",
    seeGroupsBtn: "스터디 & 프로젝트 둘러보기",
    trustBadge1: "100% 숭실대 재학생 인증",
    trustBadge2: "비밀번호 무저장 원칙",
    trustBadge3: "학과 & 전공 맞춤 매칭",
    coreFeaturesTitle: "왜 숭실대 학생들은 CampusMatch를 선택할까요?",
    coreFeaturesSubtitle:
      "익명 커뮤니티의 잠수, 무임승차, 허위 프로필 문제를 원천 차단하고 학업에만 집중할 수 있는 환경을 만듭니다.",
    feature1Title: "100% u-SAINT SSO 인증",
    feature1Desc:
      "별도의 회원가입 없이 학교 포털 아이디로 즉시 로그인하며, 학번과 학과가 자동 연동되어 허위 계정을 원천 차단합니다.",
    feature1Sub:
      "컴퓨터학부 · 소프트웨어학부 · AI융합학부 등 단과대학 자동 분류",
    feature2Title: "Zero Password Retention",
    feature2Desc:
      "학생들의 포털 비밀번호는 서버 메모리에서 학교 SSO 서버와 검증하는 찰나에만 사용되며, DB에 0.1초도 저장되지 않습니다.",
    feature2Sub: "안전한 JWT Stateless 토큰 기반 세션 관리",
    feature3Title: "과목 & 기술 스택 매칭",
    feature3Desc:
      "캡스톤 디자인, 알고리즘 코딩 테스트, Spring Boot, React 등 원하는 목표와 기술 태그로 팀원을 빠르게 구하세요.",
    feature3Sub: "역할별 모집 인원(Frontend/Backend/Designer) 정원 관리",
    statsStudents: "인증된 숭실대 학우",
    statsGroups: "개설된 스터디 & 팀",
    statsCompletion: "프로젝트 완주율",
    statsVerification: "신원 인증 검증",
    bottomCtaTitle: "이번 학기, 멋진 프로젝트를 함께할 팀원을 찾고 계신가요?",
    bottomCtaSubtitle:
      "포털 아이디로 1초 만에 로그인하고, 숭실대 최고의 동료들과 함께 스터디를 시작해보세요.",
  },
  loginModal: {
    title: "숭실대학교 u-SAINT 로그인",
    subtitle: "포털 계정으로 1초 만에 안전하게 시작하세요",
    studentIdLabel: "학번 (학생 ID)",
    studentIdPlaceholder: "예: 20211234",
    passwordLabel: "u-SAINT 비밀번호",
    passwordPlaceholder: "포털 비밀번호를 입력하세요",
    demoFillBtn: "데모 계정 자동 입력 (홍길동 학우)",
    demoDept: "컴퓨터학부 3학년",
    submitBtn: "인증 및 로그인",
    submittingBtn: "u-SAINT 포털 인증 중...",
    securityGuaranteeTitle: "100% 무저장 보안 원칙 (Zero Password Retention)",
    securityGuaranteeDesc:
      "입력하신 비밀번호는 숭실대학교 포털 실시간 인증에만 일회성으로 사용되며, CampusMatch 데이터베이스에 절대 저장되지 않습니다.",
    errorMissing: "학번과 비밀번호를 모두 입력해주세요.",
  },
  translate: {
    btn: "한국어로 번역",
    translating: "Gemini로 번역 중...",
    showOriginal: "원문 보기",
    translatedBy: "Google Gemini AI 자동 번역",
  },
};
