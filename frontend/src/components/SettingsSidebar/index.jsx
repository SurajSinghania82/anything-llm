import React, { useEffect, useRef, useState } from "react";
import paths from "@/utils/paths";
import useLogo from "@/hooks/useLogo";
import {
  House,
  List,
  Robot,
  Flask,
  Gear,
  UserCircleGear,
  PencilSimpleLine,
  Nut,
  Toolbox,
  Globe,
} from "@phosphor-icons/react";
import useUser from "@/hooks/useUser";
import { isMobile } from "react-device-detect";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import showToast from "@/utils/toast";
import System from "@/models/system";
import Option from "./MenuOption";
import { CanViewChatHistoryProvider } from "../CanViewChatHistory";
import { useSidebarToggle } from "@/components/Sidebar/SidebarToggle";

export default function SettingsSidebar({ children }) {
  const { t } = useTranslation();
  const { logo } = useLogo();
  const { user } = useUser();
  const sidebarRef = useRef(null);
  const [showBgOverlay, setShowBgOverlay] = useState(false);
  const { showSidebar, setShowSidebar } = useSidebarToggle();

  useEffect(() => {
    if (showSidebar) {
      setTimeout(() => setShowBgOverlay(true), 300);
    } else {
      setShowBgOverlay(false);
    }
  }, [showSidebar]);

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`transition-all duration-500 relative m-4 rounded-2xl bg-theme-bg-sidebar border border-theme-sidebar-border shadow-lg flex flex-col
          ${showSidebar ? "w-[320px] min-w-[260px] p-6" : "w-[64px] min-w-[64px] p-2 items-center"}
        `}
        style={{ zIndex: 20 }}
        aria-label="Settings sidebar"
      >
        {/* Toggle Button */}
        <button
          className="absolute top-4 right-[-20px] bg-theme-action-menu-bg rounded-full p-2 shadow hover:bg-theme-action-menu-item-hover transition"
          onClick={() => setShowSidebar(!showSidebar)}
          aria-label={showSidebar ? "Collapse sidebar" : "Expand sidebar"}
        >
          <List className="h-6 w-6" />
        </button>
        {/* Sidebar Content */}
        <SidebarContent user={user} t={t} expanded={showSidebar} />
        {showSidebar && (
          <div className="absolute bottom-0 left-0 right-0 pt-4 pb-3 rounded-b-2xl bg-theme-bg-sidebar bg-opacity-80 backdrop-blur z-10">
            <Footer />
          </div>
        )}
      </aside>
      {/* Overlay when expanded */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
          onClick={() => setShowSidebar(false)}
          aria-label="Close settings"
        />
      )}
      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col relative transition-all duration-500" style={{ zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}

