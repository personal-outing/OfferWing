import { getToken } from "@/utils";
import { request } from "ice";

export async function uploadVoice(data) {
  return await request.post("/interview/VoiceRegister/updateVoice", data);
}

export async function getVoiceList(data) {
  return await request.get("/userService/getFilePath", { params: data });
}

export async function getVoiceSlice(data) {
  return await request.post("/userService/getQuestionInfo", data);
}

export async function reportAsrStatistics(data) {
  return await request.post("/userService/reportAsrStatistics", data);
}

export async function reportAsr(data) {
  return await request.post("/userService/reportAsr", data);
}

export async function getReportAsrRecord(data) {
  return await request.post("/userService/getReportAsrRecord", data);
}

export async function adoptAsr(data) {
  return await request.post("/userService/adoptAsr", data);
}

export async function getBatchHotWordRecords(data) {
  return await request.post("/userService/getBatchHotWordRecords", data);
}

export async function updateBatchHotWordRecords(data) {
  return await request.post("/userService/updateBatchHotWordRecords", data);
}
