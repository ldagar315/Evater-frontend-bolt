import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, Tag } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { BlogCard } from '../components/blog/BlogCard'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useAuthContext } from '../contexts/AuthContext'
import { getPostBySlug, getRelatedPosts } from '../data/blogPosts'
import { BlogPost } from '../types/blog'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      const foundPost = getPostBySlug(slug)
      if (foundPost) {
        setPost(foundPost)
        setRelatedPosts(getRelatedPosts(foundPost))
        
        // Update page title and meta description
        document.title = foundPost.seo?.meta_title || `${foundPost.title} - Evater Blog`
        
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
          metaDescription.setAttribute('content', foundPost.seo?.meta_description || foundPost.excerpt)
        }
      }
      setLoading(false)
    }
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Convert markdown-like content to HTML (basic implementation)
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-dark mb-6 mt-8">{line.substring(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-dark mb-4 mt-6">{line.substring(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-dark mb-3 mt-5">{line.substring(4)}</h3>
        }
        
        // Bold text
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-bold text-dark mb-3">{line.slice(2, -2)}</p>
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return <li key={index} className="text-neutral-700 mb-2 ml-4">{line.substring(2)}</li>
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />
        }
        
        // Regular paragraphs
        return <p key={index} className="text-neutral-700 mb-4 leading-relaxed">{line}</p>
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-dark mb-2">Article Not Found</h2>
              <p className="text-neutral-600 mb-4">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/blog')}>
                Back to Blog
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Always show header/navigation */}
      <Header />
      
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-br from-neutral-900 to-neutral-800 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-neutral-900/40"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/blog')}
                className="text-white hover:text-primary-300 hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </div>
            
            <div className="mb-6">
              <span className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-neutral-200 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-neutral-300">
              <div className="flex items-center">
                <img
                  src={post.author.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1'}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium text-white">{post.author.name}</div>
                  <div className="text-sm text-neutral-400">{post.author.bio}</div>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(post.published_date)}
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2" />
                {post.read_time} min read
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-neutral-300 hover:text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="prose prose-lg max-w-none">
              <div className="text-lg leading-relaxed">
                {renderContent(post.content)}
              </div>
            </article>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="h-4 w-4 text-neutral-500 mr-2" />
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-800 transition-colors duration-200 cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <div className="flex items-start">
                <img
                  src={post.author.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1'}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-dark mb-1">About {post.author.name}</h3>
                  <p className="text-neutral-600">{post.author.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-dark mb-12 text-center">
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of educators and students using Evater to create better assessments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(user ? '/home' : '/auth')}
                className="text-dark font-bold"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/blog')}
                className="text-white border-white hover:bg-white hover:text-primary-600"
              >
                Read More Articles
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}