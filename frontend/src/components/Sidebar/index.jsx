import React, { useEffect, useRef, useState } from "react";
import { Plus, List } from "@phosphor-icons/react";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "../Modals/NewWorkspace";
import ActiveWorkspaces from "./ActiveWorkspaces";
import useLogo from "@/hooks/useLogo";
import useUser from "@/hooks/useUser";
import Footer from "../Footer";
import SettingsButton from "../SettingsButton";
import { Link } from "react-router-dom";
import paths from "@/utils/paths";
import { useTranslation } from "react-i18next";
import { useSidebarToggle, ToggleSidebarButton } from "./SidebarToggle";
import { useTheme } from "@/hooks/useTheme";

// Glassmorphic styles
const SIDEBAR_BG = "rgba(3, 7, 15, 0.88)";
const SIDEBAR_BORDER = "1.5px solid rgba(255,255,255,0.10)";
const SIDEBAR_SHADOW = "0 8px 32px 0 rgba(31,38,135,0.25)";
const SIDEBAR_BLUR = "blur(18px)";
const SIDEBAR_RADIUS = "28px";

const BG_GRADIENT_LIGHT =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)";
const BG_GRADIENT_DARK =
  "linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)";
const GLASS_BG_LIGHT = "rgba(255, 255, 255, 0.1)";
const GLASS_BG_DARK = "rgba(0, 0, 0, 0.1)";
const GLASS_BORDER = "1px solid rgba(255,255,255,0.1)";
const GLASS_SHADOW = "0 4px 8px rgba(0, 0, 0, 0.1)";
const GLASS_BLUR = "blur(10px)";
const GLASS_RADIUS = "20px";

