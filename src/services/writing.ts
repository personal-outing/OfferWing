import { request } from "ice";

export async function getWritingHistory(data) {
  return await request.post("/userService/getWrittenList", {
    ...data,
  });
}

export async function getWrittenDetail(data) {
  return await request.post("/userService/getWrittenDetail", {
    ...data,
  });
}

export async function getWrittenModel(data) {
  return await request.post("/userService/getModelList", {
    ...data,
  });
}