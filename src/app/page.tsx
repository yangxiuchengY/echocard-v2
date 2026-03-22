"use client";

import { useState, useMemo, useEffect } from 'react';
import { splitContent } from '@/lib/engine';
import { EditorCard } from '@/components/EditorCard';
import { toPng } from 'html-to-image';
import {
    Download, Sparkles, Loader2, Image as ImageIcon, X, Settings, ChevronLeft, Sliders, Maximize, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EchoCardApp() {
    // 状态初始化
    const [text, setText] = useState("载入中...");
    const [title, setTitle] = useState("每日灵感");
    const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [sealText, setSealText] = useState("老王出品");
    const [sealShape, setSealShape] = useState<'square' | 'circle'>('square');
    const [blurAmount, setBlurAmount] = useState(12);
    const [sealFont, setSealFont] = useState('serif');
    const [aspectRatio, setAspectRatio] = useState<'3:4' | '1:1' | '9:16'>('3:4');

    const [showSettings, setShowSettings] = useState(true);
    const [isPolishing, setIsPolishing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); // 避免 Hydration 不匹配

    // ✨ 1. 初始化：从本地存储读取数据
    useEffect(() => {
        const saved = localStorage.getItem('echocard_prefs');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setText(data.text || "在这里输入内容...");
                setTitle(data.title || "每日灵感");
                setTheme(data.theme || 'light');
                setBgImage(data.bgImage || null);
                setSealText(data.sealText || "老王出品");
                setSealShape(data.sealShape || 'square');
                setBlurAmount(data.blurAmount ?? 12);
                setSealFont(data.sealFont || 'serif');
                setAspectRatio(data.aspectRatio || '3:4');
            } catch (e) { console.error("读取缓存失败"); }
        } else {
            setText("在这里输入长文内容...\n本地存储已开启，刷新也不会丢失。");
        }
        setIsLoaded(true);
    }, []);

    // ✨ 2. 持久化：当状态改变时保存到本地
    useEffect(() => {
        if (!isLoaded) return;
        const timer = setTimeout(() => {
            const data = { text, title, theme, bgImage, sealText, sealShape, blurAmount, sealFont, aspectRatio };
            try {
                localStorage.setItem('echocard_prefs', JSON.stringify(data));
            } catch (e) {
                // 如果图片太大导致存储失败，则只存配置不存图片
                console.warn("存储空间不足，可能背景图过大");
                localStorage.setItem('echocard_prefs', JSON.stringify({ ...data, bgImage: null }));
            }
        }, 500); // 防抖处理，避免频繁写入
        return () => clearTimeout(timer);
    }, [text, title, theme, bgImage, sealText, sealShape, blurAmount, sealFont, aspectRatio, isLoaded]);

    const wordsPerPage = aspectRatio === '9:16' ? 150 : 125;
    const pages = useMemo(() => splitContent(text, wordsPerPage), [text, wordsPerPage]);

    const handleReset = () => {
        if(confirm("确定要清空所有配置吗？")) {
            localStorage.removeItem('echocard_prefs');
            window.location.reload();
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setBgImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAI = async () => {
        if (!text.trim()) return;
        setIsPolishing(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text }),
            });
            const data = await res.json();
            if (data.text) setText(data.text);
        } catch (err) { alert("AI 润色连接失败"); }
        finally { setIsPolishing(false); }
    };

    const handleDownload = async () => {
        try {
            for (let i = 0; i < pages.length; i++) {
                const node = document.getElementById(`echo-card-${i}`);
                if (node) {
                    const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true });
                    const link = document.createElement('a');
                    link.download = `EchoCard_${i+1}.png`;
                    link.href = dataUrl;
                    link.click();
                }
            }
        } catch (e) { alert("导出失败"); }
    };

    if (!isLoaded) return null; // 简单 Loading 状态

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-zinc-300 flex overflow-hidden relative">
            {!showSettings && (
                <button onClick={() => setShowSettings(true)} className="fixed top-6 left-6 z-50 p-3 bg-orange-500 text-black rounded-full shadow-2xl hover:scale-110 transition-all">
                    <Settings size={20} />
                </button>
            )}

            <div className={cn(
                "fixed md:relative z-40 h-full w-[360px] bg-[#141414] border-r border-white/5 transition-all duration-300 flex flex-col shrink-0 shadow-2xl",
                showSettings ? "translate-x-0" : "-translate-x-full md:ml-[-360px]"
            )}>
                <div className="p-8 flex flex-col h-full gap-6 overflow-y-auto custom-scrollbar">
                    <header className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h1 className="text-xl font-black text-orange-500 italic">ECHOCARD.</h1>
                        <div className="flex gap-2">
                            <button onClick={handleReset} title="重置" className="p-1 text-zinc-600 hover:text-red-500 transition-colors"><RotateCcw size={16} /></button>
                            <button onClick={() => setShowSettings(false)} className="text-zinc-600 hover:text-white"><ChevronLeft size={20} /></button>
                        </div>
                    </header>

                    <div className="flex flex-col gap-5">
                        {/* 比例切换 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Maximize size={12} /> 导出比例</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['3:4', '1:1', '9:16'] as const).map(r => (
                                    <button key={r} onClick={() => setAspectRatio(r)} className={cn("py-2 rounded-lg text-[10px] font-bold border transition-all", aspectRatio === r ? "bg-orange-500 border-orange-500 text-black" : "bg-zinc-800 border-white/5 text-zinc-500")}>
                                        {r === '3:4' ? '小红书' : r === '1:1' ? '朋友圈' : '全屏'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 内容 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">内容</label>
                                <button onClick={handleAI} disabled={isPolishing} className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
                                    {isPolishing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}AI润色
                                </button>
                            </div>
                            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-32 bg-zinc-900 border border-white/5 rounded-xl p-4 text-xs focus:border-orange-500/40 outline-none resize-none" />
                        </div>

                        {/* 磨砂调节 */}
                        <div className="space-y-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                                <span className="flex items-center gap-2"><Sliders size={12}/> 模糊度</span>
                                <span className="text-orange-500">{blurAmount}px</span>
                            </div>
                            <input type="range" min="0" max="30" value={blurAmount} onChange={(e) => setBlurAmount(parseInt(e.target.value))} className="w-full accent-orange-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        {/* 印章 */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">个性化印章</label>
                            <input maxLength={4} value={sealText} onChange={(e) => setSealText(e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 text-xs outline-none" />
                            <div className="grid grid-cols-2 gap-2">
                                <select value={sealFont} onChange={(e) => setSealFont(e.target.value)} className="bg-zinc-900 border border-white/5 rounded-xl p-2 text-[10px] outline-none">
                                    <option value="serif">衬线体</option>
                                    <option value="sans-serif">黑体</option>
                                    <option value='"Kaiti", serif'>楷体</option>
                                </select>
                                <button onClick={() => setSealShape(s => s === 'square' ? 'circle' : 'square')} className="bg-zinc-800 rounded-xl text-[10px] border border-white/5">{sealShape === 'square' ? '方' : '圆'}</button>
                            </div>
                        </div>

                        {/* 背景图片 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">背景背景</label>
                            {!bgImage ? (
                                <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                                    <ImageIcon size={18} className="text-zinc-600" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="relative h-16 rounded-xl overflow-hidden group">
                                    <img src={bgImage} className="w-full h-full object-cover" />
                                    <button onClick={() => setBgImage(null)} className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-[10px] font-bold"><X size={14}/> 移除</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleDownload} className="mt-auto flex items-center justify-center gap-3 w-full py-4 bg-orange-500 hover:bg-orange-600 text-black font-black rounded-2xl transition-all shadow-xl active:scale-95">
                        <Download size={18} /> 导出 图片
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-black p-12 flex flex-col items-center gap-16 custom-scrollbar">
                {pages.map((p, i) => (
                    <EditorCard key={i} content={p} index={i} total={pages.length} title={title} theme={theme} bgImage={bgImage || undefined} sealText={sealText} sealShape={sealShape} blurAmount={blurAmount} sealFont={sealFont} aspectRatio={aspectRatio} />
                ))}
                <div className="h-24" />
            </div>
        </main>
    );
}
