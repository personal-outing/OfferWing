import { Alert, Modal, message } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";
// 导入 smoothScrollTo 函数或在文件中定义它
import { formatSeconds, toBottom } from "@/utils";
import Tips from "@/components/MobileMeeting/components/Tips";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CheckCircleTwoTone, EditOutlined } from "@ant-design/icons";
import Operation from "@/components/MobileMeeting/components/Operation";
import store from "@/store";
import { sendLog } from "@/services/meeting";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

let scrollTemp = true;
let remindedCount = Number(localStorage.getItem("remindedCount")) || 0;
const MobileMeeting = (props) => {
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
    onChangeMute,
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
    // onChangeCurTag(tag.tagId)
  };

  // 添加平滑滚动函数
  const smoothScrollToBottom = () => {
    const scrollEle = scrollRef.current;
    if (!scrollEle) return;

    const targetPosition = scrollEle.scrollHeight - scrollEle.clientHeight;
    const startPosition = scrollEle.scrollTop;
    const distance = targetPosition - startPosition;
    const duration = 800; // 滚动持续时间，单位毫秒
    let startTime = null;

    const animateScroll = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeInOutQuad = (progress) =>
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      scrollEle.scrollTop = startPosition + distance * easeInOutQuad(progress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        setToBottomShow(false);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const clickToBottom = () => {
    // 使用平滑滚动替代原来的 toBottom
    smoothScrollToBottom();
    setToBottomShow(false);
  };

  useEffect(() => {
    const scrollEle = scrollRef.current;
    const isBottom =
      scrollEle.scrollTop + scrollEle.clientHeight + 50 >=
      scrollEle.scrollHeight;
    if (isBottom) {
      setTimeout(() => {
        // 使用平滑滚动
        smoothScrollToBottom();
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
            // 使用平滑滚动
            smoothScrollToBottom();
            scrollTemp = true;
          }, 20000);
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
            paddingBottom: "70rpx", // 添加底部内边距，确保内容不被状态栏遮挡
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
                        // 添加对块级数学公式的支持
                        // 添加对块级数学公式的支持
                        p({ node, children }) {
                          // 增强型块级公式检测
                          const checkBlockFormula = (content) => {
                            // 合并所有子节点的文本内容
                            const fullText = React.Children.toArray(content)
                              .map((child) =>
                                typeof child === "string" ? child : ""
                              )
                              .join("")
                              .trim(); // 关键：去除首尾空白

                            return (
                              fullText.startsWith("$$") &&
                              fullText.endsWith("$$")
                            );
                          };

                          if (checkBlockFormula(children)) {
                            const formula = React.Children.toArray(children)
                              .join("")
                              .trim()
                              .slice(2, -2) // 移除首尾的$$
                              .trim(); // 去除公式内容首尾空白

                            return (
                              <div style={{ margin: "1em 0" }}>
                                <BlockMath math={formula} />
                              </div>
                            );
                          }

                          // 处理混合内容（文本 + 行内公式 + 其他元素）
                          const processNode = (child) => {
                            if (typeof child === "string") {
                              const segments = [];
                              let buffer = "";
                              let mathMode = false;

                              for (let i = 0; i < child.length; i++) {
                                if (
                                  child[i] === "$" &&
                                  (i === 0 || child[i - 1] !== "\\")
                                ) {
                                  if (mathMode) {
                                    segments.push(
                                      <InlineMath
                                        key={segments.length}
                                        math={buffer}
                                      />
                                    );
                                    buffer = "";
                                    mathMode = false;
                                  } else {
                                    if (buffer.length > 0)
                                      segments.push(buffer);
                                    buffer = "";
                                    mathMode = true;
                                  }
                                } else {
                                  buffer += child[i];
                                }
                              }

                              if (buffer.length > 0) {
                                segments.push(
                                  mathMode ? (
                                    <InlineMath math={buffer} />
                                  ) : (
                                    buffer
                                  )
                                );
                              }

                              return segments;
                            }
                            return child; // 保留非文本节点
                          };

                          return (
                            <p style={{ margin: "0.5em 0" }}>
                              {React.Children.map(children, (child) =>
                                React.isValidElement(child)
                                  ? child
                                  : processNode(child)
                              )}
                            </p>
                          );
                        },
                        li({ node, children }) {
                          // 处理块级公式（当列表项只有单个公式时）
                          if (
                            React.Children.count(children) === 1 &&
                            typeof children === "string" &&
                            children.startsWith("$$") &&
                            children.endsWith("$$")
                          ) {
                            const formula = children.slice(2, -2);
                            return (
                              <li>
                                <BlockMath math={formula} />
                              </li>
                            );
                          } // 同样的块级公式检测增强
                          const checkBlockFormula = (content) => {
                            const fullText = React.Children.toArray(content)
                              .map((child) =>
                                typeof child === "string" ? child : ""
                              )
                              .join("")
                              .trim();
                            return (
                              fullText.startsWith("$$") &&
                              fullText.endsWith("$$")
                            );
                          };

                          if (checkBlockFormula(children)) {
                            const formula = React.Children.toArray(children)
                              .join("")
                              .trim()
                              .slice(2, -2)
                              .trim();

                            return (
                              <li style={{ listStyle: "none" }}>
                                {" "}
                                {/* 移除列表符号 */}
                                <BlockMath math={formula} />
                              </li>
                            );
                          }

                          // 处理混合内容（文本 + 行内公式 + 其他元素）
                          const processNode = (child) => {
                            if (typeof child === "string") {
                              const segments = [];
                              let buffer = "";
                              let mathMode = false;
                              let escaped = false;

                              for (let i = 0; i < child.length; i++) {
                                if (!escaped && child[i] === "\\") {
                                  escaped = true;
                                  continue;
                                }

                                if (!escaped && child[i] === "$") {
                                  if (mathMode) {
                                    // 结束公式
                                    segments.push(
                                      <InlineMath
                                        key={segments.length}
                                        math={buffer}
                                      />
                                    );
                                    buffer = "";
                                    mathMode = false;
                                  } else {
                                    // 开始公式
                                    if (buffer.length > 0)
                                      segments.push(buffer);
                                    buffer = "";
                                    mathMode = true;
                                  }
                                } else {
                                  if (escaped) {
                                    buffer += "\\";
                                    escaped = false;
                                  }
                                  buffer += child[i];
                                }
                              }

                              // 处理剩余内容
                              if (buffer.length > 0) {
                                if (mathMode) {
                                  segments.push(
                                    <InlineMath
                                      key={segments.length}
                                      math={buffer}
                                    />
                                  );
                                } else {
                                  segments.push(buffer);
                                }
                              }

                              return segments;
                            }
                            return child; // 保留非文本节点
                          };

                          return (
                            <li>
                              {React.Children.map(children, (child) => {
                                // 保留原始 React 元素（如代码块、链接等）
                                if (React.isValidElement(child)) return child;

                                // 处理文本节点
                                const processed = processNode(child);

                                // 处理多段落情况
                                if (Array.isArray(processed)) {
                                  return processed.map((item, index) => (
                                    <React.Fragment key={index}>
                                      {item}
                                    </React.Fragment>
                                  ));
                                }
                                return processed;
                              })}
                            </li>
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
        {toBottomShow && (
          <p className={styles.newQuestion} onClick={clickToBottom}>
            新问题 ↓
          </p>
        )}
      </div>
      <Modal
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
      </Modal>
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
        onChangeMute={onChangeMute}
      />
    </>
  );
};

export default MobileMeeting;
