import React from 'react';
import { cn } from '@/lib/utils';
import { span } from "framer-motion/client";

interface Props {
    content: string;
    index: number;
    total: number;
    title: string;
    theme: 'light' | 'dark' | 'sepia';
    bgImage?: string;
    sealText?: string;
    sealShape?: 'square' | 'circle';
    blurAmount: number;
    sealFont: string;
    aspectRatio: '3:4' | '1:1' | '9:16';
}

export const EditorCard = ({
                               content, index, total, title, theme, bgImage,
                               sealText, sealShape, blurAmount, sealFont, aspectRatio
                           }: Props) => {

    const getFontSize = (text: string) => {
        const len = text.length;
        const baseSize = aspectRatio === '9:16' ? 20 : 18;
        if (len <= 50) return `${baseSize + 8}px`;
        if (len <= 100) return `${baseSize + 2}px`;
        return `${baseSize - 2}px`;
    };

    const themes = {
        light: "bg-[#F8F5F0] text-slate-900",
        dark: "bg-zinc-900 text-zinc-100",
        sepia: "bg-[#F4EBD0] text-[#433422]"
    };

    const ratioClasses = {
        '3:4': "w-[375px] h-[500px]",
        '1:1': "w-[400px] h-[400px]",
        '9:16': "w-[337px] h-[600px]"
    };

    const glassBg = theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.35)';

    return (
        <div
            id={`echo-card-${index}`}
            className={cn(
                "relative flex flex-col p-8 shadow-2xl overflow-hidden shrink-0 transition-all duration-500",
                themes[theme],
                ratioClasses[aspectRatio]
            )}
        >
            {bgImage && <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" alt="背景" />}

            <div className="z-10 flex justify-between items-baseline border-b border-current/10 pb-2 backdrop-blur-sm bg-current/5 px-2">
                <span className="text-[10px] tracking-[0.2em] font-bold uppercase opacity-80 truncate max-w-[200px]">{title || "ECHOCARD"}</span>
                <span className="text-xs italic font-serif opacity-70">/{index + 1}</span>
            </div>

            <div className="z-10 flex-1 flex items-center justify-center my-4 overflow-hidden relative">
                <div
                    className={cn(
                        "w-full max-h-full p-6 transition-all duration-300 flex items-center justify-center relative rounded-2xl",
                        bgImage && blurAmount > 0 ? "border border-white/20 shadow-xl" : ""
                    )}
                    style={{
                        backdropFilter: bgImage && blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
                        backgroundColor: bgImage && blurAmount > 0 ? glassBg : 'transparent',
                    }}
                >
                    <p className="leading-[1.7] font-medium whitespace-pre-wrap tracking-tight text-center w-full" style={{ fontSize: getFontSize(content) }}>
                        {content}
                    </p>
                    {sealText && (
                        <div className="absolute -bottom-2 -right-1 z-20">
                            <div className={cn("border-[2px] border-red-600/80 text-red-600/80 font-bold flex items-center justify-center rotate-[-10deg] mix-blend-multiply opacity-90", sealShape === 'circle' ? "rounded-full w-9 h-9 text-[8px]" : "rounded-sm w-9 h-9 text-[9px]") } style={{ fontFamily: sealFont }}>
                                <span className="[writing-mode:vertical-rl] py-0.5 tracking-tighter">{sealText}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="z-10 flex justify-between items-end pt-4 border-t border-current/10 bg-current/5 px-2 rounded-b-sm backdrop-blur-sm">
                <div className="text-[9px] opacity-50 font-bold uppercase">EchoCard Studio</div>
                <div className="flex gap-1.5 pb-1">
                    {Array.from({ length: total }).map((_, i) => (
                        <div key={i} className={cn("w-1 h-1 rounded-full transition-all", i === index ? "bg-orange-500 scale-150" : "bg-current/20")} />
                    ))}
                </div>
            </div>
        </div>
    );
};
