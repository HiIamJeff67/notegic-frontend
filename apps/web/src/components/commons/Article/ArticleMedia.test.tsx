import { renderToStaticMarkup } from "react-dom/server";
import { ArticleImage } from "./ArticleImage";
import { ArticleVideo } from "./ArticleVideo";

jest.mock("@/global/styles/image.css", () => ({}));
jest.mock("@/hooks/useLocalPreferences", () => ({
  useLocalPreferences: () => ({ preferences: { reduceMotion: false } }),
}));
jest.mock("@shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

test("SSR loads video frames eagerly while deferring images and GIFs", () => {
  const props = {
    alt: "Example",
    caption: "Example",
    width: 1600,
    height: 1200,
  };
  const image = renderToStaticMarkup(
    <ArticleImage {...props} src="/example.jpg" />
  );
  expect(image).toContain('loading="lazy"');
  expect(image).toContain('decoding="async"');
  expect(image).toContain('data-loading-status="loading"');
  expect(image).toContain('data-slot="image"');
  expect(image).toContain('width="1600" height="1200"');
  const gif = renderToStaticMarkup(
    <ArticleImage {...props} src="/example.gif" animated />
  );
  expect(gif).not.toContain("<img");
  expect(gif).toContain("aspect-ratio:1600 / 1200");
  const video = renderToStaticMarkup(
    <ArticleVideo
      src="https://www.youtube-nocookie.com/embed/pH21Od0Io58"
      href="https://www.youtube.com/watch?v=pH21Od0Io58"
      title="Overview"
      caption="Video 01"
    />
  );
  expect(video).toContain("<iframe");
  expect(video).toContain('loading="eager"');
  expect(video).not.toContain('loading="lazy"');
  expect(video).toContain(
    'src="https://www.youtube-nocookie.com/embed/pH21Od0Io58"'
  );
  expect(video).not.toContain("<button");
  expect(video).not.toContain("<img");
  expect(video).toContain("https://www.youtube.com/watch?v=pH21Od0Io58");
});

test.each([
  "../malicious",
  "invalid?url=evil",
  "javascript:alert(1)",
  "http://player.example.test/embed/123",
  "data:text/html,unsafe",
  "",
])("invalid video URL %s cannot create an embedded or external destination", src => {
  expect(
    renderToStaticMarkup(
      <ArticleVideo src={src} title="Example" caption="Example" />
    )
  ).toBe("");
});

test("video embeds accept other HTTPS providers and reject an unsafe fallback", () => {
  const props = {
    src: "https://player.example.test/embed/123",
    title: "Example",
    caption: "Example",
  };
  expect(renderToStaticMarkup(<ArticleVideo {...props} />)).toContain(
    'href="https://player.example.test/embed/123"'
  );
  expect(
    renderToStaticMarkup(<ArticleVideo {...props} href="javascript:alert(1)" />)
  ).toBe("");
});
