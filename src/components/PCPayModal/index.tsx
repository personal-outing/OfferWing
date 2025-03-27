import { Button, message, Modal, Popover, Tabs } from "antd";
import store from "@/store";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { queryOrderStatus, toRecharge } from "@/services/pay";
import { fetchUserInfo } from "@/services/user";
import styles from "./index.module.css";
import "./index.css";
import { sendLog } from "@/services/meeting";

const PCPayModal = (props) => {
  const { payShow, setPayShow, payItem = {}, queryHistory = () => {} } = props;
  const [state, userDispatcher] = store.useModel("user");
  const { currentUser } = state;
  const [codeImg, setCodeImg] = useState("");
  const [orderStr, setOrderStr] = useState("");

  const checkOrder = () => {
    queryOrderStatus({ orderid: orderStr }).then((res) => {
      if (res.status) {
        const info = res.data.aoidInfo?.status || "not_exist";
        if (res.finished === 1) {
          message.success("支付成功");
          cleanData();
          setPayShow(false);
        } else {
          // not_exist 订单不存在 new 订单未支付 payed 订单已支付，未通知成功 fee_error 手续费扣除失败 success 订单已支付，通知成功 expire 订单过期
          message.info(statusStr(info));
          setPayShow(false);
        }
        sendLog({
          type: "exp",
          uid: currentUser.username,
          spm: "pay.order.paid.status",
          extInfo: JSON.stringify({
            curRemain: currentUser.remain,
            status: info,
            orderid: orderStr,
          }),
        });
        queryHistory();
        fetchUserInfo().then((res) => {
          res.data.remain = (res?.data?.remain || 0) / 100;
          userDispatcher.updateCurrentUser({
            ...res.data,
          });
        });
      }
    });
  };

  const searchOrder = () => {
    sendLog({
      type: "clk",
      uid: currentUser.username,
      spm: "pay.order.paid.0",
      extInfo: JSON.stringify({
        orderid: orderStr,
        curRemain: currentUser.remain,
      }),
    });
    checkOrder();
  };

  const getQrCode = (qrData) => {
    QRCode.toDataURL(qrData.info.qr)
      .then((url) => {
        setCodeImg(url);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const cleanData = () => {
    setOrderStr("");
    setCodeImg("");
  };

  useEffect(() => {
    return () => {
      cleanData();
    };
  }, []);

  const statusStr = (payStatus) => {
    switch (payStatus) {
      case "success":
        return "支付成功";
      case "not_exist ":
        return "订单不存在";
      case "new":
        return "订单未支付";
      case "payed":
        return "付款失败，请联系客服";
      case "fee_error":
        return "付款失败，请联系客服";
      case "expire":
        return "订单过期";
    }
    return "付款失败，请联系客服";
  };

  useEffect(() => {
    if (payShow) {
      toRecharge({ phone: currentUser.username, price: payItem.price }).then(
        (res) => {
          if (res.status) {
            const data = JSON.parse(res.data);
            setOrderStr(data.orderid);
            const qrData = JSON.parse(data.xorpay);
            getQrCode(qrData);
          }
        }
      );
    } else {
      cleanData();
    }
  }, [payShow]);

  return (
    <Modal
      width={607}
      className="payModal"
      title={null}
      open={payShow}
      footer={null}
      maskStyle={{ background: "rgba(217, 217, 217, 0.6)" }}
      maskClosable={false}
      onCancel={() => {
        setCodeImg("");
        setOrderStr("");
        setPayShow(false);
      }}
    >
      <div className={styles.payModalContainer}>
        <div className={styles.payBox}>
          <p>
            <img
              className={styles.payIcon}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E5%BE%AE%E4%BF%A1%E6%94%AF%E4%BB%98.png"
              alt=""
            />
            <img
              className={styles.payIcon}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E6%94%AF%E4%BB%98%E5%B9%B3%E5%8F%B0-%E6%94%AF%E4%BB%98%E5%AE%9D.png"
            />
            请使用微信或支付宝扫一扫二维码进行付款{" "}
          </p>
          <p>注：手机支付需要保存图片后到微信或支付宝打开</p>
          <div className={styles.payModalQRCode}>
            {codeImg ? (
              <img
                src={codeImg}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <p>生成中</p>
            )}
          </div>
        </div>
        <div className={styles.payModalOrderContent}>
          <p>付费用户：{currentUser.username}</p>
          <p>订单编号 {orderStr.substring(0, 18)}</p>
          <p>订单金额 {payItem.price}元</p>
        </div>
        <div className={styles.btnBox}>
          <Button onClick={searchOrder}>已完成支付</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PCPayModal;
