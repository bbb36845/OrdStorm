Hej Gemini AI,

Jeg har brug for din hjælp til at videreudvikle et eksisterende React-baseret browserspil. Brugeren vil levere projektfilerne til dig i starten af denne session. Spillet er en dansk version af "Word Flood", og det er meningen, at det skal hedde **"OrdStorm"**.

**Projektets Nuværende Status:**

Spillet er allerede ret avanceret og indeholder følgende funktioner:

1.  **Kerne Spilmekanik:**
    *   Et 6x6 bræt, der starter tomt og gradvist fyldes med bogstaver (ca. et nyt bogstav pr. sekund).
    *   Spillere klikker på bogstaver for at danne ord (minimum 3 bogstaver).
    *   Dannede ord vises, og der er en "Ryd" knap.
    *   Ved "Indsend Ord" valideres ordet mod en lokal dansk ordliste (`20200419-Danish-words.txt`, som forventes at ligge i `public/assets/`).
    *   Godkendte ord giver point baseret på længde, og de brugte bogstaver fjernes fra brættet (uden tyngdekraftseffekt – andre bogstaver bliver på deres plads).
    *   Spillet slutter, når brættet er helt fyldt.
    *   Der er en "Start Forfra" knap.
2.  **Brugergrænseflade (UI):**
    *   React-baseret med styling (sandsynligvis Tailwind CSS og shadcn/ui komponenter).
    *   Visning af score, fundne ord, og det aktuelt dannede ord.
    *   En "Sådan Spiller Du" modal med spilleregler.
    *   Valgte bogstaver på brættet fremhæves visuelt.
    *   Animationer (ved brug af Framer Motion) for bogstavers fremkomst og fjernelse.
3.  **Brugerautentificering og Highscore (alt via LocalStorage):**
    *   Simpelt login/registreringssystem (brugernavn og kodeord).
    *   Highscores gemmes lokalt for hver registreret bruger.
    *   Visning af personlig bedste score for den indloggede bruger.
    *   En leaderboard-modal, der viser "all-time" highscores for de brugere, der er gemt i browserens LocalStorage.

**Vigtig Note om Navneændring (Brugeren håndterer muligvis dette selv):**
Brugeren har ønsket at omdøbe spillet fra dets tidligere udviklingsnavn ("Ordflom") til **"OrdStorm"**. Dette inkluderer opdatering af titlen i `App.tsx` (f.eks. i en `<h1>` tag) og opdatering af footer-teksten til: `© 2025 Mark Jensen, OrdStorm`. Brugeren kan have foretaget disse specifikke tekstændringer selv i de filer, de leverer. Vær opmærksom på dette, og sørg for at navnet "OrdStorm" bruges konsekvent i al ny UI og tekst.

**Resterende Opgaver og Nye Funktioner, der skal Implementeres:**

Brugeren ønsker følgende fire hovedændringer/tilføjelser:

1.  **Permanent Synligt og Opdelt Leaderboard:**
    *   Implementer et leaderboard, der altid er synligt ved siden af selve spilområdet (ikke kun som en modal).
    *   Dette leaderboard skal være opdelt i to sektioner:
        *   **"Dagens bedste"**: Viser de højeste scores opnået i dag.
        *   **"All time bedste"**: Viser de absolut højeste scores nogensinde.
    *   Overvej hvordan "Dagens bedste" kan implementeres robust med LocalStorage (det kan kræve at gemme en timestamp sammen med hver score).
2.  **Login Efter Spillet for at Gemme Score:**
    *   Gør det muligt for en spiller at gennemføre et spil *uden* at være logget ind.
    *   Når spillet er slut, og scoren vises, skal spilleren have mulighed for at logge ind eller registrere sig for at gemme den netop opnåede score på sin profil/highscoreliste.
3.  **Implementering af Bonusbogstav:**
    *   Introducer et specielt "bonusbogstav" på brættet.
    *   Dette bogstav skal have en tydelig visuel markering (f.eks. gylden farve).
    *   Hvis et bonusbogstav bruges i et gyldigt, indsendt ord, skal pointene for *hele det ord* fordobles (2x).
    *   Bonusbogstaver skal dukke op tilfældigt på tomme felter på brættet. Et foreslået interval er mellem hvert 10. og 30. normale bogstav, der tilføjes til brættet, men du kan finjustere dette for god spilbalance.
4.  **Opdater Spilleregler:**
    *   Sørg for at "Sådan Spiller Du" modalen opdateres, så den klart og tydeligt forklarer funktionen og fordelene ved det nye bonusbogstav.

**Generel Fremgangsmåde:**

*   Start med at sætte dig ind i den kodebase, brugeren leverer.
*   Implementer de ovenstående fire punkter et ad gangen.
*   Sørg for grundig test af hver ny funktion.
*   Hold brugeren opdateret om din fremgang.
*   Når alle ændringer er implementeret og testet, skal den endelige version af "OrdStorm" bygges og deployes (brugeren vil sandsynligvis bede om dette).

Spørg endelig, hvis noget er uklart. Held og lykke med opgaven!
