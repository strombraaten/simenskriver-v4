---
title: Under panseret
date: 2026-05-15
permalink: under-panseret
description: ""
tags:
  - behind-the-scenes
hideTOC: false
targetKeyword: ""
draft: true
---
Som jeg har nevnt tidligere kan jeg finne på å bruke evigheter på å skreddersy et system rundt en oppgave. Samtidig som det ville tatt meg kortere tid å bare gjøre selve oppgava. Det er i aller høyeste grad gjeldende når det kommer til det nyhetsbrevet her. Eller bloggen. Men *akkurat* det der, at det tilsynelatende er en forskjell mellom det du leser på bloggen og nyhetsbrevet, det har jeg funnet en løsning på nå.

Så her er det bare å sæla på! For detta blir nerdete.

## Fugleperspektivet

For å gjøre det lettere å forstå detaljene tenker jeg det er nyttig å zoome ut, for å forstå hva som skjer.

1. Starter med å skrive
2. Publiserer det på bloggen – simenskriver.no
3. Sender det som nyhetsbrev på epost til fine folk som deg sjøl ([hint-hint](https://buttondown.com/simenskriver))

I bunn og grunn er det alt. Men en del av skriveprosessen er også å gjøre eventuelle bilder klare til å publiseres på internett. Det vil si at jeg typisk sett må gjøre filstørrelsen mindre, ved å redusere både størrelsen og kvaliteten på bildet, og formatet det eksporteres i (fra jpeg til webp). Også kjent som bilde-optimalisering.

## Arbeidsflyten

[Obsidian](posts/obsidian.md) er altså der jeg skriver. Det er også der referansene mine ligger, som bare vil si at det er en mappe med tekstfiler, med høydepunkt fra bøker jeg har lest, podkaster jeg har hørt på osv. 

![referanser-bøker](attachments/referanser-bker.png)

Om du vil forstå hvordan det funker kan du lese om det i [Digital klisterhjerne](posts/klisterhjerne.md). Kort fortalt er det inspirasjonskildene mine, som ofte sparker i gang nye skriverier.

Når jeg da har skrevet noe ferdig, eller at det er "ferdig nok" for øyeblikket (ref [Digitalt hagearbeid](posts/digital-hage.md)), trykker jeg på en hurtigtast – `cmd+shift+s` for å være spesifikk — og dermed publiseres den fila til Github. Takket være [en plugin som heter Obsidian git](https://community.obsidian.md/plugins/obsidian-git). 

Fra Github publiseres den automatisk til simenskriver.no, gjennom [Vercel](https://vercel.com/) (som tar handling når Github sier i fra), hvor nettsida mi kjører. 

Det fører også til at [rss-feeden min](https://www.simenskriver.no/rss.xml) oppdateres, som bare betyr at bloggposten i sin enkleste form er inkludert i den fila. Og én gang i uka [sjekker Buttondown (automatisk) om det har dukket opp noe nytt](https://docs.buttondown.com/rss-to-email) i den rss-fila. I dette tilfelle har det det, nettopp det du leser nå. Og da opprettes et utkast på et nyhetsbrev i Buttondown, med kun det nye innholdet som dukka opp i rss-feeden.

I tillegg legges det på en start og en slutt, for å pakke det mer inn som et nyhetsbrev. Det eneste jeg trenger å gjøre da er å se gjennom, og trykke på send, for at du skal få det servert på et sølvfat i innboksen din.

## Konklusjon

Altså.. hvor digg er ikke det der a? Herregud. Det der har jeg brukt mer tid på enn jeg liker å innrømme.

Som en bonus inkluderer det også en automatisert "optimalisering" av bilder, så jeg ikke må gjøre det manuelt. Det betyr at filstørrelsen gjøres mindre, fordi kvaliteten på bildet reduseres i en viss grad, og formatet på fila byttes til webp, som alt i alt ender opp med en langt mindre filstørrelse. Den biten der gjelder riktignok kun til bloggen, og ikke nyhetsbrevet.


![](attachments/obsidian-buttondown.mp4)

## Bonus-info til nerdene mine der ute

Hvis du vil prøve noe lignende er det nyttig å vite at jeg måtte tilpasse rss-feeden for å hente ut riktig innhold. Når Buttondown ser etter noe nytt fra sida di så ser den spesifikt etter `content:encoded` for å hente ut selve innholdet i bloggposten. Astro, som jeg bruker for nettsida mi, gir deg ikke det ut boksen for å si det sånn. De tar heller utgangspunkt i `description`. Men etter litt fram-og-tilbake med [Claude](https://claude.ai/) så fikk jeg fiksa det. Helt spesifikt involverte det å legge til to pakker som heter `markdown-it` og `sanitize-html`. 

Når jeg uansett skulle prøve å bygge opp sida på nytt, så testa jeg å bruke [VaultCMS](https://vaultcms.org/), og [Astro Modular-designet](https://astro-modular.netlify.app/), som er lagd av samme typen – [David Kimball](https://davidvkimball.com/). Der fikk jeg veldig mye gratis, men tilpassa det også en del for å få det sånn som jeg vil ha det.

En av de tinga som jeg "fikk gratis" gjennom VaultCMS var nettopp at [syntaksen](syntaks.md) til Obsidian blir fjerna, eller oversatt til et format som Buttondown kan bruke i eposten sin. 

For å sitere Claude:

> Obsidian-spesifikk syntaks rendres ikke automatisk riktig i en e-post. Fire ting håndteres manuelt i `src/pages/rss.xml.ts`:
> 
> - `[[wikilenker]]` slås opp i en map over alle posts og gjøres til ekte `<a>`-lenker
> - `![[bilde.png]]` konverteres til absolutte `<img>`-lenker (med full URL, ikke relativ)
> - Obsidian-callouts (`> [!NOTE]`) forenkles til vanlige blokksitater (`> `)
> - `%%kommentarer%%` fjernes

En siste ting jeg sleit med var at bilder i en epost ikke blei beskjært riktig. Men det fikk jeg fiksa med at `<img>`-taggene i rss-feeden fikk en inline `style="max-width: 100%; height: auto; display: block;"`. Såvidt jeg skjønner gjøres det gjennom en `transformTags`-funksjon i `sanitize-html`.

Phew! Det var mye teknisk. Og det meste er i grunn mer enn jeg kan forstå, så jeg hadde jo ikke fått til alt det der uten Claude. Men det er gøy å se hva som går an nå, med litt tålmodighet og pirking.

## En siste ting

Ser du noe som virker unødvendig i den flyten her? Eller noe jeg burde sjekke ut for å gjøre det bedre? Gjerne si i fra, for den arbeidsflyten her er et konstant work in progress foråsirresånn.