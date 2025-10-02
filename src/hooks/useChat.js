import { useState } from 'react';
import * as conversationService from '../services/conversation.service';
import * as localStorageService from '../services/localStorage.service';

export const useChat = (
    currentUser,
    apiBaseUrl,
    currentModel,
    currentConversation,
    loadConversations,
    addConversation,
    setConversations
) => {
    const [messages, setMessages] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);

    const getChatResponse = async (promptText = null, imageUrl = null, input = "") => {
        const messageContent = promptText || input;
        // Allow message if either content or imageUrl is provided
        if (!messageContent.trim() && !imageUrl) {
            console.error('No message content or image provided');
            return;
        }

        setLoading(true);
        setShowResult(true);

        const userMessage = {
            id: Date.now(),
            type: 'USER',
            content: messageContent,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        let assistantMessage = {
            id: Date.now() + 1,
            type: 'ASSISTANT',
            content: "",
            timestamp: new Date().toISOString()
        };

        let conversationId = currentConversation?.id || 0;
        const model = currentModel;
        let assistantResponse = "";

        try {
            const token = currentUser ? await currentUser.getIdToken() : null;
            setMessages(prev => [...prev, assistantMessage]);

            assistantResponse = await conversationService.streamChatResponse({
                conversationId,
                messageContent,
                imageUrl,
                model,
                token,
                apiBaseUrl,
                onChunk: (content) => {
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMessage.id
                            ? { ...msg, content: content }
                            : msg
                    ));
                },
                onConversationCreated: (newConversationId, userMsg, aiModel) => {
                    const generateTitle = (content) => {
                        const title = content.trim();
                        return title.length > 50 ? title.substring(0, 47) + "..." : title;
                    };

                    const newConversation = {
                        id: newConversationId,
                        title: generateTitle(userMsg),
                        aiModel: aiModel,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    addConversation(newConversation);
                }
            });

        } catch (error) {
            console.error('Error fetching chat response:', error);
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessage.id
                    ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
                    : msg
            ));
        } finally {
            setLoading(false);

            if (!currentUser && conversationId === 0) {
                const updatedConversations = localStorageService.saveAnonymousMessage(
                    messageContent,
                    assistantResponse,
                    model
                );
                setConversations(updatedConversations);
            } else if (currentUser) {
                loadConversations();
            }
        }
    };

    return {
        messages,
        setMessages,
        showResult,
        setShowResult,
        loading,
        setLoading,
        getChatResponse,
    };
};
