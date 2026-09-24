import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === 'ios') continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (/\.(tsx?|html|css|mjs|js)$/.test(name) && !/\.test\.(tsx?|mjs)$/.test(name)) out.push(path)
  }
  return out
}

function routePatterns() {
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  return [...app.matchAll(/path="([^"]+)"/g)].map((match) => match[1])
}

function matchesRoute(pathname, patterns) {
  const parts = pathname.split('/').filter(Boolean)
  return patterns.some((pattern) => {
    if (pattern === '*') return false
    const bits = pattern.split('/').filter(Boolean)
    if (pattern.endsWith('/*')) {
      const prefix = bits.slice(0, -1)
      return prefix.every((bit, index) => bit === parts[index])
    }
    if (bits.length !== parts.length) return false
    return bits.every((bit, index) => bit.startsWith(':') || bit === parts[index])
  })
}

describe('dead links', () => {
  it('has no href="#", example.com, or placeholder account numbers in app source', () => {
    const hits = []
    const links = readFileSync(join(root, 'src/lib/links.ts'), 'utf8')
    assert.equal(links.includes('+49'), false)
    for (const file of walk(join(root, 'src'))) {
      const text = readFileSync(file, 'utf8')
      const rel = file.slice(root.length)
      if (/href\s*=\s*["']#["']/.test(text)) hits.push(`${rel} href="#"`)
      if (/example\.com/i.test(text)) hits.push(`${rel} example.com`)
      if (/DE89\s*3704|COBADEFFXXX|•••• 4242|bc1q/.test(text)) hits.push(`${rel} placeholder number`)
    }
    assert.deepEqual(hits, [])
  })

  it('points in-app links at a real route', () => {
    const patterns = routePatterns()
    const misses = []
    for (const file of walk(join(root, 'src'))) {
      const text = readFileSync(file, 'utf8')
      const rel = file.slice(root.length)
      for (const match of text.matchAll(/\b(?:to|href)=["'](\/[^"'#?]*)/g)) {
        const path = match[1] || '/'
        if (path.startsWith('//')) continue
        if (!matchesRoute(path === '' ? '/' : path, patterns) && path !== '/') misses.push(`${rel} ${path}`)
      }
    }
    assert.deepEqual(misses, [])
  })

  it('keeps every footer link in the Pages directory list', () => {
    const shell = readFileSync(join(root, 'src/components/layout/AppShell.tsx'), 'utf8')
    const footer = shell.slice(shell.indexOf('aria-label="Legal"'), shell.indexOf('</footer>'))
    const hrefs = [...footer.matchAll(/to="([^"]+)"/g)].map((match) => match[1])
    assert.deepEqual(hrefs, ['/impressum', '/privacy', '/support', '/agb', '/ranking'])
    const emit = readFileSync(join(root, 'scripts/emit-pages-legal.sh'), 'utf8')
    for (const href of hrefs) assert.match(emit, new RegExp(`\\b${href.slice(1)}\\b`))
  })
})
