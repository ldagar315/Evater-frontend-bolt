import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { BlogPost } from '../../types/blog'

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/blog/${post.slug}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (featured) {
    return (
      <Card 
        className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-200"
        onClick={handleClick}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-neutral-600 mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(post.published_date)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.read_time} min read
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={post.author.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1'}
                alt={post.author.name}
                className="w-8 h-8 rounded-full mr-3"
              />
              <span className="text-sm font-medium text-dark">{post.author.name}</span>
            </div>
            
            <div className="flex items-center text-primary-600 group-hover:text-primary-700 font-medium">
              <span className="text-sm mr-1">Read More</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary-200"
      onClick={handleClick}
    >
      <div className="flex">
        <div className="w-1/3 relative overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        
        <CardContent className="w-2/3 p-4">
          <div className="mb-2">
            <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded text-xs font-medium">
              {post.category}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-dark mb-2 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {post.author.name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(post.published_date)}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {post.read_time} min
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}