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
  url = "https://towerdevelopers.com.ar", 
  type = "website" 
}: SEOProps) => {
  const siteTitle = "Tower Developers";
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Lujo y Exclusividad en Buenos Aires`;
  const defaultDescription = "Descubrí las propiedades más exclusivas de Buenos Aires con Tower Developers. Departamentos de lujo, penthouses y desarrollos premium.";
  const metaDescription = description || defaultDescription;

  // Asegurar que la URL de la imagen sea siempre absoluta para que WhatsApp la detecte correctamente
  const imageUrl = image.startsWith("http") ? image : `https://towerdevelopers.com.ar${image}`;

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
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content={image.endsWith(".png") ? "image/png" : "image/jpeg"} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEO;
