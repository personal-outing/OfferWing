import { useEffect, useRef, useState } from "react";
import { Modal, message } from "antd";
import { recStart, recStop } from "@/utils/recorderUtils/realTimeRecorder";
import { useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import {
  getInterviewModeTags,
  launchInterview,
  sendLog,
} from "@/services/meeting";
import useThrottle from "@/hooks/useThrottle";
import store from "@/store";
import styles from "./index.module.css";
import { checkHasResume, fetchUserInfo } from "@/services/user";
import PCMeeting from "../../components/PCMeeting/index";
import MobileMeeting from "@/components/MobileMeeting";
import FeedbackModal from "@/components/FeedbackModal";
import { startCapture } from "@/utils/recorderUtils/realTimeScreenRecorder";
import { isPC, stopMicrophone } from "@/utils";
import SelectMode from "@/components/PCMeeting/SelectMode";

let wss: WebSocket | null;
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
  const usePQ = searchParams.get("usePQ") || "0";
  const [status, setStatus] = useState("stop");
  const [realData, setRealData] = useState([] as any);
  const [realTalkingData, setRealTalkingData] = useState([] as any);
  const [interviewId, setInterviewId] = useState("");
  const [time, setTime] = useState(0);
  const [feedbackShow, setFeedbackShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tagList, setTagList] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [curModeIdx, setCurModeIdx] = useState(0);
  const [userState, userDispatcher] = store.useModel("user");
  const [curTag, setCurTag] = useState("normal");
  const [modeOpen, setModeOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [join, setJoin] = useState(false);
  const { currentUser } = userState;
  const [payState] = store.useModel("pay");
  const { price } = payState;

  let timer: any = useRef(null);
  let logTimer: any = useRef(null);
  let curTime: any = useRef(-1);
  let dataQueue: any = useRef([]);
  let talkingQueue: any = useRef([]);
  let reloadTimer: any = useRef(null);
  let reloadTemp: any = useRef(false);

  const timePlus = () => {
    curTime.current += 1;
    setTime(curTime.current);
    timer.current = setTimeout(() => {
      timePlus();
    }, 1000);
  };

  const getLastRemain = () => {
    fetchUserInfo().then((res) => {
      res.data.remain = (res?.data?.remain || 0) / 100;
      userDispatcher.updateCurrentUser(res.data);
      const second = (res.data.remain * 60) / price;
      judgeRemain(second);
    });
  };

  const readyProcess = () => {
    const openShare = curModeIdx == 1;
    reloadTemp.current = false;
    clearInterval(reloadTimer.current);
    setStatus("start");
    timePlus();
    // 开始轮询计算余额
    logTimer.current = setInterval(() => {
      getLastRemain();
    }, 30000);
    if (openShare) {
      startCapture(wss);
    }
  };

  const handleNormalMsg = (curMsg: any = {}, type = "") => {
    let temp = true;
    let pqQueryResult = "";
    let currentData = [];
    if (type === "pqQueryResult") {
      pqQueryResult = curMsg?.message || [];
      currentData = dataQueue.current?.map((item) => {
        if (
          item.questionId == curMsg.questionId ||
          item.questionId == curMsg.oriQuestionId
        ) {
          item["pqQueryResult"] = pqQueryResult;
          temp = false;
        }
        return item;
      });
    } else {
      currentData = dataQueue.current?.map((item) => {
        if (
          item.questionId == curMsg.questionId ||
          item.questionId == curMsg.oriQuestionId
        ) {
          const tagId = curMsg.modeTagId || "normal";
          item[tagId] = curMsg;
          item["finished"] = curMsg.finished;
          item["tagId"] = curMsg.modeTagId;
          temp = false;
        }
        return item;
      });
    }
    if (temp) {
      const tagId = curMsg.modeTagId || "normal";
      curMsg[tagId] = curMsg;
      curMsg["tagId"] = curMsg.modeTagId;
      currentData.push(curMsg);
    }
    dataQueue.current = currentData;
    setRealData(dataQueue.current);
  };

  const handleTalkingMsg = (curMsg: any = {}) => {
    for (let key in curMsg) {
      let temp = true;
      let curData = talkingQueue.current?.map((item) => {
        if (item.traceId === curMsg[key].traceId) {
          item = curMsg[key];
          temp = false;
        }
        return item;
      });
      if (temp) {
        curData.unshift(curMsg[key]);
      }
      talkingQueue.current = curData;
    }
    setRealTalkingData(talkingQueue.current);
  };

  const sendError = (id = interviewId, reason = {}) => {
    sendLog({
      type: "error",
      uid: currentUser.username,
      spm: "meeting.ws.error.0",
      extInfo: JSON.stringify({
        interviewId: id,
        error: JSON.stringify(reason),
      }),
    });
  };

  const reConnect = (openShare) => {
    wss?.send("frontendStop");
    suspendInterview();
    if (!reloadTemp.current) {
      reloadTemp.current = true;
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
              toMeeting(openShare);
            });
        },
        onCancel() {
          reloadTemp.current = false;
        },
        okText: "刷新重试",
        cancelText: "取消",
      });
    }
  };

  function checkBrowserSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      message.error(
        "你的浏览器不支持录音权限。请使用最新版本的 Chrome、Firefox 或其他支持的浏览器。"
      );
      return false;
    }
    return true;
  }

  const judgeAuth = (successFn) => {
    if (checkBrowserSupport()) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
          console.log("用户已授权录音权限");
          // 在此处处理获得的音频流
          successFn();
        })
        .catch((error) => {
          let msg = "获取录音权限时发生未知错误。请稍后重试。";
          switch (error.name) {
            case "NotAllowedError":
              msg =
                "录音权限被拒绝。请检查浏览器和系统设置，确保授予录音权限。如果开启权限后仍然失败请更换浏览器";
              break;
            case "NotFoundError":
              msg = "未找到录音设备。请检查麦克风连接并重试。";
              break;
            case "NotReadableError":
              msg =
                "无法访问录音设备。可能是由于硬件问题或其他应用占用了麦克风。";
              break;
            case "OverconstrainedError":
              msg = "请求的音频约束无法满足。请尝试不同的设置。";
              break;
            default:
              msg = "获取录音权限时发生未知错误。请稍后重试。";
              break;
          }
          message.warning(msg);
        });
    }
  };

  const startRecord = (id, openShare) => {
    if (currentUser.remain <= 0) {
      message.error("您已欠费，无法继续使用", 10);
      return;
    }
    wss = new WebSocket(
      isPre
        ? "wss://pre-api.interviewdogs.com/interview/ws"
        : "wss://api.offerwing.cn/interview/ws"
    );
    wss.onopen = function (event) {
      wss?.send(
        JSON.stringify({
          msgName: "init",
          interviewid: id,
          positionid,
          usePQ,
          boost: Number(boost),
          mode: isMobile ? "mobile" : "pc",
          mock: !!mock,
          userid: currentUser.username,
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
          recStart(wss, deviceId);
          onChangeCurTag(curTag, id);
        }
        // 问题&答案
        if (type === "qAndA") {
          try {
            handleNormalMsg(data);
          } catch (e) {
            sendLog({
              type: "error",
              uid: currentUser.username,
              spm: `meeting.ws.dataError.0`,
              extInfo: JSON.stringify({
                interviewId,
                mode: isMobile ? "mobile" : "pc",
                error: typeof data === "string" ? data : JSON.stringify(data),
              }),
            });
          }
        }

        if (type === "VoiceMessage") {
          handleTalkingMsg(data);
        }

        if (type === "frontendStop") {
          clearInterval(logTimer.current);
          clearInterval(reloadTimer.current);
          clearTimeout(timer.current);
          recStop(wss);
          curTime.current = 0;
          wss?.close();
          setTime(0);
          toMeeting(openShare);
        }
        if (type === "pqQueryResult") {
          handleNormalMsg(data, type);
        }

        // 错误
        if (type === "error") {
          sendError(id, {
            reason: data,
            type,
          });
          message.error("网络传输错误，请检查网络连接");
        }
      } else {
        if (data) {
          sendError(id, {
            reason: data,
            type,
          });
          message.error(data);
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
        reConnect(openShare);
      } else {
        console.log("连接已关闭");
        recStop(wss);
      }
    };
    wss.onerror = function (err) {
      console.log("连接中断，发生错误", err);
      sendError(id, err);
      reConnect(openShare);
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
    setFeedbackShow(true);
    fetchUserInfo().then((res) => {
      res.data.remain = (res?.data?.remain || 0) / 100;
      userDispatcher.updateCurrentUser(res.data);
    });
  };

  const reloadTask = () => {
    message.loading("面试重启中...");
    wss?.send(
      JSON.stringify({
        msgName: "frontendStop",
        interviewid: interviewId,
      })
    );
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

  const toMeeting = (openShare) => {
    judgeAuth(() => {
      launchInterview({
        phone: currentUser.username,
        boost,
        usePQ,
        mode: isMobile ? "mobile" : "pc",
        interViewInfo: JSON.stringify({
          positionid,
          timestamp: Date.now(),
        }),
      })
        .then((res) => {
          if (res.status && res.data.interviewID) {
            setInterviewId(res.data.interviewID);
            startRecord(res.data.interviewID, openShare);
          } else {
            message.info({
              content: res?.data?.msg || "网络错误",
            });
          }
        })
        .catch((rej) => {
          message.info({
            content: rej?.data?.msg || "网络错误",
          });
        });
    });
  };

  const onChangeMute = (isMute) => {
    wss?.send(
      JSON.stringify({
        msgName: isMute ? "mute" : "unmute",
        interviewid: interviewId,
        userid: currentUser.username,
      })
    );
  };

  const onChangeStatus = (val) => {
    const openShare = curModeIdx == 1;
    if (val === "start") {
      toMeeting(openShare);
    } else if (val === "goOn") {
      startRecord(interviewId, openShare);
    } else if (val === "suspend") {
      suspendInterview();
    } else if (val === "reload") {
      Modal.confirm({
        content: "确定重新开始？",
        onOk: reloadTask,
        okText: "确定",
        cancelText: "取消",
      });
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
      uid: currentUser.username,
      spm: `meeting.ws.${val}.0`,
      extInfo: JSON.stringify({
        interviewId,
        mode: isMobile ? "mobile" : "pc",
        voiceMode: curModeIdx,
      }),
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

  const interruptClk = useThrottle((id, tagId) => {
    dataQueue.current = [...realData].map((item) => {
      if (item[tagId].questionId === id) {
        item[tagId].isInterrupt = true;
        item[tagId].finished = true;
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

  const judgeRemain = (second) => {
    if (second <= 0) {
      message.info("余额已用完，面试结束");
      finishInterview();
    } else if (second <= 600 && second % 60 === 0) {
      const t = second / 60;
      message.info(`余额告警，将在${t}分钟后用完`, 10);
    }
  };

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

  const addToQuestion = (msg, type = "clk", tagId) => {
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
        modeTagId: tagId,
        interviewid: interviewId,
      })
    );
  };

  function onChangeSize() {
    if (window.innerHeight < window.innerWidth) {
      setIsMobile(false);
    } else {
      setIsMobile(true);
    }
  }

  function fetchInterviewModeTags() {
    getInterviewModeTags({
      positionId: positionid,
    }).then((res) => {
      setTagList(res.data);
    });
  }

  const onChangeCurTag = (tag, id) => {
    wss?.send(
      JSON.stringify({
        msgName: "setModeTag",
        modeTagId: tag,
        interviewid: id || interviewId,
      })
    );
  };

  useEffect(() => {
    // 适配手机屏幕;
    // enquireScreen((b) => {
    //   setIsMobile(!!b);
    // });
    onChangeSize();
    window.addEventListener("resize", onChangeSize);

    fetchInterviewModeTags();

    checkHasResume({ username: currentUser.username }).then((res) => {
      if (!res.data.success && boost === "1") {
        boost = 0;
      }
    });
    document.body.style.overflow = "hidden"; //进入页面时给body添加行类样式 overflow:hidden
    return () => {
      wss?.close();
      document.body.style.overflow = "visible"; //离开页面时给body还原 overflow 为默认值
    };
  }, []);

  return (
    <div className={styles.chatContainer}>
      {isMobile ? (
        <MobileMeeting
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
          positionid={positionid}
          spmPre={spmPre}
          source={source}
          tagList={tagList}
          handleQuestionMessage={handleQuestionMessage}
          onChangeCurTag={onChangeCurTag}
          onChangeMute={onChangeMute}
        />
      ) : (
        <PCMeeting
          onChangeMute={onChangeMute}
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
          positionid={positionid}
          spmPre={spmPre}
          source={source}
          tagList={tagList}
          handleQuestionMessage={handleQuestionMessage}
          onChangeCurTag={onChangeCurTag}
          setCurTag={setCurTag}
          openShare={curModeIdx == 1}
          open={open}
          setOpen={setOpen}
          setModeOpen={setModeOpen}
          dataQueue={dataQueue}
        />
      )}
      <FeedbackModal
        interviewid={interviewId}
        username={currentUser.username}
        show={feedbackShow}
        onClose={() => setFeedbackShow(false)}
      />
      {isPC() && (
        <Modal
          open={modeOpen}
          okText="确定"
          cancelText="取消"
          onCancel={() => {
            setModeOpen(false);
            stopMicrophone();
          }}
          title="模式选择"
          onOk={() => {
            setModeOpen(false);
            if (join) {
              setOpen(true);
            }
            stopMicrophone();
          }}
        >
          <SelectMode
            deviceId={deviceId}
            setCurModeIdx={setCurModeIdx}
            curModeIdx={curModeIdx}
            setDeviceId={setDeviceId}
            join={join}
            setJoin={setJoin}
            currentUser={currentUser}
          />
        </Modal>
      )}
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-面试间",
  };
});

export default Meeting;
