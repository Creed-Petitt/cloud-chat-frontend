// Helper function to escape HTML in code blocks
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

export const formatMessageContent = (content) => {
    if (!content) return "";

    let formatted = content;
    const codeBlockPlaceholders = [];
    let placeholderIndex = 0;

    // Handle images first
    formatted = formatted.replace(/!\[(.*?)\]\((.*?)\)/g, '<img class="chat-image" src="$2" alt="$1" />');

    // Handle code blocks with backticks and store them as placeholders
    // This protects code blocks from being split during paragraph processing
    formatted = formatted.replace(/```(\w+)?\r?\n([\s\S]*?)```/g, (match, lang, code) => {
        const escapedCode = escapeHtml(code);
        const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
        codeBlockPlaceholders.push(`<div class="code-block"><pre><code>${escapedCode}</code></pre></div>`);
        placeholderIndex++;
        return placeholder;
    });
    
    // Catch any remaining code blocks without newlines
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
        const escapedCode = escapeHtml(code);
        const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
        codeBlockPlaceholders.push(`<div class="code-block"><pre><code>${escapedCode}</code></pre></div>`);
        placeholderIndex++;
        return placeholder;
    });

    // Handle inline code (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
        const escapedCode = escapeHtml(code);
        return `<code class="inline-code">${escapedCode}</code>`;
    });

    // Handle markdown links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Handle bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle markdown headers (## Header)
    formatted = formatted.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
        return `<div class="heading">${text}</div>`;
    });

    // Split content into paragraphs (now safe because code blocks are placeholders)
    const paragraphs = formatted.split(/\n\s*\n/);

    const formattedParagraphs = paragraphs.map(para => {
        if (!para.trim()) return '';

        let p = para.trim();

        // If this is a code block placeholder, skip processing
        if (p.startsWith('__CODE_BLOCK_')) {
            return p;
        }

        // If this is already a processed heading, return as-is
        if (p.startsWith('<div class="heading">')) {
            return p;
        }

        // Handle lists - split by lines and check each line
        const lines = p.split('\n');
        let hasListItems = false;

        const processedLines = lines.map(line => {
            const trimmedLine = line.trim();

            // Numbered list items
            if (/^\d+\.\s+/.test(trimmedLine)) {
                hasListItems = true;
                return `<div class="list-item numbered">${trimmedLine}</div>`;
            }

            // Bullet points with *, -, or •
            if (/^[\*\-•]\s+/.test(trimmedLine)) {
                hasListItems = true;
                return `<div class="list-item bullet">${trimmedLine.substring(2)}</div>`;
            }

            // Sub-bullet points (indented) - handle multiple indent levels
            const indentMatch = line.match(/^(\s+)[\*\-•]\s+(.+)/);
            if (indentMatch) {
                hasListItems = true;
                const indentLevel = Math.min(Math.floor(indentMatch[1].length / 4), 2); // Cap at 2 levels
                const className = indentLevel === 0 ? 'sub-bullet' : `sub-bullet-${indentLevel}`;
                return `<div class="list-item ${className}">${indentMatch[2]}</div>`;
            }

            return trimmedLine;
        });

        if (hasListItems) {
            return processedLines.join('');
        } else {
            // Regular paragraph - join lines with <br/>
            return `<div class="paragraph">${processedLines.join('<br/>')}</div>`;
        }
    });

    let result = formattedParagraphs.filter(p => p).join('');

    // Restore code block placeholders with actual code blocks
    codeBlockPlaceholders.forEach((codeBlock, index) => {
        result = result.replace(`__CODE_BLOCK_${index}__`, codeBlock);
    });

    return result;
};
