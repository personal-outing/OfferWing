import Recorder from "recorder-core";
import "recorder-core/src/engine/mp3.js";
import "recorder-core/src/engine/mp3-engine.js";
import "recorder-core/src/engine/pcm.js";

let testOutputWavLog = false; //顺带打一份wav的log，录音后执行mp3、wav合并的demo代码可对比音质
let testSampleRate = 16000;
let testBitRate = 16;

let SendInterval = 3000; //发送间隔时长(毫秒)，mp3 chunk数据会缓冲，当pcm的累积时长达到这个时长，就会传输发送。这个值在takeoffEncodeChunk实现下，使用0也不会有性能上的影响。

//重置环境，每次开始录音时必须先调用此方法，清理环境
let RealTimeSendTryReset = function () {
  realTimeSendTryTime = 0;
};

let realTimeSendTryTime = 0;
let realTimeSendTryNumber;
let transferUploadNumberMax;
let realTimeSendTryBytesChunks;
let realTimeSendTryClearPrevBufferIdx;
let realTimeSendTryWavTestBuffers;
let realTimeSendTryWavTestSampleRate;

// 转换
Recorder.Mp32Other = function (newSet, mp3Blob, True, False) {
  if (!Recorder.GetContext()) {
    //强制激活Recorder.Ctx 不支持大概率也不支持解码
    False && False("浏览器不支持mp3解码");
    return;
  }

  var reader = new FileReader();
  reader.onloadend = function () {
    var ctx = Recorder.Ctx;
    ctx.decodeAudioData(
      reader.result,
      function (raw) {
        var src = raw.getChannelData(0);
        var sampleRate = raw.sampleRate;

        var pcm = new Int16Array(src.length);
        for (var i = 0; i < src.length; i++) {
          //floatTo16BitPCM
          var s = Math.max(-1, Math.min(1, src[i]));
          s = s < 0 ? s * 0x8000 : s * 0x7fff;
          pcm[i] = s;
        }
        var rec = Recorder(newSet).mock(pcm, sampleRate);
        rec.stop(function (blob, duration) {
          True(blob, duration, rec);
        }, False);
      },
      function (e) {
        False && False("mp3解码失败:" + e.message);
      }
    );
  };
  reader.readAsArrayBuffer(mp3Blob);
};

//=====实时处理核心函数==========
let RealTimeSendTry = function (chunkBytes, isClose, wss) {
  if (chunkBytes) {
    //推入缓冲再说
    realTimeSendTryBytesChunks.push(chunkBytes);
  }

  let t1 = Date.now();
  if (!isClose && t1 - realTimeSendTryTime < SendInterval) {
    return; //控制缓冲达到指定间隔才进行传输
  }
  realTimeSendTryTime = t1;
  let number = ++realTimeSendTryNumber;

  //mp3缓冲的chunk拼接成一个更长点的mp3
  let len = 0;
  for (let i = 0; i < realTimeSendTryBytesChunks.length; i++) {
    len += realTimeSendTryBytesChunks[i].length;
  }
  let chunkData = new Uint8Array(len);
  for (let i = 0, idx = 0; i < realTimeSendTryBytesChunks.length; i++) {
    let chunk = realTimeSendTryBytesChunks[i];
    chunkData.set(chunk, idx);
    idx += chunk.length;
  }
  realTimeSendTryBytesChunks = [];

  //推入传输
  let blob: any = null,
    meta: any = {};
  if (chunkData.length > 0) {
    //mp3不是空的
    blob = new Blob([chunkData], { type: "audio/mp3" });
    meta = Recorder.mp3ReadMeta([chunkData.buffer], chunkData.length) || {}; //读取出这个mp3片段信息
  }
  TransferUpload(
    number,
    blob,
    meta.duration || 0,
    {
      set: {
        type: "mp3",
        sampleRate: meta.sampleRate,
        bitRate: meta.bitRate,
      },
    },
    isClose,
    wss
  );

  if (testOutputWavLog) {
    //测试输出一份wav，方便对比数据
    let recMock2 = Recorder({
      type: "wav",
      sampleRate: testSampleRate,
      bitRate: 16,
    });
    let chunk = Recorder.SampleData(
      realTimeSendTryWavTestBuffers,
      realTimeSendTryWavTestSampleRate,
      realTimeSendTryWavTestSampleRate
    );
    recMock2.mock(chunk.data, realTimeSendTryWavTestSampleRate);
    recMock2.stop(function (blob, duration) {
      let logMsg =
        "No." + (number < 100 ? ("000" + number).substr(-3) : number);
      console.log(blob, duration, recMock2, logMsg);
    });
  }
  realTimeSendTryWavTestBuffers = [];
};

