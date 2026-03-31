import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({ 
  title, 
  description, 
  image = "/og-image.png", 
  url = "https://towerdevelopers.com", 
  type = "website" 
}: SEOProps) => {
  const siteTitle = "Tower Developers";
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Lujo y Exclusividad en Buenos Aires`;
  const defaultDescription = "Descubrí las propiedades más exclusivas de Buenos Aires con Tower Developers. Departamentos de lujo, penthouses y desarrollos premium.";
  const metaDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Standard tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
