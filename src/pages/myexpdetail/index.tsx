import { useEffect, useRef, useState } from "react";
import { history, useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import { sendLog } from "@/services/meeting";
import store from "@/store";
import { getMjQuestionStatus, handlePublish } from "@/services/exp";
import styles from "./index.module.css";
import { toUrl } from "@/utils";
import { Button, message, Modal, Popover, Table } from "antd";
import React from "react";

function Myexpdetail() {
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get("id");
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [questionLoading, setQuestionLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [questionStatus, setQuestionStatus] = useState("finished");
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  const questionsColumns = [
    {
      title: "原始问题",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "状态",
      key: "action",
      width: 120,
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

  const publishQuestions = () => {
    if (selectedRowKeys.length < 1) {
      message.warning("您还未选择任何问题");
      return;
    }
    handlePublish({
      userId: currentUser.username,
      interviewId,
      questionIds: selectedRowKeys.join(","),
    }).then((res) => {
      if (res.status) {
        summaryHistory();
      }
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

  const summaryHistory = (page = 0) => {
    setAllQuestions([]);
    setQuestionLoading(true);
    getMjQuestionStatus({
      userId: currentUser.username,
      interviewId,
      start: page * 30,
      count: 30,
    })
      .then((res) => {
        if (res.status) {
          setQuestionLoading(false);
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

  useEffect(() => {
    summaryHistory();
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
    <div className={styles.detailContainer}>
      <p>
        <a onClick={() => toUrl("/experience")}>返回上一级</a>
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>interview id:</span> {interviewId}
      </p>
      {questionStatus === "submitted" && (
        <p>
          问题尚未总结完，请点这
          <a onClick={() => summaryHistory()}>刷新</a>更新
        </p>
      )}
      <Table
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
            summaryHistory(page - 1);
          },
          position: ["bottomRight"],
        }}
      />
      <div style={{ textAlign: "center", marginTop: '10px' }}>
        <Button onClick={publishQuestions} type="primary">
          发表问题
        </Button>
      </div>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-我的面经",
  };
});

export default Myexpdetail;
