"use client";

/**
 * Reusable PageHeader ΓÇö unified across all pages.
 *
 * Usage:
 *   <PageHeader
 *     icon={LayoutDashboard}
 *     iconGradient="from-indigo-500/10 to-purple-500/10"
 *     iconBorder="border-indigo-500/20"
 *     iconColor="text-indigo-600 dark:text-indigo-400"
 *     title="Dashboard"
 *     subtitle="Platform overview"
 *     actions={<Button>Export</Button>}
 *   />
 */
export default function PageHeader({
  icon: Icon,
  iconGradient = "from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20",
  iconBorder = "border-indigo-500/20",
  iconColor = "text-indigo-600 dark:text-indigo-400",
  title,
  subtitle,
  actions,
}) {
  return (
    <header className="flex items-start justify-between flex-wrap gap-4">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient} border ${iconBorder}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        )}
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}