import { Button, Input, Modal, Popover, Switch, Tour, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { copyToClipboard, formatSeconds, isPC, toUrl } from "@/utils";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  CheckCircleTwoTone,
  DownOutlined,
  EditOutlined,
  QuestionCircleTwoTone,
  RedoOutlined,
} from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import store from "@/store";
import FeedbackModal from "../FeedbackModal";
import QuestionItem from "./QuestionItem";
import { useSearchParams } from "@ice/runtime";
import {
  getUserPrompt,
  reportVoiceError,
  sendLog,
  uploadUserPrompt,
} from "@/services/meeting";
import useDebounce from "@/hooks/useDebounce";
import useThrottle from "@/hooks/useThrottle";
import Writing from "@/pages/writing";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

let temp = true;

const Tips = () => {
  return (
    <div
      className={styles.introTextBox}
      style={{
        position: "relative",
      }}
    >
      <p>
        <img
          style={{
            width: "22px",
            marginRight: "4px",
          }}
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E7%BB%84%2036%402x.png?"
          alt=""
        />
        <span style={{ fontWeight: "bold" }}>温馨提示</span>
      </p>
      <p>
        1. 建议使用
        <span style={{ color: "red" }}>Chrome、Safari</span>
        等主流浏览器，不要使用
        <span style={{ color: "red" }}>夸克、qq浏览器</span>
        。如有问题请随时反馈小助理
      </p>
      <p>
        2. 如果超过<span style={{ color: "red" }}>3分钟</span>
        答案还没有生成，请点击
        <span style={{ color: "red" }}>重新开始面试</span>
      </p>
      <p>3. 快捷键操作指南</p>
      <div style={{ padding: "10px" }}>
        <p>s（start）：继续面试</p>
        <p>q（quit）：退出面试</p>
        <p>r（restart）：重新开始面试</p>
        <p>p（pause）：暂停面试</p>
        <p>m（mute）：不识别问题/正常识别问题</p>
        <p>f（fixed）：固定问题/自动滚动</p>
        <p>a（add）：添加最新对话至问题</p>
      </div>
    </div>
  );
};

