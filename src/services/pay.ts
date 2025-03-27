import { request } from "ice";

export async function toRecharge(data) {
  return await request.post("/userService/recharge", data);
}

export async function toAlipay(data) {
  return await request.post("/userService/alipayMobile/recharge", data);
}

export async function toAlipayPC(data) {
  return await request.post("/userService/alipayPC/recharge", data);
}

export async function checkAlipay(data) {
  return await request.post("/userService/alipay/notifyByFront", data);
}

export async function queryOrderStatus(data) {
  return await request.post("/userService/queryOrderInfo", data);
}

export async function queryPayStatus(params) {
  return await request.get(`https://xorpay.com/api/query/${params.id}`);
}

export async function queryPayHistory(data) {
  return await request.post(`/userService/queryAllRechargeInfo`, data);
}

export async function queryPrice() {
  return await request.get(`/userService/getUnitPriceSet`);
}

export async function queryPreferential(data) {
  return await request.post(`/userService/getDiscountInfo`, { ...data });
}

export async function queryRewardRate() {
  return await request.post(`/userService/getWithdrawRatio`, {});
}

export async function queryShareInfo(data) {
  return await request.post(`/userService/getShareInfo`, { ...data });
}

export async function handleWithdraw(data) {
  return await request.post(`/userService/withdraw`, { ...data });
}

export async function getSubscription(data) {
  return await request.get(`/userService/getSubscribeType`, { ...data });
}
