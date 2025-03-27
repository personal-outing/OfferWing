import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "ice";
import { Button, Modal, Card } from "antd";
import { sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { formatSeconds, isMobile, toUrl } from "@/utils";
import { queryPrice, queryShareInfo } from "@/services/pay";
import { getNews } from "@/services/indexPage";
import TopNotice from "../TopNotice";
import CardTitle from "../CardTitle";
import NumCard from "../NumCard";
import moment from "moment";
import SourceModal from "../SourceModal";
import QALibrary from "../QALibrary";

const LoginIndex: React.FC = () => {
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "default";
  const spmPre = searchParams.get("spm") || "default";
  const [shareInfo, setShareInfo] = useState({});
  const [newsList, setNewsList] = useState([]);
  const [originShow, setOriginShow] = useState(false);
  const [userState] = store.useModel("user");
  const [payState, payDispatcher] = store.useModel("pay");
  const { price, writePrice } = payState;
  const currentUser = userState.currentUser;

  const haveOrigin = useMemo(() => {
    return currentUser.src !== "default";
  }, [currentUser.src]);

  const getPrice = () => {
    queryPrice().then((res) => {
      payDispatcher.updatePrice(res.data);
    });
  };

  const remainTime = useMemo(() => {
    return formatSeconds((currentUser.remain * 60) / price);
  }, [currentUser]);

  const queryNews = () => {
    getNews({ start: 0, count: 5 }).then((res) => {
      if (res.status) {
        setNewsList(res.data.data || []);
      }
    });
  };

  const getShareInfo = () => {
    queryShareInfo({
      userId: currentUser.username,
    }).then((res) => {
      if (res.status) {
        setShareInfo(res.data || {});
      }
    });
  };

  useEffect(() => {
    getPrice();
    queryNews();
    getShareInfo();
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "ready.0.0.0",
      extInfo: JSON.stringify({
        spmPre,
        source,
      }),
    });
  }, []);

  return (
    <div>
      {currentUser.role === "admin" && (
        <p style={{ padding: "20px" }}>
          管理员您好！
          <a onClick={() => toUrl("/dogbrain")}>前往管理页面</a>
        </p>
      )}
      {!haveOrigin && (
        <img
          className={styles.newUserImg}
          src={
            isMobile()
              ? "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/lingqu.png"
              : "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E7%BB%84%2082%402x.png"
          }
          alt=""
          onClick={() => setOriginShow(true)}
        />
      )}

      {/* 添加余额展示区域 */}
      <div className={styles.balanceSection}>
        <div className={styles.balanceInfo}>
          <div className={styles.balanceItem}>
            <div className={styles.balanceLabel}>剩余余额&nbsp;</div>
            <div className={styles.balanceValue}>
              {currentUser.remain}{" "}
              <img
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                alt="logo"
                style={{ height: "20px", verticalAlign: "sub" }}
              />
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <Button
              type="primary"
              className={styles.rechargeButton}
              onClick={() => toUrl("/pay")}
            >
              限时优惠 · 点击充值
            </Button>
            <Button
              type="primary"
              className={`${styles.rechargeButton} ${styles.inviteButton}`}
              onClick={() => toUrl("/share")}
            >
              邀请有礼 · 可提现
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.mainFeatures}>
          <Card className={styles.featureCard}>
            <div className={styles.featureContent}>
              <div className={styles.featureInfo}>
                <h2>面试助力</h2>
                <p>实时语音识别，快速精准答案</p>
                <p>简历个性化回答，自定义问答库</p>
                <p className={styles.featureDesc}>可用时长：{remainTime}</p>
              </div>
              <Button
                type="primary"
                size="large"
                className={styles.featureButton}
                onClick={() => toUrl("/meetingtask")}
              >
                开始面试
              </Button>
            </div>
          </Card>

          <Card className={styles.featureCard}>
            <div className={styles.featureContent}>
              <div className={styles.featureInfo}>
                <h2>笔试助力</h2>
                <p>无惧切屏检测，高效提取问题</p>
                <p>支持北森题库、行为测评</p>
                <p className={styles.featureDesc}>
                  可答题数：{Math.floor(currentUser.remain / writePrice)}题
                </p>
              </div>
              <Button
                type="primary"
                size="large"
                className={styles.featureButton}
                onClick={() => toUrl("/writingtask")}
              >
                开始笔试
              </Button>
            </div>
          </Card>
        </div>

        <div className={styles.secondaryFeatures}>
          <Card
            title={<CardTitle text="快捷入口" />}
            className={styles.quickLinks}
          >
            <div className={styles.quickLinksGrid}>
              <Button
                type="text"
                className={styles.quickLinksButton}
                onClick={() => toUrl("/history")}
              >
                面试记录
              </Button>
              <Button
                type="text"
                className={styles.quickLinksButton}
                onClick={() => toUrl("/writinghistory")}
              >
                笔试记录
              </Button>
              <Button
                type="text"
                className={styles.quickLinksButton}
                onClick={() => toUrl("/setup", "type=pq")}
              >
                自定义问答
              </Button>
              <Button
                type="text"
                className={styles.quickLinksButton}
                onClick={() =>
                  window.open(
                    "https://doc.offerwing.cn/docs/interview/guide",
                    "_blank"
                  )
                }
              >
                面试教程
              </Button>
              <Button
                type="text"
                className={styles.quickLinksButton}
                onClick={() =>
                  window.open(
                    "https://doc.offerwing.cn/docs/writing/guide",
                    "_blank"
                  )
                }
              >
                笔试教程
              </Button>
            </div>
          </Card>

          <Card
            className={styles.newsCard}
            title={<CardTitle text="最新公告" />}
            extra={<a onClick={() => toUrl("/news")}>更多</a>}
          >
            <ul className={styles.rightNewsCardUl}>
              <li
                style={{
                  color: "#1197FF",
                  backgroundColor: "rgb(244,246,252)",
                }}
              >
                <p onClick={() => toUrl("/share")}>
                  邀请有礼活动现已开启，分享您的专属链接，现金时长等你来拿！
                  <span style={{ color: "#323232", cursor: "pointer" }}>
                    查看详情
                  </span>
                </p>
                <p className={styles.newsDate}>2024-08-01</p>
              </li>
              {newsList.slice(0, 2).map((item, idx) => {
                const date = moment(item.gmtCreate);
                // 格式化日期字符串
                const formattedDate = date.format("YYYY-MM-DD");
                return (
                  <li key={idx}>
                    <p onClick={() => toUrl("/news", `id=${idx}`)}>
                      {item.title}{" "}
                      <span style={{ color: "#323232", cursor: "pointer" }}>
                        查看详情
                      </span>
                    </p>
                    <p className={styles.newsDate}>{formattedDate}</p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
      {/* <Card
        title={<CardTitle text="自定义问答库-提前复习，预设答案" />}
        className={styles.normalCard}
        style={{ marginTop: "10px" }}
      >
        <QALibrary />
      </Card> */}
      <Modal
        open={originShow}
        onCancel={() => setOriginShow(false)}
        footer={false}
      >
        <SourceModal isDashboard={true} phone={currentUser.username} />
      </Modal>
    </div>
  );
};

export default LoginIndex;
