"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import OnboardingButton from "@/components/ui/OnboardingButton";
import { useSubmit } from "@/hooks/useSubmit";
import { getEntryPath, login } from "@/services/authApi";
import AuthField from "./AuthField";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { submit, loading, error, setError } = useSubmit();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    let next = "/schedule";
    const ok = await submit(async () => {
      await login({ email: email.trim(), password });
      next = await getEntryPath();
    });
    if (ok) {
      router.replace(next);
      router.refresh();
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <AuthField
        id="login-email"
        label="이메일"
        type="email"
        autoComplete="email"
        placeholder="name@hospital.co.kr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthField
        id="login-password"
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        placeholder="비밀번호를 입력해요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? (
        <p role="alert" className="text-base font-medium text-danger">
          {error}
        </p>
      ) : null}
      <OnboardingButton type="submit" disabled={loading}>
        {loading ? "로그인하는 중…" : "로그인"}
      </OnboardingButton>
      <p className="text-center text-[17px] font-medium text-ink-sub">
        처음이세요?{" "}
        <Link href="/signup" className="font-bold text-primary underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
      {/* TODO: 비밀번호 찾기는 API 확정 후 */}
    </form>
  );
}
