import axios from "axios";

export const fetchImages = async (token, apiBaseUrl) => {
    const response = await axios.get(`${apiBaseUrl}/api/images/my-images`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const normalizedImages = response.data.map(image => ({
        ...image,
        prompt: image.content
    }));

    return normalizedImages;
};

export const generateImage = async ({ prompt, token, apiBaseUrl, conversationId }) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
        prompt: prompt,
        model: 'imagen',
    };

    if (conversationId) {
        payload.conversationId = conversationId;
    }

    const response = await axios.post(`${apiBaseUrl}/api/images/generate`, payload, { headers });
    return response.data;
};
