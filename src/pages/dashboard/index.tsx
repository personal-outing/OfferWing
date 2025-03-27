import { useEffect } from "react";
import { definePageConfig, useSearchParams } from "ice";
import store from "@/store";
import styles from "./index.module.css";
import LoginIndex from "../../components/LoginIndex";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [userState] = store.useModel("user");

  useEffect(() => {
    if (!userState.currentUser.username) {
      location.href = "/";
    }
  }, []);

  return (
    <div id="app" className={styles.app}>
      <LoginIndex />
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title:
      "OfferWing AI - 面试神器|辅助面试|面试助手，面试辅助工具_OfferWing AI",
  };
});
