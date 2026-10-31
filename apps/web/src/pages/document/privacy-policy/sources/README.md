# Privacy sources

Edit [privacy-policy.md](privacy-policy.md), then run `npm run generate:document`.
`../generated.ts` contains navigation data and `../PrivacyPolicyContent.tsx`
contains generated JSX. `../PrivacyPolicy.tsx` owns the tab.

Keep the existing `{#privacy-id}` anchors and update date. Blockquotes mark
secondary explanatory paragraphs. Keep `[{{contactEmail}}](mailto:{{contactEmail}})`
so the existing runtime contact setting is used.

This source is the English Document content. The standalone `/privacy-policy`
page retains its own translations; review both policies when their meaning changes.
