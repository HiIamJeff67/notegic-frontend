export interface CommonTranslation {
  syntax: {
    separator: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    create: string;
    save: string;
    delete: string;
    edit: string;
    choose: string;
    send: string;
    close: string;
    more: string;
    toggleSidebar: string;
    sidebar: string;
    mobileSidebarDescription: string;
    commandPalette: string;
    searchCommands: string;
    breadcrumb: string;
  };
  navigation: {
    home: string;
    documents: string;
    settings: string;
    profile: string;
  };
  homePage: {
    mainTitle: string;
    secondaryTitle: string;
    subtitle: string;
    getStarted: string;
    viewDocs: string;
    switchTheme: string;
  };
  auth: {
    login: string;
    register: string;
    resetPassword: string;
    logout: string;
    account: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    authCode: string;
    accountExample: string;
    nameExample: string;
    emailExample: string;
    passwordExample: string;
    authCodeExample: string;
    userRole: string;
    userPlan: string;
    forgetPassword: string;
    haveNotRegisterAnAccount: string;
    alreadyHaveAnAccount: string;
    authenticationPanelSubtitle: string;
    oopsIForgotMyAccount: string;
    pleaseInputValidName: string;
    pleaseInputValidEmail: string;
    pleaseInputValidAccount: string;
    pleaseInputValidAuthCode: string;
    pleaseInputStrongPassword: string;
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch: string;
  };
  themes: {
    theme: string;
    defaultDark: string;
    defaultLight: string;
    defaultNeon: string;
    defaultOcean: string;
    defaultStandard: string;
    defaultForest: string;
    defaultPhoenix: string;
    defaultPearl: string;
    defaultSakura: string;
    defaultCitrus: string;
  };
  languages: {
    language: string;
    english: string;
    traditionalChinese: string;
    simpleChinese: string;
    japanese: string;
    korean: string;
  };
  error: {
    encounterUnknownError: string;
    urlNotFound: string;
    unauthorized: string;
    permissionDeniedDueTo: string;
    apiError: {
      register: {
        failedToRegister: string;
        duplicateName: string;
        duplicateEmail: string;
      };
      login: {
        failedToLogin: string;
        wrongPassword: string;
      };
      logout: {
        failedToLogout: string;
      };
      getUser: {
        failedToGetUser: string;
        // notFound: string;
      };
    };
    localDatabaseError: string;
  };
  localDBRecovery: {
    title: string;
    description: string;
    technicalDetails: string;
    phases: {
      workerConnectionPending: string;
      workerConnected: string;
      migrationLockPending: string;
      migrationLockAcquired: string;
      readingVersion: string;
      freezingLocalWrites: string;
      waitingForLocalOperations: string;
      checkingTransactionQueue: string;
      flushingYjs: string;
      checkingRebuildability: string;
      exportingLocalData: string;
      clearingLocalStorage: string;
      rebuilding: string;
      bootstrapping: string;
      migrating: string;
      verifying: string;
      verifyingSchema: string;
      resynchronizing: string;
      ready: string;
      failed: string;
      needsAction: string;
      manualRecovery: string;
    };
    labels: {
      currentPhase: string;
      recoveryResult: string;
      recoverability: string;
      databaseVersion: string;
      targetVersion: string;
    };
    results: {
      success: string;
      retryable: string;
      needsAction: string;
      safeToRebuild: string;
      manualRecovery: string;
    };
    actions: {
      retry: string;
      reconnect: string;
      exportDiagnostics: string;
      exportLocalData: string;
      checkRebuildEligibility: string;
      continueReadOnly: string;
      rebuildLocalData: string;
    };
    confirmExport: string;
    errors: {
      retryFailed: string;
      exportFailed: string;
      readOnlyUnavailable: string;
      rebuildFailed: string;
      preflightFailed: string;
    };
  };
  settings: {
    accountSettings: string;
    preferences: string;
    // accountSetting: {};
    // preference: {
    //   appearance: {
    //     fontSize: string;
    //     compactMode: string;
    //     enableAnimation: string;
    //     interfaceLanguage: string;
    //   };
    //   privacy: {
    //     publicProfile: {}
    //     usageStates: {}
    //   }
    // };
  };
}
