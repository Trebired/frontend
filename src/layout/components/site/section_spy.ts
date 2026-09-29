type SectionListener = () => void;

const listeners = new Set<SectionListener>();
let observed: string[] = [];
let observer: IntersectionObserver | null = null;
let active = "";

function notify(next: string) {
  if (next === active) return;
  active = next;
  for (const listener of listeners) listener();
}

function resolveActive() {
  if (typeof document === "undefined") return "";
  const line = Math.max(80, window.innerHeight * 0.3);
  let current = "";
  let nearest = -Infinity;
  for (const id of observed) {
    const element = document.getElementById(id);
    if (!element) continue;
    const { top } = element.getBoundingClientRect();
    if (top <= line && top > nearest) {
      nearest = top;
      current = id;
    }
  }
  return current;
}

function measure() {
  notify(resolveActive());
}

function stop() {
  observer?.disconnect();
  observer = null;
  if (typeof window === "undefined") return;
  window.removeEventListener("scroll", measure);
  window.removeEventListener("resize", measure);
}

function start() {
  if (typeof window === "undefined" || !observed.length) return;
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  observer = new IntersectionObserver(measure, { threshold: [0, 1] });
  for (const id of observed) {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
  }
  measure();
}

function observeSections(ids: readonly string[]) {
  const next = [...new Set(ids.filter(Boolean))];
  if (next.join("|") === observed.join("|")) return;
  stop();
  observed = next;
  active = "";
  start();
}

function subscribeActiveSection(listener: SectionListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function activeSection() {
  return active;
}

function serverActiveSection() {
  return "";
}

export { activeSection, observeSections, serverActiveSection, subscribeActiveSection };
