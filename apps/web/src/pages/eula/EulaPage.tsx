import eulaMarkdown from "../../../../../LICENSE.md?raw";

const EulaPage = () => (
  <main className="mx-auto min-w-0 max-w-3xl px-6 py-12 text-foreground">
    <h1 className="mb-6 text-3xl font-bold">End User License Agreement</h1>
    <pre className="whitespace-pre-wrap">{eulaMarkdown}</pre>
  </main>
);

export default EulaPage;
