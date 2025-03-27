import {
  Button,
  Input,
  Modal,
  Popover,
  Select,
  Switch,
  Tabs,
  message,
} from "antd";
import { useEffect, useRef, useState, createRef } from "react";
import styles from "./index.module.css";
import { formatSeconds, isPC, toUrl } from "@/utils";
import Markdown from "react-markdown";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import store from "@/store";
import {
  getUserPrompt,
  getWrittenType,
  sendLog,
  uploadUserPrompt,
} from "@/services/meeting";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import useThrottle from "@/hooks/useThrottle";
import { getWrittenModel } from "@/services/writing";

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
    setHistoryList,
    questionType,
    setQuestionType,
    modelName,
    setModelName,
  } = props;
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const [writtenType, setWrittenType] = useState([]);
  const [changeIdx, setChangeIdx] = useState(-1);
  const [cropArea, setCropArea] = useState({});
  const [curImage, setCurImage] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [promptShow, setPromptShow] = useState(false);
  const [imgList, setImgList] = useState([]);
  const [curPreview, setCurPreview] = useState("");
  const cropperRef = createRef();

  const queryWrittenType = () => {
    getWrittenType({}).then((res) => {
      if (res.status) {
        setWrittenType(res.data);
        setQuestionType(res.data[0].questionType);
      }
    });
  };

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
      handleGetQuestion(imgs, questionType);
      const curImgs: any = [...curImage];
      curImgs[curHistoryIdx] = imgs;
      setCurImage(curImgs);
      setCurPreview("");
      setPreImage("");
      setImgList([]);
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

  const onChangeQuestionMode = (idx, subValue) => {
    if (subValue === "o1-mini2") {
      subValue === "o1-mini";
    }
    const list = [...historyList];
    list[curHistoryIdx].data[idx].curMode = subValue;
    setHistoryList(list);
  };

  const onChangeModelName = (idx, subValue) => {
    const list = [...historyList];
    list[curHistoryIdx].data[idx].modelName = subValue;
    setHistoryList(list);
  };

  const onChangeQuestion = (idx, subValue) => {
    const list = [...historyList];
    list[curHistoryIdx].data[idx].question = subValue;
    setHistoryList(list);
  };

  const onChangeAnswer = (idx) => {
    const list = [...historyList];
    list[curHistoryIdx].data[idx].answer = "";
    setHistoryList(list);
  };

  const queryModelType = () => {
    getWrittenModel({}).then((res) => {
      if (res.status) {
        setModelList(res.data);
        setModelName(res.data[0].modelId);
      }
    });
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

  const handleSend = useThrottle((data) => {
    handleGetQuestionMsg(data, curImage[curHistoryIdx]);
  }, 5000);

  const handleScreenshot = () => {
    editCroppedImage();
    message.loading({ content: "正在截图中", duration: 0 });
    handleCrop();
  };

  useEffect(() => {
    if (preImage && preImage != "waiting" && curPreview) {
      editCroppedImage();
    }
    setCurPreview(preImage);
  }, [preImage]);

  useEffect(() => {
    if (historyList.length > 0) setCurHistoryIdx(historyList.length - 1);
  }, [historyList.length]);

  useEffect(() => {
    queryWrittenType();
    queryModelType();
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
                    {item.name}
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
            {historyList[curHistoryIdx]?.data?.map((item, idx) => {
              return (
                <div className={styles.writingMiddleBox} key={item.orderId}>
                  <div className={styles.writingMiddleLeftItem}>
                    <div className={styles.tagsBox}>
                      <Select
                        placeholder="题型"
                        style={{ width: "200px" }}
                        value={item.curMode}
                        onChange={(value) => {
                          onChangeQuestionMode(idx, value);
                        }}
                      >
                        {writtenType.map((subItem, subIdx) => {
                          return (
                            <Option
                              value={subItem.questionType}
                              key={subItem.questionType}
                            >
                              {subItem.questionTypeName}
                            </Option>
                          );
                        })}
                      </Select>
                      <Select
                        onChange={(value) => {
                          onChangeModelName(idx, value);
                        }}
                        value={item.modelId}
                        style={{ width: "150rpx", maxWidth: "200px" }}
                        labelRender={(props) => {
                          return <span>{props.title}</span>;
                        }}
                      >
                        {modelList.map((item, idx) => {
                          return (
                            <Option
                              value={item.modelId}
                              title={item.modelName}
                              key={item.modelName}
                            >
                              <p className={styles.modelName}>
                                {item.modelName}{" "}
                                <span
                                  style={{
                                    color: "rgb(237,115,46)",
                                    fontSize: "12px",
                                  }}
                                >
                                  ({item.price / 100}
                                  <img
                                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                                    alt="logo"
                                    style={{
                                      height: "15px",
                                      verticalAlign: "sub",
                                    }}
                                  />
                                  /道)
                                </span>
                              </p>
                              <p className={styles.modelDesc}>
                                {item.modelDesc}
                              </p>
                            </Option>
                          );
                        })}
                      </Select>
                    </div>
                    <div
                      onClick={() => {
                        setChangeIdx(idx);
                      }}
                    >
                      {changeIdx === idx ? (
                        <Input.TextArea
                          autoSize={{ maxRows: 5 }}
                          value={item?.question}
                          onChange={(e) => {
                            onChangeQuestion(idx, e.target.value);
                          }}
                          onBlur={() => {
                            setChangeIdx(-1);
                          }}
                        />
                      ) : (
                        <div className={styles.quesitonContent}>
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
                      )}
                    </div>
                    <Button
                      className={styles.startBtn}
                      onClick={() => {
                        setChangeIdx(-1);
                        onChangeAnswer(idx);
                        handleSend([
                          {
                            ...item,
                            question: item?.question,
                            questionType: item.curMode,
                            modelName: item.modelName,
                          },
                        ]);
                      }}
                    >
                      发送
                    </Button>
                  </div>
                  <div className={styles.writingMiddleRightItem}>
                    {status != "stop" && (
                      <div
                        style={{ color: "rgba(67,111,246)", cursor: "pointer" }}
                        onClick={() =>
                          handleSend([
                            {
                              ...item,
                              question: item?.question,
                              questionType: item.curMode,
                              modelName: item.modelName,
                            },
                          ])
                        }
                      >
                        <RedoOutlined />
                        重新生成
                      </div>
                    )}
                    {status != "stop" && (
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
                          {item?.answer || "答案等待中..."}
                        </Markdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.bottomBox}>
        <div className={styles.questionType}>
          {status === "start" && (
            <div
              className={styles.finishBtn}
              onClick={() => {
                onChangeStatus("over");
              }}
            >
              <LogoutOutlined style={{ color: "red" }} />
              结束笔试
            </div>
          )}
          <div className={styles.modelSelector}>
            默认模型：
            <Select
              onChange={(value) => {
                setModelName(value);
              }}
              value={modelName}
              style={{ width: "150rpx", maxWidth: "200px" }}
              labelRender={(props) => {
                return <span>{props.title}</span>;
              }}
            >
              {modelList.map((item, idx) => {
                return (
                  <Option
                    value={item.modelId}
                    title={item.modelName}
                    key={item.modelName}
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
          <div style={{ marginLeft: "5px" }}>
            默认题型：
            <Select
              onChange={(value) => {
                setQuestionType(value);
              }}
              value={questionType}
              style={{ width: "150rpx", maxWidth: "200px" }}
            >
              {writtenType.map((item, idx) => {
                return (
                  <Option value={item.questionType} key={idx}>
                    {item.questionTypeName}
                  </Option>
                );
              })}
            </Select>
          </div>
          <Button
            className={styles.customPrompt}
            style={{ marginLeft: "5px" }}
            onClick={() => setPromptShow(true)}
          >
            自定义prompt
          </Button>
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
              <Button
                onClick={() => {
                  toUrl("/writingtask");
                }}
                className={styles.startBtn}
              >
                退出
              </Button>
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
          style={{ marginBottom: "10px" }}
        />
      </Modal>
    </>
  );
};

export default PCWriting;
