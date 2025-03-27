import { getToken } from "@/utils";
import { request } from "ice";

export async function getAllCareers(data) {
  return await request.post("/userService/getAllOccupationInfo", {
    ...data,
  });
}

export async function getCodeLan(data) {
  return await request.post("/userService/getCodeLangInfo", {
    ...data,
  });
}

export async function getWrittenType(data) {
  return await request.post("/userService/getWrittenQuestionTypes", {
    ...data,
  });
}

export async function queryComanyInfo(data) {
  return await request.post("/userService/getPositionInfo", {
    ...data,
  });
}

export async function updateComanyInfo(data) {
  return await request.post("/userService/updatePositionInfo", {
    ...data,
  });
}

export async function launchInterview(data) {
  return await request.post("/userService/launchInterview", {
    ...data,
  });
}

export async function getInterviewHistory(data) {
  return await request.post("/userService/getInterviewList", {
    ...data,
  });
}

export async function getInterviewDetail(data) {
  return await request.post("/userService/queryInterviewHistory", {
    ...data,
  });
}

export async function sendFeedBack(data) {
  return await request.post("/userService/feedback", {
    ...data,
  });
}

export async function getInterviewModeTags(data) {
  return await request.post("/userService/getInterviewModeTags", {
    ...data,
  });
}

export async function reportVoiceError(data) {
  return await request.post("/userService/reportAsr", {
    ...data,
  });
}

export async function sendLog(data) {
  const env = window.navigator.userAgent;
  let syn = localStorage.getItem("syn") || "";
  data.extInfo = JSON.stringify({ ...JSON.parse(data.extInfo), id: syn });
  return await request.post("/userService/utdLog", {
    utdlog: JSON.stringify({
      ...data,
      eventTime: Date.now(),
      env,
    }),
  });
}

export async function getUserPrompt(data) {
  return await request.post("/userService/getUserDefinedPrompt", {
    ...data,
  });
}

export async function uploadUserPrompt(data) {
  return await request.post("/userService/updateUserDefinedPrompt", {
    ...data,
  });
}
