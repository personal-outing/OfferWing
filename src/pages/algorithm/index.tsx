import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { history, useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import { getInterviewDetail, sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { toUrl } from "@/utils";
import { Button } from "antd";

function Algorithm() {
  const [start, setStart] = useState(false);
  return (
    <div className={styles.AlgContainer}>
      <h1>
        算法大杀器{" "}
        <span style={{ color: "#aaa", fontSize: "14px" }}>
          实时监听剪贴板内容，自动识别算法问题，隔空投送
        </span>
      </h1>
      <div
        style={{
          background: "#fff",
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "10px",
        }}
      >
        <h3>正在进行的面试</h3>
        <p>面试ID：8a4cad3d-4289-4385-8970-ed7d13f28ffb</p>
        {start && (
          <p>
            <img
              style={{ width: "30px" }}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/loading.gif"
              alt=""
            />
            正在监听中{" "}
            <img
              style={{ width: "30px" }}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/loading.gif"
              alt=""
            />
          </p>
        )}
        <p style={{ textAlign: "right" }}>
          {start ? (
            <Button
              onClick={() => setStart(false)}
              style={{ background: "red", border: 'red' }}
              type="primary"
            >
              结束监听
            </Button>
          ) : (
            <Button onClick={() => setStart(true)} type="primary">
              开始监听
            </Button>
          )}
        </p>
      </div>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-算法大杀器",
  };
});

export default Algorithm;
