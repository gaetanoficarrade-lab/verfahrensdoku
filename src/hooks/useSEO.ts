import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  ogLocale?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  jsonLd?: object[];
}

function normalizeCanonical(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function useSEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  ogLocale,
  twitterCard,
  twitterTitle,
  twitterDescription,
  keywords,
  author,
  robots,
  jsonLd,
}: SEOProps) {
  const normalizedCanonical = canonical ? normalizeCanonical(canonical) : undefined;

  useEffect(() => {
    const cleanup: (() => void)[] = [];

    function setMeta(name: string, content: string, attr = "name") {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      const existed = !!el;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", content);
      cleanup.push(() => {
        if (!existed) el!.remove();
        else if (prev) el!.setAttribute("content", prev);
      });
    }

    if (title) {
      const prev = document.title;
      document.title = title;
      cleanup.push(() => {
        document.title = prev;
      });
    }

    if (description) setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    if (author) setMeta("author", author);
    if (robots) setMeta("robots", robots);

    if (normalizedCanonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      const existed = !!link;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      const prev = link.getAttribute("href");
      link.setAttribute("href", normalizedCanonical);
      cleanup.push(() => {
        if (!existed) link!.remove();
        else if (prev) link!.setAttribute("href", prev);
      });
    }

    if (ogTitle) setMeta("og:title", ogTitle, "property");
    if (ogDescription) setMeta("og:description", ogDescription, "property");
    if (ogImage) setMeta("og:image", ogImage, "property");
    if (ogType) setMeta("og:type", ogType, "property");
    if (ogLocale) setMeta("og:locale", ogLocale, "property");
    if (normalizedCanonical) setMeta("og:url", normalizedCanonical, "property");

    if (twitterCard) setMeta("twitter:card", twitterCard);
    if (twitterTitle) setMeta("twitter:title", twitterTitle);
    if (twitterDescription) setMeta("twitter:description", twitterDescription);

    const scripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
      jsonLd.forEach((data) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
        scripts.push(script);
      });
    }

    return () => {
      cleanup.forEach((fn) => fn());
      scripts.forEach((s) => s.remove());
    };
  }, [
    title,
    description,
    normalizedCanonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    ogLocale,
    twitterCard,
    twitterTitle,
    twitterDescription,
    keywords,
    author,
    robots,
    jsonLd,
  ]);
}
