import { renderToStaticMarkup } from "react-dom/server";
import { versionRoadmap } from "@/pages/document/versions/generated";
import { VersionCard } from "./VersionCard";

test("version labels use only the four public development states", () => {
  expect(versionRoadmap.map(version => version.label)).toEqual([
    "Next",
    "Future",
    "Future",
    "Current",
    "Previous",
    "Previous",
  ]);
});

test.each(
  versionRoadmap
)("version $version keeps its card focused on description, progress and features", version => {
  const markup = renderToStaticMarkup(<VersionCard version={version} />);
  expect(markup).toContain(version.description.replaceAll("'", "&#x27;"));
  expect(markup).not.toContain(`v${version.version}`);
  expect(markup).not.toContain('data-slot="card-title"');
  expect(markup).not.toContain(`>${version.label}<`);
  expect(markup.match(/<li\b/g)).toHaveLength(4);
  expect(markup).toContain('aria-expanded="false"');
  expect(markup).toContain(`Show all ${version.tasks.length} features`);
  if (version.status === "future") {
    expect(markup).not.toContain("tasks complete");
    expect(markup).not.toContain("% complete");
  } else {
    expect(markup).toContain("tasks complete");
    expect(markup).toContain("100% complete");
  }
  expect(markup).toContain("content-start");
});

test("completed work remains checked while 0.3.0 is still the next release", () => {
  const next = versionRoadmap.find(version => version.version === "0.3.0")!;
  expect(next.label).toBe("Next");
  expect(next.tasks.every(task => task.completed)).toBe(true);
  const markup = renderToStaticMarkup(<VersionCard version={next} />);
  expect(markup.match(/lucide-circle-check/g)).toHaveLength(4);
});

test("future cards hide progress even if a planned task has been completed", () => {
  const future = versionRoadmap.find(version => version.status === "future")!;
  const markup = renderToStaticMarkup(
    <VersionCard
      version={{
        ...future,
        tasks: future.tasks.map(task => ({ ...task, completed: true })),
      }}
    />
  );
  expect(markup).not.toContain("tasks complete");
  expect(markup).not.toContain("% complete");
});
