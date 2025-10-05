import { useState, useCallback, useEffect } from 'react';
import * as imageService from '../services/image.service';

export const useImages = (currentUser, apiBaseUrl, currentConversation, loadConversations, setCurrentConversation) => {
    const [generatedImages, setGeneratedImages] = useState([]);
    const [isImageMode, setIsImageMode] = useState(false);

    const loadImages = useCallback(async () => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const images = await imageService.fetchImages(token, apiBaseUrl);
            setGeneratedImages(images);
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }, [currentUser, apiBaseUrl]);

    const generateImage = async (prompt, setMessages, setLoading) => {
        if (!prompt || !prompt.trim()) {
            console.error('No prompt provided for image generation');
            return;
        }

        setLoading(true);

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

            const data = await imageService.generateImage({
                prompt,
                token,
                apiBaseUrl,
                conversationId: currentConversation?.id
            });

            const { imageUrl, conversationId } = data;

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

            setGeneratedImages(prev => [data, ...prev]);

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
        }
    };

    useEffect(() => {
        if (!currentUser) {
            setGeneratedImages([]);
        }
    }, [currentUser]);

    return {
        generatedImages,
        setGeneratedImages,
        isImageMode,
        setIsImageMode,
        loadImages,
        generateImage,
    };
};
