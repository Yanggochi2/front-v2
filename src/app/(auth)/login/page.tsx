import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

// 수간호사 로그인. 일반 간호사는 계정 없이 공유 링크로 근무표를 본다 (10/26 계약).
export default function LoginPage() {
  return (
    <AuthCard title="로그인" description="수간호사 계정으로 로그인해 주세요">
      <LoginForm />
    </AuthCard>
  );
}
