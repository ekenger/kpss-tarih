#!/usr/bin/env node
// Kullanım: node scripts/clean-transcript.mjs <n|all>
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";

const RAW = "data/transcripts/raw";
const CLEAN = "data/transcripts/clean";
const arg = process.argv[2];
if (!arg) { console.error("Kullanım: node scripts/clean-transcript.mjs <n|all>"); process.exit(1); }
mkdirSync(CLEAN, { recursive: true });

const temizle = (t) => t
  .replace(/^#.*$/gm, "")                        // tactiq başlık satırları
  .replace(/^\d{2}:\d{2}:\d{2}\.\d+\s*/gm, "")   // zaman damgaları
  .replace(/\r/g, "")
  .replace(/\s+/g, " ")
  .trim();

const isle = (ad) => {
  const src = `${RAW}/${ad}`;
  if (!existsSync(src)) { console.error(`yok: ${src}`); return; }
  const ham = readFileSync(src, "utf8");
  const temiz = temizle(ham);
  writeFileSync(`${CLEAN}/${ad}`, temiz);
  console.log(`${ad}: ${ham.length} -> ${temiz.length} karakter`);
};

if (arg === "all") readdirSync(RAW).filter(f => /^gun\d{2}\.txt$/.test(f)).sort().forEach(isle);
else isle(`gun${String(arg).padStart(2, "0")}.txt`);
