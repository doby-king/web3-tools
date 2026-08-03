import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { GitHubIcon, MenuIcon, XIcon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Header } from "./Header";
import { ToolNav } from "./ToolSidebar";

const GITHUB_REPO = "https://github.com/doby-king/web3-tools";

export function AppLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isToolPage = location.pathname.startsWith("/tools");

  return (
    <div
      className={cn(
        "flex flex-col",
        isToolPage ? "h-screen overflow-hidden" : "min-h-screen",
      )}
    >
      <Header />
      <main className={cn(isToolPage ? "min-h-0 flex-1" : "flex-1")}>
        {isToolPage ? (
          <div className="mx-auto flex h-full w-full">
            {/* Desktop sidebar */}
            <aside className="hidden h-full w-56 shrink-0 border-r border-border lg:flex lg:flex-col">
              <div className="flex-1 overflow-y-auto">
                <ToolNav />
              </div>
              {/* Footer in sidebar for tool pages */}
              <footer className="border-t border-border py-4 px-3">
                <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
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
            </aside>
            {/* Content */}
            <div className="min-w-0 flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Footer at bottom of page for non-tool pages */}
      {!isToolPage && (
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
      )}

      {/* Mobile: floating menu button + drawer (tool pages only) */}
      {isToolPage && (
        <>
          <button
            type="button"
            aria-label={t("layout.openToolMenu")}
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary-hover lg:hidden"
          >
            <MenuIcon size={20} />
          </button>
          {drawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <div
                className="animate-fade-in absolute inset-0 bg-black/40"
                onClick={() => setDrawerOpen(false)}
              />
              {/* Drawer panel */}
              <div className="animate-slide-in-left absolute inset-y-0 left-0 w-64 border-r border-border bg-surface shadow-xl">
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                  <span className="font-display text-sm font-bold text-text">
                    {t("common.appName")}
                  </span>
                  <button
                    type="button"
                    aria-label={t("layout.closeToolMenu")}
                    onClick={() => setDrawerOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <XIcon size={18} />
                  </button>
                </div>
                <ToolNav onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
