import {
  useCreateMyAPIKey,
  useMyAPIKeys,
  useRevokeMyAPIKey,
} from "@shared/api/hooks/apiKey.hook";
import type {
  APIKeySummary,
  CreateMyAPIKeyResponse,
} from "@shared/api/interfaces/apiKey.interface";
import toast from "@shared/lib/toast";
import { CheckIcon, CopyIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import SettingMenu from "@/components/menus/SettingMenu/SettingMenu";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { translateError } from "@/i18n/error";

interface ApiKeysTabProps {
  layout?: "panel" | "page";
}

type CreatedAPIKey = CreateMyAPIKeyResponse["data"];

const formatDate = (value: Date | null, neverLabel: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(value)
    : neverLabel;

const APIKeyRow = ({
  apiKey,
  onRevoke,
  isRevoking,
  neverLabel,
  labels,
}: {
  apiKey: APIKeySummary;
  onRevoke: (apiKey: APIKeySummary) => void;
  isRevoking: boolean;
  neverLabel: string;
  labels: {
    created: string;
    lastUsed: string;
    expires: string;
    revoked: string;
    active: string;
    revoke: string;
  };
}) => {
  const isRevoked = apiKey.revokedAt !== null;
  return (
    <AccordionItem
      value={apiKey.publicId}
      className="rounded-md border border-border/70 bg-background/55 px-4"
    >
      <AccordionTrigger>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-foreground">
              {apiKey.name}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${isRevoked ? "bg-muted text-muted-foreground" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}`}
            >
              {isRevoked ? labels.revoked : labels.active}
            </span>
          </div>
          <code className="mt-1 block font-mono text-xs text-muted-foreground">
            {apiKey.keyPrefix}••••••••
          </code>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex justify-end">
          {!isRevoked && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={isRevoking}
              onClick={() => onRevoke(apiKey)}
            >
              {isRevoking ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Trash2Icon />
              )}
              {labels.revoke}
            </Button>
          )}
        </div>
        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">{labels.created}</dt>
            <dd className="mt-1 text-foreground">
              {formatDate(apiKey.createdAt, neverLabel)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{labels.lastUsed}</dt>
            <dd className="mt-1 text-foreground">
              {formatDate(apiKey.lastUsedAt, neverLabel)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {isRevoked ? labels.revoked : labels.expires}
            </dt>
            <dd className="mt-1 text-foreground">
              {formatDate(
                isRevoked ? apiKey.revokedAt : apiKey.expiresAt,
                neverLabel
              )}
            </dd>
          </div>
        </dl>
      </AccordionContent>
    </AccordionItem>
  );
};

const ApiKeysTab = ({ layout = "panel" }: ApiKeysTabProps) => {
  const { t } = useTranslation();
  const listQuery = useMyAPIKeys(true);
  const createMutation = useCreateMyAPIKey();
  const revokeMutation = useRevokeMyAPIKey();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [createdAPIKey, setCreatedAPIKey] = useState<CreatedAPIKey | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const apiKeys = listQuery.data?.data.items ?? [];
  const neverLabel = t("settingsPage.account.apiKeys.never");

  const resetCreateForm = () => {
    setName("");
    setExpiresAt(undefined);
    setCreateOpen(false);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await createMutation.mutateAsync({
        body: {
          name: name.trim(),
          expiresAt: expiresAt ?? null,
        },
      });
      setCreatedAPIKey(response.data);
      setCopied(false);
      resetCreateForm();
      toast.success(t("settingsPage.account.apiKeys.createdToast"));
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  const handleCopy = async () => {
    if (!createdAPIKey) return;
    try {
      await navigator.clipboard.writeText(createdAPIKey.secret);
      setCopied(true);
      toast.success(t("settingsPage.account.apiKeys.copiedToast"));
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  const handleRevoke = async (apiKey: APIKeySummary) => {
    if (!window.confirm(t("settingsPage.account.apiKeys.revokeConfirm"))) {
      return;
    }
    try {
      await revokeMutation.mutateAsync({
        param: { publicId: apiKey.publicId },
      });
      toast.success(t("settingsPage.account.apiKeys.revokedToast"));
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <SettingMenu layout={layout} menuItemsClassName="gap-4">
      <div className="rounded-md border border-border bg-background/55 p-5">
        <div className="min-w-0">
          <h3 className="font-medium text-foreground">
            {t("settingsPage.account.apiKeys.securityTitle")}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t("settingsPage.account.apiKeys.securityDescription")}
          </p>
        </div>
      </div>

      <SettingMenuItem
        title={t("settingsPage.account.apiKeys.createTitle")}
        description={t("settingsPage.account.apiKeys.createDescription")}
      >
        <Button type="button" onClick={() => setCreateOpen(true)}>
          {t("settingsPage.account.apiKeys.create")}
        </Button>
      </SettingMenuItem>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium text-foreground">
            {t("settingsPage.account.apiKeys.listTitle")}
          </h3>
          {listQuery.isFetching && (
            <Loader2Icon className="size-4 animate-spin" />
          )}
        </div>
        {listQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : listQuery.isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {translateError(listQuery.error, t)}
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-border bg-background/35 p-8 text-center">
            <h3 className="font-medium text-foreground">
              {t("settingsPage.account.apiKeys.emptyTitle")}
            </h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              {t("settingsPage.account.apiKeys.emptyDescription")}
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {apiKeys.map(apiKey => (
              <APIKeyRow
                key={apiKey.publicId}
                apiKey={apiKey}
                onRevoke={handleRevoke}
                isRevoking={
                  revokeMutation.isPending &&
                  revokeMutation.variables?.param.publicId === apiKey.publicId
                }
                neverLabel={neverLabel}
                labels={{
                  created: t("settingsPage.account.apiKeys.createdAt"),
                  lastUsed: t("settingsPage.account.apiKeys.lastUsedAt"),
                  expires: t("settingsPage.account.apiKeys.expiresAt"),
                  revoked: t("settingsPage.account.apiKeys.revokedAt"),
                  active: t("settingsPage.account.apiKeys.active"),
                  revoke: t("settingsPage.account.apiKeys.revoke"),
                }}
              />
            ))}
          </Accordion>
        )}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={open => {
          if (!createMutation.isPending) setCreateOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("settingsPage.account.apiKeys.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("settingsPage.account.apiKeys.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="api-key-name">
                {t("settingsPage.account.apiKeys.nameLabel")}
              </Label>
              <Input
                id="api-key-name"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder={t("settingsPage.account.apiKeys.namePlaceholder")}
                maxLength={64}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key-expires">
                {t("settingsPage.account.apiKeys.expiresAt")}
              </Label>
              <DatePicker
                id="api-key-expires"
                value={expiresAt}
                onValueChange={setExpiresAt}
                placeholder={neverLabel}
                disabled={{ before: new Date() }}
              />
              <p className="text-xs text-muted-foreground">
                {t("settingsPage.account.apiKeys.expirationHint")}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => resetCreateForm()}
                disabled={createMutation.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2Icon className="animate-spin" />
                )}
                {t("settingsPage.account.apiKeys.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createdAPIKey !== null}
        onOpenChange={open => {
          if (!open) setCreatedAPIKey(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("settingsPage.account.apiKeys.secretTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("settingsPage.account.apiKeys.secretDescription")}
            </DialogDescription>
          </DialogHeader>
          {createdAPIKey && (
            <div className="space-y-4">
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t("settingsPage.account.apiKeys.secretWarning")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                  {createdAPIKey.secret}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  <span className="sr-only">
                    {t("settingsPage.account.apiKeys.copySecret")}
                  </span>
                </Button>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatedAPIKey(null)}
                >
                  {t("common.confirm")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SettingMenu>
  );
};

export default ApiKeysTab;
