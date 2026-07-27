import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const IMPORT_MARKER = '// provider-scaffold: imports'
const DEFINITION_MARKER = '    // provider-scaffold: definitions'
const README_MARKER = '<!-- provider-scaffold: supported-providers -->'
const PROVIDER_PATH_PATTERN = /^[a-z][a-z0-9-]*$/
const EXPORT_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/

export async function createProvider({ root, path, exportName, displayName, documentationUrl }) {
    validateArguments({ path, exportName, displayName, documentationUrl })

    const projectRoot = resolve(root)
    const providerFile = resolve(projectRoot, 'src/provider', `${exportName}.ts`)
    const fixtureDirectory = resolve(projectRoot, 'examples', path)
    const fixtureFile = resolve(fixtureDirectory, `${path}.json`)
    const testDirectory = resolve(projectRoot, 'test', path)
    const testFile = resolve(testDirectory, `${path}-spec.ts`)
    const registryFile = resolve(projectRoot, 'src/provider/ProviderRegistry.ts')
    const readmeFile = resolve(projectRoot, 'README.md')

    await assertMissing(providerFile)
    await assertMissing(fixtureDirectory)
    await assertMissing(testDirectory)

    const [registry, readme] = await Promise.all([readFile(registryFile, 'utf8'), readFile(readmeFile, 'utf8')])
    assertMarker(registry, IMPORT_MARKER, registryFile)
    assertMarker(registry, DEFINITION_MARKER, registryFile)
    assertMarker(readme, README_MARKER, readmeFile)

    const nextRegistry = insertProviderImport(registry, exportName).replace(
        DEFINITION_MARKER,
        `    ${exportName},\n${DEFINITION_MARKER}`,
    )
    const nextReadme = readme.replace(
        README_MARKER,
        `- [${displayName}](${documentationUrl}) - \`/${path}\`\n${README_MARKER}`,
    )

    await Promise.all([mkdir(fixtureDirectory, { recursive: true }), mkdir(testDirectory, { recursive: true })])
    await Promise.all([
        writeFile(providerFile, providerTemplate({ path, exportName, displayName, documentationUrl }), 'utf8'),
        writeFile(fixtureFile, fixtureTemplate(), 'utf8'),
        writeFile(testFile, testTemplate({ path, exportName }), 'utf8'),
        writeFile(registryFile, nextRegistry, 'utf8'),
        writeFile(readmeFile, nextReadme, 'utf8'),
    ])

    return { providerFile, fixtureFile, testFile }
}

function validateArguments({ path, exportName, displayName, documentationUrl }) {
    if (!PROVIDER_PATH_PATTERN.test(path)) {
        throw new Error(
            'Provider path must start with a lowercase letter and contain only lowercase letters, digits, or hyphens.',
        )
    }
    if (!EXPORT_NAME_PATTERN.test(exportName)) {
        throw new Error('Provider export name must be a PascalCase JavaScript identifier.')
    }
    if (
        typeof displayName !== 'string' ||
        displayName.trim() !== displayName ||
        displayName.length === 0 ||
        displayName.length > 80 ||
        hasControlCharacters(displayName)
    ) {
        throw new Error('Provider display name must contain 1-80 printable characters without surrounding whitespace.')
    }
    if (typeof documentationUrl !== 'string' || /\s/.test(documentationUrl) || documentationUrl.includes('*/')) {
        throw new Error('Provider documentation URL must be a valid HTTPS URL.')
    }
    let documentation
    try {
        documentation = new URL(documentationUrl)
    } catch {
        throw new Error('Provider documentation URL must be a valid HTTPS URL.')
    }
    if (documentation.protocol !== 'https:') {
        throw new Error('Provider documentation URL must be a valid HTTPS URL.')
    }
}

async function assertMissing(path) {
    try {
        await access(path)
        throw new Error(`Refusing to overwrite existing path: ${path}`)
    } catch (error) {
        if (error?.code !== 'ENOENT') throw error
    }
}

function assertMarker(content, marker, file) {
    if (!content.includes(marker)) throw new Error(`Scaffold marker is missing from ${file}: ${marker}`)
}

function insertProviderImport(registry, exportName) {
    const newModule = `./${exportName}.ts`
    const newImport = `import { ${exportName} } from '${newModule}'`
    const lines = registry.split('\n')
    const markerIndex = lines.indexOf(IMPORT_MARKER)
    const insertAt = lines.findIndex((line, index) => {
        if (index >= markerIndex || !line.startsWith('import ')) return false
        const moduleName = line.match(/from '([^']+)'$/)?.[1]
        return moduleName != null && moduleName.localeCompare(newModule) > 0
    })
    lines.splice(insertAt === -1 ? markerIndex : insertAt, 0, newImport)
    return lines.join('\n')
}

function providerTemplate({ path, exportName, displayName, documentationUrl }) {
    return `import { firstScalar } from '../util/WebhookValue.ts'
import { defineProvider } from './Provider.ts'

/**
 * ${documentationUrl}
 */
export const ${exportName} = defineProvider({
    path: '${path}',
    name: '${escapeSingleQuoted(displayName)}',
    example: { body: '${path}/${path}.json' },
    map({ body }, output) {
        const event = firstScalar(body.event, body.type) ?? '${escapeSingleQuoted(displayName)} notification'
        output.addEmbed({ title: event })
    },
})
`
}

function fixtureTemplate() {
    return `${JSON.stringify({ event: 'Example event' }, null, 4)}\n`
}

function testTemplate({ path, exportName }) {
    return `import { describe, it } from 'node:test'
import { ${exportName} } from '../../src/provider/${exportName}.ts'
import { Tester } from '../Tester.ts'

describe('/POST ${path}', () => {
    it('example', () => Tester.test(${exportName}, '${path}.json'))
})
`
}

function escapeSingleQuoted(value) {
    return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")
}

function hasControlCharacters(value) {
    return [...value].some((character) => {
        const codePoint = character.codePointAt(0)
        return codePoint <= 0x1f || codePoint === 0x7f
    })
}

async function runCli() {
    const [path, exportName, displayName, documentationUrl] = process.argv.slice(2)
    if ([path, exportName, displayName, documentationUrl].some((value) => value == null)) {
        throw new Error(
            'Usage: npm run provider:new -- <path> <ExportName> "<Display Name>" <https://documentation-url>',
        )
    }
    const result = await createProvider({
        root: process.cwd(),
        path,
        exportName,
        displayName,
        documentationUrl,
    })
    console.log(`Created provider ${displayName}:`)
    console.log(`- ${result.providerFile}`)
    console.log(`- ${result.fixtureFile}`)
    console.log(`- ${result.testFile}`)
    console.log('Customize the generated mapper and fixture, then run npm test.')
}

const isMainModule = process.argv[1] != null && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (isMainModule) {
    runCli().catch((error) => {
        console.error(error instanceof Error ? error.message : String(error))
        process.exitCode = 1
    })
}
