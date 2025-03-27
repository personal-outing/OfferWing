import Recorder from "recorder-core";
import "recorder-core/src/engine/mp3.js";
import "recorder-core/src/engine/mp3-engine.js";
import "recorder-core/src/engine/pcm.js";
import { message } from "antd";

/*****显示控制按钮和界面控制，这几坨代码无关紧要*****/
// Runtime.Ctrls([
//   { name: "打开录音，请求权限", click: "recOpen" },
//   { name: "开始录音", click: "recStart" },
//   { name: "结束录音，并释放资源", click: "recStop" },
// ]);

/*****录音核心代码*****/
let rec;
/**调用open打开录音请求好录音权限**/
export const recOpen = function () {
  //一般在显示出录音按钮或相关的录音界面时进行此方法调用，后面用户点击开始录音时就能畅通无阻了
  rec = Recorder({
    type: "pcm",
    sampleRate: 16000,
    bitRate: 16,
    onProcess: function (
      buffers,
      powerLevel,
      bufferDuration,
      bufferSampleRate
    ) {},
  });

  let t = setTimeout(function () {
    console.error("无法录音：权限请求被忽略（超时假装手动点击了确认对话框）");
  }, 8000);

  console.log("正在打开录音，请求麦克风权限...");
  rec.open(
    function () {
      clearTimeout(t);
      message.success("已打开录音，可以点击开始了");
    },
    function (msg, isUserNotAllow) {
      //用户拒绝未授权或不支持
      clearTimeout(t);
      message.error(
        isUserNotAllow ? "UserNotAllow，" + "无法录音:" + msg : "无法录音"
      );
    }
  );
};
/**开始录音**/
export function recStart() {
  return new Promise((resolve, reject) => {
    if (!rec) {
      message.error("新的采集您还未授权!");
      reject();
    } else {
      rec.start();
      resolve(true);
    }
  });
}
/**结束录音**/
export function recStop() {
  return new Promise((resolve, reject) => {
    rec.stop(
      function (blob, duration) {
        // rec.close(); //释放录音资源，当然可以不释放，后面可以连续调用start；但不释放时系统或浏览器会一直提示在录音，最佳操作是录完就close掉
        // rec = null;
        resolve({ data: blob, status: "success" });
      },
      function (msg) {
        reject({ data: null, status: "fail" });
        message.error("录音失败:" + msg);
        rec.close(); //可以通过stop方法的第3个参数来自动调用close
        rec = null;
      }
    );
  });
}

export function cleanRec() {
  rec.close();
  rec = null;
}
