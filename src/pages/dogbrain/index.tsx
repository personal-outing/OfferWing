import PCPayModal from "@/components/PCPayModal";
import styles from "./index.module.css";
import { Button, Input } from "antd";
import { history } from "ice";
import { useState } from "react";

export default function HelpCenter() {
  const [PCShow, setPCShow] = useState(false);
  const [users, setUsers] = useState("");

  const testPay = () => {
    setPCShow(true);
  };
  return (
    <>
      <div>
        <Button onClick={testPay}>支付测试0.1毛</Button>&nbsp;&nbsp;
        <Button
          type="primary"
          onClick={() => history?.push("/dogbrain/voiceSlice")}
        >
          音频片段搜索
        </Button>
        &nbsp;&nbsp;
        <Button
          type="primary"
          onClick={() => history?.push("/dogbrain/voiceList")}
        >
          音频列表
        </Button>
        <br />
        <br />
        <Button onClick={() => history?.push("/dogbrain/questionList")}>
          修改问题
        </Button>
        &nbsp;&nbsp;
        <Button onClick={() => history?.push("/dogbrain/feedbackList")}>
          语音反馈审核
        </Button>
        <PCPayModal
          payShow={PCShow}
          setPayShow={setPCShow}
          payItem={{ price: 0.1 }}
        />
      </div>
      <div>
        <Input
          value={users}
          onChange={(e) => {
            setUsers(e.target.value);
          }}
        />
      </div>
    </>
  );
}
