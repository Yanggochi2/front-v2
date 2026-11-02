"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import OnboardingButton from "@/components/ui/OnboardingButton";
import {
  EMAIL_RULE,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULE,
  TERMS_LABEL,
} from "@/constants/auth.constants";
import { useSubmit } from "@/hooks/useSubmit";
import { signup } from "@/services/authApi";
import AuthField from "./AuthField";

type Errors = Partial<Record<"name" | "email" | "password" | "passwordConfirm" | "terms", string>>;

function validate(v: { name: string; email: string; password: string; passwordConfirm: string; terms: boolean }): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = "이름을 입력해 주세요.";
  else if (v.name.trim().length > NAME_MAX_LENGTH) errors.name = `이름은 ${NAME_MAX_LENGTH}자까지 쓸 수 있어요.`;
  if (!EMAIL_RULE.test(v.email.trim())) errors.email = "이메일 형식을 확인해 주세요.";
  if (v.password.length < PASSWORD_MIN_LENGTH || !PASSWORD_RULE.test(v.password))
    errors.password = `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상, 영문과 숫자를 함께 써 주세요.`;
  if (v.passwordConfirm !== v.password) errors.passwordConfirm = "비밀번호가 서로 달라요.";
  if (!v.terms) errors.terms = "약관에 동의해야 가입할 수 있어요.";
  return errors;
}

export default function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "", passwordConfirm: "", terms: false });
  const [errors, setErrors] = useState<Errors>({});
  const { submit, loading, error } = useSubmit();

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const email = values.email.trim();
    // 가입 응답이 인증 쿠키를 내려 주므로(백엔드 #86) 바로 병동 만들기로 간다.
    const ok = await submit(async () => {
      await signup({ name: values.name.trim(), email, password: values.password, termsAgreed: true });
    });
    if (ok) {
      router.replace("/onboarding/create-ward");
      router.refresh();
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <AuthField
        id="signup-name"
        label="이름"
        autoComplete="name"
        placeholder="이름을 입력해요"
        maxLength={NAME_MAX_LENGTH}
        value={values.name}
        error={errors.name}
        onChange={(e) => set("name", e.target.value)}
      />
      <AuthField
        id="signup-email"
        label="이메일"
        type="email"
        autoComplete="email"
        placeholder="name@hospital.co.kr"
        value={values.email}
        error={errors.email}
        onChange={(e) => set("email", e.target.value)}
      />
      <AuthField
        id="signup-password"
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        placeholder="비밀번호를 입력해요"
        hint={`${PASSWORD_MIN_LENGTH}자 이상, 영문과 숫자를 함께 써 주세요`}
        value={values.password}
        error={errors.password}
        onChange={(e) => set("password", e.target.value)}
      />
      <AuthField
        id="signup-password-confirm"
        label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
        placeholder="비밀번호를 한 번 더 입력해요"
        value={values.passwordConfirm}
        error={errors.passwordConfirm}
        onChange={(e) => set("passwordConfirm", e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 text-[17px] font-medium text-ink">
          <input
            type="checkbox"
            checked={values.terms}
            onChange={(e) => set("terms", e.target.checked)}
            className="size-6 shrink-0 accent-primary"
          />
          {TERMS_LABEL}
        </label>
        {errors.terms ? <p className="text-base font-medium text-danger">{errors.terms}</p> : null}
      </div>
      {error ? (
        <p role="alert" className="text-base font-medium text-danger">
          {error}
        </p>
      ) : null}
      <OnboardingButton type="submit" disabled={loading}>
        {loading ? "가입하는 중…" : "가입하기"}
      </OnboardingButton>
      <p className="text-center text-[17px] font-medium text-ink-sub">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-bold text-primary underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
