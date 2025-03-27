let addWavHeader = function (samples, sampleRateTmp, sampleBits, channelCount) {
  let dataLength = samples.byteLength;
  let buffer = new ArrayBuffer(44 + dataLength);
  let view = new DataView(buffer);
  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  let offset = 0;
  /* 璧勬簮浜ゆ崲鏂囦欢鏍囪瘑绗� */
  writeString(view, offset, 'RIFF');
  offset += 4;
  /* 涓嬩釜鍦板潃寮€濮嬪埌鏂囦欢灏炬€诲瓧鑺傛暟,鍗虫枃浠跺ぇ灏�-8 */
  view.setUint32(offset, /* 32 */ 36 + dataLength, true);
  offset += 4;
  /* WAV鏂囦欢鏍囧織 */
  writeString(view, offset, 'WAVE');
  offset += 4;
  /* 娉㈠舰鏍煎紡鏍囧織 */
  writeString(view, offset, 'fmt ');
  offset += 4;
  /* 杩囨护瀛楄妭,涓€鑸负 0x10 = 16 */
  view.setUint32(offset, 16, true);
  offset += 4;
  /* 鏍煎紡绫诲埆 (PCM褰㈠紡閲囨牱鏁版嵁) */
  view.setUint16(offset, 1, true);
  offset += 2;
  /* 閫氶亾鏁� */
  view.setUint16(offset, channelCount, true);
  offset += 2;
  /* 閲囨牱鐜�,姣忕鏍锋湰鏁�,琛ㄧず姣忎釜閫氶亾鐨勬挱鏀鹃€熷害 */
  view.setUint32(offset, sampleRateTmp, true);
  offset += 4;
  /* 娉㈠舰鏁版嵁浼犺緭鐜� (姣忕骞冲潎瀛楄妭鏁�) 閫氶亾鏁懊楁瘡绉掓暟鎹綅鏁懊楁瘡鏍锋湰鏁版嵁浣�/8 */
  view.setUint32(offset, sampleRateTmp * channelCount * (sampleBits / 8), true);
  offset += 4;
  /* 蹇暟鎹皟鏁存暟 閲囨牱涓€娆″崰鐢ㄥ瓧鑺傛暟 閫氶亾鏁懊楁瘡鏍锋湰鐨勬暟鎹綅鏁�/8 */
  view.setUint16(offset, channelCount * (sampleBits / 8), true);
  offset += 2;
  /* 姣忔牱鏈暟鎹綅鏁� */
  view.setUint16(offset, sampleBits, true);
  offset += 2;
  /* 鏁版嵁鏍囪瘑绗� */
  writeString(view, offset, 'data');
  offset += 4;
  /* 閲囨牱鏁版嵁鎬绘暟,鍗虫暟鎹€诲ぇ灏�-44 */
  view.setUint32(offset, dataLength, true);
  offset += 4;
  function floatTo32BitPCM(output, offset, input) {
    input = new Int32Array(input);
    for (let i = 0; i < input.length; i++, offset += 4) {
      output.setInt32(offset, input[i], true);
    }
  }
  function floatTo16BitPCM(output, offset, input) {
    input = new Int16Array(input);
    for (let i = 0; i < input.length; i++, offset += 2) {
      output.setInt16(offset, input[i], true);
    }
  }
  function floatTo8BitPCM(output, offset, input) {
    input = new Int8Array(input);
    for (let i = 0; i < input.length; i++, offset++) {
      output.setInt8(offset, input[i], true);
    }
  }
  if (sampleBits == 16) {
    floatTo16BitPCM(view, 44, samples);
  } else if (sampleBits == 8) {
    floatTo8BitPCM(view, 44, samples);
  } else {
    floatTo32BitPCM(view, 44, samples);
  }
  return view.buffer;
};

let pcm2wav = function (
  pcm,
  sampleRateTmp,
  sampleBits,
  channelCount,
  callback,
) {
  let req = new XMLHttpRequest();
  req.open('GET', pcm, true); // grab our audio file
  req.responseType = 'arraybuffer'; // needs to be specific type to work
  req.overrideMimeType('text/xml; charset = utf-8');
  req.onload = function () {
    if (this.status != 200) {
      throw 'pcm解析错误';
      return;
    }
    // 鏍规嵁pcm鏂囦欢 濉啓 sampleRateTmp銆愰噰鏍风巼銆戯紙11025锛� 鍜宻ampleBits銆愰噰鏍风簿搴︺€戯紙16锛� channelCount銆愬０閬撱€戯紙鍗曞０閬�1锛屽弻澹伴亾2锛�
    let fileResult = addWavHeader(
      req.response,
      sampleRateTmp,
      sampleBits,
      channelCount,
    );
    let blob = new Blob([fileResult], { type: 'audio/wave' });
    let src = URL.createObjectURL(blob);
    if (callback) {
      callback(src);
    }
  };
  req.send();
};

export default pcm2wav;
