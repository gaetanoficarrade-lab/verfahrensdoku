import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';
import MarketingNav from '@/components/MarketingNav';
import { seedBlogArticleVD2025 } from '@/lib/seedBlogArticle';

const C = {
  yellow: '#FAC81E', dark: '#44484E', white: '#FFFFFF',
  bgLight: '#F5F5F7', textGray: '#6E6E73', border: '#E5E5E5',
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  reading_time_minutes: number;
  published_at: string;
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 9;

  useSEO({
    title: 'Blog | GoBD-Suite',
    description: 'Alles über GoBD, Verfahrensdokumentation und digitale Buchführung.',
    canonical: 'https://vd.gaetanoficarra.de/blog',
    ogTitle: 'GoBD-Suite Blog',
    ogDescription: 'Alles über GoBD, Verfahrensdokumentation und digitale Buchführung.',
    robots: 'index, follow',
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { count } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('published', true);

      setTotal(count ?? 0);

      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, category, reading_time_minutes, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .range(from, to);

      setPosts((data as BlogPost[]) ?? []);
      setLoading(false);
    })();
  }, [page]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      <MarketingNav />

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <Reveal>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-[56px] font-bold leading-tight mb-4" style={{ color: C.dark }}>Blog</h1>
              <p className="text-lg max-w-lg mx-auto" style={{ color: C.textGray }}>Alles über GoBD, Verfahrensdokumentation und digitale Buchführung.</p>
            </div>
          </Reveal>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.yellow, borderTopColor: 'transparent' }} />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center py-20" style={{ color: C.textGray }}>Noch keine Artikel vorhanden.</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => (
                  <Reveal key={post.id} delay={i * 0.06}>
                    <Link to={`/blog/${post.slug}`} className="block rounded-[18px] overflow-hidden h-full transition-shadow hover:shadow-lg" style={{ background: C.white, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                      <div className="aspect-[16/9] flex items-center justify-center" style={{ background: '#E8E8ED' }}>
                        {post.cover_image_url ? (
                          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="text-sm" style={{ color: C.textGray }}>Titelbild</span>
                        )}
                      </div>
                      <div className="p-6">
                        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3" style={{ background: C.bgLight, color: C.dark }}>{post.category}</span>
                        <h2 className="text-lg font-bold mb-2 leading-snug" style={{ color: C.dark }}>{post.title}</h2>
                        <p className="text-sm mb-4 leading-relaxed line-clamp-2" style={{ color: C.textGray }}>{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs" style={{ color: C.textGray }}>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.published_at).toLocaleDateString('de-DE')}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {post.reading_time_minutes} Min.</span>
                        </div>
                        <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: C.dark }}>Weiterlesen <ArrowRight size={14} /></span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="w-10 h-10 rounded-full text-sm font-semibold transition-colors"
                      style={{ background: p === page ? C.yellow : C.bgLight, color: C.dark }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-xs" style={{ background: C.dark, color: 'rgba(255,255,255,0.5)' }}>
        © 2025 GoBD-Suite · <Link to="/impressum" className="hover:text-white">Impressum</Link> · <Link to="/datenschutz" className="hover:text-white">Datenschutz</Link>
      </footer>
    </div>
  );
}
