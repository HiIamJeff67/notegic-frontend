import { createFileRoute } from "@tanstack/react-router";
import DataDeletionPage from "@/pages/data-deletion/DataDeletionPage";

export const Route = createFileRoute("/data-deletion")({
  head: () => ({
    meta: [
      { title: "Data deletion | Notegic" },
      {
        name: "description",
        content:
          "How to remove linked sign-in data or delete your Notegic account.",
      },
    ],
  }),
  component: DataDeletionPage,
});
