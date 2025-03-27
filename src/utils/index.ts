import device from "current-device";
import clipboard from "clipboardy";
import { history } from "ice";
import { message } from "antd";

export function formatSeconds(value: number = 0) {
  if (value < 0) {
    return 0;
  }
  let theTime: number = value; // 秒
  let theTime1: number = 0; // 分
  let theTime2: number = 0; // 小时
  if (theTime > 60) {
    theTime1 = Math.floor(theTime / 60);
    theTime = Math.floor(theTime % 60);
    if (theTime1 > 60) {
      theTime2 = Math.floor(theTime1 / 60);
      theTime1 = Math.floor(theTime1 % 60);
    }
  }
  let result: string = "" + Math.floor(theTime) + "秒";
  if (theTime1 > 0) {
    result = "" + Math.floor(theTime1) + "分" + result;
  }
  if (theTime2 > 0) {
    result = "" + Math.floor(theTime2) + "小时" + result;
  }
  return result;
}

export function formatMinutes(value) {
  if (value < 0) {
    return 0;
  }

  let hours = Math.floor(value / 60);
  let minutes = value % 60;

  if (hours > 0 && minutes === 0) {
    return `${hours}小时`;
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}

export const isMobile = () => {
  return device.mobile();
};

export const isHorizontal = () => {
  // 首先判断是否为移动设备
  if (!device.mobile()) {
    return false;
  }
  // 通过屏幕宽高比判断是否横屏
  return window.innerWidth > window.innerHeight;
};

export const isPC = () => {
  return device.desktop();
};

export const isIphone = () => {
  return device.iphone();
};

export const isWeChat = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isWeChat = ua.indexOf("micromessenger") > -1;
  return isWeChat;
};

export const changePhoneLooking = (num = "", type) => {
  let str = num;
  if (type !== "open") {
    str = num?.substring(0, 3) + "****" + num?.substring(7);
  }
  return str;
};

export const downLoadImg = (link) => {
  let img = new Image();
  img.setAttribute("crossOrigin", "Anonymous");
  img.onload = function () {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    context?.drawImage(img, 0, 0, img.width, img.height);
    canvas.toBlob((blob: any) => {
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      let event = new MouseEvent("click");
      a.download = `img-${Math.random().toString(16).substring(3)}`;
      a.href = url;
      a.dispatchEvent(event);
      URL.revokeObjectURL(url); // 内存管理,将这句代码注释掉,则将以 blob:http 开头的url复制到浏览器地址栏有效,否则无效.
    });
  };
  img.src = link + "?v=" + Date.now();
};

export const getToken = () => {
  let data = window.localStorage.getItem("_msg") || "{}";
  data = JSON.parse(data);
  return data;
};

export const processedMsgData = (msgName = "", msg, msgType = "text") => {
  return JSON.stringify({
    msgName,
    timestamp: Date.now(), //秒级时间戳
    msgType, // text or  binary or json
    msg,
  });
};

export const processParams = (fill) => {
  let str = "";
  const isPre = new URL(window.location.href).searchParams.has("_debugMode_");
  const source = new URL(window.location.href).searchParams.get("source") || "";
  if (fill) {
    const urlParams = new URL(window.location.href).searchParams;
    urlParams.forEach((value, key) => {
      if (key !== "spm" && key !== "redirect") {
        str += `${key}=${value}&`;
      }
    });
  }

  if (isPre) {
    str += "_debugMode_=1&";
  }
  if (source && !fill) {
    str += `source=${source}`;
  }

  if (str[str.length - 1] === "&") {
    str = str.slice(0, -1);
  }

  return str;
};

export const paramsStr = (token = "", fill = false) => {
  const paramsUrl = processParams(fill);
  const hasParmas = !!paramsUrl;
  return `${hasParmas ? `${token}${paramsUrl}` : ""}`;
};

export const spmList = {
  "/": "ready.0.0.0",
  "/meetingtask": "meetingtask.0.0.0",
  "/writingtask": "writingtask.0.0.0",
  "/history": "history.0.0.0",
  "/meeting": "meeting.0.0.0",
  "/pay": "pay.0.0.0",
  "/dogbrain": "dogbrain.0.0.0",
  "/login": "login.0.0.0",
  "/detail": "detail.0.0.0",
  "/free": "free.0.0.0",
  "/expdetail": "expdetail.0.0.0",
  "/experience": "experience.0.0.0",
  "/myexpdetail": "myexpdetail.0.0.0",
  "/share": "user.0.0.0",
  "/tech": "tech.0.0.0",
  "/setup": "tech.0.0.0",
};

