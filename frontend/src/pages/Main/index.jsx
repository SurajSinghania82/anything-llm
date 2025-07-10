import React, { useState } from "react";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { FullScreenLoader } from "@/components/Preloader";
import Home from "./Home";
import DefaultChatContainer from "@/components/DefaultChat";
import { isMobile } from "react-device-detect";
import Sidebar, { SidebarMobileHeader } from "@/components/Sidebar";
import { userFromStorage } from "@/utils/request";
import OrbsBackground from "@/components/OrbsBackground";
import {
  BG_GRADIENT_LIGHT,
  BG_GRADIENT_DARK,
} from "@/theme/themeColors";

export default function Main() {
  const { loading, requiresAuth, mode } = usePasswordModal();
  const [isDark, setIsDark] = useState(true);

  if (loading) return <FullScreenLoader />;
  if (requiresAuth !== false)
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;

  const user = userFromStorage();
  const background = isDark ? BG_GRADIENT_DARK : BG_GRADIENT_LIGHT;

  return (
    <div
      className="w-screen h-screen overflow-hidden flex relative"
      style={{
        background,
        transition: "background 0.5s",
      }}
    >
      {/* Orbs overlay */}
      <OrbsBackground style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      <div className="relative flex-1 flex" style={{ zIndex: 1 }}>
        {!isMobile ? <Sidebar /> : <SidebarMobileHeader />}
        {!!user && user?.role !== "admin" ? <DefaultChatContainer /> : <Home />}
      </div>
    </div>
  );
}
