import { useEffect, useRef, useCallback } from "react";
import { pages } from "../../pages";
import { CONSTS } from "../../config/consts";

interface TitleManagerProps {
  title?: string;
  titleSuffix?: string; // e.g., site name
}

/**
 * TitleManager - centralize document.title management with multi-layer fallback:
 * 1) use manual `title` prop (with optional `titleSuffix`)
 * 2) fallback to matching entry in `src/pages/index.tsx` by current path
 * 3) final fallback: last path segment + `titleSuffix` or DEFAULT_SUFFIX
 *
 * Also listens to SPA navigation (pushState/replaceState/popstate) to update title.
 */
export default function TitleManager({
  title,
  titleSuffix,
}: TitleManagerProps) {
  const originalTitle = useRef<string | null>(null);

  const getPathname = () => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname || "/";
  };

  const computeTitle = useCallback(() => {
    const suffix = titleSuffix ?? CONSTS.DEFAULT_SUFFIX;
    const normalize = (p: string) => {
      if (!p) return "/";
      let s = p;
      if (!s.startsWith("/")) s = "/" + s;
      if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
      return s;
    };

    const lastSegment = (p: string) => {
      const s = normalize(p);
      if (s === "/") return "主页";
      const segs = s.split("/");
      return segs[segs.length - 1] || "主页";
    };

    const resolveFromPages = (pathname: string) => {
      const np = normalize(pathname);
      for (const pg of pages) {
        const link = normalize(pg.link || "");
        if (np === link) return pg.title;
        if (link !== "/" && np.startsWith(link + "/")) return pg.title;
      }
      return undefined;
    };

    // 1) explicit prop
    if (title) {
      return `${title} - ${suffix}`;
    }

    // 2) try to resolve from pages list
    const pathname = getPathname();
    const pageTitle = resolveFromPages(pathname);
    if (pageTitle) {
      return `${pageTitle} - ${suffix}`;
    }

    // 3) fallback to last path segment + suffix
    const seg = lastSegment(pathname);
    return `${seg} - ${suffix}`;
  }, [title, titleSuffix]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (originalTitle.current === null) {
      originalTitle.current = document.title;
    }

    const apply = () => {
      const t = computeTitle();
      if (t) document.title = t;
    };

    // install history listeners once per page (safe guard)
    type HistFn = (...args: unknown[]) => unknown;
    type WindowWithPatch = Window & { __titleManagerLocationPatched?: boolean };
    const win = window as unknown as WindowWithPatch;
    if (!win.__titleManagerLocationPatched) {
      const wrap = (type: "pushState" | "replaceState") => {
        const hist = history as unknown as Record<string, HistFn>;
        const orig = hist[type];
        hist[type] = function (this: unknown, ...args: unknown[]) {
          const res = orig.apply(this, args);
          window.dispatchEvent(new Event("locationchange"));
          return res;
        };
      };
      wrap("pushState");
      wrap("replaceState");
      win.__titleManagerLocationPatched = true;
    }

    // listen to location changes
    window.addEventListener("locationchange", apply);
    window.addEventListener("popstate", apply);
    window.addEventListener("hashchange", apply);

    // apply initially
    apply();

    return () => {
      window.removeEventListener("locationchange", apply);
      window.removeEventListener("popstate", apply);
      window.removeEventListener("hashchange", apply);

      // restore original title on unmount
      if (originalTitle.current != null) {
        document.title = originalTitle.current;
      }
    };
  }, [computeTitle]);

  return null;
}
