import { useEffect, useState } from "react";
import React from "react";
import { useSearchParams } from "@ice/runtime";
import { definePageConfig } from "ice";
import { getAllCareers, sendLog } from "@/services/meeting";
import store from "@/store";
import { getAllExps, getMjQuestionStatus, handlePublish } from "@/services/exp";
import styles from "./index.module.css";
import { copyToClipboard, toUrl } from "@/utils";
import { Cascader, message, Pagination } from "antd";
import ExpDetailModal from "@/components/ExpDetailModal";

function Expdetail() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("id");
  const company = searchParams.get("name");
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [careerList, setCareerList] = useState<any>([]);
  const [optionsList, setOptionsList] = useState([]);
  const [curShowData, setCurShowData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [allQuestionList, setallQuestionList] = useState([]);
  const [allQuestionTotal, setallQuestionTotal] = useState(0);
  const [allQuestionPage, setallQuestionPage] = useState(1);
  const [career, setCareer] = useState("");
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  const displayRender = (labels: string[]) => labels[labels.length - 1];

  const onChangeInCareer = (value) => {
    setCareerList(value);
    setCareer(value[value.length - 1]);
    queryAllExp(0, value[value.length - 1]);
  };

  const getCarrers = (region) => {
    getAllCareers({ region, isMj: true, companyId: companyId }).then((res) => {
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

  const queryAllExp = (page, id = career) => {
    getAllExps({
      userId: currentUser.username,
      start: page * 20,
      count: 20,
      positionId: id || career,
      companyId: companyId,
    }).then((res) => {
      if (res.status) {
        setallQuestionList(res.data.listResult);
        setallQuestionTotal(res.data.totalCount);
      }
    });
  };

  const onOk = () => {
    copyToClipboard(
      `问题：${curShowData.question}\n答案：${curShowData.answer}`
    );
    message.success("复制成功");
    setModalOpen(false);
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
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "expdetail.0.0.0",
      extInfo: JSON.stringify({ companyId, spmPre, source }),
    });
  }, []);

  return (
    <div className={styles.detailContainer}>
      <p>
        <a onClick={() => toUrl("/experience")}>重选公司</a>
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>当前公司</span> {company}
      </p>
      <div className={styles.expBox}>
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
            <p className={styles.expDetailCnt}>面试出现次数</p>
            {/* <p>操作</p> */}
          </div>
          {allQuestionList.map((item, idx) => {
            return (
              <div className={styles.expDetailBox} key={idx}>
                <p className={styles.expDetailQuestion}>{item.question}</p>
                <p className={styles.expDetailCnt}>{item.interviewCnt}次</p>
                {/* <p>
                  <a
                    onClick={() => {
                      setModalOpen(true);
                      setCurShowData(item);
                    }}
                  >
                    查看
                  </a>
                </p> */}
              </div>
            );
          })}
          <Pagination
            pageSize={20}
            current={allQuestionPage}
            onChange={(page) => {
              setallQuestionPage(page);
              queryAllExp(page - 1);
            }}
            total={allQuestionTotal}
            className={styles.expPagination}
          />
        </div>
      </div>
      <ExpDetailModal
        curShowData={curShowData}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onOk}
      />
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-我的面经",
  };
});

export default Expdetail;
