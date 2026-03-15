import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';

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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<FullPost | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (data) {
        setPost(data as FullPost);
        // extract headings from markdown
        const hMatches = (data.content || '').match(/^##\s+(.+)$/gm) || [];
        setHeadings(hMatches.map((h: string) => {
          const text = h.replace(/^##\s+/, '');
          return { id: text.toLowerCase().replace(/[^a-z0-9äöü]+/gi, '-'), text };
        }));

        // related posts
        const { data: rel } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, cover_image_url, category, reading_time_minutes, published_at')
          .eq('published', true)
          .neq('slug', slug)
          .order('published_at', { ascending: false })
          .limit(3);
        setRelated((rel as RelatedPost[]) ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

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
      "publisher": { "@type": "Organization", "name": "GoBD-Suite", "logo": { "@type": "ImageObject", "url": "https://vd.gaetanoficarra.de/images/logo.png" } },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://vd.gaetanoficarra.de/blog/${post.slug}` },
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
        <h1 className="text-2xl font-bold">Artikel nicht gefunden</h1>
        <Link to="/blog" className="font-semibold hover:opacity-70" style={{ color: C.dark }}>← Zurück zum Blog</Link>
      </div>
    );
  }

  // Simple markdown to HTML (handles ##, **, *, -, links, paragraphs)
  function renderMarkdown(md: string) {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('## ')) {
        const text = line.slice(3);
        const id = text.toLowerCase().replace(/[^a-z0-9äöü]+/gi, '-');
        elements.push(<h2 key={i} id={id} className="text-2xl font-bold mt-10 mb-4" style={{ color: C.dark }}>{text}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-xl font-bold mt-8 mb-3" style={{ color: C.dark }}>{line.slice(4)}</h3>);
      } else if (line.startsWith('- ')) {
        const items: string[] = [];
        while (i < lines.length && lines[i].startsWith('- ')) {
          items.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="list-disc pl-6 space-y-1 mb-4" style={{ color: C.textGray }}>
            {items.map((item, j) => <li key={j}>{formatInline(item)}</li>)}
          </ul>
        );
        continue;
      } else if (line.trim() === '') {
        // skip
      } else {
        elements.push(<p key={i} className="mb-4 leading-relaxed" style={{ color: C.textGray }}>{formatInline(line)}</p>);
      }
      i++;
    }
    return elements;
  }

  function formatInline(text: string): React.ReactNode {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: C.dark }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12" style={{ height: 64, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}` }}>
        <Link to="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: C.dark }}>
          <img src="/images/logo.png" alt="GoBD-Suite Logo" className="h-8" width={32} height={32} />
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/blog" className="text-[15px] font-medium hover:opacity-70" style={{ color: C.dark }}>Blog</Link>
          <Link to="/auth" className="text-[15px] font-medium hover:opacity-70" style={{ color: C.dark }}>Anmelden</Link>
        </div>
      </nav>

      <main className="pt-20">
        {/* Cover image */}
        <div className="w-full aspect-[21/9] max-h-[480px] flex items-center justify-center" style={{ background: '#E8E8ED' }}>
          {post.cover_image_url ? (
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: C.textGray }}>Titelbild</span>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
          {/* Sticky TOC desktop */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.textGray }}>Inhalt</p>
                <ul className="space-y-2">
                  {headings.map(h => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-sm hover:opacity-70 transition-opacity block leading-snug" style={{ color: C.dark }}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* Article */}
          <article className="flex-1 max-w-3xl">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:opacity-70" style={{ color: C.dark }}>
              <ArrowLeft size={14} /> Zurück zum Blog
            </Link>
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4" style={{ background: C.bgLight, color: C.dark }}>{post.category}</span>
            <h1 className="text-3xl md:text-[44px] font-bold leading-[1.15] mb-4" style={{ color: C.dark }}>{post.title}</h1>
            <div className="flex items-center gap-4 text-sm mb-10" style={{ color: C.textGray }}>
              <span>Gaetano Ficarra</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.published_at).toLocaleDateString('de-DE')}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {post.reading_time_minutes} Min. Lesezeit</span>
            </div>

            <div className="prose-custom">
              {renderMarkdown(post.content)}
            </div>

            {/* CTA */}
            <div className="mt-16 rounded-[18px] p-10 text-center" style={{ background: C.bgLight }}>
              <h2 className="text-2xl font-bold mb-3" style={{ color: C.dark }}>Bereit deine Verfahrensdokumentation zu erstellen?</h2>
              <p className="mb-6" style={{ color: C.textGray }}>Starte jetzt kostenlos – ohne Kreditkarte.</p>
              <Link to="/test-starten" className="inline-flex items-center font-semibold text-[15px]" style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}>
                Kostenlos testen
              </Link>
            </div>
          </article>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="py-16 px-6" style={{ background: C.bgLight }}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8" style={{ color: C.dark }}>Weitere Artikel</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map(r => (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="block rounded-[18px] overflow-hidden transition-shadow hover:shadow-lg" style={{ background: C.white, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                    <div className="aspect-[16/9] flex items-center justify-center" style={{ background: '#E8E8ED' }}>
                      {r.cover_image_url ? <img src={r.cover_image_url} alt={r.title} className="w-full h-full object-cover" loading="lazy" /> : <span className="text-sm" style={{ color: C.textGray }}>Titelbild</span>}
                    </div>
                    <div className="p-5">
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

      <footer className="py-12 px-6 text-center text-xs" style={{ background: C.dark, color: 'rgba(255,255,255,0.5)' }}>
        © 2025 GoBD-Suite · <Link to="/impressum" className="hover:text-white">Impressum</Link> · <Link to="/datenschutz" className="hover:text-white">Datenschutz</Link>
      </footer>
    </div>
  );
}
