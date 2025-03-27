import { useEffect, useMemo, useState } from "react";
import styles from "./index.module.css";
import { getAllExps } from "@/services/exp";
import store from "@/store";

const Experience: React.FC = () => {
  const [allQuestionList, setallQuestionList] = useState([]);
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  const queryAllExp = (page) => {
    getAllExps({
      userId: currentUser.username,
      start: page * 10,
      count: 10,
      positionId: 2,
      companyId: -1,
    }).then((res) => {
      if (res.status) {
        setallQuestionList(res.data.listResult);
      }
    });
  };

  useEffect(() => {
    queryAllExp(0);
  }, []);

  return (
    <div>
      <div className={styles.expDetailBoxHeader}>
        <p className={styles.expDetailQuestion}>
          问题
        </p>
        <p className={styles.expDetailCnt}>
          面试出现次数
        </p>
      </div>
      {allQuestionList.map((item, idx) => {
        return (
          <div className={styles.expDetailBox} key={idx}>
            <p className={styles.expDetailQuestion}>{item.question}</p>
            <p className={styles.expDetailCnt}>{item.interviewCnt}次</p>
          </div>
        );
      })}
    </div>
  );
};

export default Experience;
