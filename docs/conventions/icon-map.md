# Icon map

Look up the meaning before choosing the glyph. Reuse an existing semantic icon
or component; introduce a new glyph only when none fits, and register it here
in the same change. This map complements [Icons and Images](03-icons-and-images.md).

Markdown is the source of truth for human/agent discovery, not a runtime registry.
It keeps meaning, aliases, exceptions and source links together without adding
a wrapper, dependency, dynamic icon loader or a second component map. Import
the actual component directly; keep entity aliases in [WorkspaceEntityIcons].

## How to choose and maintain an icon

1. Search this document by entity or action. Entity identity takes precedence:
   a Routine uses `RoutineIcon`, not an arbitrary clock or workflow glyph.
2. Reuse the existing import/component and the nearest control's sizing,
   semantic colors and accessible-name pattern. Same meaning means same glyph
   across navigation, menus, lists, empty states and pickers. Different meanings
   can share a glyph when the existing context already makes them clear.
3. If the meaning exists but the context needs a deliberate variation, record
   that context rather than silently assigning another entity identity.
4. If nothing fits, choose from the installed `lucide-react` first. Record the
   meaning, exact export, source/first consumer and scope in this map. Custom
   domain or brand SVGs belong in `components/icons/` under the existing rules.
   Do not create an icon wrapper merely to rename a general action.
5. Update this map with additions, replacements and removals. Check imports,
   re-exports, local aliases, custom components and inline SVG, not only JSX
   names. Keep legacy aliases searchable; do not mass-rename working imports.

For a rescan, start with:

```sh
rg -n 'lucide-react|components/icons|<svg' apps shared scripts --glob '*.{ts,tsx,js,jsx}'
```

Follow multiline import/export declarations and check [SupportedIcon], brand
assets and the non-library entries below. Library-internal artwork, chart/PDF
content, user uploads and prose emoji are not separate reusable application icons.

## Shared action choices

| Meaning | Reuse | Boundary |
| --- | --- | --- |
| Edit / open Inspector | `SquarePen` | Dashboard, graph nodes/edges, tables, menus and inline/template editing. Do not recreate its SVG. |
| Rename | `Pencil` | Existing object-name editing. PDF `PencilIcon` is a drawing tool, not the edit/Inspector action. |
| Document navigation | `BookOpenIcon` | Home, app sidebar, viewer/editor guide links and document navigation/fallback entries. |
| Refresh / retry | `RefreshCw` / `RefreshCwIcon` | Material reload, pending graph sync and browser permission checks. Reset remains `RotateCcwIcon`. |
| Routine and record filters | `ListFilter` | Status, purpose and date-range controls; [RecordFilters], [RoutineTable], [RoutineTaskTable]. |
| Routine and record sort order | `ArrowDownUp` | Sorting field and direction; [RoutineSearchOrder]. |
| Realign dependency graph | `Workflow` | Whole Routine task graph realignment; [GraphToolbar]. |
| Routine activation state | `Power` / `PowerOff` | Active / inactive Routine toggle in [GraphToolbar]; not execution or task status. |
| Local recovery eligibility | `ShieldCheckIcon` | Safety/preflight inspection in [LocalDBRecoveryCover]; advisory, not proof that local data can be discarded. |
| Local database rebuild | `RotateCcwIcon` | Explicit destructive local reset in [LocalDBRecoveryCover]; Retry remains `RefreshCwIcon`. |
| Copy to clipboard / duplicate | `CopyIcon` / `Copy` | Preferences, API keys, code and existing duplicate actions. A successful-copy `CheckIcon` is state feedback. |

## Canonical workspace entities

Import these names from `@/components/icons/WorkspaceEntityIcons`. The source
table below inventories raw Lucide names too; it does not override these aliases.

