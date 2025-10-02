const ANONYMOUS_CONVERSATIONS_KEY = 'anonymous_conversations';

export const loadAnonymousConversations = () => {
    try {
        const stored = localStorage.getItem(ANONYMOUS_CONVERSATIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading anonymous conversations:', error);
        return [];
    }
};

export const saveAnonymousConversations = (conversations) => {
    try {
        localStorage.setItem(ANONYMOUS_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error('Error saving anonymous conversations:', error);
    }
};

export const saveAnonymousMessage = (userMessage, aiResponse, aiModel) => {
    try {
        let conversations = loadAnonymousConversations();
        let convo = conversations.find(c => c.aiModel === aiModel);

        if (!convo) {
            const title = userMessage.length > 50
                ? userMessage.substring(0, 47) + '...'
                : userMessage;

            convo = {
                id: `anon_${Date.now()}`,
                title: title,
                aiModel: aiModel,
                isAnonymous: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages: []
            };
            conversations.unshift(convo);
        } else {
            convo.updatedAt = new Date().toISOString();
            conversations = conversations.filter(c => c.id !== convo.id);
            conversations.unshift(convo);
        }

        convo.messages.push({
            id: 0,
            content: userMessage,
            type: 'USER',
            messageType: 'USER',
            createdAt: new Date().toISOString()
        });

        convo.messages.push({
            id: 0,
            content: aiResponse,
            type: 'ASSISTANT',
            messageType: 'ASSISTANT',
            createdAt: new Date().toISOString()
        });

        saveAnonymousConversations(conversations);
        return conversations;
    } catch (error) {
        console.error('Error saving anonymous message:', error);
        return loadAnonymousConversations();
    }
};

export const deleteAnonymousConversation = (conversationId) => {
    try {
        const conversations = loadAnonymousConversations();
        const updatedConversations = conversations.filter(c => c.id !== conversationId);
        saveAnonymousConversations(updatedConversations);
        return updatedConversations;
    } catch (error) {
        console.error('Error deleting anonymous conversation:', error);
        return loadAnonymousConversations();
    }
};
