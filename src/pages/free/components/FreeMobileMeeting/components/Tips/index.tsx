import styles from "./index.module.css";

export default (props) => {
  return (
    <div style={{ fontSize: "16px" }}>
      <p className={styles.tipsTitle}>温馨提示💡：</p>
      <p style={{color: 'red'}}>手机横屏体验更加，解锁新版本！</p>
      <p>您和面试官的对话会在底部对话区域展示，主界面只展示问题和答案哦~</p>
      <p>保持安静的面试环境可以提高语音识别的准确度</p>
      <p>
        OfferWing团队会尽最大努力辅助你面试，但是鼓励候选人刻苦学习、提高技术水平
      </p>
      <p className={styles.tipsCong}>
        祝愿候选人顺利通过面试，拿到满意offer！🙌
      </p>
    </div>
  );
};