| Meaning | Use | Implementation | Scope / variation |
| --- | --- | --- | --- |
| Root shelf | `RootShelfIcon` | Custom `ShelfIcon` | `EmptyShelfIcon` is the existing sidebar state variation, not another entity. |
| Sub shelf | `SubShelfIcon` | Lucide `FolderIcon` | `FolderPlus` means create, not identity. |
| Material | `MaterialIcon` | Lucide `FileTextIcon` | File/document identity in workspace contexts. |
| Block pack | `BlockPackIcon` | Lucide `PackageIcon` | `PackagePlus` is an add-items action/group. |
| Station | `StationIcon` | Custom `TrainStationIcon` | User-selected emoji may replace the row icon; retain this fallback. |
| Routine | `RoutineIcon` | Lucide `ClipboardClockIcon` | Use across navigation, lists, menus, Trash and linked objects. |
| Routine task identity | `RoutineTaskIcon` | Lucide `ClipboardListIcon` | Generic task references without a specific kind. |
| Routine task kind: Start | `RoutineTaskStartIcon` | Lucide `GitFork` | Reserved for Routine task Start entry/branching; first consumer [GraphToolbar]. Do not reuse for general Git, media, navigation or add actions. |
| Routine task kind: Action | `RoutineTaskActionIcon` | Lucide `SquareFunction` | Reserved for Routine task Action operations; first consumer [GraphToolbar]. Do not reuse for generic functions, code, calculators or other task systems. |
| Routine tag | `RoutineTagIcon` | Lucide `TagIcon` | `Tags` remains the existing multi-tag filter glyph. |

The graph Start is a circular node with its title outside and green/gray active
state, owned by [RoutineTaskGraphNode]. Do not substitute the radio-menu
`CircleIcon` or video `Play` glyph for this node. Execution status dots are owned
by [RoutineTaskStatusDot], not a new Lucide status map.

## Lucide inventory

Audit: 2026-10-24, current `apps/`, `shared/` and `scripts/` TypeScript/JavaScript
imports and re-exports (excluding tests). There are **127 referenced export names / 102 distinct
glyphs**, including the entity re-exports above. Names in one row resolve to the
same component in the installed package; this is not a rule that unrelated
actions must share one icon. Recheck aliases when updating the dependency.
The source column gives a representative existing consumer, not every call site.

