import React from "react";
import { Card } from "antd";
import styles from './index.module.css'

function NumCard(props) {
  const { title = "", extra = "", num = 0, unit = "", desc = "" } = props;
  return (
    <Card className={styles.smallCard}  title={title} extra={extra}>
      <p className={styles.smallCardNum}>
        <span>{num}</span>
        <span className={styles.smallCardUnit}> {unit}</span>
      </p>
      <p className={styles.desc}>{desc}</p>
    </Card>
  );
}

export default NumCard;
