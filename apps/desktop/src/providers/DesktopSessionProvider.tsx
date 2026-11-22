import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { type Client, connectDefaultClient } from "@shared/api/local/client";
import { listen } from "@tauri-apps/api/event";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { sidecarDriver } from "../api/local/driver";
import { setAccessToken } from "../api/tokens/accessToken";
import { readNativeSession } from "../invocations/nativeAuth.invocation";
import { sidecarSession } from "../invocations/sidecar.invocation";

export type DesktopAccount = {
  publicId: string;
  name: string;
  displayName: string;
  email: string;
};

type NativeSession = DesktopAccount & {
  signedIn: boolean;
  accessToken: string;
};

type DesktopSessionValue = {
  client: Client | undefined;
  account: DesktopAccount | null;
  setAccount: (account: DesktopAccount | null) => void;
};

const DesktopSessionContext = createContext<DesktopSessionValue | undefined>(
  undefined
);

export const DesktopSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [client, setClient] = useState<Client | undefined>();
  const [account, setAccount] = useState<DesktopAccount | null>(null);

  useEffect(() => {
    let cancelled = false;
    void sidecarSession()
      .then(session => {
        if (!cancelled) setClient(connectDefaultClient(sidecarDriver(session)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const apply = (session: NativeSession) => {
      if (!session.publicId) return;
      setAccessToken(session.accessToken);
      setAccount({
        publicId: session.publicId,
        name: session.name,
        displayName: session.displayName,
        email: session.email,
      });
    };
    void readNativeSession().then(session => {
      if (session.signedIn) apply(session);
    });
    const subscription = listen<NativeSession>("native-session", event => {
      apply(event.payload);
    });
    return () => {
      void subscription.then(unlisten => unlisten());
    };
  }, []);

  return (
    <DesktopSessionContext.Provider value={{ client, account, setAccount }}>
      {children}
    </DesktopSessionContext.Provider>
  );
};

export const useDesktopSession = () => {
  const session = useContext(DesktopSessionContext);
  if (session === undefined) {
    throw new NotegicValidationError(
      ValidationClientException.ReceivedUndefinedRequest()
    );
  }
  return session;
};
