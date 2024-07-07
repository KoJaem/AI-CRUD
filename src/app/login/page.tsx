import { signInWithKakao, signOut } from "./actions";

export default function LoginPage() {
  return (
    <form className="flex flex-col gap-[40px]">
      <button formAction={signInWithKakao}>SignInWithKakao</button>
      <button formAction={signOut}>Sign Out</button>
    </form>
  );
}
