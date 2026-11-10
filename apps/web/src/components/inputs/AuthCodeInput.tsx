import { tError } from "@shared/i18n/error";
import { cn } from "@shared/lib/classname/cn";
import toast from "@shared/lib/toast/toast";
import { type ComponentProps, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthCode } from "@/hooks/useAuthCode";
import { useNetwork } from "@/hooks/useNetwork";
import { useTranslation } from "@/hooks/useTranslation";

interface AuthCodeInputProps
  extends Pick<
    ComponentProps<"input">,
    "id" | "className" | "disabled" | "value" | "onChange"
  > {
  send?: {
    email?: string;
  };
}

const AuthCodeInput = ({
  className,
  disabled,
  send,
  ...inputProps
}: AuthCodeInputProps) => {
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const { seconds, isSending, sendAuthCode } = useAuthCode();
  const [sentEmail, setSentEmail] = useState<string>();
  const canResend = sentEmail !== undefined && sentEmail === send?.email;
  const prompt = t("settingsPage.account.security.enterCode");

  const handleSend = async () => {
    if (!send?.email) return;
    const { email } = send;
    try {
      if (!(await sendAuthCode(email))) return;
      setSentEmail(email);
      toast.success(t("settingsPage.account.authCodeSent", { email }));
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <div
      className={cn(
        "relative min-w-0",
        seconds > 0
          ? "[--auth-code-action-width:min(9rem,60%)]"
          : canResend
            ? "[--auth-code-action-width:5.5rem]"
            : "[--auth-code-action-width:4.5rem]",
        className
      )}
    >
      <Input
        {...inputProps}
        disabled={disabled}
        name="authCode"
        aria-label={prompt}
        placeholder={prompt}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        className={cn(
          "w-full px-4 py-3",
          send && "pr-[calc(var(--auth-code-action-width)+0.5rem)]"
        )}
      />
      {send && (
        <Button
          type="button"
          size="sm"
          disabled={
            disabled || !isOnline || !send.email || isSending || seconds > 0
          }
          onClick={handleSend}
          className="absolute right-0.5 top-1/2 w-(--auth-code-action-width) -translate-y-1/2 font-bold"
        >
          <span className="truncate">
            {seconds > 0
              ? t("settingsPage.account.security.resendIn", {
                  count: seconds,
                })
              : canResend
                ? t("settingsPage.account.security.resendCode")
                : t("common.send")}
          </span>
        </Button>
      )}
    </div>
  );
};

export default AuthCodeInput;
