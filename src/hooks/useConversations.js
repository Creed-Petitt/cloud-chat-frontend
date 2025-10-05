import { useState, useCallback, useEffect } from 'react';
import * as conversationService from '../services/conversation.service';

export const useConversations = (currentUser, apiBaseUrl) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);

    const loadConversations = useCallback(async () => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const data = await conversationService.fetchConversations(token, apiBaseUrl);
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }, [currentUser, apiBaseUrl]);

    const selectConversation = async (conversationId) => {
        if (!currentUser) return null;

        try {
            const token = await currentUser.getIdToken();
            const data = await conversationService.fetchConversation(conversationId, token, apiBaseUrl);
            setCurrentConversation(data.conversation);
            return { conversation: data.conversation, messages: data.messages };
        } catch (error) {
            console.error('Error loading conversation:', error);
            return null;
        }
    };

    const startNewConversation = () => {
        setCurrentConversation(null);
    };

    const deleteConversation = async (conversationId) => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            await conversationService.deleteConversation(conversationId, token, apiBaseUrl);
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));

            if (currentConversation?.id === conversationId) {
                setCurrentConversation(null);
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const addConversation = (conversation) => {
        setConversations(prev => [conversation, ...prev]);
        setCurrentConversation(conversation);
    };

    useEffect(() => {
        if (currentUser) {
            loadConversations();
        }
    }, [currentUser, loadConversations]);

    return {
        conversations,
        setConversations,
        currentConversation,
        setCurrentConversation,
        loadConversations,
        selectConversation,
        startNewConversation,
        deleteConversation,
        addConversation,
    };
};
