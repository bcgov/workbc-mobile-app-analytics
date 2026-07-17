/**
 * Maps React Navigation route names (as stored in analytics events)
 * to human-readable labels for the summary dashboard.
 *
 * Full nested paths are preferred; leaf segments are also supported
 * so labels still resolve when path depth varies.
 */
const SCREEN_LABELS: Record<string, string> = {
  // Onboarding / unauthenticated
  'Splash Screen': 'Splash',
  LandingScreen: 'Get Started',
  IntroLandingScreen: 'App Intro',
  IntroCarouselScreen: 'App Intro Carousel',
  ConsentScreen: 'Consent',
  LanguageScreenStack: 'Language',
  EnvironmentSelector: 'Environment Selector',

  // Account lookup
  'LookupScreen/Lookup': 'Account Lookup',
  Lookup: 'Account Lookup',
  'LookupScreen/ProfileFound': 'Account Found',
  ProfileFound: 'Account Found',
  'LookupScreen/ProfileNotFound': 'Account Not Found',
  ProfileNotFound: 'Account Not Found',

  // Login
  'LoginScreenStack/LoginScreen': 'Login',
  LoginScreen: 'Login',
  'LoginScreenStack/NoProfileScreen': 'No Profile Found',
  NoProfileScreen: 'No Profile Found',
  'LoginScreenStack/AlreadyUpgraded': 'Already Upgraded',
  AlreadyUpgraded: 'Already Upgraded',
  'LoginScreenStack/InvalidBCeID': 'Invalid BCeID',
  InvalidBCeID: 'Invalid BCeID',
  'LoginScreenStack/LoginError': 'Login Error',
  LoginError: 'Login Error',
  'LoginScreenStack/NotReady': 'Account Not Ready',
  NotReady: 'Account Not Ready',

  // Registration
  'RegistrationScreenStack/RegistrationLanding': 'Registration',
  RegistrationLanding: 'Registration',
  'RegistrationScreenStack/StreamSelector': 'Choose Registration Stream',
  StreamSelector: 'Choose Registration Stream',
  'RegistrationScreenStack/RegistrationFormScreen': 'Registration Form',
  RegistrationFormScreen: 'Registration Form',
  'RegistrationScreenStack/AlreadyRegisteredScreen': 'Already Registered',
  AlreadyRegisteredScreen: 'Already Registered',
  'RegistrationScreenStack/AlreadyRegisteredContinue':
    'Continue Existing Registration',
  AlreadyRegisteredContinue: 'Continue Existing Registration',
  'RegistrationScreenStack/BCSCAlreadyLinkedToOES':
    'BC Services Card Already Linked',
  BCSCAlreadyLinkedToOES: 'BC Services Card Already Linked',
  'RegistrationScreenStack/RegisteredSuccessScreen': 'Registration Successful',
  RegisteredSuccessScreen: 'Registration Successful',
  'RegistrationScreenStack/RegisteredFailureScreen': 'Registration Failed',
  RegisteredFailureScreen: 'Registration Failed',
  'RegistrationScreenStack/UpgradeSuccessScreen': 'Upgrade Successful',
  UpgradeSuccessScreen: 'Upgrade Successful',
  'RegistrationScreenStack/ContinueScreen': 'Continue Registration',
  ContinueScreen: 'Continue Registration',

  // Upgrade
  'UpgradeScreenStack/UpgradeLanding': 'Upgrade Account',
  UpgradeLanding: 'Upgrade Account',
  'UpgradeScreenStack/ReadyToUpgrade': 'Ready to Upgrade',
  ReadyToUpgrade: 'Ready to Upgrade',

  // Main tabs / home
  'Main/DrawerHome/BottomTabsHome/HomeScreen': 'Home',
  HomeScreen: 'Home',
  BottomTabsHome: 'Home',

  // Messages
  'Main/DrawerHome/Messages/Tabs': 'Messages',
  Message: 'Messages',
  MessageDetails: 'Message Details',
  NewMessage: 'New Message',
  Tabs: 'Messages',

  // Action plan
  'Main/DrawerHome/ActionPlan/ActionPlanLanding': 'Action Plan',
  ActionPlanLanding: 'Action Plan',
  'Main/DrawerHome/ActionPlan/CaseView': 'Action Plan by Case',
  CaseView: 'Action Plan by Case',
  'Main/DrawerHome/ActionPlan/ListView': 'Action Plan List',
  ListView: 'Action Plan List',
  'Main/DrawerHome/ActionPlan/ItemView': 'Action Plan Item',
  ItemView: 'Action Plan Item',

  // Job board
  'Main/DrawerHome/Job/Landing': 'Job Board',
  Landing: 'Job Board',
  'Main/DrawerHome/Job/Search': 'Job Search',
  Search: 'Job Search',
  'Main/DrawerHome/Job/Results': 'Job Results',
  Results: 'Job Results',
  'Main/DrawerHome/Job/Saved': 'Saved Jobs',
  Saved: 'Saved Jobs',
  'Main/DrawerHome/Job/Viewed': 'Viewed Jobs',
  Viewed: 'Viewed Jobs',
  'Main/DrawerHome/Job/New': 'New Jobs',
  New: 'New Jobs',
  'Main/DrawerHome/Job/JobDetails': 'Job Details',
  JobDetails: 'Job Details',
  JobDetailsScreen: 'Job Details',

  // Account
  'Account/Profile': 'Profile',
  Profile: 'Profile',
  'Account/Settings': 'Settings',
  Settings: 'Settings',
  'Account/About': 'About',
  About: 'About',
  'Account/JobPushNotifications': 'Job Notifications',
  JobPushNotifications: 'Job Notifications',
  'Account/Delete': 'Delete Account',
  Delete: 'Delete Account',
  'Account/EmailVerificationScreen': 'Email Verification',
  EmailVerificationScreen: 'Email Verification',
  'Account/TextVerificationScreen': 'Text Verification',
  TextVerificationScreen: 'Text Verification',

  // WorkBC services
  'Services/AboutTabs/MapScreen': 'Find a WorkBC Centre',
  MapScreen: 'Find a WorkBC Centre',
  'Services/AboutTabs/AboutScreen': 'About WorkBC Services',
  AboutScreen: 'About WorkBC Services',
  'Services/AboutTabs/WhatsNewScreen': "What's New",
  WhatsNewScreen: "What's New",
  AboutTabs: 'WorkBC Services',

  // Help / support
  'HelpScreenStack/HelpbotScreen': 'Help Bot',
  HelpbotScreen: 'Help Bot',
  'HelpScreenStack/HelpDetails': 'Help Details',
  HelpDetails: 'Help Details',
  Support: 'Support',

  // Cases / applications
  'CaseDetails/CaseScreen': 'Case Details',
  CaseScreen: 'Case Details',
  'CaseDetails/ApplicationScreen': 'Application',
  ApplicationScreen: 'Application',
  'CaseDetails/NewApplicationScreen': 'New Application',
  NewApplicationScreen: 'New Application',
  NewApplication: 'New Application',
  SelectCentre: 'Select WorkBC Centre',
  SuccessfulCreation: 'Application Created',
  SuccessfulSubmission: 'Application Submitted',
  ApplicationReport: 'Application Report',
  Application: 'Application',
}

function humanizeRouteSegment(segment: string): string {
  return segment
    .replace(/(Screen|Stack)$/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Returns a human-readable label for a stored analytics screen name.
 * Falls back to title-casing the leaf route segment when unmapped.
 */
export function formatScreenName(screenName: string): string {
  const trimmed = screenName.trim()
  if (!trimmed) {
    return screenName
  }

  const exact = SCREEN_LABELS[trimmed]
  if (exact) {
    return exact
  }

  const leaf = trimmed.includes('/')
    ? (trimmed.split('/').pop() ?? trimmed)
    : trimmed

  const leafLabel = SCREEN_LABELS[leaf]
  if (leafLabel) {
    return leafLabel
  }

  const humanized = humanizeRouteSegment(leaf)
  return humanized || trimmed
}
