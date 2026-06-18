import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { ChatMessage } from "../../types";
import {
  XIAOCAO_GREETING,
  STUDENT_QUICK_QUESTIONS,
  loadStudentDialogueLibrary,
  type StudentDialogueCategory,
  type StudentDialogueMaterial,
} from "../../lib/xiaochaAi";
import { SubPageNav } from "../shared/SubPageNav";
import {
  DIFFUSE_PRESETS,
  renderDiffuseAccents,
} from "../ui/DiffuseDecor";

type StudentDialoguePanelProps = {
  subView: string;
  onSubViewChange: (id: string) => void;
};

export const StudentDialoguePanel: React.FC<StudentDialoguePanelProps> = ({
  subView,
  onSubViewChange,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "ai",
      text: XIAOCAO_GREETING,
      timestamp: "刚刚",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [categories, setCategories] = useState<StudentDialogueCategory[]>([]);
  const [materials, setMaterials] = useState<StudentDialogueMaterial[]>([]);

  useEffect(() => {
    loadStudentDialogueLibrary().then(({ categories: cats, materials: mats }) => {
      setCategories(cats);
      setMaterials(mats);
    });
  }, []);

  const handleSendChat = async (questionText: string) => {
    if (!questionText.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatLog((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    onSubViewChange("chat");

    try {
      const data = await api.ai.chat(
        questionText,
        chatLog.concat(userMsg).map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        "student",
      );

      setChatLog((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: data.text || "小草没听清，请你再问一次吧！",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (e) {
      console.error(e);
      setChatLog((prev) => [
        ...prev,
        {
          id: `msg-ai-offline-${Date.now()}`,
          sender: "ai",
          text: "小草这会儿稍微有点打瞌睡，不过照壁上的纹样多半是在祝福大家清白传家、读书成才哦！你可以从素材库再挑一个问题问我。",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickQuestions =
    materials.length > 0
      ? materials.slice(0, 4).map((m) => m.question)
      : [...STUDENT_QUICK_QUESTIONS];

  return (
    <div className="space-y-4">
      <SubPageNav
        items={[
          { id: "chat", label: "AI简短讲解", icon: "messages" },
          { id: "library", label: "对话素材库", icon: "search" },
        ]}
        active={subView}
        onChange={onSubViewChange}
      />

      {subView === "library" && (
        <div className="space-y-3">
          <div className="relative bg-nupul-cream border-2 border-nupul-dark rounded-2xl p-4 overflow-hidden">
            {renderDiffuseAccents([
              { corner: "tr", color: "yellow", inset: true, soft: true, size: "sm" },
            ])}
            <div className="relative z-10">
            <h4 className="text-caption font-bold text-nupul-dark">
              洱海苍山非遗对话素材库
            </h4>
            <p className="text-[11px] text-nupul-dark/65 mt-1 leading-relaxed">
              话题来自教学智库知识库，点击即可向小草提问。新上传的理论文本会自动纳入素材。
            </p>
            </div>
          </div>

          {categories.map((block, index) => (
            <div
              key={block.name}
              className="relative bg-white border-3 border-nupul-dark rounded-2xl p-4 overflow-hidden"
            >
              {renderDiffuseAccents(
                DIFFUSE_PRESETS.toolCard(index).map((a) => ({
                  ...a,
                  inset: true,
                })),
              )}
              <div className="relative z-10">
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-[#55825a] bg-[#eef9ec] border border-nupul-dark/15 px-2 py-0.5 rounded-full">
                {block.name}
              </span>
              <div className="flex flex-col gap-2 mt-3">
                {block.materials.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSendChat(item.question)}
                    className="w-full text-left bg-nupul-cream hover:bg-nupul-yellow/20 border-2 border-nupul-dark p-3 rounded-xl transition cursor-pointer group"
                  >
                    <p className="text-caption font-bold text-nupul-dark group-hover:text-nupul-green-dark leading-snug">
                      {item.question}
                    </p>
                    {item.hint && (
                      <p className="text-[8px] text-nupul-dark/50 mt-1 font-medium">
                        {item.hint}
                      </p>
                    )}
                  </button>
                ))}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subView === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4 relative bg-nupul-cream p-5 rounded-2xl border-3 border-nupul-dark flex flex-col space-y-4 overflow-hidden">
            {renderDiffuseAccents(DIFFUSE_PRESETS.chatSide)}
            <div className="relative z-10 flex flex-col space-y-4 flex-1">
            <div className="text-center pb-2 border-b-2 border-nupul-dark/15">
              <div className="w-20 h-20 bg-nupul-yellow rounded-full mx-auto border-3 border-nupul-dark flex items-center justify-center text-display-md font-black">
                草
              </div>
              <h4 className="text-secondary font-bold text-nupul-dark mt-2">
                非遗童谣童语伴读：小草
              </h4>
              <span className="text-caption text-slate-500 tracking-wide">
                Dali Cultural Elf &quot;Xiao Cao&quot;
              </span>
            </div>

            <span className="text-caption font-bold text-slate-400 uppercase tracking-widest">
              小朋友们经常问的趣味话题：
            </span>

            <div className="space-y-1.5">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSendChat(q)}
                  className="w-full text-left bg-white border-2 border-nupul-dark hover:bg-nupul-yellow/15 p-2.5 rounded-xl text-caption text-nupul-dark transition-all font-bold leading-snug cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSubViewChange("library")}
              className="text-caption font-bold text-nupul-green-dark hover:text-nupul-orange border-2 border-dashed border-nupul-dark/25 rounded-xl py-2 transition cursor-pointer"
            >
              浏览完整对话素材库 →
            </button>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between space-y-4 min-h-[480px]">
            <div className="relative flex-1 bg-white rounded-2xl border-3 border-nupul-dark overflow-y-auto p-4 space-y-3">
              {renderDiffuseAccents(DIFFUSE_PRESETS.chatMain)}
              <div className="relative z-10 space-y-3">
              {chatLog.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-secondary border-2 border-nupul-dark shrink-0 ${
                        msg.sender === "user"
                          ? "bg-nupul-yellow"
                          : "bg-nupul-green"
                      }`}
                    >
                      {msg.sender === "user" ? "我" : "草"}
                    </div>
                    <div
                      className={`rounded-2xl p-3 text-caption leading-relaxed border-2 border-nupul-dark ${
                        msg.sender === "user"
                          ? "bg-nupul-green text-nupul-dark rounded-tr-none"
                          : "bg-nupul-cream text-nupul-dark rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-bold">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-white border-2 border-nupul-dark py-2.5 px-3.5 rounded-2xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-nupul-dark animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-nupul-dark animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-nupul-dark animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              )}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat(chatInput);
              }}
              className="flex bg-white border-3 border-nupul-dark rounded-2xl overflow-hidden p-1"
            >
              <input
                type="text"
                className="flex-1 px-4 py-2.5 text-caption focus:outline-none font-bold text-nupul-dark"
                placeholder="问问小草，比如：白族彩绘常用到什么颜色呢？..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="bg-nupul-yellow hover:bg-nupul-yellow text-nupul-dark font-bold text-caption px-4 py-2 mr-1 rounded-xl border-2 border-nupul-dark active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                发送问答
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
