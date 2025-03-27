import Recorder from "recorder-core";
import "recorder-core/src/engine/wav.js";
import "recorder-core/src/engine/pcm.js";
import { message } from "antd";
import { useCallback } from "react";

const testSampleRate = 16000;
const testBitRate = 16;

const SendFrameSize = 3200; /**** 每次发送指定二进制数据长度的数据帧，单位字节，16位pcm取值必须为2的整数倍，8位随意。
  16位16khz的pcm 1秒有：16000hz*16位/8比特=32000字节的数据，默认配置3200字节每秒发送大约10次
  ******/

//重置环境，每次开始录音时必须先调用此方法，清理环境
const RealTimeSendTryReset = function () {
  realTimeSendTryChunks = null;
};
let realTimeSendTryNumber;
let transferUploadNumberMax;
let realTimeSendTryChunk;
let realTimeSendTryChunks;

//=====实时处理核心函数==========
const RealTimeSendTry = function (buffers, bufferSampleRate, isClose, wss) {
  if (realTimeSendTryChunks == null) {
    realTimeSendTryNumber = 0;
    transferUploadNumberMax = 0;
    realTimeSendTryChunk = null;
    realTimeSendTryChunks = [];
  }
  //配置有效性检查
  if (testBitRate == 16 && SendFrameSize % 2 == 1) {
    console.error("16位pcm SendFrameSize 必须为2的整数倍", 1);
    return;
  }

  let pcm = [],
    pcmSampleRate = 0;
  if (buffers.length > 0) {
    //借用SampleData函数进行数据的连续处理，采样率转换是顺带的，得到新的pcm数据
    let chunk = Recorder.SampleData(
      buffers,
      bufferSampleRate,
      testSampleRate,
      realTimeSendTryChunk
    );

    //清理已处理完的缓冲数据，释放内存以支持长时间录音，最后完成录音时不能调用stop，因为数据已经被清掉了
    for (
      let i = realTimeSendTryChunk ? realTimeSendTryChunk.index : 0;
      i < chunk.index;
      i++
    ) {
      buffers[i] = null;
    }
    realTimeSendTryChunk = chunk; //此时的chunk.data就是原始的音频16位pcm数据（小端LE），直接保存即为16位pcm文件、加个wav头即为wav文件、丢给mp3编码器转一下码即为mp3文件

    pcm = chunk.data;
    pcmSampleRate = chunk.sampleRate;

    if (pcmSampleRate != testSampleRate)
      //除非是onProcess给的bufferSampleRate低于testSampleRate
      throw new Error(
        "不应该出现pcm采样率" +
          pcmSampleRate +
          "和需要的采样率" +
          testSampleRate +
          "不一致"
      );
  }

  //将pcm数据丢进缓冲，凑够一帧发送，缓冲内的数据可能有多帧，循环切分发送
  if (pcm.length > 0) {
    realTimeSendTryChunks.push({ pcm: pcm, pcmSampleRate: pcmSampleRate });
  }

  //从缓冲中切出一帧数据
  let chunkSize = SendFrameSize / (testBitRate / 8); //8位时需要的采样数和帧大小一致，16位时采样数为帧大小的一半
  let pcm2 = new Int16Array(chunkSize),
    pcmSampleRate2 = 0;
  let pcmOK = false,
    pcmLen = 0;
  for1: for (let i1 = 0; i1 < realTimeSendTryChunks.length; i1++) {
    let chunk = realTimeSendTryChunks[i1];
    pcmSampleRate2 = chunk.pcmSampleRate;

    for (let i2 = chunk.offset || 0; i2 < chunk.pcm.length; i2++) {
      pcm2[pcmLen] = chunk.pcm[i2];
      pcmLen++;

      //满一帧了，清除已消费掉的缓冲
      if (pcmLen == chunkSize) {
        pcmOK = true;
        chunk.offset = i2 + 1;
        for (let i3 = 0; i3 < i1; i3++) {
          realTimeSendTryChunks.splice(0, 1);
        }
        break for1;
      }
    }
  }

  //缓冲的数据不够一帧时，不发送 或者 是结束了
  if (!pcmOK) {
    if (isClose) {
      let number = ++realTimeSendTryNumber;
      TransferUpload(number, null, 0, null, isClose, wss);
    }
    return;
  }

  //16位pcm格式可以不经过mock转码，直接发送new Blob([pcm.buffer],{type:"audio/pcm"}) 但8位的就必须转码，通用起见，均转码处理，pcm转码速度极快
  let number = ++realTimeSendTryNumber;
  let encStartTime = Date.now();
  let recMock = Recorder({
    type: "pcm",
    sampleRate: testSampleRate, //需要转换成的采样率
    bitRate: testBitRate, //需要转换成的比特率
    audioTrackSet: {
      noiseSuppression: true, //降噪（ANS）开关，不设置时由浏览器控制（一般为默认打开），设为true明确打开，设为false明确关闭
      echoCancellation: true, //回声消除（AEC）开关，取值和降噪开关一样
      autoGainControl: true,
    },
  });
  recMock.mock(pcm2, pcmSampleRate2);
  recMock.stop(
    function (blob, duration) {
      blob.encTime = Date.now() - encStartTime;

      //转码好就推入传输
      TransferUpload(number, blob, duration, recMock, false, wss);

      //循环调用，继续切分缓冲中的数据帧，直到不够一帧
      RealTimeSendTry([], 0, isClose, wss);
    },
    function (msg) {
      //转码错误？没想到什么时候会产生错误！
      console.error("不应该出现的错误:" + msg, 1);
    }
  );
};
//=====数据传输函数==========
let TransferUpload = function (
  number,
  blobOrNull,
  duration,
  blobRec,
  isClose,
  wss
) {
  transferUploadNumberMax = Math.max(transferUploadNumberMax, number);
  if (blobOrNull) {
    let blob = blobOrNull;
    let encTime = blob.encTime;

    //*********发送方式一：Base64文本发送***************
    let reader: any = new FileReader();
    reader.onloadend = function () {
      let base64 = (/.+;\s*base64\s*,\s*(.+)$/i.exec(reader.result) || [])[1];
      //可以实现
      //WebSocket send(base64) ...
      //   ws.onopen = function(event) {
      // wss.send(base64);
      //   }
      //   ws.onerror = function (err) {
      // 	console.log(5555, err)
      //   }
      //WebRTC send(base64) ...
      //XMLHttpRequest send(base64) ...

      //这里啥也不干
    };
    reader.readAsDataURL(blob);
    wss?.send(blob);

    //*********发送方式二：Blob二进制发送***************
    //可以实现
    //WebSocket send(blob) ...
    //WebRTC send(blob) ...
    //XMLHttpRequest send(blob) ...

    //****这里仅 console.log一下 意思意思****
    let numberFail =
      number < transferUploadNumberMax
        ? '<span style="color:red">顺序错乱的数据，如果要求不高可以直接丢弃</span>'
        : "";
    let logMsg =
      "No." +
      (number < 100 ? ("000" + number).substr(-3) : number) +
      numberFail;

    // console.log(
    //   blob,
    //   duration,
    //   blobRec,
    //   logMsg + "花" + ("___" + encTime).substr(-3) + "ms"
    // );

    if (true && number % 100 == 0) {
      //emmm....
      console.log("该清除了");
    }
  }

  if (isClose) {
    // console.log(
    //   "No." +
    //     (number < 100 ? ("000" + number).substr(-3) : number) +
    //     ":已停止传输"
    // );
  }
};

