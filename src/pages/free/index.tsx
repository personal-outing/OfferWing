import { useEffect, useRef, useState } from "react";
import { Cascader, Modal, Popover, Select, message } from "antd";
import { toUrl } from "@/utils";
import { recStart, recStop } from "@/utils/recorderUtils/realTimeRecorder";
import { useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import {
  getAllCareers,
  getInterviewModeTags,
  launchInterview,
  sendLog,
} from "@/services/meeting";
import useThrottle from "@/hooks/useThrottle";
import store from "@/store";
import styles from "./index.module.css";
import { InfoCircleTwoTone } from "@ant-design/icons";
import FreeMobileMeeting from "./components/FreeMobileMeeting";
import FreePCMeeting from "./components/FreePCMeeting";

let wss: WebSocket | null;
let reloadTemp: boolean = false;
let scrollTemp = true;
// const isPre = new URL(window.location.href).searchParams.has("_debugMode_");
const isPre =
  window.location.href.indexOf("pre.") > -1 ||
  new URL(window.location.href).searchParams.has("_debugMode_");

function Meeting() {
  const [searchParams] = useSearchParams();
  const positionid = searchParams.get("positionid");
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const mock = searchParams.get("mock") || false;
  let boost = searchParams.get("boost") || 0;
  let tempId = localStorage.getItem("tempId") || "";
  const [status, setStatus] = useState("stop");
  const [realData, setRealData] = useState([] as any);
  const [realTalkingData, setRealTalkingData] = useState([] as any);
  const [interviewId, setInterviewId] = useState("");
  const [time, setTime] = useState(0);
  const [feedbackShow, setFeedbackShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tagList, setTagList] = useState([]);
  const [appTagIdx, setAppTagIdx] = useState<any>([]);
  const [optionsList, setOptionsList] = useState([]);
  const [careerList, setCareerList] = useState([]);
  const [career, setCareer] = useState("");
  const [isShow, setIsShow] = useState(true);
  const [userState, userDispatcher] = store.useModel("user");
  const { currentUser } = userState;
  const [payState] = store.useModel("pay");
  const { price } = payState;
  let timer: any = useRef(null);
  let logTimer: any = useRef(null);
  let curTime: any = useRef(-1);
  let dataQueue: any = useRef([]);
  let talkingQueue: any = useRef([]);
  let reloadTimer: any = useRef(null);

  const over = () => {
    Modal.confirm({
      content: "试用已结束，注册登录即可领取7.5元红包接着用！",
      okText: "继续使用",
      cancelText: "再看看",
      onOk: () => {
        toUrl("/login", "", true);
      },
      onCancel: () => {
        finishInterview();
      },
    });
  };

  const timePlus = () => {
    curTime.current += 1;
    if (curTime.current > 30) {
      wss?.close();
      over();
      return;
    }
    setTime(curTime.current);
    timer.current = setTimeout(() => {
      timePlus();
    }, 1000);
  };

  const readyProcess = () => {
    clearInterval(reloadTimer.current);
    setStatus("start");
    timePlus();
  };

  const handleNormalMsg = (curMsg: any = {}) => {
    let temp = true;
    const curData = dataQueue.current?.map((item) => {
      if (item.questionId === curMsg.questionId) {
        curMsg[curMsg.modeTagId] = { ...curMsg };
        curMsg["tagId"] = curMsg.modeTagId;
        item = curMsg;
        temp = false;
      }
      return item;
    });
    if (temp) {
      curMsg[curMsg.modeTagId] = { ...curMsg };
      curMsg["tagId"] = curMsg.modeTagId;
      curData.push(curMsg);
    }
    dataQueue.current = curData;
    setRealData(dataQueue.current);
  };

  const handleTaglMsg = (curMsg: any = {}) => {
    const curData = dataQueue.current?.map((item) => {
      if (item.questionId === curMsg.oriQuestionId) {
        item[curMsg.modeTagId] = curMsg;
        item.finished = curMsg.finished;
      }
      return item;
    });
    dataQueue.current = curData;
    setRealData(dataQueue.current);
  };

  const handleTalkingMsg = (curMsg: any = {}) => {
    for (let key in curMsg) {
      let temp = true;
      let curData = talkingQueue.current.map((item) => {
        if (item.traceId === curMsg[key].traceId) {
          item = curMsg[key];
          temp = false;
        }
        return item;
      });
      if (temp) {
        curData.push(curMsg[key]);
      }
      talkingQueue.current = curData;
    }
    setRealTalkingData(talkingQueue.current);
  };

  const sendError = (id = interviewId, reason = {}) => {
    sendLog({
      type: "error",
      uid: tempId,
      spm: "meeting.ws.error.0",
      extInfo: JSON.stringify({
        interviewId: id,
        error: JSON.stringify(reason),
      }),
    });
  };

  const reConnect = () => {
    suspendInterview();
    if (!reloadTemp) {
      reloadTemp = true;
      Modal.confirm({
        content: "网络连接错误，检查后请刷新页面",
        onOk() {
          message
            .open({
              key: "reconnect",
              type: "loading",
              content: "网络错误，正在重连...",
              duration: 1,
            })
            .then(() => {
              reloadTemp = false;
              startRecord(interviewId);
            });
        },
        onCancel() {
          reloadTemp = false;
        },
        okText: "刷新重试",
        cancelText: "取消",
      });
    }
  };

  const judgeAuth = (successFn) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        successFn();
        // 如果成功获取到媒体流，表示权限已授予
        console.log("Microphone access granted.");

        // 停止获取到的媒体流
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((error) => {
        if (error.name === "NotAllowedError") {
          // 用户拒绝了权限请求
          message.warning("请先打开麦克风权限！");
          console.log("Microphone access denied.");
        } else if (error.name === "NotFoundError") {
          // 没有找到麦克风设备
          console.log("No microphone found.");
          message.warning("请先连接麦克风");
        } else {
          // 其他错误
          console.log("Error accessing microphone: ", error);
          message.warning("请先打开麦克风权限！");
        }
      });
  };

  const startRecord = (id) => {
    wss = new WebSocket(
      isPre
        ? "wss://pre-api.interviewdogs.com/interview/ws"
        : "wss://api.offerwing.cn/interview/ws"
    );
    wss.onopen = function (event) {
      wss?.send(
        JSON.stringify({
          msgName: "init",
          isQt: 1,
          interviewid: id,
          positionid: career,
          boost: Number(boost),
          mock: !!mock,
          userid: tempId,
        })
      );
      message.info("面试启动中");
    };
    wss.onmessage = function (event) {
      const curMsg = JSON.parse(event.data);
      const { status, type, data } = curMsg;
      if (status) {
        // 连接正式成功
        if (type === "init") {
          wss?.send(
            JSON.stringify({
              msgName: "status",
              interviewid: id,
            })
          );
        }
        if (type === "status") {
          readyProcess();
          message.info("面试正式开始");
          recStart(wss);
        }
        // 问题&答案
        if (type === "qAndA") {
          if (isMobile) {
            handleNormalMsg(data);
          } else {
            if (data.modeTagId && data.modeTagId !== "normal") {
              handleTaglMsg(data);
            } else {
              handleNormalMsg(data);
            }
          }
        }

        if (type === "VoiceMessage") {
          handleTalkingMsg(data);
        }

        // 错误
        if (type === "error") {
          sendError(id, {
            reason: data,
            type,
          });
          message.warning("网络传输错误，请检查网络连接");
        }

        // 试用结束
        if (type === "systemStop") {
          wss?.close();
          over();
        }
      } else {
        if (data) {
          sendError(id, {
            reason: data,
            type,
          });
          message.warning(data);
        }
        if (type === "status") {
          wss?.send(
            JSON.stringify({
              msgName: "status",
              interviewid: id,
            })
          );
        }
      }
    };
    wss.onclose = function (event) {
      if (event.code != 1000 && event.code != 1005) {
        sendError(id, {
          reason: event.reason,
          code: event.code,
        });
        reConnect();
      } else {
        console.log("连接已关闭");
        recStop(wss);
      }
    };
    wss.onerror = function (err) {
      console.log("连接中断，发生错误", err);
      sendError(id, err);
      reConnect();
    };
  };

  const finishInterview = () => {
    clearInterval(logTimer.current);
    clearInterval(reloadTimer.current);
    clearTimeout(timer.current);
    recStop(wss);
    curTime.current = 0;
    wss?.close();
    setTime(0);
    setStatus("over");
  };

  const suspendInterview = () => {
    clearTimeout(timer.current);
    clearInterval(logTimer.current);
    recStop(wss);
    setStatus("suspend");
    wss?.send(
      JSON.stringify({
        msgName: "suspend",
        interviewid: interviewId,
      })
    );
    wss?.close();
  };

  const toMeeting = () => {
    tempId = "guest" + Math.random().toString().slice(2, 10);
    localStorage.setItem("tempId", tempId);
    judgeAuth(() => {
      launchInterview({
        phone: tempId,
        isQt: 1,
        interViewInfo: JSON.stringify({
          positionid: 165,
          timestamp: Date.now(),
        }),
      })
        .then((res) => {
          setInterviewId(res.data.interviewID);
          startRecord(res.data.interviewID);
        })
        .catch((rej) => {
          message.info({
            content: "网络错误",
          });
        });
    });
  };

  const onChangeStatus = (val) => {
    if (val === "start") {
      toMeeting();
    } else if (val === "goOn") {
      startRecord(interviewId);
    } else if (val === "suspend") {
      suspendInterview();
    } else {
      Modal.confirm({
        content: "确定结束面试？",
        onOk: finishInterview,
        okText: "确定",
        cancelText: "取消",
      });
    }
    sendLog({
      type: "clk",
      uid: tempId,
      spm: `meeting.ws.${val}.0`,
      extInfo: JSON.stringify({ interviewId }),
    });
  };

  const interruptClk = useThrottle(() => {
    const curList = realData.filter((item) => item.finished === false);
    const id = curList[0] ? curList[0].questionId : "";
    dataQueue.current = [...realData].map((item) => {
      if (item.questionId === id) {
        item.isInterrupt = true;
        item.finished = true;
      }
      return item;
    });
    wss?.send(
      JSON.stringify({
        msgName: "stop_generate",
        questionId: id,
      })
    );
    setRealData(dataQueue.current);
  }, 2000);

  const handleSuspend = () => {
    sendLog({
      type: "clk",
      uid: currentUser.username,
      spm: "meeting.ws.suspend.0",
      extInfo: JSON.stringify({
        interviewId,
        mode: isMobile ? "mobile" : "pc",
      }),
    });
    onChangeStatus("suspend");
  };

  const handleQuestionMessage = (tagId, questionId, msg) => {
    sendLog({
      type: "clk",
      uid: currentUser.username,
      spm: "meeting.ws.QuestionMessage.0",
      extInfo: JSON.stringify({
        interviewId,
        mode: isMobile ? "mobile" : "pc",
      }),
    });
    wss?.send(
      JSON.stringify({
        msgName: "user_question",
        question: msg,
        modeTagId: tagId,
        oriQuestionId: questionId,
        interviewid: interviewId,
      })
    );
  };

  const addToQuestion = (msg, type = "clk") => {
    sendLog({
      type: "clk",
      uid: currentUser.username,
      spm:
        type === "input"
          ? "meeting.ws.user_question.input"
          : "meeting.ws.user_question.add",
      extInfo: JSON.stringify({
        interviewId,
        mode: isMobile ? "mobile" : "pc",
      }),
    });
    wss?.send(
      JSON.stringify({
        msgName: "user_question",
        question: msg,
        modeTagId: "normal",
        interviewid: interviewId,
      })
    );
  };

  const onChangeLan = (val) => {
    setCareerList([]);
    getCarrers(val);
  };

  const onChangeInCareer = (value) => {
    setCareerList(value);
    setCareer(value[value.length - 1]);
  };

  function fetchInterviewModeTags() {
    getInterviewModeTags({
      positionId: positionid,
    }).then((res) => {
      setTagList(res.data);
      setAppTagIdx(new Array(res.data.length).fill(0));
    });
  }

  const displayRender = (labels: string[]) => labels[labels.length - 1];

  const getCarrers = (region) => {
    getAllCareers({ region, companyId: -1 }).then((res) => {
      if (res.status) {
        const curList: any = [];
        const obj: any = {};
        res.data.forEach((item) => {
          if (obj[item.occupation]) {
            obj[item.occupation].children.push({
              value: item.id,
              label: item.position,
            });
          } else {
            obj[item.occupation] = {
              value: item.occupation,
              label: item.occupation,
              children: [{ value: item.id, label: item.position }],
            };
          }
        });
        for (let key in obj) {
          curList.push(obj[key]);
        }
        setOptionsList(curList);
      }
    });
  };

  const interruptClkMobile = useThrottle(() => {
    const curList = realData.filter((item) => item.finished === false);
    const id = curList[0] ? curList[0].questionId : "";
    dataQueue.current = [...realData].map((item) => {
      if (item.questionId === id) {
        item.isInterrupt = true;
        item.finished = true;
      }
      return item;
    });
    wss?.send(
      JSON.stringify({
        msgName: "stop_generate",
        questionId: id,
      })
    );
    sendLog({
      type: "clk",
      uid: currentUser.username,
      spm: "meeting.ws.interrupt.0",
      extInfo: JSON.stringify({
        interviewId,
        mode: isMobile ? "mobile" : "pc",
      }),
    });
    setRealData(dataQueue.current);
  }, 2000);

  function onChangeSize() {
    if (window.innerHeight < window.innerWidth) {
      setIsMobile(false);
    } else {
      setIsMobile(true);
    }
  }

  useEffect(() => {
    if (tempId) {
      message.info("您已试用结束");
      setTimeout(() => {
        toUrl("/login", "", true);
      }, 2000);
      return;
    }
    getCarrers("国内");
    sendLog({
      type: "pv",
      uid: tempId,
      spm: "meeting.0.0.0",
      extInfo: JSON.stringify({ positionid: 165, spmPre, source }),
    });
    onChangeSize();
    window.addEventListener("resize", onChangeSize);
    fetchInterviewModeTags();
    document.body.style.overflow = "hidden"; //进入页面时给body添加行类样式 overflow:hidden
    return () => {
      wss?.close();
      document.body.style.overflow = "visible"; //离开页面时给body还原 overflow 为默认值
    };
  }, []);

  return (
    <div className={styles.chatContainer}>
      {isMobile ? (
        <FreeMobileMeeting
          realData={realData}
          interruptClk={interruptClkMobile}
          onChangeStatus={onChangeStatus}
          status={status}
          handleSuspend={handleSuspend}
          realTalkingData={realTalkingData}
          addToQuestion={addToQuestion}
          interviewId={interviewId}
          time={time}
          feedbackShow={feedbackShow}
          setFeedbackShow={setFeedbackShow}
          positionid={career}
          spmPre={spmPre}
          source={source}
          tagList={tagList}
          handleQuestionMessage={handleQuestionMessage}
        />
      ) : (
        <FreePCMeeting
          realData={realData}
          interruptClk={interruptClk}
          onChangeStatus={onChangeStatus}
          status={status}
          handleSuspend={handleSuspend}
          realTalkingData={realTalkingData}
          addToQuestion={addToQuestion}
          interviewId={interviewId}
          time={time}
          feedbackShow={feedbackShow}
          setFeedbackShow={setFeedbackShow}
          positionid={career}
          spmPre={spmPre}
          source={source}
          tagList={tagList}
          handleQuestionMessage={handleQuestionMessage}
          appTagIdx={appTagIdx}
          setAppTagIdx={setAppTagIdx}
        />
      )}
      <Modal
        title="请选择您要面试的地区和岗位"
        open={isShow}
        okText="选好了"
        closable={false}
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => {
          if (career) {
            setIsShow(false);
          } else {
            message.warning("请选择您的岗位");
          }
        }}
        style={{
          zIndex: 99999,
        }}
      >
        <div style={{ fontSize: "16px" }}>
          <p className={styles.tipsTitle}>试用提醒💡：</p>
          <p style={{ fontSize: "16px" }}>
            试用时长为<span style={{ color: "red" }}>30秒</span>
            ，请准备好您的提问，不要浪费哦~
          </p>
          <p>
            OfferWing AI会
            <span style={{ color: "red", fontSize: "16px" }}>自动识别</span>
            问题并生成相应回答，在主界面展示
          </p>
          <p>保持安静的面试环境可以提高语音识别的准确度</p>
        </div>
        <div>
          <div>
            <p>
              地区{" "}
              <Popover content="海外地区默认语言为英文" placement="topRight">
                <InfoCircleTwoTone />
              </Popover>
            </p>
            <Select
              className={styles.selectBox}
              onChange={onChangeLan}
              defaultValue="国内"
            >
              <Select.Option value="国内">国内</Select.Option>
              <Select.Option value="国外">国外</Select.Option>
            </Select>
          </div>
          <div>
            <p>岗位</p>
            <Cascader
              value={careerList}
              className={styles.cascader}
              options={optionsList}
              displayRender={displayRender}
              onChange={onChangeInCareer}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-面试间",
  };
});

export default Meeting;
