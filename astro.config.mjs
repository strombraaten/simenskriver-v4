import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkInternalLinks, remarkFolderImages, remarkImageCaptions } from './src/utils/internallinks.ts';
import remarkCallouts from './src/utils/remark-callouts.ts';
import remarkImageGrids from './src/utils/remark-image-grids.ts';
import remarkMermaid from './src/utils/remark-mermaid.ts';
import { remarkObsidianEmbeds } from './src/utils/remark-obsidian-embeds.ts';
import remarkBases from './src/utils/remark-bases.ts';
import remarkInlineTags from './src/utils/remark-inline-tags.ts';
import { remarkObsidianComments } from './src/utils/remark-obsidian-comments.ts';
import remarkObsidianImageSize from './src/utils/remark-obsidian-image-size.ts';
import remarkMath from 'remark-math';
import remarkReadingTime from 'remark-reading-time';
import remarkToc from 'remark-toc';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeMark from './src/utils/rehype-mark.ts';
import rehypeImageAttributes from './src/utils/rehype-image-attributes.ts';
import { rehypeNormalizeAnchors } from './src/utils/rehype-normalize-anchors.ts';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { siteConfig } from './src/config.ts';
import swup from '@swup/astro';
import refreshContentOnChange from './src/integrations/refresh-content-on-change.ts';
import { fileURLToPath } from 'node:url';

// Deployment platform configuration
const DEPLOYMENT_PLATFORM = process.env.DEPLOYMENT_PLATFORM || 'netlify';

