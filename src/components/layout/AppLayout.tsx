import { Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { GitHubIcon } from "@/components/ui";
import { Header } from "./Header";

const GITHUB_REPO = "https://github.com/doby-king/web3-tools";

export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-1.5 px-4 text-xs text-text-muted sm:px-6">
          <span>{t("layout.footer")}</span>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("common.github")}
            className="inline-flex text-text-muted transition-colors hover:text-text"
          >
            <GitHubIcon size={14} />
          </a>
        </div>
      </footer>
    </div>
  );
}
