import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import MarketingNav from '@/components/MarketingNav';
import { CookieBanner } from '@/components/CookieBanner';
import { seedBlogArticleVD2025, SEEDED_BLOG_ARTICLES } from '@/lib/seedBlogArticle';
const C = {
  yellow: '#FAC81E', dark: '#44484E', white: '#FFFFFF',
  bgLight: '#F5F5F7', textGray: '#6E6E73', border: '#E5E5E5',
};

interface FullPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  reading_time_minutes: number;
  published_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  reading_time_minutes: number;
  published_at: string;
}

const SEEDED_FULL_POSTS: FullPost[] = SEEDED_BLOG_ARTICLES.map((article, index) => ({
  id: `seed-${index}-${article.slug}`,
  title: article.title,
  slug: article.slug,
  excerpt: article.excerpt,
  content: article.content,
  cover_image_url: article.cover_image_url ?? null,
  category: article.category,
  reading_time_minutes: article.reading_time_minutes,
  published_at: article.published_at,
  updated_at: article.published_at,
  meta_title: article.meta_title,
  meta_description: article.meta_description,
}));

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<FullPost | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeHeading, setActiveHeading] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      await seedBlogArticleVD2025();

      const fallbackPost = SEEDED_FULL_POSTS.find(p => p.slug === slug) ?? null;
      const fallbackRelated = SEEDED_FULL_POSTS
        .filter(p => p.slug !== slug)
        .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
        .slice(0, 3)
        .map(({ id, title, slug: relatedSlug, excerpt, cover_image_url, category, reading_time_minutes, published_at }) => ({
          id,
          title,
          slug: relatedSlug,
          excerpt,
          cover_image_url,
          category,
          reading_time_minutes,
          published_at,
        }));

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      const resolvedPost = (error?.code === '42P01' || !data) ? fallbackPost : (data as FullPost);
      setPost(resolvedPost);

      const hMatches = (resolvedPost?.content || '').match(/^##\s+(.+)$/gm) || [];
      setHeadings(hMatches.map((h: string) => {
        const text = h.replace(/^##\s+/, '');
        return { id: slugify(text), text };
      }));

      if (error?.code === '42P01') {
        setRelated(fallbackRelated);
        setLoading(false);
        return;
      }

      if (error) {
        console.error('Failed loading blog post:', error.message);
        setRelated(fallbackRelated);
        setLoading(false);
        return;
      }

      const { data: rel, error: relError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, category, reading_time_minutes, published_at')
        .eq('published', true)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3);

      if (relError?.code === '42P01' || relError) {
        setRelated(fallbackRelated);
      } else {
        setRelated((rel as RelatedPost[]) ?? fallbackRelated);
      }

      setLoading(false);
    })();
  }, [slug]);

  // Active heading observer
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const jsonLd = useMemo(() => {
    if (!post) return [];
    return [{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.published_at,
      "dateModified": post.updated_at,
      "author": { "@type": "Person", "name": "Gaetano Ficarra", "url": "https://gaetanoficarra.de" },
      "publisher": { "@type": "Organization", "name": "GoBD-Suite", "logo": { "@type": "ImageObject", "url": "https://gobd-suite.de/images/logo.png" } },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://gobd-suite.de/blog/${post.slug}` },
      ...(post.cover_image_url ? { "image": post.cover_image_url } : {}),
    }];
  }, [post]);

  useSEO({
    title: post ? `${post.meta_title || post.title} | GoBD-Suite Blog` : 'Blog | GoBD-Suite',
    description: post?.meta_description || post?.excerpt || '',
    canonical: post ? `https://vd.gaetanoficarra.de/blog/${post.slug}` : undefined,
    ogTitle: post?.meta_title || post?.title,
    ogDescription: post?.meta_description || post?.excerpt,
    ogImage: post?.cover_image_url || undefined,
    ogType: 'article',
    robots: 'index, follow',
    jsonLd,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.white }}>
        <div className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.yellow, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: C.white, color: C.dark }}>
        <MarketingNav />
        <h1 className="text-2xl font-bold">Artikel nicht gefunden</h1>
        <Link to="/blog" className="font-semibold hover:opacity-70" style={{ color: C.dark }}>← Zurück zum Blog</Link>
      </div>
    );
  }

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      <MarketingNav />

      <main className="pt-20">
        {/* Header */}
        <div className="max-w-[720px] mx-auto px-6 pt-12 pb-8">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 hover:opacity-70 transition-opacity" style={{ color: C.textGray }}>
            <ArrowLeft size={14} /> Zurück zum Blog
          </Link>
          <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-5" style={{ background: C.yellow, color: C.dark }}>
            {post.category}
          </span>
          <h1 className="text-3xl md:text-[40px] font-bold leading-[1.15] mb-5" style={{ color: C.dark }}>
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: C.textGray }}>
            <span className="flex items-center gap-1.5"><User size={14} /> Gaetano Ficarra</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.published_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {post.reading_time_minutes} Min. Lesezeit</span>
          </div>
          <div className="mt-8" style={{ height: 1, background: C.border }} />
        </div>

        {/* Body with TOC */}
        <div className="max-w-7xl mx-auto px-6 flex gap-0">
          {/* Sticky TOC desktop */}
          {headings.length > 0 && (
            <aside className="hidden xl:block w-64 shrink-0">
              <div className="sticky top-24 pr-8">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.textGray }}>Inhalt</p>
                <ul className="space-y-1.5">
                  {headings.map(h => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="text-[13px] block py-1 pl-3 transition-all duration-200 leading-snug rounded-r"
                        style={{
                          color: activeHeading === h.id ? C.dark : C.textGray,
                          fontWeight: activeHeading === h.id ? 600 : 400,
                          borderLeft: `2px solid ${activeHeading === h.id ? C.yellow : 'transparent'}`,
                        }}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* Article */}
          <article className="flex-1 max-w-[720px] mx-auto pb-20">
            <div className="blog-prose">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* CTA Box */}
            <div className="mt-16 rounded-[18px] p-10 text-center relative overflow-hidden" style={{ background: C.bgLight }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: C.yellow }} />
              <h2 className="text-2xl font-bold mb-3" style={{ color: C.dark }}>Bereit deine Verfahrensdokumentation zu erstellen?</h2>
              <p className="mb-6" style={{ color: C.textGray }}>Starte jetzt kostenlos – ohne Kreditkarte, fertig in unter 60 Minuten.</p>
              <Link to="/test-starten" className="inline-flex items-center font-semibold text-[15px] transition-all duration-200 hover:shadow-lg"
                style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '14px 28px' }}
              >
                Jetzt kostenlos testen
              </Link>
            </div>
          </article>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="py-16 px-6" style={{ background: C.bgLight }}>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-8" style={{ color: C.dark }}>Weitere Artikel</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map(r => (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="block rounded-[18px] overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1" style={{ background: C.white, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                    <div className="aspect-[16/9] flex items-center justify-center" style={{ background: '#E8E8ED' }}>
                      {r.cover_image_url ? <img src={r.cover_image_url} alt={r.title} className="w-full h-full object-cover" loading="lazy" /> : <span className="text-sm" style={{ color: C.textGray }}>Titelbild</span>}
                    </div>
                    <div className="p-5">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2" style={{ background: C.bgLight, color: C.dark }}>{r.category}</span>
                      <h3 className="font-bold mb-1 leading-snug" style={{ color: C.dark }}>{r.title}</h3>
                      <p className="text-sm line-clamp-2" style={{ color: C.textGray }}>{r.excerpt}</p>
                      <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold" style={{ color: C.dark }}>Weiterlesen <ArrowRight size={14} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-xs" style={{ background: C.dark, color: 'rgba(255,255,255,0.5)' }}>
        © {new Date().getFullYear()} GoBD-Suite · <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link> · <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
      </footer>

      <CookieBanner />
    </div>
  );
}

