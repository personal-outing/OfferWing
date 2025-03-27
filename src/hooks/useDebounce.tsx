import { useCallback, useEffect, useRef } from "react";

function useDebounce(fn, delay) {
  const { current } = useRef({ fn, timer: null as any });
  useEffect(() => {
    current.fn = fn;
  }, [fn]);

  return useCallback((...args) => {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(() => {
      current.fn(...args);
    }, delay);
  }, []);
}

export default useDebounce;
