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

    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData((prev) => prev + nextWord);
        }, 75 * index);
    };

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
        setPrevPrompts((prev) => [...prev, messageContent]);

        // Add user message immediately to show in conversation
        const tempUserMessage = {
            id: Date.now(), // Temporary ID
            type: 'USER',
            content: messageContent,
            timestamp: new Date().toISOString()
        };

        if (currentConversation) {
            setMessages(prev => [...prev, tempUserMessage]);
        }

        try {
            let token = null;
            if (currentUser) {
                token = await currentUser.getIdToken();
            }

            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const conversationId = currentConversation?.id || 0;
            const model = currentModel;

            console.log('Sending request:', {
                url: `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
                content: messageContent,
                aiModel: model,
                hasAuth: !!token
            });

            const response = await axios.post(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
                content: messageContent,
                aiModel: model
            }, { headers });

            const { userMessage, aiMessage, conversationId: newConversationId } = response.data;
            
            if (!currentConversation) {
                const newConv = { 
                    id: newConversationId, 
                    title: input.slice(0, 50) + '...',
                    aiModel: model 
                };
                setCurrentConversation(newConv);
                
                loadConversations();
            }

            if (!currentConversation) {
                setMessages(prev => [...prev, userMessage, aiMessage]);
            } else {
                setMessages(prev => {
                    const withoutTemp = prev.slice(0, -1); 
                    return [...withoutTemp, userMessage, aiMessage];
                });
            }

            let typedResponse = formatMessageContent(aiMessage.content);
            let typedResponseArray = typedResponse.split(" ");
            for (let i = 0; i < typedResponseArray.length; i++) {
                const nextWord = typedResponseArray[i];
                delayPara(i, nextWord + " ");
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            setResultData("Sorry, I encountered an error. Please try again.");
        }
        setLoading(false);
        
        // Only clear input if we used the current input state (not a passed prompt)
        if (!promptText) {
            setInput("");
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