/* ─── Helpers ─── */
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, '-').replace(/(^-|-$)/g, '');
}

/* ─── Markdown Renderer ─── */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---\s*$/.test(line.trim())) {
      elements.push(<hr key={key++} className="my-10" style={{ border: 'none', borderTop: `1px solid ${C.border}` }} />);
      i++;
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      const text = line.slice(3);
      const id = slugify(text);
      elements.push(
        <h2 key={key++} id={id} className="scroll-mt-24" style={{ fontSize: 28, fontWeight: 700, color: C.dark, marginTop: 48, marginBottom: 16, lineHeight: 1.3 }}>
          {text}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{ fontSize: 22, fontWeight: 600, color: C.dark, marginTop: 32, marginBottom: 12, lineHeight: 1.35 }}>
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} style={{ borderLeft: `4px solid ${C.yellow}`, paddingLeft: 24, margin: '24px 0', fontStyle: 'italic', color: C.textGray, fontSize: 18, lineHeight: 1.8 }}>
          {quoteLines.map((ql, j) => <p key={j}>{formatInline(ql)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Table (lines starting with |)
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Parse: first line = header, second = separator, rest = body
      const parseRow = (row: string) => row.split('|').slice(1, -1).map(c => c.trim());
      const headerCells = parseRow(tableLines[0]);
      const bodyRows = tableLines.slice(2).map(parseRow);
      elements.push(
        <div key={key++} className="overflow-x-auto my-8 rounded-[12px]" style={{ border: `1px solid ${C.border}` }}>
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.bgLight }}>
                {headerCells.map((c, j) => (
                  <th key={j} className="text-left px-4 py-3 font-semibold" style={{ color: C.dark, borderBottom: `1px solid ${C.border}` }}>{formatInline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: ri < bodyRows.length - 1 ? `1px solid ${C.border}` : undefined }}>
                  {row.map((c, ci) => (
                    <td key={ci} className="px-4 py-3" style={{ color: ci === 0 ? C.dark : C.textGray, fontWeight: ci === 0 ? 500 : 400 }}>{formatInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={key++} style={{ listStyleType: 'decimal', paddingLeft: 24, margin: '16px 0', color: C.textGray, fontSize: 18, lineHeight: 1.8 }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: 4 }}>{formatInline(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} style={{ listStyleType: 'disc', paddingLeft: 24, margin: '16px 0', color: C.textGray, fontSize: 18, lineHeight: 1.8 }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: 4 }}>{formatInline(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={key++} style={{ fontSize: 18, lineHeight: 1.8, color: C.textGray, marginBottom: 24 }}>
        {formatInline(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

function formatInline(text: string): React.ReactNode {
  // Process links and bold
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    // Check for link [text](url)
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)/s);
    // Check for bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)/s);

    if (linkMatch && (!boldMatch || linkMatch.index! <= boldMatch.index!)) {
      if (linkMatch[1]) parts.push(<span key={partKey++}>{linkMatch[1]}</span>);
      parts.push(
        <a key={partKey++} href={linkMatch[3]} target="_blank" rel="noopener noreferrer"
          className="transition-colors"
          style={{ color: C.yellow, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          {linkMatch[2]}
        </a>
      );
      remaining = linkMatch[4];
    } else if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={partKey++}>{boldMatch[1]}</span>);
      parts.push(<strong key={partKey++} style={{ color: C.dark, fontWeight: 600 }}>{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
    } else {
      parts.push(<span key={partKey++}>{remaining}</span>);
      remaining = '';
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
