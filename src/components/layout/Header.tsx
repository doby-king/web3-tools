import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { GitHubIcon } from "@/components/ui";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const GITHUB_REPO = "https://github.com/doby-king/web3-tools";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="gradient-text font-display text-lg font-bold tracking-tight"
        >
          {t("common.appName")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("common.github")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <GitHubIcon size={18} />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
