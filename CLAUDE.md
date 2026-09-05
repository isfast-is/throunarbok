# Þróunarbók — leiðbeiningar fyrir Claude Code í þessu repói

Lestu `DEVELOPMENT.md` fyrst. Stutta útgáfan:

- `index.html` er eina skráin sem má þróa hér. `isfast-team.enc` er skrifuð af sjálfvirkri næturkeyrslu (06:30) — aldrei breyta henni eða endurnefna.
- Repóið er **opinbert**: aldrei commit-a `team_data.json`, afkóðuð gögn eða lykilorð (sjá `.gitignore`).
- Gögnin (`D`) innihalda engar launaupplýsingar að hönnun; ekki reyna að leiða þær út né bæta við gagnasviðum í síðunni sjálfri — ný gögn koma úr pípunni hjá Gunnari.
- Halda `IS_TEAM_PATH = true`, nafni `.enc`-skrárinnar, `localStorage`-lyklinum `ifteam_pass` og `decrypt()` óbreyttu.
- Prófun: `THROUNARBOK_PASS='…' node tools/decrypt.mjs` → `team_data.json`, síðan `python3 -m http.server 8000`.