export const toUrl = (path, params = "", fill = false) => {
  const exrStr = params ? `&${params}` : "";
  const curSpm = spmList[location.pathname] || "default";
  history?.push(`${path}?spm=${curSpm}${paramsStr("&", fill)}${exrStr}`);
};

export const toBottom = () => {
  const ele = document.getElementById("hiddenEle");
  ele?.scrollIntoView({ behavior: "smooth" });
};

export function truncateMiddle(str, maxLength) {
  if (str.length <= maxLength) {
    return str; // 如果字符串长度小于等于最大长度，直接返回原字符串
  }

  // 计算头部和尾部应保留的字符数
  const headLength = Math.floor(maxLength / 2);
  const tailLength = maxLength - headLength - 1; // 减1是为了给省略号留位置

  // 截取头部和尾部字符串，并在中间加入省略号
  return str.slice(0, headLength) + "..." + str.slice(-tailLength);
}

export const copyToClipboard = (val = "") => {
  clipboard.write(val);
};

export const getAllUrlParams = (url = window.location.href) => {
  const params = {}; // 创建一个空对象用于存储参数
  const parser = document.createElement("a"); // 使用DOM元素来解析URL
  parser.href = url;

  // 获取查询字符串，去除开头的问号
  const queryStr = parser.search.substring(1);

  // 将查询字符串拆分为键值对数组
  const keyValuePairs = queryStr.split("&");

  // 遍历每个键值对
  for (let i = 0; i < keyValuePairs.length; i++) {
    const pair = keyValuePairs[i].split("=");
    // 解码键和值
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1]);

    // 如果键已经存在，则将值添加到数组中
    if (params[key]) {
      if (typeof params[key] === "string") {
        params[key] = [params[key]];
      }
      params[key].push(value);
    } else {
      params[key] = value;
    }
  }

  return params;
};

export function compareVersions(version1, version2) {
  // 将版本号字符串拆分为数字数组
  const v1 = version1.split(".").map(Number);
  const v2 = version2.split(".").map(Number);
  // 比较每一部分的版本号
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0; // 如果版本号部分不存在，默认为 0
    const num2 = v2[i] || 0;

    if (num1 > num2) return 1; // version1 大于 version2
    if (num1 < num2) return -1; // version1 小于 version2
  }

  return 0; // version1 等于 version2
}

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");

  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // As Base64 string
  // return croppedCanvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      resolve(fileToBase64(file));
    }, "image/jpeg");
  });
}

let audioContext;
let source;
let animationId;
let stream;
let temp = true;

// 检测麦克风是否连接及声音动态展示
export async function detectMicrophone(deviceId) {
  try {
    // 请求麦克风权限并获取音频流，使用传入的设备ID
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: deviceId ? { exact: deviceId } : undefined },
    });

    // 创建AudioContext和AnalyserNode
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    // 创建音频源并连接到AnalyserNode
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // 动态显示音量大小
    function updateVolume() {
      analyser.getByteFrequencyData(dataArray);
      const volume =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      if (volume > 50 && temp) {
        message.success("麦克风收音正常");
        temp = false;
      }

      // 根据音量值动态更新界面
      document.getElementById("volume-display").style.width = volume + "%";

      animationId = requestAnimationFrame(updateVolume);
    }

    updateVolume();
  } catch (err) {
    message.error("麦克风访问失败: " + err);
    console.error("麦克风访问失败: ", err);
  }
}

// 关闭麦克风和展示功能
export function stopMicrophone() {
  try {
    if (animationId) {
      cancelAnimationFrame(animationId); // 停止动画帧更新
    }
    if (source) {
      source.disconnect(); // 断开音频源
    }
    if (audioContext) {
      audioContext.close(); // 关闭AudioContext
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // 停止麦克风流
    }
    document.getElementById("volume-display").style.width = "0%"; // 重置展示
  } catch (error) {}
}

export function getLink() {
  // 获取当前域名
  const hostname = window.location.hostname;
  let link = "index"; // 默认值

  if (hostname.includes("offerwing")) {
    if (hostname.startsWith("edu.")) {
      link = "edu";
    } else if (hostname.startsWith("juan.")) {
      link = "juan";
    } else if (hostname.startsWith("mujicv")) {
      link = "mujicv";
    } else if (hostname === "offerwing.xyz") {
      link = "xyz";
    }
  }

  return link;
}
