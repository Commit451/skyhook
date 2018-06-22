// Regular Expressions
const mdUL1 = /^={3,}$/;
const mdUL2 = /^-{3,}$/;
const boldRegex = /\*\*([^\\]*)\*\*/;
const cleanupRegex = /__([^\\]*)__/;
const italicRegex = /\*([^\\]*)\*/;
const imageRegex = /!\[.*\]\((.*)\)/;

class MarkdownUtil {

    static _formatMarkdownHeader(str) {
        let lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('#')) {
                let start = 0;
                let end = line.length;
                let goFront = true;
                let goBack = true;
                let finished = false;
                for (let j = 0; j < line.length && !finished; j++) {
                    if (goFront && line.substring(j, j + 1) != '#') {
                        start = j;
                        goFront = false;
                    }
                    if (goBack && line.substring(line.length - 1 - j, line.length - j) != '#') {
                        end = line.length - j;
                        goBack = false;
                    }
                    if (!goBack && !goFront) {
                        finished = true;
                    }
                }
                if (end - start === line.length) {
                    line = '**#**';
                } else {
                    line = '**' + line.substring(start, end).trim() + '**';
                }
                lines[i] = line;
            }
            if (mdUL1.test(line) || mdUL2.test(line)) {
                if (i > 0) {
                    lines[i - 1] = '**' + lines[i - 1] + '**';
                }
                lines.splice(i, 1);
            }
        }
        return lines.join('\n');
    }

    static _formatMarkdownBold(str) {
        let match;
        while (boldRegex.test(str)) {
            match = boldRegex.exec(str);
            str = str.replace(boldRegex, '__' + match[1] + '__');
        }
        return str;
    }

    static _cleanupMarkdownBold(str) {
        let match;
        while (cleanupRegex.test(str)) {
            match = cleanupRegex.exec(str);
            str = str.replace(cleanupRegex, '**' + match[1] + '**');
        }
        return str;
    }

    static _formatMarkdownItalic(str) {
        let match;
        while (italicRegex.test(str)) {
            match = italicRegex.exec(str);
            str = str.replace(italicRegex, '_' + match[1] + '_');
        }
        return str;
    }

    static _formatMarkdownImage(str, embed) {
        if (imageRegex.test(str)) {
            let match = imageRegex.exec(str);
            embed.image = {url: match[1]};
            str = str.replace(imageRegex, '');
        }
        return str;
    }

    static _formatMarkdownBullets(str) {
        const lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('* ')) {
                lines[i] = lines[i].replace('*', '\u2022');
            } else if (line.startsWith('+ ')) {
                lines[i] = lines[i].replace('+', '\u2022');
            } else if (line.startsWith('- ')) {
                lines[i] = lines[i].replace('-', '\u2022');
            }
        }
        return lines.join('\n');
    }

    static _formatMarkdown(str, embed) {
        str = MarkdownUtil._formatMarkdownBullets(str);
        str = MarkdownUtil._formatMarkdownBold(str);
        str = MarkdownUtil._formatMarkdownItalic(str);
        str = MarkdownUtil._cleanupMarkdownBold(str);
        str = MarkdownUtil._formatMarkdownHeader(str);
        str = MarkdownUtil._formatMarkdownImage(str, embed);

        return str;
    }

}

module.exports = MarkdownUtil;