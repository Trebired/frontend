import { createLocalTranslator } from "#dqy2d22qyujv";
import {
  dispatchChange,
  getHidden,
  getDropdownOptions,
  repaintNearestModal,
  showWarning,
} from "#c0ew0jlb0c87";
import { documentLang } from "#dqy2d22qyujv";
import {
  dropdownOptionLabel,
  dropdownOptionValue,
  dropdownRootConfig,
  setDropdownOptionSelected,
  updateDropdownRootConfig,
} from "#ysjai7soiapa";

function getValueLis(drop): HTMLElement[] {
  const options = getDropdownOptions(drop);
  return options
  ? (Array.from(
      options.querySelectorAll("[data-dropdown-option]"),
    ) as HTMLElement[])
  : [];
}

function isMulti(drop) {
  if (!drop) return false;
  if (dropdownRootConfig(drop).multiple === true) return true;

  const hidden = getHidden(drop);
  if (!hidden) return false;

  try {
    return Array.isArray(JSON.parse(String(hidden.value || "").trim()));
  } catch {
    return false;
  }
}

function getMultiMax(drop) {
  const raw = Number(dropdownRootConfig(drop).max);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

function showMultiMaxWarning(drop, max) {
  const localT = createLocalTranslator(import.meta.url, documentLang());
  showWarning(
    localT(
      max === 1 ? "selection.selectUpToItem" : "selection.selectUpToItems",
      {
        count: max,
      },
    ),
  );
}

function ensureDefaultPlaceholder(drop) {
  const config = dropdownRootConfig(drop);
  if (config.defaultPlaceholder) return;
  updateDropdownRootConfig(drop, { defaultPlaceholder: config.placeholder });
}

function getDefaultPlaceholder(drop) {
  return String(dropdownRootConfig(drop).defaultPlaceholder || "");
}

function getLabelHost(drop) {
  return drop ? drop.querySelector("[data-dropdown-label]") : null;
}

function parseMultiHiddenValue(hidden) {
  if (!hidden) return [];

  const raw = String(hidden.value || "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
    ? parsed
    .map(function(value) {
        return String(value || "").trim();
    })
    .filter(Boolean)
    : [];
  } catch {
    return [];
  }
}

function writeMultiHiddenValue(hidden, values) {
  if (!hidden) return;
  hidden.value = JSON.stringify(Array.isArray(values) ? values : []);
}

function updateMultiClearButtons(drop, values) {
  const options = getDropdownOptions(drop);
  if (!options) return;

  const hasSelection = Array.isArray(values) && values.length > 0;
  options.querySelectorAll("[data-dropdown-clear]").forEach(function(button) {
      button.style.display = hasSelection ? "" : "none";
  });
}

function setLiSelected(li, selected) {
  if (!li) return;
  setDropdownOptionSelected(li, selected);
}

function getMultiLabels(drop, values) {
  const wanted = new Set(
    (Array.isArray(values) ? values : [])
    .map(function(value) {
        return String(value || "").trim();
    })
    .filter(Boolean),
  );

  return getValueLis(drop)
  .filter(function(li) {
      return wanted.has(dropdownOptionValue(li));
  })
  .map(function(li) {
      return dropdownOptionLabel(li);
  })
  .filter(Boolean);
}

function getMultiSummary(drop, labels) {
  const list = Array.isArray(labels) ? labels.filter(Boolean) : [];
  if (!list.length) {
    return String(
      dropdownRootConfig(drop).emptyLabel || getDefaultPlaceholder(drop) || "",
    ).trim();
  }

  if (list.length <= 3) return list.join(", ");

  const suffix =
  String(dropdownRootConfig(drop).selectionLabel || "selected").trim() ||
    "selected";
  return `${list.length} ${suffix}`;
}

function setDropdownLabel(drop, text, html ? ) {
  const next = String(text == null ? "" : text).trim();
  const labelHost = getLabelHost(drop);

  if (next) {
    updateDropdownRootConfig(drop, { placeholder: next });
  } else {
    updateDropdownRootConfig(drop, {
        placeholder: getDefaultPlaceholder(drop),
    });
  }

  if (!labelHost) return;

  if (html != null && String(html).trim()) {
    labelHost.innerHTML = String(html);
    return;
  }

  labelHost.textContent = next || getDefaultPlaceholder(drop);
}

function applyValue(drop, value, labelText, labelHtml) {
  const hidden = getHidden(drop);
  const nextValue = String(value || "");
  if (hidden) hidden.value = nextValue;

  getValueLis(drop).forEach(function(li) {
      const liValue = dropdownOptionValue(li);
      setLiSelected(li, liValue === nextValue);
  });

  setDropdownLabel(drop, labelText, labelHtml);
}

function clearSingleValue(drop) {
  const hidden = getHidden(drop);
  if (hidden) hidden.value = "";

  getValueLis(drop).forEach(function(li) {
      setLiSelected(li, false);
  });

  setDropdownLabel(drop, "");
}

function applyMultiValue(drop, values) {
  const hidden = getHidden(drop);
  const max = getMultiMax(drop);
  const nextValues = Array.isArray(values)
  ? values
  .map(function(value) {
      return String(value || "").trim();
  })
  .filter(Boolean)
  : [];
  const cappedValues = max > 0 ? nextValues.slice(0, max) : nextValues;

  writeMultiHiddenValue(hidden, cappedValues);
  updateMultiClearButtons(drop, cappedValues);

  const selectedSet = new Set(cappedValues);
  getValueLis(drop).forEach(function(li) {
      const value = dropdownOptionValue(li);
      setLiSelected(li, selectedSet.has(value));
  });

  setDropdownLabel(
    drop,
    getMultiSummary(drop, getMultiLabels(drop, cappedValues)),
  );
}

function syncFromHidden(drop) {
  const hidden = getHidden(drop);
  if (!hidden) return;

  if (isMulti(drop)) {
    applyMultiValue(drop, parseMultiHiddenValue(hidden));
    return;
  }

  const value = String(hidden.value || "").trim();
  if (!value) {
    getValueLis(drop).forEach(function(li) {
        setLiSelected(li, false);
    });
    setDropdownLabel(drop, "");
    return;
  }

  const items = getValueLis(drop);
  const hit = items.find((li) => dropdownOptionValue(li) === value);

  if (hit) applyValue(drop, value, hit.innerText, hit.innerHTML);
  else {
    getValueLis(drop).forEach(function(li) {
        setLiSelected(li, false);
    });
    setDropdownLabel(drop, "");
  }
}

function autoPickSingle(drop) {
  if (isMulti(drop)) {
    syncFromHidden(drop);
    return;
  }

  const items = getValueLis(drop);
  const hidden = getHidden(drop);
  if (!hidden) return;

  if (items.length !== 1) {
    syncFromHidden(drop);
    return;
  }

  const only = items[0];
  const value = dropdownOptionValue(only);
  if (!value) {
    syncFromHidden(drop);
    return;
  }

  const current = String(hidden.value || "").trim();
  if (!current) {
    applyValue(drop, value, only.innerText, only.innerHTML);
    dispatchChange(drop);
    repaintNearestModal(drop);
    return;
  }

  syncFromHidden(drop);
}

export {
  applyMultiValue,
  applyValue,
  autoPickSingle,
  clearSingleValue,
  ensureDefaultPlaceholder,
  getMultiMax,
  isMulti,
  parseMultiHiddenValue,
  setDropdownLabel,
  showMultiMaxWarning,
  syncFromHidden,
};
