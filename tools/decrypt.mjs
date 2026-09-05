#!/usr/bin/env node
// Afkóðar isfast-team.enc í team_data.json (LOCAL ONLY — skráin er í .gitignore).
// Notkun:  THROUNARBOK_PASS='...' node tools/decrypt.mjs   (eða slærðu inn lykilorðið þegar spurt er)
// Þarf Node 19+ (WebCrypto). Sömu breytur og síðan sjálf: PBKDF2-SHA256/300k → AES-256-GCM.
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const enc = JSON.parse(readFileSync(new URL('../isfast-team.enc', import.meta.url), 'utf8'));
let pass = process.env.THROUNARBOK_PASS;
if (!pass) {
  const rl = createInterface({ input: stdin, output: stdout });
  pass = await rl.question('Lykilorð þróunarbókar: ');
  rl.close();
}
const b64 = s => Uint8Array.from(Buffer.from(s, 'base64'));
const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(enc.salt), iterations: 300000, hash: 'SHA-256' },
  km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
try {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(enc.iv) }, key, b64(enc.data));
  const data = JSON.parse(new TextDecoder().decode(plain));
  writeFileSync(new URL('../team_data.json', import.meta.url), JSON.stringify(data, null, 1));
  console.log(`OK → team_data.json (${Object.keys(data).join(', ')}; uppfært ${data.generated})`);
} catch (e) {
  console.error('Rangt lykilorð (eða skemmd skrá).');
  process.exit(1);
}
