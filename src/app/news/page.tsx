import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FaNewspaper } from 'react-icons/fa'

interface NewsItem {
  id: string
  title: string
  content: string
  category: string | null
  published_at: string | null
  created_at: string
}

const categoryColors: Record<string, string> = {
  renovation: 'bg-orange-100 text-orange-700',
  ordinance: 'bg-purple-100 text-purple-700',
  market: 'bg-blue-100 text-blue-700',
  general: 'bg-gray-100 text-gray-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
}

export default async function NewsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: news } = await supabase
    .from('news_updates')
    .select('id, title, content, category, published_at, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const items: NewsItem[] = (news ?? []) as NewsItem[]

  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">News & Updates</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Stay informed about property updates, community news, and important announcements.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FaNewspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No news updates at this time.</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for the latest updates.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <article key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {item.category && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[item.category] || 'bg-gray-100 text-gray-700'}`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(item.published_at || item.created_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h2>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">{item.content}</div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
