import React, { useEffect, useState } from "react";
import { default as WorkspaceChatContainer } from "@/components/WorkspaceChat";
import Sidebar from "@/components/Sidebar";
import { useParams } from "react-router-dom";
import Workspace from "@/models/workspace";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { isMobile } from "react-device-detect";
import { FullScreenLoader } from "@/components/Preloader";
import OrbsBackground from "@/components/OrbsBackground";
import {
  BG_GRADIENT_LIGHT,
  BG_GRADIENT_DARK,
} from "@/theme/themeColors";

export default function WorkspaceChat() {
  const { loading, requiresAuth, mode } = usePasswordModal();
  const [isDark, setIsDark] = useState(true);

  if (loading) return <FullScreenLoader />;
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }

  return <ShowWorkspaceChat isDark={isDark} setIsDark={setIsDark} />;
}

function ShowWorkspaceChat({ isDark, setIsDark }) {
  const { slug } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getWorkspace() {
      if (!slug) return;
      const _workspace = await Workspace.bySlug(slug);
      if (!_workspace) {
        setLoading(false);
        return;
      }
      const suggestedMessages = await Workspace.getSuggestedMessages(slug);
      const pfpUrl = await Workspace.fetchPfp(slug);
      setWorkspace({
        ..._workspace,
        suggestedMessages,
        pfpUrl,
      });
      setLoading(false);
    }
    getWorkspace();
  }, [slug]);

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
        {!isMobile && <Sidebar />}
        <WorkspaceChatContainer loading={loading} workspace={workspace} />
      </div>
    </div>
  );
}
