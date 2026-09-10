import type { TutorialTranslation } from "./tutorial.en";

export const SimpleChineseTutorialTranslation = {
  navigation: {
    home: "首页",
    document: "文档",
    overview: "教程概览",
    overviewDescription: "API 密钥集成与 Notegic 资源模型。",
    apiKeys: "API 密钥",
    apiKeysDescription: "创建并安全使用集成密钥。",
    keyManagement: "密钥管理",
    keyManagementDescription: "查看、轮换和撤销密钥。",
    model: "Notegic 结构",
    modelDescription: "快速了解资源层级。",
    integrationPatterns: "集成模式",
    integrationPatternsDescription:
      "将 API 密钥保留在服务器并调用公共 gateway。",
    qa: "问答",
    qaDescription: "Notegic 集成常见问题的解答。",
  },
  overview: {
    subtitle: "API 密钥集成与 Notegic 资源模型的实用指南。",
    intro:
      "先从 API 密钥流程开始，再通过 Notegic 结构指南了解你的集成应该调用哪一类资源。",
  },
  apiKeys: {
    title: "创建你的第一把 API 密钥",
    subtitle: "API 密钥用于验证服务器到服务器的公共 API Gateway 调用。",
    intro: "API 密钥不能替代浏览器会话，也绝不能随前端代码一起发布。",
    step1: "打开账户设置并选择 API 密钥。",
    step2: "为单个集成或环境创建一把有名称的密钥。",
    step3: "立即复制完整密钥；它只会显示一次。",
    step4: "将它保存到服务器的密钥管理工具中，并使用",
    step4Suffix: " 发送每个请求。",
  },
  keyManagement: {
    title: "管理和撤销密钥",
    subtitle: "创建后可以查看密钥 metadata，但密钥不会再次返回。",
    item1: "为生产环境和开发环境使用不同的密钥。",
    item2: "当所有者或环境发生变化时轮换密钥。",
    item3: "如果密钥可能泄漏，请立即撤销。",
    item4: "不要将原始密钥放入日志、网址或 metrics。",
  },
  model: {
    title: "了解 Notegic 结构",
    subtitle: "Notegic 将组织、内容和执行分开，让集成只请求需要的资源类型。",
    diagram:
      "根层架\n├─ 子层架\n│  ├─ 素材\n│  └─ 区块包\n│     └─ 区块\n└─ 工作站\n   └─ 流程\n      ├─ 流程任务\n      └─ 流程标签",
    intro: "下面的每个资源区块都会说明其边界，并链接到",
    documentLink: "文档页面",
  },
  domains: {
    structure: "结构",
    viewApiOperations: "查看 {{title}} API 操作",
    rootShelves: {
      title: "根层架",
      summary: "根层架是 Notegic 内容集合最上层的工作区边界。",
      structure: "根层架 → 子层架 → 区块包 → 区块",
      details:
        "当团队、项目或个人区域需要自己的成员、所有权和权限时，请使用根层架。将广泛的访问决策放在这一层，让所有嵌套资源都继承清晰的上下文。",
    },
    subShelves: {
      title: "子层架",
      summary:
        "子层架可以将根层架分成更小且易于导航的区域，而不创建另一个顶层工作区。",
      structure: "根层架 → 子层架 → 已排序项目",
      details:
        "使用子层架整理项目、主题或工作阶段。排序和遍历 endpoints 让 client 能呈现用户在 Notegic 中看到的相同层级。",
    },
    materials: {
      title: "素材",
      summary: "素材是支持层架或文档内容的源文件和参考资料。",
      structure: "素材 → metadata + 内容引用 + 父级位置",
      details:
        "将素材视为输入，而不是文档本身。保持 metadata 稳定，将素材附加到适当的父级，并在用户需要恢复时使用 recovery endpoints。",
    },
    blockPacks: {
      title: "区块包",
      summary: "区块包是由一个或多个区块组成的协作文档容器。",
      structure: "区块包 → 已排序区块 → 实时编辑会话",
      details:
        "使用区块包 API 管理生命周期和权限。独立的 private realtime ticket 流程负责协作编辑；API 密钥应保留在你的服务器上。",
    },
    blocks: {
      title: "区块",
      summary: "区块是组成区块包的细小内容单元。",
      structure: "区块包 → 区块 ID → 内容 + 排序 metadata",
      details:
        "如果可以，请通过所属的区块包操作区块，让授权和排序决策都保持在文档边界内。",
    },
    stations: {
      title: "工作站",
      summary: "工作站是让流程和相关资源汇集在一起、以执行为导向的工作区。",
      structure: "工作站 → 成员 + 权限 + 流程链接",
      details:
        "使用工作站描述工作执行的位置。在创建依赖工作站的自动化之前，先管理成员和权限变化。",
    },
    routines: {
      title: "流程",
      summary: "流程描述可重复的自动化流程及其计划。",
      structure: "流程 → 计划 → 流程任务",
      details:
        "流程是定义，不是单次执行。保持流程稳定，并使用任务链接和生命周期操作查看或更改它安排的工作。",
    },
    routineTasks: {
      title: "流程任务",
      summary: "流程任务是由流程创建、并由调度器领取的可执行步骤。",
      structure: "流程 → 任务 payload → worker 领取 → 结果",
      details:
        "任务在符合执行条件前可以保持闲置。每月执行配额会在后端领取任务时消耗，因此 client 不应只根据本地 payload 估算值拒绝任务。",
    },
    routineTags: {
      title: "流程标签",
      summary: "流程标签是用于分类和查找流程任务的轻量标签。",
      structure: "标签 → 已关联流程任务 → 筛选后的任务视图",
      details:
        "使用标签进行面向用户的整理和筛选。标签是独立资源，因此删除标签不应被视为删除它标记的任务。",
    },
  },
  integration: {
    title: "集成模式",
    subtitle: "将 API 密钥保留在服务器并调用公共 gateway。",
    paragraph1:
      "将 API 密钥保留在你的 backend、worker 或 CLI 进程中。你的服务调用 API Gateway、验证响应，并只向自己的 client 暴露需要的数据。",
    paragraph2:
      "Notegic web app 使用带有 HttpOnly JWT cookies 的 ClientGateway。不要将 API 密钥加入浏览器存储、网址、前端环境变量或 WebSocket frame。",
  },
  qa: {
    title: "问答",
    subtitle: "Notegic 资源与集成的常见问题。",
    questions: {
      blockPack: {
        question: "什么是区块包？",
        answer:
          "区块包是由已排序区块组成的协作文档容器。使用 API 管理生命周期和权限，并使用 realtime 流程进行协作编辑。",
      },
      apiKeyStorage: {
        question: "API 密钥应该存储在哪里？",
        answer:
          "将它存储在 backend、worker、CLI 密钥管理工具或部署密钥中。不要放入前端环境变量、浏览器存储、网址、日志或 WebSocket frame。",
      },
      separateEnvironments: {
        question: "所有环境都应该使用同一把 API 密钥吗？",
        answer:
          "不应该。请为开发、staging 和 production 创建不同密钥，让每个环境都能独立轮换或撤销。",
      },
      shelfDifference: {
        question: "根层架和子层架有什么区别？",
        answer:
          "根层架是负责所有权、成员和权限的顶层工作区边界。子层架则在这个边界内整理内容，不会创建另一个工作区。",
      },
      station: {
        question: "什么时候应该使用工作站？",
        answer:
          "当你需要将成员、权限和流程结合成一个以执行为导向的工作区时，请使用工作站。",
      },
      routineDifference: {
        question: "流程和流程任务有什么区别？",
        answer:
          "流程是可重复的自动化定义和计划；流程任务则是由该定义创建、并由调度器领取的可执行步骤。",
      },
      routineQuota: {
        question: "流程配额什么时候会消耗？",
        answer:
          "配额会在后端领取流程任务执行时消耗。client 不应只根据本地 payload 成本估算拒绝任务。",
      },
      leakedApiKey: {
        question: "如果 API 密钥可能泄漏，我该怎么办？",
        answer:
          "立即撤销它、创建替代密钥、更新服务器端密钥，并检查日志或部署内容中是否暴露过旧密钥。",
      },
    },
  },
} as const satisfies TutorialTranslation;
