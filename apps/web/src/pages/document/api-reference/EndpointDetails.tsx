import { cn } from "@shared/util/utils";
import { ChevronRight } from "lucide-react";
import {
  ArticleFieldList,
  ArticleInlineText,
} from "@/components/commons/Article/Article";
import PrismCode from "@/components/commons/PrismCode/PrismCode";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DocumentEndpoint } from "./generated/publicAPIData";

const EndpointDetails = ({ endpoint }: { endpoint: DocumentEndpoint }) => {
  const headerParameters = endpoint.parameters.filter(
    parameter => parameter.location === "header"
  );
  const userAgentParameter = headerParameters.find(
    parameter => parameter.name.toLowerCase() === "user-agent"
  );
  const requestHeaders = Object.fromEntries(
    headerParameters
      .filter(parameter => parameter !== userAgentParameter)
      .map(parameter => [parameter.name, parameter.example ?? "example"])
  );
  const requestHeadersJson = JSON.stringify(requestHeaders, null, 2);
  const userAgentJson = JSON.stringify(
    userAgentParameter
      ? { [userAgentParameter.name]: userAgentParameter.example ?? "example" }
      : {},
    null,
    2
  );
  const requestBodyJson = JSON.stringify(
    endpoint.requestExample ?? {},
    null,
    2
  );

  return (
    <div className="grid min-w-0 gap-5 border-t border-border/60 bg-muted/70 p-4 @3xl/endpoint:grid-cols-2">
      <div className="min-w-0">
        <p className="mb-3 text-base font-semibold text-foreground">Request</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm leading-6 text-muted-foreground">
              Examples are illustrative. Replace the API key and resource IDs,
              and follow the field constraints before sending a request.
            </p>
            <PrismCode
              title="Headers"
              code={{
                json: requestHeadersJson,
              }}
            />
          </div>
          {userAgentParameter && (
            <div className="space-y-2">
              <PrismCode
                title="User agent"
                code={{
                  json: userAgentJson,
                }}
              />
            </div>
          )}
          {endpoint.requestExample !== null &&
            endpoint.requestExample !== undefined && (
              <div className="space-y-2">
                <PrismCode
                  title="Body"
                  code={{
                    json: requestBodyJson,
                  }}
                />
              </div>
            )}
          <div className="space-y-2">
            <PrismCode
              title="Example"
              code={{
                curl: endpoint.examples.curl,
                http: endpoint.examples.http,
              }}
            />
          </div>
        </div>
        {endpoint.parameters.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-3">
            <p className="mb-2 text-sm font-medium text-foreground">
              Parameters
            </p>
            <ArticleFieldList
              fields={endpoint.parameters.map(parameter => ({
                name: parameter.name,
                type: `${parameter.location} · ${parameter.type}`,
                required: parameter.required,
                description: parameter.description,
                constraints: parameter.constraints,
              }))}
            />
          </div>
        )}
        {endpoint.requestFields.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-3">
            <p className="mb-2 text-sm font-medium text-foreground">
              Body fields
            </p>
            <ArticleFieldList fields={endpoint.requestFields} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="mb-3 text-base font-semibold text-foreground">
          Responses
        </p>
        <div className="space-y-2">
          {endpoint.responses.map(response => (
            <Collapsible
              className="min-w-0 overflow-hidden rounded-sm border border-border/70 bg-card"
              key={response.status}
            >
              <div className="flex items-center gap-3 p-3">
                <span
                  className={cn(
                    "shrink-0 rounded-sm border px-2 py-0.5 font-mono text-sm",
                    response.status.startsWith("2")
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : /^[45]/.test(response.status)
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {response.status}
                </span>
                <span className="min-w-0 flex-1 break-words">
                  <ArticleInlineText>{response.description}</ArticleInlineText>
                </span>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group size-7 shrink-0 text-muted-foreground"
                    aria-label={`Toggle ${response.status} response details`}
                  >
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-data-[state=open]:rotate-90 motion-reduce:transition-none"
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4 border-t border-border/60 p-3">
                {response.hasBody ? (
                  <>
                    <PrismCode
                      title="Response body"
                      code={{ json: JSON.stringify(response.example, null, 2) }}
                    />
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">
                        Fields
                      </p>
                      <ArticleFieldList fields={response.fields} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No response body.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EndpointDetails;
