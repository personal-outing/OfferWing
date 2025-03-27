import { Popover } from "antd";
import styles from "./index.module.css";

export default (props) => {
  return (
    <div style={{ fontSize: "16px" }}>
      <p className={styles.tipsTitle}>温馨提示💡：</p>
      <p>
        1. 建议使用<span style={{ color: "red" }}>Chrome、Safari</span>
        等主流浏览器，不要使用
        <span style={{ color: "red" }}>夸克、qq浏览器</span>
        。如有问题请随时反馈小助理
        <br />
        2. 如果超过<span style={{ color: "red" }}>3分钟</span>
        答案还没有生成，请点击
        <span style={{ color: "red" }}>重新开始面试</span> <br />
      </p>
      <p>保持安静的面试环境可以提高语音识别的准确度</p>
      <p>
        OfferWing会尽最大努力辅助你面试，但是鼓励候选人刻苦学习、提高技术水平
      </p>
    </div>
  );
};
