import React, { useCallback, useEffect, useState } from "react";
import xiaochaCutout from "../../assets/xiaocha-character-cutout.png";

const HOVER_TIPS = [
  "老师好～把难题交给我",
  "鼠标悬停换一句提示",
  "点我，帮你挑个问题",
  "今天讲照壁还是纹样？",
];

const CLICK_QUESTIONS = [
  "零基础的小学生怎么去开展墨线起初勾墨？",
  "如何形象地向孩子们表达‘清白传家’的精神图腾？",
  "白族彩绘中的‘大理蓝白搭配’提炼自哪些大自然材料？",
  "怎么给孩子们传授‘白白墙上挂重蓝’的天然提炼理念？",
];

interface XiaochaMascotPanelProps {
  onAsk: (question: string) => void;
  disabled?: boolean;
  thinking?: boolean;
}

/** 悬浮在输入栏上方的小茶数字人（透明底立绘） */
export const XiaochaMascotPanel: React.FC<XiaochaMascotPanelProps> = ({
  onAsk,
  disabled = false,
  thinking = false,
}) => {
  const [tipIdx, setTipIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered || disabled) return;
    const id = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % HOVER_TIPS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [hovered, disabled]);

  const tip = thinking
    ? "正在翻阅苍山古籍…"
    : hovered
      ? HOVER_TIPS[tipIdx]
      : "点我问问题";

  const handleClick = useCallback(() => {
    if (disabled) return;
    onAsk(CLICK_QUESTIONS[Math.floor(Math.random() * CLICK_QUESTIONS.length)]);
  }, [disabled, onAsk]);

  return (
    <div
      className="xiaocha-float-wrap absolute left-0 bottom-0 z-50 flex flex-col items-start pointer-events-none select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="小茶 AI 数字人"
    >
      <div className="pointer-events-auto relative flex flex-col items-start gap-0.5">
        <div
          className="relative z-20 bg-white border-2 border-nupul-dark rounded-lg px-2 py-0.5 text-[9px] font-bold text-nupul-dark text-center whitespace-nowrap max-w-[108px] sm:max-w-[120px] leading-tight"
          aria-live="polite"
        >
          {tip}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={handleClick}
          aria-label="向小茶 AI 提问"
          className={`xiaocha-mascot-btn group cursor-pointer bg-transparent p-0 border-0 disabled:cursor-not-allowed disabled:opacity-55 focus:outline-none focus-visible:ring-2 focus-visible:ring-nupul-green rounded-lg ${
            thinking ? "xiaocha-mascot-thinking" : ""
          }`}
        >
          <img
            src={xiaochaCutout}
            alt="小茶 AI"
            className="xiaocha-mascot-float block h-[72px] w-auto sm:h-[80px] bg-transparent"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
};

export const XiaochaAvatarImg: React.FC = () => (
  <img
    src={xiaochaCutout}
    alt="小茶"
    className="h-9 w-9 shrink-0 object-contain object-bottom bg-transparent"
    draggable={false}
  />
);
