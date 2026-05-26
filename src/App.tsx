import React, { useState, useEffect } from "react";

// --- 自定义 SVG 图标，避免外部依赖加载失败 ---
const BrainIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
    </svg>
);

const CpuIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"
        />
    </svg>
);

const DatabaseIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
    </svg>
);

const BookOpenIcon = () => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
    </svg>
);

const CheckIcon = () => (
    <svg
        className="w-5 h-5 text-emerald-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

const CrossIcon = () => (
    <svg
        className="w-5 h-5 text-rose-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

export default function App() {
    const [activeTab, setActiveTab] = useState("simulator"); // 'simulator' | 'glossary' | 'quiz'

    // --- 模拟器状态 ---
    const [phase, setPhase] = useState("prefill"); // 'prefill' | 'decode'
    const [blockSize, setBlockSize] = useState(4);
    const [prefixCacheHit, setPrefixCacheHit] = useState(false); // Prefill时前4个token是否命中
    const [animationStep, setAnimationStep] = useState(0); // 0: 初始, 1: token划块, 2: 物理Block分配, 3: slot_mapping计算, 4: Attention写入与读取
    const [isPlaying, setIsPlaying] = useState(false);

    // --- 模拟序列数据 ---
    const initialTokens = [
        "LLMs",
        "are",
        "changing",
        "the",
        "world",
        "with",
        "nano",
        "vllm",
    ];
    const decodeToken = "🚀"; // decode阶段新加入的token

    // 物理Block分配
    const physicalBlocks = {
        0: 12, // 逻辑Block 0 -> 物理Block 12
        1: 25, // 逻辑Block 1 -> 物理Block 25
        2: 7, // 逻辑Block 2 -> 物理Block 7 (Decode分配的新块)
    };

    // 自动播放动画控制
    useEffect(() => {
        let timer;
        if (isPlaying) {
            timer = setInterval(() => {
                setAnimationStep((prev) => {
                    if (prev >= 4) {
                        setIsPlaying(false);
                        return 4;
                    }
                    return prev + 1;
                });
            }, 2500);
        }
        return () => clearInterval(timer);
    }, [isPlaying]);

    // 重置动画
    const handleReset = () => {
        setAnimationStep(0);
        setIsPlaying(false);
    };

    // 计算当前的变量
    const calculateVariables = () => {
        let inputIds = [];
        let positions = [];
        let slotMapping = [];
        let blockTables = [];
        let contextLens = [];
        let start = 0;
        let end = 0;

        if (phase === "prefill") {
            start = prefixCacheHit ? 4 : 0;
            end = initialTokens.length;
            inputIds = initialTokens.slice(start, end);
            positions = Array.from(
                { length: end - start },
                (_, i) => start + i,
            );

            // block_tables 包含前两个物理块
            blockTables = [physicalBlocks[0], physicalBlocks[1]];

            // slot_mapping 计算
            const startBlock = Math.floor(start / blockSize);
            const endBlock = Math.floor((end + blockSize - 1) / blockSize);

            for (let i = startBlock; i < endBlock; i++) {
                let slotStart = physicalBlocks[i] * blockSize;
                if (i === startBlock) {
                    slotStart += start % blockSize;
                }
                let slotEnd = 0;
                if (i !== endBlock - 1) {
                    slotEnd = physicalBlocks[i] * blockSize + blockSize;
                } else {
                    slotEnd =
                        physicalBlocks[i] * blockSize + end - i * blockSize;
                }
                for (let s = slotStart; s < slotEnd; s++) {
                    slotMapping.push(s);
                }
            }
        } else {
            // Decode 阶段
            // 已有 8 个 token，第 9 个 token 来了
            inputIds = [decodeToken];
            positions = [initialTokens.length];
            contextLens = [initialTokens.length + 1];

            // 第9个token属于逻辑 block 2 (index 8 // 4 = 2)
            // 在逻辑 block 2 里的内偏移是 8 % 4 = 0
            const targetBlockIndex = Math.floor(
                initialTokens.length / blockSize,
            ); // 2
            const offsetInBlock = initialTokens.length % blockSize; // 0
            const physicalBlockId = physicalBlocks[targetBlockIndex]; // 7

            slotMapping = [physicalBlockId * blockSize + offsetInBlock];
            blockTables = [
                physicalBlocks[0],
                physicalBlocks[1],
                physicalBlocks[2],
            ];
        }

        return {
            inputIds,
            positions,
            slotMapping,
            blockTables,
            contextLens,
            start,
            end,
        };
    };

    const currentVars = calculateVariables();

    // --- Quiz 状态 ---
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const quizQuestions = [
        {
            id: 1,
            q: "问题 1：`block_table` 直接对应 GPU 显存里的直接地址吗？",
            options: [
                "是的，显存里的每一个槽位(slot)就是物理 block id 的值。",
                "不是。block_table 里存的是物理 block id 列表，它像个虚拟书架；而具体的 K/V 槽位(slot)需要通过 `physical_block_id * block_size + offset` 计算出来。",
            ],
            correct: 1,
            explain:
                "正确！`block_table` 只是物理块编号。GPU 真正的写入地址（即 slot_mapping）需要配合块内偏移量进行物理地址换算。",
        },
        {
            id: 2,
            q: "问题 2：在 Prefill 阶段，如果 prefix cache 命中（如命中前 4 个 token），这些命中的 token 还会参与计算并占用 slot 吗？",
            options: [
                "它们已经缓存在显存里了，这一轮模型 forward 不会重新计算它们的 K/V，也不再为它们生成 slot_mapping；但在 Attention 计算时，模型依然需要通过 `block_tables` 去读取它们的 KV 缓存参与 attention 计算。",
                "彻底不参与了。因为已经缓存，Attention 也可以直接无视这些 token。",
            ],
            correct: 0,
            explain:
                "正确！Prefix cache 命中只是省去了 K/V 的**重算与重写**。但在 Attention forward 中，新 token 依然需要与命中部分的旧 K/V 进行计算，因此必须提供 `block_tables` 指引 FlashAttention 去对应的物理块读取历史数据。",
        },
        {
            id: 3,
            q: "问题 3：Decode 阶段输入通常只有一个 token（last_token），那么我们怎么查到以前几千个历史 token 的上下文？",
            options: [
                "每次生成新 token，都需要把之前的 prompt + 已生成的 token 全部重新输入一遍给模型 forward。",
                "模型 forward 这一轮只传入新 token 的 embedding。但 Attention 层通过读取 `block_tables`（历史物理块列表）和 `context_lens`（上下文总长），直接去显存大张量里提取历史 K/V 进行计算。",
            ],
            correct: 1,
            explain:
                "正确！这就是 PagedAttention 的精髓：极速增量计算。每一轮只算最后一个 token 的 Q/K/V，然后用 Q 去显存里捞出所有历史的 K/V 算自注意力。",
        },
        {
            id: 4,
            q: "问题 4：物理显存的划分和真正的数据写入是由同一个模块 `BlockManager` 负责的吗？",
            options: [
                "是的，BlockManager 负责维护 block_table，也直接负责操作 Cuda tensor 进行数据拷贝。",
                "不是。BlockManager 只是元数据的“管家”，它只在 CPU 侧管理 block 的分配和映射表；真正操作 GPU 显存把 QK/V 写入 KV Cache 张量的是模型内部的 `Attention` 层中的 `store_kvcache` 算子内核。",
            ],
            correct: 1,
            explain:
                "正确！BlockManager 只管理元数据（“记账”），ModelRunner 翻译成“slot_mapping”指令，最终在 PyTorch/Triton 算子层（Attention）完成向 GPU 显存的物理写入。",
        },
    ];

    const handleQuizAnswer = (qId, optionIdx) => {
        setQuizAnswers({
            ...quizAnswers,
            [qId]: optionIdx,
        });
    };

    const getStepProgressWidth = () => {
        return `${(animationStep / 4) * 100}%`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
            {/* 头部标题栏 */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold px-2 py-0.5 rounded text-xs">
                            Day 13 专研
                        </span>
                        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                            nano-vLLM 源码解读：KV 到底怎么写进显存？
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        探究 PagedAttention 机制中：Scheduler → BlockManager →
                        ModelRunner → Attention 的显存交互链路
                    </p>
                </div>

                {/* 标签切换 */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setActiveTab("simulator")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "simulator" ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10" : "text-slate-400 hover:text-white"}`}
                    >
                        <CpuIcon />
                        交互模拟器
                    </button>
                    <button
                        onClick={() => setActiveTab("glossary")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "glossary" ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10" : "text-slate-400 hover:text-white"}`}
                    >
                        <BookOpenIcon />
                        核心术语表
                    </button>
                    <button
                        onClick={() => setActiveTab("quiz")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "quiz" ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10" : "text-slate-400 hover:text-white"}`}
                    >
                        <BrainIcon />
                        避坑闯关
                    </button>
                </div>
            </header>

            {/* 主体部分 */}
            <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 gap-6">
                {activeTab === "simulator" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* 左侧控制与配置面板 */}
                        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                                    <span>⚙️</span> 1. 推理阶段配置
                                </h2>

                                {/* 阶段选择器 */}
                                <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950 p-1 rounded-lg border border-slate-800">
                                    <button
                                        onClick={() => {
                                            setPhase("prefill");
                                            handleReset();
                                        }}
                                        className={`py-2 rounded text-sm font-semibold transition-all ${phase === "prefill" ? "bg-cyan-950 border border-cyan-800/50 text-cyan-400" : "text-slate-400 hover:text-slate-200"}`}
                                    >
                                        🚀 Prefill (首字计算)
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPhase("decode");
                                            handleReset();
                                        }}
                                        className={`py-2 rounded text-sm font-semibold transition-all ${phase === "decode" ? "bg-cyan-950 border border-cyan-800/50 text-cyan-400" : "text-slate-400 hover:text-slate-200"}`}
                                    >
                                        🔮 Decode (增量生成)
                                    </button>
                                </div>

                                {/* 子配置项 */}
                                {phase === "prefill" ? (
                                    <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">
                                                Prefix Cache 命中状态:
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setPrefixCacheHit(
                                                        !prefixCacheHit,
                                                    );
                                                    handleReset();
                                                }}
                                                className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${prefixCacheHit ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-400"}`}
                                            >
                                                {prefixCacheHit
                                                    ? "命中前 4 Token"
                                                    : "未命中"}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            若命中，前 4 个 Token 的 K/V
                                            无需重新计算，只需算后 4 个 Token 的
                                            K/V 并写入新显存。
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                                        <p className="text-xs text-slate-400">
                                            <strong>Decode 机制：</strong>{" "}
                                            此轮只接收上一步生成的新 Token{" "}
                                            <span className="text-cyan-400 font-bold">
                                                {decodeToken}
                                            </span>
                                            （索引为 8）。
                                        </p>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            虽然只算这 1 个 Token 的 KV，但
                                            Attention 还需要通过{" "}
                                            <code className="text-rose-400">
                                                block_tables
                                            </code>{" "}
                                            去读取已缓存的 8 个历史 K/V 槽位。
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 块大小配置 */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs text-slate-400">
                                        Logical Block 大小 (block_size):
                                    </h3>
                                    <span className="text-xs bg-slate-800 text-white font-mono px-2 py-0.5 rounded border border-slate-700">
                                        {blockSize} tokens
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {[2, 4, 8].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => {
                                                setBlockSize(size);
                                                handleReset();
                                            }}
                                            className={`flex-1 py-1 text-xs font-mono rounded border transition-all ${blockSize === size ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400" : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"}`}
                                        >
                                            BlockSize = {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 动画控制器 */}
                            <div className="border-t border-slate-800 pt-4">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
                                    🎬 2. 动画逐步演示
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (animationStep >= 4)
                                                    setAnimationStep(0);
                                                setIsPlaying(!isPlaying);
                                            }}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all ${isPlaying ? "bg-amber-500 text-slate-950" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"}`}
                                        >
                                            {isPlaying ? (
                                                <>⏸ 暂停演示</>
                                            ) : (
                                                <>
                                                    ▶{" "}
                                                    {animationStep === 0
                                                        ? "开始单步演示"
                                                        : "继续演示"}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all text-slate-300"
                                            title="重置"
                                        >
                                            🔄
                                        </button>
                                    </div>

                                    {/* 步骤条 */}
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between text-xs text-slate-400">
                                            <span>演示进度</span>
                                            <span className="font-mono text-cyan-400">
                                                {animationStep} / 4
                                            </span>
                                        </div>
                                        <div className="overflow-hidden h-1.5 text-xs flex rounded bg-slate-800">
                                            <div
                                                style={{
                                                    width: getStepProgressWidth(),
                                                }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cyan-500 transition-all duration-500"
                                            ></div>
                                        </div>
                                    </div>

                                    {/* 步骤文字说明 */}
                                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 min-h-[96px] text-xs leading-relaxed text-slate-300">
                                        {animationStep === 0 && (
                                            <div>
                                                <strong className="text-cyan-400 block mb-1">
                                                    【步骤 0】准备就绪
                                                </strong>
                                                {phase === "prefill"
                                                    ? `等待计算完整的 Prompt。本轮共 ${currentVars.end - currentVars.start} 个 Token 需要计算并写入。`
                                                    : `进入 Decode。我们准备处理第 9 个 Token（${decodeToken}），它的 K/V 将追加到显存末尾。`}
                                            </div>
                                        )}
                                        {animationStep === 1 && (
                                            <div>
                                                <strong className="text-cyan-400 block mb-1">
                                                    【步骤 1】Token 逻辑切分
                                                </strong>
                                                根据{" "}
                                                <code>
                                                    block_size = {blockSize}
                                                </code>{" "}
                                                将文本切分成多个逻辑块（Logical
                                                Blocks）。 当前序列需要占用{" "}
                                                <strong>
                                                    {Math.ceil(
                                                        (phase === "prefill"
                                                            ? initialTokens.length
                                                            : initialTokens.length +
                                                              1) / blockSize,
                                                    )}
                                                </strong>{" "}
                                                个逻辑块。
                                            </div>
                                        )}
                                        {animationStep === 2 && (
                                            <div>
                                                <strong className="text-cyan-400 block mb-1">
                                                    【步骤 2】BlockManager
                                                    物理映射分配
                                                </strong>
                                                物理显存管理器给逻辑块指派真实的物理显存块（Physical
                                                Blocks）。 例如：逻辑 Block 0
                                                分配到 GPU 物理 Block{" "}
                                                <span className="text-amber-400 font-bold">
                                                    {physicalBlocks[0]}
                                                </span>
                                                ， 逻辑 Block 1 分配到物理 Block{" "}
                                                <span className="text-amber-400 font-bold">
                                                    {physicalBlocks[1]}
                                                </span>
                                                。 这些映射保存在{" "}
                                                <code>block_table</code> 中。
                                            </div>
                                        )}
                                        {animationStep === 3 && (
                                            <div>
                                                <strong className="text-cyan-400 block mb-1">
                                                    【步骤 3】ModelRunner 计算
                                                    slot_mapping
                                                </strong>
                                                由于 GPU
                                                底层是一大片平铺的数组，GPU
                                                内核需要明确知道每一个计算出来的
                                                Token 对应哪个直接槽位（slot）。
                                                ModelRunner 通过公式算出每一个
                                                Token 的{" "}
                                                <code>slot_mapping</code>：
                                                <div className="bg-slate-900 px-2 py-1 my-1 rounded text-center text-[11px] font-mono border border-slate-800 text-rose-300">
                                                    $slot = physical\_block
                                                    \times block\_size + offset$
                                                </div>
                                            </div>
                                        )}
                                        {animationStep === 4 && (
                                            <div>
                                                <strong className="text-cyan-400 block mb-1">
                                                    【步骤 4】Attention.forward
                                                    显存写入/读取
                                                </strong>
                                                模型开始计算 Q、K、V。 在
                                                Attention 模块中，
                                                <code>
                                                    store_kvcache
                                                </code> 根据{" "}
                                                <code>slot_mapping</code> 把 K/V
                                                写入 GPU KV 缓存对应的 Slot。
                                                随后，
                                                <code>
                                                    FlashAttention
                                                </code> 带着{" "}
                                                <code>block_tables</code>{" "}
                                                从显存中把所有历史 KV
                                                读取出来，计算最终的注意力输出。
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右侧交互主视窗 */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* 核心变量展示板 */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative overflow-hidden">
                                    <div className="text-slate-500 text-xs mb-1 font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                        input_ids
                                    </div>
                                    <div className="font-mono text-xs font-bold text-cyan-400 truncate mt-1">
                                        {animationStep >= 1
                                            ? JSON.stringify(
                                                  currentVars.inputIds,
                                              )
                                            : "等待计算"}
                                    </div>
                                    <span className="absolute bottom-0 right-0 text-[10px] text-slate-800 font-bold pr-2 pb-0.5">
                                        TOKEN IDS
                                    </span>
                                </div>

                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative overflow-hidden">
                                    <div className="text-slate-500 text-xs mb-1 font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        positions
                                    </div>
                                    <div className="font-mono text-xs font-bold text-blue-400 truncate mt-1">
                                        {animationStep >= 1
                                            ? JSON.stringify(
                                                  currentVars.positions,
                                              )
                                            : "等待计算"}
                                    </div>
                                    <span className="absolute bottom-0 right-0 text-[10px] text-slate-800 font-bold pr-2 pb-0.5">
                                        POSITIONS
                                    </span>
                                </div>

                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative overflow-hidden">
                                    <div className="text-slate-500 text-xs mb-1 font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                        slot_mapping
                                    </div>
                                    <div className="font-mono text-xs font-bold text-rose-400 truncate mt-1">
                                        {animationStep >= 3
                                            ? JSON.stringify(
                                                  currentVars.slotMapping,
                                              )
                                            : "等待计算"}
                                    </div>
                                    <span className="absolute bottom-0 right-0 text-[10px] text-slate-800 font-bold pr-2 pb-0.5">
                                        SLOTS
                                    </span>
                                </div>

                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative overflow-hidden">
                                    <div className="text-slate-500 text-xs mb-1 font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        block_tables
                                    </div>
                                    <div className="font-mono text-xs font-bold text-amber-400 truncate mt-1">
                                        {animationStep >= 2
                                            ? JSON.stringify(
                                                  currentVars.blockTables,
                                              )
                                            : "等待计算"}
                                    </div>
                                    <span className="absolute bottom-0 right-0 text-[10px] text-slate-800 font-bold pr-2 pb-0.5">
                                        PHYSICAL BLOCKS
                                    </span>
                                </div>
                            </div>

                            {/* 三层架构可视化 */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                                    <span>🧠</span> 3. nano-vLLM 显存映射可视化
                                    (Logical Token → Physical Cache)
                                </h3>

                                {/* A. 逻辑 Token 视图 */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold uppercase text-slate-400">
                                            第一层：逻辑 Token 序列 (Logical
                                            Sequence)
                                        </h4>
                                        {phase === "prefill" &&
                                            prefixCacheHit && (
                                                <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded font-bold">
                                                    前 4 个 Token KV 命中了缓存
                                                </span>
                                            )}
                                    </div>

                                    <div className="grid grid-cols-8 gap-2">
                                        {initialTokens.map((token, index) => {
                                            // 属于哪个逻辑块
                                            const blockIdx = Math.floor(
                                                index / blockSize,
                                            );
                                            const isProcessedInThisStep =
                                                phase === "prefill"
                                                    ? !prefixCacheHit ||
                                                      index >= 4
                                                    : false;

                                            // 是否在当前步骤被激活高亮
                                            const isHighlighted =
                                                animationStep >= 1 &&
                                                (phase === "prefill"
                                                    ? isProcessedInThisStep
                                                    : false);

                                            return (
                                                <div
                                                    key={index}
                                                    className={`p-2 rounded-lg border text-center transition-all ${
                                                        isHighlighted
                                                            ? "bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-500/10"
                                                            : phase ===
                                                                    "prefill" &&
                                                                prefixCacheHit &&
                                                                index < 4
                                                              ? "bg-emerald-950/30 border-emerald-900/60 text-slate-500"
                                                              : "bg-slate-950 border-slate-800 text-slate-400"
                                                    }`}
                                                >
                                                    <div className="text-[10px] text-slate-500 font-mono">
                                                        #{index}
                                                    </div>
                                                    <div className="font-bold text-sm truncate">
                                                        {token}
                                                    </div>
                                                    <div className="text-[9px] bg-slate-900/60 mt-1 py-0.5 rounded font-mono text-slate-400">
                                                        L-Block {blockIdx}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Decode时额外生成的Token */}
                                        {phase === "decode" && (
                                            <div
                                                className={`p-2 rounded-lg border text-center transition-all col-span-1 col-start-9 ${
                                                    animationStep >= 1
                                                        ? "bg-rose-950/80 border-rose-500 shadow-md shadow-rose-500/10 text-rose-300"
                                                        : "bg-slate-950/30 border-dashed border-slate-800 text-slate-600"
                                                }`}
                                            >
                                                <div className="text-[10px] text-rose-500/70 font-mono">
                                                    #8
                                                </div>
                                                <div className="font-bold text-sm truncate">
                                                    {decodeToken}
                                                </div>
                                                <div className="text-[9px] bg-slate-900/60 mt-1 py-0.5 rounded font-mono text-rose-400">
                                                    L-Block 2
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* B. BlockManager 逻辑 -> 物理映射中介 */}
                                <div
                                    className={`bg-slate-950 p-4 rounded-lg border border-slate-800 transition-all ${animationStep >= 2 ? "opacity-100" : "opacity-40"}`}
                                >
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">
                                        第二层：BlockManager 维护映射表
                                        (block_table)
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-900 p-3 rounded border border-slate-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase block">
                                                    Logical Block 0
                                                </span>
                                                <span className="text-xs font-bold text-slate-300">
                                                    Token 0 ~ 3
                                                </span>
                                            </div>
                                            <div className="text-slate-500 text-sm">
                                                ➔
                                            </div>
                                            <div className="bg-amber-950/60 border border-amber-800 text-amber-400 rounded-lg px-3 py-1 font-mono font-bold text-sm">
                                                物理 Block {physicalBlocks[0]}
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 p-3 rounded border border-slate-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase block">
                                                    Logical Block 1
                                                </span>
                                                <span className="text-xs font-bold text-slate-300">
                                                    Token 4 ~ 7
                                                </span>
                                            </div>
                                            <div className="text-slate-500 text-sm">
                                                ➔
                                            </div>
                                            <div className="bg-amber-950/60 border border-amber-800 text-amber-400 rounded-lg px-3 py-1 font-mono font-bold text-sm">
                                                物理 Block {physicalBlocks[1]}
                                            </div>
                                        </div>

                                        <div
                                            className={`bg-slate-900 p-3 rounded border flex items-center justify-between transition-all ${phase === "decode" ? "border-rose-800 bg-rose-950/10" : "border-slate-800"}`}
                                        >
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase block">
                                                    Logical Block 2
                                                </span>
                                                <span className="text-xs font-bold text-slate-300">
                                                    {phase === "decode"
                                                        ? "Token 8"
                                                        : "空闲 / 未分配"}
                                                </span>
                                            </div>
                                            <div className="text-slate-500 text-sm">
                                                ➔
                                            </div>
                                            <div
                                                className={`rounded-lg px-3 py-1 font-mono font-bold text-sm ${phase === "decode" ? "bg-amber-950/60 border border-amber-800 text-amber-400" : "bg-slate-950 text-slate-600"}`}
                                            >
                                                {phase === "decode"
                                                    ? `物理 Block ${physicalBlocks[2]}`
                                                    : "无"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* C. 物理 KV Cache 显存平铺视图 */}
                                <div
                                    className={`transition-all ${animationStep >= 3 ? "opacity-100" : "opacity-40"}`}
                                >
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">
                                        第三层：GPU 全局平铺显存 (KV Cache
                                        Tensor)
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mb-3">
                                        每个物理 Block 划分有{" "}
                                        <code>block_size = {blockSize}</code>{" "}
                                        个槽位(Slots)。共有海量槽位平铺开。
                                    </p>

                                    <div className="space-y-4">
                                        {/* 物理块 12 */}
                                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-amber-400">
                                                    物理 Block{" "}
                                                    {physicalBlocks[0]}{" "}
                                                    (槽位区间{" "}
                                                    {physicalBlocks[0] *
                                                        blockSize}{" "}
                                                    ~{" "}
                                                    {physicalBlocks[0] *
                                                        blockSize +
                                                        blockSize -
                                                        1}
                                                    )
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    存储 Logical Block 0
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Array.from({
                                                    length: blockSize,
                                                }).map((_, idx) => {
                                                    const slotNum =
                                                        physicalBlocks[0] *
                                                            blockSize +
                                                        idx;
                                                    // prefill时，若没命中cache，这几个slot本轮要被写入
                                                    const isBeingWritten =
                                                        animationStep >= 4 &&
                                                        phase === "prefill" &&
                                                        !prefixCacheHit;
                                                    // 只要前4个token存在，这里就一定有数据存在
                                                    const hasData =
                                                        prefixCacheHit ||
                                                        animationStep >= 4;

                                                    return (
                                                        <div
                                                            key={slotNum}
                                                            className={`p-2 rounded border text-center transition-all ${
                                                                isBeingWritten
                                                                    ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                                                                    : hasData &&
                                                                        animationStep >=
                                                                            4
                                                                      ? "bg-cyan-950/30 border-cyan-800 text-cyan-300"
                                                                      : "bg-slate-900 border-slate-800 text-slate-600"
                                                            }`}
                                                        >
                                                            <div className="text-[9px] text-slate-500 font-mono">
                                                                Slot {slotNum}
                                                            </div>
                                                            <div className="font-bold text-xs mt-0.5">
                                                                {hasData &&
                                                                animationStep >=
                                                                    4
                                                                    ? initialTokens[
                                                                          idx
                                                                      ]
                                                                    : "空"}
                                                            </div>
                                                            <div className="text-[8px] text-slate-500 mt-1">
                                                                K/V Cache
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 物理块 25 */}
                                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-amber-400">
                                                    物理 Block{" "}
                                                    {physicalBlocks[1]}{" "}
                                                    (槽位区间{" "}
                                                    {physicalBlocks[1] *
                                                        blockSize}{" "}
                                                    ~{" "}
                                                    {physicalBlocks[1] *
                                                        blockSize +
                                                        blockSize -
                                                        1}
                                                    )
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    存储 Logical Block 1
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Array.from({
                                                    length: blockSize,
                                                }).map((_, idx) => {
                                                    const slotNum =
                                                        physicalBlocks[1] *
                                                            blockSize +
                                                        idx;
                                                    // prefill时，不管命没命中前4，这一部分（后4个token）肯定要在此轮写入
                                                    const isBeingWritten =
                                                        animationStep >= 4 &&
                                                        phase === "prefill" &&
                                                        idx < 4;
                                                    const hasData =
                                                        animationStep >= 4 &&
                                                        phase === "prefill";

                                                    return (
                                                        <div
                                                            key={slotNum}
                                                            className={`p-2 rounded border text-center transition-all ${
                                                                isBeingWritten
                                                                    ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                                                                    : hasData &&
                                                                        animationStep >=
                                                                            4
                                                                      ? "bg-cyan-950/30 border-cyan-800 text-cyan-300"
                                                                      : "bg-slate-900 border-slate-800 text-slate-600"
                                                            }`}
                                                        >
                                                            <div className="text-[9px] text-slate-500 font-mono">
                                                                Slot {slotNum}
                                                            </div>
                                                            <div className="font-bold text-xs mt-0.5">
                                                                {hasData &&
                                                                animationStep >=
                                                                    4
                                                                    ? initialTokens[
                                                                          idx +
                                                                              4
                                                                      ]
                                                                    : "空"}
                                                            </div>
                                                            <div className="text-[8px] text-slate-500 mt-1">
                                                                K/V Cache
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 物理块 7 (仅在Decode或更大空间出现) */}
                                        <div
                                            className={`bg-slate-950 p-3 rounded border transition-all ${phase === "decode" ? "border-slate-700 opacity-100" : "border-dashed border-slate-900 opacity-30"}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-amber-400">
                                                    物理 Block{" "}
                                                    {physicalBlocks[2]}{" "}
                                                    (槽位区间{" "}
                                                    {physicalBlocks[2] *
                                                        blockSize}{" "}
                                                    ~{" "}
                                                    {physicalBlocks[2] *
                                                        blockSize +
                                                        blockSize -
                                                        1}
                                                    )
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {phase === "decode"
                                                        ? "存储 Logical Block 2"
                                                        : "未分配"}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Array.from({
                                                    length: blockSize,
                                                }).map((_, idx) => {
                                                    const slotNum =
                                                        physicalBlocks[2] *
                                                            blockSize +
                                                        idx;
                                                    // decode 时，第 8 索引 Token 写入物理块 7 的第 0 个偏移
                                                    const isBeingWritten =
                                                        animationStep >= 4 &&
                                                        phase === "decode" &&
                                                        idx === 0;

                                                    return (
                                                        <div
                                                            key={slotNum}
                                                            className={`p-2 rounded border text-center transition-all ${
                                                                isBeingWritten
                                                                    ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse font-bold"
                                                                    : "bg-slate-900 border-slate-800 text-slate-600"
                                                            }`}
                                                        >
                                                            <div className="text-[9px] text-slate-500 font-mono">
                                                                Slot {slotNum}
                                                            </div>
                                                            <div className="font-bold text-xs mt-0.5 text-rose-300">
                                                                {isBeingWritten
                                                                    ? decodeToken
                                                                    : "空"}
                                                            </div>
                                                            <div className="text-[8px] text-slate-500 mt-1">
                                                                K/V Cache
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* D. Attention 执行结果逻辑图 */}
                                {animationStep >= 4 && (
                                    <div className="bg-slate-950 p-4 rounded-lg border border-cyan-800/60 bg-gradient-to-r from-cyan-950/10 to-blue-950/10 text-xs text-slate-300 space-y-3">
                                        <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                                            <span>⚡</span> 4. GPU 正在运行
                                            Attention 计算
                                        </h4>

                                        {phase === "prefill" ? (
                                            <div className="space-y-2">
                                                <p>
                                                    ❶ <strong>写入动作</strong>
                                                    ：<code>store_kvcache</code>{" "}
                                                    通过{" "}
                                                    <code>
                                                        slot_mapping ={" "}
                                                        {JSON.stringify(
                                                            currentVars.slotMapping,
                                                        )}
                                                    </code>
                                                    ，将本次新计算出的 K/V
                                                    数据，极速刷写入了上方对应的
                                                    Slot 中。
                                                </p>
                                                <p>
                                                    ❷ <strong>读取动作</strong>
                                                    ：调用{" "}
                                                    <code>
                                                        flash_attn_varlen_func(...,
                                                        block_table=context.block_tables)
                                                    </code>
                                                    。 此时{" "}
                                                    <code>
                                                        block_tables ={" "}
                                                        {JSON.stringify(
                                                            currentVars.blockTables,
                                                        )}
                                                    </code>{" "}
                                                    指路，让 FlashAttention
                                                    能够跨越不连续的物理块，完美读取所有相关的历史
                                                    Token 缓存进行注意力计算！
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p>
                                                    ❶ <strong>写入动作</strong>
                                                    ：由于是
                                                    Decode，我们仅仅算出了 1
                                                    个新 Token (🚀) 的 K/V。
                                                    <code>
                                                        store_kvcache
                                                    </code>{" "}
                                                    根据单元素{" "}
                                                    <code>
                                                        slot_mapping = [
                                                        {
                                                            currentVars
                                                                .slotMapping[0]
                                                        }
                                                        ]
                                                    </code>{" "}
                                                    将其精准塞入物理 Block 7
                                                    的首个位置（槽位{" "}
                                                    {currentVars.slotMapping[0]}
                                                    ）。
                                                </p>
                                                <p>
                                                    ❷ <strong>读取动作</strong>
                                                    ：调用{" "}
                                                    <code>
                                                        flash_attn_with_kvcache(q,
                                                        k_cache, v_cache,
                                                        block_table,
                                                        cache_seqlens)
                                                    </code>
                                                    。 模型只用 🚀 算
                                                    Query，但带着{" "}
                                                    <code>
                                                        block_table ={" "}
                                                        {JSON.stringify(
                                                            currentVars.blockTables,
                                                        )}
                                                    </code>{" "}
                                                    去显存里顺藤摸瓜，调取历史 8
                                                    个 Token 的 KV
                                                    缓存，只耗费极低计算量，就计算出了完整的注意力结果！
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 核心术语表选项卡 */}
                {activeTab === "glossary" && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                            <BookOpenIcon />
                            nano-vLLM 必须掌握的 5 个显存核心词汇
                        </h2>
                        <p className="text-sm text-slate-400">
                            理解了这 5 个词，你在面试中聊起 vLLM、PagedAttention
                            和大模型推理架构时将能直击要害。
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white font-mono">
                                        1. input_ids
                                    </h3>
                                    <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">
                                        Model Input
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    当前这一轮 forward **真正需要计算** 的 Token
                                    ID 列表。
                                </p>
                                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
                                    <strong className="text-rose-400">
                                        💡 避坑：
                                    </strong>{" "}
                                    Prefill 时，如果前 4 个 token 命中了 prefix
                                    cache，那么这 4 个 token 的 K/V
                                    是不用重算的，因此本轮{" "}
                                    <code>input_ids</code> **不包含**这 4
                                    个，只包含后面未命中部分。
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white font-mono">
                                        2. positions
                                    </h3>
                                    <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">
                                        Positional Embedding
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    本轮送进模型的
                                    Token，在它们原始、完整请求序列里的**物理真实位置偏移量**。
                                </p>
                                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
                                    <strong className="text-rose-400">
                                        💡 解释：
                                    </strong>{" "}
                                    即使前 4 个 token 缓存命中了，我们本轮只算后
                                    4 个 token，但这后 4 个 token
                                    依然要传正确的原始位置{" "}
                                    <code>[4, 5, 6, 7]</code>
                                    ，用于计算旋转位置编码（RoPE）。
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white font-mono">
                                        3. slot_mapping
                                    </h3>
                                    <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded font-mono font-bold">
                                        Direct Write Target
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    核心精髓。本轮计算产生的新 K/V，在 GPU 的 1D
                                    连续展平 KV cache
                                    内存上的**直达地址槽位（Slot ID）**。
                                </p>
                                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
                                    <strong className="text-rose-400">
                                        💡 作用：
                                    </strong>{" "}
                                    它是 GPU kernel
                                    操作显存的最直接指令。Attention 中的{" "}
                                    <code>store_kvcache</code> 直接顺着
                                    slot_mapping 把刚才算出来的 K 和 V
                                    填入显存。
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white font-mono">
                                        4. block_tables
                                    </h3>
                                    <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                                        Historical Index
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    物理块索引。记录当前序列在显存管理器中，究竟占用了哪几个分散在不同角落的**物理
                                    Block ID 列表**。
                                </p>
                                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
                                    <strong className="text-rose-400">
                                        💡 作用：
                                    </strong>{" "}
                                    它是 FlashAttention
                                    读取历史的“引路罗盘”。即使物理块再不连续，只要有这个表，Attention
                                    内核就能拼接出完美的全部历史 KV 序列。
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white font-mono">
                                        5. context (or context_lens)
                                    </h3>
                                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                                        Metadata Box
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    一个携带推理元数据信息的上下文对象（包含{" "}
                                    <code>is_prefill</code>、
                                    <code>slot_mapping</code>、
                                    <code>block_tables</code>、
                                    <code>context_lens</code> 等）。
                                </p>
                                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
                                    <strong className="text-rose-400">
                                        💡 作用：
                                    </strong>{" "}
                                    ModelRunner
                                    辛辛苦苦翻译出的各类物理地址数据，会统一打包到{" "}
                                    <code>context</code> 中。当模型各层网络在
                                    Forward 时，遇到 Attention 层，就会直接去{" "}
                                    <code>context</code>{" "}
                                    里取这些关键显存索引数据来执行读写。
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 避坑测试选项卡 */}
                {activeTab === "quiz" && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                                    <BrainIcon />
                                    核心误区 · 通关避坑测试
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    下面是 4 道根据真实大厂 AI Infra /
                                    推理系统面试改编的题目，快来看看你能不能避开常见误区！
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setQuizAnswers({});
                                    setQuizSubmitted(false);
                                }}
                                className="text-xs border border-slate-700 hover:border-slate-500 bg-slate-950 px-3 py-1.5 rounded transition-all text-slate-300"
                            >
                                重做全部
                            </button>
                        </div>

                        <div className="space-y-6">
                            {quizQuestions.map((q, qIdx) => {
                                const isSelected =
                                    quizAnswers[q.id] !== undefined;
                                const isCorrect =
                                    quizAnswers[q.id] === q.correct;

                                return (
                                    <div
                                        key={q.id}
                                        className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3"
                                    >
                                        <h3 className="text-sm font-bold text-white leading-relaxed">
                                            {q.q}
                                        </h3>

                                        <div className="space-y-2">
                                            {q.options.map((opt, optIdx) => {
                                                const isCurrentSelected =
                                                    quizAnswers[q.id] ===
                                                    optIdx;
                                                let btnStyle =
                                                    "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700";

                                                if (quizSubmitted) {
                                                    if (optIdx === q.correct) {
                                                        btnStyle =
                                                            "bg-emerald-950/40 border-emerald-500 text-emerald-300";
                                                    } else if (
                                                        isCurrentSelected
                                                    ) {
                                                        btnStyle =
                                                            "bg-rose-950/40 border-rose-500 text-rose-300";
                                                    }
                                                } else if (isCurrentSelected) {
                                                    btnStyle =
                                                        "bg-cyan-950 border-cyan-500 text-cyan-300 font-medium";
                                                }

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        disabled={quizSubmitted}
                                                        onClick={() =>
                                                            handleQuizAnswer(
                                                                q.id,
                                                                optIdx,
                                                            )
                                                        }
                                                        className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${btnStyle}`}
                                                    >
                                                        <span className="mt-0.5 w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] shrink-0">
                                                            {optIdx === 0
                                                                ? "A"
                                                                : "B"}
                                                        </span>
                                                        <span>{opt}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* 显示单题反馈 */}
                                        {quizSubmitted && (
                                            <div
                                                className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${isCorrect ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/60" : "bg-rose-950/20 text-rose-400 border border-rose-900/60"}`}
                                            >
                                                <div className="shrink-0 mt-0.5">
                                                    {isCorrect ? (
                                                        <CheckIcon />
                                                    ) : (
                                                        <CrossIcon />
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>
                                                        {isCorrect
                                                            ? "答对了！"
                                                            : "答错了："}
                                                    </strong>
                                                    <span>{q.explain}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-800">
                            <button
                                disabled={
                                    Object.keys(quizAnswers).length <
                                    quizQuestions.length
                                }
                                onClick={() => setQuizSubmitted(true)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${Object.keys(quizAnswers).length < quizQuestions.length ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/10"}`}
                            >
                                {quizSubmitted
                                    ? "已提交"
                                    : "提交测验，查看解答与解析"}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* 页脚 */}
            <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-900/40">
                <p>
                    nano-vLLM 源码解析交互式学习面板 ·
                    让大模型推理机制变得具象化与生动
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                    配合 Day 13 推理架构、PagedAttention 及 GPU KV
                    显存存储设计阅读，效果最佳。
                </p>
            </footer>
        </div>
    );
}
