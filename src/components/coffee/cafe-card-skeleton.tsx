import { Skeleton } from "../ui/skeleton"

const CafeCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 h-full">
      <div className="p-6">
        {/* 카페 정보 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 flex-1">
            {/* 카페 이름 스켈레톤 */}
            <Skeleton className="h-6 w-3/4" />
            {/* 주소 스켈레톤 */}
            <Skeleton className="h-4 w-full" />
          </div>
          {/* 평점 스켈레톤 */}
          <div className="ml-2">
            <Skeleton className="h-8 w-14" />
          </div>
        </div>

        {/* 컵 노트 태그 스켈레톤 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* 원두 정보 스켈레톤 */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-3">
            <div className="border-l-2 border-gray-200 pl-3">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="border-l-2 border-gray-200 pl-3">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>

        {/* 거리와 영업시간 스켈레톤 */}
        <div className="flex justify-between items-center text-sm mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* 버튼 스켈레톤 */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

export default CafeCardSkeleton;