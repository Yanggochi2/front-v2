// 회원가입 입력 규칙 (docs/API.md SignupRequest). 서버도 같은 규칙으로 다시 검사한다.
export const NAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).+$/;
export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO: 약관·개인정보 처리방침 본문과 링크는 확정 후 연결
export const TERMS_LABEL = "이용약관과 개인정보 처리방침에 동의해요 (필수)";
