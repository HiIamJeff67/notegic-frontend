import { UserPlan } from "@shared/api/interfaces/enums";
import { type PlanLimitation, PlanLimitations } from "@shared/constants";
import {
  CheckIcon,
  Clock3Icon,
  DatabaseIcon,
  FactoryIcon,
  GaugeIcon,
  LeafIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks";

type BillingCycle = "MONTH" | "YEAR";

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
  monthlyPrice: number;
  yearlyPrice?: number;
  limitations: PlanLimitation;
};

const planOptions: PlanOption[] = [
  {
    plan: UserPlan.Free,
    labelKey: "settingsPage.account.upgrade.free",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.freeNote",
    bestForKey: "settingsPage.account.upgrade.freeBestFor",
    monthlyPrice: 0,
    limitations: PlanLimitations[UserPlan.Free],
  },
  {
    plan: UserPlan.Pro,
    labelKey: "settingsPage.account.upgrade.pro",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.proNote",
    bestForKey: "settingsPage.account.upgrade.proBestFor",
    monthlyPrice: 4.99,
    yearlyPrice: 49.99,
    limitations: PlanLimitations[UserPlan.Pro],
  },
  {
    plan: UserPlan.Premium,
    labelKey: "settingsPage.account.upgrade.premium",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.premiumNote",
    bestForKey: "settingsPage.account.upgrade.premiumBestFor",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    limitations: PlanLimitations[UserPlan.Premium],
  },
  {
    plan: UserPlan.Ultimate,
    labelKey: "settingsPage.account.upgrade.ultimate",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.ultimateNote",
    bestForKey: "settingsPage.account.upgrade.ultimateBestFor",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    limitations: PlanLimitations[UserPlan.Ultimate],
  },
  {
    plan: UserPlan.Enterprise,
    labelKey: "settingsPage.account.upgrade.enterprise",
    tone: "border-border bg-background/35",
    noteKey: "settingsPage.account.upgrade.enterpriseNote",
    bestForKey: "settingsPage.account.upgrade.enterpriseBestFor",
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    limitations: PlanLimitations[UserPlan.Enterprise],
  },
];

const limitRows: {
  labelKey:
    | "settingsPage.account.upgrade.rootShelves"
    | "settingsPage.account.upgrade.blocks"
    | "settingsPage.account.upgrade.materials"
    | "settingsPage.account.upgrade.materialSize"
    | "settingsPage.account.upgrade.workflows"
    | "settingsPage.account.upgrade.stations"
    | "settingsPage.account.upgrade.taskCostUnits";
  key: keyof PlanLimitation;
  unit?: "bytes";
}[] = [
  {
    labelKey: "settingsPage.account.upgrade.rootShelves",
    key: "maxRootShelfCount",
  },
  { labelKey: "settingsPage.account.upgrade.blocks", key: "maxBlockCount" },
  {
    labelKey: "settingsPage.account.upgrade.materials",
    key: "maxMaterialCount",
  },
  {
    labelKey: "settingsPage.account.upgrade.materialSize",
    key: "maxMaterialSize",
    unit: "bytes",
  },
  {
    labelKey: "settingsPage.account.upgrade.workflows",
    key: "maxWorkflowCount",
  },
  { labelKey: "settingsPage.account.upgrade.stations", key: "maxStationCount" },
  {
    labelKey: "settingsPage.account.upgrade.taskCostUnits",
    key: "maxRoutineTaskCostUnitCount",
  },
];

const formatCurrency = (price: number, locale?: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price === 0 ? 0 : 2,
  }).format(price);

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
  }
  return `${Math.round(bytes / 1024 / 1024)} MB`;
};

const formatLimit = (value: number, unit?: "bytes", locale?: string) =>
  unit === "bytes" ? formatBytes(value) : value.toLocaleString(locale);

const getPlanRank = (plan: UserPlan) =>
  planOptions.findIndex(option => option.plan === plan);

interface UpgradeTabProps {
  layout?: "panel" | "page";
}

