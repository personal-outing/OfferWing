import React, { useEffect, useState } from "react";
import { useDevicesList } from "@/hooks/useDevicesList";
import styles from "./index.module.css";
import { Button, Radio, Select } from "antd";
import { detectMicrophone, stopMicrophone } from "@/utils";
import { queryPayHistory } from "@/services/pay";

const Option = Select.Option;
export default function SelectMode({
  curModeIdx,
  setCurModeIdx,
  deviceId,
  setDeviceId,
  join,
  setJoin,
  currentUser,
}) {
  const [testMic, setTestMic] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { userAudioInputs } = useDevicesList({});
  const [beginnerShow, setBeginnerShow] = useState(false);

  const loadPayHistory = () => {
    queryPayHistory({ phone: currentUser.username }).then((res) => {
      if (res.status) {
        if (res.data.length > 0) {
          setBeginnerShow(true);
        }
      }
    });
  };

  useEffect(() => {
    if (userAudioInputs.length > 0 && !deviceId) {
      setDeviceId(userAudioInputs[0].deviceId);
    }
  }, [userAudioInputs]);

  const handleMicPermission = async () => {
    setRefreshing(true);
    try {
      // 先获取权限
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 短暂延迟后重新获取设备列表，确保能获取到完整的设备信息
      setTimeout(async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(
          device => device.kind === 'audioinput' && 
          device.deviceId !== 'default' && 
          device.deviceId !== 'communications'
        );
        if (audioInputs.length > 0) {
          setDeviceId(audioInputs[0].deviceId);
        }
        setRefreshing(false);
      }, 500);
    } catch (err) {
      console.error('获取麦克风权限失败:', err);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (deviceId && testMic) {
      stopMicrophone();
      setTestMic(!testMic);
    }
  }, [deviceId]);

  useEffect(() => {
    if (userAudioInputs.length === 0 && !refreshing) {
      handleMicPermission();
    }
  }, [userAudioInputs]);

  useEffect(() => {
    loadPayHistory();
  }, []);

  return (
    <>
      <div style={{ display: "flex" }}>
        <div
          className={styles.modeBox}
          style={{ borderColor: curModeIdx == 0 ? "#0b88e1" : "#222" }}
          onClick={() => {
            setCurModeIdx(0);
          }}
        >
          <p style={{ fontWeight: "bold", textAlign: "center" }}>
            系统音频共享
          </p>
          <p style={{ textAlign: "left" }}>
            监听系统音频通话，无法监听其它网页声音，外界声音清晰接收
          </p>
          <p style={{ textAlign: "left" }}>
            适合腾讯会议、ZOOM、飞书等客户端软件
          </p>
        </div>
        <div
          className={styles.modeBox}
          style={{ borderColor: curModeIdx == 1 ? "#0b88e1" : "#222" }}
          onClick={() => setCurModeIdx(1)}
        >
          <p style={{ fontWeight: "bold", textAlign: "center" }}>
            网页音频共享
          </p>
          <p style={{ textAlign: "left" }}>
            监听浏览器其它页面声音，但你的声音会有所减弱
          </p>
          <p>适合收音其它网页音频场景</p>
        </div>
      </div>
      <div style={{ marginTop: "15px" }}>
        <h3>选择你音频输入方式</h3>
        <p style={{ fontSize: "12px" }}>
          确定您的麦克风权限已开启，切记不要戴耳机，如果麦克风没有声音，请参考
          <a
            href="https://qupbvle53j.feishu.cn/docx/KStWdWlyLoCkS0xBDYBcl1a5neb#share-CNYPdJ4xGoZ8eOxmvIwcDDVLnkf"
            target="_blank"
          >
            新手教程
          </a>
          解决办法
        </p>
        <Select
          style={{
            width: "300px",
          }}
          value={deviceId}
          onChange={(val) => setDeviceId(val)}
        >
          {userAudioInputs.map((item, idx) => {
            return (
              <Option key={idx} value={item.deviceId}>
                {item.label}
              </Option>
            );
          })}
        </Select>
        {(!deviceId && !refreshing) && (
          <span style={{ color: "red" }}>
            &nbsp;&nbsp;您还未开启麦克风权限！
            <Button type="link" onClick={handleMicPermission}>点击获取权限</Button>
          </span>
        )}
        <div className={styles.macTest}>
          <Button
            type="primary"
            onClick={() => {
              if (!testMic) {
                detectMicrophone(deviceId);
              } else {
                stopMicrophone();
              }
              setTestMic(!testMic);
            }}
          >
            {testMic ? "测试结束" : "测试麦克风"}
          </Button>
          <p id="volume-display" className={styles.micLength}></p>
        </div>
        {beginnerShow && (
          <>
            <h3>这有一份新手引导，仅需两分钟，带你勇闯新手村！</h3>
            <Radio.Group value={join} onChange={(e) => setJoin(e.target.value)}>
              <Radio.Button value={true}>参加!我是小白</Radio.Button>
              <Radio.Button value={false}>不用!自己探索</Radio.Button>
            </Radio.Group>
          </>
        )}
      </div>
    </>
  );
}
