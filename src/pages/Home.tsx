import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Badge, Card } from "@/components/ui";
import { getToolsByCategory, toolCategories } from "@/tools/registry";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="hero-bg">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        {/* Hero */}
        <section className="animate-fade-in-up text-center">
          <h1 className="gradient-text font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("common.appName")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary">
            {t("home.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="primary">{t("home.badges.local")}</Badge>
            <Badge variant="success">{t("home.badges.openSource")}</Badge>
            <Badge variant="default">{t("home.badges.privacy")}</Badge>
          </div>
        </section>

        {/* Tools by category */}
        <div className="mt-14 space-y-12">
          {toolCategories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            if (categoryTools.length === 0) return null;

            return (
              <section key={category.id} className="animate-fade-in-up">
                <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-muted">
                  {t(category.nameKey)}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryTools.map((tool) => (
                    <Link key={tool.id} to={tool.path} className="group block">
                      <Card glow className="h-full">
                        <div className="flex items-center gap-2">
                          {tool.icon}
                          <h3 className="font-display text-base font-semibold text-text transition-colors group-hover:text-primary">
                            {t(tool.nameKey)}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                          {t(tool.descriptionKey)}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
