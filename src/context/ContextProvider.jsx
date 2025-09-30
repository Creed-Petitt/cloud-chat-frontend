import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; 
import { formatMessageContent } from "../utils/textFormatter";

// eslint-disable-next-line react-refresh/only-export-components
export const Context = createContext();

const ContextProvider = ({ children }) => {
    const { currentUser } = useAuth();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentModel, setCurrentModel] = useState("gemini");


    const loadConversations = useCallback(async () => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/api/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }, [currentUser, API_BASE_URL]);

    useEffect(() => {
        if (currentUser) {
            loadConversations();
        } else {
            setConversations([]);
            setCurrentConversation(null);
            setMessages([]);
        }
    }, [currentUser, loadConversations]);

    const formatMessagesForDisplay = (messages) => {
        if (!messages || messages.length === 0) return "";

        let formattedHtml = "";
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (message.type === 'ASSISTANT') {
                const formattedContent = formatMessageContent(message.content);

                if (i > 0) formattedHtml += "<br/><br/>";
                formattedHtml += formattedContent;
            }
        }
        return formattedHtml;
    };

    const selectConversation = async (conversationId) => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/api/conversations/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCurrentConversation(response.data.conversation);
            setMessages(response.data.messages);

            setLoading(true);
            setShowResult(true);

            const formattedConversation = formatMessagesForDisplay(response.data.messages);
            setResultData(formattedConversation);

            const userMessages = response.data.messages.filter(msg => msg.type === 'USER');
            if (userMessages.length > 0) {
                setRecentPrompt(userMessages[userMessages.length - 1].content);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading conversation:', error);
            setLoading(false);
        }
    };

    const startNewConversation = () => {
        setCurrentConversation(null);
        setMessages([]);
        setShowResult(false);
        setResultData("");
    };

    const deleteConversation = async (conversationId) => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`${API_BASE_URL}/api/conversations/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from conversations list
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));

            // Clear current conversation if it's the one being deleted
            if (currentConversation?.id === conversationId) {
                setCurrentConversation(null);
                setMessages([]);
                setShowResult(false);
                setResultData("");
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const getChatResponse = async (promptText = null) => {
        const messageContent = promptText || input;
        if (!messageContent.trim()) {
            console.error('No message content provided');
            return;
        }

        setResultData("");
        setLoading(true);
        setShowResult(true);
        setRecentPrompt(messageContent);

        const userMessage = {
            id: Date.now(),
            type: 'USER',
            content: messageContent,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const token = currentUser ? await currentUser.getIdToken() : null;
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            let conversationId = currentConversation?.id || 0;
            const model = currentModel;

            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
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

            if (conversationId === 0 && currentUser) {
                setTimeout(() => {
                    loadConversations();
                }, 1000);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantResponse = "";

            const assistantMessage = {
                id: Date.now() + 1,
                type: 'ASSISTANT',
                content: "",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Stream parsing logic
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const chunk = line.substring(5).trim();
                        if (chunk) {
                            assistantResponse += chunk;
                            const formattedAssistantResponse = formatMessageContent(assistantResponse);
                            setResultData(formattedAssistantResponse);
                            setMessages(prev => prev.map(msg =>
                                msg.id === assistantMessage.id
                                    ? { ...msg, content: assistantResponse }
                                    : msg
                            ));
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error fetching chat response:', error);
            setResultData("Sorry, I encountered an error. Please try again.");
        } finally {
            setLoading(false);
            if (!promptText) {
                setInput("");
            }
        }
    };


    const contextValue = {
        getChatResponse,
        input,
        setInput,
        recentPrompt,
        setRecentPrompt,
        prevPrompts,
        setPrevPrompts,
        showResult,
        setShowResult,
        loading,
        setLoading,
        resultData,
        setResultData,

        conversations,
        currentConversation,
        messages,
        loadConversations,
        selectConversation,
        startNewConversation,
        deleteConversation,

        currentModel,
        setCurrentModel,
    };

    return (
        <Context.Provider value={contextValue}>{children}</Context.Provider>
    );
};

export default ContextProvider;