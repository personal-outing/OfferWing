import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as codeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { history, useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import { getInterviewDetail, sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { toUrl } from "@/utils";
import { Button, Form, Input, message, Modal } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { reportAsr } from "@/services/voice";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 4,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 20,
    },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 20,
      offset: 4,
    },
  },
};

function Meeting() {
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get("id");
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [questionData, setQuestionData] = useState([] as any);
  const [chatData, setChatData] = useState([] as any);
  const [positionId, setPositionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [feedBackOpen, setFeedBackOpen] = useState(false);
  const [curMsg, setCurMsg] = useState({});
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const [form] = Form.useForm();

  const getDetail = async () => {
    setIsLoading(true);
    getInterviewDetail({
      username: currentUser.username,
      sessionId: interviewId,
    }).then((res) => {
      setIsLoading(false);
      if (res.status) {
        const communicateRecord = res.data.communicateRecord;
        const questionArray = res.data.questionArray;
        const newCommList: any = [];
        communicateRecord.forEach((item, idx) => {
          const contentData = item.content.split(";speaker:");
          const newData = {
            ...item,
            content: contentData[0],
            speaker: contentData[1],
          };

          if (
            idx > 0 &&
            contentData[0].indexOf(
              newCommList[newCommList.length - 1].content
            ) !== -1
          ) {
            newCommList[newCommList.length - 1] = newData;
          } else {
            newCommList.push(newData);
          }
        });
        setPositionId(res.data.positionId);
        setChatData(newCommList);
        setQuestionData(questionArray);
      }
    });
  };

  const handleSave = () => {
    // 定义要下载的JSON数据
    const data = {
      questionData: questionData.map((item) => {
        delete item.traceId;
        return item;
      }),
      chatData: chatData.map((item) => {
        delete item.traceId;
        return item;
      }),
    };

    // 将JSON数据转换为字符串
    const jsonStr = JSON.stringify(data);

    // 创建一个Blob对象，其中包含JSON数据
    const blob = new Blob([jsonStr], { type: "application/json" });

    // 创建一个隐藏的链接元素
    const link = document.createElement("a");
    link.style.display = "none";

    // 为链接元素添加URL
    link.href = URL.createObjectURL(blob);

    // 设置下载文件的名称
    link.download = `面试记录-${interviewId?.substring(0, 6)}.json`;

    // 将链接元素添加到DOM中
    document.body.appendChild(link);

    // 触发点击事件，开始下载
    link.click();

    // 下载完成后，从DOM中移除链接元素
    document.body.removeChild(link);
  };

  const onFinish = () => {
    const result = form.getFieldsValue()?.names || [];
    const errorList = result.map((item) => item.errorParts) || [];
    const correctList = result.map((item) => item.corrections) || [];
    if (result.length > 0) {
      reportAsr({
        userId: currentUser.username,
        interviewId,
        msg: curMsg.content,
        errorParts: errorList,
        corrections: correctList,
        positionId,
      }).then((res) => {
        if (res.status) {
          setFeedBackOpen(false);
          message.success("反馈成功");
        }
      });
    } else {
      setFeedBackOpen(false);
    }
  };

  useEffect(() => {
    getDetail();
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "detail.0.0.0",
      extInfo: JSON.stringify({ interviewId, spmPre, source }),
    });
    document.body.style.overflow = "hidden"; //进入页面时给body添加行类样式 overflow:hidden
    return () => {
      document.body.style.overflow = "visible"; //离开页面时给body还原 overflow 为默认值
    };
  }, []);

  return (
    <div className={styles.chatContainer}>
      <p className={styles.saveHistory} onClick={handleSave}>
        保存面经
      </p>
      <p className={styles.backBtn} onClick={() => toUrl("/history")}>
        返回
      </p>
      {isLoading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <>
          <div className={styles.chatBox}>
            <div className={styles.chatsContainer}>
              {questionData.length === 0 && <p>暂无问题记录</p>}
              {questionData.map((item) => {
                const { question = [], answer = "", traceId = "" } = item;
                return (
                  <div key={`${traceId}-${Date.now()}`}>
                    <div className={styles.talkContainer}>
                      <div
                        className={styles.head}
                        style={{ backgroundColor: "#fd9f32" }}
                      >
                        问
                      </div>
                      <div
                        className={styles.content}
                        style={{
                          order: 0,
                          textIndent: 0,
                        }}
                      >
                        <p style={{ marginBottom: 0 }}>
                          <span
                            style={{
                              fontSize: "14px",
                            }}
                          >
                            {question}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className={styles.talkContainer}>
                      <div
                        className={styles.head}
                        style={{ backgroundColor: "#1d9bfb" }}
                      >
                        AI
                      </div>
                      <div
                        className={styles.ansContent}
                        style={{
                          order: -1,
                        }}
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
                                <p style={{ margin: "0.5em 0" }}>{children}</p>
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
                          {answer}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.fullScreen}>
            <div id="scrollEle2" className={styles.talkingBox}>
              {chatData.map((item, idx) => {
                const { content = "", speaker = "", traceId = "" } = item;
                return (
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#222",
                    }}
                    className={styles.talkingBoxItem}
                    key={Math.random().toString(36).slice(-6)}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      发言人{speaker}：
                    </span>
                    {content}
                    <span
                      onClick={() => {
                        form.resetFields();
                        setCurMsg(item);
                        setFeedBackOpen(true);
                      }}
                      style={{ color: "blue", cursor: "pointer" }}
                    >
                      语音错误反馈
                    </span>
                  </div>
                );
              })}
              {chatData.length === 0 && <p>暂无对话记录</p>}
            </div>
          </div>
        </>
      )}
      <Modal
        open={feedBackOpen}
        onCancel={() => setFeedBackOpen(false)}
        onOk={onFinish}
        okText="反馈"
        cancelText="取消"
      >
        <p style={{ marginBottom: "5px" }}>{curMsg.content}</p>
        <Form
          name="dynamic_form_item"
          {...formItemLayoutWithOutLabel}
          style={{
            maxWidth: 600,
          }}
          form={form}
        >
          <Form.List name="names">
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => {
                  return (
                    <div style={{ display: "flex", alignItems: "baseline" }}>
                      <div style={{ flex: 1 }}>
                        <p>
                          错误部分：
                          <Form.Item
                            name={[field.name, "errorParts"]}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: "请正确填写错误部分",
                              },
                            ]}
                            noStyle
                          >
                            <Input
                              placeholder="填写一处错误即可"
                              style={{
                                width: "80%",
                              }}
                            />
                          </Form.Item>
                        </p>
                        <p>
                          正确语句：
                          <Form.Item
                            name={[field.name, "corrections"]}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: "请正确填写正确语句",
                              },
                            ]}
                            noStyle
                          >
                            <Input
                              placeholder="填写正确语句"
                              style={{
                                width: "80%",
                              }}
                            />
                          </Form.Item>
                        </p>
                      </div>
                      {fields.length > 1 ? (
                        <a
                          style={{ width: "50px" }}
                          onClick={() => remove(field.name)}
                        >
                          删除
                        </a>
                      ) : null}
                    </div>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{
                      width: "60%",
                    }}
                    icon={<PlusOutlined />}
                  >
                    添加错误
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-面试记录",
  };
});

export default Meeting;
