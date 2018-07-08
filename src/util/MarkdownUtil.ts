import { Embed } from '../model/Embed'
import { EmbedImage } from '../model/EmbedImage'

// Regular Expressions
const mdUL1 = /^={3,}$/
const mdUL2 = /^-{3,}$/
const boldRegex = /\*\*([^\\]*)\*\*/
const cleanupRegex = /__([^\\]*)__/
const italicRegex = /\*([^\\]*)\*/
const imageRegex = /!\[.*\]\((.*)\)/

class MarkdownUtil {

    public static _formatMarkdownHeader(str: string): string {
        const lines = str.split('\n')
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim()
            if (line.startsWith('#')) {
                let start = 0
                let end = line.length
                let goFront = true
                let goBack = true
                let finished = false
                for (let j = 0; j < line.length && !finished; j++) {
                    if (goFront && line.substring(j, j + 1) !== '#') {
                        start = j
                        goFront = false
                    }
                    if (goBack && line.substring(line.length - 1 - j, line.length - j) !== '#') {
                        end = line.length - j
                        goBack = false
                    }
                    if (!goBack && !goFront) {
                        finished = true
                    }
                }
                if (end - start === line.length) {
                    line = '**#**'
                } else {
                    line = '**' + line.substring(start, end).trim() + '**'
                }
                lines[i] = line
            }
            if (mdUL1.test(line) || mdUL2.test(line)) {
                if (i > 0) {
                    lines[i - 1] = '**' + lines[i - 1] + '**'
                }
                lines.splice(i, 1)
            }
        }
        return lines.join('\n')
    }

    public static _formatMarkdownBold(str: string) {
        let match
        while (boldRegex.test(str)) {
            match = boldRegex.exec(str)
            str = str.replace(boldRegex, '__' + match[1] + '__')
        }
        return str
    }

    public static _cleanupMarkdownBold(str: string): string {
        let match
        while (cleanupRegex.test(str)) {
            match = cleanupRegex.exec(str)
            str = str.replace(cleanupRegex, '**' + match[1] + '**')
        }
        return str
    }

    public static _formatMarkdownItalic(str: string): string {
        let match
        while (italicRegex.test(str)) {
            match = italicRegex.exec(str)
            str = str.replace(italicRegex, '_' + match[1] + '_')
        }
        return str
    }

    public static _formatMarkdownImage(str: string, embed: Embed): string {
        if (imageRegex.test(str)) {
            const match = imageRegex.exec(str)
            const image = new EmbedImage()
            image.url = match[1]
            embed.image = image
            str = str.replace(imageRegex, '')
        }
        return str
    }

    public static _formatMarkdownBullets(str: string): string {
        const lines = str.split('\n')
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (line.startsWith('* ')) {
                lines[i] = lines[i].replace('*', '\u2022')
            } else if (line.startsWith('+ ')) {
                lines[i] = lines[i].replace('+', '\u2022')
            } else if (line.startsWith('- ')) {
                lines[i] = lines[i].replace('-', '\u2022')
            }
        }
        return lines.join('\n')
    }

    public static _formatMarkdown(str: string, embed: Embed): string {
        str = MarkdownUtil._formatMarkdownBullets(str)
        str = MarkdownUtil._formatMarkdownBold(str)
        str = MarkdownUtil._formatMarkdownItalic(str)
        str = MarkdownUtil._cleanupMarkdownBold(str)
        str = MarkdownUtil._formatMarkdownHeader(str)
        str = MarkdownUtil._formatMarkdownImage(str, embed)

        return str
    }

}
export { MarkdownUtil }
