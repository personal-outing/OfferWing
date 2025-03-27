import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "antd";
import LoginModal from "../LoginModal";
import { toUrl } from "../../utils/index";
import { sendLog } from "../../services/meeting";
import "./index.css";
import styles from "./index.module.css";
import { useSearchParams } from "@ice/runtime";
import store from "@/store";

const featuresList = [
  {
    content: (
      <div className={styles.bannerBoxFeaturesBoxItemContent}>
        <p>
          已解答 <span className={styles.data }>20k+</span> 题目
        </p>
        <p>
          已KO <span className={styles.data}>8k+</span> 高难度算法
        </p>
        <p>
          已沟通 <span className={styles.data}>2k+</span> HR谈判
        </p>
        <p>
          已助力 <span className={styles.data}>1000+</span> Offer
        </p>
      </div>
    ),
    icon: "http://interview.yitongshen.cn/public/%E6%95%B0%E6%8D%AE.png",
  },
  {
    content: (
      <div className={styles.bannerBoxFeaturesBoxItemContent}>
        <p>
          <span className={styles.data}>5+</span> 不同国家语言使用
        </p>
        <p>
          <span className={styles.data}>1000+</span> 公司支持
        </p>
        <p>
          <span className={styles.data}>200+</span> 不同岗位
        </p>
        <p>
          <span className={styles.data}>100+</span> 面试平台
        </p>
      </div>
    ),
    icon: "http://interview.yitongshen.cn/public/%E4%B8%8A%E7%8F%AD.png",
  },
  {
    content: (
      <div className={styles.bannerBoxFeaturesBoxItemContent}>
        <p>个性化简历模式</p>
        <p>
          自定义 <span className={styles.data}>2000+</span> 专属题库
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

const meetingSoftwareList = {
  cn: [
    {
      name: "腾讯会议",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/tm.png"
    },
    {
      name: "Zoom",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/zoom.png"
    },
    {
      name: "飞书",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/feishu.png"
    },
    {
      name: "钉钉",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/dingding.png"
    },
    {
      name: "微信",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/wechat.png"
    },
    {
      name: "牛客",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/niuke.png"
    },
    {
      name: "BOSS直聘",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/boss.png"
    },
    {
      name: "Google Meet",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/google_meet.png"
    },
    {
      name: "Moka",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/moka.png"
    }
  ],
  en: [
    {
      name: "Webex",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/webex.png"
    },
    {
      name: "Skype",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/skype.png"
    },
    {
      name: "Microsoft Teams",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/ms_teams.png"
    },
    {
      name: "Webex",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/webex.png"
    },
    {
      name: "ZOOM",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/zoom.png"
    },
    {
      name: "Google Meet",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/google_meet.png"
    },
    {
      name: "Chime",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/chime.png"
    },
    {
      name: "Lark",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/lark.png"
    },
    {
      name: "DingTalk",
      logo: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/dingtalk.png"
    },
    // ... 其他英文版本的软件
  ]
};

export default function Banner() {
  const [searchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [userState] = store.useModel("user");
  const isLogin = userState.currentUser.username;
  const [curVideo, setCurVideo] = useState(0);

  const openUserCenter = useCallback(() => {
    toUrl("/dashboard");
  }, []);

  return (
    <div className={styles.bannerBox} id="index">
      <div className={styles.bannerBoxMain}>
        <div className={styles.bannerBoxLeft}>
          <h1 className={styles.bannerBoxTitle}>
            AI时代求职助手&nbsp;
            <img src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo-name.png" />
          </h1>
          <div className={styles.bannerBoxSubtitle}>
            面试笔试神器，offer 拿到手软！
          </div>
          <div className={styles.bannerBoxDescription}>
            无需下载，全自动识别问题，一键远程截图，AI加持答案秒出！
          </div>
          <div className="bannerBox-btns">
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
                立即免费开始
              </Button>
            ) : (
              <Button
                className="bannerBox-startBtn bannerBox-startBtn-login"
                onClick={openUserCenter}
              >
                个人中心
              </Button>
            )}
            <Button
              className="bannerBox-startBtn bannerBox-startBtn-try"
              onClick={() => {
                location.href =
                  "https://doc.offerwing.cn/docs/intro";
              }}
            >
              使用教程
              <img
                style={{ maxWidth: "18px" }}
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/btn-arrow.png"
              />
            </Button>
          </div>
        </div>
        <div className={styles.bannerBoxRight}>
          <div className={styles.bannerBoxMainIntroItem}>
            {videoList.map((item, idx) => {
              return (
                <iframe
                  className={styles.bannerBoxVideoBox}
                  style={{ display: idx === curVideo ? "block" : "none" }}
                  key={idx}
                  src={item}
                  scrolling="no"
                  border="0"
                  frameborder="no"
                  framespacing="0"
                  allowfullscreen="true"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                ></iframe>
              );
            })}
          </div>
          <div className={styles.bannerBoxVideoBtn}>
            <p
              className={curVideo === 0 ? styles.bannerBoxVideoBtnActive : ""}
              onClick={() => {
                setCurVideo(0);
              }}
            >
              面试模式
            </p>
            <p
              className={curVideo === 1 ? styles.bannerBoxVideoBtnActive : ""}
              onClick={() => {
                setCurVideo(1);
              }}
            >
              笔试模式
            </p>
          </div>
        </div>
      </div>
      <div className={styles.bannerBoxFeatures} id="featuresMain">
        <div className={styles.bannerBoxFeaturesBox}>
          {featuresList.map((item, idx) => {
            return (
              <div key={idx} className={styles.bannerBoxFeaturesBoxItem}>
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