| Existing export name(s) | Meaning / existing context | Source |
| --- | --- | --- |
| `Activity` | Execution activity / records | [RoutineRecordTable] |
| `AlertCircleIcon`, `CircleAlertIcon` | Important notification / alert | [NotificationPopover], [NotificationDialog] |
| `AlertTriangleIcon`, `TriangleAlert` | Warning notification / toast | [NotificationPopover], [Toaster] |
| `ArrowDownUp` | Routine and record sorting field / direction | [RoutineSearchOrder] |
| `ArchiveRestoreIcon` | Restore deleted workspace data | [TrashPage] |
| `BellIcon` | Notifications | [NotificationPopover] |
| `BlocksIcon` | Block content-unit identity in API reference | [APIReference]; not a Block pack identity substitute |
| `BookOpenIcon` | Document navigation, documentation/website guides | [HomePage], [AppSidebar], [ArticleNavigation], [ArticleCommand] |
| `Bookmark` | Pin/unpin Routine presentation | [RoutineTable], [RoutineMenu] |
| `Braces` | JSON code format | [CodeExamplePanel] |
| `CalendarClock` | Routine time-rail schedule | [TimeRails] |
| `CalendarDays`, `CalendarDaysIcon` | Calendar view / date field | [TimeRails], [BlockPackEditorSchema] |
| `CalendarIcon` | Date picker / profile date | [DatePicker], [ProfileTab] |
| `ChartNoAxesCombined` | Routine analytics / chart view | [RoutineCharts], [RoutineScopeBar] |
| `Check`, `CheckIcon` | Selected, completed, copied or confirmed | [Checkbox], [DropdownMenu], [SupportedIconTable], [CodeBlock] |
| `CheckCircle2`, `CheckCircle2Icon`, `CircleCheck` | Success / completed guide step | [GuideWidget], [VersionCard], [Toaster] |
| `ChevronDown`, `ChevronDownIcon` | Expand / dropdown / next field; native open-state rotation for recovery Export | [Select], [GuideWidget], [LocalDBRecoveryCover] |
| `ChevronLeft`, `ChevronLeftIcon` | Previous / previous month / PDF page | [GuideWidget], [Calendar], [MaterialPDFViewer] |
| `ChevronRight`, `ChevronRightIcon` | Next / submenu / breadcrumb / PDF page | [ContextMenu], [ItemPath], [MaterialPDFViewer] |
| `ChevronUpIcon` | Collapse / previous field | [VersionCard], [CreateRoutineTaskDialog] |
| `ChevronsRightLeftIcon` | Reduce dashboard width | [DashboardPage] |
| `ChevronsUpDownIcon` | Combobox / timezone selection | [TimezoneSelector] |
| `Circle`, `CircleIcon` | Radio-menu selection marker | [ContextMenu] |
| `CircleDotIcon` | Incomplete version-card task | [VersionCard] |
| `CircleHelpIcon` | Help navigation | [ArticleNavigation] |
| `ClipboardClockIcon` | Routine base glyph; use `RoutineIcon` | [WorkspaceEntityIcons] |
| `ClipboardListIcon` | Routine task base glyph; consume as `RoutineTaskIcon` | [WorkspaceEntityIcons], [RoutineMenu] |
| `ClockIcon` | Time picker | [TimePicker] |
| `Code2Icon` | Developer/document command | [ArticleCommand] |
| `Copy`, `CopyIcon` | Copy / duplicate | [AboutTab], [CodeBlock], [RoutineTaskMenu] |
| `Crown` | Ownership | [RootShelfMenu], [StationMenu] |
| `DatabaseIcon` | Plan storage/resources | [UpgradeTab] |
| `Download`, `DownloadIcon` | Download / export | [GraphToolbar], [MaterialPDFViewer], [LocalDBRecoveryCover] |
| `EllipsisVerticalIcon` | Overflow / more actions | [Extendable]; graph nodes use their context menu instead |
| `EraserIcon` | Erase PDF annotation | [MaterialPDFViewer] |
| `ExternalLink`, `ExternalLinkIcon` | Open externally / open linked item | [MaterialMenu], [PrivacyPolicyPage] |
| `Eye` | View execution details | [RoutineRecordTable] |
| `FileCode2`, `FileCode2Icon` | Source/code content / API reference | [CodeExamplePanel], [APIReference] |
| `FilePlus` | Import material content | [MaterialViewerFrame] |
| `FileTextIcon` | Material base glyph; consume as `MaterialIcon` | [WorkspaceEntityIcons] |
| `FolderIcon` | Sub shelf base glyph; use `SubShelfIcon` | [WorkspaceEntityIcons] |
| `FolderPlus` | Create sub shelf | [RootShelfMenu], [SubShelfMenu] |
| `Form` | Block pack template/form editing | [TemplateEditor] |
| `GaugeIcon` | Plan usage/limits | [UpgradeTab] |
| `GitBranchIcon` | Versions / API-reference section | [Versions], [APIReference] |
| `Globe2`, `Globe2Icon` | Web / HTTP / API context | [CodeExamplePanel], [APIReference] |
| `GripVertical`, `GripVerticalIcon` | Drag / reorder / resize handle | [Resizable], [TodoWidget], [PrivacyTab] |
| `HardDriveIcon` | Local storage preferences | [PreferencesContent] |
| `HeartIcon` | Support / upgrade page | [UpgradeTab] |
| `GitFork` | Routine task Start kind; consume as `RoutineTaskStartIcon`, reserved scope above | [WorkspaceEntityIcons], [GraphToolbar] |
| `HighlighterIcon` | Highlight PDF content | [MaterialPDFViewer] |
| `HistoryIcon` | Execution history | [RoutineMenu], [RoutineTaskRecordTable] |
| `Import` | Import Block pack content | [BlockPackEditorContent] |
| `Info`, `InfoIcon` | Informational toast / notification | [Toaster], [NotificationPopover] |
| `KeyRoundIcon` | API key documentation | [APIKey] |
| `LayoutDashboardIcon` | Dashboard navigation | [AppSidebar] |
| `LinkIcon` | Todo linked item | [TodoWidget] |
| `ListFilter` | Routine and record filter controls | [RecordFilters], [RoutineTable], [RoutineTaskTable] |
| `Loader2Icon`, `LoaderCircle`, `LoaderCircleIcon` | Loading / pending work | [Spinner], [RoutineMenu], [HomePage] |
| `LogOut`, `LogOutIcon` | Sign out / leave shared resource | [AppSidebar], [StationMenu], [RootShelfMenu] |
| `MailIcon` | Contact/email navigation | [ArticleNavigation] |
| `Map` | Graph minimap control (local alias `MapIcon`) | [GraphCanvas] |
| `Maximize2Icon` | Expand settings view | [AccountSettingsPage] |
| `MessageSquareWarningIcon` | Feedback navigation / recovery report | [AppSidebar], [LocalDBRecoveryCover] |
| `MinusIcon` | Zoom out | [MaterialPDFViewer] |
| `MoreHorizontal` | Collapsed breadcrumb items | [Breadcrumb] |
| `MousePointer` | PDF selection tool | [MaterialPDFViewer] |
| `NewspaperIcon` | News notification | [NotificationPopover] |
| `OctagonX` | Error toast | [Toaster] |
| `PackageIcon` | Block pack base glyph; use `BlockPackIcon` | [WorkspaceEntityIcons] |
| `PackagePlus` | Add-items menu group | [RoutineMenu], [SubShelfMenu] |
| `PaletteIcon` | Color selector | [ColorSelector] |
| `PanelLeftIcon` | Toggle sidebar | [Sidebar] |
| `PanelRightOpenIcon` | Open settings in side panel | [AccountSettingsPage] |
| `Pencil`, `PencilIcon` | Rename / PDF drawing tool | [RootShelfMenu], [RoutineMenu], [MaterialPDFViewer] |
| `Plus`, `PlusIcon` | Add / create / PDF zoom in | [GraphToolbar], [MaterialPDFViewer] |
| `Power` | Active Routine toggle state | [GraphToolbar] |
| `PowerOff` | Inactive Routine toggle state | [GraphToolbar] |
| `RefreshCw`, `RefreshCwIcon` | Refresh / retry / browser permission check | [MaterialViewerFrame], [BrowserPermissionsTab], [LocalDBRecoveryCover] |
| `RotateCcwIcon` | Reset preferences / PDF zoom / destructive local database rebuild | [AboutTab], [MaterialPDFViewer], [LocalDBRecoveryCover] |
| `SaveIcon` | Save changes / submit graph layout | [MaterialPDFViewer], [GraphToolbar] |
| `SearchIcon` | Search / command / filter | [SupportedIconTable], [Command] |
| `SettingsIcon` | Settings navigation | [AppSidebar] |
| `ShieldCheckIcon` | Security / authenticated API context / local rebuild eligibility check | [UpgradeTab], [APIReference], [LocalDBRecoveryCover] |
| `ShieldIcon` | Privacy documentation | [PrivacyPolicy] |
| `SlidersHorizontalIcon` | Preferences navigation | [AppSidebar] |
| `SmilePlusIcon` | Choose a user emoji | [SupportedIconTable] |
| `SquareDotIcon` | Root shelf has changed indicator | [RootShelfMenu] |
| `SquareFunction` | Routine task Action kind; consume as `RoutineTaskActionIcon`, reserved scope above | [WorkspaceEntityIcons], [GraphToolbar] |
| `SquarePen` | Edit / open Inspector | [DashboardPage], [RoutineTaskGraphNode], [RoutineTable], [RoutineTaskMenu], [Editable], [TemplatePatternEditor] |
| `TagIcon` | Routine tag base glyph; consume as `RoutineTagIcon` | [WorkspaceEntityIcons] |
| `Tags` | Multi-tag Routine filter | [RoutineScopeBar] |
| `Terminal` | Shell code format | [CodeExamplePanel] |
| `Trash2`, `Trash2Icon` | Delete / remove / Trash navigation | [RoutineTaskGraphNode], [TrashPage] |
| `TypeIcon` | PDF text annotation | [MaterialPDFViewer] |
| `UserPlusIcon` | Add/invite participant | [ParticipantsDropdown], [ShelfSharingDialog] |
| `UserRoundIcon` | Account navigation | [AppSidebar] |
| `UsersIcon` | Participants / collaboration | [ParticipantsDropdown] |
| `WifiOffIcon` | Offline settings | [OfflineTab] |
| `Workflow` | Open / realign dependency graph | [RoutineMenu], [GraphToolbar]; not Routine identity |
| `WrenchIcon` | Dashboard configuration | [DashboardPage] |
| `X`, `XIcon` | Close / dismiss / clear | [Closeable], [GraphCanvas], [Dialog], [Toast] |

