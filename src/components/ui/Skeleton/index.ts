import { Skeleton as BaseSkeleton, TableSkeleton } from "./Skeleton";

// Gán TableSkeleton thành 1 thuộc tính của Skeleton
const Skeleton = Object.assign(BaseSkeleton, {
  Table: TableSkeleton,
});

export default Skeleton;
export { TableSkeleton };
