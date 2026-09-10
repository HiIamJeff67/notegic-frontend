export type TutorialTranslation = {
  navigation: {
    home: string;
    document: string;
    overview: string;
    overviewDescription: string;
    apiKeys: string;
    apiKeysDescription: string;
    keyManagement: string;
    keyManagementDescription: string;
    model: string;
    modelDescription: string;
    integrationPatterns: string;
    integrationPatternsDescription: string;
    qa: string;
    qaDescription: string;
  };
  overview: { subtitle: string; intro: string };
  apiKeys: {
    title: string;
    subtitle: string;
    intro: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step4Suffix: string;
  };
  keyManagement: {
    title: string;
    subtitle: string;
    item1: string;
    item2: string;
    item3: string;
    item4: string;
  };
  model: {
    title: string;
    subtitle: string;
    diagram: string;
    intro: string;
    documentLink: string;
  };
  domains: {
    structure: string;
    viewApiOperations: string;
    rootShelves: DomainTranslation;
    subShelves: DomainTranslation;
    materials: DomainTranslation;
    blockPacks: DomainTranslation;
    blocks: DomainTranslation;
    stations: DomainTranslation;
    routines: DomainTranslation;
    routineTasks: DomainTranslation;
    routineTags: DomainTranslation;
  };
  integration: {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
  };
  qa: {
    title: string;
    subtitle: string;
    questions: Record<string, { question: string; answer: string }>;
  };
};

type DomainTranslation = {
  title: string;
  summary: string;
  structure: string;
  details: string;
};

