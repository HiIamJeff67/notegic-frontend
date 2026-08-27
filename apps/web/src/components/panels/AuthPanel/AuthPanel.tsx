import {
  OAuthAppleIcon,
  OAuthGithubIcon,
  OAuthGoogleIcon,
  OAuthMetaIcon,
} from "@/components/icons/OAuthIcon";
import "@/global/styles/panel.css";
import { toCamelCase } from "@shared/util/stringCaseConversions";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";

const OAuthIcons = {
  google: (className: string) => <OAuthGoogleIcon className={className} />,
  meta: (className: string) => <OAuthMetaIcon className={className} />,
  github: (className: string) => <OAuthGithubIcon className={className} />,
  apple: (className: string) => <OAuthAppleIcon className={className} />,
};

interface AuthPanelInput {
  title: string;
  placeholder: string;
  type?: "text" | "email" | "password" | "number";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rightButton?: {
    description: string;
    onClick: () => Promise<void> | void;
    disabled?: boolean;
  };
}

interface AuthSwitchButton {
  description: string;
  title: string;
  onClick: () => void;
}

export interface AuthOAuthButton {
  provider: keyof typeof OAuthIcons;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface AuthPanelProps {
  title: string;
  subtitle?: string;
  inputs: AuthPanelInput[];
  submitButtonText: string;
  onSubmit: () => Promise<void>;
  switchButtons?: AuthSwitchButton[];
  oauthButtons?: AuthOAuthButton[];
  statusDetail?: string;
  isLoading?: boolean;
}

const AuthPanel = ({
  title,
  subtitle,
  inputs,
  submitButtonText,
  onSubmit,
  switchButtons,
  oauthButtons,
  statusDetail,
  isLoading = false,
}: AuthPanelProps) => {
  const { t } = useTranslation();
  const themeManager = useTheme();

  return (
    <div className="flex justify-center items-center min-h-screen p-8">
      <div
        className={`
          relative w-[450px] px-10 py-12 rounded-lg overflow-hidden
          ${
            themeManager.currentTheme.isDark
              ? "panel-gradient panel-texture panel-shine shadow-[0_25px_50px_rgba(0,0,0,0.8),0_10px_25px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)]"
              : "bg-[rgba(100,100,100,0.5)] shadow-[0_8px_32px_rgba(0,0,0,0.45),0_1.5px_4px_rgba(0,0,0,0.10)]"
          }
          transition-all duration-300 ease-out
          ${isLoading ? "pointer-events-none opacity-75" : ""}
        `}
      >
        {/* Corner Screws */}
        {[
          { position: "top-4 left-4" },
          { position: "top-4 right-4" },
          { position: "bottom-4 left-4" },
          { position: "bottom-4 right-4" },
        ].map((screw, index) => (
          <div
            key={index}
            className={`absolute ${screw.position} w-3.5 h-3.5 rounded-full screw-gradient shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.1)] z-10`}
          >
            <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_1px_#333]"></div>
            <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_1px_#333]"></div>
          </div>
        ))}

        {/* Panel Content */}
        <div className="relative z-5 select-none">
          <h2
            className={`font-mono text-2xl font-bold leading-normal ${
              themeManager.currentTheme.isDark
                ? "text-green-400"
                : "text-green-600"
            } text-center mb-2 tracking-[2px]`}
            style={{
              textShadow: themeManager.currentTheme.isDark
                ? "0 0 10px rgba(0, 255, 136, 0.3)"
                : "none",
            }}
          >
            {title}
          </h2>

          <div
            className={`font-mono text-xs leading-normal ${
              themeManager.currentTheme.isDark
                ? "text-gray-500"
                : "text-gray-700"
            } text-center mb-8 tracking-wider`}
          >
            {subtitle
              ? subtitle
              : `Authentication panel for ${toCamelCase(title)}`}
          </div>

          <form
            onSubmit={async e => {
              e.preventDefault();
              await onSubmit();
            }}
            className="flex flex-col gap-6"
          >
            {inputs.map((input, index) => (
              <div key={index} className="flex flex-col gap-2 leading-normal">
                <label
                  htmlFor={`input-${index}`}
                  className={`font-mono text-base leading-normal tracking-wider font-bold select-none ${
                    themeManager.currentTheme.isDark
                      ? "text-green-400"
                      : "text-green-600"
                  }`}
                >
                  {input.title}
                </label>
                <div className="relative flex justify-between item-center">
                  <input
                    type={input.type || "text"}
                    id={`input-${index}`}
                    value={input.value}
                    onChange={e => input.onChange(e.target.value)}
                    required={input.required !== false}
                    disabled={isLoading}
                    className={`
                      w-full
                      font-semibold border rounded px-4 py-3 font-mono text-sm leading-normal transition-all duration-300
                      shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.03)]
                      focus:outline-none focus:border-green-400
                      placeholder:text-gray-600 placeholder:italic placeholder:font-normal
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        themeManager.currentTheme.isDark
                          ? "bg-[#181818] text-white border-gray-700"
                          : "bg-[rgba(255,255,255,0.45)] backdrop-blur-sm text-foreground border-gray-300"
                      }
                    `}
                    style={{
                      caretColor: "var(--foreground)",
                    }}
                    placeholder={input.placeholder}
                  />
                  {input.rightButton && (
                    <button
                      type="button"
                      className={`
                        absolute right-1 top-1/2 px-3 py-1 -translate-y-1/2 rounded
                        button-gradient border border-green-400
                        text-green-400 font-mono text-xs leading-normal font-bold
                        transition-all duration-300 max-w-2/5 h-4/5
                        hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                        ${
                          input.rightButton.disabled || isLoading
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }
                      `}
                      disabled={input.rightButton.disabled || isLoading}
                      onClick={input.rightButton.onClick}
                    >
                      {input.rightButton.description}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="
                relative button-gradient border border-green-400 rounded-md px-8 py-4
                text-green-400 font-mono text-base leading-normal font-bold tracking-wider cursor-pointer
                transition-all duration-300 mt-4 overflow-hidden
                hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
              "
            >
              <span className="relative z-2">
                {isLoading ? t("workspace.pages.processing") : submitButtonText}
              </span>
              {!isLoading && (
                <div
                  className="
                  absolute top-0 left-[-100%] w-full h-full
                  bg-gradient-to-r from-transparent via-[rgba(0,255,136,0.3)] to-transparent
                  button-glow
                "
                ></div>
              )}
            </button>
          </form>

          {oauthButtons && oauthButtons.length > 0 && (
            <div className="mt-6">
              {/* Tech Separator */}
              <div className="flex items-center justify-center gap-4 mb-6 opacity-70">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
                <span
                  className={`font-mono text-[10px] tracking-[3px] ${
                    themeManager.currentTheme.isDark
                      ? "text-gray-500"
                      : "text-gray-600"
                  }`}
                >
                  {t("workspace.pages.orContinueWith")}
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
              </div>

              <div className="flex flex-col gap-3">
                {oauthButtons.map((button, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={button.onClick}
                    disabled={button.disabled || isLoading}
                    className={`
                            group relative w-full flex items-center justify-center gap-4
                            px-4 py-3 rounded border
                            font-mono text-sm leading-normal tracking-wider font-bold
                            transition-all duration-300
                            ${
                              themeManager.currentTheme.isDark
                                ? "bg-[#1f1f1f] text-gray-300 border-gray-700 hover:text-green-400 hover:border-green-400"
                                : "bg-white/40 text-gray-700 border-gray-400 hover:text-green-600 hover:border-green-600"
                            }
                            hover:shadow-[0_0_15px_rgba(0,255,136,0.15)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                  >
                    {/* Icon Render */}
                    <div className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                      {OAuthIcons[button.provider]
                        ? OAuthIcons[button.provider]("w-full h-full")
                        : null}
                    </div>

                    <span>{button.label}</span>

                    {/* Hover Corner Accents (Mini styling detail) */}
                    <div className="absolute top-0 right-0 w-1 h-1 bg-green-400/0 group-hover:bg-green-400/50 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-1 h-1 bg-green-400/0 group-hover:bg-green-400/50 transition-colors"></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {switchButtons && (
            <div className="mt-4 pt-2 border-t border-gray-700/50">
              {switchButtons.map((switchButton, index) => (
                <div
                  key={index}
                  className={`mt-2 mb-2 text-center font-mono text-xs ${
                    themeManager.currentTheme.isDark
                      ? "text-gray-500"
                      : "text-gray-700"
                  } tracking-wider`}
                >
                  <span className="mr-2 select-none">
                    {switchButton.description}
                  </span>
                  <button
                    type="button"
                    onClick={switchButton.onClick}
                    className="
                      relative inline-block px-3 py-1 ml-1 mt-2
                      font-mono text-xs leading-normal font-bold tracking-wider
                      text-green-400 cursor-pointer
                      border border-green-400/30 rounded
                      bg-gradient-to-r from-gray-900/50 to-gray-800/50
                      transition-all duration-300 ease-out
                      hover:border-green-400/60 hover:text-green-300
                      hover:shadow-[0_0_10px_rgba(0,255,136,0.2)]
                      hover:bg-gradient-to-r hover:from-green-900/20 hover:to-green-800/20
                      focus:outline-none focus:ring-1 focus:ring-green-400/50
                      active:scale-95
                      before:absolute before:inset-0
                      before:bg-gradient-to-r before:from-transparent before:via-green-400/5 before:to-transparent
                      before:opacity-0 before:transition-opacity before:duration-300
                      hover:before:opacity-100
                    "
                    style={{
                      textShadow: "0 0 5px rgba(0, 255, 136, 0.2)",
                    }}
                  >
                    <span className="relative z-10">{switchButton.title}</span>

                    {/* Subtle glow effect */}
                    <div
                      className="absolute inset-0 rounded
                      bg-gradient-to-r from-transparent via-green-400/10 to-transparent
                      opacity-0 transition-opacity duration-300
                      group-hover:opacity-100"
                    />

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                    <div className="absolute top-0 right-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                    <div className="absolute bottom-0 right-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                  </button>
                </div>
              ))}

              {/* Add a subtle separator line with tech pattern */}
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-400/30 rounded-full"></div>
                  <div className="w-2 h-0.5 bg-gradient-to-r from-transparent via-green-400/20 to-transparent"></div>
                  <div className="w-1 h-1 bg-green-400/30 rounded-full"></div>
                  <div className="w-2 h-0.5 bg-gradient-to-r from-transparent via-green-400/20 to-transparent"></div>
                  <div className="w-1 h-1 bg-green-400/30 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {statusDetail && statusDetail !== "" && (
            <div
              className={`flex items-center justify-center gap-2 mt-8 font-mono text-xs leading-normal ${
                themeManager.currentTheme.isDark
                  ? "text-gray-500"
                  : "text-gray-700"
              }`}
            >
              <div
                className={`
              w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]
              ${
                isLoading
                  ? "bg-yellow-400 shadow-[0_0_10px_rgba(255,255,0,0.5)]"
                  : "bg-green-400 status-indicator"
              }
            `}
              />
              <span>{statusDetail}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
