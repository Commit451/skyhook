import { defineProvider } from './Provider.ts'

/**
 * https://www.pingdom.com/resources/webhooks
 */
export const Pingdom = defineProvider({
    path: 'pingdom',
    name: 'Pingdom',
    example: { body: 'pingdom/pingdom.json' },
    map({ body }, output) {
        if (body.current_state !== body.previous_state) {
            output.setEmbedColor(body.current_state === 'UP' ? 0x4caf50 : 0xd32f2f)
            output.addEmbed({
                title: body.check_name + ' - State changed',
                description: 'State change from ' + body.previous_state + ' to ' + body.current_state,
            })
        }
    },
})
