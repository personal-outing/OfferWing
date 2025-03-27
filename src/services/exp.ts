import { request } from "ice";

export async function getAllExps(data) {
  return await request.post("/userService/getPublicQuestion", {
    ...data,
  });
}

export async function submitMjQuestionTask(data) {
  return await request.post("/userService/submitMjQuestionTask", {
    ...data,
  });
}

export async function getMjQuestionStatus(data) {
  return await request.post("/userService/getMjQuestionStatus", {
    ...data,
  });
}

export async function handlePublish(data) {
  return await request.post("/userService/publish", {
    ...data,
  });
}

export async function getMjInterviewStatus(data) {
  return await request.post("/userService/getMjInterviewStatus", {
    ...data,
  });
}

export async function modifyMjQuestion(data) {
  return await request.post("/userService/modifyMjQuestion", {
    ...data,
  });
}
export async function getAllCompanies(data) {
  return await request.post("/userService/getCompanyList", {
    ...data,
  });
}