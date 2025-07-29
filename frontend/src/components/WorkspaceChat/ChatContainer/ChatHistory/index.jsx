import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import StatusResponse from "./StatusResponse";
import { useManageWorkspaceModal } from "../../../Modals/ManageWorkspace";
import ManageWorkspace from "../../../Modals/ManageWorkspace";
import { ArrowDown } from "@phosphor-icons/react";
import debounce from "lodash.debounce";
import useUser from "@/hooks/useUser";
import Chartable from "./Chartable";
import Workspace from "@/models/workspace";
import { useParams } from "react-router-dom";
import paths from "@/utils/paths";
import Appearance from "@/models/appearance";
import useTextSize from "@/hooks/useTextSize";
import { v4 } from "uuid";
import { useTranslation } from "react-i18next";
import { useChatMessageAlignment } from "@/hooks/useChatMessageAlignment";
import { useTheme } from "@/hooks/useTheme";
import {
  GLASS_BG_LIGHT,
  GLASS_BG_DARK,
  GLASS_BORDER,
  GLASS_RADIUS,
  GLASS_SHADOW,
  GLASS_BLUR,
} from "@/theme";

export default function ChatHistory({
  history = [],
  workspace,
  sendCommand,
  updateHistory,
  regenerateAssistantMessage,
  hasAttachments = false,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const lastScrollTopRef = useRef(0);
  const { user } = useUser();
  const { threadSlug = null } = useParams();
  const { showing, showModal, hideModal } = useManageWorkspaceModal();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatHistoryRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const isStreaming = history[history.length - 1]?.animate;
  const { showScrollbar } = Appearance.getSettings();
  const { textSizeClass } = useTextSize();
  const { getMessageAlignment } = useChatMessageAlignment();

  // Auto-scroll to bottom logic
  useEffect(() => {
    if (!isUserScrolling && (isAtBottom || isStreaming)) {
      scrollToBottom();
    }
  }, [history, isAtBottom, isStreaming, isUserScrolling]);

  const scrollToBottom = useCallback((force = false) => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      if (force) {
        setIsAtBottom(true);
      }
    }
  }, []);

  const debouncedHandleScroll = useMemo(
    () =>
      debounce(() => {
        if (chatHistoryRef.current) {
          const { scrollTop, clientHeight, scrollHeight } = chatHistoryRef.current;
          const threshold = 30;
          const newIsAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
          
          setIsAtBottom(newIsAtBottom);
          
          if (scrollTop !== lastScrollTopRef.current) {
            setIsUserScrolling(true);
            setTimeout(() => setIsUserScrolling(false), 1000);
          }
          lastScrollTopRef.current = scrollTop;
        }
      }, 100),
    []
  );

  const handleScroll = useCallback((e) => {
    debouncedHandleScroll();
  }, [debouncedHandleScroll]);

  const handleSendSuggestedMessage = useCallback(async (heading, message) => {
    const chatHistoryContainer = document.getElementById("chat-history");
    if (chatHistoryContainer) {
      chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
    }

    const prevChatText = document.getElementById("message-input");
    if (prevChatText) {
      prevChatText.value = `${message}`;
      prevChatText.dispatchEvent(new Event("input", { bubbles: true }));
    }

    document.getElementById("send-message-button")?.click();
  }, []);

  // Fixed compiled history with proper error handling
  const compiledHistory = useMemo(() => {
    try {
      return buildMessages({
        history,
        workspace,
        regenerateAssistantMessage,
        saveEditedMessage: () => {}, // Add proper implementation if needed
        forkThread: () => {}, // Add proper implementation if needed
        getMessageAlignment,
      });
    } catch (error) {
      console.error("Error building messages:", error);
      return [];
    }
  }, [history, workspace, regenerateAssistantMessage, getMessageAlignment]);

  const renderStatusResponse = (items, index) => (
    <div key={`status-${index}`} className="flex flex-col gap-2">
      {items.map((item, itemIndex) => (
        <StatusResponse key={itemIndex} {...item} />
      ))}
    </div>
  );

  if (history.length === 0 && !hasAttachments) {
    return (
      <div className="flex flex-col h-full md:mt-0 pb-44 md:pb-40 w-full justify-end items-center">
        <div className="flex flex-col items-center md:items-start md:max-w-[600px] w-full px-4">
          <p className={`text-lg font-base py-4 ${
            theme === "light" ? "text-white" : "text-white/60"
          }`}>
            {t("chat_window.welcome")}
          </p>
          {(!user || user.role !== "default") ? (
            <p className={`w-full items-center text-lg font-base flex flex-col md:flex-row gap-x-1 ${
              theme === "light" ? "text-gray-600" : "text-white/60"
            }`}>
              {t("chat_window.get_started")}
              <span
                className="underline font-medium cursor-pointer hover:opacity-70"
                onClick={showModal}
              >
                {t("chat_window.upload")}
              </span>
              {t("chat_window.or")}{" "}
              <b className="font-medium italic">{t("chat_window.send_chat")}</b>
            </p>
          ) : (
            <p className={`w-full items-center text-lg font-base flex flex-col md:flex-row gap-x-1 ${
              theme === "light" ? "text-gray-600" : "text-white/60"
            }`}>
              {t("chat_window.get_started_default")}{" "}
              <b className="font-medium italic">{t("chat_window.send_chat")}</b>
            </p>
          )}
          <WorkspaceChatSuggestions
            suggestions={workspace?.suggestedMessages ?? []}
            sendSuggestion={handleSendSuggestedMessage}
            theme={theme}
          />
        </div>
        {showing && (
          <ManageWorkspace
            hideModal={hideModal}
            providedSlug={workspace.slug}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`markdown font-light ${textSizeClass} h-full md:h-[83%] pb-[100px] pt-6 md:pt-0 md:pb-20 md:mx-0 overflow-y-scroll flex flex-col justify-start bg-transparent ${showScrollbar ? "show-scrollbar" : "no-scroll"} ${
        theme === "light" ? "text-gray-800" : "text-white/80"
      }`}
      id="chat-history"
      ref={chatHistoryRef}
      onScroll={handleScroll}
      style={{
        height: isMobile ? "100%" : "calc(100% - 32px)",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        backdropFilter: "none",
        borderRadius: GLASS_RADIUS,
        transition: "all 0.5s ease",
      }}
    >
      {compiledHistory.map((item, index) =>
        Array.isArray(item) ? renderStatusResponse(item, index) : item
      )}
      {showing && (
        <ManageWorkspace hideModal={hideModal} providedSlug={workspace.slug} />
      )}
      {!isAtBottom && (
        <div className="fixed bottom-40 right-10 md:right-20 z-50 cursor-pointer animate-pulse">
          <div className="flex flex-col items-center">
            <div
              className="p-3 transition-all duration-300 hover:scale-110"
              style={{
                background: theme === "light" 
                  ? "rgba(255,255,255,0.9)" 
                  : GLASS_BG_LIGHT,
                border: theme === "light" 
                  ? "1.5px solid rgba(0,0,0,0.15)" 
                  : GLASS_BORDER,
                borderRadius: GLASS_RADIUS,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: theme === "light" 
                  ? "0 4px 24px 0 rgba(0,0,0,0.15)" 
                  : "0 4px 24px 0 rgba(31,38,135,0.15)",
              }}
              onClick={() => {
                scrollToBottom(true);
                setIsUserScrolling(false);
              }}
            >
              <ArrowDown weight="bold" className={`w-5 h-5 ${
                theme === "light" ? "text-gray-700" : "text-white/70"
              }`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed WorkspaceChatSuggestions component
function WorkspaceChatSuggestions({ suggestions = [], sendSuggestion, theme }) {
  if (!suggestions.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mt-10 w-full justify-center">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className={`text-left p-2.5 rounded-xl transition-all duration-200 border ${
            theme === "light"
              ? "bg-white/80 hover:bg-white/90 text-gray-700 border-gray-200"
              : "bg-white/10 hover:bg-white/20 text-white border-white/20"
          }`}
          onClick={() => sendSuggestion(suggestion.heading, suggestion.message)}
        >
          <p className="font-semibold">{suggestion.heading}</p>
          <p className="opacity-80">{suggestion.message}</p>
        </button>
      ))}
    </div>
  );
}

// Fixed buildMessages function
function buildMessages({
  history,
  workspace,
  regenerateAssistantMessage,
  saveEditedMessage,
  forkThread,
  getMessageAlignment,
}) {
  if (!Array.isArray(history)) return [];

  const messages = [];
  
  try {
    history.forEach((message, index) => {
      if (!message) return;

      const messageProps = {
        key: message.id || `message-${index}`,
        message,
        workspace,
        regenerateAssistantMessage,
        saveEditedMessage,
        forkThread,
        alignment: getMessageAlignment ? getMessageAlignment(message) : 'left',
      };

      if (message.type === 'user') {
        messages.push(<HistoricalMessage {...messageProps} />);
      } else if (message.type === 'assistant') {
        messages.push(<PromptReply {...messageProps} />);
      } else if (message.type === 'chart') {
        messages.push(<Chartable {...messageProps} />);
      } else {
        // Handle other message types or fallback
        messages.push(<HistoricalMessage {...messageProps} />);
      }
    });
  } catch (error) {
    console.error("Error in buildMessages:", error);
  }

  return messages;
}
