export const formatMessageContent = (content) => {
    if (!content) return "";
    
    let formatted = content;
    
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
    formatted = formatted.replace(/^(\d+\.\s+[^:]+:)\s*$/gm, '<div class="list-item numbered-header">$1</div>');
    formatted = formatted.replace(/^(\d+\.\s+(?![^:]+:).+)$/gm, '<div class="list-item numbered">$1</div>');
    
    formatted = formatted.replace(/^\*\s+(.+)$/gm, '<div class="list-item sub-bullet">◦ $1</div>');
    
    formatted = formatted.replace(/^[\-•]\s+(.+)$/gm, '<div class="list-item bullet">• $1</div>');
    
    formatted = formatted.replace(/^([A-Z][^.!?]*:)\s*$/gm, '<div class="heading">$1</div>');
    
    formatted = formatted.replace(/\n\s*\n/g, '</div><div class="paragraph">');
    
    formatted = '<div class="paragraph">' + formatted + '</div>';
    
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
};