import { Alert, Modal, message } from "antd";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { formatSeconds, toBottom } from "@/utils";
import Tips from "./components/Tips";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CheckCircleTwoTone, EditOutlined } from "@ant-design/icons";
import Operation from './components/Operation';
import store from "@/store";
import { sendLog } from "@/services/meeting";

let scrollTemp = true;
let remindedCount = Number(localStorage.getItem("remindedCount")) || 0;
const FreeMobileMeeting = (props) => {
  const {
    realData,
    interruptClk,
    onChangeStatus,
    status,
    handleSuspend,
    realTalkingData,
    addToQuestion,
    time,
    positionid,
    spmPre,
    source,
    tagList,
    handleQuestionMessage,
  } = props;
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const [toBottomShow, setToBottomShow] = useState(false);
  const [show, setShow] = useState(remindedCount != 2);
  let scrollRef: any = useRef(null);
  let mainRef: any = useRef(null);

  const onChangeTag = (item, tag, questionId) => {
    if (status !== "start") {
      message.warning("面试尚未开始");
      return;
    }
    if (!item[tag.tagId]) {
      const msg = item.question;
      const tagId = tag.tagId;
      handleQuestionMessage(tagId, questionId, msg);
      toBottom();
    }
  };

  const clickToBottom = () => {
    toBottom();
    setToBottomShow(false);
  };

  useEffect(() => {
    const scrollEle = scrollRef.current;
    const isBottom =
      scrollEle.scrollTop + scrollEle.clientHeight + 50 >=
      scrollEle.scrollHeight;
    if (isBottom) {
      setTimeout(() => {
        toBottom();
        setToBottomShow(false);
      }, 300);
    }
  }, [realData]);

  useEffect(() => {
    if (realData.length > 0) {
      const ele = scrollRef.current;
      const isBottom =
        ele.scrollTop + ele.clientHeight + 50 >= ele.scrollHeight;
      if (!isBottom) {
        setToBottomShow(true);
        if (scrollTemp) {
          scrollTemp = false;
          setTimeout(() => {
            toBottom();
            setToBottomShow(false);
            scrollTemp = true;
          }, 5000);
        }
      } else {
        setToBottomShow(false);
      }
    }
  }, [realData.length]);

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "meeting.mobile.0.0",
      extInfo: JSON.stringify({ positionid, spmPre, source }),
    });
  }, []);

  return (
    <>
      {status === "start" && realData.length === 0 && (
        <Alert
          className={styles.alertBox}
          message="当前没有识别到有效问题，持续监听中"
          type="info"
        />
      )}
      <div ref={mainRef} className={styles.chatBox}>
        <div
          className={styles.tipsBox}
          style={{
            display:
              status === "stop" && realData.length === 0 ? "block" : "none",
          }}
        >
          <Tips />
        </div>
        <div
          style={{
            display:
              status === "stop" && realData.length === 0 ? "none" : "block",
          }}
          ref={scrollRef}
          className={styles.chatsContainer}
        >
          {realData.map((item) => {
            const curTag = item.tagId || "normal";
            const data = item[curTag] || {};
            const { answer = "", questionId = "", finished = false } = data;
            return (
              <div key={`${questionId}-${Date.now()}`}>
                <div className={styles.talkContainer}>
                  <div
                    className={styles.head}
                    style={{ backgroundColor: "#fd9f32" }}
                  >
                    问
                  </div>
                  <div
                    className={styles.content}
                    style={{
                      order: 0,
                      textIndent: 0,
                      opacity: item.isInterrupt ? 0.4 : 1,
                    }}
                  >
                    <p style={{ marginBottom: 0 }}>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "black",
                        }}
                      >
                        {item.question}
                      </span>
                    </p>
                  </div>
                </div>
                <div className={styles.tagsBox}>
                  {tagList.map((tagItem, idx) => {
                    return (
                      <p
                        onClick={() =>
                          onChangeTag(item, tagItem, item.questionId)
                        }
                        key={idx}
                        className={
                          tagItem.tagId === curTag ? styles.tagsActive : ""
                        }
                      >
                        {tagItem.tagName}
                      </p>
                    );
                  })}
                </div>
                <div className={styles.talkContainer}>
                  <div
                    className={styles.head}
                    style={{ backgroundColor: "#1d9bfb" }}
                  >
                    AI
                  </div>
                  <div
                    className={styles.ansContent}
                    style={{
                      order: -1,
                      opacity: item.isInterrupt ? 0.4 : 1,
                    }}
                  >
                    <Markdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              {...props}
                              wrapLongLines
                              children={String(children).replace(/\n$/, "")}
                              style={codeStyle}
                              language={match[1]}
                              PreTag="div"
                            />
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {answer || "答案等待中..."}
                    </Markdown>
                    {!finished && !item.isInterrupt ? (
                      <EditOutlined />
                    ) : (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <p id="hiddenEle" className={styles.hiddenP} />
        </div>
        <div className={styles.status}>
          {toBottomShow && (
            <p className={styles.newQuestion} onClick={clickToBottom}>
              新问题 ↓
            </p>
          )}
          {status === "start" && (
            <>
              <img
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/loading.gif"
                alt=""
              />
              <span>面试中，已开始{formatSeconds(time)}</span>
              <img
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/loading.gif"
                alt=""
              />
            </>
          )}
          {status === "suspend" && <span>面试已暂停</span>}
          {status === "stop" && <span>面试未开始</span>}
          {status === "over" && <span>面试已结束</span>}
        </div>
      </div>
      {/* <Modal
        open={show}
        footer={null}
        width={300}
        maskClosable={true}
        onCancel={() => {
          localStorage.setItem("remindedCount", String(remindedCount + 1));
          setShow(false);
        }}
        maskStyle={{ background: "#0000005" }}
      >
        <div className={styles.displayWarn}>
          <img
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/pc.png"
            alt=""
            style={{ width: 200 }}
          />
          <p>关闭手机方向锁定</p>
          <p>
            <b>横屏</b>体验效果更佳{" "}
            <img
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E6%A8%AA%E5%B1%8F.png"
              alt=""
              style={{ width: "30px" }}
            />
          </p>
          <p>
            <b>开启网页全屏</b>展示答案更清晰
          </p>
        </div>
      </Modal> */}
      <Operation
        currentUser={currentUser}
        onInterrupt={interruptClk}
        onChangeStatus={onChangeStatus}
        status={status}
        handleSuspend={handleSuspend}
        talkingList={realTalkingData}
        addToQuestion={addToQuestion}
        realData={realData}
        positionId={positionid}
      />
    </>
  );
};

export default FreeMobileMeeting;
