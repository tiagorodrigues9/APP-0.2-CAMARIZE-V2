import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Icons */}
        <link rel="icon" type="image/png" href="/images/favicon-camarize.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/logo_camarize1.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/logo_camarize2.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/images/logo_camarize2.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Camarize" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="application-name" content="Camarize" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* PWA Description */}
        <meta name="description" content="Sistema inteligente de monitoramento para cativeiros de camarão" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
