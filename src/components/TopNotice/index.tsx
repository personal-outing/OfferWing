import React from "react";
import styles from "./index.module.css";

function TopNotice(props) {
  const { children } = props;
  return <div className={styles.topNoticeBox}>{children}</div>;
}

export default TopNotice;
