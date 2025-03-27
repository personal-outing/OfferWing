import { Alert, Button, Modal, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";
import { formatSeconds, toBottom, toUrl } from "@/utils";
import Tips from "@/components/MobileMeeting/components/Tips";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CheckCircleTwoTone, EditOutlined } from "@ant-design/icons";
import Operation from "@/components/MobileMeeting/components/Operation";
import store from "@/store";
import { sendLog } from "@/services/meeting";

const MobileWriting = (props) => {
  const { positionid, spmPre, source } = props;
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "meeting.mobile.0.0",
      extInfo: JSON.stringify({ positionid, spmPre, source }),
    });
  }, []);

  return (
    <div className={styles.box}>
      <img
        src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
        alt=""
        style={{
          width: "150px",
          marginBottom: "20px",
        }}
      />
      <div className={styles.displayWarn}>
        <p>请关闭手机方向锁定或开启自动旋转（如已设置请忽略）</p>
        <p>
          笔试功能您必须<b>手机横放</b>使用{" "}
          <img
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E6%A8%AA%E5%B1%8F.png"
            alt=""
            style={{ width: "30px" }}
          />
        </p>
      </div>
      <Button
        style={{ borderRadius: "80px" }}
        type="primary"
        onClick={() => toUrl("/writingtask")}
      >
        返回笔试页
      </Button>
    </div>
  );
};

export default MobileWriting;
