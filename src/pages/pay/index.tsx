import { useEffect, useMemo, useState } from "react";
import { formatSeconds, formatMinutes, isMobile, isPC } from "@/utils";
import store from "@/store";
import { Button, Tabs, InputNumber, message, Popover, Alert, Rate } from "antd";
import PCPayModal from "@/components/PCPayModal";
import {
  getSubscription,
  queryPayHistory,
  queryPreferential,
} from "@/services/pay";
import moment from "moment";
import { fetchUserInfo } from "@/services/user";
import { sendLog } from "@/services/meeting";
import { definePageConfig, useSearchParams } from "ice";
import "./index.css";
import styles from "./slider.module.css";
import { getUserComments } from "@/services/indexPage";
import TopNotice from "@/components/TopNotice";

const pay = ["充时首选", "口碑载道", "保驾护航", "全力以赴"];
const backColor = [
  "#fff",
  "linear-gradient(270deg, #FAB583 4%, #FFD555 100%)",
  "linear-gradient(270deg, #4096FE 4%, #3168FF 100%)",
  "linear-gradient(270deg, #323232 4%, #424547 100%)",
  "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)",
  "linear-gradient(120deg, #f093fb 0%, #f5576c 100%)",
];
const textColor = ["#333", "#f39555", "#3168FF", "#333"];
const priceColor = ["#333", "#333", "#fff", "#fff"];
const countColor = ["#3D3D3D", "#fff", "#fff", "#F39555"];
const countNumColor = ["#fff", "#F39555", "#0062FF", "#fff"];

