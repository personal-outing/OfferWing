import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { history, request, useSearchParams } from "ice";
import Modal from "antd/lib/modal/Modal";
import pcm2wav from "./../../../utils/recorderUtils/pcmToWav";
import { getVoiceList } from "@/services/voice";

export default () => {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") || "";
  const [curVoice, setCurVoice] = useState("");
  const [actionModal, setActionModal] = useState(false);

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
    getUrl(name, (url) => {
      initPlay(url);
    });
  };

  const toDownload = (name) => {
    getUrl(name, (url) => {
      window.open(url);
    });
  };

  const columns = [
    {
      title: "录音名",
      dataIndex: "fileName",
      key: "fileName",
      ellipsis: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      render: (text, record, _, action) => [
        <a onClick={() => onChangeVoice(record.fileName)} key="action">
          播放
        </a>,
        <a onClick={() => toDownload(record.fileName)} key="download">
          下载
        </a>,
      ],
    },
  ];

  const initPlay = (url) => {
    pcm2wav(url, 16000, 16, 1, (res) => {
      setCurVoice(res);
    });
  };

  const closeModal = () => {
    const ele: any = document.getElementById("audioEle");
    ele.pause();
    setCurVoice("");
    setActionModal(false);
  };

  useEffect(() => {
    if (!username) {
      history.go(-1);
    }
  }, []);

  return (
    <>
      <ProTable
        search={false}
        request={async (params = {}, sort, filter) => {
          const { current = 0, pageSize = 50 } = params;
          return getVoiceList({
            path: `${username}/`,
            page: current - 1,
            pageNumber: pageSize,
          }).then((res) => {
            const data = JSON.parse(res.data) || [];
            const fordeList = data.fileList.map((item) => {
              return {
                fileName: item,
              };
            });
            return {
              data: fordeList,
              success: true,
              total: data.totalNum || fordeList.length,
            };
          });
        }}
        columns={columns}
        rowKey="fileName"
        dateFormatter="string"
        headerTitle={username + "的录音列表"}
      />
      <Modal footer={null} open={actionModal} onCancel={closeModal}>
        <audio id="audioEle" controls src={curVoice}></audio>
      </Modal>
    </>
  );
};
