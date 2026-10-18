import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { ArticleInlineText } from "@/components/commons/Article/Article";
import { ArticleMethodBadge } from "@/components/commons/Article/ArticleMethodBadge";
import { Button } from "@/components/ui/button";
import EndpointDetails from "./EndpointDetails";
import type { DocumentEndpoint } from "./generated/publicAPIData";

const EndpointTable = ({ endpoints }: { endpoints: DocumentEndpoint[] }) => {
  const [expandedOperation, setExpandedOperation] = useState<string | null>(
    null
  );

  return (
    <div className="@container/endpoint mt-5 w-full min-w-0 max-w-full overflow-x-auto rounded-sm border border-border/70">
      <table className="w-full min-w-3xl table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-20" />
          <col className="w-[24%]" />
          <col className="w-[24%]" />
          <col />
          <col className="w-32" />
          <col className="w-11" />
        </colgroup>
        <thead className="bg-muted/40 text-muted-foreground">
          <tr className="border-b border-border/70">
            <th scope="col" className="px-2 py-2 font-medium">
              Method
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Path
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Operation
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Description
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Shape
            </th>
            <th scope="col" className="px-2 py-2" aria-label="Expand details" />
          </tr>
        </thead>
        <tbody>
          {endpoints.map(endpoint => {
            const operationKey = `${endpoint.method}-${endpoint.path}-${endpoint.operationId}`;
            const isExpanded = expandedOperation === operationKey;
            return (
              <Fragment key={operationKey}>
                <tr className="border-b border-border/50">
                  <td className="px-2 py-3 align-middle">
                    <ArticleMethodBadge
                      method={endpoint.method}
                      className="min-w-14 py-1 text-sm"
                    />
                  </td>
                  <td className="px-2 py-3 align-middle font-mono text-sm text-foreground/90 [overflow-wrap:anywhere]">
                    {endpoint.path}
                  </td>
                  <td
                    data-article-operation={endpoint.operationId}
                    data-article-operation-path={endpoint.path}
                    data-article-operation-summary={endpoint.description}
                    data-article-operation-method={endpoint.method}
                    className="px-2 py-3 align-middle font-mono text-sm text-foreground [overflow-wrap:anywhere]"
                  >
                    {endpoint.operation}
                  </td>
                  <td className="px-2 py-3 align-middle text-foreground [overflow-wrap:anywhere]">
                    <ArticleInlineText>
                      {endpoint.description}
                    </ArticleInlineText>
                  </td>
                  <td className="px-2 py-3 align-middle">
                    <span className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span>
                        {endpoint.requestFields.length > 0
                          ? `${endpoint.requestFields.length} fields`
                          : "No body"}
                      </span>
                      <span>→ {endpoint.responses.length} responses</span>
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center align-middle">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded ? "Collapse details" : "Expand details"
                      }
                      className="size-7 rounded-sm text-foreground hover:bg-foreground/5 hover:text-foreground"
                      type="button"
                      onClick={() =>
                        setExpandedOperation(isExpanded ? null : operationKey)
                      }
                    >
                      {isExpanded ? <ChevronDown /> : <ChevronRight />}
                    </Button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-border/50">
                    <td className="p-0" colSpan={6}>
                      <EndpointDetails endpoint={endpoint} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EndpointTable;
