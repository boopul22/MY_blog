import React from 'react';
import { Post } from '../types';

interface FAQItem {
  question: string;
  answer: string;
  author?: string;
  dateCreated?: string;
  upvoteCount?: number;
}

interface FAQSchemaProps {
  post: Post;
  faqs?: FAQItem[];
  pageUrl?: string;
}

const FAQSchema: React.FC<FAQSchemaProps> = ({ post, faqs, pageUrl }) => {
  // Generate default FAQs based on post content if none provided
  const defaultFAQs: FAQItem[] = [
    {
      question: `What is the main topic of "${post.title}"?`,
      answer: post.seoDescription || post.content.substring(0, 200) + '...'
    },
    {
      question: `Who wrote "${post.title}"?`,
      answer: `This article was written by ${post.authorName || 'our editorial team'}.`
    },
    {
      question: `When was "${post.title}" published?`,
      answer: `This article was published on ${new Date(post.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}.`
    }
  ];

  const faqItems = faqs && faqs.length > 0 ? faqs : defaultFAQs;

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": pageUrl ? `${pageUrl}#faq` : undefined,
    "mainEntity": faqItems.map((faq, index) => ({
      "@type": "Question",
      "@id": pageUrl ? `${pageUrl}#faq-${index + 1}` : undefined,
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "dateCreated": faq.dateCreated ? new Date(faq.dateCreated).toISOString() : undefined,
        "upvoteCount": faq.upvoteCount,
        "author": faq.author ? {
          "@type": "Person",
          "name": faq.author
        } : undefined
      },
      "answerCount": 1,
      "dateCreated": faq.dateCreated ? new Date(faq.dateCreated).toISOString() : undefined
    }))
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Visible FAQ Section */}
      <div className="mt-12 sm:mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-dark-text dark:text-light-text mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:w-8 after:h-0.5 after:bg-slate-800 dark:after:bg-slate-200">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div className="space-y-6">
          {faqItems.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-semibold text-dark-text dark:text-light-text mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FAQSchema;