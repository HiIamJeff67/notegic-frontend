import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import * as lucide from "lucide-react";
import ts from "typescript";
import ShelfIcon from "@/components/icons/ShelfIcon";
import TrainStationIcon from "@/components/icons/TrainStationIcon";
import * as entities from "@/components/icons/WorkspaceEntityIcons";

function readSources(directory: string): ts.SourceFile[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return ["node_modules", ".output", ".tanstack", "dist", "test"].includes(
        entry.name
      )
        ? []
        : readSources(file);
    }
    if (!/\.[cm]?[jt]sx?$/.test(file) || /\.(test|spec)\./.test(file))
      return [];
    return [
      ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true
      ),
    ];
  });
}

function getLucideNames(source: ts.SourceFile): string[] {
  return source.statements.flatMap(node => {
    if (
      !(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) ||
      !node.moduleSpecifier ||
      !ts.isStringLiteral(node.moduleSpecifier) ||
      node.moduleSpecifier.text !== "lucide-react" ||
      (ts.isImportDeclaration(node)
        ? node.importClause?.isTypeOnly
        : node.isTypeOnly)
    )
      return [];
    const bindings = ts.isImportDeclaration(node)
      ? node.importClause?.namedBindings
      : node.exportClause;
    if (!bindings || !("elements" in bindings))
      throw new Error(`Use named Lucide exports in ${source.fileName}`);
    return bindings.elements
      .filter(element => !element.isTypeOnly)
      .map(element => (element.propertyName ?? element.name).text);
  });
}

const sources = ["apps", "shared", "scripts"].flatMap(readSources);
const iconDirectory = "apps/web/src/components/icons";
const mapPath = "docs/conventions/icon-map.md";
const iconMap = readFileSync(mapPath, "utf8");

describe("application icon conventions", () => {
  test("entity aliases retain the canonical base components", () => {
    expect(entities.RootShelfIcon).toBe(ShelfIcon);
    expect(entities.StationIcon).toBe(TrainStationIcon);
    expect(entities.RoutineIcon).toBe(lucide.ClipboardClockIcon);
    expect(entities.RoutineTaskIcon).toBe(lucide.ClipboardListIcon);
    expect(entities.RoutineTaskStartIcon).toBe(lucide.GitFork);
    expect(entities.RoutineTaskActionIcon).toBe(lucide.SquareFunction);
    expect(entities.MaterialIcon).toBe(lucide.FileTextIcon);
    expect(entities.SubShelfIcon).toBe(lucide.FolderIcon);
    expect(entities.BlockPackIcon).toBe(lucide.PackageIcon);
    expect(entities.RoutineTagIcon).toBe(lucide.TagIcon);
  });

  test.each([
    ["pages/app/dashboard/DashboardPage.tsx", "SquarePen"],
    ["components/commons/Editable/Editable.tsx", "SquarePen"],
    [
      "components/core/RoutineTaskDependencyGraphEditor/RoutineTaskGraphNode.tsx",
      "SquarePen",
    ],
    [
      "components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphEditor.tsx",
      "SquarePen",
    ],
    [
      "components/core/RoutineOverviewer/RoutineTaskTable/RoutineTaskTable.tsx",
      "SquarePen",
    ],
    [
      "components/core/RoutineOverviewer/RoutineTaskPayloadEditors/TemplatePatternEditor.tsx",
      "SquarePen",
    ],
    ["components/menus/RoutineTaskMenu/RoutineTaskMenuItem.tsx", "SquarePen"],
    ["pages/home/HomePage.tsx", "BookOpenIcon"],
    ["components/sidebar/AppSidebar/AppSidebar.tsx", "BookOpenIcon"],
    ["components/commons/Article/ArticleNavigation.tsx", "BookOpenIcon"],
    ["components/commons/Article/ArticleCommand.tsx", "BookOpenIcon"],
    ["pages/app/material-viewer/MaterialViewerIndexPage.tsx", "BookOpenIcon"],
    [
      "pages/app/block-pack-editor/BlockPackEditorIndexPage.tsx",
      "BookOpenIcon",
    ],
    ["components/core/MaterialViewer/MaterialViewerFrame.tsx", "RefreshCw"],
    [
      "pages/app/setting/preferences/tabs/BrowserPermissionsTab.tsx",
      "RefreshCwIcon",
    ],
    ["pages/app/setting/preferences/tabs/AboutTab.tsx", "CopyIcon"],
    ["pages/app/setting/account/tabs/ApiKeysTab.tsx", "CopyIcon"],
  ])("%s uses the agreed %s glyph", (file, icon) => {
    const source = sources.find(
      source => source.fileName === `apps/web/src/${file}`
    );
    if (!source) throw new Error(`Missing production source: ${file}`);
    expect(getLucideNames(source)).toContain(icon);
    let used = false;
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) return;
      if (ts.isIdentifier(node) && node.text === icon) used = true;
      ts.forEachChild(node, visit);
    };
    visit(source);
    expect(used).toBe(true);
  });

  test("entity consumers cannot bypass their semantic aliases", () => {
    const bypasses = sources.flatMap(source =>
      source.fileName === `${iconDirectory}/WorkspaceEntityIcons.ts`
        ? []
        : getLucideNames(source)
            .filter(name =>
              /^(ClipboardClock|ClipboardList|FileText|Folder|Package|Tag|GitFork|SquareFunction)(Icon)?$/.test(
                name
              )
            )
            .map(name => `${source.fileName}: ${name}`)
    );
    expect(bypasses).toEqual([]);
    for (const source of sources) {
      if (source.fileName === `${iconDirectory}/WorkspaceEntityIcons.ts`)
        continue;
      const directCustomImports = source.statements.filter(
        node =>
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier) &&
          /\/(ShelfIcon|TrainStationIcon)$/.test(node.moduleSpecifier.text)
      );
      expect(directCustomImports.map(node => node.getText(source))).toEqual([]);
    }
  });

  test("the map covers exactly the active Lucide exports and valid alias groups", () => {
    const rows = iconMap
      .split("## Lucide inventory")[1]
      .split("## Custom components and wrappers")[0]
      .split("\n")
      .filter(row => row.startsWith("| `"));
    const recorded = rows.flatMap(row => {
      const names = [...row.split("|")[1].matchAll(/`([^`]+)`/g)].map(
        match => match[1]
      );
      for (const name of names) {
        expect(lucide).toHaveProperty(name);
        expect(lucide[name as keyof typeof lucide]).toBe(
          lucide[names[0] as keyof typeof lucide]
        );
      }
      return names;
    });
    const active = new Set(sources.flatMap(getLucideNames));
    expect(recorded.length).toBe(new Set(recorded).size);
    expect([...new Set(recorded)].sort()).toEqual([...active].sort());
    expect(iconMap).toContain(
      `${active.size} referenced export names / ${rows.length} distinct`
    );
  });

  test("custom component sources and local map links remain valid", () => {
    for (const file of readdirSync(iconDirectory)) {
      if (file.endsWith(".type.ts")) continue;
      expect(iconMap).toContain(`../../${iconDirectory}/${file}`);
      const name = path.parse(file).name;
      expect(
        sources.some(source =>
          source.statements.some(
            node =>
              (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
              node.moduleSpecifier &&
              ts.isStringLiteral(node.moduleSpecifier) &&
              node.moduleSpecifier.text.endsWith(`/${name}`)
          )
        )
      ).toBe(true);
    }
    for (const match of iconMap.matchAll(
      /(?:\[[^\]\n]+\]\(([^)]+)\)|^\[[^\]\n]+\]: (\S+))/gm
    )) {
      const target = match[1] ?? match[2];
      expect(existsSync(path.resolve(path.dirname(mapPath), target))).toBe(
        true
      );
    }
  });

  test("obsolete custom icons are removed rather than kept as duplicate wrappers", () => {
    for (const name of [
      "EditIcon",
      "ColorPaletteIcon",
      "MenuIcon",
      "MoonIcon",
      "SunIcon",
      "WideBookmarkIcon",
      "NotegicIcon",
    ]) {
      expect(existsSync(`${iconDirectory}/${name}.tsx`)).toBe(false);
      expect(
        sources.filter(source =>
          source.text.includes(`components/icons/${name}`)
        )
      ).toEqual([]);
    }
  });
});
