import { ItemType as GraphQLItemType } from "@shared/api/graphql/generated/graphql";
import { AllUserStatus, UserStatus } from "@shared/api/interfaces/enums";
import { AllLanguageData } from "@shared/i18n/availableLanguages";
import { tError } from "@shared/i18n/error";
import { matchesSearch } from "@shared/lib/search/searchPage";
import type {
  BlockPackNode,
  MaterialNode,
} from "@shared/lib/shelf/itemNodes.type";
import type { SubShelfNode } from "@shared/lib/shelf/shelfNodes.type";
import type { ShelfTreeSummary } from "@shared/lib/shelf/summary.type";
import {
  LocalStorage,
  LocalStorageKey,
} from "@shared/lib/storage/localStorage";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import type { UUID } from "crypto";
import { eq } from "drizzle-orm";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSearchBlockPacksLazyQuery } from "@/api/graphql/hooks/useSearchBlockPacks";
import { useSearchItemsLazyQuery } from "@/api/graphql/hooks/useSearchItems";
import { useSearchMaterialsLazyQuery } from "@/api/graphql/hooks/useSearchMaterials";
import { useSearchRoutinesLazyQuery } from "@/api/graphql/hooks/useSearchRoutines";
import { useSearchRoutineTagsLazyQuery } from "@/api/graphql/hooks/useSearchRoutineTags";
import { useSearchRoutineTasksLazyQuery } from "@/api/graphql/hooks/useSearchRoutineTasks";
import { useSearchRootShelvesLazyQuery } from "@/api/graphql/hooks/useSearchShelves";
import { useSearchStationsLazyQuery } from "@/api/graphql/hooks/useSearchStations";
import { useSearchSubShelvesLazyQuery } from "@/api/graphql/hooks/useSearchSubShelves";
import { useUpdateMe } from "@/api/hooks/user.hook";
import { localDB } from "@/api/local/db";
import { SubShelf } from "@/api/local/schemas";
import { ItemLocalSimulator } from "@/api/local/simulators/item.simulator";
import { useDebounceValue } from "@/hooks/useDebounce";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useNetwork } from "@/hooks/useNetwork";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/hooks/useUser";
import { LoadingContext } from "@/providers/LoadingProvider";
import {
  type Density,
  LocalPreferencesContext,
} from "@/providers/LocalPreferencesProvider";
import { ModalContext } from "@/providers/ModalProvider";
import { SettingsDisplayContext } from "@/providers/SettingsDisplayProvider";
import { ShelfItemContext } from "@/providers/ShelfItemProvider/ShelfItemProvider";
import { StationRoutineContext } from "@/providers/StationRoutineProvider/StationRoutineProvider";

type ObjectDomain =
  | "rootShelf"
  | "subShelf"
  | "material"
  | "blockPack"
  | "station"
  | "routineTag"
  | "routine"
  | "routineTask";

type RootDomain =
  | "rootShelf"
  | "subShelf"
  | "material"
  | "blockPack"
  | "routine"
  | "routineTask"
  | "station"
  | "routineTag"
  | "preferences"
  | "account";

type BooleanPreference =
  | "reduceMotion"
  | "tactileFeedback"
  | "manualDashboardWidth"
  | "lineWrap"
  | "spellcheck"
  | "quickInsert"
  | "blockDragHandle"
  | "localVault"
  | "offlineQueue"
  | "cacheAttachments"
  | "privatePreviews"
  | "clipboardGuard"
  | "desktopNotifications"
  | "routineNudges"
  | "syncNotifications"
  | "quietMode";

type ChoicePreference =
  | "density"
  | "startSurface"
  | "editorWidth"
  | "cleanupAfterDays"
  | "theme"
  | "language"
  | "status";

const booleanPreferences = new Set<BooleanPreference>([
  "reduceMotion",
  "tactileFeedback",
  "manualDashboardWidth",
  "lineWrap",
  "spellcheck",
  "quickInsert",
  "blockDragHandle",
  "localVault",
  "offlineQueue",
  "cacheAttachments",
  "privatePreviews",
  "clipboardGuard",
  "desktopNotifications",
  "routineNudges",
  "syncNotifications",
  "quietMode",
]);

type Placement = "blockPack" | "material" | "subShelf" | "routine";

type CommandStep =
  | { kind: "domain"; domain: RootDomain }
  | { kind: "place"; create: Placement }
  | {
      kind: "instance";
      domain: ObjectDomain;
      id: UUID;
      name: string;
      parentSubShelfId?: UUID;
      rootShelfId?: UUID;
      stationId?: UUID;
      taskIds?: UUID[];
    }
  | { kind: "preference"; key: BooleanPreference | ChoicePreference };

type SearchHit = {
  id: UUID;
  name: string;
  domain?: "material" | "blockPack";
  parentSubShelfId?: UUID;
  rootShelfId?: UUID;
  stationId?: UUID;
  taskIds?: UUID[];
};

export type AppCommandIcon =
  | "dashboard"
  | "routines"
  | "trash"
  | "document"
  | "preferences"
  | "shelves"
  | "station"
  | "routineTag"
  | "rootShelf"
  | "subShelf"
  | "material"
  | "blockPack"
  | "routine"
  | "routineTask"
  | "orchestrate"
  | "records"
  | "create"
  | "more"
  | "report"
  | "rename"
  | "inspector"
  | "account";

export type AppCommandHint =
  | "command"
  | "domain"
  | "operation"
  | "setting"
  | "rootShelf"
  | "subShelf"
  | "material"
  | "blockPack"
  | "station"
  | "routine"
  | "routineTag"
  | "routineTask";

export type AppCommandCandidate = {
  id: string;
  label: string;
  hint: AppCommandHint;
  icon: AppCommandIcon;
  group: "navigation" | "domain" | "settings" | "operation" | "instance";
};

type AppCommandContextValue = {
  query: string;
  setQuery: (query: string) => void;
  steps: CommandStep[];
  path: string[];
  prompt: string | null;
  candidates: AppCommandCandidate[];
  choose: (id: string) => boolean | Promise<boolean>;
  visit: (index: number) => void;
  back: () => void;
  reset: () => void;
};

export const AppCommandContext = createContext<AppCommandContextValue | null>(
  null
);

const searchHit = (node: {
  id?: string;
  name?: string;
  title?: string;
  parentSubShelfId?: string | null;
  rootShelfId?: string | null;
  stationId?: string | null;
  routineId?: string | null;
  taskIds?: string[] | null;
}): SearchHit | null => {
  const name = node.name || node.title;
  if (!node.id || !name) return null;
  return {
    id: node.id as UUID,
    name,
    parentSubShelfId: node.parentSubShelfId
      ? (node.parentSubShelfId as UUID)
      : undefined,
    rootShelfId: node.rootShelfId ? (node.rootShelfId as UUID) : undefined,
    stationId: node.stationId ? (node.stationId as UUID) : undefined,
    taskIds: node.taskIds?.map(id => id as UUID),
  };
};

const walkSubShelves = (
  nodes: Record<string, SubShelfNode>,
  id: UUID
): SubShelfNode | undefined => {
  for (const node of Object.values(nodes)) {
    if (node.id === id) return node;
    const child = walkSubShelves(node.children, id);
    if (child) return child;
  }
  return undefined;
};

const loadedSubShelf = (
  shelves: {
    keys: () => string[];
    get: (key: string) => ShelfTreeSummary | undefined;
  },
  id: UUID,
  rootShelfId?: UUID
) => {
  const keys = rootShelfId ? [rootShelfId] : shelves.keys();
  for (const key of keys) {
    const summary = shelves.get(key);
    if (!summary) continue;
    const found = walkSubShelves(summary.root.children, id);
    if (found) return found;
  }
  return undefined;
};

const ensureSubShelf = async <Root,>(
  shelf: {
    expandedShelves: Parameters<typeof loadedSubShelf>[0];
    expandRootShelf: (root: Root) => Promise<unknown>;
  },
  id: UUID,
  rootShelfId?: UUID
) => {
  const existing = loadedSubShelf(shelf.expandedShelves, id, rootShelfId);
  if (existing || !rootShelfId) return existing;
  const summary = shelf.expandedShelves.get(rootShelfId);
  if (!summary) return undefined;
  await shelf.expandRootShelf(summary.root as unknown as Root);
  return loadedSubShelf(shelf.expandedShelves, id, rootShelfId);
};

const rootShelfIdForSubShelf = async (subShelfId: UUID) => {
  if (!localDB.isReady) await localDB.ensureReady();
  const rows = await localDB
    .select({ rootShelfId: SubShelf.rootShelfId })
    .from(SubShelf)
    .where(eq(SubShelf.id, subShelfId))
    .limit(1);
  return rows[0]?.rootShelfId as UUID | undefined;
};

