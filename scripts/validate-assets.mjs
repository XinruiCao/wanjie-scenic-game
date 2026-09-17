import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import sharp from 'sharp'
const story=JSON.parse(await fs.readFile('src/data/story.runtime.json','utf8'))
const posters=[...new Set(Object.values(story).map(n=>n.poster).filter(Boolean))]
for(const poster of posters){const file=path.join('src',poster);await fs.access(file);const info=await sharp(file).metadata();assert.ok(info.width>=1200&&info.height>=600,poster+' is too small')}
const generated=JSON.parse(await fs.readFile('src/config/generated-scenic-assets.json','utf8'))
for(const [name,asset] of Object.entries(generated)){const info=await sharp(path.join('src',asset.src)).metadata();assert.ok(info.hasAlpha,name+' lost alpha')}
console.log(`PASS: ${posters.length} scene posters exist at cinematic resolution; ${Object.keys(generated).length} UI assets retain alpha.`)
