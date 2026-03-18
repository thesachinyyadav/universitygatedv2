import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/socio.svg" />
        <link rel="apple-touch-icon" href="/socio.svg" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#154CB3" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="GATED" />
        
        {/* Improved PWA Compatibility */}
        <meta name="application-name" content="GATED" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#154CB3" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* SEO */}
        <meta name="description" content="Secure, efficient entry management for campus access and events. Powered by SOCIO." />
        <meta name="keywords" content="SOCIO, Gated Access, QR Code, Campus Entry, Event Management, Security" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SOCIO Gated Access Management" />
        <meta property="og:description" content="Secure, efficient entry management for campus events and access, powered by SOCIO." />
        <meta property="og:image" content="/socio.svg" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
        
        {/* Additional Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
