import Image from "next/image";

export function RecipeListLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-24">
      <div className="animate-[bounce_2s_ease-in-out_infinite]">
        <Image
          src="/images/coco_loading.png"
          alt="로딩 중..."
          width={120}
          height={120}
          className="h-auto"
        />
      </div>
      <p className="text-sm text-cottage-text-sub">레시피를 불러오고 있어요...</p>
    </div>
  );
}
