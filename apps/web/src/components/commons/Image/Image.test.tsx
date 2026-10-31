import { renderToStaticMarkup } from "react-dom/server";
import Image from "./Image";

jest.mock("@/global/styles/image.css", () => ({}));

test("images start with native lazy loading and reserve the caller's dimensions", () => {
  const html = renderToStaticMarkup(
    <Image src="/cover.jpg" alt="Cover" width={1200} height={675} />
  );
  expect(html).toContain('loading="lazy"');
  expect(html).toContain('decoding="async"');
  expect(html).toContain('width="1200" height="675"');
  expect(html).toContain('data-loading-status="loading"');
  expect(html).toContain('data-reveal="true"');
  expect(html).toContain("--image-reveal-blur:8px");
  expect(html).toContain("--image-reveal-duration:350ms");
  expect(html).not.toContain("<div");
});

test("callers can override loading, reveal and responsive image attributes", () => {
  const html = renderToStaticMarkup(
    <Image
      src="/cover.jpg"
      alt="Cover"
      loading="eager"
      decoding="sync"
      fetchPriority="high"
      srcSet="/cover.jpg 800w, /large.jpg 1600w"
      sizes="100vw"
      reveal={false}
      blur={4}
      duration={200}
      style={{ objectFit: "cover" }}
    />
  );
  expect(html).toContain('loading="eager"');
  expect(html).toContain('decoding="sync"');
  expect(html).toContain('fetchPriority="high"');
  expect(html).toContain('srcSet="/cover.jpg 800w, /large.jpg 1600w"');
  expect(html).toContain('sizes="100vw"');
  expect(html).toContain('data-reveal="false"');
  expect(html).toContain("--image-reveal-blur:4px");
  expect(html).toContain("--image-reveal-duration:200ms");
  expect(html).toContain("object-fit:cover");
});
