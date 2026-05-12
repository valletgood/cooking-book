import Image from "next/image";

export function PageLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-cottage-bg">
      <div className="animate-[bounce_2s_ease-in-out_infinite]">
        <Image
          src="/images/coco_loading.png"
          alt="로딩 중..."
          width={100}
          height={100}
          className="h-auto"
        />
      </div>
      <p className="mt-3 text-sm text-cottage-text-sub">잠시만요...</p>
    </div>
  );
}
