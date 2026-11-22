import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { createLocalTranslator } from "#dqy2d22qyujv";
import { adoptLayerTone, ensureLayerRoot, promoteZIndex } from "#ccvonx3uhbte";
import { primitiveButtonClassName } from "#hzrmwbvgt2ax";
import { frontendClassName, frontendDataAttrs, frontendDataSelector, frontendElementClass } from "#5vbaqj4pirp3";
import { Icon } from "#lbkpzw8nphru";
import {
  addDays,
  addMonths,
  clampDayKey,
  formatDayKey,
  isDayKey,
  monthKey,
  monthTitle,
  monthWeeks,
  sameMonth,
  todayKey,
  weekdayLabels,
  weekStartDay,
  weekStartOf,
} from "./model.js";

const PANEL_GAP = 4;
const POPOVER_Z_INDEX = 1040;

type DatePickerProps = {
  className?: string;
  disabled?: boolean;
  id?: string;
  isDateDisabled?: (day: string) => boolean;
  label?: string;
  lang?: string;
  max?: string | null;
  min?: string | null;
  onChange: (day: string) => void;
  placeholder?: string;
  size?: "lg" | "md" | "sm";
  value?: string | null;
};

type PickerState = ReturnType<typeof usePickerState>;

function dayAllowed(props: DatePickerProps, day: string) {
  if (props.min && isDayKey(props.min) && day < props.min) return false;
  if (props.max && isDayKey(props.max) && day > props.max) return false;
  return !props.isDateDisabled?.(day);
}

function initialFocus(props: DatePickerProps) {
  const base = isDayKey(props.value) ? props.value : todayKey();
  return clampDayKey(base, props.min, props.max);
}

function usePickerState(props: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [focusDay, setFocusDay] = useState(() => initialFocus(props));
  const [viewMonth, setViewMonth] = useState(() => monthKey(initialFocus(props)));
  const trigger = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const moveFocus = (day: string) => {
    const next = clampDayKey(day, props.min, props.max);
    setFocusDay(next);
    if (!sameMonth(next, viewMonth)) setViewMonth(monthKey(next));
  };
  const show = () => {
    const start = initialFocus(props);
    setFocusDay(start);
    setViewMonth(monthKey(start));
    setOpen(true);
  };
  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };
  return { close, focusDay, moveFocus, open, panel, setViewMonth, show, trigger, viewMonth };
}

function placePanel(state: PickerState) {
  const button = state.trigger.current;
  const element = state.panel.current;
  if (!button || !element) return;
  const rect = button.getBoundingClientRect();
  const height = element.offsetHeight;
  const width = element.offsetWidth;
  const below = rect.bottom + PANEL_GAP;
  const top = below + height > window.innerHeight && rect.top - PANEL_GAP - height > 0 ? rect.top - PANEL_GAP - height : below;
  const left = Math.max(PANEL_GAP, Math.min(rect.left, window.innerWidth - width - PANEL_GAP));
  element.style.top = `${Math.round(top)}px`;
  element.style.left = `${Math.round(left)}px`;
}

function usePanelPlacement(state: PickerState) {
  useLayoutEffect(() => {
      if (!state.open || !state.panel.current || !state.trigger.current) return;
      adoptLayerTone(state.trigger.current, state.panel.current);
      promoteZIndex(state.panel.current, { fallback: POPOVER_Z_INDEX });
      placePanel(state);
      const update = () => placePanel(state);
      window.addEventListener("resize", update);
      window.addEventListener("scroll", update, true);
      return () => {
        window.removeEventListener("resize", update);
        window.removeEventListener("scroll", update, true);
      };
    }, [state.open]);
}

function useOutsideClose(state: PickerState) {
  useEffect(() => {
      if (!state.open) return;
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (state.panel.current?.contains(target) || state.trigger.current?.contains(target)) return;
        state.close(false);
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [state.open]);
}

function useFocusedDay(state: PickerState) {
  useEffect(() => {
      if (!state.open) return;
      const button = state.panel.current?.querySelector<HTMLButtonElement>(frontendDataSelector("date-picker-day", state.focusDay));
      button?.focus({ preventScroll: true });
    }, [state.open, state.focusDay, state.viewMonth]);
}

function gridKeyTarget(event: KeyboardEvent<HTMLElement>, day: string, firstDay: number) {
  const months = event.shiftKey ? 12 : 1;
  const moves: Record<string, () => string> = {
    ArrowDown: () => addDays(day, 7),
    ArrowLeft: () => addDays(day, -1),
    ArrowRight: () => addDays(day, 1),
    ArrowUp: () => addDays(day, -7),
    End: () => addDays(weekStartOf(day, firstDay), 6),
    Home: () => weekStartOf(day, firstDay),
    PageDown: () => addMonths(day, months),
    PageUp: () => addMonths(day, -months),
  };
  return moves[event.key] ? moves[event.key]() : null;
}

function PanelHeader(props: { lang?: string; state: PickerState }) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const button = primitiveButtonClassName({ icon: true, size: "sm", variant: "secondary" });
  const shift = (months: number) => props.state.setViewMonth(monthKey(addMonths(props.state.viewMonth, months)));
  return (
    <div className={frontendElementClass("date-picker", "header")}>
    <button aria-label={localT("datePicker.previousMonth")} className={button} onClick={() => shift(-1)} type="button">
    <Icon spec="remixicon arrow-left-s-line" />
    </button>
    <span aria-live="polite" className={frontendElementClass("date-picker", "title")}>
    {monthTitle(props.state.viewMonth, props.lang)}
    </span>
    <button aria-label={localT("datePicker.nextMonth")} className={button} onClick={() => shift(1)} type="button">
    <Icon spec="remixicon arrow-right-s-line" />
    </button>
    </div>
  );
}

