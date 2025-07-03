import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Target, Brain, CheckCircle, Star, Users, Award, BookOpen, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Footer } from '../components/layout/Footer'
import { BlogSection } from '../components/blog/BlogSection'

export function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Test Generation',
      description: 'Create intelligent tests tailored to any subject, grade level, and difficulty with our advanced AI algorithms.',
      color: 'bg-primary-50 text-primary-600'
    },
    {
      icon: Target,
      title: 'OCR Answer Evaluation',
      description: 'Upload handwritten answer sheets and get instant, accurate scoring with detailed feedback using cutting-edge OCR technology.',
      color: 'bg-secondary-50 text-secondary-600'
    },
    {
      icon: Sparkles,
      title: 'Smart Feedback System',
      description: 'Receive comprehensive insights, error analysis, and personalized improvement suggestions for every question.',
      color: 'bg-purple-50 text-purple-600'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Tests Generated', icon: BookOpen },
    { number: '50,000+', label: 'Students Helped', icon: Users },
    { number: '95%', label: 'Accuracy Rate', icon: Target },
    { number: '4.9/5', label: 'User Rating', icon: Star }
  ]

  const benefits = [
    'Generate tests in seconds, not hours',
    'Support for all subjects and grade levels',
    'Automatic handwriting recognition',
    'Detailed performance analytics',
    'Personalized learning recommendations',
    'Export tests in multiple formats'
  ]

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-1">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 flex items-center justify-center">
                  <img 
                    src="/Evater_logo_2.png" 
                    alt="Evater Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-dark">Evater</h1>
                  <p className="text-xs text-neutral-600 font-medium">Next Gen Learning</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate('/blog')}
                  variant="ghost"
                  size="sm"
                  className="text-neutral-700 hover:text-primary-600"
                >
                  Blog
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-cream to-secondary-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full border border-primary-200 mb-8">
                <Zap className="h-4 w-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-800">Powered by Advanced AI</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-dark mb-8 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Test Creation
                </span>
                <span className="block">& Evaluation</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-neutral-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transform your educational experience with AI-powered test generation and intelligent answer sheet evaluation. 
                Create, evaluate, and improve learning outcomes in minutes, not hours.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-dark mb-2">{stat.number}</div>
                    <div className="text-neutral-600 font-medium">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-dark mb-6">
                Revolutionize Your Teaching
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Experience the power of AI-driven education technology that adapts to your needs and enhances learning outcomes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-200">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-8 w-8" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-dark mb-4">{feature.title}</h3>
                      <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <BlogSection />

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-dark mb-8">
                  Why Choose Evater?
                </h2>
                <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                  Join thousands of educators who have transformed their teaching experience with our cutting-edge platform.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-neutral-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <Award className="h-8 w-8 text-white mr-3" />
                      <span className="text-xl font-bold">Premium Features</span>
                    </div>
                    <ul className="space-y-2 text-white/90">
                      <li>• Unlimited test generation</li>
                      <li>• Advanced analytics dashboard</li>
                      <li>• Priority customer support</li>
                      <li>• Custom branding options</li>
                    </ul>
                  </div>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full text-dark font-bold"
                    onClick={() => navigate('/auth')}
                  >
                    Start Your Free Trial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join the educational revolution and experience the future of test creation and evaluation today.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              variant="secondary"
              size="lg"
              className="text-lg px-12 py-4 text-dark font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-white/80 text-sm mt-4">
              No credit card required • Free forever plan available
            </p>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}