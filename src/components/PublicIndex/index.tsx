import { useEffect, useState } from "react";
import { Button } from "antd";
import styles from "./index.module.css";
import { paramsStr, toUrl } from "@/utils";
import { history, useSearchParams } from "ice";
import store from "@/store";
import { sendLog } from "@/services/meeting";

export default function PublicIndex() {
  const [searchParams] = useSearchParams();
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [userState, userDispatcher] = store.useModel("user");

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: userState.currentUser.username || "",
      spm: "index.0.0.0",
      extInfo: JSON.stringify({ source, spmPre }),
    });
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.back}>
        <img
          className={styles.ideaIcon}
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
        />
        <h1>OfferWing AI</h1>
        <p>
          0刷题，0八股，轻松拿大厂
          <br />
          <span className={styles.offerText}>offer🎉</span>
        </p>
      </div>
      <video controls className={styles.videoBox}>
        <source
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/introduce%20.mp4"
          type="video/mp4"
        />
      </video>
      <div className={styles.dealBtn}>
        <Button
          onClick={() =>
            window.open(
              "https://qupbvle53j.feishu.cn/docx/KStWdWlyLoCkS0xBDYBcl1a5neb?from=from_copylink"
            )
          }
          className={styles.userBtn}
        >
          了解我们
        </Button>
      </div>
      <Button
        type="primary"
        onClick={() => {
          history?.push(`/login?spm=index.0.0.0${paramsStr("&")}`);
        }}
        className={styles.actionBtn}
      >
        登录 / 注册
      </Button>
    </div>
  );
}
