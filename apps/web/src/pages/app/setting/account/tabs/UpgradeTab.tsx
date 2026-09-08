import { UserPlan } from "@shared/api/interfaces/enums";
import { type PlanLimitation, PlanLimitations } from "@shared/constants";
import {
  CheckIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  GaugeIcon,
  HeartIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks";

type PlanOption = {
  plan: UserPlan;
  labelKey:
    | "settingsPage.account.upgrade.free"
    | "settingsPage.account.upgrade.pro"
    | "settingsPage.account.upgrade.premium"
    | "settingsPage.account.upgrade.ultimate"
    | "settingsPage.account.upgrade.enterprise";
  tone: string;
  noteKey:
    | "settingsPage.account.upgrade.freeNote"
    | "settingsPage.account.upgrade.proNote"
    | "settingsPage.account.upgrade.premiumNote"
    | "settingsPage.account.upgrade.ultimateNote"
    | "settingsPage.account.upgrade.enterpriseNote";
  bestForKey:
    | "settingsPage.account.upgrade.freeBestFor"
    | "settingsPage.account.upgrade.proBestFor"
    | "settingsPage.account.upgrade.premiumBestFor"
    | "settingsPage.account.upgrade.ultimateBestFor"
    | "settingsPage.account.upgrade.enterpriseBestFor";
  limitations: PlanLimitation;
};

const planOptions: PlanOption[] = [
  {
    plan: UserPlan.Free,
    labelKey: "settingsPage.account.upgrade.free",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.freeNote",
    bestForKey: "settingsPage.account.upgrade.freeBestFor",
    limitations: PlanLimitations[UserPlan.Free],
  },
  {
    plan: UserPlan.Pro,
    labelKey: "settingsPage.account.upgrade.pro",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.proNote",
    bestForKey: "settingsPage.account.upgrade.proBestFor",
    limitations: PlanLimitations[UserPlan.Pro],
  },
  {
    plan: UserPlan.Premium,
    labelKey: "settingsPage.account.upgrade.premium",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.premiumNote",
    bestForKey: "settingsPage.account.upgrade.premiumBestFor",
    limitations: PlanLimitations[UserPlan.Premium],
  },
  {
    plan: UserPlan.Ultimate,
    labelKey: "settingsPage.account.upgrade.ultimate",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.ultimateNote",
    bestForKey: "settingsPage.account.upgrade.ultimateBestFor",
    limitations: PlanLimitations[UserPlan.Ultimate],
  },
  {
    plan: UserPlan.Enterprise,
    labelKey: "settingsPage.account.upgrade.enterprise",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.enterpriseNote",
    bestForKey: "settingsPage.account.upgrade.enterpriseBestFor",
    limitations: PlanLimitations[UserPlan.Enterprise],
  },
];

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
  }
  return `${Math.round(bytes / 1024 / 1024)} MB`;
};

interface UpgradeTabProps {
  layout?: "panel" | "page";
}

const UpgradeTab = ({ layout = "panel" }: UpgradeTabProps) => {
  const { i18n, t } = useTranslation();
  const userManager = useUser();
  const currentPlan = userManager.userData?.plan ?? UserPlan.Free;

  const currentOption = useMemo(
    () =>
      planOptions.find(option => option.plan === currentPlan) ?? planOptions[0],
    [currentPlan]
  );

  return (
    <div
      className={
        layout === "panel"
          ? "h-full overflow-y-auto bg-muted px-8 pt-10 pb-8 [scrollbar-color:var(--muted-foreground)_var(--secondary)]!"
          : "min-h-full pb-[var(--density-content-padding)]"
      }
    >
      <div className="flex w-full flex-col gap-5">
        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
          <div className="relative overflow-hidden rounded-md border border-border bg-background/45 p-5 shadow-inner">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
            <div className="pr-28">
              <div>
                <h3 className="text-2xl font-semibold text-foreground">
                  {t(currentOption.labelKey)}
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {t(currentOption.bestForKey)}
                </p>
              </div>
            </div>
            <div className="absolute top-5 right-5 flex min-w-24 items-center justify-center rounded-sm border border-border bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
              {t("settingsPage.account.upgrade.active")}
            </div>

            <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-2">
              {[
                {
                  icon: DatabaseIcon,
                  label: t("settingsPage.account.upgrade.blocks"),
                  value: currentOption.limitations.maxBlockCount,
                },
                {
                  icon: GaugeIcon,
                  label: t("settingsPage.account.upgrade.workflows"),
                  value: currentOption.limitations.maxWorkflowCount,
                },
                {
                  icon: ShieldCheckIcon,
                  label: t("settingsPage.account.upgrade.taskCostUnits"),
                  value: currentOption.limitations.maxRoutineTaskCostUnitCount,
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-sm border border-border bg-muted/40 p-3"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <div className="mt-2 text-lg font-semibold">
                      {item.value.toLocaleString(i18n.resolvedLanguage)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheckIcon className="size-4" />
              {t("settingsPage.account.upgrade.betaTitle")}
            </div>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              {t("settingsPage.account.upgrade.betaDescription")}
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-md">
          <div className="pointer-events-none grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3 blur-[2px] select-none">
            {planOptions.map(option => {
              const active = currentPlan === option.plan;

              return (
                <div
                  key={option.plan}
                  className={`flex min-h-[210px] flex-col justify-between rounded-md border p-4 ${option.tone}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-semibold">
                          {t(option.labelKey)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {t(option.noteKey)}
                        </div>
                      </div>
                      {active && (
                        <span className="rounded-sm border border-border bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                          {t("settingsPage.account.upgrade.active")}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 min-h-10 text-xs text-muted-foreground">
                      {t(option.bestForKey)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      `${option.limitations.maxRootShelfCount.toLocaleString(i18n.resolvedLanguage)} ${t("settingsPage.account.upgrade.rootShelves")}`,
                      `${option.limitations.maxBlockCount.toLocaleString(i18n.resolvedLanguage)} ${t("settingsPage.account.upgrade.blocks")}`,
                      `${formatBytes(option.limitations.maxMaterialSize)} ${t("settingsPage.account.upgrade.materialSize")}`,
                    ].map(highlight => (
                      <div
                        key={highlight}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <CheckIcon className="size-3.5 text-primary" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/35 p-6 text-center backdrop-blur-[1px]">
            <div className="max-w-sm rounded-md border border-primary/30 bg-background/90 p-5 shadow-lg">
              <div className="text-sm font-semibold">
                {t("settingsPage.account.upgrade.plansPausedTitle")}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("settingsPage.account.upgrade.plansPausedDescription")}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-4 rounded-md border border-border bg-background/45 p-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HeartIcon className="size-4 text-primary" />
              {t("settingsPage.account.upgrade.supportTitle")}
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("settingsPage.account.upgrade.supportDescription")}
            </p>
          </div>
          <Button asChild className="shrink-0">
            <a
              href="https://www.buymeacoffee.com/HiIamJeff67"
              target="_blank"
              rel="noreferrer"
            >
              {t("settingsPage.account.upgrade.supportAction")}
              <ExternalLinkIcon />
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
};

export default UpgradeTab;
