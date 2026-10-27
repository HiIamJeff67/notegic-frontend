import { WebURLPathDictionary } from "@shared/constants";
import { KeyRoundIcon } from "lucide-react";
import {
  ArticleLink,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import CodeExamplePanel from "@/components/panels/CodeExamplePanel/CodeExamplePanel";
import { gatewayEndpointGroups } from "./api-reference/generated/publicAPIData";

export const apiKeyNavigation = {
  id: "quick-start",
  title: "API key",
  description: "Generate, store, use, and revoke an integration key.",
  weight: 3 as const,
  icon: KeyRoundIcon,
} as const;

const APIKey = () => {
  const accountApiKeysPath = `/${WebURLPathDictionary.app.setting.account}#api-keys`;
  const example = gatewayEndpointGroups
    .flatMap(group => group.endpoints)
    .find(
      endpoint => endpoint.method === "GET" && endpoint.path === "/routine-tags"
    );

  return (
    <ArticleSubParagraph
      id={apiKeyNavigation.id}
      separatorFullWidth
      className="mx-auto max-w-full md:max-w-2xl xl:max-w-4xl"
    >
      <ArticleSubParagraphHeader>
        {apiKeyNavigation.title}
      </ArticleSubParagraphHeader>
      <ArticleSubParagraphContent>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Make your first read-only request from a trusted server or CLI.
        </p>
        <p className="mb-4">
          <ArticleLink href={accountApiKeysPath}>
            Open Account settings → API keys
          </ArticleLink>
          .
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Create a named key for this integration.</li>
          <li>
            Copy the secret when it appears and save it in your server's secret
            manager. It is shown only once.
          </li>
          <li>
            Replace &lt;YOUR_API_KEY&gt; in the example with your key. Keep the
            key out of browser code, URLs, and logs.
          </li>
          <li>
            Run the request and check the HTTP status and response body. A
            successful list can be empty.
          </li>
        </ol>
        {example && (
          <CodeExamplePanel
            title="Read your routine tags"
            code={{ curl: example.examples.curl, http: example.examples.http }}
          />
        )}
        <p className="text-sm text-muted-foreground">
          For 401, check that the key is valid and has not expired or been
          revoked. For 403, check access to the requested resource. Never
          include the key when reporting an error.
        </p>
        <p>
          <ArticleLink href="/document#api-key-management">
            Learn how to manage and revoke API keys
          </ArticleLink>
        </p>
      </ArticleSubParagraphContent>
    </ArticleSubParagraph>
  );
};

export default APIKey;
