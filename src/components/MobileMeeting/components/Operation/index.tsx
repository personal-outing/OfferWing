import { Button, Input, Modal, message } from "antd";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { toUrl } from "@/utils";
import "./style.css";
import { getUserPrompt, uploadUserPrompt } from "@/services/meeting";

export default (props) => {
  const {
    onChangeStatus,
    status,
    handleSuspend,
    onInterrupt,
    addToQuestion,
    talkingList = [],
    currentUser,
    positionId,
    onChangeMute,
  } = props;
  const [bottomOpen, setBottomOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mute, setMute] = useState(false);
  const [promptShow, setPromptShow] = useState(false);
  const scrollRef2 = useRef<any>(null);

  const toMute = () => {
    setMute(!mute);
    onChangeMute(!mute);
  };

  const sendText = () => {
    setInputText("");
    addToQuestion(inputText, "input");
  };

  const uploadPrompt = () => {
    if (!prompt) {
      setPromptShow(false);
    }
    uploadUserPrompt({
      userId: currentUser.username,
      positionId,
      prompt,
      terminal: "rt",
    })
      .then((res) => {
        if (res?.status) {
          message.success("prompt设置成功!");
        } else {
          message.error(res?.message);
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
      positionId,
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

  useEffect(() => {
    queryUsersPrompt();
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
                onClick={() => onChangeStatus("start")}
                style={{ background: "#208cffb0" }}
              >
                开始面试
              </div>
              <div
                className={styles.dealBtnItem}
                style={{ background: "#575757b0" }}
                onClick={() => toUrl("/meetingtask")}
              >
                返回准备
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
              <div className={styles.voiceBtn} onClick={toMute}>
                <img
                  src={
                    mute
                      ? "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E9%9D%99%E9%9F%B3.png"
                      : "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E8%AF%9D%E7%AD%92.png"
                  }
                  alt=""
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.fullScreen}>
        <div id="scrollEle2" className={styles.talkingBox} ref={scrollRef2}>
          {talkingList.map((item, idx) => {
            const { message = "", traceId = "" } = item;
            const isFirst = idx === 0;
            return (
              <div
                style={{
                  fontSize: isFirst ? "15px" : "12px",
                  color: isFirst ? "#222" : "#bbb",
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
        <Button className={styles.inputBtn} onClick={() => setPromptShow(true)}>
          自定义prompt
        </Button>
      </div>
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
          placeholder="不超过500字，自定义prompt会加在每一个问题的最前面发送给AI模型"
        />
      </Modal>
    </div>
  );
};
