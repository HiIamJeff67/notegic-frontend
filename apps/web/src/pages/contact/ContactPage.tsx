import { publicFacts, publicPages } from "@/seo/publicPage";

const ContactPage = () => {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL ?? "";
  const relatedPages = publicPages.filter(page => page.path !== "/contact");

  return (
    <main
      lang="en"
      className="mx-auto min-w-0 max-w-3xl px-6 py-12 text-foreground"
    >
      <h1 className="mb-4 text-3xl font-bold">Contact</h1>
      <p>{publicFacts.definition}</p>
      <p className="mt-4">{publicFacts.audience}</p>
      <p className="mt-4">
        {contactEmail ? (
          <>
            Email{" "}
            <a className="underline" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>{" "}
            to ask about Notegic, report a problem, or question a public page.
          </>
        ) : (
          "The contact email is published with the site configuration."
        )}{" "}
        Do not send passwords, API keys, or private note contents.
      </p>
      <p className="mt-4">{publicFacts.limits}</p>
      <nav className="mt-8 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-sm">
        {relatedPages.map(page => (
          <a key={page.path} className="underline" href={page.path}>
            {page.linkLabel}
          </a>
        ))}
      </nav>
    </main>
  );
};

export default ContactPage;
