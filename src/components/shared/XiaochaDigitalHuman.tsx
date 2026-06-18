import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import xiaochaCharacter from "../../assets/xiaocha-character.png";

const HOVER_LINES = [
  "老师好～把难题交给我吧",
  "悬停看看，我会给你换一句提示",
  "点我一下，帮你挑个备课问题",
  "今天想讲照壁、纹样还是配色？",
];

const CLICK_QUESTIONS = [
  "零基础的小学生怎么去开展墨线起初勾墨？",
  "如何形象地向孩子们表达‘清白传家’的精神图腾？",
  "白族彩绘中的‘大理蓝白搭配’提炼自哪些大自然材料？",
  "大理白语中关于祝福有哪几个代表性的传统词语？",
  "怎么给孩子们传授‘白白墙上挂重蓝’的天然提炼理念？",
];

type Mood = "idle" | "hover" | "thinking" | "happy";
type XiaochaSize = "sm" | "lg";

const SIZE_MAP: Record<
  XiaochaSize,
  { box: string; img: string; bubbleTop: string }
> = {
  sm: {
    box: "w-8 h-8 rounded-full",
    img: "w-[220%] max-w-none h-full object-cover object-[8%_center]",
    bubbleTop: "-top-10",
  },
  lg: {
    box: "w-[112px] h-[168px] rounded-2xl",
    img: "w-[300%] max-w-none h-full object-cover object-[8%_center]",
    bubbleTop: "-top-16",
  },
};

interface XiaochaDigitalHumanProps {
  onAsk: (question: string) => void;
  disabled?: boolean;
  thinking?: boolean;
  className?: string;
  size?: XiaochaSize;
}

/** 消息列表用小头像 */
export const XiaochaAvatar: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={`overflow-hidden border-2 border-nupul-dark bg-nupul-soft-green/50 shrink-0 ${SIZE_MAP.sm.box} ${className ?? ""}`}
  >
    <img
      src={xiaochaCharacter}
      alt=""
      className={SIZE_MAP.sm.img}
      draggable={false}
    />
  </div>
);

export const XiaochaDigitalHuman: React.FC<XiaochaDigitalHumanProps> = ({
  onAsk,
  disabled = false,
  thinking = false,
  className,
  size = "lg",
}) => {
  const [hovered, setHovered] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [mood, setMood] = useState<Mood>("idle");
  const sizes = SIZE_MAP[size];

  const moodFromProps: Mood = thinking
    ? "thinking"
    : hovered
      ? "hover"
      : mood === "happy"
        ? "happy"
        : "idle";

  useEffect(() => {
    if (!hovered || disabled || size === "sm") return;
    const timer = window.setInterval(() => {
      setLineIdx((i) => (i + 1) % HOVER_LINES.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [hovered, disabled, size]);

  useEffect(() => {
    if (thinking || size === "sm") return;
    const blink = window.setInterval(() => {
      setMood("happy");
      window.setTimeout(() => setMood("idle"), 160);
    }, 4500);
    return () => window.clearInterval(blink);
  }, [thinking, size]);

  const handleClick = useCallback(() => {
    if (disabled || size === "sm") return;
    const q =
      CLICK_QUESTIONS[Math.floor(Math.random() * CLICK_QUESTIONS.length)];
    setMood("happy");
    onAsk(q);
    window.setTimeout(() => setMood("idle"), 1200);
  }, [disabled, onAsk, size]);

  const bubbleText = thinking
    ? "正在翻阅苍山古籍…"
    : hovered
      ? HOVER_LINES[lineIdx]
      : "点我问问题";

  if (size === "sm") {
    return <XiaochaAvatar className={className} />;
  }

  return (
    <div
      className={`relative shrink-0 select-none ${className ?? ""}`}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (!thinking) setMood("idle");
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={bubbleText}
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`absolute ${sizes.bubbleTop} left-1/2 -translate-x-1/2 z-20 w-[10.5rem] pointer-events-none`}
        >
          <div className="bg-white border-2 border-nupul-dark rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-nupul-dark text-center leading-snug">
            {bubbleText}
          </div>
          <div
            className="mx-auto w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-nupul-dark"
            aria-hidden
          />
        </motion.div>
      </AnimatePresence>

      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        aria-label="向小茶 AI 提问"
        title="点击让小茶帮你提一个问题"
        className="relative block cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-nupul-green focus-visible:ring-offset-2 rounded-2xl"
        animate={
          moodFromProps === "thinking"
            ? { y: [0, -2, 0], rotate: [0, 0.6, 0, -0.6, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          moodFromProps === "thinking"
            ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            : { repeat: Infinity, duration: 3.2, ease: "easeInOut" }
        }
        whileHover={
          disabled
            ? undefined
            : { scale: 1.04, rotate: 2, transition: { duration: 0.2 } }
        }
        whileTap={disabled ? undefined : { scale: 0.97, rotate: 0 }}
      >
        <div
          className={`${sizes.box} border-3 border-nupul-dark bg-nupul-soft-green overflow-hidden ${
            moodFromProps === "happy" ? "ring-2 ring-nupul-yellow" : ""
          }`}
        >
          <img
            src={xiaochaCharacter}
            alt="小茶 AI 数字人"
            className={`${sizes.img} ${moodFromProps === "thinking" ? "opacity-90" : ""}`}
            draggable={false}
          />
        </div>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-nupul-dark bg-nupul-yellow border-2 border-nupul-dark px-2 py-0.5 rounded-full whitespace-nowrap">
          小茶 AI
        </span>
      </motion.button>
    </div>
  );
};
