import Image from "next/image";
import { LoginButton } from "./LoginButton";

export default function LoginPage() {
  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden bg-cottage-bg">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/8 to-transparent" />

      <div className="z-10 flex flex-1 flex-col items-center justify-center px-8">
        <div className="mb-2 animate-[bounce_3s_ease-in-out_1]">
          <Image
            src="/images/coco_login.png"
            alt="코코 — CookingBook 마스코트"
            width={180}
            height={177}
            priority
            className="h-auto drop-shadow-md"
          />
        </div>

        <h1 className="font-heading text-[1.75rem] font-extrabold tracking-tight text-cottage-text">
          CookingBook
        </h1>
        <p className="mt-2 text-center text-[0.95rem] leading-relaxed text-cottage-text-sub">
          레시피를 찍고, AI가 정리하고,
          <br />
          따라 요리하세요
        </p>

        <div className="mt-8 w-full max-w-xs">
          <LoginButton />
        </div>
      </div>

      <div className="z-10 pb-10 pt-4">
        <p className="text-center text-xs leading-relaxed text-cottage-text-muted">
          로그인하면 개인 레시피를 저장하고
          <br />
          쿡 모드로 요리할 수 있어요
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cottage-warm/60 to-transparent" />
    </div>
  );
}
