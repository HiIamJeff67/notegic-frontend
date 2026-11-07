// Generated from apps/web/src/pages/document/data-deletion/sources/data-deletion.md; run npm run generate:document.
import {
  ArticleLink,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
const DataDeletionContent = () => {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL ?? "";
  return (
    <>
      <p className="mb-8 text-sm text-muted-foreground">
        {"Last updated: November 7, 2026"}
      </p>
      <ArticleSubParagraph id="data-deletion-linked-sign-in" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"Remove linked sign-in data"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "If you used Facebook Login or another third-party sign-in, you can request removal of the sign-in data Notegic received from that provider without requesting deletion of your entire Notegic account. This can include the provider account identifier and an email address used to create your account."
            }
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              {
                "Before disconnecting a provider, confirm that another way of signing in to the same Notegic account works. In "
              }
              <ArticleLink
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                href="/app/setting/account"
              >
                {"Account settings"}
              </ArticleLink>
              {", find the linked sign-in method and choose "}
              <strong>{"Disconnect"}</strong>
              {
                " where available. Complete any verification shown. This removes the link to that provider; it does not change your primary email or delete your Notegic content."
              }
            </li>
            <li>
              {
                "If Notegic still uses an email address supplied by that provider, contact us to request removal of that data while keeping your account. We may ask you to verify a replacement email and confirm that you can still sign in. You can provide an email you control, or confirm an address from another linked provider where that option is available. A link to another provider alone does not verify a replacement address."
              }
            </li>
            <li>
              {
                "Removing Notegic from your provider's connected apps is a separate step. To request deletion of information already held by Notegic, follow these instructions even if you have already removed access at the provider."
              }
            </li>
          </ul>
          <p>
            {"If you no longer want to keep your Notegic account, see "}
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/data-deletion#data-deletion-account"
            >
              {"Delete your Notegic account"}
            </ArticleLink>
            {
              ". You do not need to add a replacement sign-in method to request account deletion."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="data-deletion-trash" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"Move content to Trash or restore it"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "For content that supports Trash, deleting it from the workspace first marks it as deleted. This is sometimes called a "
            }
            <strong>{"soft delete"}</strong>
            {
              ". The content is removed from ordinary workspace views but can still be stored for recovery."
            }
          </p>
          <p>
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/app/trash"
            >
              {"Trash"}
            </ArticleLink>
            {
              " lists deleted Root Shelves, Sub Shelves, Block Packs, Materials, Stations, and Routines that you can access. Locate the item and choose "
            }
            <strong>{"Restore"}</strong>
            {
              " where available. Restoration depends on the resource type, its parent location, and your permissions. A missing parent or lost access can prevent restoration. Some actions, such as removing a Dashboard Widget, do not necessarily create a recoverable Trash entry."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="data-deletion-permanent" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"Permanently delete content"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {"For supported items, open "}
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/app/trash"
            >
              {"Trash"}
            </ArticleLink>
            {
              ", select the deleted item or items, and choose the permanent deletion action. Review the selection and confirm. This "
            }
            <strong>{"hard delete"}</strong>
            {
              " removes the eligible records from the active workspace; those records can no longer be restored from Trash. Deleting a parent can also remove its dependent contents. Review shared content and save anything you need before confirming."
            }
          </p>
          <p>
            {
              "When a selection contains different resource types, Notegic processes them in separate groups. If a later group fails, earlier completed groups remain deleted. Check the updated Trash list before retrying. See "
            }
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/data-deletion#data-deletion-retention"
            >
              {"Copies and retention"}
            </ArticleLink>
            {" for what may remain outside the active workspace."}
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="data-deletion-account" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"Delete your Notegic account"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {"Sign in, open "}
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/app/setting/account"
            >
              {"Account settings"}
            </ArticleLink>
            {", and choose "}
            <strong>{"Delete account"}</strong>
            {" under "}
            <strong>{"Account changes"}</strong>
            {
              ". Complete the requested verification and confirm the deletion. Account deletion is permanent and is separate from resetting an account or moving individual items to Trash."
            }
          </p>
          <p>
            {
              "Before confirming, save content you want to keep and review shared resources and integrations. Deleting your account removes access to it; it does not erase copies other people have saved independently or delete accounts you hold with sign-in providers. If you only want to remove a provider connection, see "
            }
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/data-deletion#data-deletion-linked-sign-in"
            >
              {"Remove linked sign-in data"}
            </ArticleLink>
            {"."}
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="data-deletion-retention" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"Copies and retention"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {
              "When content or an account is deleted, removal from active systems is subject to the retention limits described here and in our "
            }
            <ArticleLink
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              href="/privacy-policy"
            >
              {"Privacy Policy"}
            </ArticleLink>
            {
              ". Backups may retain copies for a limited time before they are overwritten. Some records may be retained for fraud prevention, dispute resolution, or legal obligations."
            }
          </p>
          <p>
            {
              "Permanent deletion removes the supported record from the active workspace. Uploaded file copies, other devices' local data, exports, and backups have separate lifecycles. Do not assume that every copy is erased immediately by a Trash or account action. If you need help with a specific copy or deletion request, contact us."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
      <ArticleSubParagraph id="data-deletion-request" separatorFullWidth>
        <ArticleSubParagraphHeader>
          {"Request deletion if you cannot sign in"}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent>
          <p>
            {"Contact Notegic support at "}
            <a href={"mailto:" + contactEmail} className="underline">
              {contactEmail}
            </a>
            {
              " if you cannot sign in, cannot complete verification, or need help removing data supplied by Facebook Login or another provider. Include the email associated with your Notegic account, the provider name if applicable, and whether you want to keep or delete the account. We may ask you to verify that the request belongs to you. Do not include passwords or verification codes."
            }
          </p>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
    </>
  );
};
export default DataDeletionContent;
