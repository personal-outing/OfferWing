import { useState, useEffect } from "react";
import { queryPreferential } from "@/services/pay";
import store from "@/store";
import { Button } from "antd";
import "./price.css";

const pay = ["充时首选", "口碑载道", "保驾护航", "全力以赴"];
const backColor = [
  "#fff",
  "linear-gradient(270deg, #FFB583 4%, #F39555 100%)",
  "linear-gradient(270deg, #4096FE 4%, #3168FF 100%)",
  "linear-gradient(270deg, #323232 4%, #424547 100%)",
];
const textColor = ["#333", "#f39555", "#3168FF", "#333"];
const priceColor = ["#333", "#333", "#fff", "#fff"];
const countColor = ["#3D3D3D", "#fff", "#fff", "#F39555"];
const countNumColor = ["#fff", "#F39555", "#0062FF", "#fff"];
export default function Payment() {
  const [discountInfo, setDiscountInfo] = useState([]);
  const [payState] = store.useModel("pay");
  const { price: salePrice, writePrice } = payState;

  useEffect(() => {
    queryPreferential({ userId: "" }).then((res) => {
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
        setDiscountInfo(newData);
      }
    });
  }, []);

  return (
    <div className="recommandBox">
      {discountInfo.map((item, index) => {
        return (
          <div key={index} className="paySelf">
            <p
              className="paySelf-tips"
              style={{
                backgroundColor: index === 0 ? "#f0f0f0" : "#fff",
                color: textColor[index],
              }}
            >
              {pay[index]}
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
                  {item.oriDuration + item.extraDuration}分钟
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
                包含赠送时长
                <span style={{ color: "#F39555" }}>
                  {item.extraDuration}分钟
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
              <li style={{ fontWeight: "bold" }}>
                解决笔试难题
                <span style={{ fontWeight: "bold", color: "#F39555" }}>
                  {Math.floor(
                    ((item.oriDuration + item.extraDuration) * 1.5) / writePrice
                  )}
                  道
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
              type="primary"
            >
              支付
            </Button>
          </div>
        );
      })}
    </div>
  );
}