//=====实时处理时清理一下内存（延迟清理），本方法先于RealTimeSendTry执行======
let RealTimeOnProcessClear = function (
  buffers,
  powerLevel,
  bufferDuration,
  bufferSampleRate,
  newBufferIdx,
  asyncEnd
) {
  if (realTimeSendTryTime == 0) {
    realTimeSendTryTime = Date.now();
    realTimeSendTryNumber = 0;
    transferUploadNumberMax = 0;
    realTimeSendTryBytesChunks = [];
    realTimeSendTryClearPrevBufferIdx = 0;
    realTimeSendTryWavTestBuffers = [];
    realTimeSendTryWavTestSampleRate = 0;
  }

  //清理PCM缓冲数据，最后完成录音时不能调用stop，因为数据已经被清掉了
  //这里进行了延迟操作（必须要的操作），只清理上次到现在的buffer
  for (let i = realTimeSendTryClearPrevBufferIdx; i < newBufferIdx; i++) {
    buffers[i] = null;
  }
  realTimeSendTryClearPrevBufferIdx = newBufferIdx;

  //备份一下方便后面生成测试wav
  for (let i = newBufferIdx; i < buffers.length; i++) {
    realTimeSendTryWavTestBuffers.push(buffers[i]);
  }
  realTimeSendTryWavTestSampleRate = bufferSampleRate;
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

    //*********发送方式一：Base64文本发送***************
    let reader: any = new FileReader();
    reader.onloadend = function () {
      let base64 = (/.+;\s*base64\s*,\s*(.+)$/i.exec(reader.result) || [])[1];

      //可以实现
      wss.send(base64)
      //WebRTC send(base64) ...
      //XMLHttpRequest send(base64) ...

      //这里啥也不干
    };
    // Recorder.Mp32Other(
    //   { type: "pcm", sampleRate: 16000, bitRate: 16 },
    //   blob,
    //   function (blob, duration, rec) {
    //     console.log(123, blob, (window.URL || webkitURL).createObjectURL(blob));
    //     console.log(456,blob, duration, rec);
    //   },
    //   function (msg) {
    //     console.log(msg, 1);
    //   }
    // );
    reader.readAsDataURL(blob);

    //*********发送方式二：Blob二进制发送***************
    //可以实现
    //WebSocket send(blob) ...
    //WebRTC send(blob) ...
    //XMLHttpRequest send(blob) ...

    //****这里仅 console.log一下 意思意思****
    let numberFail =
      number < transferUploadNumberMax
        ? '<span style="color:red">顺序错乱的数据，如果要求不高可以直接丢弃，或者调大SendInterval试试</span>'
        : "";
    let logMsg =
      "No." +
      (number < 100 ? ("000" + number).substr(-3) : number) +
      numberFail;

    console.log(blob, duration, blobRec, logMsg);
  }

  if (isClose) {
    console.log(
      "No." +
        (number < 100 ? ("000" + number).substr(-3) : number) +
        ":已停止传输"
    );
  }
};

//调用录音
let rec;
export function recStart(wss) {
  if (rec) {
    rec.close();
  }

  rec = Recorder({
    type: "mp3",
    sampleRate: testSampleRate,
    bitRate: testBitRate,
    onProcess: function (
      buffers,
      powerLevel,
      bufferDuration,
      bufferSampleRate,
      newBufferIdx,
      asyncEnd
    ) {
      RealTimeOnProcessClear(
        buffers,
        powerLevel,
        bufferDuration,
        bufferSampleRate,
        newBufferIdx,
        asyncEnd
      ); //实时数据处理，清理内存
    },
    takeoffEncodeChunk: function (chunkBytes) {
      //接管实时转码，推入实时处理
      RealTimeSendTry(chunkBytes, false, wss);
    },
  });

  let t = setTimeout(function () {
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
      console.error(
        (isUserNotAllow ? "UserNotAllow，" : "") + "无法录音:" + msg,
        1
      );
    }
  );
}
export function recStop(wss) {
  rec.close(); //直接close掉即可，这个例子不需要获得最终的音频文件

  RealTimeSendTry(null, true, wss); //最后一次发送
}
