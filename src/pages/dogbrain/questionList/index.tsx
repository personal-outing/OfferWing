import React from "react";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { history, request } from "ice";
import { getVoiceList } from "@/services/voice";
import { Cascader, Input, message, Modal, Pagination } from "antd";
import store from "@/store";
import { sendLog, getAllCareers } from "@/services/meeting";
import { getAllCompanies, getAllExps, modifyMjQuestion } from "@/services/exp";
import styles from "./index.module.css";

export default () => {
  const [userState] = store.useModel("user");
  const [careerList, setCareerList] = useState<any>([]);
  const [career, setCareer] = useState("");
  const [optionsList, setOptionsList] = useState([]);
  const [allQuestionTotal, setallQuestionTotal] = useState(0);
  const [allQuestionList, setallQuestionList] = useState([]);
  const [allQuestionPage, setallQuestionPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [count, setCount] = useState("1");
  const [answer, setAnswer] = useState("");
  const [positionId, setPositionId] = useState("");
  const [companyId, setCompanyId] = useState(-1);
  const [curId, setCurId] = useState(-1);
  const [allCompany, setAllCompany] = useState([]);
  const { currentUser } = userState;

  const displayRender = (labels: string[]) => labels[labels.length - 1];

  const onChangeInCareer = (value) => {
    setCareerList(value);
    setCareer(value[value.length - 1]);
    queryAllExp(0, value[value.length - 1]);
  };

  const queryAllExp = (page = 0, id = career) => {
    getAllExps({
      userId: currentUser.username,
      start: page * 30,
      count: 30,
      positionId: id || career,
      companyId: curId,
    }).then((res) => {
      if (res.status) {
        setallQuestionList(res.data.listResult);
        setallQuestionTotal(res.data.totalCount);
      }
    });
  };

  useEffect(() => {
    if (curId && career) {
      queryAllExp(0);
      getCarrers("国内");
    }
  }, [curId]);

  const getCarrers = (region) => {
    getAllCareers({ region, companyId: curId, isMj: true }).then((res) => {
      if (res.status) {
        const curList: any = [];
        const obj: any = {};
        res.data.forEach((item) => {
          if (obj[item.occupation]) {
            obj[item.occupation].children.push({
              value: item.id,
              label: item.position,
            });
          } else {
            obj[item.occupation] = {
              value: item.occupation,
              label: item.occupation,
              children: [{ value: item.id, label: item.position }],
            };
          }
        });
        for (let key in obj) {
          curList.push(obj[key]);
        }
        setOptionsList(curList);
      }
    });
  };

  const updateData = () => {
    modifyMjQuestion({
      userId: currentUser.username,
      questionId,
      question,
      answer,
      positionId,
      companyId,
    }).then((res) => {
      if (res.status) {
        message.success("修改成功");
        setModalOpen(false);
        queryAllExp(allQuestionPage - 1);
      }
    });
  };

  const queryAllCompanies = () => {
    getAllCompanies({}).then((res) => {
      if (res.status) {
        setAllCompany(res.data);
      }
    });
  };

  useEffect(() => {
    if (optionsList.length > 0) {
      const firstPostion = optionsList[0]?.children[0] || {};
      setCareerList([optionsList[0].value, firstPostion.value] || []);
      setCareer(firstPostion.value || "");
      queryAllExp(0, firstPostion.value);
    }
  }, [optionsList]);

  useEffect(() => {
    getCarrers("国内");
    queryAllCompanies();
  }, []);

  return (
    <div className={styles.expBox}>
      <label>公司选择: &nbsp;</label>
      <div className={styles.allCompany}>
        {allCompany.map((item) => {
          return (
            <p
              key={item.id}
              style={{
                background: item.companyId === curId ? "green" : "",
                color: item.companyId === curId ? "#fff" : "#000",
              }}
              onClick={() => setCurId(item.companyId)}
            >
              {item.companyName}
            </p>
          );
        })}
      </div>
      <div className={styles.expPositions}>
        <label>岗位选择: &nbsp;</label>
        <Cascader
          value={careerList}
          // className={styles.cascader}
          options={optionsList}
          displayRender={displayRender}
          onChange={onChangeInCareer}
        />
      </div>
      <div>
        <div className={styles.expDetailBox}>
          <p className={styles.expDetailQuestion}>问题</p>
          <p>操作</p>
        </div>
        {allQuestionList.map((item, idx) => {
          return (
            <div className={styles.expDetailBox} key={idx}>
              <p className={styles.expDetailQuestion}>{item.question}</p>
              <p>
                <a
                  onClick={() => {
                    setModalOpen(true);
                    setQuestion(item.question);
                    setAnswer(item.answer);
                    setCount(item.interviewCnt);
                    setQuestionId(item.questionId);
                    setCompanyId(item.companyId);
                    setPositionId(item.positionId);
                  }}
                >
                  编辑
                </a>
              </p>
            </div>
          );
        })}
        <Pagination
          pageSize={30}
          current={allQuestionPage}
          onChange={(page) => {
            setallQuestionPage(page);
            queryAllExp(page - 1);
          }}
          total={allQuestionTotal}
          className={styles.expPagination}
        />
      </div>
      <Modal
        width={800}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={updateData}
        okText="确认修改"
      >
        <div className={styles.updateBox}>
          <p>问题</p>
          <Input.TextArea
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
            }}
          />
          <p>次数</p>
          <Input value={count} disabled={true} />
          <p>回答</p>
          <Input.TextArea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
            }}
          />
          <p>positionId</p>
          <Input
            value={positionId}
            onChange={(e) => {
              setPositionId(e.target.value);
            }}
          />
          <p>companyId</p>
          <Input
            value={companyId}
            onChange={(e) => {
              setCompanyId(parseInt(e.target.value));
            }}
          />
        </div>
      </Modal>
    </div>
  );
};
