import { DefaultFooter } from "@ant-design/pro-layout";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import { getLatestVersion } from "@/services/user";
import { message, Modal } from "antd";
import { compareVersions } from "@/utils";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [latestVersion, setLatestVersion] = useState("");

  useEffect(() => {
    getLatestVersion({}).then((res) => {
      if (res.status) {
        setLatestVersion(res.data);
        if (
          compareVersions(
            res.data?.split("v")[0],
            (window as any).packageVersion?.split("v")[0]
          ) == 1
        ) {
          message.info("最新版本已发布，请清除缓存及时更新");
        }
      }
    });
  }, []);

  return (
    <>
      <div className={styles.groupBox} id="contact">
        <p>面试助力群现已开启，求职之路不再孤单</p>
        <div className={styles.groupItem}>
          <div>
            <img
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/qunliao.jpg"
              alt="OfferWing AI-微信群"
            />
            <p>微信群</p>
          </div>
          <div>
            <img
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E5%85%AC%E4%BC%97%E5%8F%B7.jpg"
              alt="OfferWing AI-公众号"
            />
            <p>公众号</p>
          </div>
          <div>
            <img
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/douyinqr.png"
              alt="OfferWing AI抖音"
            />
            <p>官方抖音号</p>
          </div>
          <div>
            <img
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/xhs.png"
              alt="OfferWing AI小红书"
            />
            <p>小红书</p>
          </div>
          <div>
            <img
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/bilibili.png"
              alt="OfferWing AIbilibili"
            />
            <p>bilibili</p>
          </div>
        </div>
      </div>
      <DefaultFooter
        copyright={false}
        style={{ width: "100%" }}
        links={[
          {
            key: "OfferWing",
            title: `当前版本 v${(window as any).packageVersion} l 最新版本 v${
              latestVersion || (window as any).packageVersion
            }`,
            href: "/",
            blankTarget: true,
          },
          //https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/Luban_169863316139526aee906-f144-47c9-8741-095be54e5b63.jpg
          {
            key: "OfferWing Group",
            title: "OfferWing Group",
            href: "/",
            blankTarget: true,
          },
          // {
          //   key: "en.interview.dog",
          //   title: "l OfferWing AI海外",
          //   href: "https://en.interview.dog?source=main",
          //   blankTarget: true,
          // },
          {
            key: "contract",
            title: "l 联系我们",
            href: "https://peuqmn915o.feishu.cn/docx/J4eWdOK9aooRuOxZTBDc2t5znwh?from=from_copylink",
            blankTarget: true,
          },
        ]}
      />
      <p
        style={{
          width: "100%",
          textAlign: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <a
          className={styles.copyright}
          href="https://beian.miit.gov.cn/#/Integrated/recordQuery"
          target="_blank"
        >
          <span role="img" aria-label="copyright">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="copyright"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm5.6-532.7c53 0 89 33.8 93 83.4.3 4.2 3.8 7.4 8 7.4h56.7c2.6 0 4.7-2.1 4.7-4.7 0-86.7-68.4-147.4-162.7-147.4C407.4 290 344 364.2 344 486.8v52.3C344 660.8 407.4 734 517.3 734c94 0 162.7-58.8 162.7-141.4 0-2.6-2.1-4.7-4.7-4.7h-56.8c-4.2 0-7.6 3.2-8 7.3-4.2 46.1-40.1 77.8-93 77.8-65.3 0-102.1-47.9-102.1-133.6v-52.6c.1-87 37-135.5 102.2-135.5z"></path>
            </svg>
          </span>
          &nbsp;{currentYear} 浙ICP备2024138885号-2
        </a>
      </p>
    </>
  );
};

export default Footer;
