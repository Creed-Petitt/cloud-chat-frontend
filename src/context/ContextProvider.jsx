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
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);

    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentModel, setCurrentModel] = useState("openai");
    const [isImageMode, setIsImageMode] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [currentView, setCurrentView] = useState('chat');

    const loadImages = useCallback(async () => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/api/images/my-images`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Normalize the data to have a 'prompt' field
            const normalizedImages = response.data.map(image => ({
                ...image,
                prompt: image.content // Rename 'content' to 'prompt'
            }));

            setGeneratedImages(normalizedImages);
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }, [currentUser, API_BASE_URL]);


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
            loadImages();
        } else {
            setConversations([]);
            setCurrentConversation(null);
            setMessages([]);
            setGeneratedImages([]);
        }
    }, [currentUser, loadConversations, loadImages]);

    // Auto-switch model based on image mode
    useEffect(() => {
        if (isImageMode) {
            // When entering image mode, switch to Gemini
            setCurrentModel("gemini");
        } else {
            // When exiting image mode, switch to OpenAI if currently on Gemini
            if (currentModel === "gemini") {
                setCurrentModel("openai");
            }
        }
    }, [isImageMode]); // Only depend on isImageMode, not currentModel to avoid loop

    const selectConversation = async (conversationId) => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/api/conversations/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCurrentConversation(response.data.conversation);
            console.log('Loaded messages:', response.data.messages);
            setMessages(response.data.messages);
            setShowResult(true);
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

        setLoading(true);
        setShowResult(true);

        const userMessage = {
            id: Date.now(),
            type: 'USER',
            content: messageContent,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        let assistantMessage = {
            id: Date.now() + 1,
            type: 'ASSISTANT',
            content: "",
            timestamp: new Date().toISOString()
        };

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


            const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages/stream`, {
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

            let isNewConversation = conversationId === 0;
            let receivedConversationId = false;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantResponse = "";

            setMessages(prev => [...prev, assistantMessage]);

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
                        const chunk = line.substring(5);
                        if (isNewConversation && !receivedConversationId && chunk.startsWith('{')) {
                            try {
                                const conversationData = JSON.parse(chunk);
                                if (conversationData.conversationId) {
                                    const generateTitle = (content) => {
                                        const title = content.trim();
                                        return title.length > 50 ? title.substring(0, 47) + "..." : title;
                                    };

                                    const newConversation = {
                                        id: conversationData.conversationId,
                                        title: generateTitle(messageContent),
                                        aiModel: model,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString()
                                    };
                                    setCurrentConversation(newConversation);
                                    setConversations(prev => [newConversation, ...prev]);
                                    receivedConversationId = true;

                                    continue; 
                                }
                            } catch {
                                // Not JSON, treat as regular content
                            }
                        }

                        if (chunk) {
                            assistantResponse += chunk;
                        } else {
                            assistantResponse += '\n';
                        }
                        
                        setMessages(prev => prev.map(msg =>
                            msg.id === assistantMessage.id
                                ? { ...msg, content: assistantResponse }
                                : msg
                        ));
                    }
                }
            }

        } catch (error) {
            console.error('Error fetching chat response:', error);
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessage.id
                    ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
                    : msg
            ));
        } finally {
            setLoading(false);
            if (!promptText) {
                setInput("");
            }
            loadConversations();
        }
    };


    const generateImage = async (prompt) => {
        if (!prompt || !prompt.trim()) {
            console.error('No prompt provided for image generation');
            return;
        }

        setLoading(true);
        setShowResult(true);

        const userMessage = {
            id: Date.now(),
            type: 'USER',
            content: prompt,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        const assistantMessage = {
            id: Date.now() + 1,
            type: 'ASSISTANT',
            content: "Generating image...",
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            const token = currentUser ? await currentUser.getIdToken() : null;
            if (!token) {
                throw new Error("User not authenticated");
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const payload = {
                prompt: prompt,
                model: 'imagen',
            };

            if (currentConversation) {
                payload.conversationId = currentConversation.id;
            }

            const response = await axios.post(`${API_BASE_URL}/api/images/generate`, payload, { headers });

            const { imageUrl, conversationId } = response.data;

            // Update conversation ID if backend returned one (could be new or existing)
            if (conversationId && (!currentConversation || currentConversation.id !== conversationId)) {
                await loadConversations();
                setCurrentConversation({ id: conversationId });
            }

            const imageMarkdown = `![Image generated from prompt: ${prompt}](${imageUrl})`;

            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessage.id
                    ? { ...msg, content: imageMarkdown, messageType: 'IMAGE', imageUrl }
                    : msg
            ));

            // Add the new image (which has the correct format) to the gallery state
            setGeneratedImages(prev => [response.data, ...prev]);

        } catch (error) {
            console.error('Error generating image:', error);
            const errorMessage = error.response?.data?.message || "Sorry, I encountered an error while generating the image.";
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessage.id
                    ? { ...msg, content: errorMessage }
                    : msg
            ));
        } finally {
            setLoading(false);
            setInput("");
        }
    };


    const contextValue = {
        getChatResponse,
        generateImage,
        input,
        setInput,
        showResult,
        setShowResult,
        loading,
        setLoading,

        conversations,
        currentConversation,
        messages,
        loadConversations,
        selectConversation,
        startNewConversation,
        deleteConversation,

        currentModel,
        setCurrentModel,
        isImageMode,
        setIsImageMode,
        generatedImages,
        loadImages,
        currentView,
        setCurrentView,
    };

    return (
        <Context.Provider value={contextValue}>{children}</Context.Provider>
    );
};

export default ContextProvider;