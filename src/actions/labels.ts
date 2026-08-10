import { normalizeLocale as actionLang } from "#2d8f076g07hg";

type ActionLabelKey =
| "add"
| "cancel"
| "copy"
| "create"
| "delete"
| "drop"
| "forceStop"
| "insert"
| "install"
| "remove"
| "removeItem"
| "restart"
| "save"
| "show"
| "start"
| "stop";

const ACTION_LABELS: Record<string, Record<ActionLabelKey, string>> = {
  cs: {
    add: "Přidat",
    cancel: "Zrušit",
    copy: "Kopírovat",
    create: "Vytvořit",
    delete: "Smazat",
    drop: "Drop",
    forceStop: "Vynutit zastavení",
    insert: "Insert",
    install: "Instalovat",
    remove: "Odebrat",
    removeItem: "Odebrat položku?",
    restart: "Restartovat",
    save: "Uložit",
    show: "Zobrazit",
    start: "Spustit",
    stop: "Zastavit",
  },
  en: {
    add: "Add",
    cancel: "Cancel",
    copy: "Copy",
    create: "Create",
    delete: "Delete",
    drop: "Drop",
    forceStop: "Force stop",
    insert: "Insert",
    install: "Install",
    remove: "Remove",
    removeItem: "Remove item?",
    restart: "Restart",
    save: "Save",
    show: "Show",
    start: "Start",
    stop: "Stop",
  },
};

function actionLabel(key: ActionLabelKey, lang?: unknown, fallback?: unknown) {
  const text = String(fallback || "").trim();
  if (text) return text;
  return ACTION_LABELS[actionLang(lang)]?.[key] || ACTION_LABELS.en[key];
}

export { ACTION_LABELS, actionLabel, actionLang };
export type { ActionLabelKey };
