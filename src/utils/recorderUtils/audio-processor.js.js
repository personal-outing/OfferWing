// audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.sampleRate = 16000;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];

      // 将数据转换为 16-bit 并调整采样率
      const resampledData = this.resample(channelData, sampleRate, this.sampleRate);
      this.buffer.push(...resampledData);

      // 当缓冲区数据达到指定大小时，将其发送回主线程
      if (this.buffer.length >= 3200 / 2) {  // 3200 字节的 16-bit PCM 数据
        this.port.postMessage(this.buffer.slice(0, 3200 / 2));
        this.buffer = this.buffer.slice(3200 / 2);
      }
    }
    return true;
  }

  resample(data, inputSampleRate, outputSampleRate) {
    const ratio = inputSampleRate / outputSampleRate;
    const length = Math.round(data.length / ratio);
    const result = new Int16Array(length);

    for (let i = 0; i < length; i++) {
      const index = Math.floor(i * ratio);
      result[i] = Math.max(-1, Math.min(1, data[index])) * 32767;  // 转换为 16-bit
    }

    return result;
  }
}

registerProcessor('audio-processor', AudioProcessor);
