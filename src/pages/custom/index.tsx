import PCPayModal from "@/components/PCPayModal";
import { sendLog } from "@/services/meeting";
import store from "@/store";
import { formatSeconds } from "@/utils";
import { Button, InputNumber, message } from "antd";
import { useMemo, useState } from "react";
import styles from "./index.module.css";

export default function Custom() {
  const [customSecond, setCustomSecond] = useState<number | null>(null);
  const [payState] = store.useModel("pay");
  const [state] = store.useModel("user");
  const [PCShow, setPCShow] = useState(false);
  const [payItem, setPayItem] = useState<any>({});
  const { currentUser } = state;
  const { price: salePrice, writePrice } = payState;

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

  const customPrice = useMemo(() => {
    const second = customSecond || 0;
    return parseFloat((second * 1.5).toFixed(2));
  }, [customSecond]);

  return (
    <>
      <div className={styles.paySelf2}>
        <p className={styles["paySelf-title"]}>自定义时长</p>
        <br />
        {(customSecond || 0) > 0 && (
          <p>
            总计{" "}
            <span className={styles["paySelf-numtips"]}>
              {formatSeconds((customSecond || 0) * 60)}
            </span>{" "}
            &nbsp;共{" "}
            <span className={styles["paySelf-numtips"]}>
              {((customSecond || 0) * salePrice).toFixed(2)}
            </span>
            元
          </p>
        )}
        <InputNumber
          value={customSecond}
          onChange={(val) => setCustomSecond(val)}
          className={styles["payInput"]}
          type="number"
          min={10}
          addonAfter="分钟"
          controls={false}
        />
        <br />
        <div
          onClick={() => toPay(customPrice)}
          className={styles["payBtn"]}
          style={{
            width: "110px",
            border: "1px solid #1890ff",
          }}
        >
          支付
        </div>
      </div>
      <PCPayModal
        payShow={PCShow}
        setPayShow={setPCShow}
        payItem={payItem}
        queryHistory={() => {}}
      />
    </>
  );
}
