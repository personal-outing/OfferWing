import { Outlet, Link, useLocation } from "ice";
import ProLayout from "@ant-design/pro-layout";
import { useEffect, useState } from "react";
import { Button, Tabs } from "antd";
import { adminMenu, asideMenuConfig, indexMenuConig } from "@/menuConfig";
import AvatarDropdown from "@/components/AvatarDropdown";
import store from "@/store";
import Footer from "@/components/Footer";
import { isMobile, paramsStr, spmList, toUrl } from "./../utils/index";
import styles from "./layout.module.css";
import "./styles.css";
import LoginModal from "@/components/LoginModal";
import { getDemoDetails } from "@/services/indexPage";
import { sendLog } from "@/services/meeting";
import Help from "@/components/Help";

export default function Layout() {
  const location = useLocation();
  const [userState] = store.useModel("user");
  const { username } = userState.currentUser || {};
  const isAdmin = location.pathname.includes("dogbrain");
  const curSpm = spmList[location.pathname] || "default";
  const [show, setShow] = useState(false);
  const [expList, setExpList] = useState([]);
  const [expShow, setExpShow] = useState(false);

  const noLayoutPaths = [
    "/",
    "/login",
    "/meeting",
    "/detail",
    "/writingdetail",
    "/free",
    "/writing",
    "/mock",
    "/mockdetail",
  ];

  useEffect(() => {
    getDemoDetails({}).then((res) => {
      if (res.status) {
        const list = res.data.rt.map((item) => {
          const obj = {
            key: item.rankId,
            label: item.sceneName,
            children: (
              <div>
                <img className={styles.showImg} src={item.demoUrl} alt="" />
                <p className={styles.imgShowDes}>{item.sceneDesc}</p>
              </div>
            ),
          };
          return obj;
        });
        setExpList(list);
      }
    });
  }, []);

  if (noLayoutPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  let menuData = username
    ? isAdmin
      ? JSON.parse(JSON.stringify(adminMenu))
      : JSON.parse(JSON.stringify(asideMenuConfig))
    : indexMenuConig;

  const renderAvatar = () =>
    username ? (
      <AvatarDropdown
        avatar="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/new_logo-removebg-preview.png"
        name={username}
      />
    ) : (
      <Button
        className={styles.topLoginBtn}
        style={{
          borderRadius: "10px",
          border: "0",
          color: "#080a47",
          fontWeight: 500,
          height: "45px",
          backgroundImage: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
        }}
        onClick={() => {
          sendLog({
            type: "clk",
            uid: "",
            spm: `login.loginBtn.top.0`,
            extInfo: JSON.stringify({}),
          });
          setShow(true);
        }}
      >
        登录 / 注册
      </Button>
    );

  const menuItemRender = (item, defaultDom) => {
    if (!item.path) return defaultDom;

    const isUnloggedUser = !username;
    const isGuide = item.name === "📖 使用教程";
    let token =
      isUnloggedUser && !isGuide
        ? `#${item.path}`
        : `${item.path}?spm=${curSpm}${paramsStr("&")}`;

    const handleClick = () => {
      if (["💰 定价", "面试助手", "笔试助手"].includes(item.name)) {
        const textObj = {
          "💰 定价": "price",
          面试助手: "meeting",
          笔试助手: "writing",
        };
        setShow(true);
        sendLog({
          type: "clk",
          uid: "",
          spm: `login.${textObj[item.name]}.top.0`,
          extInfo: JSON.stringify({}),
        });
        return;
      }
      if (item.name === "最佳实践") {
        setExpShow(true);
      }
      if (isUnloggedUser) {
        const id = item.key || "";
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    };

    const specialItemContent =
      item.path === "/pay" ? (
        <div style={{ display: "flex" }}>
          {defaultDom}
          <p
            style={{
              color: "#fff",
              fontSize: "10px",
              background: "#1197FF",
              height: "18px",
              lineHeight: "16px",
              borderRadius: "18px",
              padding: "0 5px",
            }}
          >
            春招特惠
            <img
              style={{ width: "14px" }}
              src="https://resource.interviewgpt.xyz/public/hot_fill.png"
              alt=""
            />
          </p>
        </div>
      ) : (
        defaultDom
      );

    return (
      <Link
        onClick={handleClick}
        to={token}
        target={isGuide ? "_blank" : "_self"}
      >
        {specialItemContent}
      </Link>
    );
  };

  return (
    <>
      <ProLayout
        collapsedButtonRender={false}
        theme="light"
        className={styles.layout}
        logo={
          <>
            <img
              src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
              alt="logo"
              onClick={() => toUrl("/")}
              style={{ height: "55rpx", maxHeight: "55px" }}
            />
          </>
        }
        siderWidth={240}
        token={{
          bgLayout: "#fff",
          sider: {
            colorBgMenuItemSelected: "#323232",
          },
        }}
        title={false}
        layout={username ? "mix" : "top"}
        suppressSiderWhenMenuEmpty={true}
        menu={{
          ignoreFlatMenu: true,
          autoClose: false,
        }}
        avatarProps={{ render: renderAvatar }}
        menuDataRender={() => menuData}
        menuItemRender={menuItemRender}
        footerRender={() => <Footer />}
      >
        <Outlet />
        <Help />
      </ProLayout>
      <LoginModal show={show} onCancel={() => setShow(false)} />
      {expShow}
      <div
        onClick={() => setExpShow(false)}
        className={styles.imgShow}
        style={{ display: expShow ? "block" : "none" }}
      >
        <Tabs
          centered
          style={{
            color: "#fff",
            height: "100%",
            width: "100%",
          }}
          tabBarStyle={{
            background: "#fff",
          }}
          onTabClick={(_, event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          items={expList}
        />
      </div>
    </>
  );
}
