import { useSearchParams } from "@ice/runtime";
import { Button } from "antd";
import { useCallback, useMemo, useState } from "react";
import { sendLog } from "../../services/meeting";
import { toUrl } from "../../utils/index";
import LoginModal from "../LoginModal";
import "./index.css";
import styles from "./index.module.css";

const featuresList = [
  {
    content: (
      <div>
        <p>
          已解答 <span className="data">20k+</span> 题目
        </p>
        <p>
          已KO <span className="data">8k+</span> 高难度算法
        </p>
        <p>
          已沟通 <span className="data">2k+</span> HR谈判
        </p>
        <p>
          已助力 <span className="data">1000+</span> Offer
        </p>
      </div>
    ),
    icon: "http://interview.yitongshen.cn/public/%E6%95%B0%E6%8D%AE.png",
  },
  {
    content: (
      <div>
        <p>
          <span className="data">5+</span> 不同国家语言使用
        </p>
        <p>
          <span className="data">1000+</span> 公司支持
        </p>
        <p>
          <span className="data">200+</span> 不同岗位
        </p>
        <p>
          <span className="data">100+</span> 面试平台
        </p>
      </div>
    ),
    icon: "http://interview.yitongshen.cn/public/%E4%B8%8A%E7%8F%AD.png",
  },
  {
    content: (
      <div>
        <p>个性化简历模式</p>
        <p>
          自定义 <span className="data">2000+</span> 专属题库
        </p>
        <p>自定义 prompt 玩转 AI</p>
      </div>
    ),
    icon: "http://interview.yitongshen.cn/public/%E7%9F%A5%E8%AF%86.png",
  },
];
const videoList = [
  "//player.bilibili.com/player.html?isOutside=true&aid=113792658704770&bvid=BV1TZraYUEtT&cid=27764982303&p=1&autoplay=0",
  "//player.bilibili.com/player.html?isOutside=true&aid=113497362993053&bvid=BV1oXU6YzENr&cid=26806256849&p=1&autoplay=0",
];
const wxVideoList = [
  "//interview.yitongshen.cn/public/newVersion/%E9%9D%A2%E8%AF%95%E7%8B%97%E5%AE%A3%E5%8F%912.mov",
  "//interview.yitongshen.cn/public/newVersion/%E5%8F%8C%E5%B1%8FAI%E9%9D%A2%E8%AF%95%E8%BE%85%E5%8A%A9%E5%AE%9E%E6%88%98.mp4",
  "//interview.yitongshen.cn/public/newVersion/9%E6%9C%889%E6%97%A52.mp4?",
];

const meetingSoftwareList = {
  cn: [
    {
      name: "腾讯会议",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/tm.png",
    },
    {
      name: "Zoom",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/zoom.png",
    },
    {
      name: "飞书",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/feishu.png",
    },
    {
      name: "钉钉",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/dingding.png",
    },
    {
      name: "微信",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/wechat.png",
    },
    {
      name: "牛客",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/niuke.png",
    },
    {
      name: "BOSS直聘",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/boss.png",
    },
    {
      name: "Google Meet",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/google_meet.png",
    },
    {
      name: "Moka",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/moka.png",
    },
  ],
  en: [
    {
      name: "Webex",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/webex.png",
    },
    {
      name: "Skype",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/skype.png",
    },
    {
      name: "Microsoft Teams",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/ms_teams.png",
    },
    {
      name: "Webex",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/webex.png",
    },
    {
      name: "ZOOM",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/zoom.png",
    },
    {
      name: "Google Meet",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/google_meet.png",
    },
    {
      name: "Chime",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/chime.png",
    },
    {
      name: "Lark",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/lark.png",
    },
    {
      name: "DingTalk",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/dingtalk.png",
    },
    // ... 其他英文版本的软件
  ],
};

