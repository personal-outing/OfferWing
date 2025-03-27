import styles from "./index.module.css";

function Help() {
  return (
    <div className={styles.helpIcon}>
      <img
        className={styles.helpImg}
        style={{ width: "30px" }}
        src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E5%92%A8%E8%AF%A2%E6%9C%8D%E5%8A%A1.png"
        alt=""
      />
      <p className={styles.helpTitle}>客服答疑</p>
      <div className={styles.chatBox}>
        <img
          style={{
            width: "150rpx",
            maxWidth: "100px",
          }}
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/kefu2.png"
          alt=""
        />
        <p>扫码联系客服</p>
      </div>
    </div>
  );
}

export default Help;
