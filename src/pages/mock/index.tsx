import { definePageConfig, useSearchParams } from "ice";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  Layout,
  Button,
  Card,
  Avatar,
  message,
  Tag,
  Progress,
  Rate,
} from "antd";
import {
  UserOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  StopOutlined,
  FileTextOutlined,
  LoadingOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import styles from "./index.module.css";
import { copyToClipboard, toUrl } from "@/utils";
import store from "@/store";
import { recStart, recStop } from "@/utils/recorderUtils/realTimeRecorder";
import {
  checkMockStatus,
  getHistory,
  getMockResult,
} from "@/services/mockMeeting";

const { Content, Sider } = Layout;

let wss: WebSocket | null;

const MockInterviewRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const interviewID = searchParams.get("id") || "";
  const career = searchParams.get("career") || "";
  const [deviceId, setDeviceId] = useState("");
  const [messages, setMessages] = useState([]);
  const [isEnd, setIsEnd] = useState(false);
  const [inputValue, setInputValue] = useState(
    "JavaScript语言的一大特点就是单线程，也就是说，同一个时间只能做一件事。这样设计的方案主要源于其语言特性，因为JavaScript是浏览器脚本语言，它可以操纵 DOM，可以渲染动画，可以与用户进行互动，如果是多线程的话，执行顺序无法预知，而且操作以哪个线程为准也是…"
  );
  const [talkingStatus, setTalkingStatus] = useState("waiting"); // wait 等待 talking 说话中 edit 编辑 mute 静音
  const [status, setStatus] = useState("stop");
  const [tipsShow, setTipsShow] = useState(false);
  const [talkingContent, setTalkingContent] = useState("...");
  const [timeElapsed, setTimeElapsed] = useState(0); // 已用时间（秒）
  const TOTAL_TIME = 15 * 60; // 总时间15分钟（秒）
  const FREE_TIME = 5 * 60; // 免费时间5分钟（秒）
  const [showReport, setShowReport] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState("");
  const [score, setScore] = useState(0);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "speaking">(
    "idle"
  ); // AI状态
  const [currentSpeaker, setCurrentSpeaker] = useState<"user" | "ai" | null>(
    null
  ); // 当前发言者
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const isUserSpeakingRef = useRef<boolean>(false);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let scheduleTime = audioContext.currentTime;

  // 新增：用于保存所有调度的音频源
  const scheduledAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // 添加移动端检测
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 添加聊天面板展开/收起状态
  const [isChatPanelCollapsed, setIsChatPanelCollapsed] = useState(false);

  // 添加一个 ref 用于滚动
  const chatContentRef = useRef<HTMLDivElement>(null);

  // 添加自动滚动效果
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 修改计时器效果
  useEffect(() => {
    let timer: NodeJS.Timer;
    if (status === "start") {
      timer = setInterval(() => {
        setTimeElapsed((prev) => {
          // 检查是否到达总时间限制
          if (prev >= TOTAL_TIME) {
            clearInterval(timer);
            setStatus("stop");
            message.info("模拟面试时间已到");
            // 断开 WebSocket 连接
            wss?.close();
            recStop(wss);
            return TOTAL_TIME;
          }

          // 检查是否达到免费时间限制且用户无余额
          if (prev === FREE_TIME && currentUser.remain <= 0) {
            clearInterval(timer);
            setStatus("stop");
            message.info("免费体验时间已到，请充值后继续使用");
            // 断开 WebSocket 连接
            wss?.close();
            recStop(wss);
            return FREE_TIME;
          }

          return prev + 1;
        });
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [status, currentUser.remain]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!inputValue.trim()) {
      message.warning("请输入内容！");
      return;
    }

    // 模拟用户消息和AI响应
    setMessages((prev) => [
      ...prev,
      { type: "user", text: inputValue },
      { type: "ai", text: "这是模拟的AI回答：" + inputValue },
    ]);
    setInputValue("");
  };

  // 修改进度条颜色获取逻辑
  const getProgressColor = () => {
    const remainingTime = TOTAL_TIME - timeElapsed;
    if (remainingTime <= 300) return "#ff4d4f"; // 剩余5分钟内显示红色
    if (timeElapsed < FREE_TIME) return "#52c41a"; // 免费时间内显示绿色
    return "#1890ff"; // 其他时间显示蓝色
  };

  // 修改后的结束面试函数（可选）
  const handleEndInterview = () => {
    // 停止所有音频播放
    scheduledAudioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (error) {
        console.error("停止音频源时出错", error);
      }
    });
    scheduledAudioSourcesRef.current = [];

    // 重置调度时间
    scheduleTime = audioContext.currentTime;

    wss?.close();
    recStop(wss);
    setStatus("stop");
    setIsEnd(true);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch(
        "https://pre-api.interviewdogs.com/GPTService/api/getMockInterviewSummary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: currentUser.username,
            mockInterviewId: interviewID,
          }),
        }
      );
      const data = await res.json();
      // 去除多余的标记（如果存在）
      const jsonString = data?.data
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\n/g, "")
        .trim();
      let resultObject = {};

      // 解析为对象
      try {
        resultObject = JSON.parse(jsonString);
      } catch (error) {
        console.error("解析失败:", error);
      }
      setShowReport(true);
      setReportData(resultObject.result);
      setScore(resultObject.score);

      message.success("面试报告生成成功！");
    } catch (error) {
      message.error("报告生成失败，请重试");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 模拟对话状态变化
  useEffect(() => {
    if (status === "start") {
      // 模拟对话进行中的状态变化
      if (currentSpeaker === "user") {
        setAiStatus("thinking");
      } else if (currentSpeaker === "ai") {
        setAiStatus("speaking");
      }
    } else {
      setAiStatus("idle");
      setCurrentSpeaker(null);
    }
  }, [status, currentSpeaker]);

  // --------------------- pcm 转换为 wav 的方法示例 ---------------------
  function pcmToWav(arrayBuffer: ArrayBuffer) {
    // 假设 PCM 采用 16kHz、16 位单声道，这里仅作示例，需要和后端实际参数匹配
    const sampleRate = 16000;
    const numChannels = 1;
    const bitDepth = 16;
    // WAVE Header 大概44字节
    const wavHeader = createWavHeader(
      arrayBuffer.byteLength,
      sampleRate,
      bitDepth,
      numChannels
    );

    // 拼接 header + pcm 数据，得到完整的 wav buffer
    return new Uint8Array([...wavHeader, ...new Uint8Array(arrayBuffer)])
      .buffer;
  }

  function createWavHeader(
    dataLength: number,
    sampleRate: number,
    bitDepth: number,
    channels: number
  ) {
    // 计算 wav 头需要的若干参数
    const blockAlign = (channels * bitDepth) / 8;
    const byteRate = sampleRate * blockAlign;

    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    /* 写入 RIFF 头 */
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true); // FileSize - 8
    writeString(view, 8, "WAVE");

    /* fmt 子块 */
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size，PCM为16
    view.setUint16(20, 1, true); // AudioFormat，PCM为1
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    /* data 子块 */
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
  }

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // 修改后的调度播放函数
  function scheduleBuffer(audioBuffer: AudioBuffer, playbackSpeed = 1.5) {
    // 如果用户正在说话，直接返回不播放
    if (isUserSpeakingRef.current) {
      return;
    }

    // 创建音频源
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackSpeed;
    source.connect(audioContext.destination);

    // 将新音频源加入调度队列
    scheduledAudioSourcesRef.current.push(source);

    const now = audioContext.currentTime;
    if (scheduleTime < now) {
      scheduleTime = now;
    }
    source.start(scheduleTime);
    scheduleTime += audioBuffer.duration / playbackSpeed;

    // 播放结束后，从队列中移除该 source
    source.onended = () => {
      scheduledAudioSourcesRef.current =
        scheduledAudioSourcesRef.current.filter((s) => s !== source);
    };
  }

  // 修改后的声音状态变化处理函数
  const handleVoiceChange = useCallback((isActive: boolean) => {
    isUserSpeakingRef.current = isActive;

    if (isActive) {
      // 当用户开始说话时，停止所有正在播放和待播放的音频源
      scheduledAudioSourcesRef.current.forEach((source) => {
        try {
          source.stop();
        } catch (error) {
          console.error("停止音频源时出错", error);
        }
      });
      // 清空队列
      scheduledAudioSourcesRef.current = [];
      // 重置调度时间
      scheduleTime = audioContext.currentTime;
    }
  }, []);

  const startMock = () => {
    setStatus("start");
    if (currentUser.remain <= 0) {
      message.error("您已欠费，无法继续使用", 10);
      return;
    }

    wss = new WebSocket(
      `wss://pre-api.interviewdogs.com/ws/gptservice/api/realtimewebsocket?sessionId=${interviewID}`
    );

    wss.onopen = function (event) {
      message.info("面试启动中");
      // 传入 handleVoiceChange 回调
      recStart(wss, deviceId, handleVoiceChange);
    };
    wss.onmessage = async function (event) {
      // 判断是否是二进制数据
      if (event.data instanceof Blob) {
        // 收到实时音频二进制流
        try {
          const arrayBuffer = await event.data.arrayBuffer();
          // 将 PCM + WAV header 拼接，然后 decode
          const wavBuffer = pcmToWav(arrayBuffer);
          const audioBuffer = await audioContext.decodeAudioData(wavBuffer);

          // 用调度函数排定播放
          scheduleBuffer(audioBuffer);
        } catch (e) {
          console.error("音频解码出错:", e);
        }

        return;
      }

      const curMsg = JSON.parse(event.data);
      const { status, msg, role } = curMsg;
      if (status) {
        setStatus("start");
        message.info("面试正式开始");
      }
      // 过滤掉特定的消息内容
      const filteredMessages = [
        "Amara.org",
        "请在下方留言,欢迎订阅我的频道",
        "以上言論不代表本台立場",
      ];
      
      if (msg && !filteredMessages.includes(msg)) {
        setMessages((pre) => {
          return [...pre, { role, text: msg }];
        });
      }
    };
    wss.onclose = function (event) {
      if (event.code != 1000 && event.code != 1005) {
      } else {
        console.log("连接已关闭");
        recStop(wss);
      }
    };
    wss.onerror = function (err) {};
  };

  const handleGetHistory = async () => {
    const res = await getHistory({
      username: currentUser.username,
    });
    if (res.status) {
      // 将字符串按行分割
      let str = "";
      res.data.forEach((item) => {
        if (item.mockid === interviewID) {
          str = item.comment;
        }
      });
      const lines = str.split("\n");
      // 初始化结果数组
      const result = [];

      // 遍历每一行
      lines.forEach((line) => {
        // 忽略空行
        if (line.trim() === "") return;

        // 分割角色和文本
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) return;

        const role = line.slice(0, colonIndex).trim();
        const text = line.slice(colonIndex + 1).trim();

        // 添加到结果数组
        result.push({ role, text });
      });

      setMessages(result);
    }
  };

  useEffect(() => {
    checkMockStatus({ mockid: interviewID }).then((res) => {
      if (!res.data.status) {
        message.info("面试已结束");
        setStatus("stop");
        handleGenerateReport();
        handleGetHistory();
      }
    });
  }, []);

  // 切换聊天面板展开/收起状态
  const toggleChatPanel = () => {
    setIsChatPanelCollapsed(!isChatPanelCollapsed);
  };

  return (
    <div className={styles.mockBox}>
      <header className={styles.mockHeader}>
        <div className={styles.headerLeft}>
          <h2>模拟面试：{decodeURIComponent(career)}</h2>
          <Tag color={status === "start" ? "processing" : "default"}>
            {!showReport
              ? status === "start"
                ? "进行中"
                : "未开始"
              : "已结束"}
          </Tag>
        </div>
        <img
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
          alt="logo"
          className={styles.headerLogo}
          onClick={() => toUrl("/mocktask")}
        />
      </header>

      <Layout className={styles.mainContent}>
        <Content className={styles.interviewArea}>
          {!showReport ? (
            <>
              <div className={styles.interviewContent}>
                <div className={styles.timeInfo}>
                  <div className={styles.timer}>
                    <Progress
                      type="circle"
                      percent={((TOTAL_TIME - timeElapsed) / TOTAL_TIME) * 100}
                      format={() => formatTime(TOTAL_TIME - timeElapsed)}
                      strokeColor={getProgressColor()}
                      size={80}
                    />
                    <div className={styles.timerLabel}>剩余时间</div>
                  </div>
                  <div className={styles.elapsedTime}>
                    已用时间：{formatTime(timeElapsed)}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {timeElapsed < FREE_TIME && (
                        <div className={styles.freeTimeTag}>前5分钟免费</div>
                      )}
                      <div className={styles.pricingInfo}>
                        超出免费时长：0.5
                        <img
                          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                          alt="logo"
                          style={{ height: "15px", verticalAlign: "sub" }}
                        />
                        /分钟
                      </div>
                    </div>
                  </div>
                  {status === "start" && (
                    <Button
                      danger
                      type="text"
                      icon={<StopOutlined />}
                      onClick={handleEndInterview}
                    >
                      结束面试
                    </Button>
                  )}
                </div>

                <div className={styles.interviewMain}>
                  <div className={styles.aiAvatar}>
                    <div className={styles.avatarWrapper}>
                      <Avatar
                        size={120}
                        icon={<RobotOutlined />}
                        className={styles.avatar}
                      />
                      {status === "start" && (
                        <div
                          className={`${styles.statusIndicator} ${styles[aiStatus]}`}
                        >
                          {aiStatus === "thinking" ? (
                            <LoadingOutlined />
                          ) : aiStatus === "speaking" ? (
                            <>
                              <span></span>
                              <span></span>
                              <span></span>
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className={styles.aiInfo}>
                      <h3>AI 面试官</h3>
                      <Tag
                        color={
                          aiStatus === "thinking"
                            ? "blue"
                            : aiStatus === "speaking"
                            ? "green"
                            : "default"
                        }
                      >
                        {aiStatus === "thinking"
                          ? "思考中..."
                          : aiStatus === "speaking"
                          ? "讲话中"
                          : "等待中"}
                      </Tag>
                    </div>
                  </div>

                  {status !== "start" && !isEnd && (
                    <div className={styles.startPrompt}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<PlayCircleOutlined />}
                        onClick={startMock}
                        className={styles.startButton}
                      >
                        开始模拟面试
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {isEnd && (
                <div className={styles.endPrompt}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<FileTextOutlined />}
                    onClick={handleGenerateReport}
                    loading={isGeneratingReport}
                    className={styles.reportButton}
                  >
                    {isGeneratingReport ? "正在生成报告..." : "生成面试报告"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.reportContainer}>
              <h2>
                您的得分：
                <span
                  style={{
                    color:
                      score < 60
                        ? "#ff4d4f"
                        : score < 80
                        ? "#faad14"
                        : "#52c41a",
                  }}
                >
                  {score}
                </span>
              </h2>
              <div className={styles.reportContent}>
                <Markdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={codeStyle}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {reportData}
                </Markdown>
              </div>
            </div>
          )}
        </Content>

        {/* 聊天面板控制条 */}
        <div
          className={`${styles.chatPanelHandle} ${
            isChatPanelCollapsed ? styles.collapsed : ""
          }`}
          onClick={toggleChatPanel}
        >
          <span className={styles.handleIcon}>
            {isChatPanelCollapsed ? <UpOutlined /> : <DownOutlined />}
          </span>
        </div>

        {/* 聊天面板 */}
        <Sider
          width={isMobile ? "100%" : 380}
          className={`${styles.chatSider} ${
            isChatPanelCollapsed ? styles.collapsed : ""
          }`}
        >
          <Card
            title="面试对话记录"
            className={styles.chatCard}
            extra={
              <Button
                type="text"
                icon={isChatPanelCollapsed ? <UpOutlined /> : <DownOutlined />}
                onClick={toggleChatPanel}
              />
            }
          >
            <div className={styles.chatContent} ref={chatContentRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.chatMessage} ${
                    msg.role === "client"
                      ? styles.userMessage
                      : styles.aiMessage
                  }`}
                >
                  <Avatar
                    icon={
                      msg.role === "client" ? (
                        <UserOutlined />
                      ) : (
                        <RobotOutlined />
                      )
                    }
                    className={styles.messageAvatar}
                  />
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Sider>
      </Layout>
    </div>
  );
};

export default MockInterviewRoom;

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI - 模拟面试间",
  };
});
