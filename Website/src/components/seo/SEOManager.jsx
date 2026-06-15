import { useEffect } from 'react';

/**
 * SEOManager Component
 * A robust, production-ready React SEO wrapper.
 * Dynamically handles document.title, meta descriptions, canonical URLs,
 * and OpenGraph/Twitter social cards using standard DOM operations.
 * Highly optimized to ensure zero layout-shifts and peak performance.
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the page.
 * @param {string} props.description - The page description for indexing.
 * @param {string} [props.canonical] - Optional canonical URL (defaults to window.location.href).
 * @param {string} [props.image] - Optional open-graph thumbnail image path.
 * @param {string} [props.type] - Optional og:type (defaults to 'website').
 */
export default function SEOManager({
  title,
  description,
  canonical,
  image = '/assets/smashhub-og.jpg',
  type = 'website'
}) {
  const baseTitle = 'SmashHub';
  const siteTagline = 'Premium Badminton Club & Court Management';

  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} - ${siteTagline}`;
    document.title = formattedTitle;

    // Helper: Get or create meta tag
    const getOrCreateMetaTag = (attribute, name) => {
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      return tag;
    };

    // Helper: Get or create link tag
    const getOrCreateLinkTag = (rel) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      return tag;
    };

    // 2. Set Meta Description
    if (description) {
      const metaDesc = getOrCreateMetaTag('name', 'description');
      metaDesc.setAttribute('content', description);
    }

    // 3. Set Canonical URL
    const canonicalURL = canonical || window.location.href;
    const canonicalLink = getOrCreateLinkTag('canonical');
    canonicalLink.setAttribute('href', canonicalURL);

    // 4. OpenGraph Metadata (Facebook, LinkedIn, Discord previews)
    const ogTitle = getOrCreateMetaTag('property', 'og:title');
    ogTitle.setAttribute('content', title ? title : `${baseTitle} - ${siteTagline}`);

    if (description) {
      const ogDesc = getOrCreateMetaTag('property', 'og:description');
      ogDesc.setAttribute('content', description);
    }

    const ogType = getOrCreateMetaTag('property', 'og:type');
    ogType.setAttribute('content', type);

    const ogUrl = getOrCreateMetaTag('property', 'og:url');
    ogUrl.setAttribute('content', window.location.href);

    const ogSiteName = getOrCreateMetaTag('property', 'og:site_name');
    ogSiteName.setAttribute('content', baseTitle);

    if (image) {
      const fullImagePath = image.startsWith('http') ? image : `${window.location.origin}${image}`;
      const ogImage = getOrCreateMetaTag('property', 'og:image');
      ogImage.setAttribute('content', fullImagePath);
    }

    // 5. Twitter Card Metadata
    const twCard = getOrCreateMetaTag('name', 'twitter:card');
    twCard.setAttribute('content', 'summary_large_image');

    const twTitle = getOrCreateMetaTag('name', 'twitter:title');
    twTitle.setAttribute('content', title ? title : `${baseTitle} - ${siteTagline}`);

    if (description) {
      const twDesc = getOrCreateMetaTag('name', 'twitter:description');
      twDesc.setAttribute('content', description);
    }

    if (image) {
      const fullImagePath = image.startsWith('http') ? image : `${window.location.origin}${image}`;
      const twImage = getOrCreateMetaTag('name', 'twitter:image');
      twImage.setAttribute('content', fullImagePath);
    }
  }, [title, description, canonical, image, type]);

  return null; // Renderless component
}
