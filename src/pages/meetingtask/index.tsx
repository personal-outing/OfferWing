import { useEffect, useMemo, useState } from "react";
import { definePageConfig, useSearchParams } from "ice";
import { InfoCircleTwoTone, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Cascader,
  Popover,
  Select,
  message,
  Upload,
  Radio,
  Space,
  Modal,
  Card,
} from "antd";
import {
  getAllCareers,
  getCodeLan,
  queryComanyInfo,
  sendLog,
  updateComanyInfo,
} from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { formatSeconds, toUrl } from "@/utils";
import { queryPrice } from "@/services/pay";
import { getPQList } from "@/services/tech";
import { checkHasResume, uploadResume } from "@/services/user";
import TopNotice from "@/components/TopNotice";
import CardTitle from "@/components/CardTitle";
import SourceModal from "@/components/SourceModal";

const Option = Select.Option;

function getDfConfig() {
  const obj = JSON.parse(localStorage.getItem("df_config") || "{}");
  obj.careerList = JSON.parse(obj.careerList || "[]");
  obj.region = obj.region || "国内";
  return obj;
}

const Meetingtask: React.FC = () => {
  const dfConfig = getDfConfig();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "default";
  const spmPre = searchParams.get("spm") || "default";
  let defaultCareer = searchParams.get("career") || dfConfig.career;
  let defaultRegion = searchParams.get("region") || dfConfig.region;
  let defaultUsePQ = searchParams.get("usePQ") || dfConfig.usePQ;
  let defaultCareeText = dfConfig.careeText || "";
  let defaultCareerList = JSON.parse(searchParams.get("careerList") || "[]");
  defaultCareerList =
    defaultCareerList.length > 0 ? defaultCareerList : dfConfig.careerList;
  const [career, setCareer] = useState(defaultCareer);
  const [careeText, setCareeText] = useState(defaultCareeText);
  const [mode, setMode] = useState(dfConfig.mode || "default");
  const [careerList, setCareerList] = useState(defaultCareerList);
  const [optionsList, setOptionsList] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyMsg, setCompanyMsg] = useState("");
  const [hasQA, setHasQA] = useState(false);
  const [usePQ, setUsePQ] = useState(defaultUsePQ == true);
  const [originShow, setOriginShow] = useState(false);
  const [curCodeLang, setCurCodeLang] = useState("");
  const [codeLang, setCodeLang] = useState([]);
  const [region, setRegion] = useState(defaultRegion);
  const [hasRead, setHasRead] = useState(dfConfig.hasRead || false);
  const [userState] = store.useModel("user");
  const [payState, payDispatcher] = store.useModel("pay");
  const { price, boostPrice } = payState;
  const currentUser = userState.currentUser;
  let syn = localStorage.getItem("syn") || "";

  const haveOrigin = useMemo(() => {
    return currentUser.src !== "default";
  }, [currentUser.src]);

  const handleUploadResume = (info) => {
    const { onError, onProgress, onSuccess, file } = info;
    const isLt2M = file.size / 1024 / 1024 < 3;
    if (!isLt2M) {
      message.warning("简历大小不超过3MB！");
      onError();
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("username", currentUser.username);
    uploadResume(formData).then((res) => {
      if (res.data.success) {
        setHasResume(true);
        onSuccess();
      } else {
        message.error(res.data.reason);
        onError();
      }
    });
  };

  const config = {
    maxCount: 1,
    name: "file",
    accept: ".pdf",
    customRequest: handleUploadResume,
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const queryCodeLan = () => {
    getCodeLan({}).then((res) => {
      if (res.status) {
        setCodeLang(res.data);
        setCurCodeLang(dfConfig.curCodeLang || res.data[0].codeLang);
      }
    });
  };

  const onChangeLan = (val) => {
    setCareerList([]);
    getCarrers(val);
    setRegion(val);
    setCareer("");
    sendLog({
      type: "clk",
      uid: currentUser.username,
      spm: "ready.region.0.0",
      extInfo: JSON.stringify({
        value: val,
      }),
    });
  };

  const onChangeInCareer = (value, ev) => {
    if (value && ev) {
      setCareeText(ev[ev.length - 1].label);
      setCareerList(value);
      setCareer(value[value.length - 1]);
      queryPQList(1, value[value.length - 1]);
      sendLog({
        type: "clk",
        uid: currentUser.username,
        spm: "ready.career.0.0",
        extInfo: JSON.stringify({
          value: value[value.length - 1],
        }),
      });
    } else {
      setCareeText("");
      setCareerList([]);
      setCareer("");
    }
  };

  const displayRender = (labels: string[]) => labels[labels.length - 1];

  const getCarrers = (curRegion) => {
    getAllCareers({ region: curRegion, companyId: -1 }).then((res) => {
      if (res.status) {
        const curList: any = [];
        const obj: any = {};
        res.data.forEach((item) => {
          if (obj[item.occupation]) {
            obj[item.occupation].children.push({
              value: item.id,
              label: item.position,
            });
          } else {
            obj[item.occupation] = {
              value: item.occupation,
              label: item.occupation,
              children: [{ value: item.id, label: item.position }],
            };
          }
        });
        for (let key in obj) {
          curList.push(obj[key]);
        }
        setOptionsList(curList);
      }
    });
  };

  const getPrice = () => {
    queryPrice().then((res) => {
      payDispatcher.updatePrice(res.data);
    });
  };

  const onChangeCodeLan = (val) => {
    setCurCodeLang(val);
  };

  const onChangeMode = (e) => {
    setMode(e.target.value);
  };

  const curPrice = useMemo(() => {
    return mode === "default" ? price : boostPrice;
  }, [mode]);

  const remainTime = useMemo(() => {
    return formatSeconds(
      (currentUser.remain * 60) / (mode === "default" ? price : boostPrice)
    );
  }, [curPrice, currentUser]);

  const getCompanyInfo = () => {
    queryComanyInfo({
      userId: currentUser.username,
      positionId: career,
    }).then((res) => {
      setCompanyName(res.data?.companyName);
      setCompanyMsg(res.data?.jobDesc);
    });
  };

  const saveComanyInfo = () => {
    updateComanyInfo({
      userId: currentUser.username,
      positionId: career,
      companyName,
      jobDesc: companyMsg,
    }).then((res) => {
      if (res.status) {
        message.success("保存成功");
      } else {
        message.error(res.message);
      }
    });
  };

  const queryPQList = (cur, curCareer) => {
    getPQList({
      pqId: `${currentUser.username}_${curCareer}`,
      start: 100 * (cur - 1),
      count: 100,
    }).then((res) => {
      setHasQA(res.data?.data?.length > 0);
    });
  };

  const saveDefaultChoose = () => {
    localStorage.setItem(
      "df_config",
      JSON.stringify({
        region,
        careerList: JSON.stringify(careerList),
        career,
        careeText,
        mode,
        hasRead,
        usePQ,
        curCodeLang,
      })
    );
  };

  useEffect(() => {
    if (career) {
      getCompanyInfo();
    }
  }, [career]);

  useEffect(() => {
    getPrice();
    queryCodeLan();
    getCarrers(defaultRegion);
    checkHasResume({ username: currentUser.username }).then((res) =>
      setHasResume(res.data.success)
    );
    if (defaultCareer) {
      queryPQList(1, defaultCareer);
    }
    sendLog({
      type: "pv",
      uid: currentUser.username,
      spm: "ready.0.0.0",
      extInfo: JSON.stringify({
        spmPre,
        source,
        id: syn,
      }),
    });
  }, []);

  return (
    <div className={styles.meetingApp}>
      <TopNotice>
        春招限时特惠，<a href="/pay">去充值！</a>{" "}
        您现在处于准备面试阶段，需要您确定以下步骤：
      </TopNotice>
      <div className={styles.meetingBox}>
        <Card
          className={styles.meetingCard}
          title={<CardTitle text="环境准备" />}
        >
          <div className={styles.meetingEnv}>
            <p>
              使用前，请确保您已认真阅读
              <a
                onClick={() => {
                  sendLog({
                    type: "clk",
                    uid: currentUser.username,
                    spm: "ready.learn.guide.0",
                    extInfo: JSON.stringify({}),
                  });
                  window.open("https://doc.offerwing.cn/docs/interview/guide");
                }}
              >
                《使用教程》
              </a>
            </p>
            <Radio.Group
              value={hasRead}
              onChange={(e) => setHasRead(e.target.value)}
            >
              <Radio value={true}>我已阅读教程</Radio>
            </Radio.Group>
          </div>
        </Card>
        <Card
          className={styles.meetingCard}
          title={<CardTitle text="请选择面试地区和岗位" />}
        >
          <div className={styles.meetingRegion}>
            <p className={styles.meetingRegionItem}>
              <label>
                地区&nbsp;
                <Popover content="海外地区默认回答为英文" placement="topRight">
                  <InfoCircleTwoTone />
                </Popover>
                ：
              </label>
              <Select
                className={styles.selectBox}
                onChange={onChangeLan}
                value={region}
                style={{ width: 100, flex: 1 }}
                disabled={!hasRead}
              >
                <Option value="国内">国内</Option>
                <Option value="国外">国外</Option>
              </Select>
            </p>
            <p className={styles.meetingRegionItem}>
              <label>岗位：</label>
              <Cascader
                value={careerList}
                className={styles.cascader}
                options={optionsList}
                displayRender={displayRender}
                onChange={onChangeInCareer}
                style={{ maxWidth: 300, flex: 1 }}
                disabled={!hasRead}
              />
            </p>
          </div>
        </Card>
        <Card
          className={styles.meetingCard}
          title={<CardTitle text="技术定制" />}
        >
          <div className={styles.meetingRegion}>
            <p className={styles.meetingRegionItem}>
              <label>
                编程语言<span>（笔试协助使用）：</span>
              </label>
              <Select
                className={styles.selectBox}
                onChange={onChangeCodeLan}
                value={curCodeLang}
                style={{ width: 150, flex: 1 }}
                disabled={!hasRead}
              >
                {codeLang.map((item: any) => {
                  return (
                    <Option value={item.codeLang} key={item.id}>
                      {item.codeLang}
                    </Option>
                  );
                })}
              </Select>
            </p>
            <p className={styles.meetingRegionItem}>
              <label>是否使用您的自定义问答库：</label>
              <Select
                style={{ width: 80 }}
                value={usePQ}
                onChange={(val) => {
                  setUsePQ(val);
                }}
                disabled={!hasRead}
              >
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
              </Select>
            </p>
            <div
              style={{ color: "#F39555", height: "50px", lineHeight: "50px" }}
            >
              {hasQA
                ? usePQ
                  ? "使用问答库，相似问题将回答您设置好的答案"
                  : "未使用问答库，所有问题将由OfferWing AI解答"
                : "当前问答库为空"}
              {hasQA ? (
                <a
                  onClick={() =>
                    toUrl(
                      "/setup",
                      `career=${career}&careerList=${JSON.stringify(
                        careerList
                      )}&tab=2`
                    )
                  }
                >
                  &nbsp;查看问答库内容
                </a>
              ) : (
                <Button
                  type="primary"
                  style={{ marginLeft: "10px" }}
                  onClick={() => toUrl("/setup", `tab=1`)}
                >
                  创建问答库
                </Button>
              )}
            </div>
          </div>
        </Card>
        <Card
          className={styles.meetingCard}
          title={<CardTitle text="模式选择" />}
        >
          <div style={{ marginTop: "20px" }}>
            <div className={styles.resumeBox}>
              <Radio.Group
                value={mode}
                onChange={onChangeMode}
                disabled={!hasRead}
              >
                <Space direction="vertical">
                  <Radio value="default">
                    常规模式 {price}
                    <img
                      src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                      alt="logo"
                      style={{ height: "15px", verticalAlign: "sub" }}
                    />
                    /分钟
                  </Radio>
                  <Radio value="resume">
                    🔥简历识别模式 {boostPrice}
                    <img
                      src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                      alt="logo"
                      style={{ height: "15px", verticalAlign: "sub" }}
                    />
                    /分钟
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
            {mode === "resume" && (
              <>
                <p className={styles.resumeTips}>
                  *
                  简历识别模式为GPT的回答会根据你的简历进行个性化回答，费用增加主要为支付prompt费用的增加
                </p>
                <div>
                  <Upload {...config}>
                    <Button
                      style={{
                        marginBottom: "10px",
                        backgroundColor: "#333",
                        color: "#fff",
                      }}
                      icon={<UploadOutlined />}
                    >
                      {hasResume ? "重新上传" : "点击上传"}
                    </Button>
                    （* PDF格式）
                  </Upload>
                  {hasResume ? (
                    <p style={{ color: "#F39555" }}>
                      &nbsp;&nbsp;您已上传简历，无需重复上传，继续上传将会覆盖更新
                    </p>
                  ) : (
                    <p>
                      &nbsp;&nbsp;上传表示您同意
                      <a
                        href="https://peuqmn915o.feishu.cn/docx/A1BjduoBdoogLnx0BoicIxYUnhd?from=from_copylink"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        《OfferWing AI数据授权使用协议及隐私政策》
                      </a>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
        <Card
          className={styles.meetingCard}
          title={<CardTitle text="余额确认" />}
        >
          <div className={styles.meetingRemain} style={{ marginTop: "20px" }}>
            <p>
              检测到余额还剩{currentUser.remain}
              <img
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                alt="logo"
                style={{ height: "15px", verticalAlign: "sub" }}
              />{" "}
              {!haveOrigin && (
                <img
                  style={{ width: 180 }}
                  src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/free.png"
                  alt=""
                  onClick={() => setOriginShow(true)}
                />
              )}
            </p>
            {currentUser.remain >= curPrice * 30 ? (
              <p style={{ color: "#F39555" }}>当前可面试时长充足</p>
            ) : currentUser.remain >= curPrice ? (
              <p style={{ color: "#F39555" }}>
                当前可面试时长为 {remainTime}
                <a onClick={() => toUrl("/pay")}>，建议充值</a>
              </p>
            ) : (
              <p style={{ color: "red" }}>
                当前可面试时长为 {remainTime}
                <a onClick={() => toUrl("/pay")}>，请先充值</a>
              </p>
            )}
          </div>
        </Card>
      </div>
      <Button
        disabled={
          !career ||
          currentUser?.remain < curPrice ||
          !hasRead ||
          (mode === "resume" && !hasResume)
        }
        className={styles.gotoBtn}
        onClick={() => {
          saveDefaultChoose();
          toUrl(
            "/meeting",
            `positionid=${career}&boost=${
              mode === "resume" ? 1 : 0
            }&t=${Date.now()}&code=${curCodeLang}&career=${encodeURIComponent(
              careeText
            )}&usePQ=${usePQ ? 1 : 0}`
          );
        }}
        type="primary"
      >
        前往面试
      </Button>
      <Modal
        open={originShow}
        style={{ textAlign: "center" }}
        onCancel={() => setOriginShow(false)}
        footer={false}
      >
        <SourceModal isDashboard={true} phone={currentUser.username} />
      </Modal>
    </div>
  );
};

export default Meetingtask;

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI - 面试助力",
  };
});
