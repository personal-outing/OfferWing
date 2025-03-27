import { Button, Input, Modal, message } from "antd";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { toUrl } from "@/utils";
import "./style.css";

export default (props) => {
  const {
    onChangeStatus,
    status,
    handleSuspend,
    onInterrupt,
    addToQuestion,
    talkingList = [],
  } = props;
  const [bottomOpen, setBottomOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const scrollRef2 = useRef<any>(null);
  const tempRef = useRef<any>(true);

  const sendText = () => {
    setInputText("");
    addToQuestion(inputText, "input");
  };

  useEffect(() => {
    const ele = scrollRef2.current;
    if (talkingList.length > 0 && tempRef.current) {
      setTimeout(() => {
        ele.scrollTop = ele.scrollHeight;
      }, 100);
    }
  }, [talkingList]);

  useEffect(() => {
    const scrollEle = document.getElementById("scrollEle2");
    scrollEle?.addEventListener("scroll", function () {
      tempRef.current = false;
      setTimeout(() => {
        tempRef.current = true;
      }, 3000);
    });
  }, []);

  return (
    <div
      className={styles.subContainer}
      style={{ height: bottomOpen ? "auto" : "40rpx" }}
    >
      <div
        className={styles.dealBox}
        style={{
          paddingBottom: 0,
        }}
      >
        <div className={styles.openBtn}>
          {bottomOpen ? (
            <img
              onClick={() => setBottomOpen(false)}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/open.png"
              alt=""
            />
          ) : (
            <img
              onClick={() => setBottomOpen(true)}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/close.png"
              alt=""
            />
          )}
        </div>
        <div className={styles.dealBtn}>
          {status === "stop" || status === "over" ? (
            <>
              <div
                className={styles.dealBtnItem}
                onClick={() => {
                  if (status === "stop") {
                    onChangeStatus("start");
                  } else {
                    toUrl("/login", "", true);
                  }
                }}
                style={{ background: "#208cffb0" }}
              >
                {status === "stop" ? "开始面试" : "继续面试"}
              </div>
              <div
                className={styles.dealBtnItem}
                style={{ background: "#575757b0" }}
                onClick={() => toUrl("/", "", true)}
              >
                返回首页
              </div>
            </>
          ) : (
            <>
              {status === "suspend" ? (
                <div
                  className={styles.dealBtnItem}
                  style={{ background: "#ee8e27b0" }}
                  onClick={() => onChangeStatus("goOn")}
                >
                  继续面试
                </div>
              ) : (
                <>
                  <div
                    className={styles.dealBtnItem}
                    style={{ background: "#ee8e27b0" }}
                    onClick={handleSuspend}
                  >
                    暂停面试
                  </div>
                </>
              )}
              <div
                className={styles.dealBtnItem}
                style={{ background: "#e83810b0" }}
                onClick={() => {
                  onChangeStatus("over");
                }}
              >
                结束面试
              </div>
            </>
          )}
        </div>
        {/* <div className={styles.iconBox}>
          {tipShow && <span>实时对话查看👉</span>}
          {detailShow ? (
            <FullscreenExitOutlined
              onClick={() => {
                setDetailShow(false);
              }}
              className={styles.openIcon}
            />
          ) : (
            <FullscreenOutlined
              onClick={() => {
                tipShow = false;
                setDetailShow(true);
              }}
              className={styles.openIcon}
            />
          )}
        </div> */}
      </div>
      <div className={styles.fullScreen}>
        <div id="scrollEle2" className={styles.talkingBox} ref={scrollRef2}>
          {talkingList.map((item, idx) => {
            const { message = "", traceId = "" } = item;
            const isLast = idx === talkingList.length - 1;
            return (
              <div
                style={{
                  fontSize: isLast ? "15px" : "12px",
                  color: isLast ? "#222" : "#bbb",
                }}
                className={styles.talkingBoxItem}
                key={traceId}
              >
                <span style={{ fontWeight: "bold" }}>发言人：</span>
                {message}
                <a
                  className={styles.toQuestion}
                  onClick={() => addToQuestion(message)}
                >
                  添加至问题
                </a>
              </div>
            );
          })}
          {talkingList.length === 0 && <p>您和面试官的对话将会展示在这里</p>}
        </div>
      </div>
      <div className={styles.inputBox}>
        <Input
          placeholder="每5秒您只能发送一个自定义问题，可以回车直接发送"
          value={inputText}
          className={styles.inputItem}
          onChange={(e) => setInputText(e.target.value)}
          onPressEnter={sendText}
        />
        <Button onClick={sendText} className={styles.inputBtn} type="primary">
          发送
        </Button>
      </div>
    </div>
  );
};
