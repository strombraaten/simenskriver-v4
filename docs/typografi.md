# Typografi

Typografien på simenskriver.no er definert i `src/styles/typography.css`. Den fila er eneste kilde til sannhet. Komponenter bruker rollene under, ikke Tailwind-størrelser.

## Fontene

- **Atkinson Hyperlegible Next**: all lesetekst og alle titler. Valgt for leselighet: tegn som ofte forveksles (Il1, O0) er tydelig forskjellige.
- **JetBrains Mono**: metadata, navigasjon, etiketter og kode. Gir et notatbok-preg rundt teksten.
- **JetBrains Mono kursiv**: kun sitater. Holdes eksklusiv, så kursiv mono alltid betyr «noen andres ord».

Logoen er Simens håndskrift (`SiteLogo.astro`) og er ikke en font. Den og og-bildet erstattes ikke.

Fontene lastes fra Google Fonts med disse snittene og ingen andre:

- Atkinson Hyperlegible Next: 400, 500, 700, 400 kursiv, 700 kursiv
- JetBrains Mono: 400, 500, 400 kursiv

## Skala

Trinn 0 er brødtekst. Hvert trinn ganges med 1,2 på mobil (360 px) og 1,333 på desktop (1280 px). Mellom de to skalerer verdien jevnt med `clamp()`. Trinn −2 er låst til 13–14 px.

| Token | Mobil px | Desktop px |
|---|---|---|
| `--step-4` | 37,32 | 66,3 |
| `--step-3` | 31,1 | 49,74 |
| `--step-2` | 25,92 | 37,31 |
| `--step-1` | 21,6 | 27,99 |
| `--step-0` | 18 | 21 |
| `--step--1` | 15 | 15,75 |
| `--step--2` | 13 | 14 |

## Roller

| Klasse | Font | px mobil → desktop | Linjehøyde | Brukes til |
|---|---|---|---|---|
| `.type-display` | Atkinson Hyperlegible Next 700 | 37,32 → 66,3 | 1 | 404-tallet. Bare der. |
| `.type-title` | Atkinson Hyperlegible Next 700 | 31,1 → 49,74 | 1,1 | Innleggstittel, hilsen på forsida, .prose h1. |
| `.type-page-title` | Atkinson Hyperlegible Next 700 | 25,92 → 37,31 | 1,15 | Sidetitler: tagg-side, Om meg. |
| `.type-h2` | Atkinson Hyperlegible Next 700 | 21,6 → 27,99 | 1,25 | Mellomtitler i innhold. |
| `.type-h3` | Atkinson Hyperlegible Next 700 | 18 → 21 | 1,35 | Undertitler, forrige/neste, PostCard-tittel, 404-undertittel. |
| `.type-body` | Atkinson Hyperlegible Next 400 | 18 → 21 | 1,65 | Brødtekst og lister. |
| `.type-list-item` | Atkinson Hyperlegible Next 500 | 18 → 21 | 1,4 | Innleggstitler i lister (forside, Tema-visning), søketreff. |
| `.type-small` | Atkinson Hyperlegible Next 400 | 15 → 15,75 | 1,5 | Bildetekster, søkeutdrag, «N notater med denne emneknaggen», bunntekst. |
| `.type-ui` | Atkinson Hyperlegible Next 500 | 15 → 15,75 | 1,3 | Knapper og skjemaelementer. |
| `.type-quote` | JetBrains Mono 400 kursiv | 18 → 21 | 1,6 | Sitater. Eneste sted kursiv mono brukes. |
| `.type-meta` | JetBrains Mono 400 | 13 → 14 | 1,5 | Dato (2022-12-01), emneknagger, navigasjon, faner. |
| `.type-label` | JetBrains Mono 500 | 13 → 14 | 1,4 | Gruppeoverskrifter (år, tema), seksjonstitler i søk, kbd, grafnoder. |
| `.type-code` | JetBrains Mono 400 | 0,875em | 1,6 | Inline-kode og kodeblokker. Relativ til omgivende tekst. |

## Regler

- Brødtekst er maks `30em` bred (≈ 60 tegn). `ch` brukes ikke, fordi den måler sifferet 0 og ville gitt ~70 tegn.
- Titler bruker vekt 700. 600 lastes ikke.
- Store bokstaver bare der de brukes i dag (gruppeoverskrifter for år og tema).
- Datoer skrives `2022-12-01`.
- Mørk modus endrer bare farger, aldri størrelser eller vekter.
- Ny tekststørrelse? Bruk et eksisterende trinn. Trengs et nytt, legg det til i `typography.css` og i denne tabellen samtidig.
