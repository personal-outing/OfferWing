import React from "react";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { history, request } from "ice";
import { adoptAsr, getReportAsrRecord, getVoiceList } from "@/services/voice";
import { Cascader, Input, message, Modal, Pagination } from "antd";
import store from "@/store";
import { sendLog, getAllCareers } from "@/services/meeting";
import { getAllCompanies, getAllExps, modifyMjQuestion } from "@/services/exp";
import styles from "./index.module.css";
import Item from "antd/lib/list/Item";

export default () => {
  const [userState] = store.useModel("user");
  const [modalOpen, setModalOpen] = useState(false);
  const [curData, setCurData] = useState({});
  const [allData, setAllData] = useState([]);
  const { currentUser } = userState;

  const updateData = () => {
    adoptAsr({
      id: curData.id,
      positionId: curData.positionId,
      msg: curData.msg,
      errorPart: curData.errorPart,
      correction: curData.correction,
    }).then((res) => {
      if (res.status) {
        message.success("修改成功");
        setModalOpen(false);
      }
    });
  };

  const queryList = () => {
    getReportAsrRecord({}).then((res) => {
      if (res.status) {
        console.log(9, res.data);
        setAllData(res.data);
      }
    });
  };

  useEffect(() => {
    queryList();
  }, []);

  return (
    <div className={styles.expBox}>
      {allData.map((item, idx) => {
        return (
          <div className={styles.expDetailBox} key={idx}>
            <p className={styles.expDetailQuestion}>{item.msg}</p>
            <p>
              <a
                onClick={() => {
                  setModalOpen(true);
                  setCurData(item);
                }}
              >
                编辑
              </a>
            </p>
          </div>
        );
      })}
      <Modal
        width={800}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={updateData}
        okText="确认采纳"
      >
        <div className={styles.updateBox}>
          <p>interviewId</p>
          <Input
            value={curData.interviewId}
            onChange={(e) => {
              setCurData({ ...curData, interviewId: e.target.value });
            }}
          />
          <p>userId</p>
          <Input
            value={curData.userId}
            onChange={(e) => {
              setCurData({ ...curData, userId: e.target.value });
            }}
          />
          <p>msg</p>
          <Input
            value={curData.msg}
            onChange={(e) => {
              setCurData({ ...curData, msg: e.target.value });
            }}
          />
          <p>positionId</p>
          <Input
            value={curData.positionId}
            onChange={(e) => {
              setCurData({ ...curData, positionId: e.target.value });
            }}
          />
          <p>errorPart</p>
          <Input
            value={curData.errorPart}
            onChange={(e) => {
              setCurData({ ...curData, errorPart: e.target.value });
            }}
          />
          <p>correction</p>
          <Input
            value={curData.correction}
            onChange={(e) => {
              setCurData({ ...curData, correction: e.target.value });
            }}
          />
        </div>
      </Modal>
    </div>
  );
};
