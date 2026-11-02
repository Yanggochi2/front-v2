"use client";

import { useState, useSyncExternalStore } from "react";
import AdminButton from "@/components/ui/AdminButton";
import { useSubmit } from "@/hooks/useSubmit";
import { readManagementToken, saveManagementToken, toManagementUrl } from "@/lib/managementToken";
import { rotateManagementLink } from "@/services/wardApi";

const noop = () => () => {};
// 지금 이 브라우저에 저장된 관리 토큰으로 링크를 다시 만든다 (서버 렌더링 때는 없음).
const readSavedPath = () => {
  const token = readManagementToken(document.cookie);
  return token ? `/manage#token=${token}` : null;
};

// 관리 링크 보기·복사·새로 만들기. 새로 만들면 이전 링크는 바로 쓸 수 없게 되고, 이 브라우저는 새 링크로 이어서 쓴다.
export default function ManagementLinkSection() {
  const savedPath = useSyncExternalStore(noop, readSavedPath, () => null);
  const [rotatedPath, setRotatedPath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { submit, loading, error } = useSubmit();
  const path = rotatedPath ?? savedPath;
  const url = path ? toManagementUrl(path) : null;

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function rotate() {
    if (!window.confirm("새 관리 링크를 만들면 지금 링크는 바로 쓸 수 없어요. 링크를 나눠 준 사람도 새 링크를 받아야 해요. 계속할까요?")) return;
    await submit(async () => {
      const link = await rotateManagementLink();
      saveManagementToken(link.managementToken);
      setRotatedPath(link.managementPath);
      setCopied(false);
    });
  }

  return (
    <>
      <p className="w-full rounded-[14px] bg-surface px-5 py-4 font-mono text-[16px] break-all text-ink">{url ?? "-"}</p>
      <div className="flex flex-wrap items-center gap-3">
        <AdminButton onClick={copy} disabled={!url}>{copied ? "복사했어요" : "링크 복사"}</AdminButton>
        <AdminButton onClick={rotate} disabled={loading}>새 링크 만들기</AdminButton>
      </div>
      {rotatedPath ? (
        <p role="status" className="text-[16px] font-bold text-primary">새 링크를 만들었어요. 꼭 복사해서 저장해 두세요.</p>
      ) : null}
      {error ? <p role="alert" className="text-[16px] font-medium text-danger">{error}</p> : null}
    </>
  );
}
