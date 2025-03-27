import { useEffect } from "react";
import useDebounce from "./useDebounce";

/**
 * 滚动到底部触发事件的hook
 * @param listDomRef 绑定滚动事件的dom节点的ref
 * @param callback 滚动到底部时执行的callback
 * @param reactionDistance 距离底部的触发距离，默认为0
 */
const useScrollToBottomHook = (
  listDomRef: any,
  hasMore,
  callback: () => void,
  reactionDistance = 0
) => {
  const handleScrollFun = (e: any) => {
    if (
      e.target.scrollHeight - e.target.scrollTop - e.target.offsetHeight <=
      reactionDistance
    ) {
      callback();
    }
  };

  const handleScroll = useDebounce(handleScrollFun, 600);
  useEffect(() => {
    const currentDom = listDomRef.current;

    if (!hasMore) {
      currentDom!.removeEventListener("scroll", handleScroll);
      return;
    }
    currentDom!.addEventListener("scroll", handleScroll);
    return () => {
      // 组件销毁时清除绑定事件
      currentDom!.removeEventListener("scroll", handleScroll);
    };
  }, [callback, hasMore, reactionDistance, listDomRef]);
};

export default useScrollToBottomHook;
