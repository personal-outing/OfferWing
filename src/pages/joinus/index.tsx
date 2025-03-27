import styles from "./index.module.css";

export default function JoinUs() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>成为市场合伙人</h1>

      <div className={styles.highlight}>
        <strong>
          我们持续招募市场合伙人，市场合伙人可以获得比普通用户更高的收益分成！
        </strong>
      </div>

      <section className={styles.section}>
        <h2>普通用户奖励规则如下：</h2>
        <ul>
          <li>
            每邀请一位用户，用户充值后可获得充值使用金额的
            <span className={styles.redText}>10%</span>奖励
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>成为合伙人后，奖励规则如下：</h2>
        <ul>
          <li>
            每邀请一位用户，用户充值后可获得充值使用金额的
            <span className={styles.redText}>20%</span>奖励
          </li>
          <li>
            被合伙人邀请的用户邀请其他用户后，可获得二级用户充值使用金额的
            <span className={styles.redText}>10%</span>奖励
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>举例：</h2>
        <p>
          合伙人邀请A，A充值并使用了90元，A邀请了B，B充值并使用了180元，
          则合伙人可获得90×0.2+180×0.1=36元奖励
        </p>
      </section>

      <div className={styles.contact}>
        想成为合伙人可联系专属客服
        <p>
          <img
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/zhaojinyu.png"
            alt=""
          />
        </p>
      </div>

      <p style={{ marginTop: "20px" }}>
        平台有权收回合伙人权限，调整分销规则，最终解释权归平台所有，
      </p>
    </div>
  );
}
