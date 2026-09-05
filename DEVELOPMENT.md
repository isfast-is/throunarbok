# Þróunarbók — leiðbeiningar fyrir þróun síðunnar

Þessi síða (https://isfast-is.github.io/throunarbok/) er **ein HTML-skrá** (`index.html`) sem sækir dulkóðaða gagnaskrá (`isfast-team.enc`), afkóðar hana í vafranum með lykilorði teymisins og teiknar allt úr JSON-hlutnum `D`.

## Hver á hvað

| Skrá | Eigandi | Athugasemd |
|---|---|---|
| `index.html` | **Þróunarteymið (Björn)** — breytið að vild | Pípan á Mac mini skrifar EKKI í hana (frá 5.9.2026) |
| `isfast-team.enc` | Pípan (`refresh_project_costs.py`, nætur-keyrsla kl. 06:30) | Endurnýjuð sjálfkrafa; **ekki breyta handvirkt** |
| `tools/decrypt.mjs` | Hjálpartól | Afkóðar `.enc` í `team_data.json` (er í `.gitignore`) |

Pípan gerir `git pull --rebase` áður en hún commit-ar `.enc`-skrána, svo ykkar commit rekast ekki á. Ef þið breytið gagnaskránni sjálfri eða endurnefnið hana hættir næturkeyrslan að virka.

## Reglur (repóið er OPINBERT á GitHub Pages)

1. **Aldrei** commit-a `team_data.json`, afkóðuð gögn, skjámyndir með tölum, eða lykilorðið. `.gitignore` grípur það algengasta — hugsið samt.
2. Gagnapakkinn inniheldur **engar launaupplýsingar** (innri vinna er á einum blönduðum taxta á ár). Það er hönnunarforsenda, ekki UI-fela: það sem ekki má sjást má ekki vera í gögnunum. Óskir um ný gagnasvið fara til Gunnars → pípan.
3. Haldið `const IS_TEAM_PATH = true;` og nafni `isfast-team.enc` og `localStorage`-lyklinum `ifteam_pass` óbreyttu.
4. Dulkóðunin (PBKDF2-SHA256/300.000 → AES-256-GCM) og `decrypt()`-fallið eiga að vera eins og þau eru.

## Vinnuflæði (staðbundið)

```bash
git clone git@github.com:isfast-is/throunarbok.git && cd throunarbok
THROUNARBOK_PASS='<lykilorð>' node tools/decrypt.mjs      # → team_data.json (Node 19+)
python3 -m http.server 8000                                # opnið http://localhost:8000/ og sláið inn lykilorðið
```
Skoðið `team_data.json` til að sjá nákvæmlega hvaða gögn eru til. Til að prófa breytingar hratt má líka afkóða beint í vafraconsole eftir að síðan er opnuð: `copy(JSON.stringify(D))`.

Push á `main` birtist á Pages eftir ~1 mín.

## Gagnaskema (`D`)

Allar upphæðir í krónum (heiltölur), tímar í klst. **Tímabilslyklar**: hvert tölusafn (`ext`, `hours`, `labour`, `oh`, `h`, `pool`) hefur bæði árslykla (`"2026"`) og ársfjórðungslykla (`"2026-Q3"`); árið = summa fjórðunganna. `D.quarters` segir hvaða fjórðungar eru til per ár.

```
D.generated      "YYYY-MM-DD HH:MM"
D.years          [2023, 2024, 2025, 2026]
D.quarters       {"2026": [1,2,3], ...}
D.team = true, D.scope = "dev"
D.blended        {ár: kr/klst}   — blandaður taxti (Σkostnaður / Σtímar)
D.projects[]     {code, name, flokkur, tnr, stada,
                  ext{tímabil: kr}        ytri kostnaður (BC)
                  hours{tímabil: klst}    skráðir + reiknaðir tímar (Toggl)
                  labour{tímabil: kr}     hours × blended
                  oh{tímabil: kr}         hlutdeild í yfirbyggingu
                  people[{name, h{tímabil: klst}}]
                  tproj[{name, h{tímabil: klst}}]   tímar eftir Toggl-verkefnum
                  vendors[{name, kr}]}
D.virdismat      {years[], rows[{heiti, code, total, disc, fracs{ár: hlutfall}, vals{ár: kr}, buildup[[forsenda, gildi]], ath}]}
D.matsblod       {code: {titill, lysing, gattir[{nafn, stada, sonnun}], virdi, naestu_skref, ahaetta}}
D.bg             ÍF Projects (Google Sheet BG, lesið á hverri nóttu):
                  {source, snapshot, yfirlit_tab, status_tab,
                   plan{code: {sunk_h, sunk_kr, sunk_period, sunk_h_period, add_h, add_kr, plan_h, plan_kr, value_kr, rate_thkr}},
                   status{code: {name, prev_label, prev[{a, s}], next_label, next[{a, due}], links[{t, url}]}},
                   new[{name, idea, approach, status, next, link{t, url}}]}
```

## Uppbygging `index.html`

- `decrypt()` / `boot()` — lykilorð, `localStorage`, afkóðun, `show(data)`.
- Tímabilsval: `selYear`, `selQ`, `periods()`, `S(o)` (summa yfir valið tímabil), `SA(o)` (allt tímabilið), `perLabel()`.
- Renderers: `renderChips`, `renderKpis`, `renderDev` (þróunarbók), `renderPlan` (áætlun vs raun), `renderStatus` (aðgerðir + ný verkefni), `renderMinis`, `renderVirdis` — allt kallað úr `renderAll()`.
- Drill-down: `drillProject`, `drillMats`, `drillNew`, `drillKpi` → `openModal(html)`; `mtable(headers, rows)` smíðar töflur.
- Kaflar sem eiga ekki við teymið (`sec-clients`, `sec-flows`, `sec-emp`) eru faldir í `show()` þegar `D.scope === 'dev'`; hlutar sem þið notið ekki má einfaldlega fjarlægja.
- Litir eru CSS-breytur í `:root` (dark) og `@media (prefers-color-scheme: light)`.

## Hvaðan gögnin koma

Business Central (fjárhagur, GET-only) + Toggl (tímar, lesaðgangur) + ÍF Projects-sheet BG → `refresh_project_costs.py` á Mac mini Gunnars → ABC-líkan → dulkóðað `isfast-team.enc`. Villur í tölum, ný verkefni/kóðar, ný svið: Gunnar.
