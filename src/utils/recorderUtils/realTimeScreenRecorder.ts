let audioContext;

function convertToBlob(audioData) {
  const buffer = new ArrayBuffer(audioData.length * 2); // 16-bit
  const view = new DataView(buffer);

  for (let i = 0; i < audioData.length; i++) {
    view.setInt16(i * 2, audioData[i] * 0x7fff, true); // 小端序
  }

  return new Blob([view], { type: "audio/raw" });
}

// 开始捕获音频并传输
function handleAudioStream(stream, wss) {
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1); // 3200 字节帧大小

  source.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = function (event) {
    const audioData = event.inputBuffer.getChannelData(0); // 获取音频数据
    const blob = convertToBlob(audioData);
    wss?.send(blob);
  };
}

export async function startCapture(wss) {
  navigator.mediaDevices
    .getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100, // 初始采样率
      },
    })
    .then((stream) => {
      // 处理音频流
      handleAudioStream(stream, wss);
    })
    .catch((error) => {
      console.error("Error accessing media devices.", error);
    });
}

// 停止捕获音频
export function recStop() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
