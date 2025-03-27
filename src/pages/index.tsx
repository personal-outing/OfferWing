import { useEffect } from "react";
import { definePageConfig, useSearchParams } from "ice";
import { sendLog } from "@/services/meeting";
import UnLoginIndex from "../components/UnLoginIndex/index";
import store from "@/store";
import styles from "./index.module.css";

export default function IndexPage() {
  const [searchParams] = useSearchParams();
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [userState] = store.useModel("user");
  let syn = localStorage.getItem("syn") || "";

  useEffect(() => {
    if (!userState.currentUser.username) {
      if (!syn) {
        localStorage.setItem(
          "syn",
          Math.random().toString(36).substring(2, 10)
        );
      }
      sendLog({
        type: "pv",
        uid: userState.currentUser.username || "",
        spm: "index.0.0.0",
        extInfo: JSON.stringify({ source, spmPre, id: syn }),
      });
    }
  }, []);

  return (
    <div id="app" className={styles.app}>
      <UnLoginIndex />
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title:
      "OfferWing AI - 面试神器|辅助面试|面试助手，面试辅助工具_OfferWing AI",
  };
});
