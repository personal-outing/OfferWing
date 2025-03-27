import { request } from "ice";
import type { UserInfo } from "@/interfaces/user";
import { message } from "antd";
import { getToken } from "@/utils";

export async function login(data) {
  return await request.post("/userService/authenticate", data);
}

export async function checkHasResume(params) {
  return await request.get("/userService/checkIfResumeExist", { params });
}

export async function uploadResume(data) {
  return await request.post("/userService/uploadUserResume", data);
}

export async function getLoginInfo(data) {
  return await request.post("/userService/getLoginInfo", data);
}

export async function sendLoginInfo(data) {
  return await request.post("/userService/updateLogin", data);
}

export async function toRefund(data) {
  return await request.post("/userService/handleRefund", data);
}

export async function generateShortUrl(data) {
  return await request.post(`/userService/generateShortUrl?longUrl=${data.longUrl}`);
}

export async function fetchUserInfo() {
  const t_data = getToken();
  if (Object.keys(t_data).length === 0) {
    return { data: { remain: 0, username: "", role: "user" } };
  }
  return await request.post("/userService/getUserInfo", {
    phone: t_data["username"] || "",
  });
}

// export async function verifyAuth(data) {
//   return await request.post("/userService/sendVerifyCode", data);
// }

export async function sendVerifyCode(data) {
  if (!data?.phone) {
    message.error("用户名不能为空");
    return { status: false };
  }
  return await request.post("/userService/sendVerifyCode", data);
}

export async function logout() {
  window.localStorage.clear();
}

export async function addQualification(data) {
  return await request.post("/userService/addWhiteList", data);
}

export async function addCoop(data) {
  return await request.post("/userService/alartUserRole", data);
}

export async function getLatestVersion(data) {
  return await request.post("/userService/getAPPVersion", data);
}

export async function addUserOrigin(data) {
  return await request.post("/userService/updateSrc", data);
}

export async function getShareUser(data) {
  return await request.post("/userService/checkShardUserCost", data);
}
