import { Button, Input, Modal, Select, Switch, Tooltip, message } from "antd";
import React, { useEffect, useRef, useState, createRef, useMemo } from "react";
import styles from "./index.module.css";
import { copyToClipboard, isHorizontal, toUrl } from "@/utils";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import store from "@/store";
import { getUserPrompt, sendLog, uploadUserPrompt } from "@/services/meeting";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  RedoOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import useThrottle from "@/hooks/useThrottle";
import { getWrittenModel } from "@/services/writing";
import "katex/dist/katex.min.css"; // 必须的样式文件
import { InlineMath, BlockMath } from "react-katex";

const Option = Select.Option;

const PCWriting = (props) => {
  const {
    onChangeStatus,
    status = "stop",
    positionid,
    spmPre,
    source,
    preImage,
    setPreImage,
    handleCrop,
    handleGetQuestion,
    handleGetQuestionMsg,
    historyList,
    setCurHistoryIdx,
    curHistoryIdx,
    hasConnect,
    isDelete,
    expertData,
    setExpertData,
    reloading,
    setReloading,
    setWritingShow,
    isMeeting,
  } = props;
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const [cropArea, setCropArea] = useState({});
  const [curImage, setCurImage] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [promptShow, setPromptShow] = useState(false);
  const [imgList, setImgList] = useState([]);
  const [historyImgList, setHistoryImgList] = useState<any>([]);
  const [curPreview, setCurPreview] = useState("");
  const [expertList, setExpertList] = useState([]);
  const cropperRef = createRef();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoScreenshot, setAutoScreenshot] = useState(false);
  const [showAIModal, setShowAIModal] = useState(true);
  let timer = useRef<any>(null);

  const showCroppedImage = async () => {
    const imgs = [...imgList];
    if (curPreview && curPreview != "waiting") {
      setCropArea(cropperRef.current.cropper.getData());
      try {
        if (typeof cropperRef.current?.cropper !== "undefined") {
          const img = cropperRef.current?.cropper
            .getCroppedCanvas()
            .toDataURL();
          imgs.push(img);
        } else {
          message.error("图片错误");
        }
      } catch (e) {
        console.error(e);
      }
    }
    message.destroy();
    message.loading({ content: "图片处理中...", duration: 0 });
    try {
      clearTimeout(timer.current);
      handleGetQuestion(imgs, expertData);
      const curImgs: any = [...curImage];
      curImgs[curHistoryIdx] = imgs;
      setCurImage(curImgs);
      setCurPreview("");
      setPreImage("");
      setImgList([]);
      setHistoryImgList([...historyImgList, imgs]);
    } catch (e) {
      console.error(e);
      setCurPreview("");
      setImgList([]);
    }
  };

  const editCroppedImage = async () => {
    message.destroy();
    setCropArea(cropperRef.current.cropper.getData());
    try {
      if (typeof cropperRef.current?.cropper !== "undefined") {
        const img = cropperRef.current?.cropper.getCroppedCanvas().toDataURL();
        const imgs = [...imgList];
        imgs.push(img);
        if (imgs.length >= 3) {
          setCurPreview(img);
        } else {
          setCurPreview("waiting");
        }
        setImgList(imgs);
      } else {
        message.error("图片错误");
        setCurPreview("");
      }
    } catch (e) {
      console.error(e);
      setCurPreview("");
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
      terminal: "written",
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
      terminal: "written",
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

  const deleteImg = (idx) => {
    const list = [...imgList];
    list.splice(idx, 1);
    setImgList(list);
  };

  const handleSend = useThrottle(() => {
    handleGetQuestionMsg(historyList[curHistoryIdx].name);
  }, 5000);

  const handleScreenshot = () => {
    editCroppedImage();
    message.loading({ content: "正在截图中", duration: 0 });
    handleCrop();
  };

  const queryData = () => {
    Promise.all([getWrittenModel({})])
      .then(([modelRes]) => {
        if (modelRes.status) {
          setExpertList(modelRes.data);
        }
      })
      .catch((error) => {
        message.error("获取数据失败");
        console.error(error);
      });
  };

  useEffect(() => {
    if (preImage && preImage != "waiting" && curPreview) {
      editCroppedImage();
    }
    setCurPreview(preImage);
  }, [preImage]);

  useEffect(() => {
    if (autoScreenshot && curPreview) {
      timer.current = setTimeout(() => {
        showCroppedImage();
      }, 3000);
    }
  }, [curPreview, autoScreenshot]);

  useEffect(() => {
    if (historyList.length > 0) setCurHistoryIdx(historyList.length - 1);
  }, [historyList.length]);

  useEffect(() => {
    if (isDelete != 0) {
      const list = [...historyImgList];
      list.pop();
      setHistoryImgList(list);
    }
  }, [isDelete]);

  useEffect(() => {
    queryData();
    queryUsersPrompt();

    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (imgList.length > 0) {
          showCroppedImage();
        }
      }
    };

    // 添加键盘事件监听器
    window.addEventListener("keydown", handleKeyPress);

    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "writing.pc.0.0",
      extInfo: JSON.stringify({ positionid, spmPre, source }),
    });

    // 在组件卸载时清除事件监听器
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const realAnswer = useMemo(() => {
    let currentAnswer = historyList[curHistoryIdx]?.data?.answer || "";
    currentAnswer =
      currentAnswer?.indexOf("open-web-tiku") > -1
        ? currentAnswer.split(";")
        : currentAnswer;
    if (reloading || !currentAnswer) {
      return "答案等待中...";
    } else {
      return currentAnswer;
    }
  }, [reloading, historyList, curHistoryIdx]);

  return (
    <>
      {curPreview && (
        <div className={styles.cropBox}>
          <p>
            您可放大和剪裁图片大小，若不方便调整，也可直接点击确定按钮，最多连续截图3次
          </p>
          {curPreview != "waiting" ? (
            <Cropper
              ref={cropperRef}
              style={{ height: "calc(100% - 70px)", flex: 1 }}
              zoomTo={0}
              initialAspectRatio={0}
              autoCropArea={1}
              src={curPreview}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              restore={false}
              cropBoxMovable={true}
              cropBoxResizable={true}
              checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
              guides={true}
              ready={() => {
                cropperRef.current.cropper.setData(cropArea);
              }}
            />
          ) : (
            <p>等待下一张图</p>
          )}
          <div className={styles.cropBtn}>
            <div className={styles.cropImg}>
              {[1, 2, 3].map((item, idx) => {
                return (
                  <div className={styles.cropImgBox}>
                    {imgList[idx] ? (
                      <>
                        <p
                          className={styles.deleteBtn}
                          onClick={() => deleteImg(idx)}
                        >
                          删除
                        </p>
                        <img src={imgList[idx]} alt="" />
                      </>
                    ) : (
                      <p style={{ lineHeight: "50px" }}>+</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.cropBtnBox}>
              <Button
                className={styles.confirmBtn}
                onClick={() => {
                  setPreImage("");
                  setCurPreview("");
                  setImgList([]);
                  setCropArea(cropperRef.current.cropper.getData());
                  message.destroy();
                  clearInterval(timer.current);
                }}
              >
                取消
              </Button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Button
                style={{ background: "#F39555" }}
                type="primary"
                className={styles.confirmBtn}
                onClick={handleScreenshot}
                disabled={imgList.length >= 3}
              >
                继续截图
              </Button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Button
                type="primary"
                className={styles.confirmBtn}
                onClick={showCroppedImage}
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.pcContainer}>
        <div className={styles.pcQuestionContainer}>
          <div className={styles.pcQuestionBox}>
            {status === "stop" ? (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "40vh",
                  fontSize: "10rpx",
                }}
              >
                这里是截图历史
                <br />
                当前笔试未开始
              </p>
            ) : historyList.length > 0 ? (
              historyList.map((item, idx) => {
                return (
                  <p
                    className={
                      idx == curHistoryIdx
                        ? styles.pcQuestionActive
                        : styles.pcQuestion
                    }
                    key={idx}
                    onClick={() => {
                      setCurHistoryIdx(idx);
                    }}
                  >
                    <img src={item.name.split(";")[0]} alt="" />
                  </p>
                );
              })
            ) : (
              <p style={{ paddingLeft: "6rpx" }}>
                当前没识别到有效问题，持续监听中...
              </p>
            )}
            <p id="hiddenEle" className={styles.hiddenP} />
          </div>
        </div>
        <div className={styles.pcAnswerBox}>
          {status != "start" && (
            <p className={styles.pcAnswerBack}>答案展示区域</p>
          )}
          <div className={styles.writingMiddle}>
            <div className={styles.writingMiddleBox}>
              <div className={styles.writingMiddleRightItem}>
                {status != "stop" &&
                  historyList[curHistoryIdx]?.data?.answer && (
                    <div
                      style={{
                        color: "rgba(67,111,246)",
                        cursor: "pointer",
                        marginBottom: "5px",
                      }}
                      className={styles.regenerateBtn}
                      onClick={() => {
                        setReloading(true);
                        handleSend();
                      }}
                    >
                      <RedoOutlined />
                      重新生成
                    </div>
                  )}
                {status != "stop" &&
                  (Array.isArray(realAnswer) ? (
                    <>
                      <p>
                        为您找到{realAnswer.length - 1}
                        道相似题目，越靠前越相似，请判断后选择正确答案：
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
                    <div id="scrollContainer" className={styles.ansContent}>
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
                            const codeContent = String(children).replace(
                              /\n$/,
                              ""
                            ); // 获取代码内容

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
                        {realAnswer}
                      </Markdown>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${styles.bottomBox} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div
          className={styles.collapseToggle}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "↑" : "↓"}
        </div>
        <div className={styles.bottomContent}>
          <div className={styles.questionType}>
            {status === "start" && (
              <div
                className={styles.finishBtn}
                onClick={() => {
                  onChangeStatus("over");
                }}
              >
                <LogoutOutlined style={{ color: "red" }} />
                结束
              </div>
            )}
            <div className={styles.modelSelector}>
              AI选择：
              <Select
                onChange={(value) => {
                  setExpertData(value);
                }}
                value={expertData}
                style={{ width: "150rpx", maxWidth: "200px" }}
                labelRender={(props) => {
                  return <span>{props.title}</span>;
                }}
              >
                {expertList.map((item, idx) => {
                  return (
                    <Option
                      value={item.modelId}
                      title={item.modelName}
                      key={item.modelId}
                    >
                      <p className={styles.modelName}>
                        {item.modelName}{" "}
                        <span
                          style={{ color: "rgb(237,115,46)", fontSize: "12px" }}
                        >
                          ({item.price / 100}
                          <img
                            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                            alt="logo"
                            style={{ height: "15px", verticalAlign: "sub" }}
                          />
                          /道)
                        </span>
                      </p>
                      <p className={styles.modelDesc}>{item.modelDesc}</p>
                    </Option>
                  );
                })}
              </Select>
            </div>
            <Button
              className={styles.customPrompt}
              style={{
                marginLeft: "5px",
                backgroundColor: "#1890ff",
                color: "#fff",
              }}
              onClick={() => {
                setPromptShow(true);
              }}
            >
              自定义答案要求
            </Button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "5px",
              }}
            >
              <Switch
                checked={autoScreenshot}
                onChange={setAutoScreenshot}
                checkedChildren="自动截图已开启"
                unCheckedChildren="截图自动确认"
              />
              <Tooltip title="开启后截图无需手动确认，3秒后系统会自动识别问题，注意：整张图片可能会降低识别准确率，您可调整剪裁范围后再开启">
                <QuestionCircleOutlined
                  style={{
                    fontSize: "14px",
                    color: "#8c8c8c",
                    cursor: "pointer",
                    marginLeft: "4px",
                  }}
                />
              </Tooltip>
            </div>
          </div>
          <div className={styles.pcAnswerDeal}>
            {status === "stop" || status === "over" ? (
              <div className={styles.startBtnBox}>
                <Button
                  onClick={() => onChangeStatus("start")}
                  type="primary"
                  className={styles.startBtn}
                >
                  开始笔试
                </Button>
                {!isMeeting ? (
                  <Button
                    onClick={() => {
                      toUrl("/writingtask");
                    }}
                    className={styles.startBtn}
                  >
                    退出
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setWritingShow(false);
                    }}
                    className={styles.startBtn}
                  >
                    隐藏窗口
                  </Button>
                )}
              </div>
            ) : (
              <div className={styles.meetingBtnBox}>
                <div>
                  <Button
                    disabled={!hasConnect}
                    className={styles.meetingBtn}
                    type="primary"
                    onClick={() => {
                      message.loading({ content: "正在截图中", duration: 0 });
                      handleCrop();
                    }}
                  >
                    远程截图
                  </Button>
                </div>
                <div className={styles.clientStatus}>
                  {!hasConnect ? (
                    <>
                      <CloseCircleOutlined style={{ color: "red" }} />{" "}
                      未连接客户端
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlined style={{ color: "green" }} />
                      已连接客户端
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
          placeholder="请输入您对答案的要求，不超过500字，例如：您必须用英文进行回答"
          style={{ marginBottom: "10px" }}
        />
      </Modal>
      <Modal
        title="选择AI助手"
        open={showAIModal}
        onCancel={() => setShowAIModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowAIModal(false)}>
            关闭
          </Button>,
        ]}
        width={isHorizontal() ? "100vw" : "80%"}
        style={{
          top: isHorizontal() ? "0" : "100px",
          maxWidth: isHorizontal() ? "100vw" : "800px",
        }}
        styles={{
          content: {
            height: "auto",
          },
        }}
      >
        <div className={styles.aiModalContent}>
          <p className={styles.aiModalTip}>
            <span
              style={{ fontSize: "16px", fontWeight: "bold", color: "#1890ff" }}
            >
              📢 请选择适合您需求的AI助手
            </span>
            <br />
            <span style={{ color: "#666666" }}>
              关闭后您仍可在左下角下拉框中更改选择
            </span>
          </p>
          <div
            style={{
              margin: "16px 0",
              padding: "12px",
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              borderRadius: "4px",
            }}
          >
            <span style={{ color: "#d48806" }}>⚠️ 温馨提示：</span>
            <span>
              截图区域注意圈选范围，一定要越精准越好，答案更加准确！部分编程题答案可能需要略微修改才能通过，注意格式！
            </span>
            <br />
            <span style={{ color: "#666666", fontStyle: "italic" }}>
              AI只是辅助，希望大家认真对待每一道题目，历史经验来看结合自身判断通过率更高！
            </span>
          </div>
          <div
            className={styles.aiCardContainer}
            style={{ flexWrap: isHorizontal() ? "nowrap" : "wrap" }}
          >
            {expertList.map((item, idx) => (
              <div
                key={item.modelId}
                className={`${styles.aiCard} ${
                  expertData === item.modelId ? styles.aiCardSelected : ""
                }`}
                onClick={() => {
                  setExpertData(item.modelId);
                }}
              >
                <div className={styles.aiCardHeader}>
                  <h3>{item.modelName}</h3>
                  <span className={styles.aiCardPrice}>
                    {item.price / 100}
                    <img
                      src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                      alt="logo"
                      style={{ height: "15px", verticalAlign: "sub" }}
                    />
                    /道
                  </span>
                </div>
                <p className={styles.aiCardDesc}>{item.modelDesc}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PCWriting;
