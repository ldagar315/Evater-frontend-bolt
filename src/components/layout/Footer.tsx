import React from 'react'
import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Built with Bolt.new badge */}
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
            Built with Bolt.new
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
          
          {/* Copyright */}
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Evater. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}