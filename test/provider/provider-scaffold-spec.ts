import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, it } from 'node:test'
import { createProvider } from '../../scripts/create-provider.mjs'

const temporaryDirectories: string[] = []

afterEach(async () => {
    await Promise.all(
        temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
    )
})

describe('provider scaffold', () => {
    it('creates a provider, fixture, test, registry entry, and README entry', async () => {
        const root = await scaffoldProject()

        const result = await createProvider({
            root,
            path: 'example-cloud',
            exportName: 'ExampleCloud',
            displayName: 'Example Cloud',
            documentationUrl: 'https://docs.example.com/webhooks',
        })

        const [provider, fixture, test, registry, readme] = await Promise.all([
            readFile(result.providerFile, 'utf8'),
            readFile(result.fixtureFile, 'utf8'),
            readFile(result.testFile, 'utf8'),
            readFile(join(root, 'src/provider/ProviderRegistry.ts'), 'utf8'),
            readFile(join(root, 'README.md'), 'utf8'),
        ])
        assert.match(provider, /export const ExampleCloud = defineProvider/)
        assert.match(provider, /example-cloud\/example-cloud\.json/)
        assert.match(result.fixtureFile, /examples\/example-cloud\/example-cloud\.json$/)
        assert.match(result.testFile, /test\/example-cloud\/example-cloud-spec\.ts$/)
        assert.deepEqual(JSON.parse(fixture), { event: 'Example event' })
        assert.match(test, /Tester\.test\(ExampleCloud, 'example-cloud\.json'\)/)
        assert.match(registry, /import \{ ExampleCloud \} from '\.\/ExampleCloud\.ts'/)
        assert.match(registry, / {4}ExampleCloud,/)
        assert.match(readme, /\[Example Cloud\]\(https:\/\/docs\.example\.com\/webhooks\) - `\/example-cloud`/)
    })

    it('refuses invalid names and existing provider paths', async () => {
        const root = await scaffoldProject()
        const valid = {
            root,
            path: 'example',
            exportName: 'Example',
            displayName: 'Example',
            documentationUrl: 'https://docs.example.com/webhooks',
        }

        await assert.rejects(createProvider({ ...valid, path: '../escape' }), /provider path/i)
        await assert.rejects(createProvider({ ...valid, displayName: 'Bad\nName' }), /display name/i)
        await assert.rejects(
            createProvider({ ...valid, documentationUrl: 'https://example.com/*/' }),
            /documentation URL/i,
        )
        await createProvider(valid)
        await assert.rejects(createProvider(valid), /refusing to overwrite/i)
    })
})

async function scaffoldProject(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'skyhook-provider-scaffold-'))
    temporaryDirectories.push(root)
    await mkdir(join(root, 'src/provider'), { recursive: true })
    await writeFile(
        join(root, 'src/provider/ProviderRegistry.ts'),
        '// provider-scaffold: imports\nconst providers = [\n    // provider-scaffold: definitions\n]\n',
        'utf8',
    )
    await writeFile(join(root, 'README.md'), '<!-- provider-scaffold: supported-providers -->\n', 'utf8')
    return root
}
