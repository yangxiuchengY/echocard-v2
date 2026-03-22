import { NextResponse } from 'next/server';
export const maxDuration = 30;
export async function POST(req: Request) {
    try {
        const { content } = await req.json();
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 });
        }

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "你是一个专业的文案润色助手，擅长将文字转化为有情绪价值的小红书风格内容。" },
                    { role: "user", content: `请润色这段文字，加入适当emoji，保持分段感：\n\n${content}` }
                ]
            })
        });

        const data = await response.json();
        return NextResponse.json({ text: data.choices[0].message.content });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
