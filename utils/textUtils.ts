/**
 * Utility functions for text processing
 */

/**
 * Extracts plain text from HTML content
 * @param html - HTML string
 * @returns Plain text string
 */
export function extractTextFromHTML(html: string): string {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean up extra whitespace
  const text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up multiple spaces, newlines, and trim
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Creates an excerpt from text content
 * @param text - Plain text string
 * @param maxLength - Maximum length of excerpt
 * @returns Excerpt with ellipsis if truncated
 */
export function createExcerpt(text: string, maxLength: number = 150): string {
  if (!text) return '';
  
  const plainText = typeof text === 'string' && text.includes('<') 
    ? extractTextFromHTML(text) 
    : text;
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Find the last space before the max length to avoid cutting words
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Generates a reading time estimate
 * @param text - Text content
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  if (!text) return 0;
  
  const plainText = typeof text === 'string' && text.includes('<') 
    ? extractTextFromHTML(text) 
    : text;
  
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readingTime); // Minimum 1 minute
}
