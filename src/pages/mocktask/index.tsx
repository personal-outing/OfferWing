import { useCallback, useEffect, useMemo, useState } from "react";
import { definePageConfig, useSearchParams } from "ice";
import {
  DeleteOutlined,
  InfoCircleTwoTone,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Cascader,
  Popover,
  Select,
  Steps,
  message,
  Upload,
  Radio,
  Space,
  Input,
  Modal,
  Card,
  Form,
} from "antd";
import {
  getAllCareers,
  getCodeLan,
  queryComanyInfo,
  sendLog,
  updateComanyInfo,
} from "@/services/meeting";
import store from "@/store";
import styles from "./index.module.css";
import {
  addUserOrigin,
  checkHasResume,
  fetchUserInfo,
  uploadResume,
} from "@/services/user";
import TopNotice from "@/components/TopNotice";
import CardTitle from "@/components/CardTitle";
import SourceModal from "@/components/SourceModal";
import MockInterviewForm from "@/components/MockInterviewForm";
import { getHistory } from "@/services/mockMeeting";
import moment from "moment";
import { toUrl } from "@/utils";

const Option = Select.Option;

function getDfConfig() {
  const obj = JSON.parse(localStorage.getItem("df_config") || "{}");
  obj.careerList = JSON.parse(obj.careerList || "[]");
  obj.region = obj.region || "国内";
  return obj;
}

const MockTask: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [career, setCareer] = useState("");
  const [careerList, setCareerList] = useState([]);
  const [optionsList, setOptionsList] = useState([]);
  const [region, setRegion] = useState("国内");
  const [hasResume, setHasResume] = useState(false);
  const [readyShow, setReadyShow] = useState(false);
  const [originShow, setOriginShow] = useState(false);
  const [careeText, setCareeText] = useState("");
  const [history, setHistory] = useState([]);
  const { currentUser } = store.useModel("user")[0];

  // Fetching data functions
  const fetchCareerOptions = useCallback(async (region) => {
    try {
      const res = await getAllCareers({ region, companyId: -1 });
      if (res.status) {
        const careerOptions = res.data.reduce((acc, item) => {
          const group = acc[item.occupation] || {
            value: item.occupation,
            label: item.occupation,
            children: [],
          };
          group.children.push({ value: item.id, label: item.position });
          acc[item.occupation] = group;
          return acc;
        }, {});
        setOptionsList(Object.values(careerOptions));
      }
    } catch (err) {
      console.error("Failed to fetch career options:", err);
    }
  }, []);

  const fetchResumeStatus = useCallback(async () => {
    try {
      const res = await checkHasResume({ username: currentUser.username });
      setHasResume(res.data.success);
    } catch (err) {
      console.error("Failed to fetch resume status:", err);
    }
  }, [currentUser.username]);

  // Event handlers
  const handleRegionChange = (value) => {
    setRegion(value);
    fetchCareerOptions(value);
    setCareer("");
    setCareerList([]);
  };

  const handleCareerChange = (value, selectedOptions) => {
    if (value && selectedOptions) {
      const lastOption = selectedOptions[selectedOptions.length - 1];
      setCareeText(lastOption.label);
      setCareer(lastOption.value);
      setCareerList(value);
    } else {
      setCareer("");
      setCareerList([]);
    }
  };

  const handleUploadResume = (info) => {
    const { onError, onSuccess, file } = info;
    const isLt2M = file.size / 1024 / 1024 < 3;
    if (!isLt2M) {
      message.warning("简历大小不超过3MB！");
      onError();
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("username", currentUser.username);
    uploadResume(formData).then((res) => {
      if (res.data.success) {
        setHasResume(true);
        onSuccess();
      } else {
        message.error(res.data.reason);
        onError();
      }
    });
  };

  const config = {
    maxCount: 1,
    name: "file",
    accept: ".pdf",
    customRequest: handleUploadResume,
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const fetchHistory = async () => {
    const res = await getHistory({
      username: currentUser.username,
    });
    if (res.status) {
      res.data.forEach((item) => {
        let str = item.summary
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .replace(/\n/g, "")
          .trim();
        console.log(2, str);
        let obj = {};

        // 解析为对象
        try {
          obj = JSON.parse(str);
        } catch (error) {
          console.error("解析失败:", error);
        }
        item.score = obj.score || 0;
      });
      setHistory(
        res.data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    }
  };

  useEffect(() => {
    fetchCareerOptions(region);
    fetchResumeStatus();
    fetchHistory();
  }, [region]);

  return (
    <div className={styles.mockMeeting}>
      <div className={styles.mockHeader}>
        <div className={styles.mockRegion}>
          <p className={styles.mockRegionItem}>
            <label>
              地区&nbsp;
              <Popover content="海外地区默认回答为英文" placement="topRight">
                <InfoCircleTwoTone />
              </Popover>
              ：
            </label>
            <Select
              value={region}
              onChange={handleRegionChange}
              style={{ width: 100 }}
            >
              <Option value="国内">国内</Option>
              <Option value="国外">国外</Option>
            </Select>
          </p>
          <p>
            <label>&nbsp;&nbsp;岗位：</label>
            <Cascader
              placeholder="请选择岗位"
              value={careerList}
              options={optionsList}
              onChange={handleCareerChange}
              style={{ maxWidth: 300 }}
            />
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Upload {...config} showUploadList={false}>
            <Button className={styles.uploadBtn}>上传简历</Button>
          </Upload>
          <Button
            disabled={!career}
            className={styles.readyBtn}
            onClick={() => {
              setReadyShow(true);
            }}
          >
            准备模拟
          </Button>
        </div>
      </div>
      <div className={styles.resumeBox}>
        {hasResume ? (
          <>
            <div>
              <img
                style={{
                  width: "34px",
                }}
                src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/resume.png"
                alt=""
              />
              &nbsp;您已上传简历
            </div>
            <div>
              <Upload {...config} showUploadList={false}>
                <Button className={styles.uploadBtn}>更新简历</Button>
              </Upload>
            </div>
          </>
        ) : (
          <p>您还未上传简历</p>
        )}
      </div>
      <Card
        title={<CardTitle text="面试记录" />}
        className={styles.normalCard}
        style={{ marginTop: "20px" }}
      >
        {history?.map((item, idx) => {
          return (
            <div
              key={idx}
              className={styles.resumeBox}
              style={{ marginTop: "10px" }}
            >
              <p>面试id：{item.mockid.substring(0, 7)}</p>
              <p>面试得分：{item.score}</p>
              <p>{moment(item.date).format("YYYY-MM-DD")}</p>
              <a onClick={() => toUrl("/mock", `id=${item.mockid}`)}>
                查看详情
              </a>
            </div>
          );
        })}
      </Card>
      <Modal
        open={originShow}
        centered
        onCancel={() => setOriginShow(false)}
        footer={null}
      >
        <SourceModal isDashboard={true} phone={currentUser.username} />
      </Modal>
      <Modal
        footer={false}
        onCancel={() => {
          setReadyShow(false);
        }}
        open={readyShow}
      >
        <MockInterviewForm
          positionName={careeText}
          positionId={career}
          onCancel={() => {
            setReadyShow(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default MockTask;

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI - 模拟面试",
  };
});
