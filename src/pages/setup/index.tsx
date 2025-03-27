import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import { sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import QALibrary from "../../components/QALibrary";

function Setup() {
  const [searchParams] = useSearchParams();
  const spmPre = searchParams.get("spm") || "default";
  const setType = searchParams.get("type") || "pq";
  const career = searchParams.get("career") || "";
  const defaultTab = searchParams.get("tab") || "";
  const defaultCareerList = JSON.parse(searchParams.get("careerList") || "[]");
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "setup.0.0.0",
      extInfo: JSON.stringify({ spmPre, type: setType }),
    });
  }, []);

  return (
    <div className={styles.setupContainer}>
      {setType === "pq" ? (
        <QALibrary career={career} defaultTab={defaultTab} defaultCareerList={defaultCareerList} />
      ) : (
        <div>
          <p>正在开发中，如需加速定制请添加管理员微信</p>
          <img
            style={{ width: 150, height: 150 }}
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/zhuli.jpeg"
          />
        </div>
      )}
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-技术定制",
  };
});

export default Setup;
