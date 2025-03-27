import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "ice";
import {
  InfoCircleTwoTone,
  MoneyCollectOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Cascader,
  Popover,
  Select,
  Steps,
  message,
  Upload,
  Radio,
  Space,
  Input,
  Checkbox,
  Alert,
  Modal,
  Card,
} from "antd";
import {
  getAllCareers,
  queryComanyInfo,
  sendLog,
  updateComanyInfo,
} from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { formatSeconds, toUrl } from "@/utils";
import { queryPrice } from "@/services/pay";
import { getPQList } from "@/services/tech";
import { getNews } from "@/services/indexPage";
import {
  addUserOrigin,
  checkHasResume,
  fetchUserInfo,
  uploadResume,
} from "@/services/user";
import moment from "moment";
import Expdetail from "@/pages/expdetail";
import Experience from "../Experience";

const Option = Select.Option;

const LoginIndexNew: React.FC = () => {
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "default";
  const spmPre = searchParams.get("spm") || "default";
  const defaultCareer = searchParams.get("career") || "";
  const defaultRegion = searchParams.get("region") || "国内";
  const defaultCareerList = JSON.parse(searchParams.get("careerList") || "[]");
  const [currentStep, setCurrentStep] = useState(defaultCareer ? 3 : 0);
  const [career, setCareer] = useState(defaultCareer);
  const [careeText, setCareeText] = useState("");
  const [mode, setMode] = useState("default");
  const [careerList, setCareerList] = useState(defaultCareerList);
  const [optionsList, setOptionsList] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyMsg, setCompanyMsg] = useState("");
  const [newsList, setNewsList] = useState([]);
  const [hasQA, setHasQA] = useState(false);
  const [usePQ, setUsePQ] = useState(true);
  const [originShow, setOriginShow] = useState(false);
  const [origin, setOrigin] = useState("");
  const [other, setOther] = useState("");
  const [region, setRegion] = useState(defaultRegion);
  const [userState, userDispatcher] = store.useModel("user");
  const [payState, payDispatcher] = store.useModel("pay");
  const { price, boostPrice, writePrice } = payState;
  const currentUser = userState.currentUser;

  const haveOrigin = useMemo(() => {
    if (currentUser.src === "default" && spmPre === "login.0.0.0") {
      setOriginShow(true);
    }
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

  const onChangeLan = (val) => {
    setCurrentStep(1);
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
    setCurrentStep(3);
    if (currentUser?.remain < price) {
      setCurrentStep(2);
    }
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

  const queryNews = () => {
    getNews({ start: 0, count: 5 }).then((res) => {
      if (res.status) {
        setNewsList(res.data.data || []);
      }
    });
  };

  const queryPQList = (cur, curCareer) => {
    getPQList({
      pqId: `${currentUser.username}_${curCareer}`,
      start: 100 * (cur - 1),
      count: 100,
    }).then((res) => {
      if (res.data?.data?.length > 0) {
        setHasQA(true);
        setUsePQ(true);
      } else {
        setHasQA(false);
        setUsePQ(false);
      }
    });
  };

  const onChangeRadio = (e) => {
    setOrigin(e.target.value);
  };

  const handleOrigin = () => {
    if (origin == "other" && !other.trim()) {
      message.error("来源未填写！");
      return;
    }
    addUserOrigin({
      userId: currentUser.username,
      src: origin === "other" ? other : origin,
    }).then((res) => {
      if (res.status) {
        fetchUserInfo().then((res) => {
          res.data.remain = (res?.data?.remain || 0) / 100;
          userDispatcher.updateCurrentUser({
            ...res.data,
          });
          message.success("恭喜领取成功！");
          setOriginShow(false);
        });
      } else {
        message.error(res.message);
      }
    });
  };

  useEffect(() => {
    if (career) {
      getCompanyInfo();
    }
  }, [career]);

  useEffect(() => {
    getPrice();
    queryNews();
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
      }),
    });
  }, []);

  return (
    <div>
      {currentUser.role === "admin" && (
        <p>
          管理员您好！
          <a onClick={() => toUrl("/dogbrain")}>前往管理页面</a>
        </p>
      )}
      {!haveOrigin && (
        <Alert
          message={
            <span>
              <img
                style={{
                  width: "25px",
                  verticalAlign: "bottom",
                }}
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E7%BA%A2%E5%8C%85.png"
                alt=""
              />
              新老用户限时福利，点击可直接领取7.5元红包，
              <a onClick={() => setOriginShow(true)}>点击领取</a>
            </span>
          }
          type="error"
        />
      )}
      <Alert
        style={{ marginBottom: "10px" }}
        message={
          <span>
            <img
              style={{
                width: "14px",
                verticalAlign: "text-top",
              }}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/hot_fill.png"
              alt=""
            />
            品牌大更新，全场充值最低至0.85元/分钟！
            <a onClick={() => toUrl("/pay")}>前往充值</a>
          </span>
        }
        type="warning"
      />
      <div className={styles.introBox}>
        <Card style={{ flex: 1 }} title={`OfferWing AI为您保驾护航中`}>
          <div>
            <p>
              当前账户余额：
              <span style={{ fontWeight: "bold" }}>
                {currentUser.remain}
                <img
                  src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                  alt="logo"
                  style={{ height: "15px", verticalAlign: "sub" }}
                />
              </span>{" "}
              <MoneyCollectOutlined style={{ color: "rgb(222,100,51)" }} />
              <a
                style={{ color: "rgb(222,100,51)" }}
                onClick={() => toUrl("/pay")}
              >
                去充值
              </a>
            </p>
            <p>
              邀请好友可得时长或现金奖励，
              <a onClick={() => toUrl("/share")}>点击邀请</a>
            </p>
            <p>
              您当前帐户预计可面试时长为
              <span style={{ fontWeight: "bold" }}>{remainTime}</span>,
              预计可解决笔试问题条数为
              <span style={{ fontWeight: "bold" }}>
                {Math.floor(currentUser.remain / writePrice)}
              </span>
              条
            </p>
          </div>
          <h3>开启新的任务</h3>
          <div>
            面试功能依靠实时语音识别能力，给您快速精准的答案！
            <Button type="primary" onClick={() => toUrl("/meetingtask")}>
              新建面试
            </Button>
          </div>
          <div style={{ marginTop: "20px" }}>
            笔试功能无惧切屏检测，高效提取问题，帮你顺利通过笔试！
            <Button
              style={{ background: "#ff7e67" }}
              type="primary"
              onClick={() => toUrl("/writingtask")}
            >
              新建笔试
            </Button>
          </div>
        </Card>
        <Card title="最新公告" className={styles.newsBox}>
          <ul>
            <li>
              <p onClick={() => toUrl("/share")}>
                邀请有礼活动现已开启，分享您的专属链接，现金时长等你来拿！
                <span style={{ color: "orange", cursor: "pointer" }}>
                  点击前往
                </span>
              </p>
            </li>
            {newsList.slice(0, 6).map((item, idx) => {
              const date = moment(item.gmtCreate);
              // 格式化日期字符串
              const formattedDate = date.format("YYYY-MM-DD");
              return (
                <li key={idx} style={{ cursor: "pointer" }}>
                  <p onClick={() => toUrl("/news", `id=${idx}`)}>
                    {item.title}{" "}
                    <span style={{ fontSize: "12px" }}>{formattedDate}</span>
                  </p>
                </li>
              );
            })}
          </ul>
          <p className={styles.newsmore} onClick={() => toUrl("/news")}>
            查看更多
          </p>
        </Card>
        <Card
          style={{ width: "100%", marginTop: "5px" }}
          title="面经广场-最新大厂常考题"
          extra={<a onClick={() => toUrl("/experience")}>查看更多</a>}
        >
          <Experience />
        </Card>
      </div>
      <Modal
        open={originShow}
        style={{ textAlign: "center" }}
        onCancel={() => setOriginShow(false)}
        onOk={handleOrigin}
      >
        <img
          style={{
            width: "100px",
          }}
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E7%BA%A2%E5%8C%85.png"
          alt=""
        />
        <p style={{ fontWeight: "bold" }}>
          请填写您的注册来源，填写后即刻领取7.5元红包
        </p>
        <Radio.Group
          style={{ lineHeight: "30px" }}
          onChange={onChangeRadio}
          value={origin}
        >
          <Radio value="dianya">电鸭</Radio>
          <Radio value="360">360搜索</Radio>
          <Radio value="duoduo">朵朵校友圈</Radio>
          <Radio value="juejin">掘金</Radio>
          <Radio value="douyin">抖音</Radio>
          <Radio value="baidu">百度搜索</Radio>
          <Radio value="Google">Google搜索</Radio>
          <Radio value="bilibili">哔哩哔哩</Radio>
          <Radio value="xhs">小红书</Radio>
          <Radio value="poster">海报</Radio>
          <Radio value="xyb">校友邦</Radio>
          <Radio value="groupShare">群聊分享</Radio>
          <Radio value="videoChannel">视频号</Radio>
          <Radio value="kuaishou">快手</Radio>
          <Radio value="zhihu">知乎</Radio>
          <Radio value="xianyu">闲鱼</Radio>
          <Radio value="friend">朋友推荐</Radio>
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
      </Modal>
    </div>
  );
};

export default LoginIndexNew;
