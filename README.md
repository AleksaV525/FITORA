# FITORA

Trening aplikacija: biblioteka od 30 vežbi sa animiranim ilustracijama, nedeljni plan, statistika i deljenje plana. Radi bez interneta.

## Struktura

```
src/        izvorni kod (app.html, app.js, data.js, rig.js, fig.css, studio.html)
public/     manifest, service worker i ikone (kopiraju se u dist/)
tools/      build.js sastavlja sve u dist/
dist/       gotova aplikacija (pravi se sama, nije u gitu)
```

## Pokretanje

```bash
npm install
npm run build      # pravi dist/
npm run serve      # otvori http://localhost:5173
```

Studio (alat za pravljenje vežbi) je na `/studio.html`.

## Dodavanje vežbi

1. Otvori `studio.html`, složi pozu A (početak) i B (kraj), popuni opis.
2. Klikni "Kopiraj kod" i nalepi ga u `src/data.js`, u listu `EXERCISES`.
3. `npm run build`.

Animacija je SVG skelet koji crta `src/rig.js`. Svaka vežba ima dve poze zadate uglovima zglobova, a ostalo se interpoliše.

## Objava na GitHub Pages (najlakši put do "aplikacije")

1. Napravi repozitorijum i pošalji kod na granu `main`.
2. Na GitHub-u: Settings, Pages, Source: **GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` sam sastavlja i objavljuje aplikaciju. Adresa je `https://KORISNIK.github.io/IME-REPOA/`.

## Instalacija na telefon (PWA)

Aplikacija je instalabilna kao prava ikonica na početnom ekranu, otvara se preko celog ekrana i radi bez interneta.

- **Android (Chrome):** otvori adresu, meni (tri tačke), **Instaliraj aplikaciju** (ili Dodaj na početni ekran).
- **iPhone (Safari):** otvori adresu, dugme Podeli, **Dodaj na početni ekran**. Mora Safari, ne Chrome.

Podaci (plan, statistika) čuvaju se u telefonu, u pregledaču u kom je aplikacija instalirana. Ako obrišeš podatke sajta, brišu se i oni.

## Prava aplikacija za prodavnice (Capacitor)

Isti kod se pakuje kao Android i iOS aplikacija. Ovo nije testirano u ovom paketu, pa očekuj malo podešavanja.

```bash
npm run cap:add:android    # potreban Android Studio
npm run cap:android        # otvara projekat, odatle Build ili Run

npm run cap:add:ios        # potreban Mac sa Xcode-om
npm run cap:ios
```

Posle svake izmene koda: `npm run cap:sync`.

Za objavu: Google Play ima jednokratnu naknadu od 25 USD, Apple App Store 99 USD godišnje. Za sopstvenu upotrebu ti prodavnice ne trebaju, PWA je dovoljan.

Pre objave promeni `appId` u `capacitor.config.json` (trenutno `com.fitora.app`) u nešto svoje.
