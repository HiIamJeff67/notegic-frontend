// Existing web and shared modules the desktop webview runs unchanged.
// Do not fork these modules into apps/desktop.
// biome-ignore-all assist/source/organizeImports: the identifier order matches this generated list.

import * as source0 from "@/api/adapters/exceptionSerialization.adapter";
import * as source1 from "@/api/availability";
import * as source2 from "@/api/bridges/session.bridge";
import * as source3 from "@/api/clientHeaders";
import * as source4 from "@/api/graphql/hooks/useSearchBlocks";
import * as source5 from "@/api/graphql/hooks/useSearchRoutineRecords";
import * as source6 from "@/api/graphql/hooks/useSearchRoutineTaskRecords";
import * as source7 from "@/api/graphql/hooks/useSearchUsers";
import * as source8 from "@/api/hooks/visualize.hook";
import * as source9 from "@/api/invokers/visualize.invoker";
import * as source10 from "@/api/local/policy";
import * as source11 from "@/api/local/schemas/blockPack.schema";
import * as source12 from "@/api/local/schemas/enums/transaction_action_type.enum";
import * as source13 from "@/api/local/schemas/enums/transaction_entity_type.enum";
import * as source14 from "@/api/local/schemas";
import * as source15 from "@/api/local/schemas/item.schema";
import * as source16 from "@/api/local/schemas/material.schema";
import * as source17 from "@/api/local/schemas/rootShelf.schema";
import * as source18 from "@/api/local/schemas/routine.schema";
import * as source19 from "@/api/local/schemas/routineTag.schema";
import * as source20 from "@/api/local/schemas/routineTask.schema";
import * as source21 from "@/api/local/schemas/routineTaskDependency.schema";
import * as source22 from "@/api/local/schemas/routineTaskDependencyGraphDraft.schema";
import * as source23 from "@/api/local/schemas/routinesToItems.schema";
import * as source24 from "@/api/local/schemas/routinesToTags.schema";
import * as source25 from "@/api/local/schemas/routinesToTasks.schema";
import * as source26 from "@/api/local/schemas/station.schema";
import * as source27 from "@/api/local/schemas/subShelf.schema";
import * as source28 from "@/api/local/schemas/test.schema";
import * as source29 from "@/api/local/schemas/transaction.schema";
import * as source30 from "@/api/local/schemas/user.schema";
import * as source31 from "@/api/local/schemas/userSetting.schema";
import * as source32 from "@/api/local/schemas/usersToShelves.schema";
import * as source33 from "@/api/local/schemas/usersToStations.schema";
import * as source34 from "@/api/policies/availablity.policy";
import * as source35 from "@/api/policies/searchItems.policy";
import * as source36 from "@/api/policies/searchPagination.policy";
import * as source37 from "@/api/policies/searchQueryFields.policy";
import * as source38 from "@/api/policies/searchRootShelves.policy";
import * as source39 from "@/api/policies/searchRoutineTags.policy";
import * as source40 from "@/api/policies/searchRoutineTasks.policy";
import * as source41 from "@/api/policies/searchRoutines.policy";
import * as source42 from "@/api/policies/searchStations.policy";
import * as source43 from "@/api/turnstile";
import * as source44 from "@/api/websocketClient";
import * as source45 from "@/components/backgrounds/GridBackground/GridBackground";
import * as source46 from "@/components/backgrounds/LazyBackground/LazyBackground";
import * as source47 from "@/components/backgrounds/PlaceableBackground/PlaceableBackground";
import * as source48 from "@/components/backgrounds/PlaceableBackground/PlaceableFrame";
import * as source49 from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import * as source50 from "@/components/backgrounds/TerrainBackground/TerrainGridFloor";
import * as source51 from "@/components/backgrounds/TerrainBackground/TerrainPointCloud";
import * as source52 from "@/components/backgrounds/TerrainBackground/terrain.data";
import * as source53 from "@/components/backgrounds/TerrainBackground/terrain.worker";
import * as source54 from "@/components/charts/BarChart/BarChart";
import * as source55 from "@/components/charts/BaseChart/BaseChart";
import * as source56 from "@/components/charts/BaseChart/BaseChart.type";
import * as source57 from "@/components/charts/ChartFrame/ChartFrame";
import * as source58 from "@/components/charts/ColumnChart/ColumnChart";
import * as source59 from "@/components/charts/LineChart/LineChart";
import * as source60 from "@/components/charts/PieChart/PieChart";
import * as source61 from "@/components/charts/PieChart/PieChart.type";
import * as source62 from "@/components/charts/cartesian";
import * as source63 from "@/components/charts/chart.type";
import * as source64 from "@/components/charts/color";
import * as source65 from "@/components/charts/defaults";
import * as source66 from "@/components/charts/domain";
import * as source67 from "@/components/charts";
import * as source68 from "@/components/charts/scale";
import * as source69 from "@/components/charts/svgText";
import * as source70 from "@/components/charts/ticks";
import * as source71 from "@/components/commons/Article/ArticleContext";
import * as source72 from "@/components/commons/Article/ArticleFieldList";
import * as source73 from "@/components/commons/Article/ArticleInlineText";
import * as source74 from "@/components/commons/Article/ArticleMethodBadge";
import * as source75 from "@/components/commons/Article/ArticleSections";
import * as source76 from "@/components/commons/Article/ArticleSettingItem";
import * as source77 from "@/components/commons/Article/ArticleVideo";
import * as source78 from "@/components/commons/Closeable/Closeable";
import * as source79 from "@/components/commons/CloudflareTurnstile/CloudflareTurnstile";
import * as source80 from "@/components/commons/ColorPicker/ColorPicker";
import * as source81 from "@/components/commons/ContainableSelect/ContainableSelect";
import * as source82 from "@/components/commons/DNDable/VerticalDNDable";
import * as source83 from "@/components/commons/DNDable/dnd.type";
import * as source84 from "@/components/commons/DatePicker/DatePicker";
import * as source85 from "@/components/commons/DeferredSuspense/DeferredSuspense";
import * as source86 from "@/components/commons/Draggable/Draggable";
import * as source87 from "@/components/commons/DropFileZone/DropFileZone";
import * as source88 from "@/components/commons/Droppable/Droppable";
import * as source89 from "@/components/commons/Editable/Editable";
import * as source90 from "@/components/commons/Extendable/Extendable";
import * as source91 from "@/components/commons/Image/Image";
import * as source92 from "@/components/commons/ImageCropper/ImageCropper";
import * as source93 from "@/components/commons/MonthlyDayPicker/MonthlyDayPicker";
import * as source94 from "@/components/commons/Resizable/HeightResizable";
import * as source95 from "@/components/commons/Resizable/WidthResizable";
import * as source96 from "@/components/commons/Resizable/XYResizable";
import * as source97 from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import * as source98 from "@/components/commons/SeparatableTable/SeparatableTable";
import * as source99 from "@/components/commons/SupportedIconTable/SupportedIconTable";
import * as source100 from "@/components/commons/TimePicker/TimePicker";
import * as source101 from "@/components/commons/TimezoneSelector/TimezoneSelector";
import * as source102 from "@/components/commons/TruncatedText/TruncatedText";
import * as source103 from "@/components/commons/VersionCard/VersionCard";
import * as source104 from "@/components/commons/WeekdayPicker/WeekdayPicker";
import * as source105 from "@/components/core/AppUtilitiesWrapper/AppCommand/AppCommandContent";
import * as source106 from "@/components/core/AppUtilitiesWrapper/AppCommand/AppCommandPath";
import * as source107 from "@/components/core/BlockPackEditor/BlockSideMenu";
import * as source108 from "@/components/core/BlockPackEditor/PatternToggleButton";
import * as source109 from "@/components/core/BlockPackEditor/SuggestionMenu";
import * as source110 from "@/components/core/RoutineOverviewer/RoutineCharts/ChartWidgetFrame";
import * as source111 from "@/components/core/RoutineOverviewer/RoutineCharts/RoutineChartsSkeleton";
import * as source112 from "@/components/core/RoutineOverviewer/RoutineOverviewerContentSkeleton";
import * as source113 from "@/components/core/RoutineOverviewer/RoutineRecordFilters/RoutineRecordFilters";
import * as source114 from "@/components/core/RoutineOverviewer/RoutineScopeBar/RoutineScopeBarSkeleton";
import * as source115 from "@/components/core/RoutineOverviewer/RoutineSearchOrder/RoutineSearchOrder";
import * as source116 from "@/components/core/RoutineOverviewer/RoutineTable/RoutineTableSkeleton";
import * as source117 from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/CreateBlockPackPayloadEditor/CreateBlockPackPayloadTemplateEditor";
import * as source118 from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/FormPayloadEditor";
import * as source119 from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/JsonRoutineTaskPayloadEditor";
import * as source120 from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/TemplatePatternEditor";
import * as source121 from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/UpdateBlockPackPayloadEditor/UpdateBlockPackPayloadEditor";
import * as source122 from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/UpdateRoutinePayloadEditor/UpdateRoutinePayloadEditor";
import * as source123 from "@/components/core/RoutineOverviewer/RoutineTaskRecordTable/RoutineTaskRecordTableSkeleton";
import * as source124 from "@/components/core/RoutineOverviewer/RoutineTaskTable/RoutineTaskTableSkeleton";
import * as source125 from "@/components/core/RoutineOverviewer/TimeRails/TimeRailsSkeleton";
import * as source126 from "@/components/core/RoutineOverviewer/TimeRails/TimeRailsStationBarItem";
import * as source127 from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphToolbar";
import * as source128 from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyInspector";
import * as source129 from "@/components/covers/LoadingCover/AppLoadingCover";
import * as source130 from "@/components/covers/LoadingCover/LoadingCover";
import * as source131 from "@/components/covers/LoadingCover/LoadingIndicator";
import * as source132 from "@/components/dialogs/ImageDialog/CropImageDialog";
import * as source133 from "@/components/dialogs/ImageDialog/UploadImageDialog";
import * as source134 from "@/components/dialogs/ShelfItemDialogs/AddShelfCollaboratorDialog/AddShelfCollaboratorDialog";
import * as source135 from "@/components/dialogs/ShelfItemDialogs/ShelfSharingOverviewDialog/ShelfSharingOverviewDialog";
import * as source136 from "@/components/dialogs/StationRoutineDialogs/CreateRoutineDialog/CreateRoutineDialogSkeleton";
import * as source137 from "@/components/dialogs/StationRoutineDialogs/CreateRoutineTagDialog/CreateRoutineTagDialogSkeleton";
import * as source138 from "@/components/dialogs/StationRoutineDialogs/CreateRoutineTaskDialog/CreateRoutineTaskDialogSkeleton";
import * as source139 from "@/components/dialogs/StationRoutineDialogs/CreateStationDialog/CreateStationDialogSkeleton";
import * as source140 from "@/components/dialogs/StationRoutineDialogs/RoutineTaskRecordDialog/RoutineTaskRecordDialogSkeleton";
import * as source141 from "@/components/dialogs/WidgetDialog/CreateWidgetDialog";
import * as source142 from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import * as source143 from "@/components/holders/MapPlaceholder";
import * as source144 from "@/components/holders/WrapPlaceholder";
import * as source145 from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import * as source146 from "@/components/icons/AvatarIcon";
import * as source147 from "@/components/icons/LanguageIcon";
import * as source148 from "@/components/icons/NoteIcon";
import * as source149 from "@/components/icons/OAuthIcon";
import * as source150 from "@/components/icons/PublicAvatarImage";
import * as source151 from "@/components/icons/ShelfCaseIcon";
import * as source152 from "@/components/icons/ShelfIcon";
import * as source153 from "@/components/icons/ThemeIcon";
import * as source154 from "@/components/icons/TrainStationIcon";
import * as source155 from "@/components/icons/WorkspaceEntityIcons";
import * as source156 from "@/components/icons/iconProps.type";
import * as source157 from "@/components/inputs/DebouncedInput";
import * as source158 from "@/components/inspectors/InspectorLoadingCover";
import * as source159 from "@/components/menus/BlockPackMenu/BlockPackMenuItemSkeleton";
import * as source160 from "@/components/menus/HomeMenu/HomeMenuSection";
import * as source161 from "@/components/menus/HomeMenu/LanguageMenu";
import * as source162 from "@/components/menus/HomeMenu/SelectionDot";
import * as source163 from "@/components/menus/MaterialMenu/MaterialMenuItemSkeleton";
import * as source164 from "@/components/menus/RootShelfMenu/RootShelfMenuItemSkeleton";
import * as source165 from "@/components/menus/RoutineMenu/RoutineMenuItemSkeleton";
import * as source166 from "@/components/menus/RoutineTagMenu/RoutineTagMenuItemSkeleton";
import * as source167 from "@/components/menus/RoutineTaskMenu/RoutineTaskMenuItemSkeleton";
import * as source168 from "@/components/menus/SettingMenu/SettingMenu";
import * as source169 from "@/components/menus/SettingMenu/SettingMenuButton";
import * as source170 from "@/components/menus/StationMenu/StationMenuItemSkeleton";
import * as source171 from "@/components/menus/SubShelfMenu/SubShelfMenuItemSkeleton";
import * as source172 from "@/components/panels/AuthPanel/AuthPanel";
import * as source173 from "@/components/panels/CodeExamplePanel/CodeExample";
import * as source174 from "@/components/panels/CodeExamplePanel/CodeExamplePanel";
import * as source175 from "@/components/popovers/NotificationDetailPopover";
import * as source176 from "@/components/ui/accordion";
import * as source177 from "@/components/ui/aspect-ratio";
import * as source178 from "@/components/ui/avatar";
import * as source179 from "@/components/ui/breadcrumb";
import * as source180 from "@/components/ui/button-group";
import * as source181 from "@/components/ui/button";
import * as source182 from "@/components/ui/calendar";
import * as source183 from "@/components/ui/card";
import * as source184 from "@/components/ui/checkbox";
import * as source185 from "@/components/ui/code-block";
import * as source186 from "@/components/ui/collapsible";
import * as source187 from "@/components/ui/command";
import * as source188 from "@/components/ui/context-menu";
import * as source189 from "@/components/ui/dialog";
import * as source190 from "@/components/ui/dropdown-menu";
import * as source191 from "@/components/ui/form";
import * as source192 from "@/components/ui/hover-card";
import * as source193 from "@/components/ui/input-group";
import * as source194 from "@/components/ui/input";
import * as source195 from "@/components/ui/label";
import * as source196 from "@/components/ui/marker";
import * as source197 from "@/components/ui/menubar";
import * as source198 from "@/components/ui/popover";
import * as source199 from "@/components/ui/progress";
import * as source200 from "@/components/ui/resizable";
import * as source201 from "@/components/ui/ring";
import * as source202 from "@/components/ui/select";
import * as source203 from "@/components/ui/separator";
import * as source204 from "@/components/ui/sheet";
import * as source205 from "@/components/ui/sidebar";
import * as source206 from "@/components/ui/skeleton";
import * as source207 from "@/components/ui/slider";
import * as source208 from "@/components/ui/spinner";
import * as source209 from "@/components/ui/switch";
import * as source210 from "@/components/ui/table";
import * as source211 from "@/components/ui/tabs";
import * as source212 from "@/components/ui/textarea";
import * as source213 from "@/components/ui/toast";
import * as source214 from "@/components/ui/toaster";
import * as source215 from "@/components/ui/toggle-group";
import * as source216 from "@/components/ui/toggle";
import * as source217 from "@/components/ui/tooltip";
import * as source218 from "@/components/widgets/basic/CalendarWidget/CalendarWidget";
import * as source219 from "@/components/widgets/basic/ClockWidget/ClockWidget";
import * as source220 from "@/components/widgets/basic/ClockWidget/EditClockWidgetDialog";
import * as source221 from "@/components/widgets/basic/ClockWidget/EditClockWidgetDialogContent";
import * as source222 from "@/components/widgets/basic/ClockWidget/data/clockStyles";
import * as source223 from "@/components/widgets/basic/ClockWidget/data/timeZones";
import * as source224 from "@/components/widgets/basic/ClockWidget/setting/clockSetting";
import * as source225 from "@/components/widgets/basic/ScratchPadWidget/EditScratchPadWidgetDialog";
import * as source226 from "@/components/widgets/basic/ScratchPadWidget/EditScratchPadWidgetDialogContent";
import * as source227 from "@/components/widgets/basic/ScratchPadWidget/ScratchPadWidget";
import * as source228 from "@/components/widgets/basic/ScratchPadWidget/data/scratchPadData";
import * as source229 from "@/components/widgets/basic/ScratchPadWidget/setting/scratchPadSetting";
import * as source230 from "@/components/widgets/basic/TimerWidget/EditTimerWidgetDialog";
import * as source231 from "@/components/widgets/basic/TimerWidget/EditTimerWidgetDialogContent";
import * as source232 from "@/components/widgets/basic/TimerWidget/TimerWidget";
import * as source233 from "@/components/widgets/basic/TimerWidget/data/timerData";
import * as source234 from "@/components/widgets/basic/TimerWidget/setting/timerSetting";
import * as source235 from "@/components/widgets/basic/TodoWidget/EditTodoWidgetDialog";
import * as source236 from "@/components/widgets/basic/TodoWidget/EditTodoWidgetDialogContent";
import * as source237 from "@/components/widgets/basic/TodoWidget/TodoWidget";
import * as source238 from "@/components/widgets/basic/TodoWidget/data/todoData";
import * as source239 from "@/components/widgets/basic/TodoWidget/setting/todoSetting";
import * as source240 from "@/components/widgets/basic/basic";
import * as source241 from "@/components/widgets/guide/GuideWidget";
import * as source242 from "@/components/widgets/guide/VideoGuideWidget";
import * as source243 from "@/components/widgets/guide/data/guideData";
import * as source244 from "@/components/widgets/layout";
import * as source245 from "@/components/widgets/widget";
import * as source246 from "@/hooks/useAnyTypeState";
import * as source247 from "@/hooks/useAppRouter";
import * as source248 from "@/hooks/useBackgroundImages";
import * as source249 from "@/hooks/useDebounce";
import * as source250 from "@/hooks/useDeferredMount";
import * as source251 from "@/hooks/useHighlightedCode";
import * as source252 from "@/hooks/useLoading";
import * as source253 from "@/hooks/useMaterialAttachmentCache";
import * as source254 from "@/hooks/useMobile";
import * as source255 from "@/hooks/useNetwork";
import * as source256 from "@/hooks/usePageTitle";
import * as source257 from "@/hooks/usePerformance";
import * as source258 from "@/hooks/useResizeSidebar";
import * as source259 from "@/hooks/useScreen";
import * as source260 from "@/hooks/useSettingDisplay";
import * as source261 from "@/hooks/useTheme";
import * as source262 from "@/hooks/useThemeStore";
import * as source263 from "@/hooks/useTranslation";
import * as source264 from "@/i18n";
import * as source265 from "@/i18next.d";
import * as source266 from "@/pages/RootNotFoundPage";
import * as source267 from "@/pages/app/block-pack-editor/BlockPackEditorNotFoundPage";
import * as source268 from "@/pages/app/material-viewer/MaterialViewerNotFoundPage";
import * as source269 from "@/pages/app/routines/RoutinesLayout";
import * as source270 from "@/pages/contact/ContactPage";
import * as source271 from "@/pages/document/api/generated";
import * as source272 from "@/pages/document/versions/generated";
import * as source273 from "@/pages/eula/EulaPage";
import * as source274 from "@/providers/AppRouterProvider";
import * as source275 from "@/providers/BackgroundImagesProvider";
import * as source276 from "@/providers/LoadingProvider";
import * as source277 from "@/providers/MaterialAttachmentCacheProvider";
import * as source278 from "@/providers/PerformanceProvider";
import * as source279 from "@/providers/ResizeSidebarProvider";
import * as source280 from "@/providers/ScreenProvider";
import * as source281 from "@/providers/SettingsDisplayProvider";
import * as source282 from "@/providers/StationRoutineProvider/routineNode.type";
import * as source283 from "@/providers/StationRoutineProvider/routineTagNode.type";
import * as source284 from "@/providers/StationRoutineProvider/routineTaskNode.type";
import * as source285 from "@/providers/StationRoutineProvider/stationNode.type";
import * as source286 from "@/providers/ThemeProvider";
import * as source287 from "@/seo/pageTitle";
import * as source288 from "@/seo/publicPage";
import * as source289 from "@shared/api/exceptions/auth.exception";
import * as source290 from "@shared/api/exceptions/client/fetch.exception";
import * as source291 from "@shared/api/exceptions/client/localDatabase.exception";
import * as source292 from "@shared/api/exceptions/client/realtime.exception";
import * as source293 from "@shared/api/exceptions/client/validation.exception";
import * as source294 from "@shared/api/exceptions/database.exception";
import * as source295 from "@shared/api/exceptions/errors/fetch.error";
import * as source296 from "@shared/api/exceptions/errors";
import * as source297 from "@shared/api/exceptions/errors/localDatabase.error";
import * as source298 from "@shared/api/exceptions/errors/validation.error";
import * as source299 from "@shared/api/exceptions";
import * as source300 from "@shared/api/exceptions/network.exception";
import * as source301 from "@shared/api/exceptions/user.exception";
import * as source302 from "@shared/api/graphql/conversions";
import * as source303 from "@shared/api/graphql/generated/fragment-masking";
import * as source304 from "@shared/api/graphql/generated/gql";
import * as source305 from "@shared/api/graphql/generated/graphql";
import * as source306 from "@shared/api/graphql/generated";
import * as source307 from "@shared/api/interfaces/apiKey.interface";
import * as source308 from "@shared/api/interfaces/auth.interface";
import * as source309 from "@shared/api/interfaces/block.interface";
import * as source310 from "@shared/api/interfaces/blockPack.interface";
import * as source311 from "@shared/api/interfaces/context.interface";
import * as source312 from "@shared/api/interfaces/enums/accessControlPermission.enum";
import * as source313 from "@shared/api/interfaces/enums/badgeType.enum";
import * as source314 from "@shared/api/interfaces/enums/blockType.enum";
import * as source315 from "@shared/api/interfaces/enums/country.enum";
import * as source316 from "@shared/api/interfaces/enums/countryCode.enum";
import * as source317 from "@shared/api/interfaces/enums";
import * as source318 from "@shared/api/interfaces/enums/itemType.enum";
import * as source319 from "@shared/api/interfaces/enums/language.enum";
import * as source320 from "@shared/api/interfaces/enums/materialContentType.enum";
import * as source321 from "@shared/api/interfaces/enums/realtimePermission.enum";
import * as source322 from "@shared/api/interfaces/enums/routinePeriod.enum";
import * as source323 from "@shared/api/interfaces/enums/routinePhase.enum";
import * as source324 from "@shared/api/interfaces/enums/routineRecordStatus.enum";
import * as source325 from "@shared/api/interfaces/enums/routineTaskPurpose.enum";
import * as source326 from "@shared/api/interfaces/enums/routineTaskRecordErrorCode.enum";
import * as source327 from "@shared/api/interfaces/enums/routineTaskRecordStatus.enum";
import * as source328 from "@shared/api/interfaces/enums/supportedIcon.enum";
import * as source329 from "@shared/api/interfaces/enums/userGender.enum";
import * as source330 from "@shared/api/interfaces/enums/userPlan.enum";
import * as source331 from "@shared/api/interfaces/enums/userRole.enum";
import * as source332 from "@shared/api/interfaces/enums/userSettingDensity.enum";
import * as source333 from "@shared/api/interfaces/enums/userSettingStartSurface.enum";
import * as source334 from "@shared/api/interfaces/enums/userStatus.enum";
import * as source335 from "@shared/api/interfaces/feedback.interface";
import * as source336 from "@shared/api/interfaces/material.interface";
import * as source337 from "@shared/api/interfaces/notification.interface";
import * as source338 from "@shared/api/interfaces/realtime.interface";
import * as source339 from "@shared/api/interfaces/rootShelf.interface";
import * as source340 from "@shared/api/interfaces/routine.interface";
import * as source341 from "@shared/api/interfaces/routineTag.interface";
import * as source342 from "@shared/api/interfaces/routineTask.interface";
import * as source343 from "@shared/api/interfaces/routineTaskDependency.interface";
import * as source344 from "@shared/api/interfaces/routineTaskPayload.interface";
import * as source345 from "@shared/api/interfaces/routineTaskRecord.interface";
import * as source346 from "@shared/api/interfaces/station.interface";
import * as source347 from "@shared/api/interfaces/subShelf.interface";
import * as source348 from "@shared/api/interfaces/types/planLimitation.type";
import * as source349 from "@shared/api/interfaces/types/user.type";
import * as source350 from "@shared/api/interfaces/types/userQuota.type";
import * as source351 from "@shared/api/interfaces/user.interface";
import * as source352 from "@shared/api/interfaces/userAccount.interface";
import * as source353 from "@shared/api/interfaces/userInfo.interface";
import * as source354 from "@shared/api/interfaces/userQuota.interface";
import * as source355 from "@shared/api/interfaces/userSetting.interface";
import * as source356 from "@shared/api/interfaces/visualize.interface";
import * as source357 from "@shared/api/interfaces/workspaceInput.schema";
import * as source358 from "@shared/api/notificationCache";
import * as source359 from "@shared/api/queryClient";
import * as source360 from "@shared/api/queryHookOptions";
import * as source361 from "@shared/api/queryKeys";
import * as source362 from "@shared/api/retry";
import * as source363 from "@shared/api/url";
import * as source364 from "@shared/api/validation";
import * as source365 from "@shared/api/websocket";
import * as source366 from "@shared/api/websocket/types/channel.type";
import * as source367 from "@shared/api/websocket/types/channelStatus.type";
import * as source368 from "@shared/api/websocket/types/connectionState.type";
import * as source369 from "@shared/api/websocket/types/errorCode.type";
import * as source370 from "@shared/api/websocket/types/frames/ack.frame";
import * as source371 from "@shared/api/websocket/types/frames/binary.frame";
import * as source372 from "@shared/api/websocket/types/frames/error.frame";
import * as source373 from "@shared/api/websocket/types/frames/heartbeat.frame";
import * as source374 from "@shared/api/websocket/types/frames/notification.frame";
import * as source375 from "@shared/api/websocket/types/frames/ping.frame";
import * as source376 from "@shared/api/websocket/types/frames/pong.frame";
import * as source377 from "@shared/api/websocket/types/frames/presence.frame";
import * as source378 from "@shared/api/websocket/types/frames/ready.frame";
import * as source379 from "@shared/api/websocket/types/frames/resourceEvent.frame";
import * as source380 from "@shared/api/websocket/types/frames/routineTaskLifecycle.frame";
import * as source381 from "@shared/api/websocket/types/frames/server.frame";
import * as source382 from "@shared/api/websocket/types/frames/subscribe.frame";
import * as source383 from "@shared/api/websocket/types/frames/subscribed.frame";
import * as source384 from "@shared/api/websocket/types/frames/unsubscribe.frame";
import * as source385 from "@shared/api/websocket/types/frames/unsubscribed.frame";
import * as source386 from "@shared/api/websocket/types";
import * as source387 from "@shared/api/websocket/types/ticket.type";
import * as source388 from "@shared/api/websocket/version";
import * as source389 from "@shared/constants/defaultUser.constant";
import * as source390 from "@shared/constants";
import * as source391 from "@shared/constants/triggerLimitations.constant";
import * as source392 from "@shared/i18n/availableLanguages";
import * as source393 from "@shared/i18n/error";
import * as source394 from "@shared/i18n";
import * as source395 from "@shared/i18n/language";
import * as source396 from "@shared/i18n/locales/common.en";
import * as source397 from "@shared/i18n/locales/common.ja";
import * as source398 from "@shared/i18n/locales/common.ko";
import * as source399 from "@shared/i18n/locales/common.type";
import * as source400 from "@shared/i18n/locales/common.zh-CN";
import * as source401 from "@shared/i18n/locales/common.zh-TW";
import * as source402 from "@shared/i18n/locales/server.en";
import * as source403 from "@shared/i18n/locales/server.ja";
import * as source404 from "@shared/i18n/locales/server.ko";
import * as source405 from "@shared/i18n/locales/server.type";
import * as source406 from "@shared/i18n/locales/server.zh-CN";
import * as source407 from "@shared/i18n/locales/server.zh-TW";
import * as source408 from "@shared/i18n/locales/settings.en";
import * as source409 from "@shared/i18n/locales/settings.ja";
import * as source410 from "@shared/i18n/locales/settings.ko";
import * as source411 from "@shared/i18n/locales/settings.type";
import * as source412 from "@shared/i18n/locales/settings.zh-CN";
import * as source413 from "@shared/i18n/locales/settings.zh-TW";
import * as source414 from "@shared/i18n/locales/workspace.en";
import * as source415 from "@shared/i18n/locales/workspace.ja";
import * as source416 from "@shared/i18n/locales/workspace.ko";
import * as source417 from "@shared/i18n/locales/workspace.type";
import * as source418 from "@shared/i18n/locales/workspace.zh-CN";
import * as source419 from "@shared/i18n/locales/workspace.zh-TW";
import * as source420 from "@shared/i18n/tKeys/routinePeriod.tKey";
import * as source421 from "@shared/i18n/tKeys/routinePhase.tKey";
import * as source422 from "@shared/i18n/tKeys/routineRecordStatus.tKey";
import * as source423 from "@shared/i18n/tKeys/routineTaskPurpose.tKey";
import * as source424 from "@shared/i18n/tKeys/routineTaskRecordStatus.tKey";
import * as source425 from "@shared/lib/auth/oauthState.type";
import * as source426 from "@shared/lib/auth/tokenGenerator";
import * as source427 from "@shared/lib/blockpack/blockPackYjsCoordinator";
import * as source428 from "@shared/lib/blockpack/conversions";
import * as source429 from "@shared/lib/blockpack/editor";
import * as source430 from "@shared/lib/blockpack/extensions/codeblock";
import * as source431 from "@shared/lib/blockpack/extensions/collaboration";
import * as source432 from "@shared/lib/blockpack/extensions/heading";
import * as source433 from "@shared/lib/blockpack/extensions/syntaxHighlighting";
import * as source434 from "@shared/lib/blockpack";
import * as source435 from "@shared/lib/blockpack/localYjsDocumentStore";
import * as source436 from "@shared/lib/blockpack/mapping";
import * as source437 from "@shared/lib/browser/crossOriginIsolation";
import * as source438 from "@shared/lib/byte/byte.type";
import * as source439 from "@shared/lib/cache/LRUCache";
import * as source440 from "@shared/lib/classname/cn";
import * as source441 from "@shared/lib/code/codeHighlighter";
import * as source442 from "@shared/lib/comparisons/compareEntityNames";
import * as source443 from "@shared/lib/conversions/convertNullToUndefined";
import * as source444 from "@shared/lib/json/isJsonContext";
import * as source445 from "@shared/lib/list/linkedList";
import * as source446 from "@shared/lib/math/clamp";
import * as source447 from "@shared/lib/queue/deque";
import * as source448 from "@shared/lib/search/limits";
import * as source449 from "@shared/lib/search/searchPage";
import * as source450 from "@shared/lib/set/disjointSet";
import * as source451 from "@shared/lib/shelf/itemNodes.type";
import * as source452 from "@shared/lib/shelf/limits";
import * as source453 from "@shared/lib/shelf/rootShelf";
import * as source454 from "@shared/lib/shelf/shelfNodes.type";
import * as source455 from "@shared/lib/shelf/subShelf";
import * as source456 from "@shared/lib/shelf/summary.type";
import * as source457 from "@shared/lib/storage/indexedDB";
import * as source458 from "@shared/lib/storage/localStorage";
import * as source459 from "@shared/lib/storage/materialAttachmentCache.type";
import * as source460 from "@shared/lib/storage/sessionStorage";
import * as source461 from "@shared/lib/string/compare";
import * as source462 from "@shared/lib/theme/defaults";
import * as source463 from "@shared/lib/theme/theme.type";
import * as source464 from "@shared/lib/time/timeString";
import * as source465 from "@shared/lib/time/timezone";
import * as source466 from "@shared/lib/toast/toast";
import * as source467 from "@shared/lib/url/web";
import * as source468 from "@shared/lib/uuid/uuidv4.type";
import * as source469 from "@shared/reducers/blockPackMeta.reducer";
import * as source470 from "@shared/reducers/materialMeta.reducer";
import * as source471 from "@shared/types/cord";
import * as source472 from "@shared/types/imageInfo.type";
import * as source473 from "@shared/types/oauthProvider.type";
import * as source474 from "@shared/types/range.type";