Inventory is not automatic approval to repurpose an icon or add a control.

## Custom components and wrappers

All 10 files beside `WorkspaceEntityIcons.ts` in `components/icons/` are listed
here (13 components, including the four OAuth exports). Reuse the canonical
entity alias instead of its underlying custom file.

| Export / component | Meaning and current use | Source / status |
| --- | --- | --- |
| `AvatarIcon` | User avatar with initial fallback; sidebar/profile | [AvatarIcon]; image wrapper, not a Lucide glyph |
| `EmptyShelfIcon` | Root shelf sidebar state variation | [EmptyShelfIcon] |
| `LanguageIcon` | Home language menu | [LanguageIcon] |
| `NoteIcon` | Home note/brand illustration | [NoteIcon] |
| `OAuthGoogleIcon` | Google sign-in provider | [OAuthIcon], [AuthPanel] |
| `OAuthMetaIcon` | Meta sign-in provider | [OAuthIcon], [AuthPanel] |
| `OAuthAppleIcon` | Apple sign-in provider | [OAuthIcon], [AuthPanel] |
| `OAuthGithubIcon` | GitHub sign-in provider; preserve existing export spelling | [OAuthIcon], [AuthPanel] |
| `PublicAvatarImage` | Shared/public avatar image; sharing/participants | [PublicAvatarImage]; image wrapper, not a glyph |
| `ShelfCaseIcon` | Sidebar shelf collection | [ShelfCaseIcon], [AppSidebar]; not individual Root shelf identity |
| `ShelfIcon` | Root shelf custom base glyph | [ShelfIcon]; consume as `RootShelfIcon` |
| `ThemeIcon` (named) | Home theme menu | [ThemeIcon] |
| `TrainStationIcon` | Station custom base glyph | [TrainStationIcon]; consume as `StationIcon` |

