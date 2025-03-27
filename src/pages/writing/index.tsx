import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, message } from "antd";
import { useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import { launchInterview, sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { fetchUserInfo } from "@/services/user";
import MobileWriting from "@/components/MobileWriting";
import PCWriting from "@/components/PCWriting";

let wss: WebSocket | null;
const isPre =
  window.location.href.indexOf("pre.") > -1 ||
  new URL(window.location.href).searchParams.has("_debugMode_");

function Writing(props) {
  const { setWritingShow, isMeeting } = props;
  const [searchParams] = useSearchParams();
  const positionid = searchParams.get("positionid");
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  let boost = searchParams.get("boost") || 0;
  const usePQ = searchParams.get("usePQ") || "0";
  const codeLang = searchParams.get("code") || "0";
  const [status, setStatus] = useState("stop");
  const [interviewId, setInterviewId] = useState("");
  const [time, setTime] = useState(0);
  const [feedbackShow, setFeedbackShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tagList, setTagList] = useState([]);
  const [preImage, setPreImage] = useState("");
  const [curTraceId, setCurTraceId] = useState("");
  const [userState, userDispatcher] = store.useModel("user");
  const [historyList, setHistoryList] = useState<any>([]);
  const [hasConnect, setHasConnect] = useState(false);
  const [curHistoryIdx, setCurHistoryIdx] = useState(0);
  const [questionType, setQuestionType] = useState("");
  const [reloading, setReloading] = useState(false);
  const [expertData, setExpertData] = useState("doubao");
  const [isDelete, setIsDelete] = useState(0);
  const { currentUser } = userState;
  const [payState] = store.useModel("pay");
  const { writePrice } = payState;
  let logTimer: any = useRef(null);
  let reloadTimer: any = useRef(null);
  let reloadTemp: any = useRef(false);
  let sendStatusTimer: any = useRef(null);

  const getLastRemain = () => {
    fetchUserInfo().then((res) => {
      res.data.remain = (res?.data?.remain || 0) / 100;
      userDispatcher.updateCurrentUser(res.data);
      const noMoney = res.data.remain / writePrice < 1;
      if (noMoney) {
        message.info("余额已用完，笔试结束");
        finishInterview();
      }
    });
  };

  const readyProcess = () => {
    reloadTemp.current = false;
    clearInterval(reloadTimer.current);
    clearInterval(sendStatusTimer.current);
    setStatus("start");
    // 开始轮询计算余额
    logTimer.current = setInterval(() => {
      getLastRemain();
    }, 30000);
  };

  const handleAllMsg = (curMsg: any = {}) => {
    message.destroy();
    setHistoryList((pre) => {
      const history = [...pre];
      history.push({
        questionId: curMsg.traceId,
        name: curMsg.urlList,
        data: {},
      });
      return history;
    });
  };

  const handleFillAnswer = (data) => {
    setHistoryList((pre) => {
      const list = [...pre];
      const msg = data.answer?.answer || "";
      for (let i = 0; i < list.length; i++) {
        let temp = false;
        if (list[i].questionId === data.answer.questionId) {
          list[i].data.answer = msg;
          temp = true;
          break;
        }
        if (temp) {
          break;
        }
      }
      return list;
    });
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

  const reConnect = () => {
    wss?.send("frontendStop");
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
              toMeeting();
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

  const startRecord = (id) => {
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
          msgName: "writtenInit",
          interviewid: id,
          positionid,
          codeLang,
          userid: currentUser.username,
        })
      );
      message.info("笔试启动中");
    };
    wss.onmessage = function (event) {
      const curMsg = JSON.parse(event.data);
      const { status, type, data } = curMsg;
      if (status) {
        // 连接正式成功
        if (type === "writtenInit") {
          wss?.send(
            JSON.stringify({
              msgName: "writtenStatus",
              interviewid: id,
            })
          );
        }
        if (type === "writtenStatus") {
          readyProcess();
          message.info("笔试正式开始");
          sendStatusTimer.current = setInterval(() => {
            wss?.send(
              JSON.stringify({
                msgName: "writtenCheckStatus",
                interviewid: id,
                userid: currentUser.username,
              })
            );
          }, 3000);
        }

        if (type === "writtenCheckStatus") {
          setHasConnect(data);
        }

        // 问题&答案
        if (type === "writtenReceiveScreenshot") {
          const temp = JSON.parse(data || "{}");
          setPreImage(temp?.url);
          setCurTraceId(temp?.traceId);
        }

        if (type === "writtenOCRResult") {
          handleAllMsg(data);
          setCurTraceId(data?.traceId || "");
        }

        if (type === "writtenQuestionResult") {
          setReloading(false);
          handleFillAnswer(data);
        }

        if (type === "frontendStop") {
          clearInterval(logTimer.current);
          clearInterval(reloadTimer.current);
          clearInterval(sendStatusTimer.current);
          wss?.close();
          setTime(0);
          toMeeting();
        }

        // 错误
        if (type === "error") {
          sendError(id, {
            reason: data,
            type,
          });
          message.warning("网络传输错误，请检查网络连接");
        }
      } else {
        message.destroy();
        if (data) {
          sendError(id, {
            reason: data,
            type,
          });
          message.warning(data);
        }
        if (type === "writtenStatus") {
          wss?.send(
            JSON.stringify({
              msgName: "writtenStatus",
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
        setStatus("over");
      }
    };
    wss.onerror = function (err) {
      console.log("连接中断，发生错误", err);
      sendError(id, err);
      reConnect();
    };
  };

  const finishInterview = () => {
    clearInterval(reloadTimer.current);
    clearInterval(sendStatusTimer.current);
    message.destroy();
    wss?.close();
    setStatus("over");
    fetchUserInfo().then((res) => {
      res.data.remain = (res?.data?.remain || 0) / 100;
      userDispatcher.updateCurrentUser(res.data);
    });

    Modal.success({
      title: "笔试总结",
      content: (
        <div>
          <p>OfferWing AI一共帮您解决了{historyList.length}道问题</p>
        </div>
      ),
    });
  };

  const reloadTask = () => {
    message.loading("笔试重启中...");
    wss?.send(
      JSON.stringify({
        msgName: "frontendStop",
        interviewid: interviewId,
      })
    );
  };

  const toMeeting = () => {
    launchInterview({
      phone: currentUser.username,
      boost,
      usePQ,
      mode: isMobile ? "mobile" : "pc",
      interViewInfo: JSON.stringify({
        positionid,
        timestamp: Date.now(),
      }),
      terminal: "written",
      codeLang,
    })
      .then((res) => {
        if (res.status && res.data.interviewID) {
          setInterviewId(res.data.interviewID);
          startRecord(res.data.interviewID);
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
  };

  const onChangeStatus = (val) => {
    if (val === "start") {
      toMeeting();
    } else if (val === "reload") {
      Modal.confirm({
        content: "确定重新开始？",
        onOk: reloadTask,
        okText: "确定",
        cancelText: "取消",
      });
    } else {
      Modal.confirm({
        content: "确定结束笔试？",
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
      }),
    });
  };

  function onChangeSize() {
    if (window.innerHeight < window.innerWidth) {
      setIsMobile(false);
    } else {
      setIsMobile(true);
    }
  }

  const handleCrop = () => {
    wss?.send(
      JSON.stringify({
        msgName: "writtenGetScreenshot",
        interviewid: interviewId,
        userid: currentUser.username,
      })
    );
  };

  const handleGetQuestion = (img) => {
    wss?.send(
      JSON.stringify({
        msgName: "writtenOCRMessage",
        interviewid: interviewId,
        userid: currentUser.username,
        traceid: curTraceId,
        image: img,
        modelId: expertData,
      })
    );
  };

  const handleGetQuestionMsg = (image) => {
    wss?.send(
      JSON.stringify({
        msgName: "writtenQuestionMessage",
        interviewid: interviewId,
        userid: currentUser.username,
        traceid: curTraceId,
        urlList: image,
        modelId: expertData,
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

    document.body.style.overflow = "hidden"; //进入页面时给body添加行类样式 overflow:hidden
    return () => {
      wss?.close();
      clearInterval(reloadTimer.current);
      clearInterval(sendStatusTimer.current);
      document.body.style.overflow = "visible"; //离开页面时给body还原 overflow 为默认值
    };
  }, []);

  return (
    <div className={styles.chatContainer}>
      {isMobile ? (
        <MobileWriting
          onChangeStatus={onChangeStatus}
          status={status}
          interviewId={interviewId}
          time={time}
          feedbackShow={feedbackShow}
          setFeedbackShow={setFeedbackShow}
          positionid={positionid}
          spmPre={spmPre}
          source={source}
        />
      ) : (
        <PCWriting
          status={status}
          onChangeStatus={onChangeStatus}
          interviewId={interviewId}
          time={time}
          feedbackShow={feedbackShow}
          setFeedbackShow={setFeedbackShow}
          positionid={positionid}
          spmPre={spmPre}
          source={source}
          tagList={tagList}
          preImage={preImage}
          handleCrop={handleCrop}
          handleGetQuestion={handleGetQuestion}
          handleGetQuestionMsg={handleGetQuestionMsg}
          historyList={historyList}
          setHistoryList={setHistoryList}
          curHistoryIdx={curHistoryIdx}
          setCurHistoryIdx={setCurHistoryIdx}
          setPreImage={setPreImage}
          hasConnect={hasConnect}
          setQuestionType={setQuestionType}
          questionType={questionType}
          isDelete={isDelete}
          setExpertData={setExpertData}
          expertData={expertData}
          reloading={reloading}
          setReloading={setReloading}
          setWritingShow={setWritingShow}
          isMeeting={isMeeting}
        />
      )}
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-笔试间",
  };
});

export default Writing;
