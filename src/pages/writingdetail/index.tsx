import { useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import { getInterviewDetail, sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { isMobile, toUrl } from "@/utils";
import { message, Select } from "antd";
import { getWrittenDetail } from "@/services/writing";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

function Writingdetail() {
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get("id");
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [isLoading, setIsLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  const [curHistoryIdx, setCurHistoryIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const [enlargedImg, setEnlargedImg] = useState("");

  const realAnswer = useMemo(() => {
    let currentAnswer =
      historyList[curHistoryIdx]?.questionList[0]?.answer || "";
    currentAnswer =
      currentAnswer?.indexOf("open-web-tiku") > -1
        ? currentAnswer.split(";")
        : currentAnswer;
    if (!currentAnswer) {
      return "答案等待中...";
    } else {
      return currentAnswer;
    }
  }, [historyList, curHistoryIdx]);

  const getDetail = async () => {
    setIsLoading(true);
    getWrittenDetail({
      userId: currentUser.username,
      interviewId: interviewId,
    }).then((res) => {
      setIsLoading(false);
      if (res.status) {
        setHistoryList(res.data.array);
      } else {
        message.error(res.message);
      }
    });
  };

  function onChangeSize() {
    if (window.innerHeight < window.innerWidth) {
      setIsMobile(false);
    } else {
      setIsMobile(true);
    }
  }

  useEffect(() => {
    getDetail();
    onChangeSize();
    window.addEventListener("resize", onChangeSize);
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "writingdetail.0.0.0",
      extInfo: JSON.stringify({ interviewId, spmPre, source }),
    });
    document.body.style.overflow = "hidden"; //进入页面时给body添加行类样式 overflow:hidden
    return () => {
      document.body.style.overflow = "visible"; //离开页面时给body还原 overflow 为默认值
    };
  }, []);

  const handleEnlargeImage = (imgUrl: string) => {
    setEnlargedImg(imgUrl);
  };

  const handleCloseEnlarged = () => {
    setEnlargedImg("");
  };

  return (
    <div className={styles.chatContainer}>
      {enlargedImg && (
        <div
          className={styles.enlargedImageOverlay}
          onClick={handleCloseEnlarged}
        >
          <img src={enlargedImg} className={styles.enlargedImage} />
        </div>
      )}
      <p className={styles.backBtn} onClick={() => toUrl("/writinghistory")}>
        返回
      </p>
      {isLoading ? (
        <div className={styles.loading}>加载中...</div>
      ) : isMobile ? (
        <div style={{ padding: "20rpx", overflowY: "auto" }}>
          <h3>题目列表</h3>
          {historyList.length === 0 && <p>暂无问题记录</p>}
          {historyList.map((item, idx) => {
            const questionList = item.questionList || [];
            const imgUrl = item.url.split(",");
            return (
              <div
                key={idx}
                style={{ borderBottom: "1px solid #ccc", paddingTop: "10px" }}
              >
                <p style={{ color: "rgb(255, 153, 0)", fontWeight: "bold" }}>
                  图{idx + 1}
                </p>
                {imgUrl.map((img, idx) => {
                  return (
                    <div key={idx} className={styles.imageContainer}>
                      <img
                        src={img}
                        style={{
                          width: "90%",
                          borderRadius: "10px",
                        }}
                        onClick={() => {
                          setCurHistoryIdx(idx);
                        }}
                      />
                      <button
                        className={styles.enlargeButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnlargeImage(img);
                        }}
                      >
                        放大查看
                      </button>
                    </div>
                  );
                })}
                {questionList?.map((subitem, subIdx) => {
                  return (
                    <div className={styles.writingMiddleBox} key={subIdx}>
                      <div className={styles.writingMiddleLeftItem}>
                        <Markdown
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
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
                          {subitem?.question}
                        </Markdown>
                      </div>
                      <div className={styles.writingMiddleRightItem}>
                        <div
                          key={idx}
                          id="scrollContainer"
                          className={styles.ansContent}
                        >
                          <Markdown
                            components={{
                              code({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    {...props}
                                    wrapLongLines
                                    children={String(children).replace(
                                      /\n$/,
                                      ""
                                    )}
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
                            {subitem?.answer || "答案等待中..."}
                          </Markdown>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className={styles.chatsContainer}>
            {historyList.length === 0 && <p>暂无问题记录</p>}
            <div className={styles.pcQuestionBox}>
              <h3>历史截图</h3>
              {historyList.map((item, idx) => {
                const imgUrl = item.url.split(",");
                return (
                  <p
                    style={{
                      borderRadius: "10px",
                      border: idx === curHistoryIdx ? "1px solid blue" : 0,
                    }}
                    onClick={() => {
                      setCurHistoryIdx(idx);
                    }}
                  >
                    {imgUrl.map((img, idx) => {
                      return (
                        <div key={idx} className={styles.imageContainer}>
                          <img
                            src={img}
                            style={{
                              width: "100rpx",
                            }}
                          />
                          <button
                            className={styles.enlargeButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnlargeImage(img);
                            }}
                          >
                            放大查看
                          </button>
                        </div>
                      );
                    })}
                  </p>
                );
              })}
            </div>
            <div className={styles.pcAnswerBox}>
              <div className={styles.writingMiddle}>
                {Array.isArray(realAnswer) ? (
                  <>
                    <p>
                      为您找到{realAnswer.length - 1}
                      道相似题目，越靠前越相似：
                    </p>
                    <br />
                    {realAnswer.map((item, idx) => {
                      return (
                        <div
                          key={idx}
                          style={{
                            marginBottom: "12px",
                            textAlign: "center",
                          }}
                        >
                          <img
                            src={item}
                            alt=""
                            style={{
                              width: "50%",
                              marginBottom: "10px",
                              border: "1px solid #ddd",
                              borderRadius: "10px",
                            }}
                          />
                        </div>
                      );
                    })}
                  </>
                ) : (
                  historyList[curHistoryIdx]?.questionList?.map((item, idx) => {
                    return (
                      <div
                        className={styles.writingMiddleBox}
                        key={item.orderId}
                      >
                        <div className={styles.writingMiddleLeftItem}>
                          <Markdown
                            components={{
                              code({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    {...props}
                                    wrapLongLines
                                    children={String(children).replace(
                                      /\n$/,
                                      ""
                                    )}
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
                            {item?.question}
                          </Markdown>
                        </div>
                        <div className={styles.writingMiddleRightItem}>
                          <div
                            key={idx}
                            id="scrollContainer"
                            className={styles.ansContent}
                          >
                            <Markdown
                              components={{
                                code({
                                  node,
                                  inline,
                                  className,
                                  children,
                                  ...props
                                }) {
                                  const match = /language-(\w+)/.exec(
                                    className || ""
                                  );
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      {...props}
                                      wrapLongLines
                                      children={String(children).replace(
                                        /\n$/,
                                        ""
                                      )}
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
                                p({ node, children }) {
                                  const text = String(children);
                                  // 检查是否是块级LaTeX公式 (使用 $$ 包裹)
                                  if (
                                    text.startsWith("$$") &&
                                    text.endsWith("$$")
                                  ) {
                                    const formula = text.slice(2, -2);
                                    return (
                                      <BlockMath
                                        math={formula}
                                        style={{
                                          margin: "0.5em 0",
                                          maxWidth: "100%",
                                          overflowX: "auto",
                                        }}
                                      />
                                    );
                                  }
                                  // 检查文本中是否包含行内LaTeX公式 (使用 $ 包裹)
                                  if (text.includes("$")) {
                                    // 改进的分割方法，更准确地匹配行内公式
                                    const parts = [];
                                    let lastIndex = 0;
                                    let inMath = false;
                                    let mathStart = 0;

                                    for (let i = 0; i < text.length; i++) {
                                      if (text[i] === "$") {
                                        if (!inMath) {
                                          // 开始数学公式
                                          if (i > lastIndex) {
                                            parts.push(
                                              text.substring(lastIndex, i)
                                            );
                                          }
                                          mathStart = i;
                                          inMath = true;
                                        } else {
                                          // 结束数学公式
                                          parts.push(
                                            text.substring(mathStart, i + 1)
                                          );
                                          lastIndex = i + 1;
                                          inMath = false;
                                        }
                                      }
                                    }

                                    // 添加剩余文本
                                    if (lastIndex < text.length) {
                                      parts.push(text.substring(lastIndex));
                                    }

                                    return (
                                      <p style={{ margin: "0.5em 0" }}>
                                        {parts.map((part, index) => {
                                          if (
                                            part.startsWith("$") &&
                                            part.endsWith("$")
                                          ) {
                                            const formula = part.slice(1, -1);
                                            return (
                                              <InlineMath
                                                key={index}
                                                math={formula}
                                              />
                                            );
                                          }
                                          return part;
                                        })}
                                      </p>
                                    );
                                  }
                                  return (
                                    <p style={{ margin: "0.5em 0" }}>
                                      {children}
                                    </p>
                                  );
                                },
                                li({ node, children }) {
                                  const text = String(children);
                                  // 检查是否是块级LaTeX公式 (使用 $$ 包裹)
                                  if (
                                    text.startsWith("$$") &&
                                    text.endsWith("$$")
                                  ) {
                                    const formula = text.slice(2, -2);
                                    return <BlockMath math={formula} />;
                                  }
                                  // 检查文本中是否包含行内LaTeX公式 (使用 $ 包裹)
                                  if (text.includes("$")) {
                                    // 使用与 p 组件相同的改进分割方法
                                    const parts = [];
                                    let lastIndex = 0;
                                    let inMath = false;
                                    let mathStart = 0;

                                    for (let i = 0; i < text.length; i++) {
                                      if (text[i] === "$") {
                                        if (!inMath) {
                                          // 开始数学公式
                                          if (i > lastIndex) {
                                            parts.push(
                                              text.substring(lastIndex, i)
                                            );
                                          }
                                          mathStart = i;
                                          inMath = true;
                                        } else {
                                          // 结束数学公式
                                          parts.push(
                                            text.substring(mathStart, i + 1)
                                          );
                                          lastIndex = i + 1;
                                          inMath = false;
                                        }
                                      }
                                    }

                                    // 添加剩余文本
                                    if (lastIndex < text.length) {
                                      parts.push(text.substring(lastIndex));
                                    }

                                    return (
                                      <li>
                                        {parts.map((part, index) => {
                                          if (
                                            part.startsWith("$") &&
                                            part.endsWith("$")
                                          ) {
                                            const formula = part.slice(1, -1);
                                            return (
                                              <InlineMath
                                                key={index}
                                                math={formula}
                                              />
                                            );
                                          }
                                          return part;
                                        })}
                                      </li>
                                    );
                                  }
                                  return <li>{children}</li>;
                                },
                              }}
                            >
                              {realAnswer}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-笔试记录",
  };
});

export default Writingdetail;
