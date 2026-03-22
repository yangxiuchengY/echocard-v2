export const polishText = async (content: string) => {
    const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.text;
};
