export const splitContent = (text: string, maxChars: number = 120): string[] => {
    // 按行分割，保留空行感
    const paragraphs = text.split('\n');
    const pages: string[] = [];
    let currentPage = "";

    paragraphs.forEach((p) => {
        if ((currentPage.length + p.length) > maxChars) {
            pages.push(currentPage.trim());
            currentPage = p + "\n";
        } else {
            currentPage += p + "\n";
        }
    });
    if (currentPage) pages.push(currentPage.trim());
    return pages;
};
