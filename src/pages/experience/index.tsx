import React from "react";
import { useEffect, useState } from "react";
import { Pagination } from "antd";
import { useSearchParams } from "@ice/runtime";
import { getAllCompanies, getMjInterviewStatus } from "@/services/exp";
import { definePageConfig } from "ice";
import { sendLog } from "@/services/meeting";
import store from "@/store";
import { toUrl } from "@/utils";
import styles from "./index.module.css";

const back = ["#95e1d3", "#cadefc", "#fce38a", "#fcbad3"];

function Experience() {
  const [searchParams] = useSearchParams();
  const spmPre = searchParams.get("spm") || "default";
  const [userState] = store.useModel("user");
  const [myQuestionList, setMyQuestionList] = useState([]);
  const [myQuestionTotal, setMyQuestionTotal] = useState(0);
  const [myQuestionPage, setMyQuestionPage] = useState(1);
  const [allCompany, setAllCompany] = useState([]);
  const { currentUser } = userState;

  const queryMyInterviews = (page = 0) => {
    getMjInterviewStatus({
      userId: currentUser.username,
      start: page * 10,
      count: 10,
    }).then((res) => {
      if (res.status) {
        setMyQuestionList(res.data.listResult);
        setMyQuestionTotal(res.data.totalCount);
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
    queryMyInterviews();
    queryAllCompanies();
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "experience.0.0.0",
      extInfo: JSON.stringify({ spmPre }),
    });
  }, []);

  return (
    <div className={styles.expContainer}>
      <p style={{ color: "rgba(88,166,92)" }}>
        *面经广场是给所有用户开放的最新最真实的面试题目，所有题目皆来自于实际面试，我们欢迎大家分享您的面试经验，我们会极力保护您的隐私，所有问题都已经过用户授权,并经过混淆处理，祝愿大家一起拿到心仪的offer！
      </p>
      <h3>我的面经</h3>
      <div className={styles.expBox}>
        <div className={styles.expTable}>
          <div className={styles.expDetailBox}>
            <p>Interview Id</p>
            <p>操作</p>
          </div>
          {myQuestionList.length > 0 ? (
            myQuestionList.map((item, idx) => {
              return (
                <div className={styles.expDetailBox} key={idx}>
                  <p>{item.interviewId}</p>
                  <p>
                    <a
                      onClick={() =>
                        toUrl("/myexpdetail", `id=${item.interviewId}`)
                      }
                    >
                      查看
                    </a>
                  </p>
                </div>
              );
            })
          ) : (
            <p className={styles.expEmpty}>
              您还没有发表面经，<a onClick={() => toUrl("/history")}>去发表</a>
            </p>
          )}
          {myQuestionList.length > 0 && (
            <Pagination
              pageSize={20}
              current={myQuestionPage}
              onChange={(page) => {
                setMyQuestionPage(page);
                queryMyInterviews(page - 1);
              }}
              total={myQuestionTotal}
              className={styles.expPagination}
            />
          )}
        </div>
      </div>
      <h3>面经广场</h3>
      <div className={styles.expBox}>
        <label>公司选择</label>
        <div className={styles.allCompany}>
          {allCompany.map((item, idx) => {
            return (
              <p
                key={item.id}
                style={{
                  background: back[idx % 4],
                }}
                onClick={() =>
                  toUrl(
                    "/expdetail",
                    `id=${item.companyId}&name=${item.companyName}`
                  )
                }
              >
                {item.companyName}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-面经广场",
  };
});

export default Experience;