The unused `ColorPaletteIcon`, `MenuIcon`, `MoonIcon`, `SunIcon`,
`WideBookmarkIcon` and `NotegicIcon` components were removed after checking
source imports/re-exports. The duplicate custom `EditIcon` was replaced by
Lucide `SquarePen` and removed too. Brand image files remain intact; the
retained domain, state and OAuth components are not generic Lucide replacements.

## User-selectable emoji

[SupportedIcon] is the authoritative persisted enum; [SupportedIconTable] renders
its values for custom object icons. These are user content, not replacements
for application entity fallbacks. Do not persist arbitrary Lucide export names
in this enum or expand the backend/shared contract through a documentation edit.

| Enum member | Value | Enum member | Value | Enum member | Value |
| --- | --- | --- | --- | --- | --- |
| `GrinningFace` | 😀 | `SmilingFaceWithSmilingEyes` | 😊 | `RedHeart` | ❤️ |
| `Fire` | 🔥 | `Star` | ⭐ | `Books` | 📚 |
| `Notebook` | 📓 | `PencilPaper` | 📝 | `Lightbulb` | 💡 |
| `Rocket` | 🚀 | `CheckMark` | ✅ | `Pin` | 📌 |
| `FolderOpen` | 📂 | `Calendar` | 📅 | `Clock` | ⏰ |

## Inline symbols, brand assets and non-icon SVG

These existing exceptions are recorded so a scan does not mistake them for a
missing reusable glyph. Do not extract renderer SVGs into an icon library.

