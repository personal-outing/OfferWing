import { Button, Input, Modal, Tabs, message } from "antd";
import { useEffect, useState } from "react";
import styles from "./index.module.css";
import { formatSeconds, toUrl } from "@/utils";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CheckCircleTwoTone, EditOutlined } from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import store from "@/store";
import QuestionItem from "./QuestionItem";
import { useSearchParams } from "@ice/runtime";
import { sendLog } from "@/services/meeting";

const FreePCMeeting = (props) => {
  const {
    realData = [],
    interruptClk,
    onChangeStatus,
    status = "stop",
    handleSuspend,
    realTalkingData = [],
    addToQuestion,
    time,
    positionid,
    spmPre,
    source,
    tagList,
    handleQuestionMessage,
    setAppTagIdx,
    appTagIdx,
  } = props;
  const [curData, setCurData] = useState({});
  const [curIdx, setCurIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [needAuto, setNeedAuto] = useState(true);
  const [inputText, setInputText] = useState("");
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  const sendText = () => {
    setInputText("");
    addToQuestion(inputText, "input");
  };

  const onChangeTag = (idx, tag) => {
    if (status !== "start") {
      message.warning("面试尚未开始");
      return;
    }
    setAppTagIdx((pre) => {
      const newData = [...pre];
      newData[curIdx] = idx;
      return newData;
    });
    if (!curData[tag.tagId]) {
      const questionId = curData.questionId;
      const msg = curData.question;
      const tagId = tag.tagId;
      handleQuestionMessage(tagId, questionId, msg);
    }
  };

  useEffect(() => {
    if (realData.length > 0) {
      let lastIndex = realData.length - 1;
      setDisplayIdx(lastIndex);
      if (needAuto) {
        setCurIdx(lastIndex);
        setCurData(realData[lastIndex]);
      }
    }
  }, [realData, needAuto]);

  useEffect(() => {
    let lastIndex = realData.length - 1;
    if (needAuto && lastIndex !== curIdx) {
      setAppTagIdx((pre) => {
        const newData = [...pre];
        newData[lastIndex] = 0;
        return newData;
      });
    }
  }, [realData.length, needAuto]);

  useEffect(() => {
    const container = document.getElementById("talkingContainer");
    if (container) {
      // 保证在DOM更新后执行滚动操作
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
    }
  }, [realTalkingData]);

  useEffect(() => {
    const container = document.getElementById("scrollContainer");
    if (container) {
      // 检查当前滚动位置是否接近底部（距离底部小于等于50像素）
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        50;

      if (isNearBottom) {
        // 保证在DOM更新后执行滚动操作
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 0);
      }
    }
  }, [curData]);

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
  };

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "meeting.pc.0.0",
      extInfo: JSON.stringify({ positionid, spmPre, source }),
    });
  }, []);

  return (
    <div className={styles.pcContainer}>
      <div className={styles.pcQuestionContainer}>
        <div className={styles.pcQuestionBox}>
          {status === "stop" ? (
            <p style={{ textAlign: "center", marginTop: "40vh" }}>
              这里是问题识别列表
              <br />
              当前面试未开始
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
            <p style={{ paddingLeft: "6rpx" }}>
              当前没识别到有效问题，持续监听中...
            </p>
          )}
          <p id="hiddenEle" className={styles.hiddenP} />
        </div>
        <div className={styles.topDealBtnBox}>
          {status === "start" && curIdx !== displayIdx ? (
            <Button
              onClick={() => setNeedAuto(true)}
              className={styles.topDealBtn}
              type="primary"
            >
              回到最新
            </Button>
          ) : (
            <span style={{ fontSize: "10rpx" }}>您正在试用</span>
          )}
        </div>
      </div>
      <div className={styles.pcAnswerContainer}>
        <div className={styles.pcAnswerBox}>
          <p className={styles.pcAnswerBack}>答案展示区域</p>
          <div>
            <div>
              {(status === "over" || status === "stop") && (
                <div className={styles.welcomeBox}>
                  <img
                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
                    alt="logo"
                    style={{ height: "45rpx", maxHeight: "45px" }}
                  />
                  {status === "over"
                    ? "温馨提示：面试已结束，您可在面试记录页进行面试复盘"
                    : "时刻为您保驾护航，面试尚未开始，请不要紧张，加油！"}
                </div>
              )}
              {realData[curIdx]?.question ? (
                <p className={styles.curQuestion}>
                  问题：{realData[curIdx]?.question}
                </p>
              ) : null}
            </div>
            <div className={styles.tagsBox}>
              {tagList.map((item, idx) => {
                const curIndex = appTagIdx[curIdx] || 0;
                return (
                  <p
                    onClick={() => onChangeTag(idx, item)}
                    key={idx}
                    className={idx === curIndex ? styles.tagsActive : ""}
                  >
                    {item.tagName}
                  </p>
                );
              })}
            </div>
          </div>
          {tagList.map((item, idx) => {
            return (
              (curData[item.tagId] || appTagIdx[curIdx] !== 0) && (
                <div
                  key={item.tagId}
                  id="scrollContainer"
                  className={styles.ansContent}
                  style={{
                    opacity: curData[item.tagId]?.isInterrupt ? 0.4 : 1,
                    display: idx === appTagIdx[curIdx] ? "block" : "none",
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
                    {curData[item.tagId]?.answer || "答案等待中..."}
                  </Markdown>
                  {!curData[item.tagId]?.finished &&
                  !curData[item.tagId]?.isInterrupt ? (
                    <EditOutlined />
                  ) : (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
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
            />
            <Button
              onClick={sendText}
              className={styles.inputBtn}
              type="primary"
            >
              发送
            </Button>
          </div>
        </div>
        <div className={styles.pcAnswerDeal}>
          {status === "stop" || status === "over" ? (
            <div className={styles.startBtnBox}>
              {status === "stop" ? (
                <Button
                  onClick={() => onChangeStatus("start")}
                  type="primary"
                  className={styles.startBtn}
                >
                  开始面试
                </Button>
              ) : (
                <Button
                  onClick={() => toUrl("/login", "", true)}
                  type="primary"
                  className={styles.startBtn}
                >
                  继续使用
                </Button>
              )}
              <Button
                onClick={() => toUrl("/", "", true)}
                className={styles.startBtn}
              >
                返回首页
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
              <div>
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
              </div>
            </div>
          )}
        </div>
      </div>
      <div id="talkingContainer" className={styles.pcTalkingContainer}>
        {realTalkingData.length > 0 ? (
          realTalkingData.map((item, idx) => {
            const { message = "", traceId = "" } = item;
            return (
              <div className={styles.talkingBoxItem} key={traceId}>
                <span style={{ fontWeight: "bold" }}>发言人：</span>
                {message}&nbsp;&nbsp;
                <a
                  className={styles.toQuestion}
                  onClick={() => addToQuestion(message)}
                >
                  添加至问题
                </a>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", marginTop: "45vh" }}>
            这里是语音对话展示区域
          </p>
        )}
      </div>
    </div>
  );
};

export default FreePCMeeting;