const resultHint = (target: ObjectDomain): AppCommandHint => {
  if (target === "rootShelf") return "rootShelf";
  if (target === "subShelf") return "subShelf";
  if (target === "material") return "material";
  if (target === "blockPack") return "blockPack";
  if (target === "station") return "station";
  if (target === "routine") return "routine";
  if (target === "routineTask") return "routineTask";
  return "routineTag";
};

const childPageSize = 8;

const childCandidates = (
  hits: SearchHit[],
  hint: AppCommandHint,
  icon: AppCommandIcon
): AppCommandCandidate[] =>
  hits.slice(0, childPageSize).map(hit => ({
    id: `instance:${hit.id}`,
    label: hit.name,
    hint: hit.domain ?? hint,
    icon: hit.domain ?? icon,
    group: "instance",
  }));

const childDomains = new Set<RootDomain>([
  "subShelf",
  "material",
  "blockPack",
  "routine",
  "routineTask",
]);

export const AppCommandProvider = ({ children }: { children: ReactNode }) => {
  const { t, i18n } = useTranslation();
  const router = useAppRouter();
  const user = useUser();
  const updateMe = useUpdateMe();
  const { isOnline } = useNetwork();
  const theme = useTheme();
  const modal = useContext(ModalContext);
  const loading = useContext(LoadingContext);
  const shelf = useContext(ShelfItemContext);
  const stationRoutine = useContext(StationRoutineContext);
  const preferences = useContext(LocalPreferencesContext);
  const settingsDisplay = useContext(SettingsDisplayContext);
  const [query, setQuery] = useState("");
  const [steps, setSteps] = useState<CommandStep[]>([]);
  const [instances, setInstances] = useState<SearchHit[]>([]);
  const [listedKey, setListedKey] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const deferredQuery = useDebounceValue(query, 200);
  const endCursor = useRef<string | null>(null);
  const [searchRootShelves] = useSearchRootShelvesLazyQuery();
  const [searchSubShelves] = useSearchSubShelvesLazyQuery();
  const [searchMaterials] = useSearchMaterialsLazyQuery();
  const [searchItems] = useSearchItemsLazyQuery();
  const [searchBlockPacks] = useSearchBlockPacksLazyQuery();
  const [searchStations] = useSearchStationsLazyQuery();
  const [searchRoutines] = useSearchRoutinesLazyQuery();
  const [searchRoutineTasks] = useSearchRoutineTasksLazyQuery();
  const [searchRoutineTags] = useSearchRoutineTagsLazyQuery();

  const lockedInstance = (domain: ObjectDomain) =>
    [...steps]
      .reverse()
      .find(
        (step): step is Extract<CommandStep, { kind: "instance" }> =>
          step.kind === "instance" && step.domain === domain
      );
  const lockedRootShelf = lockedInstance("rootShelf");
  const lockedSubShelf = lockedInstance("subShelf");
  const lockedStation = lockedInstance("station");
  const lockedRoutine = lockedInstance("routine");
  const lockedRoutineTag = lockedInstance("routineTag");
  const last = steps[steps.length - 1];
  const placement = [...steps]
    .reverse()
    .find(
      (step): step is Extract<CommandStep, { kind: "place" }> =>
        step.kind === "place"
    );
  const placingSubShelf =
    placement?.create === "subShelf" &&
    last?.kind === "instance" &&
    last.domain === "rootShelf";
  const searchTarget =
    last?.kind === "place"
      ? last.create === "routine"
        ? "station"
        : last.create === "subShelf"
          ? "rootShelf"
          : "subShelf"
      : placingSubShelf ||
          (last?.kind === "instance" && last.domain === "rootShelf")
        ? "subShelf"
        : last?.kind === "instance" && last.domain === "subShelf"
          ? "item"
          : last?.kind === "instance" && last.domain === "station"
            ? "routine"
            : last?.kind === "instance" && last.domain === "routine"
              ? "routineTask"
              : last?.kind === "domain" &&
                  (last.domain === "rootShelf" ||
                    last.domain === "subShelf" ||
                    last.domain === "material" ||
                    last.domain === "blockPack" ||
                    last.domain === "station" ||
                    last.domain === "routineTag" ||
                    last.domain === "routine" ||
                    last.domain === "routineTask")
                ? last.domain
                : null;
  const scopeKey = [
    lockedRootShelf?.id ?? "",
    lockedSubShelf?.id ?? "",
    lockedStation?.id ?? "",
    lockedRoutine?.id ?? "",
    lockedRoutineTag?.id ?? "",
  ].join(":");

  const readPage = (
    data: object,
    scope?: { rootShelfId?: UUID; parentSubShelfId?: UUID }
  ) => {
    const page = data as {
      searchEdges?: { node?: Parameters<typeof searchHit>[0] }[];
      searchPageInfo?: {
        hasNextPage: boolean;
        endEncodedSearchCursor?: string | null;
      };
    };
    const hits = (page.searchEdges ?? []).flatMap(edge => {
      const hit = edge.node ? searchHit(edge.node) : null;
      if (!hit) return [];
      return [
        {
          ...hit,
          rootShelfId: hit.rootShelfId ?? scope?.rootShelfId,
          parentSubShelfId: hit.parentSubShelfId ?? scope?.parentSubShelfId,
        },
      ];
    });
    return {
      hits,
      hasNextPage: page.searchPageInfo?.hasNextPage ?? false,
      endCursor: page.searchPageInfo?.endEncodedSearchCursor ?? null,
    };
  };

  const listingChildren =
    !placement &&
    last?.kind === "instance" &&
    (last.domain === "rootShelf" ||
      last.domain === "subShelf" ||
      last.domain === "station" ||
      last.domain === "routine");

  const runSearch = (after?: string) => {
    const queryInput = {
      query: deferredQuery,
      first: listingChildren ? childPageSize : 10,
      after,
    };
    if (searchTarget === "rootShelf") {
      return searchRootShelves({ variables: { input: queryInput } }).then(
        result => readPage(result.data?.searchRootShelves ?? {})
      );
    }
    if (searchTarget === "subShelf") {
      return searchSubShelves({
        variables: {
          input: {
            ...queryInput,
            rootShelfId: lockedRootShelf?.id,
          },
        },
      }).then(result =>
        readPage(result.data?.searchSubShelves ?? {}, {
          rootShelfId: lockedRootShelf?.id,
        })
      );
    }
    if (searchTarget === "material") {
      return searchMaterials({
        variables: {
          input: {
            ...queryInput,
            rootShelfId: lockedRootShelf?.id,
            parentSubShelfId: lockedSubShelf?.id,
          },
        },
      }).then(async result => {
        const page = readPage(result.data?.searchMaterials ?? {}, {
          rootShelfId: lockedRootShelf?.id,
          parentSubShelfId: lockedSubShelf?.id,
        });
        const hits = await Promise.all(
          page.hits.map(async hit => {
            if (hit.rootShelfId || !hit.parentSubShelfId) return hit;
            const rootShelfId = await rootShelfIdForSubShelf(
              hit.parentSubShelfId
            );
            return rootShelfId ? { ...hit, rootShelfId } : hit;
          })
        );
        return { ...page, hits };
      });
    }
    if (searchTarget === "blockPack") {
      return searchBlockPacks({
        variables: {
          input: {
            ...queryInput,
            rootShelfId: lockedRootShelf?.id,
            parentSubShelfId: lockedSubShelf?.id,
          },
        },
      }).then(async result => {
        const page = readPage(result.data?.searchBlockPacks ?? {}, {
          rootShelfId: lockedRootShelf?.id,
          parentSubShelfId: lockedSubShelf?.id,
        });
        const hits = await Promise.all(
          page.hits.map(async hit => {
            if (hit.rootShelfId || !hit.parentSubShelfId) return hit;
            const rootShelfId = await rootShelfIdForSubShelf(
              hit.parentSubShelfId
            );
            return rootShelfId ? { ...hit, rootShelfId } : hit;
          })
        );
        return { ...page, hits };
      });
    }
    if (searchTarget === "station") {
      return searchStations({ variables: { input: queryInput } }).then(result =>
        readPage(result.data?.searchStations ?? {})
      );
    }
    if (searchTarget === "routineTag") {
      return searchRoutineTags({ variables: { input: queryInput } }).then(
        result => readPage(result.data?.searchRoutineTags ?? {})
      );
    }
    if (searchTarget === "routine") {
      return searchRoutines({
        variables: {
          input: {
            ...queryInput,
            stationIds: lockedStation ? [lockedStation.id] : [],
            tagIds: lockedRoutineTag ? [lockedRoutineTag.id] : [],
          },
        },
      }).then(result => readPage(result.data?.searchRoutines ?? {}));
    }
    if (searchTarget === "routineTask") {
      return searchRoutineTasks({
        variables: {
          input: {
            ...queryInput,
            routineIds: lockedRoutine ? [lockedRoutine.id] : [],
          },
        },
      }).then(result => readPage(result.data?.searchRoutineTasks ?? {}));
    }
    if (searchTarget === "item" && lockedSubShelf) {
      return searchItems({
        variables: {
          input: {
            ...queryInput,
            parentSubShelfId: lockedSubShelf.id,
            rootShelfId: lockedSubShelf.rootShelfId,
          },
        },
      }).then(async result => {
        const parent = shelf
          ? await ensureSubShelf(
              shelf,
              lockedSubShelf.id,
              lockedSubShelf.rootShelfId
            ).catch(() => undefined)
          : undefined;
        const input = {
          ...queryInput,
          parentSubShelfId: lockedSubShelf.id,
          rootShelfId: lockedSubShelf.rootShelfId,
        };
        const simulated = await ItemLocalSimulator.simulateSearchItems(
          input
        ).catch(() => undefined);
        const hits = new Map<string, SearchHit>();
        const add = (hit: SearchHit | null) => {
          if (!hit || hits.has(hit.id)) return;
          hits.set(hit.id, hit);
        };
        for (const edge of simulated?.searchEdges ?? []) {
          const node = edge.node as unknown as {
            id?: string;
            name?: string;
            parentSubShelfId?: UUID;
            rootShelfId?: UUID;
          };
          if (!node.id || !node.name) continue;
          add({
            id: node.id as UUID,
            name: node.name,
            domain: "blockPack",
            parentSubShelfId: node.parentSubShelfId,
            rootShelfId: node.rootShelfId,
          });
        }
        for (const edge of result.data?.searchItems?.searchEdges ?? []) {
          const node = edge.node as unknown as {
            id?: string;
            name?: string;
            type?: string;
            parentSubShelfId?: string;
            rootShelfId?: string;
          };
          if (!node.id) continue;
          const domain =
            node.type === GraphQLItemType.ItemTypeBlockPack
              ? "blockPack"
              : "material";
          const named =
            node.name ??
            (domain === "material"
              ? parent?.materialNodes[node.id as UUID]?.name
              : parent?.blockPackNodes[node.id as UUID]?.name);
          if (!named) continue;
          add({
            id: node.id as UUID,
            name: named,
            domain,
            parentSubShelfId: (node.parentSubShelfId ??
              lockedSubShelf.id) as UUID,
            rootShelfId: (node.rootShelfId ??
              lockedSubShelf.rootShelfId) as UUID,
          });
        }
        const visible = (name: string, deletedAt?: Date | null) =>
          deletedAt == null && matchesSearch(name, deferredQuery);
        for (const node of Object.values(parent?.blockPackNodes ?? {})) {
          if (!visible(node.name)) continue;
          add({
            id: node.id,
            name: node.name,
            domain: "blockPack",
            parentSubShelfId: node.parentSubShelfId,
            rootShelfId: parent?.rootShelfId,
          });
        }
        for (const node of Object.values(parent?.materialNodes ?? {})) {
          if (!visible(node.name, node.deletedAt)) continue;
          add({
            id: node.id,
            name: node.name,
            domain: "material",
            parentSubShelfId: node.parentSubShelfId,
            rootShelfId: parent?.rootShelfId,
          });
        }
        return {
          hits: [...hits.values()].slice(0, childPageSize),
          hasNextPage: false,
          endCursor: null,
        };
      });
    }
    return undefined;
  };

  const listKey = `${searchTarget ?? ""}:${scopeKey}:${deferredQuery}`;

  useEffect(() => {
    if (!searchTarget) {
      setInstances([]);
      setListedKey("");
      setHasNextPage(false);
      return;
    }
    let cancelled = false;
    void runSearch()
      ?.then(page => {
        if (cancelled || !page) return;
        endCursor.current = page.endCursor;
        setHasNextPage(page.hasNextPage);
        setListedKey(listKey);
        setInstances(page.hits);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    deferredQuery,
    listKey,
    listingChildren,
    scopeKey,
    searchBlockPacks,
    searchItems,
    searchMaterials,
    searchRootShelves,
    searchRoutineTags,
    searchRoutines,
    searchRoutineTasks,
    searchStations,
    searchSubShelves,
    searchTarget,
  ]);

  const askMore = useCallback(() => {
    if (!hasNextPage || !endCursor.current) return;
    void runSearch(endCursor.current)
      ?.then(page => {
        if (!page) return;
        endCursor.current = page.endCursor;
        setHasNextPage(page.hasNextPage);
        setInstances(current => {
          const seen = new Set(current.map(item => item.id));
          return [...current, ...page.hits.filter(item => !seen.has(item.id))];
        });
      })
      .catch(() => undefined);
  }, [hasNextPage, searchTarget, deferredQuery, scopeKey]);

  const shownInstances = listedKey === listKey ? instances : [];
  const shownHasNextPage = listedKey === listKey && hasNextPage;

  const candidates = useMemo<AppCommandCandidate[]>(() => {
    if (!last) {
      return [
        {
          id: "navigate:dashboard",
          label: t("workspace.navigation.dashboard"),
          hint: "operation",
          icon: "dashboard",
          group: "navigation",
        },
        {
          id: "navigate:routines",
          label: t("workspace.navigation.routines"),
          hint: "operation",
          icon: "routines",
          group: "navigation",
        },
        {
          id: "navigate:trash",
          label: t("workspace.navigation.trash"),
          hint: "operation",
          icon: "trash",
          group: "navigation",
        },
        {
          id: "navigate:document",
          label: t("workspace.navigation.document"),
          hint: "operation",
          icon: "document",
          group: "navigation",
        },
        {
          id: "domain:rootShelf",
          label: t("workspace.trash.rootShelves"),
          hint: "domain",
          icon: "shelves",
          group: "domain",
        },
        {
          id: "domain:subShelf",
          label: t("workspace.menu.subShelves"),
          hint: "domain",
          icon: "subShelf",
          group: "domain",
        },
        {
          id: "domain:material",
          label: t("workspace.menu.materials"),
          hint: "domain",
          icon: "material",
          group: "domain",
        },
        {
          id: "domain:blockPack",
          label: t("workspace.menu.blockPacks"),
          hint: "domain",
          icon: "blockPack",
          group: "domain",
        },
        {
          id: "domain:routine",
          label: t("workspace.navigation.routines"),
          hint: "domain",
          icon: "routines",
          group: "domain",
        },
        {
          id: "domain:station",
          label: t("workspace.navigation.stations"),
          hint: "domain",
          icon: "station",
          group: "domain",
        },
        {
          id: "domain:routineTag",
          label: t("workspace.navigation.routineTags"),
          hint: "domain",
          icon: "routineTag",
          group: "domain",
        },
        {
          id: "domain:preferences",
          label: t("workspace.navigation.preferenceSettings"),
          hint: "domain",
          icon: "preferences",
          group: "settings",
        },
        {
          id: "domain:account",
          label: t("workspace.navigation.accountSettings"),
          hint: "domain",
          icon: "account",
          group: "settings",
        },
      ];
    }
    if (last.kind === "domain" && last.domain === "preferences") {
      const sections = [
        ["appearance", t("settingsPage.preferences.appearance.title")],
        ["dashboard", t("settingsPage.preferences.dashboard.title")],
        ["editor", t("settingsPage.preferences.editor.title")],
        ["offline", t("settingsPage.preferences.offline.title")],
        ["privacy", t("settingsPage.preferences.privacy.title")],
        [
          "browser-permissions",
          t("settingsPage.preferences.browserPermissions.title"),
        ],
        ["feedback", t("settingsPage.preferences.feedback.title")],
        ["notifications", t("settingsPage.preferences.notifications.title")],
        ["about", t("settingsPage.preferences.about.title")],
      ] as const;
      return [
        {
          id: "operation:openPreferences",
          label: t("common.commandNavigatePreferenceSettings"),
          hint: "operation" as const,
          icon: "preferences" as const,
          group: "navigation" as const,
        },
        ...sections.map(([section, label]) => ({
          id: `section:preferences:${section}`,
          label,
          hint: "operation" as const,
          icon: "preferences" as const,
          group: "navigation" as const,
        })),
        {
          id: "operation:report",
          label: t("workspace.navigation.report"),
          hint: "operation" as const,
          icon: "report" as const,
          group: "navigation" as const,
        },
        {
          id: "preference:density",
          label: t("settingsPage.preferences.appearance.density"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:theme",
          label: t("settingsPage.preferences.appearance.theme"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:language",
          label: t("settingsPage.preferences.appearance.language"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:reduceMotion",
          label: t("settingsPage.preferences.appearance.reduceMotion"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:startSurface",
          label: t("settingsPage.preferences.privacy.startSurface"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:editorWidth",
          label: t("settingsPage.preferences.editor.pageWidth"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:lineWrap",
          label: t("settingsPage.preferences.editor.lineWrap"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:spellcheck",
          label: t("settingsPage.preferences.editor.spellcheck"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:quickInsert",
          label: t("settingsPage.preferences.editor.quickInsert"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:blockDragHandle",
          label: t("settingsPage.preferences.editor.dragHandle"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:tactileFeedback",
          label: t("settingsPage.preferences.appearance.tactileFeedback"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:manualDashboardWidth",
          label: t("settingsPage.preferences.dashboard.manualWidth"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:localVault",
          label: t("settingsPage.preferences.offline.localDatabase"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:offlineQueue",
          label: t("settingsPage.preferences.offline.offlineQueue"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:cacheAttachments",
          label: t("settingsPage.preferences.offline.attachmentCache"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:cleanupAfterDays",
          label: t("settingsPage.preferences.offline.cleanupPeriod"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:privatePreviews",
          label: t("settingsPage.preferences.privacy.privatePreviews"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:clipboardGuard",
          label: t("settingsPage.preferences.privacy.clipboardGuard"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:desktopNotifications",
          label: t("settingsPage.preferences.notifications.desktop"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:routineNudges",
          label: t("settingsPage.preferences.notifications.routine"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:syncNotifications",
          label: t("settingsPage.preferences.notifications.sync"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
        {
          id: "preference:quietMode",
          label: t("settingsPage.preferences.notifications.quietMode"),
          hint: "setting" as const,
          icon: "preferences" as const,
          group: "settings" as const,
        },
      ];
    }
    if (last.kind === "domain" && last.domain === "account") {
      const sections = [
        ["personal", t("settingsPage.account.personal.title")],
        ["account", t("settingsPage.account.account.title")],
        ["api-keys", t("settingsPage.account.apiKeys.title")],
        ["upgrade", t("settingsPage.account.upgrade.title")],
        ["security", t("settingsPage.account.security.title")],
        ["binding", t("settingsPage.account.binding.title")],
        ["account-modification", t("settingsPage.account.modification.title")],
      ] as const;
      return [
        {
          id: "operation:openAccount",
          label: t("common.commandNavigateAccountSettings"),
          hint: "operation" as const,
          icon: "account" as const,
          group: "navigation" as const,
        },
        ...sections.map(([section, label]) => ({
          id: `section:account:${section}`,
          label,
          hint: "operation" as const,
          icon: "account" as const,
          group: "navigation" as const,
        })),
        {
          id: "preference:status",
          label: t("settingsPage.account.fields.status"),
          hint: "setting" as const,
          icon: "account" as const,
          group: "settings" as const,
        },
      ];
    }
    if (last.kind === "preference") {
      if (last.key === "status") {
        return AllUserStatus.map(status => ({
          id: `operation:status:${status}`,
          label: t(`settingsPage.account.statuses.${status}`),
          hint: "operation" as const,
          icon: "account" as const,
          group: "operation" as const,
        }));
      }
      if (!preferences) return [];
      if (last.key === "density") {
        return [
          {
            id: "operation:density:comfortable",
            label: t("settingsPage.preferences.appearance.comfortable"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
          {
            id: "operation:density:balanced",
            label: t("settingsPage.preferences.appearance.balanced"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
          {
            id: "operation:density:compact",
            label: t("settingsPage.preferences.appearance.compact"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
        ];
      }
      if (last.key === "startSurface") {
        return [
          {
            id: "operation:startSurface:dashboard",
            label: t("settingsPage.preferences.privacy.dashboard"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
          {
            id: "operation:startSurface:routines",
            label: t("settingsPage.preferences.privacy.routines"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
        ];
      }
      if (last.key === "editorWidth") {
        return [
          {
            id: "operation:editorWidth:narrow",
            label: t("settingsPage.preferences.editor.narrow"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
          {
            id: "operation:editorWidth:standard",
            label: t("settingsPage.preferences.editor.standard"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
          {
            id: "operation:editorWidth:wide",
            label: t("settingsPage.preferences.editor.wide"),
            hint: "operation" as const,
            icon: "preferences" as const,
            group: "operation" as const,
          },
        ];
      }
      if (last.key === "cleanupAfterDays") {
        return [7, 30, 90, 180, 365].map(days => ({
          id: `operation:cleanupAfterDays:${days}`,
          label: t("settingsPage.preferences.offline.cleanupDays", {
            count: days,
          }),
          hint: "operation" as const,
          icon: "preferences" as const,
          group: "operation" as const,
        }));
      }
      if (last.key === "theme") {
        return theme.availableThemes.map(item => ({
          id: `operation:theme:${item.id}`,
          label: t(item.translationKey),
          hint: "operation" as const,
          icon: "preferences" as const,
          group: "operation" as const,
        }));
      }
      if (last.key === "language") {
        return AllLanguageData.map(language => ({
          id: `operation:language:${language.code}`,
          label: language.nativeName,
          hint: "operation" as const,
          icon: "preferences" as const,
          group: "operation" as const,
        }));
      }
      if (!booleanPreferences.has(last.key)) return [];
      const enabled = preferences.preferences[last.key];
      return [
        {
          id: "operation:toggle",
          label: enabled
            ? t("common.commandTurnOff")
            : t("common.commandTurnOn"),
          hint: "operation" as const,
          icon: "preferences" as const,
          group: "operation" as const,
        },
      ];
    }
    if ((last?.kind === "place" || placingSubShelf) && searchTarget) {
      const rows: AppCommandCandidate[] = shownInstances.map(instance => ({
        id: `instance:${instance.id}`,
        label: instance.name,
        hint: resultHint(searchTarget === "item" ? "material" : searchTarget),
        icon:
          searchTarget === "rootShelf"
            ? "rootShelf"
            : searchTarget === "station"
              ? "station"
              : "subShelf",
        group: "instance",
      }));
      if (shownHasNextPage) {
        rows.push({
          id: "operation:more",
          label: t("common.more"),
          hint: "operation",
          icon: "more",
          group: "instance",
        });
      }
      if (placingSubShelf && shelf?.expandedShelves.get(last.id)) {
        rows.push({
          id: "operation:createUnderRoot",
          label: t("workspace.menu.subShelf"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      return rows;
    }
    if (last.kind === "domain" && searchTarget) {
      const rows: AppCommandCandidate[] = shownInstances.map(instance => ({
        id: `instance:${instance.id}`,
        label: instance.name,
        hint: resultHint(searchTarget === "item" ? "material" : searchTarget),
        icon:
          searchTarget === "rootShelf"
            ? "rootShelf"
            : searchTarget === "subShelf"
              ? "subShelf"
              : searchTarget === "material"
                ? "material"
                : searchTarget === "blockPack"
                  ? "blockPack"
                  : searchTarget === "station"
                    ? "station"
                    : searchTarget === "routine"
                      ? "routine"
                      : searchTarget === "routineTask"
                        ? "routineTask"
                        : "routineTag",
        group: "instance",
      }));
      const creates: AppCommandCandidate[] = [];
      if (searchTarget === "rootShelf" && shelf && modal) {
        creates.push({
          id: "operation:createRootShelf",
          label: t("workspace.navigation.createRootShelf"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "station" && modal) {
        creates.push({
          id: "operation:createStation",
          label: t("workspace.navigation.createStation"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "routineTag" && modal) {
        creates.push({
          id: "operation:createRoutineTag",
          label: t("workspace.navigation.createRoutineTag"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (
        searchTarget === "subShelf" &&
        shelf &&
        lockedRootShelf &&
        shelf.expandedShelves.get(lockedRootShelf.id)
      ) {
        creates.push({
          id: "operation:createSubShelf",
          label: t("workspace.menu.subShelf"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "material" && shelf && lockedSubShelf) {
        creates.push({
          id: "operation:createMaterial",
          label: t("workspace.menu.material"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "blockPack" && !lockedSubShelf) {
        creates.push({
          id: "operation:placeBlockPack",
          label: t("workspace.menu.blockPack"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "material" && !lockedSubShelf) {
        creates.push({
          id: "operation:placeMaterial",
          label: t("workspace.menu.material"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "subShelf" && !lockedRootShelf) {
        creates.push({
          id: "operation:placeSubShelf",
          label: t("workspace.menu.subShelf"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "routine" && !lockedStation) {
        creates.push({
          id: "operation:placeRoutine",
          label: t("workspace.table.routine"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (searchTarget === "blockPack" && shelf && lockedSubShelf) {
        creates.push({
          id: "operation:createBlockPack",
          label: t("workspace.menu.blockPack"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      if (shownHasNextPage) {
        rows.push({
          id: "operation:more",
          label: t("common.more"),
          hint: "operation",
          icon: "more",
          group: "instance",
        });
      }
      return [...rows, ...creates];
    }
    if (last.kind === "instance" && last.domain === "rootShelf") {
      const rows = childCandidates(shownInstances, "subShelf", "subShelf");
      const operations: AppCommandCandidate[] = [];
      if (shelf) {
        operations.push(
          {
            id: "operation:createSubShelf",
            label: t("workspace.menu.subShelf"),
            hint: "operation",
            icon: "create",
            group: "operation",
          },
          {
            id: "operation:rename",
            label: t("workspace.menu.rename"),
            hint: "operation",
            icon: "rename",
            group: "operation",
          }
        );
        if (modal && loading) {
          operations.push({
            id: "operation:delete",
            label: t("workspace.menu.delete"),
            hint: "operation",
            icon: "trash",
            group: "operation",
          });
        }
      }
      return [...rows, ...operations];
    }
    if (last.kind === "instance" && last.domain === "subShelf") {
      const rows = childCandidates(shownInstances, "material", "material");
      const operations: AppCommandCandidate[] = [];
      if (shelf) {
        operations.push(
          {
            id: "operation:createMaterial",
            label: t("workspace.menu.material"),
            hint: "operation",
            icon: "create",
            group: "operation",
          },
          {
            id: "operation:createBlockPack",
            label: t("workspace.menu.blockPack"),
            hint: "operation",
            icon: "create",
            group: "operation",
          },
          {
            id: "operation:createNestedSubShelf",
            label: t("workspace.menu.subShelf"),
            hint: "operation",
            icon: "create",
            group: "operation",
          },
          {
            id: "operation:renameSubShelf",
            label: t("workspace.menu.rename"),
            hint: "operation",
            icon: "rename",
            group: "operation",
          }
        );
        if (modal && loading) {
          operations.push({
            id: "operation:deleteSubShelf",
            label: t("workspace.menu.delete"),
            hint: "operation",
            icon: "trash",
            group: "operation",
          });
        }
      }
      return [...rows, ...operations];
    }
    if (last.kind === "instance" && last.domain === "material") {
      return [
        {
          id: "operation:openMaterial",
          label: t("workspace.menu.open"),
          hint: "operation" as const,
          icon: "material" as const,
          group: "operation" as const,
        },
        {
          id: "operation:renameItem",
          label: t("workspace.menu.rename"),
          hint: "operation" as const,
          icon: "rename" as const,
          group: "operation" as const,
        },
        {
          id: "operation:deleteMaterial",
          label: t("workspace.menu.delete"),
          hint: "operation" as const,
          icon: "trash" as const,
          group: "operation" as const,
        },
      ];
    }
    if (last.kind === "instance" && last.domain === "blockPack") {
      return [
        {
          id: "operation:openBlockPack",
          label: t("workspace.menu.open"),
          hint: "operation" as const,
          icon: "blockPack" as const,
          group: "operation" as const,
        },
        {
          id: "operation:renameItem",
          label: t("workspace.menu.rename"),
          hint: "operation" as const,
          icon: "rename" as const,
          group: "operation" as const,
        },
        {
          id: "operation:deleteBlockPack",
          label: t("workspace.menu.delete"),
          hint: "operation" as const,
          icon: "trash" as const,
          group: "operation" as const,
        },
      ];
    }
    if (last.kind === "instance" && last.domain === "station") {
      const rows = childCandidates(shownInstances, "routine", "routine");
      const operations: AppCommandCandidate[] = [];
      if (stationRoutine) {
        operations.push(
          {
            id: "operation:inspector",
            label: t("workspace.menu.openInspector"),
            hint: "operation",
            icon: "inspector",
            group: "operation",
          },
          {
            id: "operation:rename",
            label: t("workspace.menu.rename"),
            hint: "operation",
            icon: "rename",
            group: "operation",
          }
        );
        if (modal) {
          operations.push({
            id: "operation:delete",
            label: t("workspace.menu.delete"),
            hint: "operation",
            icon: "trash",
            group: "operation",
          });
        }
      }
      if (modal) {
        operations.push({
          id: "operation:createRoutine",
          label: t("workspace.table.routine"),
          hint: "operation",
          icon: "create",
          group: "operation",
        });
      }
      return [...rows, ...operations];
    }
    if (last.kind === "instance" && last.domain === "routine") {
      const rows = childCandidates(
        shownInstances,
        "routineTask",
        "routineTask"
      );
      const operations: AppCommandCandidate[] = [];
      if (stationRoutine) {
        operations.push({
          id: "operation:inspector",
          label: t("workspace.menu.openInspector"),
          hint: "operation",
          icon: "inspector",
          group: "operation",
        });
      }
      operations.push({
        id: "operation:open",
        label: t("workspace.navigation.routines"),
        hint: "operation",
        icon: "routines",
        group: "operation",
      });
      operations.push(
        {
          id: "operation:orchestrate",
          label: t("workspace.menu.orchestrateRoutineTasks"),
          hint: "operation",
          icon: "orchestrate",
          group: "operation",
        },
        {
          id: "operation:viewTaskRecords",
          label: t("workspace.menu.viewAllTaskRecords"),
          hint: "operation",
          icon: "records",
          group: "operation",
        },
        {
          id: "operation:renameRoutine",
          label: t("workspace.menu.rename"),
          hint: "operation",
          icon: "rename",
          group: "operation",
        }
      );
      if (modal) {
        operations.push({
          id: "operation:deleteRoutine",
          label: t("workspace.menu.delete"),
          hint: "operation",
          icon: "trash",
          group: "operation",
        });
      }
      return [...rows, ...operations];
    }
    if (last.kind === "instance" && last.domain === "routineTask") {
      const operations: AppCommandCandidate[] = [
        {
          id: "operation:viewRecords",
          label: t("workspace.menu.viewAllRecords"),
          hint: "operation",
          icon: "records",
          group: "operation",
        },
      ];
      if (stationRoutine) {
        operations.push({
          id: "operation:inspector",
          label: t("workspace.menu.openInspector"),
          hint: "operation",
          icon: "inspector",
          group: "operation",
        });
      }
      return operations;
    }
    if (last.kind === "instance" && last.domain === "routineTag") {
      const operations: AppCommandCandidate[] = [];
      if (stationRoutine) {
        operations.push(
          {
            id: "operation:inspector",
            label: t("workspace.menu.openInspector"),
            hint: "operation",
            icon: "inspector",
            group: "operation",
          },
          {
            id: "operation:rename",
            label: t("workspace.menu.rename"),
            hint: "operation",
            icon: "rename",
            group: "operation",
          }
        );
      }
      if (modal) {
        operations.push({
          id: "operation:delete",
          label: t("workspace.menu.delete"),
          hint: "operation",
          icon: "trash",
          group: "operation",
        });
      }
      return operations;
    }
    return [];
  }, [
    hasNextPage,
    instances,
    listKey,
    listedKey,
    shownHasNextPage,
    shownInstances,
    last,
    loading,
    lockedStation,
    modal,
    preferences,
    searchTarget,
    shelf,
    stationRoutine,
    t,
  ]);

  const finishNavigation = useCallback(
    (path: string) => {
      router.push(path);
      setSteps([]);
      setQuery("");
      return true;
    },
    [router]
  );

  const choose = useCallback(
    async (id: string) => {
      if (id === "operation:more") {
        askMore();
        return false;
      }
      setQuery("");
      const openSettings = (
        page: "preferences" | "account",
        section?: string
      ) => {
        if (
          LocalStorage.getItemByKey(LocalStorageKey.settingsDisplayMode) ===
            "sheet" &&
          settingsDisplay
        ) {
          settingsDisplay.openSheet(page, section);
        } else {
          const path =
            page === "preferences"
              ? WebURLPathDictionary.app.setting.preferences
              : WebURLPathDictionary.app.setting.account;
          router.push(section ? `${path}#${section}` : path);
        }
        setSteps([]);
        return true;
      };
      if (id.startsWith("navigate:")) {
        const target = id.slice("navigate:".length);
        if (target === "dashboard") {
          return finishNavigation(WebURLPathDictionary.app.dashboard._);
        }
        if (target === "routines") {
          return finishNavigation(WebURLPathDictionary.app.routines._);
        }
        if (target === "trash") {
          return finishNavigation(WebURLPathDictionary.app.trash);
        }
        if (target === "document") {
          return finishNavigation(WebURLPathDictionary.document);
        }
        return false;
      }
      if (id === "operation:openPreferences") {
        return openSettings("preferences");
      }
      if (id === "operation:openAccount") {
        return openSettings("account");
      }
      if (id.startsWith("section:")) {
        const [, page, section] = id.split(":");
        if ((page === "preferences" || page === "account") && section) {
          return openSettings(page, section);
        }
        return false;
      }
      if (id === "operation:orchestrate" && last?.kind === "instance") {
        return finishNavigation(
          `app/routines/${last.id}/dependency-graph-editor`
        );
      }
      if (
        id === "operation:viewTaskRecords" &&
        modal &&
        last?.kind === "instance"
      ) {
        const routine = stationRoutine?.getRoutineById(last.id);
        modal.open("RoutineTaskRecordDialog", {
          routineTitle: last.name,
          routineId: last.id,
          routineTaskIds: routine?.routineTaskIds ?? last.taskIds ?? [],
        });
        setSteps([]);
        return true;
      }
      if (
        id === "operation:viewRecords" &&
        modal &&
        last?.kind === "instance"
      ) {
        modal.open("RoutineTaskRecordDialog", {
          routineTitle: last.name,
          routineTaskIds: [last.id],
        });
        setSteps([]);
        return true;
      }
      if (id === "operation:report") {
        if (
          LocalStorage.getItemByKey(LocalStorageKey.settingsDisplayMode) ===
            "sheet" &&
          settingsDisplay
        ) {
          settingsDisplay.openSheet("preferences", "feedback");
        } else {
          router.push(
            `${WebURLPathDictionary.app.setting.preferences}#feedback`
          );
        }
        setSteps([]);
        return true;
      }
      if (id.startsWith("domain:")) {
        const domain = id.slice("domain:".length) as RootDomain;
        if (childDomains.has(domain) && last?.kind === "instance") {
          setSteps([...steps, { kind: "domain", domain }]);
        } else {
          setSteps([{ kind: "domain", domain }]);
        }
        return false;
      }
      if (id.startsWith("preference:")) {
        const key = id.slice("preference:".length) as
          | BooleanPreference
          | ChoicePreference;
        setSteps([...steps, { kind: "preference", key }]);
        return false;
      }
      if (
        id === "operation:placeBlockPack" ||
        id === "operation:placeMaterial" ||
        id === "operation:placeSubShelf" ||
        id === "operation:placeRoutine"
      ) {
        const create =
          id === "operation:placeBlockPack"
            ? "blockPack"
            : id === "operation:placeMaterial"
              ? "material"
              : id === "operation:placeSubShelf"
                ? "subShelf"
                : "routine";
        setSteps([...steps, { kind: "place", create }]);
        return false;
      }
      if (id === "operation:createUnderRoot" && shelf && lockedRootShelf) {
        if (!shelf.expandedShelves.get(lockedRootShelf.id)) return false;
        void shelf
          .createSubShelf(
            lockedRootShelf.id,
            null,
            t("workspace.menu.newSubShelf")
          )
          .catch(error => toast.error(tError(error, t)));
        setSteps([]);
        return true;
      }
      if (id.startsWith("instance:") && searchTarget && placement) {
        const instance = instances.find(item => `instance:${item.id}` === id);
        if (!instance) return false;
        if (
          (placement.create === "blockPack" ||
            placement.create === "material") &&
          searchTarget === "subShelf" &&
          shelf &&
          instance.rootShelfId
        ) {
          const parent = await ensureSubShelf(
            shelf,
            instance.id,
            instance.rootShelfId
          ).catch(error => {
            toast.error(tError(error, t));
            return undefined;
          });
          if (!parent) return false;
          const create =
            placement.create === "material"
              ? shelf.createMaterial(
                  parent.rootShelfId,
                  parent,
                  t("workspace.menu.newMaterial")
                )
              : shelf.createBlockPack(
                  parent.rootShelfId,
                  parent,
                  t("workspace.menu.newBlockPack")
                );
          void create.catch(error => toast.error(tError(error, t)));
          setSteps([]);
          return true;
        }
        if (placement.create === "subShelf" && searchTarget === "rootShelf") {
          setSteps([
            ...steps,
            {
              kind: "instance",
              domain: "rootShelf",
              id: instance.id,
              name: instance.name,
            },
          ]);
          return false;
        }
        if (
          placement.create === "subShelf" &&
          searchTarget === "subShelf" &&
          shelf &&
          instance.rootShelfId
        ) {
          const parent = await ensureSubShelf(
            shelf,
            instance.id,
            instance.rootShelfId
          ).catch(error => {
            toast.error(tError(error, t));
            return undefined;
          });
          if (!parent) return false;
          void shelf
            .createSubShelf(
              parent.rootShelfId,
              parent,
              t("workspace.menu.newSubShelf")
            )
            .catch(error => toast.error(tError(error, t)));
          setSteps([]);
          return true;
        }
        if (placement.create === "routine" && modal) {
          modal.open("CreateRoutineDialog", {
            stationId: instance.id,
            stationName: instance.name,
          });
          setSteps([]);
          return true;
        }
      }
      if (id.startsWith("instance:") && searchTarget) {
        const instance = instances.find(item => `instance:${item.id}` === id);
        if (!instance) return false;
        const domain =
          instance.domain ?? (searchTarget === "item" ? null : searchTarget);
        if (!domain) return false;
        setSteps([
          ...steps,
          {
            kind: "instance",
            domain,
            id: instance.id,
            name: instance.name,
            parentSubShelfId: instance.parentSubShelfId,
            rootShelfId: instance.rootShelfId,
            stationId: instance.stationId,
            taskIds: instance.taskIds,
          },
        ]);
        return false;
      }
      if (id === "operation:createRootShelf" && shelf && modal) {
        modal.open("CreateShelfItemDialog", {
          dialogHeader: t("workspace.navigation.createRootShelfDialog"),
          dialogDescription: t("workspace.navigation.typeRootShelfName"),
          disableInput: false,
          inputPlaceholder: t("workspace.navigation.typeNewName"),
          onCreate: async (name: string) => {
            await shelf
              .createRootShelf(name)
              .catch(error => toast.error(tError(error, t)));
          },
          onCancel: modal.close,
        });
        setSteps([]);
        return true;
      }
      if (id === "operation:createStation" && modal) {
        modal.open("CreateStationDialog", {});
        setSteps([]);
        return true;
      }
      if (id === "operation:createRoutineTag" && modal) {
        modal.open("CreateRoutineTagDialog", {});
        setSteps([]);
        return true;
      }
      if (id === "operation:createSubShelf" && shelf) {
        const rootId =
          last?.kind === "instance" && last.domain === "rootShelf"
            ? last.id
            : lockedRootShelf?.id;
        if (!rootId || !shelf.expandedShelves.get(rootId)) return false;
        void shelf
          .createSubShelf(rootId, null, t("workspace.menu.newSubShelf"))
          .catch(error => toast.error(tError(error, t)));
        setSteps([]);
        return true;
      }
      if (
        id === "operation:createNestedSubShelf" &&
        shelf &&
        last?.kind === "instance"
      ) {
        const parent = await ensureSubShelf(
          shelf,
          last.id,
          last.rootShelfId
        ).catch(error => {
          toast.error(tError(error, t));
          return undefined;
        });
        if (!parent) return false;
        void shelf
          .createSubShelf(
            parent.rootShelfId,
            parent,
            t("workspace.menu.newSubShelf")
          )
          .catch(error => toast.error(tError(error, t)));
        setSteps([]);
        return true;
      }
      if (
        (id === "operation:createMaterial" ||
          id === "operation:createBlockPack") &&
        shelf
      ) {
        const parentId =
          last?.kind === "instance" && last.domain === "subShelf"
            ? last.id
            : lockedSubShelf?.id;
        const rootId =
          last?.kind === "instance" && last.domain === "subShelf"
            ? last.rootShelfId
            : lockedSubShelf?.rootShelfId;
        if (!parentId) return false;
        const parent = await ensureSubShelf(shelf, parentId, rootId).catch(
          error => {
            toast.error(tError(error, t));
            return undefined;
          }
        );
        if (!parent) return false;
        const create =
          id === "operation:createMaterial"
            ? shelf.createMaterial(
                parent.rootShelfId,
                parent,
                t("workspace.menu.newMaterial")
              )
            : shelf.createBlockPack(
                parent.rootShelfId,
                parent,
                t("workspace.menu.newBlockPack")
              );
        void create.catch(error => toast.error(tError(error, t)));
        setSteps([]);
        return true;
      }
      if (
        id === "operation:renameSubShelf" &&
        shelf &&
        last?.kind === "instance"
      ) {
        const parent = await ensureSubShelf(
          shelf,
          last.id,
          last.rootShelfId
        ).catch(error => {
          toast.error(tError(error, t));
          return undefined;
        });
        if (!parent) return false;
        shelf.startRenamingSubShelfNode(parent);
        setSteps([]);
        return true;
      }
      if (
        id === "operation:deleteSubShelf" &&
        shelf &&
        modal &&
        loading &&
        last?.kind === "instance"
      ) {
        const current = await ensureSubShelf(
          shelf,
          last.id,
          last.rootShelfId
        ).catch(error => {
          toast.error(tError(error, t));
          return undefined;
        });
        if (!current) return false;
        const previous = current.prevSubShelfId
          ? (loadedSubShelf(
              shelf.expandedShelves,
              current.prevSubShelfId,
              current.rootShelfId
            ) ?? null)
          : null;
        modal.open("DeleteShelfItemDialog", {
          dialogHeader: t("workspace.menu.deleteSubShelf"),
          dialogDescription: t("workspace.menu.deleteSubDescription", {
            name: current.name,
          }),
          confirmKeyword: "DELETE",
          inputPlaceholder: t("workspace.menu.typeDelete"),
          onDelete: async () => {
            await loading.startAsyncTransactionLoading(async () => {
              await shelf
                .deleteSubShelf(previous, current)
                .catch(error => toast.error(tError(error, t)));
            });
          },
          onCancel: modal.close,
        });
        setSteps([]);
        return true;
      }
      if (id === "operation:renameItem" && shelf && last?.kind === "instance") {
        const parentId = last.parentSubShelfId;
        if (!parentId) return false;
        const rootShelfId =
          last.rootShelfId ?? (await rootShelfIdForSubShelf(parentId));
        const parent = await ensureSubShelf(shelf, parentId, rootShelfId).catch(
          error => {
            toast.error(tError(error, t));
            return undefined;
          }
        );
        if (!parent) return false;
        if (last.domain === "material" && !parent.materialNodes[last.id]) {
          parent.materialNodes[last.id] = {
            id: last.id,
            parentSubShelfId: parent.id,
            name: last.name,
            size: 0,
            contentType: "",
            parseMediaType: "",
            objectKey: "",
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: new Date(),
            isOpen: false,
            nodeType: "Material",
          };
        }
        if (last.domain === "blockPack" && !parent.blockPackNodes[last.id]) {
          parent.blockPackNodes[last.id] = {
            id: last.id,
            parentSubShelfId: parent.id,
            name: last.name,
            icon: null,
            headerBackgroundURL: null,
            blockCount: 0,
            updatedAt: new Date(),
            createdAt: new Date(),
            isOpen: false,
            nodeType: "BlockPack",
          };
        }
        const node =
          last.domain === "material"
            ? parent.materialNodes[last.id]
            : parent.blockPackNodes[last.id];
        if (!node) return false;
        shelf.startRenamingItemNode(node);
        setSteps([]);
        return true;
      }
      if (
        (id === "operation:deleteMaterial" ||
          id === "operation:deleteBlockPack") &&
        shelf &&
        last?.kind === "instance" &&
        last.parentSubShelfId
      ) {
        const rootShelfId =
          last.rootShelfId ??
          (await rootShelfIdForSubShelf(last.parentSubShelfId));
        const parent = await ensureSubShelf(
          shelf,
          last.parentSubShelfId,
          rootShelfId
        ).catch(error => {
          toast.error(tError(error, t));
          return undefined;
        });
        if (!parent) return false;
        if (
          id === "operation:deleteMaterial" &&
          !parent.materialNodes[last.id]
        ) {
          parent.materialNodes[last.id] = {
            id: last.id,
            parentSubShelfId: parent.id,
            name: last.name,
            size: 0,
            contentType: "",
            parseMediaType: "",
            objectKey: "",
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: new Date(),
            isOpen: false,
            nodeType: "Material",
          };
        }
        if (
          id === "operation:deleteBlockPack" &&
          !parent.blockPackNodes[last.id]
        ) {
          parent.blockPackNodes[last.id] = {
            id: last.id,
            parentSubShelfId: parent.id,
            name: last.name,
            icon: null,
            headerBackgroundURL: null,
            blockCount: 0,
            updatedAt: new Date(),
            createdAt: new Date(),
            isOpen: false,
            nodeType: "BlockPack",
          };
        }
        const remove =
          id === "operation:deleteMaterial"
            ? parent.materialNodes[last.id]
              ? shelf.deleteMaterial(parent, parent.materialNodes[last.id])
              : undefined
            : parent.blockPackNodes[last.id]
              ? shelf.deleteBlockPack(parent, parent.blockPackNodes[last.id])
              : undefined;
        if (!remove) return false;
        void remove.catch(error => toast.error(tError(error, t)));
        setSteps([]);
        return true;
      }
      if (
        id === "operation:renameRoutine" &&
        stationRoutine &&
        last?.kind === "instance"
      ) {
        const routine = stationRoutine.getRoutineById(last.id);
        if (!routine) return false;
        stationRoutine.startRenamingRoutine(routine);
        setSteps([]);
        return true;
      }
      if (
        id === "operation:deleteRoutine" &&
        modal &&
        last?.kind === "instance"
      ) {
        modal.open("DeleteRoutineDialog", {
          routineId: last.id,
          routineTitle: last.name,
        });
        setSteps([]);
        return true;
      }
      if (
        id === "operation:rename" &&
        last?.kind === "instance" &&
        last.domain === "rootShelf" &&
        shelf
      ) {
        const node = shelf.expandedShelves.get(last.id)?.root;
        if (!node) return false;
        shelf.startRenamingRootShelfNode(node);
        setSteps([]);
        return true;
      }
      if (
        id === "operation:delete" &&
        last?.kind === "instance" &&
        last.domain === "rootShelf" &&
        shelf &&
        modal &&
        loading
      ) {
        const node = shelf.expandedShelves.get(last.id)?.root;
        if (!node) return false;
        modal.open("DeleteShelfItemDialog", {
          dialogHeader: t("workspace.menu.deleteRootShelf"),
          dialogDescription: t("workspace.menu.deleteRootDescription", {
            name: node.name,
          }),
          confirmKeyword: "DELETE",
          inputPlaceholder: t("workspace.menu.typeDelete"),
          onDelete: async () => {
            await loading.startAsyncTransactionLoading(async () => {
              await shelf
                .deleteRootShelf(node)
                .catch(error => toast.error(tError(error, t)));
            });
          },
          onCancel: modal.close,
        });
        setSteps([]);
        return true;
      }
      if (
        id === "operation:inspector" &&
        last?.kind === "instance" &&
        stationRoutine &&
        (last.domain === "station" ||
          last.domain === "routineTag" ||
          last.domain === "routine" ||
          last.domain === "routineTask")
      ) {
        stationRoutine.openInspector({ type: last.domain, id: last.id });
        setSteps([]);
        return true;
      }
      if (
        id === "operation:rename" &&
        last?.kind === "instance" &&
        last.domain === "station" &&
        stationRoutine
      ) {
        const node = stationRoutine.getStationById(last.id);
        if (!node) return false;
        stationRoutine.startRenamingStation(node);
        setSteps([]);
        return true;
      }
      if (
        id === "operation:delete" &&
        last?.kind === "instance" &&
        last.domain === "station" &&
        modal
      ) {
        modal.open("DeleteStationDialog", {
          stationId: last.id,
          stationName: last.name,
        });
        setSteps([]);
        return true;
      }
      if (
        id === "operation:createRoutine" &&
        last?.kind === "instance" &&
        last.domain === "station" &&
        modal
      ) {
        modal.open("CreateRoutineDialog", {
          stationId: last.id,
          stationName: last.name,
        });
        setSteps([]);
        return true;
      }
      if (id === "operation:openMaterial" && last?.kind === "instance") {
        const parentSubShelfId = last.parentSubShelfId;
        if (!parentSubShelfId) return false;
        const rootShelfId =
          last.rootShelfId ?? (await rootShelfIdForSubShelf(parentSubShelfId));
        if (!rootShelfId) return false;
        return finishNavigation(
          WebURLPathDictionary.app.materialViewer.byId(
            last.id,
            parentSubShelfId,
            rootShelfId
          )
        );
      }
      if (id === "operation:openBlockPack" && last?.kind === "instance") {
        return finishNavigation(
          WebURLPathDictionary.app.blockPackEditor._(last.id)
        );
      }
      if (id === "operation:open" && last?.kind === "instance") {
        const stationId = last.stationId ?? lockedStation?.id;
        if (!stationId) return false;
        return finishNavigation(
          WebURLPathDictionary.app.routines.byStationId(stationId)
        );
      }
      if (
        id === "operation:rename" &&
        last?.kind === "instance" &&
        last.domain === "routineTag" &&
        stationRoutine
      ) {
        const node = stationRoutine.getRoutineTagById(last.id);
        if (!node) return false;
        stationRoutine.startRenamingRoutineTag(node);
        setSteps([]);
        return true;
      }
      if (
        id === "operation:delete" &&
        last?.kind === "instance" &&
        last.domain === "routineTag" &&
        modal
      ) {
        modal.open("DeleteRoutineTagDialog", {
          routineTagId: last.id,
          routineTagName: last.name,
        });
        setSteps([]);
        return true;
      }
      if (
        id.startsWith("operation:density:") &&
        last?.kind === "preference" &&
        last.key === "density" &&
        preferences
      ) {
        const density = id.slice("operation:density:".length) as Density;
        preferences.updatePreference("density", density);
        setSteps([]);
        return true;
      }
      if (
        id === "operation:toggle" &&
        last?.kind === "preference" &&
        booleanPreferences.has(last.key as BooleanPreference) &&
        preferences
      ) {
        const key = last.key as BooleanPreference;
        if (key === "desktopNotifications" && !preferences.preferences[key]) {
          await preferences.requestNotificationPermission();
          setSteps([]);
          return true;
        }
        preferences.updatePreference(key, !preferences.preferences[key]);
        setSteps([]);
        return true;
      }
      if (id.startsWith("operation:startSurface:") && preferences) {
        const value = id.slice("operation:startSurface:".length) as
          | "dashboard"
          | "routines";
        preferences.updatePreference("startSurface", value);
        setSteps([]);
        return true;
      }
      if (id.startsWith("operation:editorWidth:") && preferences) {
        const value = id.slice("operation:editorWidth:".length) as
          | "narrow"
          | "standard"
          | "wide";
        preferences.updatePreference("editorWidth", value);
        setSteps([]);
        return true;
      }
      if (id.startsWith("operation:cleanupAfterDays:") && preferences) {
        preferences.updatePreference(
          "cleanupAfterDays",
          Number(id.slice("operation:cleanupAfterDays:".length))
        );
        setSteps([]);
        return true;
      }
      if (id.startsWith("operation:theme:")) {
        await theme.switchCurrentTheme(id.slice("operation:theme:".length));
        setSteps([]);
        return true;
      }
      if (id.startsWith("operation:language:")) {
        await i18n.changeLanguage(id.slice("operation:language:".length));
        setSteps([]);
        return true;
      }
      if (id.startsWith("operation:status:")) {
        if (!isOnline) {
          toast.error(t("common.commandStatusRequiresNetwork"));
          return false;
        }
        const status = id.slice("operation:status:".length) as UserStatus;
        if (!loading) return false;
        await loading.startAsyncTransactionLoading(async () => {
          await updateMe.mutateAsync({
            header: getClientRequestHeaders(navigator.userAgent),
            body: {
              values: { status },
              setNull: { status: false },
            },
          });
          user.updateUserData({ status });
        });
        toast.success(t("settingsPage.account.messages.accountUpdated"));
        setSteps([]);
        return true;
      }
      return false;
    },
    [
      askMore,
      finishNavigation,
      i18n,
      instances,
      isOnline,
      theme,
      updateMe,
      user,
      last,
      loading,
      lockedStation,
      modal,
      preferences,
      router,
      searchTarget,
      settingsDisplay,
      shelf,
      stationRoutine,
      steps,
      t,
    ]
  );

  const path = useMemo(
    () =>
      steps.map(step => {
        if (step.kind === "instance") return step.name;
        if (step.kind === "place") {
          if (step.create === "blockPack") return t("workspace.menu.blockPack");
          if (step.create === "material") return t("workspace.menu.material");
          if (step.create === "routine") return t("workspace.table.routine");
          return t("workspace.menu.subShelf");
        }
        if (step.kind === "domain") {
          if (step.domain === "rootShelf")
            return t("workspace.trash.rootShelves");
          if (step.domain === "subShelf") return t("workspace.menu.subShelves");
          if (step.domain === "material") return t("workspace.menu.materials");
          if (step.domain === "blockPack")
            return t("workspace.menu.blockPacks");
          if (step.domain === "station")
            return t("workspace.navigation.stations");
          if (step.domain === "routineTag") {
            return t("workspace.navigation.routineTags");
          }
          if (step.domain === "routine")
            return t("workspace.navigation.routines");
          if (step.domain === "routineTask")
            return t("workspace.table.routineTasks");
          if (step.domain === "account") {
            return t("workspace.navigation.accountSettings");
          }
          return t("workspace.navigation.preferenceSettings");
        }
        if (step.key === "density") {
          return t("settingsPage.preferences.appearance.density");
        }
        if (step.key === "theme") {
          return t("settingsPage.preferences.appearance.theme");
        }
        if (step.key === "language") {
          return t("settingsPage.preferences.appearance.language");
        }
        if (step.key === "startSurface") {
          return t("settingsPage.preferences.privacy.startSurface");
        }
        if (step.key === "editorWidth") {
          return t("settingsPage.preferences.editor.pageWidth");
        }
        if (step.key === "cleanupAfterDays") {
          return t("settingsPage.preferences.offline.cleanupPeriod");
        }
        if (step.key === "status")
          return t("settingsPage.account.fields.status");
        if (step.key === "reduceMotion") {
          return t("settingsPage.preferences.appearance.reduceMotion");
        }
        if (step.key === "tactileFeedback") {
          return t("settingsPage.preferences.appearance.tactileFeedback");
        }
        if (step.key === "manualDashboardWidth") {
          return t("settingsPage.preferences.dashboard.manualWidth");
        }
        if (step.key === "lineWrap") {
          return t("settingsPage.preferences.editor.lineWrap");
        }
        if (step.key === "spellcheck") {
          return t("settingsPage.preferences.editor.spellcheck");
        }
        if (step.key === "quickInsert") {
          return t("settingsPage.preferences.editor.quickInsert");
        }
        if (step.key === "blockDragHandle") {
          return t("settingsPage.preferences.editor.dragHandle");
        }
        if (step.key === "localVault") {
          return t("settingsPage.preferences.offline.localDatabase");
        }
        if (step.key === "offlineQueue") {
          return t("settingsPage.preferences.offline.offlineQueue");
        }
        if (step.key === "cacheAttachments") {
          return t("settingsPage.preferences.offline.attachmentCache");
        }
        if (step.key === "privatePreviews") {
          return t("settingsPage.preferences.privacy.privatePreviews");
        }
        if (step.key === "clipboardGuard") {
          return t("settingsPage.preferences.privacy.clipboardGuard");
        }
        if (step.key === "desktopNotifications") {
          return t("settingsPage.preferences.notifications.desktop");
        }
        if (step.key === "routineNudges") {
          return t("settingsPage.preferences.notifications.routine");
        }
        if (step.key === "syncNotifications") {
          return t("settingsPage.preferences.notifications.sync");
        }
        return t("settingsPage.preferences.notifications.quietMode");
      }),
    [steps, t]
  );

  const prompt = useMemo(() => {
    if (!placement) return null;
    if (placement.create === "routine") return t("common.commandChooseStation");
    if (placement.create === "subShelf" && !placingSubShelf) {
      return t("common.commandChooseRootShelf");
    }
    return t("common.commandChooseSubShelf");
  }, [placement, placingSubShelf, t]);

  const visit = useCallback((index: number) => {
    setQuery("");
    setSteps(current => current.slice(0, index + 1));
  }, []);

  const back = useCallback(() => {
    setQuery("");
    setSteps(current => current.slice(0, -1));
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setSteps(current => (current.length === 0 ? current : []));
  }, []);

  const value = useMemo<AppCommandContextValue>(
    () => ({
      query,
      setQuery,
      steps,
      path,
      prompt,
      candidates,
      choose,
      visit,
      back,
      reset,
    }),
    [back, candidates, choose, path, prompt, query, reset, steps, visit]
  );

  return (
    <AppCommandContext.Provider value={value}>
      {children}
    </AppCommandContext.Provider>
  );
};
