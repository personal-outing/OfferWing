import { InfoCircleTwoTone } from "@ant-design/icons";
import { Button, Cascader, Popover, Select, Modal, Card, Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getAllCareers, getCodeLan, sendLog } from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import { isMobile, toUrl } from "@/utils";
import { queryPrice } from "@/services/pay";
import { useSearchParams } from "ice";
import { getLatestVersion } from "@/services/user";
import { getWrittenModel } from "@/services/writing";
import TopNotice from "@/components/TopNotice";
import CardTitle from "@/components/CardTitle";
import SourceModal from "@/components/SourceModal";

const Option = Select.Option;

function getDfConfig() {
  const obj = JSON.parse(localStorage.getItem("df_writing_config") || "{}");
  obj.careerList = JSON.parse(obj.careerList || "[]");
  obj.region = obj.region || "国内";
  return obj;
}

const Writingtask: React.FC = () => {
  const dfConfig = getDfConfig();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "default";
  const spmPre = searchParams.get("spm") || "default";
  const defaultCareer = searchParams.get("career") || dfConfig.career;
  const defaultRegion = searchParams.get("region") || dfConfig.region;
  const [career, setCareer] = useState(defaultCareer);
  const [modelPrice, setModelPrice] = useState(0);
  const [careerList, setCareerList] = useState([]);
  const [optionsList, setOptionsList] = useState([]);
  const [originShow, setOriginShow] = useState(false);
  const [region, setRegion] = useState(defaultRegion);
  const [codeLang, setCodeLang] = useState([]);
  const [curCodeLang, setCurCodeLang] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [userState] = store.useModel("user");
  const [payState, payDispatcher] = store.useModel("pay");
  const { writePrice } = payState;
  const currentUser = userState.currentUser;

  const haveOrigin = useMemo(() => {
    return currentUser.src !== "default";
  }, [currentUser.src]);

  const onChangeCodeLan = (val) => {
    setCurCodeLang(val);
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
    setCareerList(value);
    setCareer(value[value.length - 1]);
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
    getAllCareers({
      region: curRegion,
      companyId: -1,
      terminal: "written",
    }).then((res) => {
      if (res.status) {
        const curList: any = [];
        const obj: any = {};
        res.data.forEach((item) => {
          if (obj[item.occupation]) {
            obj[item.occupation].children = [];
          } else {
            obj[item.occupation] = {
              value: item.id,
              label: item.occupation,
              children: [],
            };
          }
        });
        for (let key in obj) {
          curList.push(obj[key]);
        }
        setOptionsList(curList);
        setCareerList(
          dfConfig.careerList?.length > 0
            ? dfConfig.careerList
            : [curList[0].value]
        );
        setCareer(defaultCareer || curList[0].value);
      }
    });
  };

  const getPrice = () => {
    queryPrice().then((res) => {
      payDispatcher.updatePrice(res.data);
    });
  };

  const queryCodeLan = () => {
    getCodeLan({}).then((res) => {
      if (res.status) {
        setCodeLang(res.data);
        setCurCodeLang(dfConfig.curCodeLang || res.data[0].codeLang);
      }
    });
  };

  const saveDefaultChoose = () => {
    localStorage.setItem(
      "df_writing_config",
      JSON.stringify({
        region,
        careerList: JSON.stringify(careerList),
        career,
        curCodeLang,
      })
    );
  };

  const getVersion = () => {
    getLatestVersion({ terminal: "desktop" }).then((res) => {
      if (res.status) {
        setLatestVersion(res.data);
      }
    });
  };

  const getModelList = () => {
    getWrittenModel({}).then((res) => {
      if (res.status) {
        setModelPrice(res.data[1]?.price / 100);
      }
    });
  };
  useEffect(() => {
    getPrice();
    queryCodeLan();
    getCarrers(defaultRegion);
    getVersion();
    getModelList();
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
    <div className={styles.meetingApp}>
      <TopNotice>春招限时特惠，<a href="/pay">去充值！</a>您现在处于准备笔试阶段，需要您确定以下步骤：</TopNotice>
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
                  window.open("https://doc.offerwing.cn/docs/writing/guide");
                }}
              >
                《笔试使用教程》
              </a>
            </p>
          </div>
          {!isMobile() ? (
            <>
              <CardTitle
                text={
                  <h3 style={{ marginBottom: 0 }}>
                    电脑下载OfferWing AI客户端-v{latestVersion}
                  </h3>
                }
              />
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/image%402x%20%281%29.png?",
                    text: "MacOS",
                    url: `https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/app/OfferWing-${latestVersion}.dmg`,
                  },
                  // {
                  //   icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/macos.png",
                  //   text: "MacOS",
                  //   subText: "（系统兼容版）",
                  //   url: `https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/app/OfferWing-${latestVersion}-old.dmg`,
                  // },
                  {
                    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/image%402x.png",
                    text: "Windows x64",
                    url: `https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/app/OfferWing%20Setup%20${latestVersion}.exe`,
                  },
                ].map((item, idx) => {
                  return (
                    <div className={styles.systemBox} key={idx}>
                      <img src={item.icon} alt="" />
                      <p>{item.text}</p>
                      <p>{item.subText}</p>
                      <Button
                        style={{ background: "#333" }}
                        onClick={() => {
                          setShowInstallGuide(true);
                          window.location.href = item.url;
                        }}
                      >
                        <span style={{ color: "#fff" }}>点击下载</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p>笔试客户端请在电脑下载</p>
          )}
        </Card>
        <Card
          className={styles.meetingCard}
          title={<CardTitle text="请选择笔试信息" />}
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
              />
            </p>
            <p className={styles.meetingRegionItem}>
              <label>编程语言（可选）：</label>
              <Select
                className={styles.selectBox}
                onChange={onChangeCodeLan}
                value={curCodeLang}
                style={{ width: 180, flex: 1 }}
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
            {currentUser.remain >= writePrice ? (
              <p style={{ color: "#F39555" }}>
                使用普通模型价格为{writePrice}
                <img
                  src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                  alt="logo"
                  style={{ height: "15px", verticalAlign: "sub" }}
                />
                /道，增强模型价格为
                {modelPrice}
                <img
                  src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                  alt="logo"
                  style={{ height: "15px", verticalAlign: "sub" }}
                />
                /道，当前可笔试条数充足
              </p>
            ) : (
              <p style={{ color: "red" }}>
                当前余额不可开启笔试
                <a onClick={() => toUrl("/pay")}>，请先充值</a>
              </p>
            )}
          </div>
        </Card>
      </div>
      <Button
        disabled={currentUser?.remain < writePrice || !career}
        className={styles.gotoBtn}
        onClick={() => {
          saveDefaultChoose();
          toUrl(
            "/writing",
            `positionid=${career}&code=${curCodeLang}&t=${Date.now()}&career=${career}`
          );
        }}
        type="primary"
      >
        前往笔试
      </Button>
      <Modal
        open={originShow}
        style={{ textAlign: "center" }}
        onCancel={() => setOriginShow(false)}
        footer={false}
      >
        <SourceModal isDashboard={true} phone={currentUser.username} />
      </Modal>
      {/* 添加安装提醒弹窗 */}
      <Modal
        title="安装提醒"
        open={showInstallGuide}
        onCancel={() => setShowInstallGuide(false)}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: "center" }}>
          <Tabs
            defaultActiveKey="mac"
            items={[
              {
                key: "mac",
                label: "Mac系统",
                children: (
                  <img
                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E7%AC%94%E8%AF%95%E6%95%99%E7%A8%8B1.png"
                    alt="Mac系统安装教程"
                    style={{ maxWidth: "100%" }}
                  />
                ),
              },
              {
                key: "windows",
                label: "Windows系统",
                children: (
                  <img
                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E7%AC%94%E8%AF%95%E6%95%99%E7%A8%8B2.png"
                    alt="Windows系统安装教程"
                    style={{ maxWidth: "100%" }}
                  />
                ),
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Writingtask;
