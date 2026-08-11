import { type ServerRequestLike } from "./http.js";

type CurrentNavigation = {
  path: string;
  url: string;
};

type CurrentMatchOptions = {
  exact?: boolean;
};

type DecorateOptions = CurrentMatchOptions& {
  linkClass?: string;
  liClass?: string;
};

const EMPTY_CURRENT: CurrentNavigation = {
  path: "/",
  url: "/",
};

function normalizeNavigationPath(input: unknown) {
  const raw = String(input == null ? "" : input).trim() || "/";
  let path = raw;
  const fragmentMarker = String.fromCharCode(35);

  try {
    path =
    raw.startsWith("http://") || raw.startsWith("https://")
    ? new URL(raw).pathname
    : raw;
  } catch {
    path = raw;
  }

  path = path.split(fragmentMarker)[0].split("?")[0].trim() || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return path.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
}

function normalizeRequestPath(req: ServerRequestLike | null | undefined) {
  const request = req as (ServerRequestLike& {
      originalUrl?: unknown;
      path?: unknown;
      url?: unknown;
  }) | null | undefined;
  return normalizeNavigationPath(
    request && (request.originalUrl || request.url || request.path),
  );
}

function normalizeNavigationHref(input: unknown) {
  const raw = String(input || "").trim();
  if (!raw || raw.startsWith(String.fromCharCode(35))) return "";
  return normalizeNavigationPath(raw);
}

function matchesCurrentPath(
  currentPath: string,
  input: unknown,
  opts: CurrentMatchOptions = {},
) {
  const href = normalizeNavigationHref(input);
  if (!href) return false;
  if (href === currentPath) return true;
  if (opts.exact === true || href === "/") return false;
  return currentPath.startsWith(href + "/");
}