export default function Banner() {
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "default";
  const [show, setShow] = useState(false);
  const [curVideo, setCurVideo] = useState(0);
  const isLogin = localStorage.getItem("_msg");

  const isWeiXinLogin = useMemo(() => {
    // 非小程序内
    if (source != "duoduo") {
      return false;
    } else {
      // 在小程序内
      return true;
    }
  }, []);

  const openLogin = useCallback(() => {
    sendLog({
      type: "clk",
      uid: "",
      spm: `login.intro.middle.0`,
      extInfo: JSON.stringify({}),
    });
    setShow(true);
  }, []);

  const openUserCenter = useCallback(() => {
    toUrl("/dashboard");
  }, []);

  return (
    <div className="bannerBox" id="index">
      <div className="bannerBox-main">
        <h1 className="bannerBox-main-h1">AI时代求职助手</h1>
        <h2 className="bannerBox-main-h2">
          面试笔试助力工具{" "}
          <img src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo-name.png" />
        </h2>
        <div className="bannerBox-intro">
          <p>⚡️ 实时监听语音对话 </p>
          <p>📱 一键操作远程截图 </p>
          <p>💡 有效问题快速锁定 </p>
          <p>👍 AI加持答案秒出！ </p>
        </div>
        <div className="bannerBox-btns">
          <Button
            className="bannerBox-startBtn bannerBox-startBtn-try"
            onClick={() => {
              location.href = "https://doc.offerwing.cn/docs/intro/";
            }}
          >
            使用教程
            <img
              style={{ maxWidth: "18px" }}
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/btn-arrow.png"
            />
          </Button>
          {!isLogin ? (
            <Button
              className="bannerBox-startBtn bannerBox-startBtn-login"
              onClick={() => {
                sendLog({
                  type: "clk",
                  uid: "",
                  spm: `login.loginBtn.middleright.0`,
                  extInfo: JSON.stringify({}),
                });
                setShow(true);
              }}
            >
              登录/注册
            </Button>
          ) : (
            <Button
              className="bannerBox-startBtn bannerBox-startBtn-login"
              onClick={openUserCenter}
            >
              个人中心
            </Button>
          )}
        </div>
        {false
          ? wxVideoList.map((item, idx) => {
              return (
                <video
                  className="bannerBox-video-box"
                  width="100%"
                  style={{
                    display: idx == curVideo ? "block" : "none",
                  }}
                  loop
                  controls
                >
                  <source src={item} type={`video/mp4`} />
                  <track kind="captions" />
                </video>
              );
            })
          : videoList.map((item, idx) => {
              return (
                idx == curVideo && (
                  <iframe
                    className="bannerBox-video-box"
                    src={item}
                    scrolling="no"
                    border="0"
                    frameborder="no"
                    framespacing="0"
                    allowfullscreen="true"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  ></iframe>
                )
              );
            })}
        <div className="bannerBox-videoBtn">
          <p
            className={curVideo === 0 ? "bannerBox-videoBtn-active" : ""}
            onClick={() => {
              setCurVideo(0);
            }}
          >
            面试教程
          </p>
          <p
            className={curVideo === 1 ? "bannerBox-videoBtn-active" : ""}
            onClick={() => {
              setCurVideo(1);
            }}
          >
            笔试教程
          </p>
        </div>
      </div>
      <div className="bannerBox-features" id="featuresMain">
        <div className="bannerBox-features-Box">
          {featuresList.map((item, idx) => {
            return (
              <div key={idx} className={`bannerBox-features-Box-item`}>
                {item.content}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.meetingSoftware}>
        <h2 className={styles.meetingSoftwareTitle}>支持常见会议软件</h2>
        <div className={styles.meetingSoftwareVersions}>
          <div className={styles.version}>
            <div className={styles.versionLabel}>中文版</div>
            <div className={styles.softwareGrid}>
              {meetingSoftwareList.cn.map((software, index) => (
                <div key={index} className={styles.softwareItem}>
                  <img src={software.logo} alt={software.name} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.version}>
            <div className={styles.versionLabel}>英文版</div>
            <div className={styles.softwareGrid}>
              {meetingSoftwareList.en.map((software, index) => (
                <div key={index} className={styles.softwareItem}>
                  <img src={software.logo} alt={software.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <LoginModal
        key="loginModal"
        show={show}
        onCancel={() => setShow(false)}
      />
    </div>
  );
}
