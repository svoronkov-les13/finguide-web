import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/I18nProvider";
import { navigation, systemRoutes, tools } from "@/routes";
import { useUiStore } from "@/store/uiStore";

export function CommandPalette() {
  const open = useUiStore((state) => state.commandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const { t } = useI18n();
  const routes = [...navigation, ...tools, ...systemRoutes];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-border p-4 pb-3">
          <DialogTitle className="text-base">{t("command.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4 pb-3">
          <Search className="size-4 text-muted-foreground" />
          <Input className="border-0 bg-transparent px-0 shadow-none focus:ring-0" autoFocus placeholder={t("command.placeholder")} />
        </div>
        <div className="max-h-[360px] overflow-auto p-2">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={`${route.href}-${route.labelKey}`}
                to={route.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-hover"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="font-medium">{t(route.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
