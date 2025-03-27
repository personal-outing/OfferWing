import store from "../../store";
import { useEffect, useMemo, useState } from "react";
import { copyToClipboard } from "@/utils";
import { definePageConfig } from "ice";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Input, Modal, Popover, Tabs, message, Table } from "antd";
import { QuestionCircleTwoTone, GiftOutlined } from "@ant-design/icons";
import {
  handleWithdraw,
  queryRewardRate,
  queryShareInfo,
} from "@/services/pay";
import "./index.css";
import html2canvas from "html2canvas";
import { generateShortUrl, getShareUser } from "@/services/user";

const isEdu = window.location.hostname.indexOf("edu") > -1;

export default function Share() {
  const [userData, setUserData] = useState({});
  const [curMode, setCurMode] = useState(0);
  const [shortLink, setShortLink] = useState<string>(
    window.localStorage.getItem("shortUrl") || ""
  );
  const [rewardRate, setRewardRate] = useState(0);
  const [shareInfo, setShareInfo] = useState({});
  const [withdrawalShow, setWithdrawalShow] = useState(false);
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const mylink = useMemo(() => {
    return `https://${isEdu ? "edu." : ""}offerwing.cn?source=${
      currentUser.username
    }`;
  }, [currentUser.username]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const copyLink = () => {
    copyToClipboard(mylink);
    message.success("复制成功，快去分享吧！");
  };

  const copyShortLink = () => {
    copyToClipboard(shortLink);
    message.success("复制成功，快去分享吧！");
  };

  const cancelWith = () => {
    setWithdrawalShow(false);
  };

  const toWithdraw = () => {
    if (curMode === 0) {
      handleWithdraw({
        userId: currentUser.username,
        withdrawType: "remain",
      })
        .then((res) => {
          if (res.status) {
            message.success("提取成功，请稍后核对查看");
            setWithdrawalShow(false);
          } else {
            message.error(res.message);
          }
        })
        .catch((rej) => {
          message.error(rej.message);
        });
    } else {
      setWithdrawalShow(false);
    }
  };

  const handleGenerate = () => {
    if (shortLink && shortLink != mylink) return;
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

  useEffect(() => {
    queryRewardRate().then((res) => {
      if (res.status) {
        setRewardRate(res.data);
      }
    });
    queryShareInfo({
      userId: currentUser.username,
    }).then((res) => {
      if (res.status) {
        setShareInfo(res.data || {});
      }
    });
    handleGenerate();
  }, []);

  useEffect(() => {
    // 生成二维码图片URL
    const qrCanvas = document.getElementById("qrCode") as HTMLCanvasElement;
    if (qrCanvas) {
      const url = qrCanvas.toDataURL("image/png");
      setQrCodeUrl(url);
    }
  }, [mylink]); // 当链接变化时重新生成

  const saveShareImage = () => {
    const posterContainer = document.querySelector(".poster-container");

    const images = posterContainer.getElementsByTagName("img");
    const imageLoadPromises = Array.from(images).map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    Promise.all(imageLoadPromises)
      .then(() => {
        return html2canvas(posterContainer, {
          useCORS: true,
          backgroundColor: null,
          imageTimeout: 0,
          scale: 2,
        });
      })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = "邀请海报.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((error) => {
        console.error("生成海报失败:", error);
        message.error("生成海报失败，请稍后重试");
      });
  };

  const saveShareImage2 = () => {
    const posterContainer = document.querySelector(".poster-container2");

    const images = posterContainer.getElementsByTagName("img");
    const imageLoadPromises = Array.from(images).map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    Promise.all(imageLoadPromises)
      .then(() => {
        return html2canvas(posterContainer, {
          useCORS: true,
          backgroundColor: null,
          imageTimeout: 0,
          scale: 2,
        });
      })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = "邀请合伙人海报.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((error) => {
        console.error("生成海报失败:", error);
        message.error("生成海报失败，请稍后重试");
      });
  };

  const getShareRelation = () => {
    getShareUser({
      username: currentUser.username,
    }).then((res) => {
      if (res.status) {
        // 对数据按照createTime由近到远进行排序
        const sortedData = [...res.data].sort((a, b) => {
          return (
            new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
          );
        });
        setUserData(sortedData);
      }
    });
  };

  useEffect(() => {
    getShareRelation();
  }, []);

  const items = [
    {
      key: "1",
      label: "邀请信息",
      children: (
        <>
          {currentUser.role === "coop" && <p>您好，合伙人！</p>}
          {currentUser.username === "17317526826" && (
            <p>
              您是顶级合伙人，您可以自行
              <a href="/addcoop">添加新合伙人</a>
            </p>
          )}
          <br />
          <div className="reward-rules">
            <div className="reward-rules-title">
              <GiftOutlined />
              邀请奖励规则
            </div>
            <div className="reward-rules-content">
              通过您的专属链接，您可以获得双重奖励：
              <br />•
              直接邀请：好友通过您的链接注册并充值后，您可获得好友使用金额
              <span className="reward-rules-highlight">10%</span>的奖励
              <br />•{" "}
              <span className="reward-rules-highlight">成为合伙人：</span>
              当您成为合伙人，您邀请好友充值后可得到好友使用金额
              <span className="reward-rules-highlight">20%</span>
              的奖励，您邀请的好友再次邀请他人充值，您还可获得二级好友使用金额
              <span className="reward-rules-highlight">10%</span>
              的额外奖励。
              <a
                href={
                  isEdu
                    ? "/joinus"
                    : "https://doc.offerwing.cn/docs/intro/#3-%E6%88%90%E4%B8%82%E5%9C%BA%E5%90%88%E4%BC%99%E4%BA%BA"
                }
                target="_blank"
                className="reward-rules-highlight"
                style={{ textDecoration: "underline" }}
              >
                成为合伙人请查看详情
              </a>
              。
              <br />• 灵活提现：奖励可以便捷地转换为 OfferWing
              余额或直接提取现金
            </div>
          </div>
          <div className="user-box-inviteBox">
            <div>
              <p className="user-box-inviteTitle">已邀请</p>
              <p className="user-box-inviteCount">
                {shareInfo?.inviteRegisterCnt || 0} <span>人</span>
              </p>
            </div>
            <div>
              <p className="user-box-inviteTitle">最大可提现</p>
              <p className="user-box-inviteCount">
                {shareInfo?.inviteGmv / 100 || 0} <span>元</span>
              </p>
            </div>
            <div>
              <p className="user-box-inviteTitle">可提现（每日更新）</p>
              <p className="user-box-inviteCount">
                {shareInfo?.availableGmv / 100 || 0} <span>元</span>
              </p>
            </div>
          </div>
          <div className="user-box-exChangePrice">
            <Button
              onClick={() => setWithdrawalShow(true)}
              type="text"
              style={{
                background: "#1d94fc",
                fontWeight: 500,
                color: "#fff",
                boxShadow: "0 2px 8px rgba(29,148,252,0.2)",
              }}
            >
              兑现奖励
            </Button>
          </div>

          <div className="user-box-divider"></div>
          <div className="user-box-share-section">
            <div className="user-box-link">
              <span className="user-box-mylink">我的邀请链接：</span>
              <Input
                className="user-box-input"
                value={mylink}
                disabled
                style={{ minWidth: "200px" }}
              />
              <Button onClick={copyLink} type="primary">
                复制
              </Button>
              <Popover
                content={
                  "被邀请人需要通过您的链接进入OfferWing AI，请勿更改链接，首次登录即为注册成功，邀请关系即刻建立"
                }
                title="注意"
              >
                <QuestionCircleTwoTone style={{ marginLeft: "10px" }} />
              </Popover>
            </div>
            {currentUser.role === "coop" && (
              <div className="user-box-link" style={{ marginTop: "10px" }}>
                <span className="user-box-mylink">专属短链接：</span>
                <Input
                  className="user-box-input"
                  value={shortLink}
                  disabled
                  style={{ minWidth: "200px" }}
                />
                <Button onClick={copyShortLink} type="primary">
                  复制
                </Button>
              </div>
            )}
            <div className="user-box-qrcode">
              <span className="user-box-mylink">我的专属邀请码：</span>
              <div
                className="poster-container"
                style={{
                  position: "relative",
                  width: "fit-content",
                  margin: "0 auto",
                }}
              >
                <img
                  crossOrigin="anonymous"
                  src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/%E9%82%80%E8%AF%B7%E6%B5%B7%E6%8A%A5.png"
                  alt="邀请海报"
                  className="user-box-sharePost"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "50px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  {/* 首次渲染时隐藏的QRCodeCanvas用于生成图片 */}
                  <div style={{ display: "none" }}>
                    <QRCodeCanvas
                      id="qrCode"
                      value={mylink}
                      size={100}
                      fgColor="#000000"
                      imageSettings={{
                        src: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo2.png",
                        crossOrigin: "anonymous",
                        height: 15,
                        width: 15,
                        excavate: true,
                      }}
                    />
                  </div>
                  {/* 显示转换后的二维码图片 */}
                  {qrCodeUrl && (
                    <img
                      src={qrCodeUrl}
                      alt="二维码"
                      style={{
                        width: "55px",
                        height: "55px",
                      }}
                    />
                  )}
                </div>
                <Button
                  type="primary"
                  onClick={saveShareImage}
                  style={{
                    position: "absolute",
                    bottom: "-40px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  保存海报
                </Button>
              </div>
              {currentUser.role === "coop" && (
                <div
                  className="poster-container2"
                  style={{
                    position: "relative",
                    width: "fit-content",
                    margin: "30px auto",
                  }}
                >
                  <img
                    crossOrigin="anonymous"
                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/hhr.png"
                    alt="合伙人海报"
                    className="user-box-sharePost"
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "3px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    {/* 首次渲染时隐藏的QRCodeCanvas用于生成图片 */}
                    <div style={{ display: "none" }}>
                      <QRCodeCanvas
                        id="qrCode"
                        value={mylink}
                        size={100}
                        fgColor="#000000"
                        imageSettings={{
                          src: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo2.png",
                          crossOrigin: "anonymous",
                          height: 15,
                          width: 15,
                          excavate: true,
                        }}
                      />
                    </div>
                    {/* 显示转换后的二维码图片 */}
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl}
                        alt="二维码"
                        style={{
                          width: "35px",
                          height: "35px",
                        }}
                      />
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={saveShareImage2}
                    style={{
                      position: "absolute",
                      bottom: "-40px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    保存海报
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Modal
            width={600}
            open={withdrawalShow}
            onCancel={cancelWith}
            onOk={toWithdraw}
            title="选择兑换方式"
            okText={curMode === 0 ? "确认转换" : "我已添加客服"}
            cancelText="取消"
          >
            <div className="withdrawal-box">
              <p
                onClick={() => setCurMode(0)}
                className={curMode === 0 ? "active" : ""}
              >
                <span>一键转为时长</span>
                <span>
                  您的奖励可按照当前OfferWing AI价格进行时长转换并充值到您的账户
                </span>
              </p>
              <p
                onClick={() => setCurMode(1)}
                className={curMode === 1 ? "active" : ""}
              >
                <span>一键提现</span>
                <span>
                  您的奖励可进行人民币提现，OfferWing AI会通过微信转账的方式给您
                </span>
              </p>
              {curMode === 1 && (
                <div className="qrcode-container">
                  <h3>扫码添加客服即可提现</h3>
                  <img
                    src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/kefu2.png"
                    alt="客服二维码"
                  />
                </div>
              )}
            </div>
          </Modal>
        </>
      ),
    },
    {
      key: "2",
      label: "邀请记录",
      children: (
        <>
          <p>* 邀请记录及消费情况次日更新</p>
          <Table
            rowKey="username"
            dataSource={userData?.length ? userData : []}
            columns={[
              {
                title: "用户名",
                dataIndex: "username",
                key: "username",
              },
              {
                title: "身份",
                dataIndex: "role",
                render: (role) => {
                  return (
                    <span
                      style={{ color: role === "coop" ? "#1890ff" : "#52c41a" }}
                    >
                      {role === "coop" ? "合伙人" : "用户"}
                    </span>
                  );
                },
              },
              {
                title: "注册时间",
                dataIndex: "createTime",
                key: "createTime",
                render: (time) => {
                  if (!time) return "-";
                  return time.split("T")[0];
                },
              },
              {
                title: "总充值（元）",
                dataIndex: "totalRecharge",
                key: "totalRecharge",
                render: (value) => (value / 100).toFixed(2),
              },
              {
                title: "总消费（元）",
                dataIndex: "totalCost",
                key: "totalCost",
                render: (value) => (value / 100).toFixed(2),
              },
            ]}
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  rowKey="username"
                  dataSource={record.secondUser || []}
                  columns={[
                    {
                      title: "二级用户名",
                      dataIndex: "username",
                      key: "username",
                    },
                    {
                      title: "身份",
                      dataIndex: "role",
                      key: "role",
                      render: (role) => (
                        <span
                          style={{
                            color: role === "coop" ? "#1890ff" : "#52c41a",
                          }}
                        >
                          {role === "coop" ? "合伙人" : "用户"}
                        </span>
                      ),
                    },
                    {
                      title: "注册时间",
                      dataIndex: "createTime",
                      key: "createTime",
                      render: (time) => {
                        if (!time) return "-";
                        return time.split("T")[0];
                      },
                    },
                    {
                      title: "总充值（元）",
                      dataIndex: "totalRecharge",
                      key: "totalRecharge",
                      render: (value) => (value / 100).toFixed(2),
                    },
                    {
                      title: "总消费（元）",
                      dataIndex: "totalCost",
                      key: "totalCost",
                      render: (value) => (value / 100).toFixed(2),
                    },
                  ]}
                  pagination={false}
                />
              ),
              rowExpandable: (record) => record.secondUser?.length > 0,
            }}
          />
        </>
      ),
    },
  ];

  return (
    <div className="user-box">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-个人中心",
  };
});