function addClassAttr(tag: string, className: string) {
  const cls = String(className || "").trim();
  if (!cls) return tag;
  if (!/\bclass\s*=/i.test(tag)) return tag.replace(/>$/, ` class="${cls}">`);
  return tag.replace(/\bclass=(["'])(.*?)\1/i, (_match, quote, value) => {
        const classes = String(value || "")
        .split(/\s+/)
        .filter(Boolean);
        if (!classes.includes(cls)) classes.push(cls);
        return `class=${quote}${classes.join(" ")}${quote}`;
        });
        }

        function addAttr(tag: string, name: string, value: string) {
        const attr = String(name || "").trim();
        if (!attr || new RegExp(`\\b${attr}\\s*=`, "i").test(tag)) return tag;
        return tag.replace(/>$/, ` ${attr}="${String(value || "")}">`);
        }

        function hasAttr(tag: string, name: string) {
        const attr = String(name || "").trim();
        return Boolean(attr && new RegExp(`\\b${attr}(?:\\s*=|\\s|>|$)`, "i").test(tag));
        }

        function openParentLiStart(html: string, childStart: number) {
        const beforeChild = html.slice(0, childStart).toLowerCase();
        const liOpen = beforeChild.lastIndexOf("<li");
        if (liOpen < 0) return -1;
        const liClose = beforeChild.lastIndexOf("</li>");
        return liOpen > liClose ? liOpen : -1;
        }

        type ActiveLinkMatch = {
        end: number;
        href: string;
        html: string;
        start: number;
        tagEnd: number;
        };

        function activeLinkMatches(src: string, currentPath: string, exact: boolean) {
        const linkRe = /<a\b([^>]*?)\bhref=(["'])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi;
        const matches: ActiveLinkMatch[] = [];
        let match: RegExpExecArray | null;

        while ((match = linkRe.exec(src))) {
        const tag = match[0].slice(0, match[0].indexOf(">") + 1);
        const href = normalizeNavigationHref(match[3]);
        if (!href || hasAttr(tag, "data-nav-ignore")) continue;
        if (!matchesCurrentPath(currentPath, href, { exact })) continue;
        matches.push({
        end: match.index + match[0].length,
        href,
        html: match[0],
        start: match.index,
        tagEnd: match[0].indexOf(">"),
        });
        }

        return matches.sort((left, right) => right.href.length - left.href.length);
        }

        function decorateActiveLink(html: unknown, currentPath: string, opts: DecorateOptions = {}) {
        const src = String(html || "");
        if (!src) return "";
        const matches = activeLinkMatches(src, currentPath, opts.exact === true);
        const best = matches[0];
        if (!best) return src;

        const linkClass = String(opts.linkClass || "is-active").trim();
        const liClass = String(opts.liClass || "active").trim();
        const openTag = best.html.slice(0, best.tagEnd + 1);
        const restLink = best.html.slice(best.tagEnd + 1);
        const activeLink = addAttr(addClassAttr(openTag, linkClass), "aria-current", "page") + restLink;
        const withLink = src.slice(0, best.start) + activeLink + src.slice(best.end);
        const liStart = openParentLiStart(src, best.start);
        if (liStart < 0 || !liClass) return withLink;

        const liOpenEnd = withLink.indexOf(">", liStart);
        if (liOpenEnd < 0 || liOpenEnd > best.start) return withLink;
        const liOpen = withLink.slice(liStart, liOpenEnd + 1);
        return withLink.slice(0, liStart) + addClassAttr(liOpen, liClass) + withLink.slice(liOpenEnd + 1);
        }

        function decorateDataNode(
        html: string,
        dataAttr: string,
        active: boolean,
        className = "is-active",
        aria = false,
        ) {
        if (!active) return html;
        const attr = String(dataAttr || "").trim();
        if (!attr) return html;
        const re = new RegExp(`<(?:a|button)\\b(?=[^>]*\\b${attr}\\b)[^>]*>`, "i");
        return html.replace(re, (tag) => {
        const withClass = addClassAttr(tag, className);
        return aria ? addAttr(withClass, "aria-current", "page") : withClass;
        });
        }

        function currentIsCurrent(current: CurrentNavigation, input: unknown, opts: CurrentMatchOptions = {}) {
        if (Array.isArray(input)) return input.some((item) => matchesCurrentPath(current.path, item, opts));
        return matchesCurrentPath(current.path, input, opts);
        }

        function currentAttrs(current: CurrentNavigation, input: unknown, opts: CurrentMatchOptions = {}) {
        return currentIsCurrent(current, input, opts) ? ' aria-current="page"' : "";
        }

        function currentLinkAttrs(current: CurrentNavigation, input: unknown, opts: CurrentMatchOptions = {}) {
        return currentIsCurrent(current, input, opts) ? ' class="is-active" aria-current="page"' : "";
        }

        function currentLiAttrs(current: CurrentNavigation, input: unknown, opts: CurrentMatchOptions = {}) {
        return currentIsCurrent(current, input, opts) ? ' class="active"' : "";
        }

        function currentClassName(
        current: CurrentNavigation,
        base: unknown,
        input: unknown,
        opts: CurrentMatchOptions = {},
        ) {
        return [String(base || "").trim(), currentIsCurrent(current, input, opts) ? "is-active" : ""]
        .filter(Boolean)
        .join(" ");
        }

        function currentMenuClass(current: CurrentNavigation, base: unknown, opts: { exclude?: unknown[] } = {}) {
        const exclude = Array.isArray(opts.exclude) ? opts.exclude : [];
        const active = current.path !== "/" && !currentIsCurrent(current, exclude);
        return [String(base || "").trim(), active ? "has-current-page is-active" : ""]
        .filter(Boolean)
        .join(" ");
        }

        function decorateBottomBarHtml(current: CurrentNavigation, html: unknown) {
        let out = String(html || "");
        out = decorateDataNode(out, "data-bottom-bar-apps", currentIsCurrent(current, "/apps"), "is-active", true);
        out = decorateDataNode(out, "data-bottom-bar-profile", currentIsCurrent(current, "/me"), "is-active", true);
        return out;
        }

        function createNavigationState(currentInput: Partial<CurrentNavigation> = EMPTY_CURRENT) {
        const current = {
        path: normalizeNavigationPath(currentInput.path),
        url: String(currentInput.url || currentInput.path || "/"),
        };

        return {
        current,
        isCurrent: (input: unknown, opts: CurrentMatchOptions = {}) => currentIsCurrent(current, input, opts),
        attrs: (input: unknown, opts: CurrentMatchOptions = {}) => currentAttrs(current, input, opts),
        linkAttrs: (input: unknown, opts: CurrentMatchOptions = {}) => currentLinkAttrs(current, input, opts),
        liAttrs: (input: unknown, opts: CurrentMatchOptions = {}) => currentLiAttrs(current, input, opts),
        className: (base: unknown, input: unknown, opts: CurrentMatchOptions = {}) =>
        currentClassName(current, base, input, opts),
        menuClass: (base: unknown, opts: { exclude?: unknown[] } = {}) => currentMenuClass(current, base, opts),
        decorate: (html: unknown, opts: DecorateOptions = {}) => decorateActiveLink(html, current.path, opts),
        decorateSidebar: (html: unknown, opts: DecorateOptions = {}) => decorateActiveLink(html, current.path, opts),
        decorateBottomBar: (html: unknown) => decorateBottomBarHtml(current, html),
        };
        }

        const defaultNavigationState = createNavigationState(EMPTY_CURRENT);

        export {
        createNavigationState,
        decorateActiveLink,
        defaultNavigationState,
        matchesCurrentPath,
        normalizeNavigationHref,
        normalizeNavigationHref as normalizeHref,
        normalizeNavigationPath,
        normalizeRequestPath,
        };
        export type { CurrentMatchOptions, CurrentNavigation, DecorateOptions };