export const EnglishTutorialTranslation = {
  navigation: {
    home: "Home",
    document: "Document",
    overview: "Tutorial overview",
    overviewDescription: "API-key integrations and the Notegic resource model.",
    apiKeys: "API keys",
    apiKeysDescription: "Generate and safely use an integration key.",
    keyManagement: "Key management",
    keyManagementDescription: "Review, rotate, and revoke keys.",
    model: "Notegic structure",
    modelDescription: "The resource hierarchy at a glance.",
    integrationPatterns: "Integration patterns",
    integrationPatternsDescription:
      "Keep API keys on the server and call the public gateway.",
    qa: "Q&A",
    qaDescription: "Answers to common Notegic integration questions.",
  },
  overview: {
    subtitle:
      "A practical guide to API-key integrations and the Notegic resource model.",
    intro:
      "Start with the API key workflow, then use the Notegic structure guide to understand which resource family your integration should call.",
  },
  apiKeys: {
    title: "Generate your first API key",
    subtitle:
      "API keys authenticate server-to-server calls to the public API Gateway.",
    intro:
      "An API key is not a replacement for the browser session and must never be shipped to frontend code.",
    step1: "Open Account settings and select API keys.",
    step2: "Create a named key for one integration or environment.",
    step3: "Copy the complete secret immediately; it is displayed only once.",
    step4: "Store it in a server secret manager and send it as",
    step4Suffix: " on each request.",
  },
  keyManagement: {
    title: "Manage and revoke keys",
    subtitle:
      "Key metadata is visible after creation, but the secret is never returned again.",
    item1: "Use separate keys for production and development environments.",
    item2: "Rotate a key when an owner or environment changes.",
    item3: "Revoke immediately if a secret may have leaked.",
    item4: "Keep raw secrets out of logs, URLs, and metrics.",
  },
  model: {
    title: "Understand the Notegic structure",
    subtitle:
      "Notegic separates organization, content, and execution so integrations can request only the resource family they need.",
    diagram:
      "Root shelf\n├─ Sub shelves\n│  ├─ Materials\n│  └─ Block Packs\n│     └─ Blocks\n└─ Station\n   └─ Routine\n      ├─ Routine tasks\n      └─ Routine tags",
    intro:
      "Each resource section below explains its boundary and links to the public API reference in the",
    documentLink: "document page",
  },
  domains: {
    structure: "Structure",
    viewApiOperations: "View {{title}} API operations",
    rootShelves: {
      title: "Root Shelves",
      summary:
        "A root shelf is the top-level workspace boundary for a collection of Notegic content.",
      structure: "Root shelf → sub shelves → Block Packs → blocks",
      details:
        "Use a root shelf when a team, project, or personal area needs its own members, ownership, and permissions. Keep broad access decisions at this level so every nested resource inherits a clear context.",
    },
    subShelves: {
      title: "Sub Shelves",
      summary:
        "Sub shelves divide a root shelf into smaller, navigable areas without creating another top-level workspace.",
      structure: "Root shelf → sub shelf → ordered items",
      details:
        "Use sub shelves for projects, subjects, or stages of work. Their ordering and traversal endpoints let a client render the same hierarchy users see in Notegic.",
    },
    materials: {
      title: "Materials",
      summary:
        "Materials are source files and references that support the content stored in a shelf or document.",
      structure: "Material → metadata + content reference + parent location",
      details:
        "Treat materials as inputs rather than documents themselves. Keep their metadata stable, attach them to the appropriate parent, and use recovery endpoints when a user needs to restore one.",
    },
    blockPacks: {
      title: "Block Packs",
      summary:
        "A Block Pack is a collaborative document container made from one or more blocks.",
      structure: "Block Pack → ordered blocks → realtime editing session",
      details:
        "Use the Block Pack API for lifecycle and permissions. The separate private realtime ticket flow is responsible for collaborative editing; API keys should remain on your server.",
    },
    blocks: {
      title: "Blocks",
      summary: "Blocks are the small content units that make up a Block Pack.",
      structure: "Block Pack → block id → content + ordering metadata",
      details:
        "Address blocks through their containing Block Pack when possible. This keeps authorization and ordering decisions tied to the document boundary.",
    },
    stations: {
      title: "Stations",
      summary:
        "Stations are execution-oriented workspaces where routines and their resources come together.",
      structure: "Station → members + permissions + routine links",
      details:
        "Use a station to model where work runs. Manage membership and permission changes before creating automation that depends on the station.",
    },
    routines: {
      title: "Routines",
      summary:
        "A routine describes a repeatable automation flow and its schedule.",
      structure: "Routine → schedule → routine tasks",
      details:
        "A routine is the definition, not a single execution. Keep the routine stable and use its task links and lifecycle operations to inspect or change the work it schedules.",
    },
    routineTasks: {
      title: "Routine Tasks",
      summary:
        "Routine tasks are executable steps created from a routine and claimed by the scheduler.",
      structure: "Routine → task payload → worker claim → result",
      details:
        "A task can remain idle until it is eligible to run. The monthly execution quota is consumed when the backend claims the task, so clients must not reject a task based on a local payload estimate.",
    },
    routineTags: {
      title: "Routine Tags",
      summary:
        "Routine tags are lightweight labels for grouping and finding routine tasks.",
      structure: "Tag → linked routine tasks → filtered task view",
      details:
        "Use tags for user-facing organization and filtering. They are independent resources, so deleting a tag should not be treated as deleting the tasks it labels.",
    },
  },
  integration: {
    title: "Integration patterns",
    subtitle: "Keep API keys on the server and call the public gateway.",
    paragraph1:
      "Keep the API key in your backend, worker, or CLI process. Your service calls the API Gateway, validates responses, and exposes only the data your own client needs.",
    paragraph2:
      "The Notegic web app uses ClientGateway with HttpOnly JWT cookies. Do not add an API key to browser storage, a URL, frontend environment variables, or a WebSocket frame.",
  },
  qa: {
    title: "Q&A",
    subtitle: "Common questions about Notegic resources and integrations.",
    questions: {
      blockPack: {
        question: "What is a Block Pack?",
        answer:
          "A Block Pack is a collaborative document container made from ordered blocks. Use the API for lifecycle and permissions, and use the realtime flow for collaborative editing.",
      },
      apiKeyStorage: {
        question: "Where should I store an API key?",
        answer:
          "Store it in a backend, worker, CLI secret manager, or deployment secret. Do not put it in frontend environment variables, browser storage, URLs, logs, or WebSocket frames.",
      },
      separateEnvironments: {
        question: "Should I use one API key for every environment?",
        answer:
          "No. Create separate keys for development, staging, and production so each environment can be rotated or revoked independently.",
      },
      shelfDifference: {
        question:
          "What is the difference between a Root Shelf and a Sub Shelf?",
        answer:
          "A Root Shelf is a top-level workspace boundary for ownership, membership, and permissions. A Sub Shelf organizes content inside that boundary without creating another workspace.",
      },
      station: {
        question: "When should I use a Station?",
        answer:
          "Use a Station when you need an execution-oriented workspace that brings members, permissions, and routines together.",
      },
      routineDifference: {
        question:
          "What is the difference between a Routine and a Routine Task?",
        answer:
          "A Routine is the repeatable automation definition and schedule. A Routine Task is an executable step created from that definition and claimed by the scheduler.",
      },
      routineQuota: {
        question: "When is routine quota consumed?",
        answer:
          "Quota is consumed when the backend claims a Routine Task for execution. A client should not reject a task based only on a local estimate of its payload cost.",
      },
      leakedApiKey: {
        question: "What should I do if an API key may have leaked?",
        answer:
          "Revoke it immediately, create a replacement key, update the server-side secret, and review logs or deployments for places where the old secret may have been exposed.",
      },
    },
  },
} as const satisfies TutorialTranslation;
