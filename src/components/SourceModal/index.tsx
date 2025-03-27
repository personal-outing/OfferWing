import { Button, Input, message, Radio, Select } from "antd";
import { useEffect, useState } from "react";
import styles from "./index.module.css";
import { paramsStr } from "@/utils";
import { getLoginInfo, sendLoginInfo } from "@/services/user";
import "./index.css";

const options = [
  { label: "校招", value: "school" },
  { label: "社招", value: "social" },
];
export default function SourceModal(props) {
  const { isDashboard = false, phone = "" } = props;
  const [other, setOther] = useState("");
  const [candidateType, setCandidateType] = useState("");
  const [workingYear, setWorkingYear] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [origin, setOrigin] = useState("");
  const [allOrigin, setAllOrigin] = useState([]);

  const submitForm = () => {
    if (origin == "other" && !other.trim()) {
      message.error("来源未填写！");
      return;
    }
    if (!candidateType) {
      message.error("身份未填写！");
      return;
    }
    if (
      (candidateType === "school" && !grade) ||
      (candidateType === "social" && !workingYear)
    ) {
      message.error("身份不完整！");
      return;
    }
    sendLoginInfo({
      userId: phone,
      loginInfo: {
        candidateType,
        source: origin === "other" ? other : origin,
        workingYear,
        grade,
        school,
      },
    }).then((res) => {
      if (res.status) {
        message.success("恭喜领取成功！");
        setTimeout(() => {
          location.href = `/dashboard?spm=login.0.0.0${paramsStr("&", true)}`;
        }, 500);
      }
    });
  };

  useEffect(() => {
    getLoginInfo({}).then((res) => {
      if (res.status) {
        setAllOrigin(res.data);
      }
    });
  }, []);

  return (
    <div className={styles.messageBox} style={{ animation: "toLeft .5s" }}>
      <div className={styles.title}>
        <img
          style={{
            width: "50px",
          }}
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E7%BA%A2%E5%8C%85.png"
          alt=""
        />
        <p style={{ fontWeight: "bold" }}>
          请填写您的注册信息，填写后即刻领取7.5元红包
        </p>
      </div>
      <div className={styles.messageItemBox}>
        <p className={styles.messageItemLabel}>来源：</p>
        <div className={styles.messageItemContent}>
          <Radio.Group
            style={{ lineHeight: "30px" }}
            onChange={(e) => setOrigin(e.target.value)}
            value={origin}
          >
            {allOrigin.map((item, idx) => {
              return (
                <Radio value={item.sourceId} key={idx}>
                  {item.sourceName}
                </Radio>
              );
            })}
            <Radio value="other">其它</Radio>
          </Radio.Group>
          {origin === "other" && (
            <Input
              value={other}
              onChange={(e) => {
                setOther(e.target.value);
              }}
              style={{ marginTop: "10px" }}
              placeholder="请填写您的来源"
            />
          )}
        </div>
      </div>
      <div className={styles.messageItemBox}>
        <p className={styles.messageItemLabel}>身份：</p>
        <div className={styles.messageItemContent}>
          <Radio.Group
            options={options}
            optionType="button"
            value={candidateType}
            onChange={(e) => setCandidateType(e.target.value)}
          />
        </div>
      </div>
      {candidateType === "social" && (
        <div className={styles.messageItemBox}>
          <p className={styles.messageItemLabel}>工作年限：</p>
          <Select
            value={workingYear}
            onChange={(val) => setWorkingYear(val)}
            className={styles.messageItemContent}
          >
            {["<1年", "1~3年", "4~8年", "8年以上"].map((item) => {
              return (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
        </div>
      )}
      {candidateType === "school" && (
        <>
          <div className={styles.messageItemBox}>
            <p className={styles.messageItemLabel}>年级：</p>
            <div className={styles.messageItemContent}>
              <Select
                value={grade}
                onChange={(val) => {
                  setGrade(val);
                }}
                style={{ width: "100px" }}
                className={styles.messageItemContent}
              >
                {[
                  "专科",
                  "大一",
                  "大二",
                  "大三",
                  "大四",
                  "研一",
                  "研二",
                  "研三",
                  "博士",
                  "博士后",
                ].map((item, idx) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </div>
          </div>
          <div className={styles.messageItemBox}>
            <p className={styles.messageItemLabel}>学校（选填）：</p>
            <Input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className={styles.messageItemContent}
            />
          </div>
        </>
      )}
      <div style={{ width: "100%", textAlign: "right" }}>
        {!isDashboard && (
          <a
            style={{
              color: "#999",
            }}
            href={`/?spm=login.0.0.0${paramsStr("&", true)}`}
          >
            跳过，以后再填&nbsp;&nbsp;
          </a>
        )}
        <Button type="primary" onClick={submitForm}>
          确认提交
        </Button>
      </div>
    </div>
  );
}
