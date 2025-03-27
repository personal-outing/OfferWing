import store from "../../store";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  getMjQuestionStatus,
  handlePublish,
  submitMjQuestionTask,
} from "@/services/exp";
import { sendLog, getInterviewHistory } from "@/services/meeting";
import { formatSeconds, toUrl } from "@/utils";
import { definePageConfig, useSearchParams } from "ice";
import { message, Modal, Popover, Space, Table } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import "./index.css";
import { count } from "console";
import { reportAsrStatistics } from "@/services/voice";

export default function HistoryCenter() {
  const [searchParams] = useSearchParams();
  const [total, setTotal] = useState(0);
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [userState] = store.useModel("user");
  const [payState] = store.useModel("pay");
  const currentUser = userState.currentUser;
  const [interviewList, setInterviewList] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [questionShow, setQuestionShow] = useState(false);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [questionStatus, setQuestionStatus] = useState("finished");
  const [statics, setStatics] = useState({});
  const [curId, setCurId] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const getHistory = (page = 0) => {
    setLoading(true);
    getInterviewHistory({
      phone: currentUser.username,
      start: page * 20,
      count: 20,
    }).then((res) => {
      if (res.status) {
        setTotal(res.data.totalCount || 0);
        let list = res.data?.userInterviewVo?.interViewInfoList || [];
        list =
          list.sort(
            (l, r) =>
              new Date(r.startTime).getTime() - new Date(l.startTime).getTime()
          ) || [];
        setLoading(false);
        setInterviewList(list);
      }
    });
  };

  const openQuestionSummary = (id) => {
    message.success("问题总结中...");
    setInterviewList((pre) => {
      const data = [...pre];
      data.forEach((item) => {
        if (item.interviewId === id) {
          item.mjTaskStatus = "submitted";
        }
      });
      return data;
    });
    submitMjQuestionTask({
      userId: currentUser.username,
      interviewId: id,
    })
      .then((res) => {
        if (res.status) {
          message.destroy();
          setCurId(id);
        } else {
          message.error(res?.message);
        }
      })
      .catch((rej) => {
        message.error(rej?.message);
      });
  };

  const summaryHistory = (id, page = 0) => {
    setAllQuestions([]);
    setQuestionLoading(true);
    getMjQuestionStatus({
      userId: currentUser.username,
      interviewId: id,
      start: page * 30,
      count: 30,
    })
      .then((res) => {
        if (res.status) {
          setQuestionLoading(false);
          setQuestionStatus(res.data.interviewStatus);
          const data = res.data?.listResult.map((item) => {
            if (["published", "submitted", "error"].includes(item.status)) {
              item.disabled = true;
            }
            return item;
          });
          setAllQuestions(data || []);
          setQuestionTotal(res.data.totalCount);
        } else {
          setQuestionLoading(false);
          setQuestionStatus("submitted");
        }
      })
      .catch((rej) => {
        setQuestionLoading(false);
        setQuestionStatus("submitted");
      });
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (selectedRowKeys) => {
      return {
        disabled: selectedRowKeys.disabled,
      };
    },
  };

  const publishQuestion = () => {
    if (selectedRowKeys.length < 1) {
      message.warning("您还未选择任何问题");
      return;
    }
    handlePublish({
      userId: currentUser.username,
      interviewId: curId,
      questionIds: selectedRowKeys.join(","),
    }).then((res) => {
      if (res.status) {
        summaryHistory(curId);
      }
    });
  };

  const columns = [
    {
      title: "面试id",
      dataIndex: "interviewId",
      key: "interviewId",
      render: (text) => <a>{text.substring(0, 3)}</a>,
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      key: "startTime",
      render: (text) => <p>{moment(text).format("YYYY/MM/DD")}</p>,
    },
    {
      title: "面试时长",
      dataIndex: "time",
      key: "time",
      render: (_, { cost }) => {
        const realCost = cost / 100;
        return <p>{formatSeconds((realCost * 60) / payState.price)}</p>;
      },
    },
    {
      title: "费用",
      key: "cost",
      dataIndex: "cost",
      render: (_, { cost }) => (
        <p>
          {cost / 100}
          <img
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
            alt="logo"
            style={{ height: "15px", verticalAlign: "sub" }}
          />
        </p>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => toUrl("/detail", `id=${record.interviewId}`)}>
            复盘
          </a>
          {currentUser?.abConfig?.mjExp === 0 &&
            (record.mjTaskStatus === "unsubmitted" ? (
              <a
                onClick={() => openQuestionSummary(record.interviewId)}
                style={{ color: "rgb(255, 139, 22)" }}
              >
                总结面试问题
              </a>
            ) : (
              <span
                onClick={() => {
                  setCurId(record.interviewId);
                  setQuestionShow(true);
                  summaryHistory(record.interviewId);
                }}
                style={{ color: "rgb(88,166,92)", cursor: "pointer" }}
              >
                查看总结
              </span>
            ))}
        </Space>
      ),
    },
  ];

  const questionsColumns = [
    {
      title: "问题",
      dataIndex: "question",
      key: "question",
      render: (_, record) => {
        return (
          <div>
            <p>原始问题: {record.question}</p>
            <p style={{ color: "rgb(88,166,92)" }}>
              修正问题: {record.rewriteQuestion}
            </p>
          </div>
        );
      },
    },
    {
      title: "状态",
      key: "action",
      width: 75,
      render: (_, record) => (
        <p>
          {record.status === "unpublished" ? (
            "待发表"
          ) : record.status === "submitted" ? (
            "正在处理中"
          ) : record.status === "published" ? (
            <span style={{ color: "rgb(88,166,92)" }}>已发表</span>
          ) : (
            <div style={{ color: "red" }}>
              错误&nbsp;
              <Popover content={record.statusMessage} title="错误原因">
                <QuestionCircleTwoTone style={{ marginLeft: "0px" }} />
              </Popover>
            </div>
          )}
        </p>
      ),
    },
  ];

  const asrStatistics = () => {
    reportAsrStatistics({
      userId: currentUser.username,
    }).then((res) => {
      if (res.status) {
        setStatics(res.data);
      }
    });
  };

  useEffect(() => {
    getHistory();
    asrStatistics();
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "history.0.0.0",
      extInfo: JSON.stringify({ spmPre, source }),
    });
  }, []);

  return (
    <div className="historyContainer">
      <div className="sentenceBox">
        <div className="sentenceBox-box">
          <div>
            <p className="sentenceBox-inviteTitle">反馈错误句子数量</p>
            <p className="sentenceBox-inviteCount">{statics.totalCnt}</p>
          </div>
          <div>
            <p className="sentenceBox-inviteTitle">被采纳数</p>
            <p className="sentenceBox-inviteCount">{statics.adoptCnt}</p>
          </div>
          <div>
            <p className="sentenceBox-inviteTitle">
              未采纳数{" "}
              <Popover
                content={`未被采纳的原因通常是：重复提交、无效提交等，具体可咨询客服`}
                title="规则"
              >
                <QuestionCircleTwoTone style={{ marginLeft: "0px" }} />
              </Popover>
            </p>
            <p className="sentenceBox-inviteCount">{statics.rejectCnt}</p>
          </div>
          <div>
            <p className="sentenceBox-inviteTitle">获得奖励时长(分)</p>
            <p className="sentenceBox-inviteCount">{statics.rewardAmt}</p>
          </div>
        </div>
        <div className="feedbackTips">
          <p>
            为什么邀请您反馈错误？
            <span className="feedbackTips-answer">
              反馈错误可以优化OfferWing
              AI的语音识别准确度，您反馈的句子一旦被采纳，您的面试语音识别将会更加准确！
            </span>
          </p>
          <p>
            如何反馈错误？
            <span className="feedbackTips-answer">
              进入面试复盘页面，选择您认为识别错误的语音语句，进行更正后点击反馈按钮即可
            </span>
          </p>
          <p>
            反馈是否有奖励？
            <span className="feedbackTips-answer">
              每有一条您反馈的句子被采纳，您将
              <span style={{ color: "red" }}>获赠一分钟时长</span>
              ，反馈数量无上限。我们的审核时间是24小时，审核结束被采纳后时长会自动充值到您的账户
            </span>
          </p>
        </div>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={interviewList}
        rowKey="interviewId"
        pagination={{
          defaultCurrent: 1,
          pageSize: 20,
          total,
          onChange(page, pageSize) {
            getHistory(page - 1);
          },
          position: ["bottomRight"],
        }}
      />
      <Modal
        title="所有问题"
        open={questionShow}
        okText="发表"
        className="questionsBox"
        onOk={publishQuestion}
        onCancel={() => setQuestionShow(false)}
      >
        <p>
          勾选问题一键发表至
          <a
            onClick={() => {
              setQuestionShow(false);
              toUrl("/experience");
            }}
          >
            面经广场
          </a>
          ，问题将会被改写，您的隐私数据也将会被混淆，请放心发表~
        </p>
        {questionStatus === "submitted" && (
          <p>
            问题尚未总结完，请点这
            <a onClick={() => summaryHistory(curId)}>刷新</a>更新
          </p>
        )}
        <div>
          <Table
            scroll={{
              y: 200,
            }}
            loading={questionLoading}
            columns={questionsColumns}
            dataSource={allQuestions}
            rowKey="questionId"
            rowSelection={rowSelection}
            pagination={{
              defaultCurrent: 1,
              pageSize: 20,
              total: questionTotal,
              onChange(page, pageSize) {
                summaryHistory(curId, page - 1);
              },
              position: ["bottomRight"],
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-面试记录",
  };
});
