import { request } from "ice";

export async function creatNewMockMeeting(data) {
  return await request.post("/userService/launchMockInterview", {
    ...data,
  });
}

export async function checkMockStatus(data) {
  return await request.get("/userService/checkMockIdValid", {
    params: data,
  });
}

export async function getMockResult(data) {
  return await request.post("/gpt/getMockInterviewSummary", data);
}

export async function getHistory(data) {
  return await request.post("/userService/getMockInterviewRecord", data);
}
