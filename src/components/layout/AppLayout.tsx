import { Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { Header } from "./Header";

export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-text-muted sm:px-6">
          {t("layout.footer")}
        </div>
      </footer>
    </div>
  );
}
