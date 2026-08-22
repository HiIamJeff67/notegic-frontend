import { CommonTranslation } from "./common.type";

export const EnglishCommonTranslation: CommonTranslation = {
  syntax: {
    separator: " ",
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    create: "Create",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    choose: "Choose",
    send: "Send",
    close: "Close",
    more: "More",
    toggleSidebar: "Toggle sidebar",
    sidebar: "Sidebar",
    mobileSidebarDescription: "Displays the mobile sidebar.",
    commandPalette: "Command palette",
    searchCommands: "Search for a command to run...",
    breadcrumb: "Breadcrumb",
  },
  navigation: {
    home: "Home",
    documents: "Documents",
    settings: "Settings",
    profile: "Profile",
  },
  homePage: {
    mainTitle: "Notegic",
    secondaryTitle: "A More Humanized AI-Driven Note-Taking Application",
    subtitle: "Your digital note-taking companion",
    getStarted: "Get Started",
    viewDocs: "View Docs",
    switchTheme: "Switch Theme",
  },
  auth: {
    login: "Login",
    register: "Register",
    resetPassword: "Reset Password",
    logout: "Logout",
    account: "Account",
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    authCode: "Auth Code",
    accountExample: "e.g. example123@email.com or myName123",
    nameExample: "e.g. myName123",
    emailExample: "e.g. example123@email.com",
    passwordExample: "e.g. example-password123(&@#$",
    authCodeExample: "e.g. 123456",
    userRole: "User Role",
    userPlan: "User Plan",
    forgetPassword: "Forgot Password?",
    haveNotRegisterAnAccount: "Haven't register an account?",
    alreadyHaveAnAccount: "Already have an account?",
    authenticationPanelSubtitle: "Authentication panel for",
    oopsIForgotMyAccount: "Oops! I forgot my account..",
    pleaseInputValidName:
      "Please input a valid name which should be alphanumeric and at least 8 characters",
    pleaseInputValidEmail: "Please input a valid email",
    pleaseInputValidAccount:
      "Please input a valid account which should be either a name or an email",
    pleaseInputValidAuthCode: "Please input a valid authentication code",
    pleaseInputStrongPassword: "Please input a strong password",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "Please make sure the password and confirm password are the same",
  },
  themes: {
    theme: "Theme",
    defaultDark: "Default Dark",
    defaultLight: "Default Light",
    defaultNeon: "Default Neon",
    defaultOcean: "Default Ocean",
    defaultStandard: "Default Standard",
    defaultForest: "Default Forest",
    defaultPhoenix: "Default Phoenix",
    defaultPearl: "Default Pearl",
    defaultSakura: "Default Sakura",
    defaultCitrus: "Default Citrus",
  },
  languages: {
    language: "Language",
    english: "English",
    traditionalChinese: "Traditional Chinese",
    simpleChinese: "Simple Chinese",
    japanese: "Japanese",
    korean: "Korean",
  },
  error: {
    encounterUnknownError: "Encounter an unknown error",
    urlNotFound: "URL not found",
    unauthorized: "Unauthorized",
    permissionDeniedDueTo: "Permission denied due to:",
    apiError: {
      register: {
        failedToRegister:
          "Failed to register, please wait for a second or contact with us",
        duplicateName:
          "This name has already been registered, please choose another one",
        duplicateEmail:
          "This email has already been registered, please choose another one",
      },
      login: {
        failedToLogin:
          "Failed to login, please wait for a second or contact with us",
        wrongPassword: "Wrong password, please try again",
      },
      logout: {
        failedToLogout:
          "Failed to logout, please wait for a second or contact with us",
      },
      getUser: {
        failedToGetUser:
          "Failed to get user, please wait for a second or contact with us",
      },
    },
    localDatabaseError:
      "Unavailable to connect to local database, please wait and try again or contact wit us",
  },
  settings: {
    accountSettings: "Account Settings",
    preferences: "Preferences",
  },
};
