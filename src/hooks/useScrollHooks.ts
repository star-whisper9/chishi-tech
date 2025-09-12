import { useEffect, useState, useCallback } from "react";

interface UseScrollToTopOptions {
  threshold?: number; // pixels scrolled before considered "scrolled"
}

export default function useScrollToTop(options?: UseScrollToTopOptions) {
  const { threshold = 200 } = options || {};
  const [isScrolled, setIsScrolled] = useState(false);

  const onScroll = useCallback(() => {
    const scrolled =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;
    setIsScrolled(scrolled > threshold);
  }, [threshold]);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
    try {
      window.scrollTo({ top: 0, behavior });
    } catch {
      // fallback
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  return { isScrolled, scrollToTop } as const;
}
