import React, { useState, useEffect } from "react";
import ChatContainer from "./ChatContainer";
import paths from "@/utils/paths";
import ModalWrapper from "../ModalWrapper";
import { useParams } from "react-router-dom";
import { DnDFileUploaderProvider } from "./ChatContainer/DnDWrapper";
import {
  TTSProvider,
  useWatchForAutoPlayAssistantTTSResponse,
} from "../contexts/TTSProvider";
import { useTheme } from "@/hooks/useTheme";
import {
  GLASS_BG_LIGHT,
  GLASS_BG_DARK,
  GLASS_BORDER,
  GLASS_SHADOW,
  GLASS_BLUR,
  GLASS_RADIUS,
} from "@/theme";

export default function WorkspaceChat({ loading, workspace }) {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function getHistory() {
      if (!workspace?.slug) return;
      try {
        const chatHistory = await Workspace.chatHistory(workspace.slug);
        setHistory(chatHistory);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setHistory([]);
      }
    }
    getHistory();
  }, [workspace?.slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-lg ${theme === "light" ? "text-gray-600" : "text-white/60"}`}>
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div 
          className="p-8 rounded-lg text-center max-w-md"
          style={{
            background: theme === "light" ? GLASS_BG_LIGHT : GLASS_BG_DARK,
            border: GLASS_BORDER,
            borderRadius: GLASS_RADIUS,
            backdropFilter: GLASS_BLUR,
            WebkitBackdropFilter: GLASS_BLUR,
            boxShadow: GLASS_SHADOW,
          }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}>
            Workspace Not Found
          </h2>
          <p className={`mb-6 ${
            theme === "light" ? "text-gray-600" : "text-white/70"
          }`}>
            The workspace you're looking for doesn't exist or you don't have access to it.
          </p>
          <a
            href={paths.home()}
            className={`inline-block px-6 py-2 rounded-lg transition-all duration-200 ${
              theme === "light"
                ? "bg-purple-500 hover:bg-purple-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full transition-all duration-500"
      style={{
        background: theme === "light" 
          ? GLASS_BG_LIGHT
          : GLASS_BG_DARK,
        backdropFilter: GLASS_BLUR,
        WebkitBackdropFilter: GLASS_BLUR,
        border: GLASS_BORDER,
        borderRadius: GLASS_RADIUS,
        boxShadow: GLASS_SHADOW,
      }}
    >
      <TTSProvider>
        <DnDFileUploaderProvider workspace={workspace}>
          <ChatContainer 
            workspace={workspace} 
            knownHistory={history}
          />
        </DnDFileUploaderProvider>
      </TTSProvider>
    </div>
  );
}
