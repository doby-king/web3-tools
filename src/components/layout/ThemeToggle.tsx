import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/stores/themeStore";
import { MoonIcon, SunIcon } from "@/components/ui";

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark ? t("common.switchToLightMode") : t("common.switchToDarkMode")
      }
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors cursor-pointer hover:bg-surface-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
