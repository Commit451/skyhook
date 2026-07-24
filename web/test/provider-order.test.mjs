import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const projectRoot = new URL('../', import.meta.url)

test('supported providers are rendered alphabetically by display name', () => {
    execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
        cwd: projectRoot,
        stdio: 'pipe',
    })

    const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
    const providerSection = html.match(/<div class="provider-grid">([\s\S]*?)<\/div>\s*<p class="provider-note">/)
    assert.ok(providerSection, 'provider grid should be present in the built page')

    const names = [...providerSection[1].matchAll(/<span class="provider-name">([^<]+)<\/span>/g)].map(
        ([, name]) => name,
    )
    const alphabetizedNames = names.toSorted((left, right) => left.localeCompare(right))

    assert.deepEqual(names, alphabetizedNames)
})
