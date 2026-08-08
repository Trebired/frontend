import { useEffect, useRef } from "react";
import { dropdownManager } from "#z2c0jqmjqds4";
import {
  cloneTemplateRoot,
  findGraphUnitInput,
  inspectGraphUnitDropdown,
  markGraphUnitDropdown,
  readGraphUnitDropdownSelection,
} from "#874sewd5eea2";
import {
  graphUnitEventName,
  graphUnitLabel,
  logGraphSwitch,
  normalizeGraphUnitScale,
  updateGraphUnitRows,
} from "#ka1hsnuztod9";

export function useUnitDropdownMount(props, selectable, rootRef) {
  useEffect(() => {
      if (!selectable || !rootRef.current) return undefined;
      const root = rootRef.current;
      const fragment = cloneTemplateRoot(props.unit_dropdown_template_id);
      root.replaceChildren();
      if (fragment) root.appendChild(fragment);
      const mounted = markGraphUnitDropdown(root, props.id);
      if (typeof dropdownManager?.boot === "function") dropdownManager.boot();
      if (typeof dropdownManager?.bind === "function")
      dropdownManager.bind(mounted.dropdown);
      logGraphSwitch("dropdown-mounted", {
          ...inspectGraphUnitDropdown(root, props.id),
          fragment_found: Boolean(fragment),
          graph_id: props.id,
          template_id: props.unit_dropdown_template_id || "",
      });
      return undefined;
    }, [props.id, props.unit_dropdown_template_id, selectable]);
}

export function useUnitRows(props, selectedScale, measurement) {
  const previousScaleRef = useRef(selectedScale);
  useEffect(() => {
      if (!props.id) return undefined;
      const precision = Number.isInteger(props.precision) ? props.precision : 2;
      const count = updateGraphUnitRows(
        props.id,
        measurement,
        selectedScale,
        precision,
      );
      document.dispatchEvent(
        new CustomEvent(graphUnitEventName(props.id), {
            detail: {
              graphId: props.id,
              label: graphUnitLabel(measurement, selectedScale),
              scale: selectedScale,
              unit: measurement,
            },
        }),
      );
      if (previousScaleRef.current !== selectedScale) {
        logGraphSwitch("applied", {
            graph_id: props.id,
            previous_scale: previousScaleRef.current,
            scale: selectedScale,
            updated_row_count: count,
        });
        previousScaleRef.current = selectedScale;
      }
      return undefined;
    }, [props.id, props.precision, selectedScale, measurement]);
}

function createChangeHandler(options, root) {
  return function handleDropdownChange(event) {
    const target = event && event.target;
    if (target && !root.contains(target)) return;
    const selection = readGraphUnitDropdownSelection(root, options.props.id);
    if (!selection.value) return;
    const nextScale = normalizeGraphUnitScale(
      selection.value,
      options.unitDefaultScale,
    );
    logGraphSwitch("requested", {
        current_scale: options.selectedScale,
        graph_id: options.props.id,
        next_scale: nextScale,
        requested_value: selection.value,
        selection_source: selection.source,
        unit: options.unitMeasurement,
    });
    options.setSelectedScale((current) => {
        return current === nextScale ? current : nextScale;
    });
  };
}

export function useUnitSelection(options) {
  useEffect(() => {
      if (!options.unitSelectable || !options.props.id) return undefined;
      const root = options.unitDropdownRef.current;
      if (!root || typeof root.querySelector !== "function") return undefined;
      const changeHandler = createChangeHandler(options, root);
      root.addEventListener("change", changeHandler);
      return () => {
        root.removeEventListener("change", changeHandler);
      };
    }, [
      options.props.id,
      options.props.unit_dropdown_template_id,
      options.selectedScale,
      options.unitDefaultScale,
      options.unitMeasurement,
      options.unitSelectable,
  ]);
}

export function useUnitInputSync(options) {
  useEffect(() => {
      if (!options.unitSelectable || !options.props.id) return undefined;
      const root = options.unitDropdownRef.current;
      if (!root || typeof root.querySelector !== "function") return undefined;
      const input = findGraphUnitInput(root, options.props.id);
      if (!input) return undefined;
      const normalized = normalizeGraphUnitScale(
        options.selectedScale,
        options.unitDefaultScale,
      );
      if (String(input.value || "") !== normalized) {
        input.value = normalized;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return undefined;
    }, [
      options.props.id,
      options.props.unit_dropdown_template_id,
      options.selectedScale,
      options.unitDefaultScale,
      options.unitSelectable,
  ]);
}
