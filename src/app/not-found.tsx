import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-cottage-bg px-8">
      <Image
        src="/images/coco_error.png"
        alt="페이지를 찾을 수 없어요"
        width={160}
        height={160}
        className="h-auto"
      />
      <h1 className="mt-4 font-heading text-xl font-bold text-cottage-text">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-2 text-center text-sm text-cottage-text-sub">
        코코가 아무리 찾아봐도 없대요...
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-cottage-text px-6 text-sm font-semibold text-cottage-bg active:opacity-80"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