const PCMeeting = (props) => {
  const {
    realData = [],
    onChangeStatus,
    status = "stop",
    handleSuspend,
    realTalkingData = [],
    addToQuestion,
    interviewId,
    time,
    feedbackShow,
    setFeedbackShow,
    positionid,
    spmPre,
    source,
    tagList,
    handleQuestionMessage,
    onChangeCurTag,
    setCurTag,
    onChangeMute,
    openShare,
    setOpen,
    open,
    dataQueue,
    interruptClk,
  } = props;
  const [searchParams] = useSearchParams();
  const career = searchParams.get("career") || "";
  const [curData, setCurData] = useState({});
  const [curIdx, setCurIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [needAuto, setNeedAuto] = useState(true);
  const [inputText, setInputText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [promptShow, setPromptShow] = useState(false);
  const [appTagIdx, setAppTagIdx] = useState(0);
  const [hasTap, setHasTap] = useState<any>([]);
  const [mute, setMute] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedTips, setIsFixedTips] = useState(false);
  const [openTwo, setOpenTwo] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [writingShow, setWritingShow] = useState(false);
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);

  const steps = [
    {
      title: "点击开始面试",
      description: "面试即刻启动，监听开始",
      target: () => step1Ref.current,
      nextButtonProps: {
        style: { display: "none" },
      },
    },
  ];

  const stepsTwo = [
    {
      title: "面试已开启",
      description: (
        <div style={{ width: "450px" }}>
          <p>
            现在开始，您和面试官的对话将持续被采集，我们只会提取最有效的问题！
          </p>
          {status === "start" ? (
            <>
              <p style={{ fontWeight: "bold" }}>试试问问推荐问题🤔</p>
              <p>请实现一个冒泡排序</p>
              <p>你对AI未来发展的看法</p>
              <p>你为什么选择加入我们公司？</p>
              <p>......</p>
            </>
          ) : (
            <p>问题推荐中</p>
          )}
        </div>
      ),
      nextButtonProps: {
        children: <span>我问完了</span>,
      },
    },
    {
      title: "对话展示区域",
      placement: "left",
      description: "这里会实时记录你和面试官的对话",
      target: () => step2Ref.current,
      nextButtonProps: {
        children: <span>下一步</span>,
      },
      prevButtonProps: {
        style: { display: "none" },
      },
    },
    {
      title: "问题识别区域",
      placement: "right",
      description: "这里会实时提取对话中的有效问题",
      target: () => step3Ref.current,
      nextButtonProps: {
        children: <span>下一步</span>,
      },
      prevButtonProps: {
        style: { display: "none" },
      },
    },
    {
      title: "答案展示区域",
      description: "这里会展示问题答案",
      target: () => step4Ref.current,
      nextButtonProps: {
        children: <span>下一步</span>,
      },
      prevButtonProps: {
        style: { display: "none" },
      },
    },
    {
      title: "切换答案类型",
      description: "不同的答案类型内容会不一样哦，尝试一下！",
      target: () => step5Ref.current,
      nextButtonProps: {
        children: <span>完成</span>,
      },
      prevButtonProps: {
        style: { display: "none" },
      },
    },
    {
      title: "恭喜你完成基础教程🎉",
      description:
        "更多技巧请仔细阅读教程文档。您可继续提问测试，也可以结束本次面试",
      target: null,
      nextButtonProps: {
        children: <span>关闭教程</span>,
      },
      prevButtonProps: {
        style: { display: "none" },
      },
    },
  ];

  const sendText = () => {
    setInputText("");
    addToQuestion(inputText, "input", tagList[appTagIdx].tagId);
  };

  const onChangeTag = (idx, tag) => {
    const tagId = tag.tagId;
    setAppTagIdx(idx);
    setCurTag(tagId);
    if (status !== "start") {
      return;
    }
    if (!curData[tagId]?.answer && !hasTap[idx]) {
      const questionId = curData.questionId;
      const msg = curData.question;
      handleQuestionMessage(tagId, questionId, msg);
      setHasTap((pre) => {
        pre[idx] = 1;
        return pre;
      });
    }
    onChangeCurTag(tagId);
  };

  const reloadInterview = () => {
    onChangeStatus("reload");
  };

  useEffect(() => {
    if (realData.length > 0) {
      let lastIndex = realData.length - 1;
      setDisplayIdx(lastIndex);
      if (needAuto && !isFixed) {
        setCurIdx(lastIndex);
        setCurData(realData[lastIndex]);
      } else {
        setCurData(realData[curIdx]);
      }
      if (realData.length > 3 && temp) {
        setIsFixedTips(true);
        setTimeout(() => {
          setIsFixedTips(false);
        }, 10000);
        temp = false;
      }
    }
  }, [realData, needAuto, isFixed]);

  useEffect(() => {
    if (realData.length > 0) {
      let lastIndex = realData.length - 1;
      const s_l = [0, 0, 0, 0];
      const tagId = tagList[appTagIdx].tagId;
      if (!realData[lastIndex][tagId] && !hasTap[appTagIdx]) {
        handleQuestionMessage(
          tagId,
          realData[lastIndex].questionId,
          realData[lastIndex].question
        );
        s_l[appTagIdx] = 1;
      }
      setHasTap(s_l);
    }
  }, [realData.length]);

  useEffect(() => {
    const container = document.getElementById("scrollContainer");
    if (container) {
      // 检查当前滚动位置是否接近底部（距离底部小于等于50像素）
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        50;

      if (isNearBottom && !isFixed) {
        // 保证在DOM更新后执行滚动操作
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 0);
      }
    }
  }, [curData, isFixed]);

  useEffect(() => {
    if (curIdx === displayIdx) {
      setNeedAuto(true);
    } else {
      setNeedAuto(false);
    }
  }, [displayIdx, curIdx]);

  const onChangeQuestion = (idx) => {
    setCurIdx(idx);
    setCurData(realData[idx]);
    setHasTap([0, 0, 0, 0]);
    if (idx !== displayIdx) {
      setIsFixed(true);
    } else {
      setIsFixed(false);
    }
  };

  const uploadPrompt = () => {
    if (!prompt) {
      setPromptShow(false);
    }
    uploadUserPrompt({
      userId: currentUser.username,
      positionId: positionid,
      prompt,
      terminal: "rt",
    })
      .then((res) => {
        if (res.status) {
          message.success("prompt设置成功!");
        } else {
          message.error(res.message);
        }
        setPromptShow(false);
      })
      .catch((rej) => {
        message.error(rej?.message);
      });
  };

  const queryUsersPrompt = () => {
    getUserPrompt({
      userId: currentUser.username,
      positionId: positionid,
      terminal: "rt",
    })
      .then((res) => {
        if (res.status) {
          setPrompt(res.data);
        } else {
          message.error(res.message);
        }
      })
      .catch((rej) => {
        message.error(rej.message);
      });
  };

  const toReport = (msg) => {
    reportVoiceError({
      userId: currentUser.username,
      interviewId,
      msg,
    }).then((res) => {
      if (res.status) {
        message.info("上报成功");
      }
    });
  };

  const toMute = (status) => {
    setMute(status);
    onChangeMute(status);
  };

  const onChangeFixed = (checked: boolean) => {
    setIsFixed(checked);
    if (!checked) {
      setNeedAuto(true);
    }
  };

  const reloadAnswer = (tagId, questionId, question) => {
    dataQueue.current[curIdx].questionId = curData[tagId].questionId;
    handleQuestionMessage(tagId, questionId, question);
  };

  const handleReport = useDebounce(toReport, 500);
  const handleReload = useThrottle(reloadAnswer, 500);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isFocus || status === "stop") {
        return;
      }
      switch (event.key.toLowerCase()) {
        case "s":
          if (status === "suspend") {
            onChangeStatus("goOn");
          } else {
            onChangeStatus("start");
          }
          break;
        case "q":
          onChangeStatus("over");
          break;
        case "r":
          reloadInterview();
          break;
        case "p":
          if (status === "start") {
            handleSuspend();
          }
          break;
        case "m":
          toMute(!mute);
          break;
        case "f":
          onChangeFixed(!isFixed);
          break;
        case "a":
          addToQuestion(realTalkingData[0]?.message);
          break;
        default:
          break;
      }
    };

    window.removeEventListener("keydown", handleKeyPress);
    // 添加键盘事件监听器
    window.addEventListener("keydown", handleKeyPress);

    // 在组件卸载时移除监听器
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isFocus, isFixed, mute, status, realTalkingData]);

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "meeting.pc.0.0",
      extInfo: JSON.stringify({ positionid, spmPre, source }),
    });
    queryUsersPrompt();
  }, []);

  return (
    <div className={styles.pcContainer}>
      <div className={styles.pcQuestionContainer}>
        <div
          ref={step3Ref}
          className={styles.pcQuestionBox}
          style={{ opacity: mute ? 0.5 : 1 }}
        >
          <div>
            <p id="hiddenEle" className={styles.hiddenP} />
            {status === "stop" ? (
              <p style={{ textAlign: "center", marginTop: "40vh" }}>
                这里是问题识别列表
              </p>
            ) : realData.length > 0 ? (
              realData.map((item, idx) => {
                return (
                  <QuestionItem
                    key={item.questionId}
                    item={item}
                    displayIdx={displayIdx}
                    idx={idx}
                    curIdx={curIdx}
                    onChangeQuestion={() => onChangeQuestion(idx)}
                  />
                );
              })
            ) : (
              <div style={{ paddingLeft: "6rpx" }}>
                <div>
                  当前没识别到有效问题
                  <Popover
                    content={
                      <div>
                        <p>
                          以下对话会被提取：疑问句、祈使句，如"请你说一下
                          xxx"，"你知道 xxx 吗"
                        </p>
                        <p>
                          以下对话不会被提取：与本场面试无关的闲聊、语气词等"
                        </p>
                      </div>
                    }
                    title="规则"
                  >
                    <QuestionCircleTwoTone style={{ marginLeft: "3px" }} />
                  </Popover>
                </div>
                <p>持续监听中.....</p>
              </div>
            )}
          </div>
        </div>
        <div className={styles.topDealBtnBox}>
          <span
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "8rpx",
            }}
            onClick={() => {
              Modal.info({
                content: <Tips />,
                maskClosable: true,
              });
            }}
          >
            帮助中心
          </span>
          <div>
            <Popover
              open={fixedTips}
              onOpenChange={(visible) => {
                setIsFixedTips(visible);
              }}
              content={
                <div>
                  <p>
                    您可选择固定答案取消问题自动滚动，保持当前问题，以免对您造成干扰
                  </p>
                </div>
              }
              title="说明"
            >
              <span
                style={{
                  fontSize: "8rpx",
                }}
              >
                固定答案&nbsp;
              </span>
            </Popover>
            <Switch checked={isFixed} onChange={onChangeFixed} />
          </div>
        </div>
      </div>
      <div className={styles.pcAnswerContainer}>
        <div ref={step4Ref} className={styles.pcAnswerBox}>
          <p className={styles.pcAnswerBack}>答案展示区域</p>
          <div>
            <div className={styles.topBanner}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div ref={step5Ref} className={styles.tagsBox}>
                  {tagList.map((item, idx) => {
                    return (
                      <p
                        onClick={() => onChangeTag(idx, item)}
                        key={idx}
                        className={idx === appTagIdx ? styles.tagsActive : ""}
                      >
                        {item.tagName}
                      </p>
                    );
                  })}
                </div>
                <div>
                  <span style={{ fontSize: "8rpx" }}>
                    岗位：{decodeURIComponent(career)} &nbsp;
                  </span>
                  <img
                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
                    alt="logo"
                    style={{ height: "20rpx", maxHeight: "30px" }}
                  />
                </div>
              </div>
            </div>
            <>
              {realData[curIdx]?.question ? (
                <p className={styles.curQuestion}>
                  问题：{realData[curIdx]?.question}
                </p>
              ) : null}
              {curData.pqQueryResult?.length > 0 && (
                <div
                  style={{
                    height: showQ ? "auto" : "20rpx",
                  }}
                  className={styles.referenceCon}
                >
                  <div className={styles.referenceBox}>
                    <CheckCircleTwoTone />
                    &nbsp; 已参考自定义问答{curData.pqQueryResult?.length}
                    条&nbsp;
                    <DownOutlined
                      onClick={() => setShowQ(!showQ)}
                      style={{
                        color: "#000",
                        width: "10px",
                        cursor: "pointer",
                        transform: showQ ? "rotateX(180deg)" : "none",
                      }}
                    />
                  </div>
                  {curData.pqQueryResult?.map((item, idx) => {
                    return <p key={idx}>{item.fields?.question}</p>;
                  })}
                </div>
              )}
            </>
            {status === "stop" && <Tips />}
          </div>
          {tagList.map((item, idx) => {
            return (
              status != "stop" && (
                <div
                  key={item.tagId}
                  id="scrollContainer"
                  className={styles.ansContent}
                  style={{
                    opacity: curData[item.tagId]?.isInterrupt ? 0.4 : 1,
                    display: idx === appTagIdx ? "block" : "none",
                  }}
                >
                  <Markdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeContent = String(children).replace(/\n$/, ""); // 获取代码内容

                        const copyCode = () => {
                          copyToClipboard(codeContent);
                        };

                        return !inline && match ? (
                          <div style={{ position: "relative" }}>
                            <SyntaxHighlighter
                              {...props}
                              wrapLongLines
                              children={String(children).replace(/\n$/, "")}
                              style={codeStyle}
                              language={match[1]}
                              PreTag="div"
                            />
                            <button
                              onClick={copyCode}
                              style={{
                                position: "absolute",
                                right: 10,
                                top: 10,
                                backgroundColor: "#f0f0f0",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              复制代码
                            </button>
                          </div>
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        );
                      },
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
                            fullText.startsWith("$$") && fullText.endsWith("$$")
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
                                  if (buffer.length > 0) segments.push(buffer);
                                  buffer = "";
                                  mathMode = true;
                                }
                              } else {
                                buffer += child[i];
                              }
                            }

                            if (buffer.length > 0) {
                              segments.push(
                                mathMode ? <InlineMath math={buffer} /> : buffer
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
                            fullText.startsWith("$$") && fullText.endsWith("$$")
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
                                  if (buffer.length > 0) segments.push(buffer);
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
                    {curData[item.tagId]?.answer || "答案等待中..."}
                  </Markdown>
                  {status === "start" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(67,111,246)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          handleReload(
                            item.tagId,
                            curData[item.tagId]?.questionId,
                            curData[item.tagId]?.question
                          );
                        }}
                      >
                        <RedoOutlined />
                        重新生成&nbsp;
                        {!curData[item.tagId]?.finished &&
                        !curData[item.tagId]?.isInterrupt ? (
                          <EditOutlined />
                        ) : (
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                        )}
                      </div>
                      <div
                        style={{
                          color: "#ff4d4f",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          interruptClk(
                            realData[curIdx][tagList[appTagIdx].tagId][
                              "questionId"
                            ],
                            tagList[appTagIdx].tagId
                          );
                        }}
                      >
                        <svg
                          viewBox="64 64 896 896"
                          focusable="false"
                          data-icon="stop"
                          width="1em"
                          height="1em"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                          <path d="M512 326c-101.4 0-184 82.6-184 184s82.6 184 184 184 184-82.6 184-184-82.6-184-184-184z"></path>
                        </svg>
                        <span style={{ marginLeft: "5px" }}>打断生成</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            );
          })}
          <div className={styles.inputBox}>
            <Input
              placeholder="每5秒您只能发送一个自定义问题，输入完问题后可以使用回车直接发送"
              value={inputText}
              className={styles.inputItem}
              onChange={(e) => setInputText(e.target.value)}
              onPressEnter={sendText}
              onFocus={() => {
                setIsFocus(true);
              }}
              onBlur={(e) => {
                // 添加延时确保onBlur在其他事件之后执行
                setTimeout(() => {
                  setIsFocus(false);
                }, 200);
              }}
            />
            <Button
              onClick={sendText}
              className={styles.inputBtn}
              type="primary"
            >
              发送
            </Button>
            <Button
              className={styles.inputBtn}
              onClick={() => {
                setPromptShow(true);
                setIsFocus(true);
              }}
            >
              自定义答案要求
            </Button>
            &nbsp;
            <Button
              className={styles.inputBtn}
              style={{
                background: "rgb(237,115,46)",
                color: "#fff",
              }}
              onClick={() => setWritingShow(true)}
            >
              笔试协助
            </Button>
          </div>
        </div>
        <div className={styles.pcAnswerDeal}>
          {status === "stop" || status === "over" ? (
            <div className={styles.startBtnBox}>
              <Button
                ref={step1Ref}
                onClick={() => {
                  if (open) {
                    setOpenTwo(true);
                    setOpen(false);
                  }
                  onChangeStatus("start");
                }}
                type="primary"
                className={styles.startBtn}
              >
                开始面试
              </Button>
              <Button
                onClick={() => toUrl("/meetingtask")}
                className={styles.startBtn}
              >
                返回准备
              </Button>
            </div>
          ) : (
            <div className={styles.meetingBtnBox}>
              <div>
                {status === "start" && (
                  <span>面试中，已开始{formatSeconds(time)}</span>
                )}
                {status === "suspend" && <span>面试已暂停</span>}
                <Button
                  type="primary"
                  className={styles.meetingBtn}
                  style={{ background: "red", border: 0 }}
                  onClick={() => {
                    onChangeStatus("over");
                  }}
                >
                  结束面试
                </Button>
              </div>
              <div style={{ whiteSpace: "nowrap" }}>
                {status === "suspend" ? (
                  <Button
                    className={styles.meetingBtn}
                    type="primary"
                    onClick={() => onChangeStatus("goOn")}
                  >
                    继续
                  </Button>
                ) : (
                  <Button
                    className={styles.meetingBtn}
                    disabled={currentUser.remain <= 0}
                    onClick={handleSuspend}
                  >
                    暂停
                  </Button>
                )}
                <Button
                  onClick={reloadInterview}
                  style={{ background: "orange", color: "#fff" }}
                >
                  重新开始面试
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div ref={step2Ref} className={styles.pcTalkingContainer}>
        {status === "start" && isPC() && (
          <p style={{ marginTop: "5px", fontSize: "8rpx", color: "#999" }}>
            {openShare
              ? "你正在共享网页音频，通过麦克风传入的音频可能识别有误"
              : "你正在使用系统音频，其他网页音频无法接收"}
          </p>
        )}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {realTalkingData.length > 0 ? (
            realTalkingData.map((item, idx) => {
              const { message = "", traceId = "" } = item;
              return (
                <div
                  className={styles.talkingBoxItem}
                  key={traceId}
                  style={{
                    fontSize: idx === 0 ? "15px" : "14px",
                    color: idx === 0 ? "#222" : "#aaa",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>发言人：</span>
                  {message}&nbsp;&nbsp;
                  <div
                    style={{
                      marginTop: "5px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      style={{
                        color: "#F39555",
                        width: "70px",
                        fontSize: "7rpx",
                      }}
                      onClick={() => {
                        setIsFixed(false);
                        addToQuestion(message);
                      }}
                    >
                      添加问题
                    </Button>
                    &nbsp;
                    <a
                      className={styles.reportError}
                      onClick={() => handleReport(message)}
                    >
                      识别不准？一键上报
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", marginTop: "45vh" }}>
              这里是语音对话展示区域
            </p>
          )}
        </div>
        <div>
          <div className={styles.talkingPeopleBox}>
            <div
              onClick={() => toMute(false)}
              className={styles.talkingPeople}
              style={{
                borderColor: !mute ? "#F39555" : "#ddd",
              }}
            >
              <p className={styles.modelName}>自动识别</p>
              <p
                className={styles.modelDesc}
                style={{ color: mute ? "#ddd" : "#F39555" }}
              >
                对话会被自动识别为问题
              </p>
            </div>
            <div
              onClick={() => toMute(true)}
              className={styles.talkingPeople}
              style={{
                borderColor: !mute ? "#ddd" : "#F39555",
              }}
            >
              <p className={styles.modelName}>手动识别</p>
              <p
                className={styles.modelDesc}
                style={{ color: !mute ? "#ddd" : "#F39555" }}
              >
                关闭自动识别，您需要手动添加问题
              </p>
            </div>
          </div>
        </div>
      </div>
      <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
      <Tour open={openTwo} onClose={() => setOpenTwo(false)} steps={stepsTwo} />
      <FeedbackModal
        interviewid={interviewId}
        username={currentUser.username}
        show={feedbackShow}
        onClose={() => setFeedbackShow(false)}
      />
      <Modal
        open={writingShow}
        footer={null}
        width="100vw"
        style={{
          top: 0,
          paddingBottom: 0,
          maxWidth: "100vw",
        }}
        styles={{
          content: {
            height: "100vh",
            padding: 0,
            overflow: "hidden",
          },
          body: {
            height: "100vh",
            padding: 0,
            overflow: "hidden",
          },
        }}
        mask={false}
        maskClosable={false}
        onCancel={() => setWritingShow(false)}
        modalRender={(modal) => (
          <div style={{ width: "100vw", height: "100vh" }}>{modal}</div>
        )}
      >
        <Writing setWritingShow={setWritingShow} isMeeting={true} />
      </Modal>
      <Modal
        title="填写您的自定义prompt"
        open={promptShow}
        onCancel={() => setPromptShow(false)}
        onOk={uploadPrompt}
        okText="确定"
        cancelText="取消"
      >
        <Input.TextArea
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          value={prompt}
          maxLength={500}
          showCount={true}
          placeholder="自定义要求不超过500字，比如：请使用英文回答"
          style={{ marginBottom: "10px" }}
        />
      </Modal>
    </div>
  );
};

export default PCMeeting;
