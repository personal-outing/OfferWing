import { Button, Dropdown, Input, Modal, Space, Tag, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "ice";
import { getVoiceList, getVoiceSlice } from "@/services/voice";
import pcm2wav from "./../../../utils/recorderUtils/pcmToWav";
import moment from "moment";

export default () => {
  const [curVoice, setCurVoice] = useState("");
  const [curFullVoice, setCurFullVoice] = useState("");
  const [actionModal, setActionModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [traceId, setTraceId] = useState("");
  const [curInfo, setCurInfo] = useState({});
  const [curData, setCurData] = useState({});
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const getUrl = (name, callback) => {
    getVoiceList({
      path: name,
      page: 0,
      pageNumber: 50,
    }).then((res) => {
      const data = JSON.parse(res.data) || [];
      callback(data.fileUrl);
    });
  };

  const onChangeVoice = (name) => {
    setActionModal(true);
    if (curFullVoice) return;
    message.loading({
      content: "处理中",
      duration: 0,
    });
    getUrl(name, (url) => {
      pcm2wav(url, 16000, 16, 1, (res) => {
        setCurFullVoice(res);
        message.destroy();
      });
    });
  };

  function bufferToWave(buffer) {
    const numOfChannels = buffer.numberOfChannels,
      length = buffer.length * numOfChannels * 2 + 44,
      bufferArray = new ArrayBuffer(length),
      view = new DataView(bufferArray),
      channels = [],
      sampleRate = buffer.sampleRate;

    let offset = 0;
    function setUint16(data) {
      view.setUint16(offset, data, true);
      offset += 2;
    }

    function setUint32(data) {
      view.setUint32(offset, data, true);
      offset += 4;
    }

    // RIFF identifier
    setUint32(0x46464952);
    // file length minus RIFF identifier length and file description length
    setUint32(length - 8);
    // RIFF type
    setUint32(0x45564157);

    // format chunk identifier
    setUint32(0x20746d66);
    // format chunk length
    setUint32(16);
    // sample format (raw)
    setUint16(1);
    // channel count
    setUint16(numOfChannels);
    // sample rate
    setUint32(sampleRate);
    // byte rate (sample rate * block align)
    setUint32(sampleRate * 2 * numOfChannels);
    // block align (channel count * bytes per sample)
    setUint16(numOfChannels * 2);
    // bits per sample
    setUint16(16);

    // data chunk identifier
    setUint32(0x61746164);
    // data chunk length
    setUint32(length - offset - 4);

    // write interleaved data
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        channels[channel] = buffer.getChannelData(channel);
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return new Blob([view], { type: "audio/wav" });
  }

  const initPlay = (url) => {
    pcm2wav(url, 16000, 16, 1, (res) => {
      setCurVoice(res);
    });
  };

  const closeModal = () => {
    const ele: any = document.getElementById("audioEle");
    ele.pause();
    setActionModal(false);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurInfo({});
    setCurData({});
    setCurVoice("");
    setCurFullVoice("");
    getVoiceSlice({ traceId }).then((res) => {
      res = res.data;
      const date = moment(res.gmtCreate);
      // 格式化日期字符串
      const formattedDate = date.format("YYYY-MM-DD HH:mm:00");
      setCurInfo({
        username: res.userId,
        gmtCreate: formattedDate,
      });
    });
  };

  const handleSlice = () => {
    message.info("剪裁开始");
    fetch(curFullVoice).then((response) => {
      response.arrayBuffer().then((arrayBuffer) => {
        const audioContext = new window.AudioContext();
        audioContext.decodeAudioData(arrayBuffer).then((audioBuffers) => {
          const sampleRate = audioBuffers.sampleRate;
          const startSample = Math.floor(parseInt(startTime) * sampleRate);
          const endSample = Math.floor(parseInt(endTime) * sampleRate);

          const croppedBuffer = audioContext.createBuffer(
            audioBuffers.numberOfChannels,
            endSample - startSample,
            sampleRate
          );

          for (
            let channel = 0;
            channel < audioBuffers.numberOfChannels;
            channel++
          ) {
            const channelData = audioBuffers.getChannelData(channel);
            const croppedChannelData = croppedBuffer.getChannelData(channel);
            for (let i = startSample, j = 0; i < endSample; i++, j++) {
              croppedChannelData[j] = channelData[i];
            }
          }

          const offlineContext = new OfflineAudioContext(
            croppedBuffer.numberOfChannels,
            croppedBuffer.length,
            croppedBuffer.sampleRate
          );

          const bufferSource = offlineContext.createBufferSource();
          bufferSource.buffer = croppedBuffer;
          bufferSource.connect(offlineContext.destination);
          bufferSource.start();

          offlineContext.startRendering().then((renderedBuffer) => {
            const wavBlob = bufferToWave(renderedBuffer);
            const croppedAudioURL = URL.createObjectURL(wavBlob);
            setCurVoice(croppedAudioURL);
            message.info("剪裁成功");
          });
        });
      });
    });
  };

  const downloadAudio = async (name) => {
    if (!startTime || !endTime) {
      message.error("没输入时间");
      return;
    }
    if (!curFullVoice) {
      message.error("音频还在请求中");
      return;
    }
    handleSlice();
  };

  useEffect(() => {
    if (curVoice) {
      const ele: any = document.getElementById("audioEle");
      ele.load();
      ele.currentTime = curData.diff;
    }
  }, [curVoice]);

  useEffect(() => {
    if (curInfo.username) {
      getVoiceList({
        path: `${curInfo.username}/`,
        page: 0,
        pageNumber: 50,
      }).then((res) => {
        const data = JSON.parse(res.data) || [];
        const fordeList = data.fileList.map((item) => {
          return {
            fileName: item,
          };
        });
        for (let i = 0; i < fordeList.length; i++) {
          const name = fordeList[i].fileName;
          const time = name.split("/")[1];
          const momentDate1 = moment(time, "YYYY-MM-DD HH:mm:ss");
          const momentDate2 = moment(curInfo.gmtCreate, "YYYY-MM-DD HH:mm:ss");
          // 比较日期
          if (momentDate1.isBefore(momentDate2)) {
            const diffInSeconds = momentDate2.diff(momentDate1, "seconds") + 10;
            setCurData({ ...fordeList[i], diff: diffInSeconds });
            setIsSearching(false);
            break;
          }
        }
      });
    }
  }, [curInfo]);

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", padding: "20px" }}>
        <Input
          value={traceId}
          onChange={(e) => setTraceId(e.target.value)}
          style={{ width: "500px", marginRight: "10px" }}
          placeholder="traceId"
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
      </div>
      <div
        style={{
          width: "100%",
          height: "500px",
          background: "#fff",
          padding: "20px",
        }}
      >
        {isSearching && <p>搜索中</p>}
        {curData.fileName && (
          <div style={{ display: "flex" }}>
            <p style={{ marginRight: "20px" }}>{curData.fileName}</p>
            <p onClick={() => onChangeVoice(curData.fileName)}>
              <a>播放 / </a>
            </p>
          </div>
        )}
      </div>
      <Modal footer={null} open={actionModal} onCancel={closeModal}>
        完整
        <br />
        <audio id="audioEle" controls src={curFullVoice}></audio>
        <br />
        剪裁后
        <br />
        <audio id="audioEle2" controls src={curVoice}></audio>
        <br />
        <br />
        <Input
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="开始时间"
          style={{ width: "200px" }}
        />{" "}
        -{" "}
        <Input
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="结束时间"
          style={{ width: "200px" }}
        />{" "}
        &nbsp;
        <br />
        <Button onClick={() => downloadAudio(curData.fileName)}>剪裁</Button>
      </Modal>
    </div>
  );
};
