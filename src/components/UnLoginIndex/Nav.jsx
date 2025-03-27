import { useEffect, useMemo, useState, useCallback } from "react";
import LoginModal from "../LoginModal";
import { sendLog } from "../../services/meeting";
import { debounce } from "lodash";
import classNames from "classnames";
import store from "@/store";
import { toUrl } from "../../utils";

const navItems = [
  { key: "nav_2", text: "首页" },
  { key: "nav_3", text: "面笔试助手" },
  { key: "nav_4", text: "模拟面试" },
  { key: "nav_6", text: "AI简历" },
];

function NavPc({ cur, setCur, openLogin, isLogin, openUserCenter }) {
  return (
    <div className="nav-box">
      <div className="nav-box-inner">
        <div className="nav-box-main">
          <img
            className="nav-box-logo"
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
          />
          <div className="nav-box-items">
            {navItems.map((item) => (
              <span
                key={item.key}
                className={classNames({ active: item.key == cur })}
                onClick={() => {
                  setCur(item.key);
                  if (isLogin) {
                    openUserCenter();
                    return;
                  }
                  if (item.key == "nav_7") {
                    window.open(
                      "https://peuqmn915o.feishu.cn/docx/J4eWdOK9aooRuOxZTBDc2t5znwh?from=from_copylink"
                    );
                  } else if (item.key == "nav_8") {
                    location.href =
                      "https://ai.nexchat.vip/list/#/register?inviter=MT6DU5";
                  } else {
                    openLogin();
                  }
                }}
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>

        {isLogin ? (
          <div className="nav-box-btn" onClick={openUserCenter}>
            个人中心
          </div>
        ) : (
          <div className="nav-box-btn" onClick={openLogin}>
            注册/登录
          </div>
        )}
      </div>
    </div>
  );
}

function NavMobile({ cur, setCur, openLogin, isLogin, openUserCenter }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  });

  const close = useCallback(() => {
    setIsOpen(false);
  });

  return (
    <div className={classNames("nav-box nav-box-mobile", { active: isOpen })}>
      <div className="nav-box-inner">
        <span className="nav-box-open" onClick={open}>
          <div className="nav-box-dot" />
          <div className="nav-box-dot" />
          <div className="nav-box-dot" />
        </span>
        <img
          className="nav-box-logo"
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo.png"
          onClick={open}
        />
        {!isLogin ? (
          <div
            className="nav-box-btn cursor-pointer"
            onClick={() => toUrl("/login", "", true)}
          >
            登录/注册
          </div>
        ) : (
          <div className="nav-box-btn cursor-pointer" onClick={openUserCenter}>
            个人中心
          </div>
        )}
      </div>

      <div className="nav-box-mask" onClick={close} />

      <div className="nav-box-main">
        <div className="nav-box-items">
          {navItems.map((item) => (
            <span
              key={item.key}
              className={classNames({ active: item.key == cur })}
              onClick={() => {
                setCur(item.key);
                if (item.key == "nav_7") {
                  window.open(
                    "https://peuqmn915o.feishu.cn/docx/J4eWdOK9aooRuOxZTBDc2t5znwh?from=from_copylink"
                  );
                } else if (item.key == "nav_8") {
                  location.href = "https://doc.offerwing.cn/blog";
                } else {
                  openLogin();
                }
                close();
              }}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const checkIsMobile = () => {
  return window.innerWidth <= 1055;
};

export default function Nav() {
  const [isMobile, setIsMobile] = useState(checkIsMobile);
  const [cur, setCur] = useState(navItems[0].key);
  const [show, setShow] = useState(false);
  const isLogin = localStorage.getItem("_msg");

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

  useEffect(() => {
    const handleResize = debounce(() => {
      const v = checkIsMobile();
      if (v != isMobile) {
        setIsMobile(v);
      }
    }, 200);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  const subprops = { cur, setCur, openLogin, isLogin, openUserCenter };

  return (
    <>
      {isMobile ? <NavMobile {...subprops} /> : <NavPc {...subprops} />}
      <LoginModal
        key="loginModal"
        show={show}
        onCancel={() => setShow(false)}
      />
    </>
  );
}
