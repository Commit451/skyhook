import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HuggingFace } from '../../src/provider/HuggingFace.ts'
import { Tester } from '../Tester.ts'

const repo = {
    type: 'dataset',
    name: 'commit451/example-dataset',
    id: 'repo-id',
    private: false,
    url: {
        web: 'https://huggingface.co/datasets/commit451/example-dataset',
        api: 'https://huggingface.co/api/datasets/commit451/example-dataset',
    },
    owner: { id: 'owner-id' },
    headSha: '575db8b7a51b6f85eb06eee540738584589f131c',
}

const webhook = { id: 'webhook-id', version: 3 }

describe('/POST huggingface', () => {
    it('uses the public provider name and URL path', () => {
        const provider = new HuggingFace()

        assert.strictEqual(provider.getName(), 'Hugging Face')
        assert.strictEqual(provider.getPath(), 'huggingface')
    })

    it('formats the documented pull request payload', async () => {
        const res = await Tester.test(new HuggingFace(), 'huggingface.json')
        const embed = res?.embeds?.[0]

        assert.strictEqual(res?.username, 'Hugging Face')
        assert.strictEqual(embed?.title, 'Created pull request #19 on openai-community/gpt2: Update co2 emissions')
        assert.strictEqual(embed?.url, 'https://huggingface.co/openai-community/gpt2/discussions/19')
        assert.strictEqual(embed?.description, 'Add co2 emissions information to the model card')
        assert.deepStrictEqual(embed?.fields, [
            { name: 'Status', value: 'Open', inline: true },
            { name: 'Base', value: 'main', inline: true },
        ])
        assert.strictEqual(embed?.color, 0xffd21e)
    })

    it('summarizes updated branches and tags', async () => {
        const res = await Tester.testWithBody(new HuggingFace(), {
            event: { action: 'update', scope: 'repo.content' },
            repo,
            updatedRefs: [
                {
                    ref: 'refs/heads/main',
                    oldSha: 'ce9a4674fa833a68d5a73ec355f0ea95eedd60b7',
                    newSha: '575db8b7a51b6f85eb06eee540738584589f131c',
                },
                {
                    ref: 'refs/tags/v1.0.0',
                    oldSha: null,
                    newSha: '575db8b7a51b6f85eb06eee540738584589f131c',
                },
            ],
            webhook,
        })
        const embed = res?.embeds?.[0]

        assert.strictEqual(embed?.title, 'Updated content in dataset commit451/example-dataset')
        assert.strictEqual(embed?.url, repo.url.web)
        assert.deepStrictEqual(embed?.fields, [
            {
                name: 'Updated branch main',
                value: '[`ce9a467`](https://huggingface.co/datasets/commit451/example-dataset/commit/ce9a4674fa833a68d5a73ec355f0ea95eedd60b7) → [`575db8b`](https://huggingface.co/datasets/commit451/example-dataset/commit/575db8b7a51b6f85eb06eee540738584589f131c)',
            },
            {
                name: 'Created tag v1.0.0',
                value: '[`575db8b`](https://huggingface.co/datasets/commit451/example-dataset/commit/575db8b7a51b6f85eb06eee540738584589f131c)',
            },
        ])
    })

    it('keeps large content updates within Discord embed limits', async () => {
        const longName = `commit451/${'very-long-dataset-name-'.repeat(4)}`
        const longRepo = {
            ...repo,
            name: longName,
            url: { web: `https://huggingface.co/datasets/${longName}` },
        }
        const updatedRefs = Array.from({ length: 25 }, (_, index) => ({
            ref: `refs/heads/${`long-branch-name-${index}-`.repeat(8)}`,
            oldSha: 'ce9a4674fa833a68d5a73ec355f0ea95eedd60b7',
            newSha: '575db8b7a51b6f85eb06eee540738584589f131c',
        }))

        const res = await Tester.testWithBody(new HuggingFace(), {
            event: { action: 'update', scope: 'repo.content' },
            repo: longRepo,
            updatedRefs,
            webhook,
        })
        const embed = res?.embeds?.[0]
        const characterCount =
            (embed?.title?.length ?? 0) +
            (embed?.description?.length ?? 0) +
            (embed?.footer?.text.length ?? 0) +
            (embed?.fields ?? []).reduce((total, field) => total + field.name.length + field.value.length, 0)

        assert.ok(characterCount <= 6000, `Expected at most 6000 embed characters, received ${characterCount}`)
        assert.match(embed?.description ?? '', /^Showing \d+ of 25 updated references\.$/)
    })

    it('formats repository configuration changes, including future narrowed scopes', async () => {
        const res = await Tester.testWithBody(new HuggingFace(), {
            event: { action: 'update', scope: 'repo.config.dois' },
            repo: { ...repo, private: true },
            updatedConfig: { private: true },
            webhook,
        })
        const embed = res?.embeds?.[0]

        assert.strictEqual(embed?.title, 'Updated settings for dataset commit451/example-dataset')
        assert.strictEqual(embed?.description, '**Visibility:** Private')
    })

    it('keeps long pull request base refs within Discord field limits', async () => {
        const res = await Tester.testWithBody(new HuggingFace(), {
            event: { action: 'update', scope: 'discussion' },
            repo,
            discussion: {
                id: 'discussion-id',
                num: 8,
                title: 'Merge a long-lived branch',
                status: 'open',
                isPullRequest: true,
                author: { id: 'author-id' },
                url: { web: `${repo.url.web}/discussions/8` },
                changes: { base: `refs/heads/${'long-base-ref-'.repeat(100)}` },
            },
            webhook,
        })
        const baseField = res?.embeds?.[0]?.fields?.find((field) => field.name === 'Base')

        assert.strictEqual(baseField?.value.length, 1024)
        assert.ok(baseField?.value.endsWith('…'))
    })

    it('formats hidden discussion comments without exposing missing content', async () => {
        const res = await Tester.testWithBody(new HuggingFace(), {
            event: { action: 'update', scope: 'discussion.comment' },
            repo,
            discussion: {
                id: 'discussion-id',
                num: 7,
                title: 'Improve the dataset card',
                status: 'open',
                isPullRequest: false,
                author: { id: 'author-id' },
                url: { web: `${repo.url.web}/discussions/7` },
            },
            comment: {
                id: 'comment-id',
                author: { id: 'commenter-id' },
                hidden: true,
                url: { web: `${repo.url.web}/discussions/7#comment-id` },
            },
            webhook,
        })
        const embed = res?.embeds?.[0]

        assert.strictEqual(
            embed?.title,
            'Updated comment on discussion #7 in commit451/example-dataset: Improve the dataset card',
        )
        assert.strictEqual(embed?.url, `${repo.url.web}/discussions/7#comment-id`)
        assert.strictEqual(embed?.description, 'This comment was hidden.')
    })

    it('describes repository moves', async () => {
        const res = await Tester.testWithBody(new HuggingFace(), {
            event: { action: 'move', scope: 'repo' },
            repo: { ...repo, name: 'commit451/old-name' },
            movedTo: { name: 'commit451/new-name', owner: { id: 'owner-id' } },
            webhook,
        })
        const embed = res?.embeds?.[0]

        assert.strictEqual(embed?.title, 'Moved dataset commit451/old-name to commit451/new-name')
        assert.strictEqual(embed?.description, '**New name:** `commit451/new-name`')
    })
})