//=====pcm文件合并核心函数==========
Recorder.PCMMerge = function (fileBytesList, bitRate, sampleRate, True, False) {
  //计算所有文件总长度
  let size = 0;
  for (let i = 0; i < fileBytesList.length; i++) {
    size += fileBytesList[i].byteLength;
  }

  //全部直接拼接到一起
  let fileBytes = new Uint8Array(size);
  let pos = 0;
  for (let i = 0; i < fileBytesList.length; i++) {
    let bytes = fileBytesList[i];
    fileBytes.set(bytes, pos);
    pos += bytes.byteLength;
  }

  //计算合并后的总时长
  let duration = Math.round(((size * 8) / bitRate / sampleRate) * 1000);

  True(fileBytes, duration, { bitRate: bitRate, sampleRate: sampleRate });
};

Recorder.CLog = function () {};

// 修改 VoiceCallback 的处理
type VoiceCallback = (isActive: boolean) => void;
let onVoiceStatusChange: VoiceCallback | null = null;

// 修改声音检测阈值（根据实际测试调整）
const VOICE_THRESHOLD = 40;

//调用录音
let rec;
export async function recStart(wss: WebSocket, selectedDeviceId: string, onVoiceChange: VoiceCallback) {
  try {
    onVoiceStatusChange = onVoiceChange;
    const constraints = {
      audio: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
      },
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (rec) {
      rec.close();
    }

    let lastVoiceState = false;
    let voiceCount = 0;
    const VOICE_DEBOUNCE = 3; // 防抖计数器，避免声音检测过于敏感

    rec = Recorder({
      type: "unknown",
      stream: stream,
      onProcess: function (
        buffers,
        powerLevel,
        bufferDuration,
        bufferSampleRate
      ) {
        // 使用防抖逻辑来检测声音
        const isVoiceActive = powerLevel > VOICE_THRESHOLD;
        
        if (isVoiceActive !== lastVoiceState) {
          voiceCount++;
          if (voiceCount >= VOICE_DEBOUNCE) {
            voiceCount = 0;
            lastVoiceState = isVoiceActive;
            if (onVoiceStatusChange) {
              onVoiceStatusChange(isVoiceActive);
            }
          }
        } else {
          voiceCount = 0;
        }
        
        // 推入实时处理
        RealTimeSendTry(buffers, bufferSampleRate, false, wss);
      },
    });

    let t = setTimeout(function () {
      message.error("无法录音：没有打开录音权限");
      console.log("无法录音：权限请求被忽略（超时假装手动点击了确认对话框）", 1);
    }, 8000);

    rec.open(
      function () {
        //打开麦克风授权获得相关资源
        clearTimeout(t);
        rec.start(); //开始录音

        RealTimeSendTryReset(); //重置环境，开始录音时必须调用一次
      },
      function (msg, isUserNotAllow) {
        clearTimeout(t);
        console.log(
          (isUserNotAllow ? "UserNotAllow，" : "") + "无法录音:" + msg,
          1
        );
      }
    );
  } catch (error) {
    message.error(`录音初始化失败: ${error.message}`);
    throw error;
  }
}
export function recStop(wss: WebSocket) {
  onVoiceStatusChange = null;
  rec?.close(); //直接close掉即可，这个例子不需要获得最终的音频文件

  RealTimeSendTry([], 0, true, wss); //最后一次发送
}
