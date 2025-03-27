import { request } from "ice";

export async function getPQQuota(data) {
  return await request.post("/userService/getPQQuota", {
    ...data,
  });
}

export async function getPQList(data) {
  return await request.post("/userService/getPQList", {
    ...data,
  });
}

export async function submitExpTask(data) {
  return await request.post("/userService/submitExpTask", {
    ...data,
  });
}

export async function getExpTaskStatus(data) {
  return await request.post("/userService/getExpTaskStatus", {
    ...data,
  });
}