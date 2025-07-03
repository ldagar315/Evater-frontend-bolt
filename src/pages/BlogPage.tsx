import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { BlogCard } from '../components/blog/BlogCard'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useAuthContext } from '../contexts/AuthContext'
import { blogPosts } from '../data/blogPosts'

export function BlogPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  // Get all published posts
  const filteredPosts = useMemo(() => {
    let posts = blogPosts.filter(post => post.status === 'published')

    // Sort by date (newest first)
    return posts.sort((a, b) => 
      new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    )
  }, [])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Always show header/navigation */}
      <Header />
      
      <div className="flex-1">
        {/* Navigation breadcrumb for non-authenticated users */}
        {!user && (
          <div className="bg-white border-b border-neutral-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center text-neutral-700 hover:text-primary-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 via-cream to-secondary-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full border border-primary-200 mb-8">
                <BookOpen className="h-4 w-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-800">Educational Insights & Updates</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-dark mb-6 leading-tight">
                Evater Blog
              </h1>
              
              <p className="text-xl lg:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover the latest insights in educational technology, study techniques, and learning innovations
              </p>
            </div>
          </div>
        </section>

        {/* Results Summary */}
        <section className="py-8 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <p className="text-neutral-600">
                {filteredPosts.length === 0 ? (
                  'No articles found'
                ) : (
                  <>
                    Showing {startIndex + 1}-{Math.min(startIndex + postsPerPage, filteredPosts.length)} of {filteredPosts.length} articles
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-cream" id="blog-posts">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {paginatedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dark mb-2">No Articles Found</h3>
                  <p className="text-neutral-600 mb-4">
                    No articles are available at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {paginatedPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}