import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, BookOpen, TrendingUp } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { BlogCard } from '../components/blog/BlogCard'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { useAuthContext } from '../contexts/AuthContext'
import { blogPosts, blogCategories, getFeaturedPosts, searchPosts } from '../data/blogPosts'

export function BlogPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const featuredPosts = getFeaturedPosts()

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let posts = blogPosts.filter(post => post.status === 'published')

    // Apply search
    if (searchTerm) {
      posts = searchPosts(searchTerm)
    }

    // Apply category filter
    if (selectedCategory) {
      posts = posts.filter(post => post.category === selectedCategory)
    }

    // Sort by date (newest first)
    return posts.sort((a, b) => 
      new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    )
  }, [searchTerm, selectedCategory])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...blogCategories.map(cat => ({ value: cat.name, label: cat.name }))
  ]

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {user && <Header />}
      
      <div className="flex-1">
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

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center mb-12">
                <TrendingUp className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-dark">Featured Articles</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search and Filter Section */}
        <section className="py-12 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Filter className="h-5 w-5 text-neutral-600 mr-2" />
                  <h3 className="text-lg font-semibold text-dark">Find Articles</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={categoryOptions}
                  />
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {blogCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.name === selectedCategory ? '' : category.name)
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-neutral-700 hover:bg-primary-50 border border-neutral-300'
                      }`}
                    >
                      {category.name} ({category.post_count})
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                    {searchTerm && ` for "${searchTerm}"`}
                    {selectedCategory && ` in ${selectedCategory}`}
                  </>
                )}
              </p>
              
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                    setCurrentPage(1)
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {paginatedPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dark mb-2">No Articles Found</h3>
                  <p className="text-neutral-600 mb-4">
                    {searchTerm || selectedCategory 
                      ? 'Try adjusting your search criteria or browse all articles.'
                      : 'No articles are available at the moment.'
                    }
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                        setCurrentPage(1)
                      }}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View all articles
                    </button>
                  )}
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

        {/* Categories Overview */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-dark mb-4">Explore by Category</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Dive deeper into specific topics that interest you most
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogCategories.map((category) => (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary-200"
                  onClick={() => {
                    setSelectedCategory(category.name)
                    setCurrentPage(1)
                    document.getElementById('blog-posts')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-dark mb-2">{category.name}</h3>
                    <p className="text-neutral-600 text-sm mb-3">{category.description}</p>
                    <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {category.post_count} articles
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}