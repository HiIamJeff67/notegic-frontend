import { renderToStaticMarkup } from "react-dom/server";
import { VersionCard } from "./VersionCard";
import { versionRoadmap } from "./versions";

test("version labels use only the three public release states", () => {
  expect(versionRoadmap.map(version => version.label)).toEqual([
    "Next",
    "Current",
    "Legacy",
    "Legacy",
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
  expect(markup).toContain("tasks complete");
  expect(markup).toContain("content-start");
});