export default defineConfig({
  site: siteConfig.site,
  deployment: {
    platform: DEPLOYMENT_PLATFORM
  },
  csp: {
    scriptDirective: {
      resources: [
        "'self'",
        "'unsafe-inline'",
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://giscus.app",
        "https://platform.twitter.com"
      ]
    },
    styleDirective: {
      resources: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ]
    },
    fontDirective: {
      resources: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ]
    },
    imgDirective: {
      resources: ["'self'", "data:", "https:"]
    },
    connectDirective: {
      resources: ["'self'", "https://giscus.app"]
    },
    frameDirective: {
      resources: [
        "'self'",
        "https://www.youtube.com",
        "https://giscus.app",
        "https://platform.twitter.com"
      ]
    }
  },
  devToolbar: {
    enabled: true
  },
  redirects: (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'build') ? {
  "/posts/hva jeg lærte av å skrive 25 artikler på 23 dager": "/posts/25-artikler-23-dager",
  "/posts/4000 uker, og kommentarer i margen": "/posts/4000-uker",
  "/posts/about-me": "/posts/about",
  "/posts/apper": "/posts/apper-jeg-liker",
  "/posts/assosiativ skriving": "/posts/assosiativ-skriving",
  "/posts/bærekraftig webutvikling": "/posts/barekraftig-webutvikling",
  "/posts/kagi": "/posts/betale-for-googling",
  "/posts/betale for søketjenesten": "/posts/betale-for-googling",
  "/posts/hva om du hadde betalt for å google": "/posts/betale-for-googling",
  "/posts/det er noe feil med blogging som konsept": "/posts/blogging-som-konsept",
  "/posts/En hyllest til den digitale blyanten": "/posts/blyanten",
  "/posts/den digitale blyanten": "/posts/blyanten",
  "/posts/verdien av bøker du ikke har lest": "/posts/boker-du-ikke-har-lest",
  "/posts/anti-bibliotek": "/posts/boker-du-ikke-har-lest",
  "/posts/om å bruke det du lærer": "/posts/bruk-det-du-larer",
  "/posts/bruk det du lærer": "/posts/bruk-det-du-larer",
  "/posts/Fortløpende brukertesting, og verdien av det": "/posts/brukertesting",
  "/posts/verdien av fortløpende brukertesting": "/posts/brukertesting",
  "/posts/contact-me": "/posts/contact",
  "/posts/the cult of done": "/posts/cult-of-done",
  "/posts/cleanshot": "/posts/den-ene-funksjonen",
  "/posts/evergreen notes": "/posts/digital-hage",
  "/posts/digitalt hagearbeid": "/posts/digital-hage",
  "/posts/Ditt framtidige, fremmede jeg": "/posts/ditt-fremmede-jeg",
  "/posts/Don't make me think": "/posts/dont-make-me-think",
  "/posts/dum ned smarttelefon": "/posts/dum-ned-smarttelefonen",
  "/posts/hvorfor du burde dumme ned smarttelefonen din": "/posts/dum-ned-smarttelefonen",
  "/posts/Hvorfor ekspert-testing burde være en del av designprosessen": "/posts/ekspert-testing",
  "/posts/ett formål om gangen": "/posts/ett-formal",
  "/posts/få mer ut av tida di": "/posts/fa-mer-ut-av-tida-du-bruker",
  "/posts/variabler i Figma": "/posts/figma-variabler",
  "/posts/fridager med intensjon": "/posts/firedagers-uke",
  "/posts/følg nysgjerrigheten": "/posts/folg-nysgjerrigheten",
  "/posts/Hva er forskjellen med et nyhetsbrev og å publisere på sosiale medier?": "/posts/forskjellen-mellom-nyhetsbrev-og-sosiale-medier",
  "/posts/forskjellen mellom å publisere et nyhetsbrev og å publisere på sosiale medier": "/posts/forskjellen-mellom-nyhetsbrev-og-sosiale-medier",
  "/posts/Hvorfor jeg blir så gira av Obsidian": "/posts/gira-av-obsidian",
  "/posts/grunnleggende om git": "/posts/git",
  "/posts/Github Publisher": "/posts/github-publisher",
  "/posts/Fra å være en god designer til å bli en dårlig utvikler": "/posts/god-designer-darlig-utvikler",
  "/posts/fra god designer til en dårlig utvikler": "/posts/god-designer-darlig-utvikler",
  "/posts/hva basket har lært meg om å være en god kollega": "/posts/god-kollega",
  "/posts/gode spørsmål": "/posts/gode-sporsmal",
  "/posts/HTML": "/posts/html",
  "/posts/kvalitet": "/posts/hva-betyr-kvalitet",
  "/posts/Hva betyr egentlig kvalitet?": "/posts/hva-betyr-kvalitet",
  "/posts/Hva holder jeg på med?": "/posts/hva-holder-jeg-på-med",
  "/posts/hvor ord egentlig kommer fra": "/posts/hvor-ord-kommer-fra",
  "/posts/Hvordan jeg bruker kunstig intelligens for å oversette": "/posts/hvordan-bruke-AI-for-oversetting",
  "/posts/Hvordan snakker du med en maskin?": "/posts/hvordan-snakke-med-en-maskin",
  "/posts/hvordan snakker du med en maskin": "/posts/hvordan-snakke-med-en-maskin",
  "/posts/hvordan vi leser bøker": "/posts/hvordan-vi-leser-boker",
  "/posts/Hvorfor vedlikeholder vi vaner?": "/posts/hvorfor-vedlikeholde-vaner",
  "/posts/hvorfor vi vedlikeholder vaner": "/posts/hvorfor-vedlikeholde-vaner",
  "/posts/hypotesedrevet produktutvikling": "/posts/hypoteser",
  "/posts/hypotesedrevet tilnærming": "/posts/hypoteser",
  "/posts/bedragersyndromet": "/posts/imposter-syndrome",
  "/posts/innsiktsbibliotek som eksperiment": "/posts/innsiktsbibliotek",
  "/posts/Jake Knapp": "/posts/jake-knapp",
  "/posts/Gleden av å gi et kompliment": "/posts/jake-knapp",
  "/posts/readwise": "/posts/klisterhjerne",
  "/posts/digital klisterhjerne": "/posts/klisterhjerne",
  "/posts/kultur for tilbakemelding": "/posts/kultur-for-tilbakemelding",
  "/posts/tilbakemeldingskultur": "/posts/kultur-for-tilbakemelding",
  "/posts/Hvordan passer kunstig intelligens inn i arbeidsflyten min?": "/posts/kunstig-intelligens-arbeidsflyt",
  "/posts/arbeidsflyt for kunstig intelligens": "/posts/kunstig-intelligens-arbeidsflyt",
  "/posts/Kunstig intelligens som sparringspartner": "/posts/kunstig-intelligens-som-sparringspartner",
  "/posts/AI som sparringspartner": "/posts/kunstig-intelligens-som-sparringspartner",
  "/posts/hvordan du kan bruke kunstig intelligens som sparringspartner": "/posts/kunstig-intelligens-som-sparringspartner",
  "/posts/AI": "/posts/kunstig-intelligens",
  "/posts/å lære åpent": "/posts/lare-apent",
  "/posts/Maggie": "/posts/maggie-appleton",
  "/posts/Maggie Appleton": "/posts/maggie-appleton",
  "/posts/meninga med livet": "/posts/meninga-med-livet",
  "/posts/Menneskelig vedlikehold": "/posts/menneskelig-vedlikehold",
  "/posts/Hadde jeg hatt mer tid skulle jeg skrivi en kortere artikkel": "/posts/mer-tid",
  "/posts/rubberducking": "/posts/metaforiske-mentorer",
  "/posts/momentum skaper momentum": "/posts/momentum",
  "/posts/nå-sida": "/posts/na-sida",
  "/posts/den neste nye tingen": "/posts/neste-nye",
  "/posts/Gjør enhver nettside til en app på macen": "/posts/nettside-til-app",
  "/posts/fra nettside til app": "/posts/nettside-til-app",
  "/posts/Hvorfor jeg går rundt med en notatbok i lomma": "/posts/notatbok",
  "/posts/Nyhetsbrev på 1-2-3": "/posts/nyhetsbrev-pa-123",
  "/posts/Håndtegna notater i Obsidian": "/posts/obsidian-tegning",
  "/posts/Obsidian": "/posts/obsidian",
  "/posts/oppfølgingsspørsmål": "/posts/oppfolgingssporsmal",
  "/posts/Om oppmerksomhet": "/posts/oppmerksomhet",
  "/posts/Optimalisere eller fornøydifisere": "/posts/optimalisere",
  "/posts/Parkinsons lov": "/posts/parkinsons-lov",
  "/posts/hva om favoritt-podkasten din hadde en egen chatbot": "/posts/podbot",
  "/posts/prisen av en dårlig brukeropplevelse": "/posts/prisen-av-ux",
  "/posts/privacy": "/posts/privacy-policy",
  "/posts/mitt syn på rabattkoder": "/posts/rabatt",
  "/posts/hva er et rikt liv for deg?": "/posts/rikt-liv",
  "/posts/senke terskelen for å publisere": "/posts/senke-terskelen-for-publisering",
  "/posts/Simen-spørsmål": "/posts/simen-sporsmal",
  "/posts/hva er egentlig et Simen-spørsmål": "/posts/simen-sporsmal",
  "/posts/Å skape løsningen i fellesskap": "/posts/skape-løsningen-i-fellesskap",
  "/posts/å lage løsningen i fellesskap": "/posts/skape-løsningen-i-fellesskap",
  "/posts/ansvar for egen skjermtid": "/posts/skjermtid",
  "/posts/Skriv for deg selv, ikke for andre": "/posts/skriv-for-deg-selv",
  "/posts/hva vil du at jeg skal skrive mer om": "/posts/skrive-mer-om",
  "/posts/skriveprosessen min på 6 minutter": "/posts/skriveprosessen",
  "/posts/Snøballeffekten av læring": "/posts/snoballeffekten-av-laring",
  "/posts/starter en podkast": "/posts/starter-en-podkast",
  "/posts/de ulike stegene av et notat": "/posts/stegene-av-et-notat",
  "/posts/en tanke i utvikling": "/posts/tanke-i-utvikling",
  "/posts/betydningen av at noe er enkelt": "/posts/tastatur",
  "/posts/Andre notater som linker tilbake": "/posts/tilbakekoblinger",
  "/posts/Å tilrettelegge for tilfeldigheter": "/posts/tilrettelegge-for-tilfeldigheter",
  "/posts/tilrettelegge for tilfeldigheter": "/posts/tilrettelegge-for-tilfeldigheter",
  "/posts/tilfeldigheter": "/posts/tilrettelegge-for-tilfeldigheter",
  "/posts/TK-trikset": "/posts/tk-trikset",
  "/posts/å tørre og spørre": "/posts/torre-a-sporre",
  "/posts/utdaterte titler": "/posts/utdaterte-titler",
  "/posts/Hva jeg har lært av utviklere om designprosessen": "/posts/utviklere-om-designprosessen",
  "/posts/vent nå litt": "/posts/vent-litt",
  "/posts/versjonslogg 0.2": "/posts/versjonslogg-02",
  "/posts/verstinger på elektronisk søppel": "/posts/verstinger",
  "/posts/Hvorfor bruker vi ikke vertikale skjermer i større grad?": "/posts/vertikale-skjermer",
  "/posts/vertikal skjermer": "/posts/vertikale-skjermer",
  "/posts/Vim med Colemak-layout": "/posts/vim-colemak",
  "/posts/Bruk av Vim i obsidian": "/posts/vim-obsidian",
  "/posts/Vim i Obsidian": "/posts/vim-obsidian",
  "/posts/et oppslagsverk for Vim": "/posts/vim-oppslagsverk",
  "/posts/en introduksjon til Vim": "/posts/vim",
  "/posts/skap en felles forståelse ved å visualisere": "/posts/visualisering",
  "/posts/årlig vurdering": "/posts/vurdering-av-aret",
  "/posts/vurdering av året": "/posts/vurdering-av-aret",
  "/posts/Write blind, edit later": "/posts/write-blind",
  "/posts/Zettelkasten": "/posts/zettelkasten",
  "/posts/en introduksjon til Zettelkasten": "/posts/zettelkasten"
} : {},
image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      }
    },
    remotePatterns: [{
      protocol: 'https'
    }]
  },
  integrations: [
    refreshContentOnChange(),
    tailwind(),
    sitemap(),
    mdx(),
    swup({
      theme: false,
      animationClass: 'transition-swup-',
      containers: ['#swup-container'],
      smoothScrolling: false,
      cache: process.env.NODE_ENV === 'production', // off in dev so post edits show immediately
      preload: true,
      accessibility: false,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
      plugins: [], // Disable all plugins including scroll
      skipPopStateHandling: (event) => {
        // ALWAYS skip Swup handling for back/forward navigation
        // Let the browser handle it naturally
        return true;
      },
      // Simplified link selector for better compatibility
      linkSelector: 'a[href]:not([data-no-swup]):not([href^="mailto:"]):not([href^="tel:"])'
    })
  ],
  markdown: {
      remarkPlugins: [
      remarkObsidianImageSize, // Parse Obsidian image size syntax first
      remarkInternalLinks,
      remarkInlineTags,
      remarkObsidianComments, // Remove Obsidian comments (%%...%%) early in processing
      remarkFolderImages,
      remarkObsidianEmbeds,
      // Bases directive (table-only v1)
      remarkBases,
      remarkImageCaptions,
      remarkMath,
      remarkCallouts,
      remarkBreaks,
      remarkImageGrids,
      remarkMermaid,
      [remarkReadingTime, {}],
      [remarkToc, {
        tight: true,
        ordered: false,
        maxDepth: 3,
        heading: 'contents|table[ -]of[ -]contents?|toc'
      }],
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeMark,
      rehypeImageAttributes,
      [rehypeSlug, {
        test: (node) => node.tagName !== 'h1'
      }],
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        test: (node) => node.tagName !== 'h1',
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to this section'
        }
      }],
      rehypeNormalizeAnchors, // Run LAST to ensure className and href fixes aren't overridden
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  vite: {
    assetsInclude: ['**/*.base', '**/*.home', '**/*.base'],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@/layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@/types': fileURLToPath(new URL('./src/types.ts', import.meta.url)),
        '@/config': fileURLToPath(new URL('./src/config.ts', import.meta.url))
      }
    },
    server: {
      host: 'localhost',
      port: 5000,
      strictPort: false, // Allow fallback to 5001 if 5000 is occupied (e.g., AirPlay on macOS)
      allowedHosts: [],
      middlewareMode: false,
      hmr: true,
      watch: {
        ignored: ['**/.obsidian/**', '**/_bases/**', '**/bases/**'],
        usePolling: process.platform === 'win32',
        interval: 1000
      },
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        // CSP headers are handled by src/middleware.ts for all routes
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.ASTRO_CONTENT_COLLECTION_CACHE': 'false'
    },
    optimizeDeps: {
      exclude: ['astro:content']
    },
    exclude: ['**/_redirects']
  },
  build: {
    assets: '_assets'
  }
});
