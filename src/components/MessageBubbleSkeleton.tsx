import { Skeleton } from "@mantine/core";

const MessageBubbleSkeleton = () => {
  return (
    <div className="flex items-center gap-3 py-2 px-4">
      <Skeleton height={40} circle />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-3 items-end">
          <Skeleton height={16} width={200} radius="sm" />
          <Skeleton height={12} width={75} radius="sm" />
        </div>
        <Skeleton
          height={12}
          width={Math.random() * (500 - 200) + 200}
          radius="sm"
        />
      </div>
    </div>
  );
};

export default MessageBubbleSkeleton;
