import { ArticleInlineText } from "./ArticleInlineText";

export type ArticleField = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  constraints?: readonly string[];
  children?: readonly ArticleField[];
};

export const ArticleFieldList = ({
  fields,
}: {
  fields: readonly ArticleField[];
}) => {
  if (fields.length === 0) {
    return <p className="text-muted-foreground">No documented fields.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {fields.map(field => (
        <li key={field.name}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <code className="font-mono text-sm text-foreground">
              {field.name}
            </code>
            <span className="font-mono text-sm text-muted-foreground">
              {field.type}
              {field.required ? " · required" : " · optional"}
            </span>
          </div>
          {field.description && (
            <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
              <ArticleInlineText>{field.description}</ArticleInlineText>
            </p>
          )}
          {field.constraints && field.constraints.length > 0 && (
            <p className="mt-0.5 break-words font-mono text-xs text-muted-foreground">
              {field.constraints.join(" · ")}
            </p>
          )}
          {field.children && field.children.length > 0 && (
            <div className="mt-1.5 border-l border-border/70 pl-3">
              <ArticleFieldList fields={field.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
