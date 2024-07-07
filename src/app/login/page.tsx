import Image from "next/image";
import { signInWithKakao, signOut } from "./actions";

export default function LoginPage() {
  return (
    <form className="overflow-hidden w-full h-full">
      <button
        className="absolute bottom-[40px] left-1/2 translate-x-[-50%] scale-125 flex flex-col  items-center gap-[8px]"
        formAction={signInWithKakao}
      >
        <p className="text-[10px]">KoJaem 프로젝트에 오신걸 환영합니다!</p>
        <Image
          src={"/images/kakao_login_medium_wide.png"}
          alt="kakao_login_wide"
          className=""
          width={300}
          height={45}
        />
      </button>
      <button formAction={signOut}>Sign Out</button>
    </form>
  );
}
