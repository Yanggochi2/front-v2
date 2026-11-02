import AuthCard from "@/components/auth/AuthCard";
import SignupForm from "@/components/auth/SignupForm";

// 수간호사 회원가입. 가입하면 바로 병동 만들기로 간다.
export default function SignupPage() {
  return (
    <AuthCard title="회원가입" description="수간호사 계정을 만들고 병동을 만들어요">
      <SignupForm />
    </AuthCard>
  );
}
