import { useCallback, useEffect, useRef } from "react";

function useThrottle(fn, delay) {
  const { current } = useRef({ fn, timer: null as any });
  useEffect(() => {
    current.fn = fn;
  }, [fn]);

  return useCallback(function f(...args) {
    if (!current.timer) {
      current.timer = setTimeout(() => {
        delete current.timer;
      }, delay);
      current.fn(...args);
    }
  }, []);
}

export default useThrottle;
