import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "./index.module.css";
import {
  BulbOutlined,
  CheckCircleTwoTone,
  EditOutlined,
} from "@ant-design/icons";

export default function QuestionItem({
  item,
  idx,
  curIdx,
  onChangeQuestion,
  displayIdx,
}) {
  const itemRef = useRef(null);
  const { question = "" } = item;

  useEffect(() => {
    if (idx === curIdx) {
      itemRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [idx, curIdx]);

  return (
    <div className={styles.questioBox} onClick={onChangeQuestion}>
      <p className={styles.questionIcon}>
        {item.finished ? (
          <CheckCircleTwoTone twoToneColor="#52c41a" />
        ) : idx === displayIdx ? (
          <BulbOutlined />
        ) : (
          <EditOutlined />
        )}
      </p>
      <p
        className={idx == curIdx ? styles.pcQuestionActive : styles.pcQuestion}
      >
        {question && (
          <span key={idx} style={{ marginBottom: 0 }}>
            {question}
          </span>
        )}
      </p>
    </div>
  );
}
