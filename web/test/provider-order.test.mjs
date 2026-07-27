import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
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
    assert.ok(names.includes('Linear'), 'Linear should appear in the supported-provider grid')
    assert.ok(existsSync(new URL('../public/providers/linear.svg', import.meta.url)), 'Linear should have a logo asset')
    assert.ok(names.includes('Square'), 'Square should appear in the supported-provider grid')
    assert.match(providerSection[1], /title="\/square"/, 'Square should use the /square endpoint')
    assert.ok(names.includes('Azure DevOps'), 'Azure DevOps should appear in the supported-provider grid')
    assert.match(providerSection[1], /title="\/azure"/, 'Azure DevOps should use the /azure endpoint')
    assert.doesNotMatch(providerSection[1], /title="\/vsts"/, 'the retired /vsts endpoint should not be shown')
    assert.ok(
        existsSync(new URL('../public/providers/azure.svg', import.meta.url)),
        'Azure DevOps should have a matching /azure logo asset',
    )
})
