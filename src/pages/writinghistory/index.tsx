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
import { Alert, message, Modal, Popover, Space, Table } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import "./index.css";
import { reportAsrStatistics } from "@/services/voice";
import { getWritingHistory } from "@/services/writing";

export default function Writinghistory() {
  const [searchParams] = useSearchParams();
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [userState] = store.useModel("user");
  const [payState] = store.useModel("pay");
  const currentUser = userState.currentUser;
  const [interviewList, setInterviewList] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const columns = [
    {
      title: "面试id",
      dataIndex: "interviewId",
      key: "interviewId",
      render: (text) => <a>{text.substring(0, 3)}</a>,
    },
    {
      title: "开始时间",
      dataIndex: "gmtCreate",
      key: "gmtCreate",
      render: (text) => <p>{moment(text).format("YYYY/MM/DD")}</p>,
    },
    {
      title: "解题数目",
      dataIndex: "questionCount",
      key: "questionCount",
    },
    // {
    //   title: "费用",
    //   key: "price",
    //   dataIndex: "price",
    //   render: (text) => (
    //     <p>
    //       {text / 100}
    //       <img
    //         src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
    //         alt="logo"
    //         style={{ height: "15px", verticalAlign: "sub" }}
    //       />
    //     </p>
    //   ),
    // },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => toUrl("/writingdetail", `id=${record.interviewId}`)}
          >
            复盘
          </a>
        </Space>
      ),
    },
  ];

  const getHistory = (page = 0) => {
    setLoading(true);
    getWritingHistory({
      userId: currentUser.username,
      start: page * 20,
      count: 20,
    }).then((res) => {
      if (res.status) {
        setTotal(res.data.totalCount || 0);
        let list = res.data?.array || [];
        list =
          list.sort(
            (l, r) =>
              new Date(r.gmtCreate).getTime() - new Date(l.gmtCreate).getTime()
          ) || [];
        setLoading(false);
        setInterviewList(list);
      } else {
        message.error(res.message);
      }
    });
  };

  useEffect(() => {
    getHistory(0);
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "writinghistory.0.0.0",
      extInfo: JSON.stringify({ spmPre, source }),
    });
  }, []);

  return (
    <div className="writinghistory">
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
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-笔试记录",
  };
});