| Meaning / asset | Owner / source | Reuse boundary |
| --- | --- | --- |
| Branded animated loading mark | [LoadingIndicator] | Use the existing cover/indicator; its inline paths are not a generic spinner. |
| Dashboard expand-width arrows | [DashboardPage] | Existing inline action glyph paired with `ChevronsRightLeftIcon`; no separate exported component. |
| Circular progress ring | [Ring] | SVG progress renderer, not a control icon. |
| Analog clock face/hands | [ClockWidget] | Widget illustration, not the `ClockIcon` used for time selection. |
| Chart canvas | [ChartFrame] | Data visualization renderer, not an icon asset. |
| Start circle and execution status dots | [RoutineTaskGraphNode], [RoutineTaskStatusDot] | CSS/domain state visuals; preserve their existing behavior and semantics. |
| Article/navigation logo | [transparent-background.svg](../../apps/web/assets/logo/transparent-background.svg), [ArticleNavigation] | Brand identity, not an entity icon. |
| Common brand logo | [common.svg](../../apps/web/assets/logo/common.svg), [common.png](../../apps/web/assets/logo/common.png) | Retained brand assets; removing the unused wrapper does not remove these files. |
| Other brand artwork | [unzoom.png](../../apps/web/assets/logo/unzoom.png), [header-image.png](../../apps/web/assets/logo/header-image.png) | Existing artwork, not general-purpose control glyphs. |
| Browser favicon | [public/favicon.ico](../../apps/web/public/favicon.ico), [root route](../../apps/web/src/routes/__root.tsx) | Root document's public favicon. |
| Favicon/application variants | [asset directory](../../apps/web/assets/logo/) | `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`; inventory does not imply every variant is currently linked. |

## Verification and change scope

The initial audit compared every direct Lucide import/re-export against this
inventory, checked installed-component identity for alias groups, enumerated
custom icon exports, checked all 15 emoji members and located every JSX `svg`
owner in application/shared sources. Known inline exceptions remain documented.
The follow-up consolidation implements the shared action choices above, routes
entity consumers through their existing aliases and removes seven obsolete
custom components without changing events, routing, storage or API contracts.
When changing icons, inspect actual usage as well as imports: a source import
can exist without proving that its control is currently visible.

Run `npm run test:unit -- apps/web/test/integration/iconConventions.test.ts` for
the local regression check. It verifies canonical component identities, action
imports/usages, entity-alias boundaries, exact active Lucide inventory and
installed aliases, custom-source coverage, local links and removed wrappers.
It is a source/contract check, not browser or deployment evidence.

Consolidation verification (2026-10-19): the 22 icon checks, full Jest suite
(52 suites / 311 tests), typecheck, formatting, lint and diff checks passed.
The existing Document-navigation, graph-node and dependency-edge browser cases
also passed with the new glyph assertions. The first default parallel run
timed out during page/fixture startup; a local `--workers=1 --timeout=90000`
rerun passed all three cases, each in 7–15 seconds. No repository timeout or CI
configuration changed. Browser storage was isolated; no user data, brand
assets or Docker services were removed. No commit or push was performed.

