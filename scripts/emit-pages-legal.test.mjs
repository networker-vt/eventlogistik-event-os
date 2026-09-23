import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const PATHS = ['privacy', 'support', 'impressum', 'datenschutz']

describe('emit-pages-legal', () => {
  it('matches the React routes and writes directory indexes', () => {
    const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
    assert.match(app, /path="privacy"\s+element=\{<DatenschutzPage/)
    assert.match(app, /path="support"\s+element=\{<SupportPage/)
    assert.match(app, /path="impressum"\s+element=\{<ImpressumPage/)
    assert.match(app, /path="datenschutz"\s+element=\{<DatenschutzPage/)

    const script = readFileSync(new URL('./emit-pages-legal.sh', import.meta.url), 'utf8')
    for (const path of PATHS) assert.match(script, new RegExp(`\\b${path}\\b`))

    const dir = mkdtempSync(join(tmpdir(), 'pages-legal-'))
    const html = '<!doctype html><title>Orbit SPA</title><div id="root"></div>'
    writeFileSync(join(dir, 'index.html'), html)
    try {
      execFileSync('bash', ['scripts/emit-pages-legal.sh', dir], {
        cwd: fileURLToPath(new URL('..', import.meta.url)),
      })
      for (const path of PATHS) {
        assert.equal(readFileSync(join(dir, path, 'index.html'), 'utf8'), html)
      }
      assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), html)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