export default function Sidebar({ children }) {
  const { user } = useUser();
  const { logo } = useLogo();
  const sidebarRef = useRef(null);
  const { showSidebar, setShowSidebar, canToggleSidebar } = useSidebarToggle();
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Theme-based styles
  const isLight = theme === "light";
  const SIDEBAR_BG = isLight
    ? "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(243,244,246,0.8) 100%)"
    : "rgba(3, 7, 15, 0.88)";
  const SIDEBAR_BORDER = "1.5px solid rgba(255,255,255,0.10)";
  const SIDEBAR_SHADOW = isLight
    ? "0 8px 32px 0 rgba(200,200,200,0.15)"
    : "0 8px 32px 0 rgba(31,38,135,0.25)";
  const SIDEBAR_BLUR = "blur(18px)";
  const SIDEBAR_RADIUS = "28px";
  const FOOTER_BG = isLight
    ? "rgba(243,244,246,0.85)"
    : "rgba(17,24,39,0.65)";
  const FOOTER_BORDER_TOP = "1px solid rgba(255,255,255,0.06)";

  return (
    <>
      {/* Toggle button always visible on desktop */}
      <div className="hidden md:block">
        <ToggleSidebarButton
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
      </div>
      <div
        style={{
          width: showSidebar ? "310px" : "0px",
          minWidth: showSidebar ? "310px" : "0px",
          transition: "width 0.5s, min-width 0.5s",
        }}
        className="h-screen flex flex-col items-center justify-between fixed left-0 top-0 z-30"
      >
        <div
          ref={sidebarRef}
          style={{
            background: SIDEBAR_BG,
            border: SIDEBAR_BORDER,
            boxShadow: SIDEBAR_SHADOW,
            backdropFilter: SIDEBAR_BLUR,
            borderRadius: SIDEBAR_RADIUS,
            transition: "background 0.5s, box-shadow 0.5s, border 0.5s",
            width: "100%",
            height: "96vh",
            margin: "2vh 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
            position: "relative",
            borderRight: isLight
              ? "2px solid rgba(200,200,200,0.35)" // <-- Light border for light mode
              : "2px solid rgba(255,255,255,0.08)", // <-- Subtle border for dark mode
          }}
        >
          {/* Logo and toggle */}
          <div className="w-full flex items-center justify-between px-8 py-7">
            <Link to={paths.home()} aria-label="Home" className="flex items-center gap-2">
              <img
                src={logo}
                alt="Logo"
                className="rounded-lg max-h-[38px] object-contain shadow-lg"
                style={{ transition: "opacity 0.5s" }}
              />
            </Link>
            
          </div>

          {/* Workspaces and actions */}
          <div className="flex-1 w-full flex flex-col items-center px-6 overflow-y-auto">
            <div className="flex flex-col gap-4 w-full">
              {(!user || user?.role !== "default") && (
                <button
                  onClick={showNewWsModal}
                  className={`flex items-center gap-2 px-4 py-3 ${
                    isLight ? "bg-slate-100/60 hover:bg-slate-200/80 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
                  } font-semibold rounded-2xl shadow-md transition-all duration-200 w-full justify-center backdrop-blur-md border border-white/10`}
                  style={{ marginBottom: "8px" }}
                >
                  <Plus size={20} weight="bold" />
                  <span className="text-base">{t("new-workspace.title")}</span>
                </button>
              )}
              <ActiveWorkspaces />
            </div>
          </div>

          {/* Settings button floating above footer */}
          <div className="w-full flex justify-center mb-2">
            <div
              className={`flex items-center justify-center ${
                isLight ? "bg-slate-100/60 hover:bg-slate-200/80 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
              } rounded-full p-3 shadow-lg transition-all duration-200 backdrop-blur-md border border-white/10`}
              style={{
                position: "absolute",
                bottom: "70px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
              }}
              aria-label="Settings"
            >
              <SettingsButton />
            </div>
          </div>

          {/* Footer */}
          <div
            className="w-full px-6 py-4"
            style={{
              background: FOOTER_BG,
              borderTop: FOOTER_BORDER_TOP,
              borderBottomLeftRadius: SIDEBAR_RADIUS,
              borderBottomRightRadius: SIDEBAR_RADIUS,
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          >
            <Footer />
          </div>
        </div>
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      </div>
      <div
        className={`transition-all duration-500 ${
          showSidebar ? "ml-[310px] w-[calc(100vw-310px)]" : "ml-0 w-full"
        }`}
      >
        {children}
      </div>
    </>
  );
}

export function SidebarMobileHeader() {
  const { logo } = useLogo();
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBgOverlay, setShowBgOverlay] = useState(false);
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();
  const { user } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    // Darkens the rest of the screen
    // when sidebar is open.
    function handleBg() {
      if (showSidebar) {
        setTimeout(() => {
          setShowBgOverlay(true);
        }, 300);
      } else {
        setShowBgOverlay(false);
      }
    }
    handleBg();
  }, [showSidebar]);

  return (
    <>
      <div
        aria-label="Show sidebar"
        className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 bg-theme-bg-sidebar light:bg-white text-slate-200 shadow-lg h-16"
      >
        <button
          onClick={() => setShowSidebar(true)}
          className="rounded-md p-2 flex items-center justify-center text-theme-text-secondary"
        >
          <List className="h-6 w-6" />
        </button>
        <div className="flex items-center justify-center flex-grow">
          <img
            src={logo}
            alt="Logo"
            className="block mx-auto h-6 w-auto"
            style={{ maxHeight: "40px", objectFit: "contain" }}
          />
        </div>
        <div className="w-12"></div>
      </div>
      <div
        style={{
          transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`,
        }}
        className={`z-99 fixed top-0 left-0 transition-all duration-500 w-[100vw] h-[100vh]`}
      >
        <div
          className={`${
            showBgOverlay
              ? "transition-all opacity-1"
              : "transition-none opacity-0"
          }  duration-500 fixed top-0 left-0 bg-theme-bg-secondary bg-opacity-75 w-screen h-screen`}
          onClick={() => setShowSidebar(false)}
        />
        <div
          ref={sidebarRef}
          className="relative h-[100vh] fixed top-0 left-0  rounded-r-[26px] bg-theme-bg-sidebar w-[80%] p-[18px] "
        >
          <div className="w-full h-full flex flex-col overflow-x-hidden items-between">
            {/* Header Information */}
            <div className="flex w-full items-center justify-between gap-x-4">
              <div className="flex shrink-1 w-fit items-center justify-start">
                <img
                  src={logo}
                  alt="Logo"
                  className="rounded w-full max-h-[40px]"
                  style={{ objectFit: "contain" }}
                />
              </div>
              {(!user || user?.role !== "default") && (
                <div className="flex gap-x-2 items-center text-slate-500 shink-0">
                  <SettingsButton />
                </div>
              )}
            </div>

            {/* Primary Body */}
            <div className="h-full flex flex-col w-full justify-between pt-4 ">
              <div className="h-auto md:sidebar-items">
                <div className=" flex flex-col gap-y-4 overflow-y-scroll no-scroll pb-[60px]">
                  <div className="flex gap-x-2 items-center justify-between">
                    {(!user || user?.role !== "default") && (
                      <button
                        onClick={showNewWsModal}
                        className="flex flex-grow w-[75%] h-[44px] gap-x-2 py-[5px] px-4 bg-white rounded-lg text-sidebar justify-center items-center hover:bg-opacity-80 transition-all duration-300"
                      >
                        <Plus className="h-5 w-5" />
                        <p className="text-sidebar text-sm font-semibold">
                          {t("new-workspace.title")}
                        </p>
                      </button>
                    )}
                  </div>
                  <ActiveWorkspaces />
                </div>
              </div>
              <div className="z-99 absolute bottom-0 left-0 right-0 pt-2 pb-6 rounded-br-[26px] bg-theme-bg-sidebar bg-opacity-80 backdrop-filter backdrop-blur-md">
                <Footer />
              </div>
            </div>
          </div>
        </div>
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      </div>
    </>
  );
}
