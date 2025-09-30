export const formatMessageContent = (content) => {
    if (!content) return "";

    let formatted = content;

    // Handle code blocks first (```code```)
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="code-block"><pre><code>$2</code></pre></div>');
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');

    // Handle inline code (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Handle bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Add paragraph breaks in streaming content where natural breaks should occur
    // Break before numbered sections that follow sentences
    formatted = formatted.replace(/([.!?])\s*(\d+\.\s+[A-Z])/g, '$1\n\n$2');
    // Break before headers
    formatted = formatted.replace(/([.!?])\s*(#{1,6}\s+)/g, '$1\n\n$2');
    // Break before section headers with **
    formatted = formatted.replace(/([.!?])\s*(\*\*[A-Z][^*]+\*\*)/g, '$1\n\n$2');
    // Break before standalone headers ending with colon
    formatted = formatted.replace(/([.!?])\s*([A-Z][^.!?]*:)/g, '$1\n\n$2');

    // Split content into paragraphs
    const paragraphs = formatted.split(/\n\s*\n/);

    const formattedParagraphs = paragraphs.map(para => {
        if (!para.trim()) return '';

        let p = para.trim();

        // Handle numbered sections (1., 2., 3.)
        if (/^\d+\.\s+\*\*/.test(p)) {
            return `<div class="section-header">${p}</div>`;
        }

        // Handle numbered headers with colons
        if (/^\d+\.\s+[^:]+:\s*$/.test(p)) {
            return `<div class="numbered-header">${p}</div>`;
        }

        // Handle section headers (### or **Header**)
        if (/^#+\s+/.test(p) || /^\*\*[^*]+\*\*\s*$/.test(p)) {
            return `<div class="heading">${p}</div>`;
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

            // Bullet points
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

    return formattedParagraphs.filter(p => p).join('');
};