const UpgradeTab = ({ layout = "panel" }: UpgradeTabProps) => {
  const { i18n, t } = useTranslation();
  const userManager = useUser();
  const currentPlan = userManager.userData?.plan ?? UserPlan.Free;
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>(currentPlan);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTH");

  useEffect(() => {
    setSelectedPlan(currentPlan);
  }, [currentPlan]);

  const selectedOption = useMemo(
    () =>
      planOptions.find(option => option.plan === selectedPlan) ??
      planOptions[0],
    [selectedPlan]
  );

  const price = useMemo(() => {
    if (billingCycle === "YEAR" && selectedOption.yearlyPrice !== undefined) {
      return selectedOption.yearlyPrice;
    }
    return selectedOption.monthlyPrice;
  }, [billingCycle, selectedOption]);

  const currentOption = useMemo(
    () =>
      planOptions.find(option => option.plan === currentPlan) ?? planOptions[0],
    [currentPlan]
  );

  const isCurrentPlan = selectedPlan === currentPlan;
  const isDowngrade = getPlanRank(selectedPlan) < getPlanRank(currentPlan);
  const selectedPlanLabel = t(selectedOption.labelKey);
  const selectedBillingName = t(
    billingCycle === "YEAR"
      ? "settingsPage.account.upgrade.yearlyPlan"
      : "settingsPage.account.upgrade.monthlyPlan",
    { plan: selectedPlanLabel }
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <FactoryIcon className="size-4 text-primary" />
                  {t("settingsPage.account.upgrade.accountPlan")}
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">
                  {t(currentOption.labelKey)}
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {t(currentOption.bestForKey)}
                </p>
              </div>
              <div className="rounded-sm border border-border bg-primary/10 px-3 py-2 text-right">
                <div className="text-[11px] text-muted-foreground">
                  {t("settingsPage.account.upgrade.status")}
                </div>
                <div className="mt-1 text-sm font-semibold text-primary">
                  {t("settingsPage.account.upgrade.active")}
                </div>
              </div>
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

          <div className="rounded-md border border-border bg-background/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  {t("settingsPage.account.upgrade.billingCycle")}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("settingsPage.account.upgrade.annualPricing")}
                </div>
              </div>
              <div className="flex rounded-md border border-border bg-muted p-1">
                {[
                  {
                    value: "MONTH" as const,
                    label: t("settingsPage.account.upgrade.monthly"),
                  },
                  {
                    value: "YEAR" as const,
                    label: t("settingsPage.account.upgrade.yearly"),
                  },
                ].map(cycle => (
                  <button
                    key={cycle.value}
                    type="button"
                    onClick={() => setBillingCycle(cycle.value)}
                    className={`h-8 rounded-sm px-3 text-sm transition ${
                      billingCycle === cycle.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {cycle.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-sm border border-border bg-muted/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {t("settingsPage.account.upgrade.selectedBillingPlan")}
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {selectedBillingName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">
                    {formatCurrency(price, i18n.resolvedLanguage)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    /{" "}
                    {billingCycle === "YEAR"
                      ? t("settingsPage.account.upgrade.perYear")
                      : t("settingsPage.account.upgrade.perMonth")}
                  </div>
                </div>
              </div>
              <Button className="mt-4 w-full" disabled>
                {isCurrentPlan
                  ? t("settingsPage.account.upgrade.currentPlan")
                  : isDowngrade
                    ? t("settingsPage.account.upgrade.downgradeUnavailable")
                    : t("settingsPage.account.upgrade.paymentUnavailable")}
              </Button>
            </div>
          </div>
        </section>

        <section className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
          {planOptions.map(option => {
            const selected = selectedPlan === option.plan;
            const active = currentPlan === option.plan;
            const optionPrice =
              billingCycle === "YEAR" && option.yearlyPrice !== undefined
                ? option.yearlyPrice
                : option.monthlyPrice;

            return (
              <button
                key={option.plan}
                type="button"
                onClick={() => setSelectedPlan(option.plan)}
                className={`flex min-h-[210px] flex-col justify-between rounded-md border p-4 text-left transition hover:border-primary/70 hover:bg-background/70 ${
                  option.tone
                } ${
                  selected
                    ? "ring-2 ring-primary/70"
                    : "ring-1 ring-transparent"
                }`}
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
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-2xl font-semibold">
                      {formatCurrency(optionPrice, i18n.resolvedLanguage)}
                    </span>
                    <span className="pb-1 text-xs text-muted-foreground">
                      /{" "}
                      {billingCycle === "YEAR"
                        ? t("settingsPage.account.upgrade.perYear")
                        : t("settingsPage.account.upgrade.perMonth")}
                    </span>
                  </div>
                  <p className="mt-2 min-h-10 text-xs text-muted-foreground">
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
              </button>
            );
          })}
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.75rem),1fr))] gap-4">
          <div className="rounded-md border border-border bg-background/45">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-sm font-semibold">
                  {t("settingsPage.account.upgrade.limitComparison")}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("settingsPage.account.upgrade.currentSelected")}
                </div>
              </div>
              <LeafIcon className="size-4 text-primary" />
            </div>
            <div className="divide-y divide-border">
              {limitRows.map(row => (
                <div
                  key={row.key}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground">
                    {t(row.labelKey)}
                  </span>
                  <span className="font-medium">
                    {formatLimit(
                      currentOption.limitations[row.key],
                      row.unit,
                      i18n.resolvedLanguage
                    )}
                  </span>
                  <span className="min-w-20 rounded-sm border border-border bg-muted/40 px-2 py-1 text-right font-semibold">
                    {formatLimit(
                      selectedOption.limitations[row.key],
                      row.unit,
                      i18n.resolvedLanguage
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border bg-background/45 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock3Icon className="size-4 text-muted-foreground" />
              {t("settingsPage.account.upgrade.paymentStatus")}
            </div>
            <div className="mt-4 space-y-3">
              {[
                [
                  t("settingsPage.account.upgrade.status"),
                  t("settingsPage.account.upgrade.active"),
                ],
                [
                  t("settingsPage.account.upgrade.subscriptionStatus"),
                  t("settingsPage.account.upgrade.approvalPending"),
                ],
                [t("settingsPage.account.upgrade.currency"), "USD"],
                [
                  t("settingsPage.account.upgrade.paymentChannel"),
                  t("settingsPage.account.upgrade.pending"),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-right text-xs font-semibold">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-sm border border-border bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
              {t("settingsPage.account.upgrade.paymentNotice")}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UpgradeTab;
