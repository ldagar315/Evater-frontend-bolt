import React from 'react'
import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Create Test', to: '/create-test' },
  { label: 'Previous Tests', to: '/previous-tests' },
  { label: 'Previous Feedbacks', to: '/previous-feedbacks' },
  { label: 'Blog', to: '/blog' }
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-neutral-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-lg font-semibold text-dark">Evater</p>
            <p className="text-sm text-neutral-600">
              Helping educators craft smarter assessments with AI.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-neutral-600">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500">
          © {currentYear} Evater. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
