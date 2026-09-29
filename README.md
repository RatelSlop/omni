# Omni — De Ultieme Magister Companion
> Ontwikkeld door **RatelSlop Studios** · Gehost op **[omniweb.ratelslop.studio](https://omniweb.ratelslop.studio)**

Omni is een moderne, esthetische en razendsnelle Magister companion die leerlingen een superieure ervaring biedt ten opzichte van de standaard Magister-omgeving. Beschikbaar als **PWA-webapplicatie** (kosteloos te installeren op iOS en Android) én als lichtgewicht **Windows desktopapplicatie (.exe)**.

---

## ✨ Belangrijkste Functies

- **Dual-Layout Systeem**: Schakel op elk gewenst moment tussen:
  - **Linear / Apple Sleek**: Minimalistisch, rustgevend en met een duidelijke countdown widget bovenaan.
  - **Notion / Bento Grid**: Modulaire informatieve bento-boxen met directe samenvattingen van cijfers, toetsen en taken.
- **Thema's**: Volledige ondersteuning voor **Licht**, **Donker** en **OLED Puur Zwart** (optimaal voor telefoons en laptops).
- **100% Privacy & Local-First**: Alle tokens en Magister-gegevens worden lokaal op het apparaat opgeslagen. De server fungeert alleen als stateless proxy en bewaart 0 persoonsgegevens.
- **Agenda-Synchronisatie**:
  - Live **iCal / Webcal** abonnementsfeed voor Apple Agenda (iPhone/Mac), Google Agenda en Outlook.
  - Directe Google Calendar exportknop per les.
- **AI Study Hub (Google Gemini 2.0)**:
  - **Wat Moet Ik Halen Simulator**: Bereken exact welk cijfer je nodig hebt met gewogen weegfactoren.
  - **Actieve Recall Flashcards**: Genereert interactieve omdraaibare flashcards van je toetsstof.
  - **Slimme Studieplanner**: Benut tussenuren en lesuitval optimaal.
  - **Omni AI Assistent**: Slimme chatpartner voor vragen over huiswerk, formules en talen.
- **Lesuitval & Wijzigingen**: Directe visuele notificatie als een les uitvalt of een lokaal wijzigt.
- **Camouflage Modus**: Verberg/blur je cijfers direct met één klik tegen meekijkers in het klaslokaal.
- **Offline Modus**: Werkt direct en laadt in 0 milliseconden, zelfs bij landelijke Magister storingen.

---

## 🎨 Grafisch Design & Branding

Je kunt alle logo's en iconen zelf vervangen. Plaats je bestanden in:
```
public/branding/
├── logo.svg        # Horizontaal woordmerk voor navigatiebalk
├── logo-icon.svg   # Vierkant app-icoon voor PWA en desktop
└── README.md       # Specificaties en tips
```

---

## 🚀 Aan de Slag

### 1. Lokaal draaien (Ontwikkeling)
```bash
cd omni
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in je browser.

### 2. Website Deployen naar `omniweb.ratelslop.studio`
Het project is direct gereed voor **Vercel** of **Cloudflare Pages**:
1. Koppel je GitHub repository aan Vercel of Cloudflare Pages.
2. Voeg in je domeinbeheer (DNS) een `CNAME` record toe:
   - **Host/Naam**: `omniweb`
   - **Doel/Waarde**: `cname.vercel-dns.com` (of je Cloudflare Pages domein).
3. Optioneel: Voeg een environment variable toe in het dashboard:
   - `GEMINI_API_KEY`: Jouw Google Gemini API-sleutel (gratis via Google AI Studio).

### 3. Windows Desktop App (.exe) Bouwen
Omni maakt gebruik van **Tauri v2** voor een ultra-lichtgewicht Windows installatieprogramma:
```bash
npm run tauri build
```
De gegenereerde `.exe` en NSIS-installer vind je vervolgens in:
`src-tauri/target/release/bundle/nsis/`

### 4. Installeren op iPhone & Android (Kosteloos als PWA)
- **iPhone (iOS Safari)**: Ga naar `omniweb.ratelslop.studio` → Tik op het Deel-icoon (vierkantje met pijl omhoog) → Kies **"Zet op beginscherm"**.
- **Android (Chrome/Edge)**: Ga naar `omniweb.ratelslop.studio` → Tik op de 3 puntjes → Kies **"App installeren"**.
- **Windows / Mac**: Klik op het download-icoon rechtsboven in de adresbalk van Chrome/Edge om Omni als desktop PWA te installeren.
