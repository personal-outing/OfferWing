import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "@ice/runtime";
import { getAllCompanies, getMjInterviewStatus } from "@/services/exp";
import { definePageConfig } from "ice";
import { sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { Card } from "antd";
import { toUrl } from "../../utils";

function Tech() {
  const [searchParams] = useSearchParams();
  const spmPre = searchParams.get("spm") || "default";
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "tech.0.0.0",
      extInfo: JSON.stringify({ spmPre }),
    });
  }, []);

  return (
    <div className={styles.techContainer}>
      <Card
        className={styles.techCard}
        title="自定义问答库"
        style={{ width: 300 }}
        onClick={() => {
          toUrl("/setup", "type=pq");
        }}
      >
        <p className={styles.techMsg}>
          您可针对您对应的岗位添加规定数目的自定义题库。题库为问题+答案格式，OfferWing
          AI在回答问题时会优先从您的题库中直接查找答案
        </p>
      </Card>
      <Card
        className={styles.techCard}
        title="自定义语音识别"
        style={{ width: 300 }}
        onClick={() => {
          toUrl("/setup", "type=voice");
        }}
      >
        <p className={styles.techMsg}>
          您可上传经常识别错误的语音语句，我们会对其进行专项训练，提升OfferWing
          AI的识别能力
        </p>
      </Card>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-技术定制",
  };
});

export default Tech;
