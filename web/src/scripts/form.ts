type ProviderInfo = { name: string; path: string }

const API_BASE = 'https://skyhookapi.com'
const DISCORD_HOST = 'discord.com'

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)

const providerSelect = $<HTMLSelectElement>('#provider')!
const urlField = $<HTMLDivElement>('#url-field')!
const urlInput = $<HTMLInputElement>('#discord-url')!
const urlError = $<HTMLDivElement>('#url-error')!
const generateBtn = $<HTMLButtonElement>('#generate')!
const toast = $<HTMLDivElement>('#toast')!
const toastMessage = $<HTMLSpanElement>('#toast-message')!
const toastAction = $<HTMLButtonElement>('#toast-action')!

let toastTimer: number | undefined
let testHandler: ((e: MouseEvent) => void) | null = null

urlInput.addEventListener('input', () => clearError())

generateBtn.addEventListener('click', generate)

void loadProviders()

async function loadProviders(): Promise<void> {
    try {
        const res = await fetch(`${API_BASE}/api/providers`)
        if (!res.ok) throw new Error(`status ${res.status}`)
        const providers = (await res.json()) as ProviderInfo[]
        renderProviders(providers)
    } catch {
        const failed = document.createElement('option')
        failed.value = ''
        failed.textContent = 'Failed to load providers. Refresh to try again.'
        providerSelect.replaceChildren(failed)
        providerSelect.disabled = true
        showToast('Something went wrong')
    }
}

function renderProviders(providers: ProviderInfo[]): void {
    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = 'Select a provider'
    placeholder.disabled = true
    placeholder.selected = true

    const options = providers.map((p) => {
        const option = document.createElement('option')
        option.value = p.path
        option.textContent = p.name
        return option
    })

    providerSelect.replaceChildren(placeholder, ...options)
    providerSelect.disabled = false
}

function generate(): void {
    const selectedProvider = providerSelect.value
    if (!selectedProvider) {
        showToast('Please select a provider')
        return
    }
    const url = urlInput.value.trim()
    if (!url) {
        setError('Please paste your Discord Webhook URL here')
        return
    }
    if (!url.includes(DISCORD_HOST)) {
        setError('Not a valid Discord Webhook URL')
        return
    }

    let parsed: URL
    try {
        parsed = new URL(url)
    } catch {
        setError('Not a valid Discord Webhook URL')
        return
    }

    const segments = parsed.pathname.split('/').filter(Boolean)
    if (segments.length < 2) {
        setError('Not a valid Discord Webhook URL')
        return
    }
    const webhookId = segments[segments.length - 2]
    const webhookSecret = segments[segments.length - 1]
    const generatedUrl = `${API_BASE}/api/webhooks/${webhookId}/${webhookSecret}/${selectedProvider}`

    void copyToClipboard(generatedUrl).then((ok) => {
        const message = ok ? 'URL generated. Copied to clipboard' : 'URL generated (copy failed)'
        showToast(message, {
            actionLabel: 'Test',
            onAction: () => void test(generatedUrl),
        })
    })
}

async function test(generatedUrl: string): Promise<void> {
    try {
        const res = await fetch(`${generatedUrl}/test`, { method: 'POST' })
        if (!res.ok) throw new Error(`status ${res.status}`)
        showToast('Test message sent')
    } catch {
        showToast('Something went wrong')
    }
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

function setError(message: string): void {
    urlError.textContent = message
    urlField.classList.add('invalid')
}

function clearError(): void {
    if (urlField.classList.contains('invalid')) {
        urlError.textContent = ''
        urlField.classList.remove('invalid')
    }
}

type ToastOptions = { actionLabel?: string; onAction?: () => void }

function showToast(message: string, opts: ToastOptions = {}): void {
    toastMessage.textContent = message

    if (testHandler) {
        toastAction.removeEventListener('click', testHandler)
        testHandler = null
    }

    if (opts.actionLabel && opts.onAction) {
        toastAction.textContent = opts.actionLabel
        toastAction.hidden = false
        testHandler = () => opts.onAction!()
        toastAction.addEventListener('click', testHandler)
    } else {
        toastAction.hidden = true
    }

    toast.classList.add('show')
    if (toastTimer) window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
        toast.classList.remove('show')
    }, 4000)
}
