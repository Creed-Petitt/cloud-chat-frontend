import axios from "axios";

export const fetchConversations = async (token, apiBaseUrl) => {
    const response = await axios.get(`${apiBaseUrl}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const fetchConversation = async (conversationId, token, apiBaseUrl) => {
    const response = await axios.get(`${apiBaseUrl}/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteConversation = async (conversationId, token, apiBaseUrl) => {
    await axios.delete(`${apiBaseUrl}/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const streamChatResponse = async ({
    conversationId,
    messageContent,
    model,
    token,
    apiBaseUrl,
    onChunk,
    onConversationCreated
}) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBaseUrl}/api/conversations/${conversationId}/messages/stream`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            content: messageContent,
            aiModel: model
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
        throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantResponse = "";
    let buffer = '';
    let isNewConversation = conversationId === 0;
    let receivedConversationId = false;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const chunk = line.substring(5);

                if (isNewConversation && !receivedConversationId && chunk.startsWith('{')) {
                    try {
                        const conversationData = JSON.parse(chunk);
                        if (conversationData.conversationId) {
                            onConversationCreated?.(conversationData.conversationId, messageContent, model);
                            receivedConversationId = true;
                            continue;
                        }
                    } catch {
                    }
                }

                if (chunk) {
                    assistantResponse += chunk;
                } else {
                    assistantResponse += '\n';
                }

                onChunk?.(assistantResponse);
            }
        }
    }

    return assistantResponse;
};
