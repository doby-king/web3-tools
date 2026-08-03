import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { HomeIcon } from "@/components/ui/icons";
import { getToolsByCategory, toolCategories } from "@/tools/registry";
import { cn } from "@/lib/cn";

/** Tool navigation list shared by the desktop sidebar and the mobile drawer */
export function ToolNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {toolCategories.map((category) => {
        const categoryTools = getToolsByCategory(category.id);
        if (categoryTools.length === 0) return null;

        return (
          <div key={category.id} className="mb-2">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t(category.nameKey)}
            </p>
            {categoryTools.map((tool) => (
              <NavLink
                key={tool.id}
                to={tool.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text",
                  )
                }
              >
                {tool.icon}
                <span className="truncate">{t(tool.nameKey)}</span>
              </NavLink>
            ))}
          </div>
        );
      })}
      <div className="my-2 border-t border-border" />
      <NavLink
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
      >
        <HomeIcon size={18} className="shrink-0" />
        <span>{t("layout.backToHome")}</span>
      </NavLink>
    </nav>
  );
}
