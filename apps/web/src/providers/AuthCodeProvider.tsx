import { AuthCodeBlockedSecond } from "@shared/lib/auth/oauthState.type";
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSendAuthCode } from "@/api/hooks/auth.hook";

interface AuthCodeContextValue {
  seconds: number;
  isSending: boolean;
  sendAuthCode: (
    email: string,
    turnstileToken?: string | null
  ) => Promise<boolean>;
}

export const AuthCodeContext = createContext<AuthCodeContextValue | undefined>(
  undefined
);

export const AuthCodeProvider = ({ children }: { children: ReactNode }) => {
  const { mutateAsync, isPending: isSending } = useSendAuthCode();
  const [seconds, setSeconds] = useState(0);
  const blockedUntil = useRef(0);
  const sendInFlight = useRef(false);
  const isCoolingDown = seconds > 0;

  useEffect(() => {
    if (!isCoolingDown) return;

    const timer = setInterval(() => {
      setSeconds(
        Math.max(0, Math.ceil((blockedUntil.current - Date.now()) / 1000))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [isCoolingDown]);

  const sendAuthCode = useCallback(
    async (email: string, turnstileToken?: string | null) => {
      if (sendInFlight.current || blockedUntil.current > Date.now())
        return false;

      // Block another call before React renders the mutation's pending state.
      sendInFlight.current = true;
      try {
        const { data } = await mutateAsync({
          header: getClientRequestHeaders(undefined, turnstileToken),
          body: { email },
        });
        const cooldown = Math.max(
          AuthCodeBlockedSecond * 1000,
          data.blockAuthCodeUntil.getTime() - data.updatedAt.getTime()
        );
        blockedUntil.current = Date.now() + cooldown;
        setSeconds(Math.ceil(cooldown / 1000));
        return true;
      } finally {
        sendInFlight.current = false;
      }
    },
    [mutateAsync]
  );

  const value = useMemo(
    () => ({ seconds, isSending, sendAuthCode }),
    [seconds, isSending, sendAuthCode]
  );

  return (
    <AuthCodeContext.Provider value={value}>
      {children}
    </AuthCodeContext.Provider>
  );
};
