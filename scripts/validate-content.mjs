import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const contentDir = join(__dirname, '..', 'content')

// Inline minimal Zod-like validation (avoid ESM import issues in script context)
// We'll use dynamic import for Zod via the built src
async function main() {
  // Dynamically import zod
  const { z } = await import('zod')

  const KaynakSchema = z.enum(['z', 'e'])

  const GunSchema = z.object({
    meta: z.object({
      gun: z.number().int().min(1).max(30),
      baslik: z.string().min(1),
      ozet: z.string().min(1),
      tahminiSoru: z.string().min(1),
      duzeltmeler: z.array(z.string()),
    }),
    kodlar: z.array(
      z.object({
        b: z.string().min(1),
        i: z.array(z.object({ k: z.string().min(1), m: z.string().min(1), s: KaynakSchema })),
      })
    ),
    kartlar: z.array(z.object({ c: z.string().min(1), o: z.string().min(1), a: z.string().min(1) })),
    tuzak: z.array(
      z.object({
        q: z.string().min(1),
        o: z.array(z.string().min(1)).min(2).max(3),
        c: z.number().int().min(0),
        n: z.string().min(1),
      })
    ),
    deneme: z.array(
      z.object({
        q: z.string().min(1),
        o: z.tuple([z.string(), z.string(), z.string(), z.string(), z.string()]),
        c: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
        e: z.string().min(1),
      })
    ),
    eslestir: z.array(
      z.object({
        ad: z.string().min(1),
        p: z.array(z.tuple([z.string(), z.string()])).min(2),
      })
    ),
  })

  const files = readdirSync(contentDir).filter((f) => f.match(/^gun\d+\.json$/))

  let hataSayisi = 0
  for (const file of files) {
    const yol = join(contentDir, file)
    try {
      const data = JSON.parse(readFileSync(yol, 'utf8'))
      GunSchema.parse(data)
      console.log(`✓ ${file}`)
    } catch (err) {
      console.error(`✗ ${file}:`, err instanceof Error ? err.message : err)
      hataSayisi++
    }
  }

  if (hataSayisi > 0) {
    console.error(`\n${hataSayisi} dosyada hata var.`)
    process.exit(1)
  } else {
    console.log(`\nTüm ${files.length} dosya geçerli.`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