export const existingWebviewSource = [
  source0,
  source1,
  source2,
  source3,
  source4,
  source5,
  source6,
  source7,
  source8,
  source9,
  source10,
  source11,
  source12,
  source13,
  source14,
  source15,
  source16,
  source17,
  source18,
  source19,
  source20,
  source21,
  source22,
  source23,
  source24,
  source25,
  source26,
  source27,
  source28,
  source29,
  source30,
  source31,
  source32,
  source33,
  source34,
  source35,
  source36,
  source37,
  source38,
  source39,
  source40,
  source41,
  source42,
  source43,
  source44,
  source45,
  source46,
  source47,
  source48,
  source49,
  source50,
  source51,
  source52,
  source53,
  source54,
  source55,
  source56,
  source57,
  source58,
  source59,
  source60,
  source61,
  source62,
  source63,
  source64,
  source65,
  source66,
  source67,
  source68,
  source69,
  source70,
  source71,
  source72,
  source73,
  source74,
  source75,
  source76,
  source77,
  source78,
  source79,
  source80,
  source81,
  source82,
  source83,
  source84,
  source85,
  source86,
  source87,
  source88,
  source89,
  source90,
  source91,
  source92,
  source93,
  source94,
  source95,
  source96,
  source97,
  source98,
  source99,
  source100,
  source101,
  source102,
  source103,
  source104,
  source105,
  source106,
  source107,
  source108,
  source109,
  source110,
  source111,
  source112,
  source113,
  source114,
  source115,
  source116,
  source117,
  source118,
  source119,
  source120,
  source121,
  source122,
  source123,
  source124,
  source125,
  source126,
  source127,
  source128,
  source129,
  source130,
  source131,
  source132,
  source133,
  source134,
  source135,
  source136,
  source137,
  source138,
  source139,
  source140,
  source141,
  source142,
  source143,
  source144,
  source145,
  source146,
  source147,
  source148,
  source149,
  source150,
  source151,
  source152,
  source153,
  source154,
  source155,
  source156,
  source157,
  source158,
  source159,
  source160,
  source161,
  source162,
  source163,
  source164,
  source165,
  source166,
  source167,
  source168,
  source169,
  source170,
  source171,
  source172,
  source173,
  source174,
  source175,
  source176,
  source177,
  source178,
  source179,
  source180,
  source181,
  source182,
  source183,
  source184,
  source185,
  source186,
  source187,
  source188,
  source189,
  source190,
  source191,
  source192,
  source193,
  source194,
  source195,
  source196,
  source197,
  source198,
  source199,
  source200,
  source201,
  source202,
  source203,
  source204,
  source205,
  source206,
  source207,
  source208,
  source209,
  source210,
  source211,
  source212,
  source213,
  source214,
  source215,
  source216,
  source217,
  source218,
  source219,
  source220,
  source221,
  source222,
  source223,
  source224,
  source225,
  source226,
  source227,
  source228,
  source229,
  source230,
  source231,
  source232,
  source233,
  source234,
  source235,
  source236,
  source237,
  source238,
  source239,
  source240,
  source241,
  source242,
  source243,
  source244,
  source245,
  source246,
  source247,
  source248,
  source249,
  source250,
  source251,
  source252,
  source253,
  source254,
  source255,
  source256,
  source257,
  source258,
  source259,
  source260,
  source261,
  source262,
  source263,
  source264,
  source265,
  source266,
  source267,
  source268,
  source269,
  source270,
  source271,
  source272,
  source273,
  source274,
  source275,
  source276,
  source277,
  source278,
  source279,
  source280,
  source281,
  source282,
  source283,
  source284,
  source285,
  source286,
  source287,
  source288,
  source289,
  source290,
  source291,
  source292,
  source293,
  source294,
  source295,
  source296,
  source297,
  source298,
  source299,
  source300,
  source301,
  source302,
  source303,
  source304,
  source305,
  source306,
  source307,
  source308,
  source309,
  source310,
  source311,
  source312,
  source313,
  source314,
  source315,
  source316,
  source317,
  source318,
  source319,
  source320,
  source321,
  source322,
  source323,
  source324,
  source325,
  source326,
  source327,
  source328,
  source329,
  source330,
  source331,
  source332,
  source333,
  source334,
  source335,
  source336,
  source337,
  source338,
  source339,
  source340,
  source341,
  source342,
  source343,
  source344,
  source345,
  source346,
  source347,
  source348,
  source349,
  source350,
  source351,
  source352,
  source353,
  source354,
  source355,
  source356,
  source357,
  source358,
  source359,
  source360,
  source361,
  source362,
  source363,
  source364,
  source365,
  source366,
  source367,
  source368,
  source369,
  source370,
  source371,
  source372,
  source373,
  source374,
  source375,
  source376,
  source377,
  source378,
  source379,
  source380,
  source381,
  source382,
  source383,
  source384,
  source385,
  source386,
  source387,
  source388,
  source389,
  source390,
  source391,
  source392,
  source393,
  source394,
  source395,
  source396,
  source397,
  source398,
  source399,
  source400,
  source401,
  source402,
  source403,
  source404,
  source405,
  source406,
  source407,
  source408,
  source409,
  source410,
  source411,
  source412,
  source413,
  source414,
  source415,
  source416,
  source417,
  source418,
  source419,
  source420,
  source421,
  source422,
  source423,
  source424,
  source425,
  source426,
  source427,
  source428,
  source429,
  source430,
  source431,
  source432,
  source433,
  source434,
  source435,
  source436,
  source437,
  source438,
  source439,
  source440,
  source441,
  source442,
  source443,
  source444,
  source445,
  source446,
  source447,
  source448,
  source449,
  source450,
  source451,
  source452,
  source453,
  source454,
  source455,
  source456,
  source457,
  source458,
  source459,
  source460,
  source461,
  source462,
  source463,
  source464,
  source465,
  source466,
  source467,
  source468,
  source469,
  source470,
  source471,
  source472,
  source473,
  source474,
] as const;
