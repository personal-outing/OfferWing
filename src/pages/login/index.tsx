import React, { useEffect, useState } from "react";
import { definePageConfig, history, useSearchParams } from "ice";
import { message, Alert, Button, Tabs, Modal, Input } from "antd";
import { LockOutlined, MailOutlined, MobileOutlined } from "@ant-design/icons";
import {
  ProFormText,
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
} from "@ant-design/pro-form";
import styles from "./index.module.css";
import { login, sendVerifyCode } from "@/services/user";
import store from "@/store";
import { sendLog } from "@/services/meeting";
import { getAllUrlParams, getLink, paramsStr, toUrl } from "@/utils";

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const isPre =
  window.location.href.indexOf("pre.") > -1 ||
  new URL(window.location.href).searchParams.has("_debugMode_");

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "default";
  const spmPre = searchParams.get("spm") || "default";
  const keyword = searchParams.get("keyword") || "default";
  const [loginResult, setLoginResult] = useState<any>({});
  const [loginType, setLoginType] = useState("phone");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(true);
  const [, userDispatcher] = store.useModel("user");
  const [currentSource, setCurrentSource] = useState(source);
  let syn = localStorage.getItem("syn") || "";

  async function handleSubmit(values) {
    if (!agree) {
      setLoginResult({ status: false, message: "您还未同意用户协议" });
      return;
    }
    try {
      const result = await login({
        ...values,
        src: currentSource,
        pathParam: getAllUrlParams(),
        link: getLink(),
      });
      const { data = {}, status = false } = result;
      const {
        username = "",
        remain = 0,
        token = "",
        role = "user",
        src = "default",
        abConfig,
      } = data;
      if (status) {
        message.success("登录成功！");
        sendLog({
          type: "exp",
          uid: username,
          spm: "login.success.0.0",
          extInfo: JSON.stringify({
            source: currentSource,
            keyword,
            username,
            id: syn,
            link: getLink(),
          }),
        });
        const lastData = {
          _t: token,
          username,
          date: new Date().getTime(),
        };
        window.localStorage.setItem("_msg", JSON.stringify(lastData));
        userDispatcher.updateCurrentUser({
          username,
          remain: remain / 100,
          role,
          src,
          abConfig: {
            mjExp: abConfig?.mjExp || 1,
          },
        });
        window.location.href = `/dashboard?spm=login.0.0.0${paramsStr(
          "&",
          true
        )}`;
        return;
      }
      setLoginResult(result);
    } catch (error) {
      message.error("登录失败，请重试！");
      console.log(error);
    }
  }

  const handleChange = (e) => {
    setPhone(e.target.value);
  };

  const handleCheck = (e) => {
    setAgree(e.target.checked);
  };

  const getVeriImg = async (type) => {
    return new Promise((resolve, reject) => {
      document.getElementById("captcha-box").style.display = "block";
      // config 对象为TAC验证码的一些配置和验证的回调
      const config = {
        // 生成接口 (必选项,必须配置, 要符合tianai-captcha默认验证码生成接口规范)
        requestCaptchaDataUrl: isPre
          ? "https://pre-api.interviewdogs.com/api/userService/getCaptcha"
          : "https://api.offerwing.cn/api/userService/getCaptcha",
        // 验证接口 (必选项,必须配置, 要符合tianai-captcha默认验证码校验接口规范)
        validCaptchaUrl: isPre
          ? "https://pre-api.interviewdogs.com/userService/verifyCaptcha"
          : "https://api.offerwing.cn/userService/verifyCaptcha",
        // 验证码绑定的div块 (必选项,必须配置)
        bindEl: "#captcha-box",
        // 验证成功回调函数(必选项,必须配置)
        validSuccess: async (res, c, tac) => {
          // 销毁验证码服务
          tac.destroyWindow();
          if (res?.data?.id) {
            // 调用具体的login方法
            const result = await sendVerifyCode({
              phone,
              type,
              captchaId: res?.data?.id || "",
            });
            const { status = false } = result;
            if (status) {
              message.success(`验证码已发送，请查收`);
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            tac.reloadCaptcha();
          }
        },
        // 验证失败的回调函数(可忽略，如果不自定义 validFail 方法时，会使用默认的)
        validFail: async (res, c, tac) => {
          // 销毁验证码服务
          tac.reloadCaptcha();
        },
        // 刷新按钮回调事件
        btnRefreshFun: (el, tac) => {
          console.log("刷新按钮触发事件...");
          tac.reloadCaptcha();
        },
        // 关闭按钮回调事件
        btnCloseFun: (el, tac) => {
          console.log("关闭按钮触发事件...");
          tac.destroyWindow();
          resolve(false);
        },
      };
      // 一些样式配置， 可不传
      let style = {
        logoUrl: null, // 去除logo
        // logoUrl: "/xx/xx/xxx.png" // 替换成自定义的logo
      };
      // 参数1 为 tac文件是目录地址， 目录里包含 tac的js和css等文件
      // 参数2 为 tac验证码相关配置
      // 参数3 为 tac窗口一些样式配置
      window
        ?.initTAC("./tac", config, style)
        .then((tac) => {
          tac.init(); // 调用init则显示验证码
        })
        .catch((e) => {
          resolve(false);
          document.getElementById("captcha-box").style.display = "none";
          message.error("网络错误，请重新获取");
          console.log("初始化tac失败", e);
        });
    });
  };

  const sendVerify = async (type) => {
    return new Promise(async (resolve) => {
      const status = await getVeriImg(type);
      return resolve(status);
    });
  };

  useEffect(() => {
    sendLog({
      type: "pv",
      uid: "",
      spm: "login.0.0.0",
      extInfo: JSON.stringify({ source, spmPre, id: syn }),
    });
  }, []);

  return (
    <div className={styles.container}>
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "10%",
        }}
        id="captcha-box"
      ></div>
      {/* <Alert
        style={{ marginBottom: "10px", textAlign: "center" }}
        message={
          <span>
            公告：系统维护三个小时，维护后会正常开放，具体可联系管理员！
          </span>
        }
        type="warning"
      /> */}
      <LoginForm
        title={
          <img
            style={{
              width: "240rpx",
              maxWidth: "200px",
            }}
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo-name.png"
          />
        }
        logo={
          <img
            alt="logo"
            src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/logo2.png"
          />
        }
        subTitle="不用准备也能拿Offer"
        onFinish={async (values) => {
          await handleSubmit(values);
        }}
        submitter={{
          searchConfig: {
            submitText: "登录 / 注册",
          },
        }}
      >
        <Alert
          style={{ textAlign: "center" }}
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
              新用户首次登录即可直接领取7.5元红包
            </span>
          }
          type="warning"
        />
        {source !== "default" && (
          <div style={{ margin: "12px auto" }}>
            <Input
              addonBefore="邀请人："
              value={currentSource}
              onChange={(e) => setCurrentSource(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        )}
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => setLoginType(activeKey)}
        >
          <Tabs.TabPane key={"phone"} tab={"手机号登录"} />
          <Tabs.TabPane key={"email"} tab={"邮箱登录"} />
        </Tabs>
        {loginResult.status === false && (
          <LoginMessage content={loginResult.message} />
        )}
        {loginType === "phone" ? (
          <>
            <ProFormText
              fieldProps={{
                size: "large",
                prefix: <MobileOutlined className={"prefixIcon"} />,
                onChange: handleChange,
              }}
              name="phone"
              placeholder={"请输入手机号"}
              rules={[
                {
                  required: true,
                  message: "请输入手机号！",
                },
                {
                  pattern: /^1\d{10}$/,
                  message: "手机号格式错误！",
                },
              ]}
            />
            <ProFormCaptcha
              key="phone"
              fieldProps={{
                size: "large",
                prefix: <LockOutlined className={"prefixIcon"} />,
              }}
              captchaProps={{
                size: "large",
              }}
              placeholder={"请输入验证码"}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${"获取验证码"}`;
                }
                return "获取验证码";
              }}
              name="code"
              rules={[
                {
                  required: true,
                  message: "请输入验证码！",
                },
              ]}
              onGetCaptcha={async () => {
                sendLog({
                  type: "clk",
                  uid: "",
                  spm: "login.code.0.0",
                  extInfo: JSON.stringify({ id: syn }),
                });
                const result = await sendVerify("phone");
                return result ? Promise.resolve() : Promise.reject();
              }}
            />
          </>
        ) : (
          <>
            <ProFormText
              fieldProps={{
                size: "large",
                prefix: <MailOutlined className={"prefixIcon"} />,
                onChange: handleChange,
              }}
              name="phone"
              placeholder={"请输入邮箱"}
              rules={[
                {
                  pattern:
                    /^[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/,
                  message: "邮箱格式错误！",
                },
              ]}
            />
            <ProFormCaptcha
              key="email"
              fieldProps={{
                size: "large",
                prefix: <LockOutlined className={"prefixIcon"} />,
              }}
              captchaProps={{
                size: "large",
              }}
              placeholder={"请输入验证码"}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${"获取验证码"}`;
                }
                return "获取验证码";
              }}
              name="code"
              rules={[
                {
                  required: true,
                  message: "请输入验证码！",
                },
              ]}
              onGetCaptcha={async () => {
                sendLog({
                  type: "clk",
                  uid: "",
                  spm: "login.code.0.0",
                  extInfo: JSON.stringify({ id: syn }),
                });
                const result = await sendVerify("email");
                return result ? Promise.resolve() : Promise.reject();
              }}
            />
          </>
        )}
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox
            noStyle
            name="autoLogin"
            fieldProps={{
              onChange: handleCheck,
              checked: agree,
            }}
          >
            已经阅读并同意
            <a
              href="https://peuqmn915o.feishu.cn/docx/A1BjduoBdoogLnx0BoicIxYUnhd?from=from_copylink"
              target="_blank"
            >
              《用户隐私协议》
            </a>
          </ProFormCheckbox>
        </div>
      </LoginForm>
      <p className={styles.footer}>
        <a onClick={() => toUrl(`/`)}>返回首页</a>
      </p>
    </div>
  );
};

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-登录",
  };
});

export default Login;
