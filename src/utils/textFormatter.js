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

        // Handle numbered sections (1., 2., 3. with bold)
        if (/^\d+\.\s+\*\*/.test(p)) {
            return `<div class="section-header">${p}</div>`;
        }

        // Handle numbered headers with colons
        if (/^\d+\.\s+[^:]+:\s*$/.test(p)) {
            return `<div class="numbered-header">${p}</div>`;
        }

        // Handle section headers that were already processed or **Header** format
        if (p.startsWith('<div class="heading">') || /^\*\*[^*]+\*\*\s*$/.test(p)) {
            if (!p.startsWith('<div')) {
                return `<div class="heading">${p}</div>`;
            }
            return p;
        }

        // Handle standalone headers ending with colon
        if (/^[A-Z][^.!?]*:\s*$/.test(p)) {
            return `<div class="heading">${p}</div>`;
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

            // Sub-bullet points (indented)
            if (/^\s+[\*\-•]\s+/.test(trimmedLine)) {
                hasListItems = true;
                return `<div class="list-item sub-bullet">${trimmedLine.trim().substring(2)}</div>`;
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