function SidebarContent({ user, t, expanded }) {
  return (
    <nav className={`flex flex-col gap-6 ${expanded ? "" : "items-center"}`} aria-label="Settings navigation">
      {expanded && (
        <div className="flex items-center gap-3 mb-2">
          <img src={useLogo().logo} alt="Logo" className="h-8 rounded" />
          <span className="text-lg font-semibold text-theme-text-secondary">{t("settings.title")}</span>
        </div>
      )}
      <div className={`flex flex-col gap-4 ${expanded ? "" : "items-center"}`}>
        <SidebarOptions user={user} t={t} expanded={expanded} />
        {expanded && (
          <>
            <div className="border-t border-theme-sidebar-border my-2" />
            <SupportEmail />
            <Link
              hidden={user?.role !== "admin"}
              to={paths.settings.privacy()}
              className="text-theme-text-secondary hover:text-white text-xs"
            >
              {t("settings.privacy")}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function SupportEmail() {
  const [supportEmail, setSupportEmail] = useState(paths.mailToMintplex());
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSupportEmail = async () => {
      const supportEmail = await System.fetchSupportEmail();
      setSupportEmail(
        supportEmail?.email
          ? `mailto:${supportEmail.email}`
          : paths.mailToMintplex()
      );
    };
    fetchSupportEmail();
  }, []);

  return (
    <Link
      to={supportEmail}
      className="text-theme-text-secondary hover:text-white hover:light:text-theme-text-primary text-xs leading-[18px] mx-3 mt-1"
    >
      {t("settings.contact")}
    </Link>
  );
}

const SidebarOptions = ({ user = null, t, expanded }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.sidebar-option-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <CanViewChatHistoryProvider>
      {({ viewable: canViewChatHistory }) => (
        <>
          <Option
            btnText={t("settings.ai-providers")}
            icon={<Gear className="h-5 w-5 flex-shrink-0" />}
            user={user}
            childOptions={[
              {
                btnText: t("settings.llm"),
                href: paths.settings.llmPreference(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.vector-database"),
                href: paths.settings.vectorDatabase(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.embedder"),
                href: paths.settings.embedder.modelPreference(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.text-splitting"),
                href: paths.settings.embedder.chunkingPreference(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.voice-speech"),
                href: paths.settings.audioPreference(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.transcription"),
                href: paths.settings.transcriptionPreference(),
                flex: true,
                roles: ["admin"],
              },
            ]}
            isOpen={expanded && openDropdown === "ai-providers"}
            onToggle={() => handleToggle("ai-providers")}
            dropdownClass="sidebar-option-dropdown"
            expanded={expanded}
          />
          <Option
            btnText={t("settings.admin")}
            icon={<UserCircleGear className="h-5 w-5 flex-shrink-0" />}
            user={user}
            childOptions={[
              {
                btnText: t("settings.users"),
                href: paths.settings.users(),
                roles: ["admin", "manager"],
              },
              {
                btnText: t("settings.workspaces"),
                href: paths.settings.workspaces(),
                roles: ["admin", "manager"],
              },
              {
                hidden: !canViewChatHistory,
                btnText: t("settings.workspace-chats"),
                href: paths.settings.chats(),
                flex: true,
                roles: ["admin", "manager"],
              },
              {
                btnText: t("settings.invites"),
                href: paths.settings.invites(),
                roles: ["admin", "manager"],
              },
            ]}
            isOpen={expanded && openDropdown === "admin"}
            onToggle={() => handleToggle("admin")}
            dropdownClass="sidebar-option-dropdown"
            expanded={expanded}
          />
          <Option
            btnText={t("settings.agent-skills")}
            icon={<Robot className="h-5 w-5 flex-shrink-0" />}
            href={paths.settings.agentSkills()}
            user={user}
            flex={true}
            roles={["admin"]}
            expanded={expanded}
          />
          <Option
            btnText="Community Hub"
            icon={<Globe className="h-5 w-5 flex-shrink-0" />}
            childOptions={[
              {
                btnText: "Explore Trending",
                href: paths.communityHub.trending(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: "Your Account",
                href: paths.communityHub.authentication(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: "Import Item",
                href: paths.communityHub.importItem(),
                flex: true,
                roles: ["admin"],
              },
            ]}
            isOpen={expanded && openDropdown === "community-hub"}
            onToggle={() => handleToggle("community-hub")}
            dropdownClass="sidebar-option-dropdown"
            expanded={expanded}
          />
          <Option
            btnText={t("settings.customization")}
            icon={<PencilSimpleLine className="h-5 w-5 flex-shrink-0" />}
            user={user}
            childOptions={[
              {
                btnText: t("settings.interface"),
                href: paths.settings.interface(),
                flex: true,
                roles: ["admin", "manager"],
              },
              {
                btnText: t("settings.branding"),
                href: paths.settings.branding(),
                flex: true,
                roles: ["admin", "manager"],
              },
              {
                btnText: t("settings.chat"),
                href: paths.settings.chat(),
                flex: true,
                roles: ["admin", "manager"],
              },
            ]}
            isOpen={expanded && openDropdown === "customization"}
            onToggle={() => handleToggle("customization")}
            dropdownClass="sidebar-option-dropdown"
            expanded={expanded}
          />
          <Option
            btnText={t("settings.tools")}
            icon={<Toolbox className="h-5 w-5 flex-shrink-0" />}
            user={user}
            childOptions={[
              {
                hidden: !canViewChatHistory,
                btnText: t("settings.embed-chats"),
                href: paths.settings.embedChats(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.embeds"),
                href: paths.settings.embedSetup(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.event-logs"),
                href: paths.settings.logs(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.api-keys"),
                href: paths.settings.apiKeys(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.system-prompt-variables"),
                href: paths.settings.systemPromptVariables(),
                flex: true,
                roles: ["admin"],
              },
              {
                btnText: t("settings.browser-extension"),
                href: paths.settings.browserExtension(),
                flex: true,
                roles: ["admin", "manager"],
              },
            ]}
            isOpen={expanded && openDropdown === "tools"}
            onToggle={() => handleToggle("tools")}
            dropdownClass="sidebar-option-dropdown"
            expanded={expanded}
          />
          <Option
            btnText={t("settings.security")}
            icon={<Nut className="h-5 w-5 flex-shrink-0" />}
            href={paths.settings.security()}
            user={user}
            flex={true}
            roles={["admin", "manager"]}
            hidden={user?.role !== "admin" && user?.role !== "manager"}
            expanded={expanded}
          />
          <HoldToReveal key="exp_features">
            <Option
              btnText={t("settings.experimental-features")}
              icon={<Flask className="h-5 w-5 flex-shrink-0" />}
              href={paths.settings.experimental()}
              user={user}
              flex={true}
              roles={["admin"]}
              expanded={expanded}
            />
          </HoldToReveal>
        </>
      )}
    </CanViewChatHistoryProvider>
  );
};

function HoldToReveal({ children, holdForMs = 3_000 }) {
  let timeout = null;
  const [showing, setShowing] = useState(
    window.localStorage.getItem(
      "anythingllm_experimental_feature_preview_unlocked"
    )
  );

  useEffect(() => {
    const onPress = (e) => {
      if (!["Control", "Meta"].includes(e.key) || timeout !== null) return;
      timeout = setTimeout(() => {
        setShowing(true);
        showToast("Experimental feature previews unlocked!");
        window.localStorage.setItem(
          "anythingllm_experimental_feature_preview_unlocked",
          "enabled"
        );
        window.removeEventListener("keypress", onPress);
        window.removeEventListener("keyup", onRelease);
        clearTimeout(timeout);
      }, holdForMs);
    };
    const onRelease = (e) => {
      if (!["Control", "Meta"].includes(e.key)) return;
      if (showing) {
        window.removeEventListener("keypress", onPress);
        window.removeEventListener("keyup", onRelease);
        clearTimeout(timeout);
        return;
      }
      clearTimeout(timeout);
    };

    if (!showing) {
      window.addEventListener("keydown", onPress);
      window.addEventListener("keyup", onRelease);
    }
    return () => {
      window.removeEventListener("keydown", onPress);
      window.removeEventListener("keyup", onRelease);
    };
  }, []);

  if (!showing) return null;
  return children;
}
