import { SideMenuExtension } from "@blocknote/core/extensions";
import { useExtensionState } from "@blocknote/react";
import { components as blockNoteShadcnComponents } from "@blocknote/shadcn";
import { useTranslation } from "@shared/i18n/useTranslation";
import { Form, XIcon } from "lucide-react";

export interface PatternBlock {
  id: string;
  type: string;
  label: string;
  props: Record<string, unknown>;
}

export const PatternToggleButton = ({
  patternBlockIds,
  onAddPatternBlock,
  onRemovePatternBlock,
}: {
  patternBlockIds: Set<string>;
  onAddPatternBlock: (block: PatternBlock) => void;
  onRemovePatternBlock: (blockId: string) => void;
}) => {
  const { t } = useTranslation();
  const block = useExtensionState(SideMenuExtension, {
    selector: state => state?.block,
  });

  if (!block) return null;

  const isSelected = patternBlockIds.has(block.id);
  const label = isSelected
    ? t("workspace.payloadEditor.removeFromPatternTable")
    : t("workspace.payloadEditor.addToPatternTable");
  const icon = isSelected ? (
    <XIcon className="size-3.5" />
  ) : (
    <Form className="size-3.5" />
  );
  const handleToggle = () => {
    if (isSelected) {
      onRemovePatternBlock(block.id);
      return;
    }

    onAddPatternBlock({
      id: block.id,
      type: block.type,
      props: block.props ?? {},
      label: Array.isArray(block.content)
        ? block.content
            .map((content: any) => {
              if (content.type === "text") return content.text;
              if (content.type === "link" && Array.isArray(content.content)) {
                return content.content
                  .map((linkContent: any) => linkContent.text ?? "")
                  .join("");
              }
              return "";
            })
            .join("")
            .trim()
        : "",
    });
  };

  return (
    <blockNoteShadcnComponents.SideMenu.Button
      className="bn-button"
      label={label}
      icon={icon}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        handleToggle();
      }}
    />
  );
};