function Subscribe() {
  const [searchParams] = useSearchParams();
  const spmPre = searchParams.get("spm") || "default";
  const source = searchParams.get("source") || "default";
  const [state, userDispatcher] = store.useModel("user");
  const [payState] = store.useModel("pay");
  const { price: salePrice, writePrice } = payState;
  const { currentUser } = state;
  const { remain, username, abConfig = {} } = currentUser;
  const [payItem, setPayItem] = useState<any>({});
  const [PCShow, setPCShow] = useState(false);
  const [customSecond, setCustomSecond] = useState<number | null>(null);
  const [activeKey, setActiveKey] = useState("1");
  const [orderList, setOrderList] = useState([]);
  const [discountInfo, setDiscountInfo] = useState([]);
  const [comments, setComments] = useState([]);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [isNew, setIsNew] = useState(false);
  const [payTypeKey, setPayTypeKey] = useState("time");

  const payTabs = [
    {
      key: "time",
      label: "按需充值",
      children: (
        <>
          <div className="recommandBox recommandBox2">
            {discountInfo.map((item: any, index) => {
              return (
                <div key={index} className="paySelf">
                  {index === 1 && <div className="hot-tag">🔥 热门套餐</div>}
                  <p
                    className="paySelf-tips"
                    style={{
                      backgroundColor: index === 0 ? "#f0f0f0" : "#fff",
                      color: textColor[index],
                    }}
                  >
                    {isNew ? "🔥首单优惠" : pay[index]}
                  </p>
                  <div
                    className="payself-top"
                    style={{ background: backColor[index] }}
                  >
                    <div
                      className="payself-top-priceBox"
                      style={{
                        color: priceColor[index],
                      }}
                    >
                      <p className="payself-top-priceBox-time">
                        {(item.oriDuration + item.extraDuration) * 1.5}
                        <img
                          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                          alt="logo"
                          style={{ height: "20px", verticalAlign: "middle" }}
                        />
                      </p>
                      <p>
                        <span
                          style={{
                            fontSize: "30px",
                            fontWeight: "400",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>¥</span>
                          {item.oriDuration * salePrice}
                        </span>
                        &nbsp;
                        <span
                          style={{
                            textDecoration: "line-through",
                          }}
                        >
                          ¥{(item.oriDuration + item.extraDuration) * 1.5}
                        </span>
                      </p>
                    </div>
                    <div
                      className="payself-top-meeting"
                      style={{
                        backgroundColor: countColor[index],
                        color: countNumColor[index],
                      }}
                    >
                      {item.meetingCount} 场面试
                    </div>
                  </div>
                  <ul className="payself-content">
                    <li>
                      包含赠送
                      <span style={{ color: "#F39555" }}>
                        {item.extraDuration}
                        <img
                          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                          alt="logo"
                          style={{ height: "15px", verticalAlign: "sub" }}
                        />
                      </span>
                    </li>
                    <li style={{ fontWeight: "bold" }}>
                      预计可面试时长
                      <span style={{ color: "#F39555" }}>
                        {item.oriDuration + item.extraDuration}分钟
                      </span>
                    </li>
                    <li style={{ fontWeight: "bold" }}>
                      解决笔试难题
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        {Math.floor(
                          ((item.oriDuration + item.extraDuration) * 1.5) /
                            writePrice
                        )}
                        道
                      </span>
                    </li>
                    <li>
                      实时辅助回答
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        无限次
                      </span>
                    </li>
                    <li>
                      秒杀代码题
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        无限道
                      </span>
                    </li>
                    <li>
                      自定义问答库
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        {item.count}道
                      </span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => toPay(item.oriDuration * salePrice)}
                    className="payBtn"
                    type="text"
                  >
                    支付
                  </Button>
                </div>
              );
            })}
          </div>
          <p style={{ fontWeight: "bold", margin: "10px 0" }}>
            注：面试功能和笔试功能是或者的关系，价格表展示的是能单独支持各个功能的最大额度
          </p>
        </>
      ),
    },
    {
      key: "subscription",
      label: "超值套餐",
      children: (
        <>
          <div className="recommandBox" style={{ justifyContent: "center" }}>
            {subscriptionList.map((item, idx) => {
              return (
                <div className="paySelf" key={idx}>
                  {idx === 2 && <div className="hot-tag">🔥 热门套餐</div>}
                  <p
                    className="paySelf-tips"
                    style={{
                      backgroundColor: "#fff",
                      color: textColor[2],
                    }}
                  >
                    🔥火力全开
                  </p>
                  <div
                    className="payself-top"
                    style={{ background: backColor[idx + 4] }}
                  >
                    <div
                      className="payself-top-priceBox"
                      style={{
                        color: priceColor[2],
                      }}
                    >
                      <p className="payself-top-priceBox-time">
                        ¥{item.price}&nbsp;
                        {item.prePrice && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              fontSize: "16px",
                            }}
                          >
                            ¥{item.prePrice}
                          </span>
                        )}
                      </p>
                      <p>
                        <span
                          style={{
                            fontSize: "30px",
                            fontWeight: "400",
                          }}
                        >
                          {item.type}
                        </span>
                      </p>
                    </div>
                    <div
                      className="payself-top-meeting"
                      style={{
                        backgroundColor: countColor[2],
                        color: countNumColor[2],
                      }}
                    >
                      无限场面试
                    </div>
                  </div>
                  <ul className="payself-content">
                    <li>
                      VIP答疑群
                      <span style={{ color: "#F39555" }}>24小时服务</span>
                    </li>
                    <li>
                      实时辅助回答
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        无限次
                      </span>
                    </li>
                    <li>
                      秒杀代码题
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        无限道
                      </span>
                    </li>
                    <li style={{ fontWeight: "bold" }}>
                      解决笔试难题
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        无限道
                      </span>
                    </li>
                    <li>
                      自定义问答库
                      <span style={{ fontWeight: "bold", color: "#F39555" }}>
                        无限道
                      </span>
                    </li>
                  </ul>
                  <Button
                    className="payBtn"
                    type="primary"
                    onClick={() => toPay(item.price)}
                  >
                    立即订阅
                  </Button>
                </div>
              );
            })}
          </div>
          <p style={{ width: "100%", margin: "10px 0", fontWeight: "bold" }}>
            注：包月包季套餐使用期限内未使用完可保留至余额继续使用，使用完期限内自动续费无限使用！
          </p>
        </>
      ),
    },
  ];

  const toPay = (price) => {
    if (!price || price === 0) {
      message.info("时长至少为10分钟哦");
      return;
    }
    setPayItem({ price });
    setPCShow(true);
    sendLog({
      type: "clk",
      uid: currentUser.username,
      spm: "pay.order.choose.0",
      extInfo: JSON.stringify({
        price,
        curRemain: currentUser.remain,
      }),
    });
  };

  const queryHistory = () => {
    queryPayHistory({ phone: currentUser.username }).then((res) => {
      if (res.status) {
        const list =
          res.data.sort(
            (l, r) => new Date(r.time).getTime() - new Date(l.time).getTime()
          ) || [];
        const isOld = list.some((item) => {
          return item.finished == 1;
        });
        setOrderList(list);
        setIsNew(!isOld);
      }
    });
  };

  const onChangeTab = (key: string) => {
    setActiveKey(key);
    if (key === "2") {
      if (orderList.length === 0) {
        queryHistory();
      }
    }
  };

  const querySubcription = () => {
    getSubscription({}).then((res) => {
      if (res.status) {
        const prePriceMap = [499, 998, 1998];
        setSubscriptionList(
          res.data
            .sort((a, b) => a.validtime - b.validtime)
            .map((item, index) => ({
              ...item,
              prePrice: prePriceMap[index] || "",
            }))
        );
      }
    });
  };

  const customPrice = useMemo(() => {
    const second = customSecond || 0;
    return parseFloat((second * 1.5).toFixed(2));
  }, [customSecond]);

  useEffect(() => {
    fetchUserInfo().then((res) => {
      res.data.remain = (res?.data?.remain || 0) / 100;
      userDispatcher.updateCurrentUser({
        ...res.data,
      });
    });
    queryPreferential({ userId: currentUser.username }).then((res) => {
      if (res.status) {
        const newData = res.data.map((item, index) => {
          if (index in [0, 1]) {
            item.count = (index + 1) * 20;
          } else if (index === 2) {
            item.count = 80;
          } else {
            item.count = 300;
          }
          if (index in [0, 1]) {
            item.meetingCount = `${index + 1} ~ ${(index + 1) * 2}`;
          } else if (index === 2) {
            item.meetingCount = `4 ~ 8`;
          } else {
            item.meetingCount = `8 ~ 16`;
          }
          return item;
        });
        console.log(99, newData);
        setDiscountInfo(newData);
      }
    });
    getUserComments({}).then((res) => {
      setComments(res.data);
    });
    querySubcription();
    queryHistory();
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "pay.0.0.0",
      extInfo: JSON.stringify({
        curRemain: currentUser.remain,
        spmPre,
        source,
      }),
    });
  }, []);

  const tabsArr = [
    {
      label: "充值",
      key: "1",
      children: (
        <div className="payContainer-content">
          <div className="payContainer-content-regular">
            <span style={{ fontWeight: "bold" }}>充值规则：</span>
            <div className="ruleContent">
              1. 普通模式面试时长每一分钟消耗{salePrice}
              <img
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                alt="logo"
                style={{ height: "15px", verticalAlign: "sub" }}
              />
              ，笔试按解题个数收费，一道题
              {writePrice}
              <img
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                alt="logo"
                style={{ height: "15px", verticalAlign: "sub" }}
              />
              。定制模式价格详见使用页
              <br />
              2. 面试实际扣费会按使用分钟数计算，笔试按解题个数和AI选择计算
              <br />
              <Popover
                content={() => (
                  <img
                    style={{ width: 150, height: 150 }}
                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/kefu2.png"
                  />
                )}
              >
                <p
                  style={{
                    maxWidth: "550px",
                    color: "#999",
                  }}
                  onClick={() => {
                    sendLog({
                      type: "clk",
                      uid: currentUser.username,
                      spm: "pay.help.0.0",
                      extInfo: JSON.stringify({
                        curRemain: currentUser.remain,
                      }),
                    });
                  }}
                >
                  <span style={{ textDecoration: "underline" }}>
                    定制金额充值、余额退款
                  </span>
                  等其它支付问题，都可以添加
                  <a style={{ color: "#F39555" }}>小助手企业微信</a>解决
                </p>
              </Popover>
            </div>
          </div>
          <Tabs
            items={payTabs}
            activeKey={payTypeKey}
            onChange={setPayTypeKey}
            centered
            style={{ marginTop: 20 }}
            className="pay-tabs2"
          />
          <div>
            支付表示同意
            <a
              target="_blank"
              href="https://peuqmn915o.feishu.cn/docx/ARAfd2juUoX0trxQ05xcyMtInkg?from=from_copylink"
            >
              《OfferWing AI支付协议》
            </a>
          </div>
        </div>
      ),
    },
    {
      label: "支付记录",
      key: "2",
      children: (
        <div className="historyContainer">
          <div className="historyBox">
            <p>支付时间</p>
            <p>订单编号</p>
            <p>支付金额</p>
            <p>支付状态</p>
          </div>
          {orderList.map((item) => {
            const {
              id = "",
              orderid = "",
              price,
              time = "",
              finished = 1,
            } = item;
            return (
              <div className="historyBox" key={id}>
                <p>{moment(time).format("YYYY/MM/DD")}</p>
                <p>{orderid.substring(0, 8)}</p>
                <p>{price}元</p>
                <p>{finished === 1 ? "支付成功" : "支付失败"}</p>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      label: "用户评价",
      key: "3",
      children: (
        <div className={styles.userReview} id="userReview">
          <h1>用户真实Offer Show</h1>
          <div>
            <div className={styles.offerShow}>
              {comments.map((item, idx) => {
                return (
                  <div key={idx} className={styles["userReview-item"]}>
                    <div style={{ marginBottom: 20, fontWeight: 500 }}>
                      <div style={{ textAlign: "center" }}>
                        <img
                          style={{
                            width: "50px",
                            margin: "0 auto",
                          }}
                          src={item.logoUrl}
                          alt=""
                        />
                        <span>{item.companyName}</span>
                      </div>
                      <div>用户名：{item.userName}</div>
                      <div>
                        评分:
                        {isPC() && (
                          <Rate
                            className="rate"
                            value={item.rateScore}
                            disabled
                          />
                        )}
                        <span> {item.rateScore}/5</span>
                      </div>
                      <div>学校：{item.school}</div>
                      <div>
                        岗位:
                        {item.position}
                      </div>
                      <div>
                        岗位类型:
                        {item.positionType}
                      </div>
                      <div>
                        使用时长：
                        {item.usage}分钟
                      </div>
                    </div>
                    <p className={styles["userReview-text"]}>
                      "{item.comment}"
                    </p>
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontWeight: "bold",
                          color: "green",
                          textAlign: "center",
                        }}
                      >
                        Offer Show
                      </p>
                      <img
                        style={{
                          width: "150px",
                          height: "80px",
                          margin: "0 auto 20px",
                        }}
                        src={item.offerUrl}
                        alt=""
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <h1 style={{ marginTop: "10px" }}>群聊截图一目了然</h1>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                margin: "50px auto",
                justifyContent: "center",
                overflow: "auto",
              }}
            >
              {[
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/20240906-113246.jpeg",
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/20240906-113234.jpeg",
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/20240906-113229.jpeg",
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/924-1.png",
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/9-24-2.jpg",
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/666.png",
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/1214-2.jpg",
                "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/1214.jpg",
              ].map((item, idx) => {
                return (
                  <img
                    style={{ marginLeft: "15px", height: "400px" }}
                    key={idx}
                    src={item}
                    alt=""
                  />
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="payContainer">
      <TopNotice>
        品牌大更新，全场充值最低{" "}
        <span
          style={{
            textDecoration: "underline",
            textDecorationColor: "#F39555",
            textUnderlineOffset: "4px",
          }}
        >
          1
          <img
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
            style={{ width: "16px", verticalAlign: "sub" }}
          />
          =0.85元
        </span>
        ，还有包月包季套餐，助你面试一臂之力！
      </TopNotice>
      <Tabs
        style={{
          margin: "15px 20px",
        }}
        onChange={onChangeTab}
        activeKey={activeKey}
        type="card"
        items={tabsArr}
        tabBarStyle={{
          marginBottom: "20px",
          fontSize: "16px",
        }}
        tabBarGutter={8}
        className="pay-tabs"
      />
      <div className="payContainer-topContainer">
        <div className="payContainer-myEquity">
          <div className="payContainer-myEquity-p">
            <span style={{ fontWeight: "bold" }}>账户：</span>
            <span className="headBanner-account-number">{username}</span>
          </div>
          <div className="payContainer-myEquity-p">
            <span style={{ fontWeight: "bold" }}>余额：</span>
            <span style={{ color: "#F39555" }}>{remain}</span>
            <span style={{ fontSize: "12px", color: "#F39555" }}>
              <img
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                alt="logo"
                style={{ height: "15px", verticalAlign: "bottom" }}
              />
            </span>
          </div>
          <div className="payContainer-myEquity-p">
            <span style={{ fontWeight: "bold" }}>最大面试时长：</span>
            <span>{formatSeconds((remain * 60) / salePrice)}</span>
          </div>
          <div className="payContainer-myEquity-p">
            <span style={{ fontWeight: "bold" }}>最大笔试条数：</span>
            <span>{parseInt(String(remain / writePrice))}道</span>
          </div>
        </div>
      </div>
      <PCPayModal
        payShow={PCShow}
        setPayShow={setPCShow}
        payItem={payItem}
        queryHistory={queryHistory}
      />
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-充值中心",
  };
});

export default Subscribe;
