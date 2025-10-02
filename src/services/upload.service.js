export const uploadFile = async (file, token, apiBaseUrl) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBaseUrl}/api/upload/image`, {
        method: 'POST',
        headers: headers,
        body: formData
    });

    if (!response.ok) {
        throw new Error('File upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
};
