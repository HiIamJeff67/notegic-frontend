import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import FeedbackTab from "@/pages/app/setting/preferences/tabs/FeedbackTab";

export const mountFeedbackForm = () => {
  const container = document.createElement("div");
  container.id = "feedback-test-root";
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    zIndex: "1000",
    overflow: "auto",
    background: "white",
    padding: "16px",
  });
  document.body.append(container);
  createRoot(container).render(
    <QueryClientProvider client={new QueryClient()}>
      <FeedbackTab />
    </QueryClientProvider>
  );
};