function DayCell(props: { day: string; picker: DatePickerProps; select: (day: string) => void; state: PickerState }) {
  const { day, picker, state } = props;
  const allowed = dayAllowed(picker, day);
  return (
    <td role="gridcell">
    <button
    aria-current={day === todayKey() ? "date" : undefined}
    aria-label={formatDayKey(day, picker.lang, { dateStyle: "full" })}
    aria-pressed={day === picker.value}
    className={frontendElementClass("date-picker", "day")}
    {...frontendDataAttrs({
          "date-picker-day": day,
          "date-picker-outside": sameMonth(day, state.viewMonth) ? undefined : "true",
    })}
    disabled={!allowed}
    onClick={() => props.select(day)}
    tabIndex={day === state.focusDay ? 0 : -1}
    type="button"
    >
    {Number(day.slice(8))}
    </button>
    </td>
  );
}

function CalendarGrid(props: { picker: DatePickerProps; select: (day: string) => void; state: PickerState }) {
  const firstDay = weekStartDay(props.picker.lang);
  const labels = weekdayLabels(props.picker.lang, firstDay);
  return (
    <table
    aria-label={monthTitle(props.state.viewMonth, props.picker.lang)}
    className={frontendElementClass("date-picker", "grid")}
    onKeyDown={(event) => {
        const next = gridKeyTarget(event, props.state.focusDay, firstDay);
        if (next == null) return;
        event.preventDefault();
        props.state.moveFocus(next);
    }}
    role="grid"
    >
    <thead>
    <tr>
    {labels.map((label) => (
          <th abbr={label.long} key={label.long} scope="col">
          {label.short}
          </th>
    ))}
    </tr>
    </thead>
    <tbody>
    {monthWeeks(props.state.viewMonth, firstDay).map((week) => (
          <tr key={week[0]}>
          {week.map((day) => <DayCell day={day} key={day} picker={props.picker} select={props.select} state={props.state} />)}
          </tr>
    ))}
    </tbody>
    </table>
  );
}

function DatePickerPanel(props: { dialogId: string; picker: DatePickerProps; state: PickerState }) {
  const localT = createLocalTranslator(import.meta.url, props.picker.lang);
  const select = (day: string) => {
    props.picker.onChange(day);
    props.state.close(true);
  };
  const panel = (
    <div
    aria-label={props.picker.label || localT("datePicker.calendar")}
    aria-modal="false"
    className={frontendClassName("date-picker-panel")}
    id={props.dialogId}
    onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        props.state.close(true);
    }}
    ref={props.state.panel}
    role="dialog"
    >
    <PanelHeader lang={props.picker.lang} state={props.state} />
    <CalendarGrid picker={props.picker} select={select} state={props.state} />
    </div>
  );
  const root = ensureLayerRoot();
  return root ? createPortal(panel, root) : panel;
}

function DatePicker(props: DatePickerProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const state = usePickerState(props);
  const generatedId = useId().replace(/:/gu, "");
  const dialogId = `${props.id || generatedId}_calendar`;
  usePanelPlacement(state);
  useOutsideClose(state);
  useFocusedDay(state);
  const text = isDayKey(props.value) ? formatDayKey(props.value, props.lang) : props.placeholder || localT("datePicker.choose");
  return (
    <>
    <button
    aria-controls={dialogId}
    aria-expanded={state.open}
    aria-haspopup="dialog"
    aria-label={props.label ? `${props.label}: ${text}` : undefined}
    className={primitiveButtonClassName({ className: props.className, size: props.size || "sm", variant: "secondary" })}
    disabled={props.disabled}
    id={props.id}
    onClick={() => (state.open ? state.close(false) : state.show())}
    ref={state.trigger}
    type="button"
    >
    {text}
    </button>
    {state.open ? <DatePickerPanel dialogId={dialogId} picker={props} state={state} /> : null}
    </>
  );
}

export { DatePicker };
export type { DatePickerProps };
