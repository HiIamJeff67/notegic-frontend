import { BlockNoteView } from "@blocknote/shadcn";
import { queryKeys } from "@shared/api/queryKeys";
import { NotegicBlockPackEditor } from "@shared/lib/blockpack/editor";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import "@blocknote/core/style.css";
import { getMyAccount } from "./api/account";
import { getAccessToken, setAccessToken } from "./session";

type SidecarSession = {
  token: string;
  port: number;
};

type SidecarProbe = {
  denied: number;
  accepted: number;
};

export const DesktopShell = () => {
  const editor = useMemo(() => NotegicBlockPackEditor.create({}), []);
  const [draftToken, setDraftToken] = useState("");
  const [sidecar, setSidecar] = useState<SidecarProbe | null>(null);
  const account = useQuery({
    queryKey: queryKeys.userAccount.my(),
    queryFn: getMyAccount,
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const session = await invoke<SidecarSession>("sidecar_session");
      const denied = await fetch(`http://127.0.0.1:${session.port}/`);
      const accepted = await fetch(`http://127.0.0.1:${session.port}/`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!cancelled) {
        setSidecar({
          denied: denied.status,
          accepted: accepted.status,
        });
      }
    };
    probe().catch(() => {
      if (!cancelled) setSidecar(null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccessToken(draftToken);
    if (getAccessToken().length === 0) return;
    void account.refetch();
  };

  return (
    <main className="min-w-0 p-6">
      <h1 className="text-xl font-semibold">Notegic</h1>
      <p className="mt-2 text-sm">
        {sidecar
          ? `Sidecar denied ${sidecar.denied}, accepted ${sidecar.accepted}.`
          : "Sidecar is available in the desktop window."}
      </p>
      <form className="mt-4 flex min-w-0 gap-2" onSubmit={loadAccount}>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Access token</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={draftToken}
            autoComplete="off"
            onChange={event => setDraftToken(event.target.value)}
          />
        </label>
        <button className="rounded-md border px-3 py-2" type="submit">
          Load account
        </button>
      </form>
      <p className="mt-2 text-sm">
        {account.isFetching
          ? "Loading account"
          : account.data
            ? account.data.embedded.publicId
            : account.error instanceof Error
              ? account.error.message
              : "Account stays empty until a bearer token is set."}
      </p>
      <div className="mt-6 min-w-0">
        <BlockNoteView editor={editor} />
      </div>
    </main>
  );
};
