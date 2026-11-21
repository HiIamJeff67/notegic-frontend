import type { Driver } from "@shared/api/local/client";

export const sidecarDriver = (session: {
  port: number;
  token: string;
}): Driver => {
  const clientId = crypto.randomUUID();
  return {
    execute: async (sql, params, method) => {
      const response = await fetch(`http://127.0.0.1:${session.port}/sql`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId, sql, params, method }),
      });
      if (!response.ok) {
        throw new Error("local sql failed");
      }
      const payload = (await response.json()) as { rows?: unknown[] | null };
      return { rows: payload.rows ?? undefined };
    },
  };
};
