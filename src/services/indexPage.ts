import { request } from "ice";

export async function getUserComments(data) {
  return await request.post("/userService/getUserComments", {
    ...data,
  });
}

export async function getNews(data) {
  return await request.post("/userService/getNews", {
    ...data,
  });
}

export async function getAbConfig(data) {
  return await request.post("/userService/getAbConfig", {
    ...data,
  });
}

export async function getDemoDetails(data) {
  return await request.post("/userService/getDemoDetails", {
    ...data,
  });
}
