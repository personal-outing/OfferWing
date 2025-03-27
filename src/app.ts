import { defineAppConfig, history, defineDataLoader } from "ice";
import { fetchUserInfo } from "./services/user";
import { defineStoreConfig } from "@ice/plugin-store/types";
import { defineRequestConfig } from "@ice/plugin-request/types";
import { getToken, paramsStr, toUrl } from "./utils";
import "../public/version";
import { sendLog } from "./services/meeting";
import { queryPrice } from "./services/pay";

export default defineAppConfig(() => ({}));

const openUrl = ["/", "/notice", "/free"];
// const isPre = new URL(window.location.href).searchParams.has("_debugMode_");
const isPre =
  window.location.href.indexOf("pre.") > -1 ||
  new URL(window.location.href).searchParams.has("_debugMode_");

export const storeConfig = defineStoreConfig(async (appData) => {
  const {
    userInfo = {},
    price = 1.5,
    boostPrice = 2,
    writePrice = 1,
  } = appData;
  if (userInfo.role != "expire") {
    if (
      !userInfo.username &&
      !openUrl.includes(new URL(window.location.href).pathname)
    ) {
      toUrl("/login", "", true);
    } else if (
      userInfo.role !== "admin" &&
      new URL(window.location.href).pathname == "/dogbrain"
    ) {
      history?.push(`/?spm=admin.0.0.0`);
    } else if (new URL(window.location.href).pathname === "/login") {
      toUrl("/");
    }
  } else {
    window.localStorage.clear();
    history?.push(`/login?redirect=/&spm=login.out.expire.0${paramsStr("&")}`);
  }
  return {
    initialStates: {
      user: {
        currentUser: {
          ...userInfo,
        },
      },
      pay: {
        price,
        boostPrice,
        writePrice,
      },
    },
  };
});

export const dataLoader = defineDataLoader(async () => {
  const userInfo = await getUserInfo();
  let price = 1.5,
    boostPrice = 2,
    writePrice = 1;
  if (userInfo?.data?.username) {
    userInfo.data.remain = (userInfo?.data?.remain || 0) / 100;
    const priceInfo = await queryPrice();
    price = priceInfo.data.UnitPrice / 100;
    boostPrice = priceInfo.data.BoostUnitPrice / 100;
    writePrice = priceInfo.data.WrittenUnitPrice / 100;
  }
  return {
    userInfo: userInfo?.data || {},
    price,
    boostPrice,
    writePrice,
  };
});

async function getUserInfo() {
  try {
    const userInfo = await fetchUserInfo();
    return userInfo;
  } catch (error) {
    console.error(error);
    return { data: { remain: 0, username: "", role: "expire" } };
  }
}

export const requestConfig = defineRequestConfig({
  withFullResponse: true,
  baseURL: isPre
    ? "https://pre-api.interviewdogs.com/api"
    : process.env.ICE_BASEURL,
  timeout: 60000, // 请求超时时间 n
  headers: {
    "Content-Type": "application/json",
  },
  interceptors: {
    request: {
      onConfig: (config) => {
        // 发送请求前：可以对 RequestConfig 做一些统一处理
        config.headers = { ...config.headers, token: getToken()["_t"] || "" };
        return config;
      },
      onError: (error) => {
        return Promise.reject(error);
      },
    },
    response: {
      onConfig: (response) => {
        if (response.statusText == "OK" && response.data.status) {
          return response.data;
        } else {
          return Promise.reject(response.data);
        }
      },
      onError: (error: any) => {
        if (error.response.statusText === "Unauthorized") {
          const t_data = getToken();
          sendLog({
            type: "error",
            uid: t_data["username"] || "",
            spm: "login.out.expire.0",
            extInfo: JSON.stringify({}),
          });
          window.localStorage.clear();
        }
        return Promise.reject(error.data);
      },
    },
  },
});
