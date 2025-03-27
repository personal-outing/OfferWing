import { useEffect, useMemo, useState } from "react";
import { Button, Input, message } from "antd";
import styles from "./index.module.css";
import { copyToClipboard } from "@/utils";
import store from "@/store";
import { generateShortUrl } from "@/services/user";

const isEdu = window.location.hostname.indexOf("edu") > -1;

const ShortLink: React.FC = () => {
  const [shortLink, setShortLink] = useState<string>(
    window.localStorage.getItem("shortUrl") || ""
  );
  const [userState] = store.useModel("user");
  const { currentUser } = userState;

  const mylink = useMemo(() => {
    return `https://${isEdu ? "edu." : ""}offerwing.cn?source=${
      currentUser.username
    }`;
  }, [currentUser.username]);

  const handleGenerate = () => {
    if (shortLink) return;
    // 这里添加生成短链的逻辑
    generateShortUrl({
      longUrl: mylink,
    }).then((res) => {
      if (res.status) {
        setShortLink(res.data);
        window.localStorage.setItem("shortUrl", res.data);
      }
    });
    message.success("短链生成成功！");
  };

  const handleCopy = () => {
    if (shortLink) {
      copyToClipboard(shortLink);
      message.success("复制成功！");
    }
  };

  const copyLink = () => {
    copyToClipboard(mylink);
    message.success("复制成功!");
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    currentUser.role === "coop" && (
      <div className={styles.container}>
        {shortLink ? (
          <div className={styles.linkDisplay}>
            <span className={styles.linkLabel}>您的短链为：{shortLink}</span>
            <div className={styles.buttonGroup}>
              <Button type="primary" onClick={handleCopy}>
                一键复制
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p>您还未生成邀请短链</p>
          </>
        )}
        <div className={styles.linkGroup}>
          <span className={styles.linkLabel}>我的邀请链接：</span>
          <Input
            value={mylink}
            disabled
            style={{ width: "100%", minWidth: "auto" }}
          />
          <Button onClick={copyLink} type="primary" style={{ width: "100%" }}>
            复制
          </Button>
        </div>
      </div>
    )
  );
};

export default ShortLink;
