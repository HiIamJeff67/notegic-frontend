import { translateError } from "@shared/i18n/error";
import toast from "@shared/lib/toast";
import type { FeedbackReportType } from "@shared/api/interfaces/feedback.interface";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSubmitFeedbackReport } from "@/api/hooks/feedback.hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "./PreferenceRows";

interface FeedbackTabProps {
  layout?: "panel" | "article";
}

const FeedbackTab = ({ layout = "panel" }: FeedbackTabProps) => {
  const { t } = useTranslation();
  const submitMutation = useSubmitFeedbackReport();
  const [type, setType] = useState<FeedbackReportType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextIdempotencyKey = idempotencyKey ?? globalThis.crypto.randomUUID();
    setIdempotencyKey(nextIdempotencyKey);

    try {
      const response = await submitMutation.mutateAsync({
        header: { idempotencyKey: nextIdempotencyKey },
        body: {
          type,
          title: title.trim(),
          description: description.trim(),
          route: typeof window === "undefined" ? "/" : window.location.pathname,
          browserContext: {
            locale: navigator.language,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: navigator.platform,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
          },
        },
      });
      setTitle("");
      setDescription("");
      setIdempotencyKey(null);
      toast.success(
        response.data.replay
          ? t("settingsPage.preferences.feedback.replayed")
          : t("settingsPage.preferences.feedback.submitted")
      );
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Section article={layout === "article"}>
      <form className="space-y-5" onSubmit={submitReport}>
        <div className="space-y-2">
          <Label htmlFor="feedback-type">
            {t("settingsPage.preferences.feedback.type")}
          </Label>
          <Select
            value={type}
            onValueChange={value => {
              setType(value as FeedbackReportType);
              setIdempotencyKey(null);
            }}
          >
            <SelectTrigger id="feedback-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">
                {t("settingsPage.preferences.feedback.types.bug")}
              </SelectItem>
              <SelectItem value="feature_request">
                {t("settingsPage.preferences.feedback.types.featureRequest")}
              </SelectItem>
              <SelectItem value="other">
                {t("settingsPage.preferences.feedback.types.other")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-title">
            {t("settingsPage.preferences.feedback.titleLabel")}
          </Label>
          <Input
            id="feedback-title"
            maxLength={200}
            required
            value={title}
            onChange={event => {
              setTitle(event.target.value);
              setIdempotencyKey(null);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-description">
            {t("settingsPage.preferences.feedback.descriptionLabel")}
          </Label>
          <Textarea
            id="feedback-description"
            maxLength={10000}
            required
            value={description}
            onChange={event => {
              setDescription(event.target.value);
              setIdempotencyKey(null);
            }}
            rows={7}
          />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {t("settingsPage.preferences.feedback.privacyNote")}
        </p>
        <Button
          type="submit"
          disabled={
            submitMutation.isPending ||
            title.trim().length === 0 ||
            description.trim().length === 0
          }
        >
          {submitMutation.isPending
            ? t("settingsPage.preferences.feedback.submitting")
            : t("settingsPage.preferences.feedback.submit")}
        </Button>
      </form>
    </Section>
  );
};

export default FeedbackTab;
