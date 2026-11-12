import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { existingWebviewSource } from "./existingWebviewSource";
import { router } from "./router";
import "./styles.css";

void existingWebviewSource.length;

const root = document.querySelector("#root");
if (!root) {
  throw new Error("Missing desktop root");
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
