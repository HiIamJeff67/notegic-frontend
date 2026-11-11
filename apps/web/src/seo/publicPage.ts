export const publicSiteOrigin = "https://www.notegic.com";

export const publicFacts = {
  name: "Notegic",
  definition:
    "Notegic is a note-taking workspace for writing notes, keeping reference files, collaborating, and running recurring work.",
  audience:
    "Notegic is for people who keep notes, source files, and recurring work in one workspace.",
  limits:
    "The home page, documentation, privacy policy, license, data deletion instructions, and contact page are public. Workspace notes, files, and API responses are not public.",
} as const;

export const publicFaqs = [
  {
    question: "What is Notegic?",
    answer: publicFacts.definition,
  },
  {
    question: "Who is Notegic for?",
    answer: publicFacts.audience,
  },
  {
    question: "What can I do in Notegic?",
    answer:
      "You can write notes, review reference files, collaborate, and configure recurring work. The documentation explains the website and the public API.",
  },
  {
    question: "How do I start using Notegic?",
    answer:
      "Open the Notegic website, read the documentation, and create an account from the sign-in page. Private notes stay in your workspace.",
  },
  {
    question: "What content is public?",
    answer: publicFacts.limits,
  },
  {
    question: "How do I contact Notegic?",
    answer:
      "Use the contact page and the published contact email. Do not send passwords, API keys, or private note contents.",
  },
] as const;

export const privatePathPrefixes = [
  "/app",
  "/login",
  "/register",
  "/forgetPassword",
  "/redirect",
  "/playground",
] as const;

export const publicPages = [
  {
    path: "/",
    title: "Notegic",
    description: publicFacts.definition,
    linkLabel: "Home",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/document",
    title: "Documentation | Notegic",
    description:
      "Guides for using Notegic, the public API, releases, and privacy.",
    linkLabel: "Documentation",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Notegic",
    description: "How Notegic collects, uses, and deletes account data.",
    linkLabel: "Privacy Policy",
    changefreq: "monthly",
    priority: "0.5",
  },
  {
    path: "/eula",
    title: "End User License Agreement | Notegic",
    description: "The commercial end user license agreement for Notegic.",
    linkLabel: "EULA",
    changefreq: "monthly",
    priority: "0.4",
  },
  {
    path: "/data-deletion",
    title: "Data deletion | Notegic",
    description:
      "How to remove linked sign-in data or delete your Notegic account.",
    linkLabel: "Data deletion",
    changefreq: "monthly",
    priority: "0.5",
  },
  {
    path: "/contact",
    title: "Contact | Notegic",
    description:
      "How to contact Notegic about the product, support, or a public page.",
    linkLabel: "Contact",
    changefreq: "monthly",
    priority: "0.5",
  },
] as const;

export type PublicPagePath = (typeof publicPages)[number]["path"];

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type PublicMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export type PublicPageHead = {
  meta: PublicMeta[];
  links: Array<{ rel: "canonical"; href: string }>;
  scripts: Array<{ type: "application/ld+json"; children: string }>;
};

const normalizeOrigin = (origin: string | undefined) =>
  origin?.trim().replace(/\/+$/, "") ?? "";

export const isPublicSiteIndexable = (configuredOrigin: string | undefined) =>
  normalizeOrigin(configuredOrigin) === publicSiteOrigin;

export const publicPageUrl = (path: PublicPagePath) =>
  path === "/" ? `${publicSiteOrigin}/` : `${publicSiteOrigin}${path}`;

const publicPageByPath = (path: PublicPagePath) => {
  const page = publicPages.find(candidate => candidate.path === path);
  if (!page) {
    throw new Error(`Unknown public page: ${path}`);
  }
  return page;
};

const websiteEntity = () => ({
  "@type": "WebSite",
  name: publicFacts.name,
  url: `${publicSiteOrigin}/`,
  description: publicFacts.definition,
});

const pageJsonLd = (path: PublicPagePath): { [key: string]: JsonValue } => {
  const page = publicPageByPath(path);
  const webPage = {
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: publicPageUrl(path),
    isPartOf: websiteEntity(),
  };

  if (path !== "/") {
    return {
      "@context": "https://schema.org",
      ...webPage,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteEntity(),
      {
        "@type": "SoftwareApplication",
        name: publicFacts.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `${publicSiteOrigin}/`,
        description: publicFacts.definition,
      },
      webPage,
      {
        "@type": "FAQPage",
        mainEntity: publicFaqs.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
};

const jsonLdScript = (value: { [key: string]: JsonValue }) =>
  JSON.stringify(value).replaceAll("<", "\\u003c");

export const createPublicPageHead = (path: PublicPagePath): PublicPageHead => {
  const page = publicPageByPath(path);
  const imageUrl = `${publicSiteOrigin}/og.png`;
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:url", content: publicPageUrl(path) },
      { property: "og:type", content: "website" },
      { property: "og:image", content: imageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: imageUrl },
    ],
    links: [{ rel: "canonical", href: publicPageUrl(path) }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdScript(pageJsonLd(path)),
      },
    ],
  };
};

export const createPrivatePageHead = () => ({
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const createRobotsTxt = (indexable: boolean) => {
  if (!indexable) {
    return "User-agent: *\nDisallow: /\n";
  }

  const disallows = privatePathPrefixes
    .map(path => `Disallow: ${path}`)
    .join("\n");
  return `User-agent: *\nAllow: /\n${disallows}\n\nSitemap: ${publicSiteOrigin}/sitemap.xml\n`;
};

export const createSitemapXml = () => {
  const urls = publicPages
    .map(
      page => `  <url>
    <loc>${escapeXml(publicPageUrl(page.path))}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

export const createLlmsTxt = () => {
  const pages = publicPages
    .map(page => `- ${page.linkLabel}: ${publicPageUrl(page.path)}`)
    .join("\n");
  const questions = publicFaqs
    .map(faq => `### ${faq.question}\n\n${faq.answer}`)
    .join("\n\n");
  return `# ${publicFacts.name}

> ${publicFacts.definition}

${publicFacts.audience}

${publicFacts.limits}

## Public pages

${pages}

## Questions

${questions}

## Contact

Use ${publicPageUrl("/contact")} and the published contact email. Do not send passwords, API keys, or private note contents.
`;
};
