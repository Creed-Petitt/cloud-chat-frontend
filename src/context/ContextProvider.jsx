import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useConversations } from "../hooks/useConversations";
import { useChat } from "../hooks/useChat";
import { useImages } from "../hooks/useImages";

// eslint-disable-next-line react-refresh/only-export-components
export const Context = createContext();

const ContextProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const [input, setInput] = useState("");
    const [currentModel, setCurrentModel] = useState("openai");
    const [currentView, setCurrentView] = useState('chat');

    const conversationState = useConversations(currentUser, API_BASE_URL);

    const chatState = useChat(
        currentUser,
        API_BASE_URL,
        currentModel,
        conversationState.currentConversation,
        conversationState.loadConversations,
        conversationState.addConversation,
        conversationState.setConversations
    );

    const imageState = useImages(
        currentUser,
        API_BASE_URL,
        conversationState.currentConversation,
        conversationState.loadConversations,
        conversationState.setCurrentConversation
    );

    const { loadImages } = imageState;

    useEffect(() => {
        if (imageState.isImageMode) {
            setCurrentModel("gemini");
        } else {
            if (currentModel === "gemini") {
                setCurrentModel("openai");
            }
        }
    }, [imageState.isImageMode, currentModel]);

    useEffect(() => {
        if (currentUser) {
            loadImages();
        }
    }, [currentUser, loadImages]);

    const selectConversation = async (conversationId) => {
        const result = await conversationState.selectConversation(conversationId);
        if (result) {
            chatState.setMessages(result.messages);
            chatState.setShowResult(true);
            chatState.setLoading(false);
        }
    };

    const startNewConversation = () => {
        conversationState.startNewConversation();
        chatState.setMessages([]);
        chatState.setShowResult(false);
    };

    const deleteConversation = async (conversationId) => {
        await conversationState.deleteConversation(conversationId);
        if (conversationState.currentConversation?.id === conversationId) {
            chatState.setMessages([]);
            chatState.setShowResult(false);
        }
    };

    const getChatResponse = async (promptText = null) => {
        await chatState.getChatResponse(promptText, input);
        setInput("");
    };

    const generateImage = async (prompt) => {
        chatState.setShowResult(true);
        await imageState.generateImage(prompt, chatState.setMessages, chatState.setLoading, setInput);
    };

    const contextValue = {
        getChatResponse,
        generateImage,
        input,
        setInput,
        showResult: chatState.showResult,
        setShowResult: chatState.setShowResult,
        loading: chatState.loading,
        setLoading: chatState.setLoading,

        conversations: conversationState.conversations,
        currentConversation: conversationState.currentConversation,
        messages: chatState.messages,
        loadConversations: conversationState.loadConversations,
        selectConversation,
        startNewConversation,
        deleteConversation,

        currentModel,
        setCurrentModel,
        isImageMode: imageState.isImageMode,
        setIsImageMode: imageState.setIsImageMode,
        generatedImages: imageState.generatedImages,
        loadImages: imageState.loadImages,
        currentView,
        setCurrentView,
    };

    return (
        <Context.Provider value={contextValue}>{children}</Context.Provider>
    );
};

export default ContextProvider;
