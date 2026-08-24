import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
}

export const SEO = ({ 
  title, 
  description, 
  canonical, 
  noindex = false 
}: SEOProps) => {
  const siteTitle = 'MockHire';
  const defaultTitle = 'MockHire | AI Mock Interview & ATS Analyzer Platform';
  const fullTitle = title ? `${title} | ${siteTitle}` : defaultTitle;
  const metaDescription = description || 'Practice realistic AI-powered mock interviews with voice conversations, receive detailed feedback, and improve your interview performance with MockHire.';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={`https://mockhire.me${canonical}`} />}
      
      {/* Open Graph / Social */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {canonical && <meta property="og:url" content={`https://mockhire.me${canonical}`} />}
      
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />

      {/* Indexing Rules */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
    </Helmet>
  );
};
