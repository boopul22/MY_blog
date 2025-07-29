import React from 'react';
import { Post } from '../types';
import { FacebookIcon, TwitterIcon, LinkedInIcon } from './icons';

interface AuthorInfoProps {
  post: Post;
  className?: string;
}

interface AuthorData {
  name: string;
  bio: string;
  avatar?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ post, className = '' }) => {
  // In a real application, this would come from a database or API
  // For now, we'll use default author information
  const getAuthorData = (authorName: string): AuthorData => {
    // Default author data - in production, this would be fetched from a database
    const defaultAuthors: Record<string, AuthorData> = {
      'default': {
        name: authorName || 'Editorial Team',
        bio: 'Our editorial team consists of experienced writers and industry experts who are passionate about sharing knowledge and insights with our readers. We strive to create content that is both informative and engaging.',
        socialLinks: {
          facebook: '#',
          twitter: '#',
          linkedin: '#'
        }
      }
    };

    return defaultAuthors['default'];
  };

  const author = getAuthorData(post.authorName);

  const socialIcons = [
    { icon: FacebookIcon, label: 'Facebook', url: author.socialLinks?.facebook },
    { icon: TwitterIcon, label: 'Twitter', url: author.socialLinks?.twitter },
    { icon: LinkedInIcon, label: 'LinkedIn', url: author.socialLinks?.linkedin }
  ];

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sm:p-8 ${className}`}>
      <h3 className="text-lg font-bold text-dark-text dark:text-light-text mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:w-8 after:h-0.5 after:bg-slate-800 dark:after:bg-slate-200">
        ABOUT THE AUTHOR
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Author Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
          {author.avatar ? (
            <img 
              src={author.avatar} 
              alt={author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-400 dark:bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">
                {author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* Author Info */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-xl font-bold text-dark-text dark:text-light-text mb-2">
            {author.name}
          </h4>
          
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            {author.bio}
          </p>
          
          {/* Social Links */}
          {author.socialLinks && (
            <div className="flex justify-center sm:justify-start items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Follow:</span>
              {socialIcons.map(({ icon: Icon, label, url }, index) => (
                url && (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary transition-colors"
                    aria-label={`Follow on ${label}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorInfo;