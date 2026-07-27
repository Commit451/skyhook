import { defineProvider } from './Provider.ts'

/**
 * https://docs.docker.com/docker-hub/webhooks/
 */
export const DockerHub = defineProvider({
    path: 'dockerhub',
    name: 'DockerHub',
    example: { body: 'dockerhub/dockerhub.json' },
    defaults: { embedColor: 0x0db7ed },
    map({ body }, output) {
        output.addEmbed({
            title: '🐳 Repository: ' + body.repository.repo_name,
            description: `${body.push_data.pusher} pushed for tag: **${body.push_data.tag}**`,
            url: body.repository.repo_url,
        })
    },
})
