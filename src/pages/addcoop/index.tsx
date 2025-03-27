import { Button, Input, message } from "antd";
import styles from "./index.module.css";
import { addCoop } from "@/services/user";
import store from "@/store";
import { useState } from "react";

export default function AddCoop() {
  const [state] = store.useModel("user");
  const { currentUser } = state;
  const [userId, setUserId] = useState("");

  const addToCoop = () => {
    addCoop({
      username: userId,
      role: "coop",
    }).then((res) => {
      if (res.status) {
        setUserId("");
        message.success("添加成功");
      }
    });
  };
  return (
    currentUser.username === "17317526826" && (
      <div className={styles.container}>
        <p className={styles.title}>输入您要添加的合伙人账号：</p>
        <div className={styles.inputWrapper}>
          <Input
            width="400px"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="请输入合伙人账号"
          />
        </div>
        <Button type="primary" onClick={addToCoop} className={styles.button}>
          确认添加
        </Button>
      </div>
    )
  );
}