[WorkspaceEntityIcons]: ../../apps/web/src/components/icons/WorkspaceEntityIcons.ts
[RoutineTaskGraphNode]: ../../apps/web/src/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskGraphNode.tsx
[RoutineTaskStatusDot]: ../../apps/web/src/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot.tsx
[SupportedIcon]: ../../shared/api/interfaces/enums/supportedIcon.enum.ts
[RoutineRecordTable]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineRecordTable/RoutineRecordTable.tsx
[NotificationPopover]: ../../apps/web/src/components/popovers/NotificationPopover.tsx
[NotificationDialog]: ../../apps/web/src/components/dialogs/NotificationDialog.tsx
[Toaster]: ../../apps/web/src/components/ui/toaster.tsx
[Toast]: ../../apps/web/src/components/ui/toast.tsx
[APIReference]: ../../apps/web/src/pages/document/APIReference.tsx
[ArticleNavigation]: ../../apps/web/src/components/commons/Article/ArticleNavigation.tsx
[HomePage]: ../../apps/web/src/pages/home/HomePage.tsx
[RoutineTable]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineTable/RoutineTable.tsx
[RoutineMenu]: ../../apps/web/src/components/menus/RoutineMenu/RoutineMenuItem.tsx
[CodeExamplePanel]: ../../apps/web/src/components/panels/CodeExamplePanel/CodeExamplePanel.tsx
[CodeBlock]: ../../apps/web/src/components/ui/code-block.tsx
[TimeRails]: ../../apps/web/src/components/core/RoutineOverviewer/TimeRails/TimeRails.tsx
[BlockPackEditorSchema]: ../../apps/web/src/components/core/BlockPackEditor/BlockPackEditorSchema.tsx
[DatePicker]: ../../apps/web/src/components/commons/DatePicker/DatePicker.tsx
[ProfileTab]: ../../apps/web/src/pages/app/setting/account/tabs/ProfileTab.tsx
[RoutineCharts]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineCharts/RoutineCharts.tsx
[RoutineScopeBar]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineScopeBar/RoutineScopeBar.tsx
[Checkbox]: ../../apps/web/src/components/ui/checkbox.tsx
[SupportedIconTable]: ../../apps/web/src/components/commons/SupportedIconTable/SupportedIconTable.tsx
[GuideWidget]: ../../apps/web/src/components/widgets/guide/GuideWidget.tsx
[VersionCard]: ../../apps/web/src/components/commons/VersionCard/VersionCard.tsx
[Select]: ../../apps/web/src/components/ui/select.tsx
[Calendar]: ../../apps/web/src/components/ui/calendar.tsx
[ContextMenu]: ../../apps/web/src/components/ui/context-menu.tsx
[ItemPath]: ../../apps/web/src/components/paths/ItemPath/ItemPath.tsx
[CreateRoutineTaskDialog]: ../../apps/web/src/components/dialogs/StationRoutineDialog/CreateRoutineTaskDialog.tsx
[DashboardPage]: ../../apps/web/src/pages/app/dashboard/DashboardPage.tsx
[TimezoneSelector]: ../../apps/web/src/components/commons/TimezoneSelector/TimezoneSelector.tsx
[DropdownMenu]: ../../apps/web/src/components/ui/dropdown-menu.tsx
[AboutTab]: ../../apps/web/src/pages/app/setting/preferences/tabs/AboutTab.tsx
[TimePicker]: ../../apps/web/src/components/commons/TimePicker/TimePicker.tsx
[ArticleCommand]: ../../apps/web/src/components/commons/Article/ArticleCommand.tsx
[RoutineTaskMenu]: ../../apps/web/src/components/menus/RoutineTaskMenu/RoutineTaskMenuItem.tsx
[RootShelfMenu]: ../../apps/web/src/components/menus/RootShelfMenu/RootShelfMenuItem.tsx
[StationMenu]: ../../apps/web/src/components/menus/StationMenu/StationMenuItem.tsx
[UpgradeTab]: ../../apps/web/src/pages/app/setting/account/tabs/UpgradeTab.tsx
[GraphToolbar]: ../../apps/web/src/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphToolbar.tsx
[MaterialPDFViewer]: ../../apps/web/src/components/core/MaterialViewer/MaterialPDFViewerContent.tsx
[Extendable]: ../../apps/web/src/components/commons/Extendable/Extendable.tsx
[MaterialMenu]: ../../apps/web/src/components/menus/MaterialMenu/MaterialMenuItem.tsx
[PrivacyPolicyPage]: ../../apps/web/src/pages/privacy-policy/PrivacyPolicyPage.tsx
[MaterialViewerFrame]: ../../apps/web/src/components/core/MaterialViewer/MaterialViewerFrame.tsx
[SubShelfMenu]: ../../apps/web/src/components/menus/SubShelfMenu/SubShelfMenuItem.tsx
[TemplateEditor]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/CreateBlockPackPayloadEditor/CreateBlockPackPayloadTemplateEditor.tsx
[Versions]: ../../apps/web/src/pages/document/Versions.tsx
[Resizable]: ../../apps/web/src/components/ui/resizable.tsx
[TodoWidget]: ../../apps/web/src/components/widgets/basic/TodoWidget/TodoWidget.tsx
[PrivacyTab]: ../../apps/web/src/pages/app/setting/preferences/tabs/PrivacyTab.tsx
[PreferencesContent]: ../../apps/web/src/pages/app/setting/preferences/PreferencesPageContent.tsx
[RoutineTaskRecordTable]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineTaskRecordTable/RoutineTaskRecordTable.tsx
[BlockPackEditorContent]: ../../apps/web/src/components/core/BlockPackEditor/BlockPackEditorContent.tsx
[APIKey]: ../../apps/web/src/pages/document/APIKey.tsx
[AppSidebar]: ../../apps/web/src/components/sidebar/AppSidebar/AppSidebar.tsx
[Spinner]: ../../apps/web/src/components/ui/spinner.tsx
[GraphCanvas]: ../../apps/web/src/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphCanvas.tsx
[AccountSettingsPage]: ../../apps/web/src/pages/app/setting/account/AccountSettingsPage.tsx
[Breadcrumb]: ../../apps/web/src/components/ui/breadcrumb.tsx
[ColorSelector]: ../../apps/web/src/components/commons/ColorSelector/ColorSelector.tsx
[Sidebar]: ../../apps/web/src/components/ui/sidebar.tsx
[Editable]: ../../apps/web/src/components/commons/Editable/Editable.tsx
[TemplatePatternEditor]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/TemplatePatternEditor.tsx
[BrowserPermissionsTab]: ../../apps/web/src/pages/app/setting/preferences/tabs/BrowserPermissionsTab.tsx
[Command]: ../../apps/web/src/components/ui/command.tsx
[PrivacyPolicy]: ../../apps/web/src/pages/document/PrivacyPolicy.tsx
[TrashPage]: ../../apps/web/src/pages/app/trash/TrashPage.tsx
[ParticipantsDropdown]: ../../apps/web/src/components/core/BlockPackEditor/BlockPackParticipantsDropdown.tsx
[ShelfSharingDialog]: ../../apps/web/src/components/dialogs/ShelfSharingDialog/ShelfSharingOverviewDialog.tsx
[OfflineTab]: ../../apps/web/src/pages/app/setting/account/tabs/OfflineTab.tsx
[Closeable]: ../../apps/web/src/components/commons/Closeable/Closeable.tsx
[Dialog]: ../../apps/web/src/components/ui/dialog.tsx
[AvatarIcon]: ../../apps/web/src/components/icons/AvatarIcon.tsx
[EmptyShelfIcon]: ../../apps/web/src/components/icons/EmptyShelfIcon.tsx
[LanguageIcon]: ../../apps/web/src/components/icons/LanguageIcon.tsx
[NoteIcon]: ../../apps/web/src/components/icons/NoteIcon.tsx
[OAuthIcon]: ../../apps/web/src/components/icons/OAuthIcon.tsx
[AuthPanel]: ../../apps/web/src/components/panels/AuthPanel/AuthPanel.tsx
[PublicAvatarImage]: ../../apps/web/src/components/icons/PublicAvatarImage.tsx
[ShelfCaseIcon]: ../../apps/web/src/components/icons/ShelfCaseIcon.tsx
[ShelfIcon]: ../../apps/web/src/components/icons/ShelfIcon.tsx
[ThemeIcon]: ../../apps/web/src/components/icons/ThemeIcon.tsx
[TrainStationIcon]: ../../apps/web/src/components/icons/TrainStationIcon.tsx
[LoadingIndicator]: ../../apps/web/src/components/covers/LoadingCover/LoadingIndicator.tsx
[Ring]: ../../apps/web/src/components/ui/ring.tsx
[ClockWidget]: ../../apps/web/src/components/widgets/basic/ClockWidget/ClockWidget.tsx
[ChartFrame]: ../../shared/charts/components/ChartFrame.tsx

[RecordFilters]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineRecordFilters/RoutineRecordFilters.tsx

[RoutineSearchOrder]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineSearchOrder/RoutineSearchOrder.tsx
[RoutineTaskTable]: ../../apps/web/src/components/core/RoutineOverviewer/RoutineTaskTable/RoutineTaskTable.tsx

[LocalDBRecoveryCover]: ../../apps/web/src/components/covers/LocalDBRecoveryCover/LocalDBRecoveryCover.tsx
