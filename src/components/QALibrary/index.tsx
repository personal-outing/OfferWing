import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { EditableProTable } from "@ant-design/pro-components";
import { getAllCareers } from "@/services/meeting";
import { UploadOutlined } from "@ant-design/icons";
import {
  getPQQuota,
  getPQList,
  submitExpTask,
  getExpTaskStatus,
} from "@/services/tech";
import store from "@/store";
import styles from "./index.module.css";
import ReactJson from "react-json-view";
import {
  Button,
  Cascader,
  message,
  Select,
  Tabs,
  Upload,
  Alert,
  Checkbox,
} from "antd";
import { toUrl } from "../../utils";

const Option = Select.Option;
function QALibrary(props) {
  const {
    career: defaultCareer = "",
    defaultTab = "1",
    defaultCareerList = [],
  } = props;
  const [userState] = store.useModel("user");
  const { currentUser } = userState;
  const [curCount, setCurCount] = useState(5);
  const [payNum, setPayNum] = useState(0);
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [uploadDataSource, setUploadDataSource] = useState([]);
  const [careerList, setCareerList] = useState(defaultCareerList);
  const [career, setCareer] = useState(defaultCareer);
  const [optionsList, setOptionsList] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [region, setRegion] = useState("国内");
  const [submittedLen, setSubmittedLen] = useState(0);

  const saveJson = () => {
    // 定义要下载的JSON数据
    const data = dataSource.map((item) => {
      return { question: item.question, answer: item.answer };
    });

    // 将JSON数据转换为字符串
    const jsonStr = JSON.stringify(data);

    // 创建一个Blob对象，其中包含JSON数据
    const blob = new Blob([jsonStr], { type: "application/json" });

    // 创建一个隐藏的链接元素
    const link = document.createElement("a");
    link.style.display = "none";

    // 为链接元素添加URL
    link.href = URL.createObjectURL(blob);

    // 设置下载文件的名称
    link.download = `问答库-${career}.json`;

    // 将链接元素添加到DOM中
    document.body.appendChild(link);

    // 触发点击事件，开始下载
    link.click();

    // 下载完成后，从DOM中移除链接元素
    document.body.removeChild(link);
  };

  const getCarrers = (region) => {
    getAllCareers({ region, companyId: -1 }).then((res) => {
      if (res.status) {
        const curList: any = [];
        const obj: any = {};
        res.data.forEach((item) => {
          if (obj[item.occupation]) {
            obj[item.occupation].children.push({
              value: item.id,
              label: item.position,
            });
          } else {
            obj[item.occupation] = {
              value: item.occupation,
              label: item.occupation,
              children: [{ value: item.id, label: item.position }],
            };
          }
        });
        for (let key in obj) {
          curList.push(obj[key]);
        }
        setOptionsList(curList);
      }
    });
  };

  const onChangeLan = (val) => {
    setCareerList([]);
    getCarrers(val);
    setRegion(val);
    setCareer("");
  };

  const queryPQQuota = () => {
    getPQQuota({
      userId: currentUser.username,
    }).then((res) => {
      if (res.status) {
        setPayNum(res.data.rechargeAmount);
        setCurCount(res.data.quota);
      }
    });
  };

  const getTaskStatus = (curCareer) => {
    getExpTaskStatus({
      userId: currentUser.username,
      positionId: curCareer,
      status: "submitted",
      start: 0,
      count: 100,
    }).then((res) => {
      if (res.status) {
        setSubmittedLen(res.data.totalCount);
      }
    });
  };

  const postExpTask = () => {
    if (uploadDataSource.length > 0) {
      submitExpTask({
        userId: currentUser.username,
        params: {
          positionId: career,
          pqs: uploadDataSource,
        },
      }).then((res) => {
        if (res.status) {
          message.success("提交成功！稍等片刻，审核后会自动上传");
        }
      });
    } else {
      message.warning("本次无更新内容");
    }
  };

  const checkJson = (jsonData) => {
    let isOk = true,
      msg = "";
    for (let i = 0; i < jsonData.length; i++) {
      if (
        jsonData[i].question &&
        jsonData[i].answer &&
        typeof jsonData[i].question === "string" &&
        typeof jsonData[i].answer === "string"
      ) {
        if (jsonData[i].question.length > 300) {
          msg = `第${i + 1}行问题长度不能超过300，请修改后重新上传`;
          isOk = false;
          break;
        }
        if (jsonData[i].answer.length > 2000) {
          msg = `第${i + 1}行答案长度不能超过300，请修改后重新上传`;
          isOk = false;
          break;
        }
      } else {
        isOk = false;
        msg = `第${i + 1}行数据格式不符合要求，请补充重新上传`;
        break;
      }
    }

    return { isOk, msg };
  };

  const queryPQList = (cur) => {
    getPQList({
      pqId: `${currentUser.username}_${career}`,
      start: 100 * (cur - 1),
      count: 100,
    }).then((res) => {
      const curData = res.data?.data.map((item) => {
        item.id = item.questionId;
        item.saved = true;
        item.checked = false;
        return item;
      });
      setEditableRowKeys(curData.map((item) => item.id));
      setDataSource(curData || []);
      setTotal(res.data.totalCount || 0);
    });
  };

  const addToCheckedList = (idx) => {
    const list = [...dataSource];
    list[idx].checked = !list[idx].checked;
    setDataSource(list);
  };

  useEffect(() => {
    if (career) {
      queryPQQuota();
      queryPQList(1);
    }
  }, [career]);

  useEffect(() => {
    queryPQQuota();
    getCarrers("国内");
  }, []);

  const columns = [
    {
      title: (
        <Checkbox
          checked={dataSource.length > 0 && dataSource.every((item) => item.checked)}
          indeterminate={
            dataSource.some((item) => item.checked) &&
            !dataSource.every((item) => item.checked)
          }
          onChange={(e) => {
            const newDataSource = dataSource.map((item) => ({
              ...item,
              checked: e.target.checked,
            }));
            setDataSource(newDataSource);
          }}
        />
      ),
      dataIndex: "idx",
      width: 50,
      valueType: "",
      render(_, row, idx) {
        return (
          <Checkbox
            checked={row.checked}
            onClick={() => addToCheckedList(idx)}
          />
        );
      },
    },
    {
      title: "id",
      dataIndex: "id",
      readonly: true,
    },
    {
      title: "question",
      dataIndex: "question",
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: "此项是必填项",
          },
          {
            max: 300,
            whitespace: true,
            message: "最长为 300 位",
          },
          {
            min: 1,
            whitespace: true,
            message: "最小为 1 位",
          },
        ],
      },
    },
    {
      title: "answer",
      dataIndex: "answer",
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: "此项是必填项",
          },
          {
            max: 2000,
            whitespace: true,
            message: "最长为 2000 位",
          },
          {
            min: 1,
            whitespace: true,
            message: "最小为 1 位",
          },
        ],
      },
    },
    {
      title: "操作",
      valueType: "option",
      render: () => {
        return null;
      },
    },
  ];

  const uploadProps = {
    name: "file",
    accept: ".json",
    headers: {
      authorization: "authorization-text",
    },
    maxCount: 1,
    customRequest(info) {
      // 使用FileReader读取文件内容
      const reader = new FileReader();
      // 定义当读取完成时的操作
      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result || "[]"; // 读取的文件内容
          const jsonContent = JSON.parse(fileContent); // 解析为JSON对象
          const { isOk, msg } = checkJson(jsonContent);
          if (isOk) {
            const maxLen = Math.max(curCount, jsonContent.length);
            const realData = jsonContent.map((item, index) => {
              item.id = (Date.now() + index).toString();
              item.type = "add";
              item.checked = false;
              return item;
            });
            const dataQuestions = new Set(
              dataSource.map((item) => item.question)
            );
            // 过滤掉 dataSource 中 question 出现在 realData 中的项
            const filteredDataSource = realData.filter(
              (item) => !dataQuestions.has(item.question)
            );
            const curData = [...dataSource, ...filteredDataSource]
              .slice(0, maxLen)
              .filter(Boolean);
            let curUploadData = [...uploadDataSource];
            let count = maxLen - dataSource.length,
              i = 0;
            while (i < count) {
              if (filteredDataSource[i]) {
                curUploadData.push(filteredDataSource[i]);
              }
              i++;
            }
            curUploadData = curUploadData.filter(Boolean);
            setEditableRowKeys(curData.map((item) => item.id));
            setDataSource(curData);
            setUploadDataSource(curUploadData);
            message.success(`${info.file.name} 上传成功`);
            info.onSuccess();
          } else {
            info.onError();
            message.error(msg);
          }
        } catch (error) {
          info.onError();
          message.error("上传json格式错误，请重新上传！");
          console.error("Error parsing JSON:", error);
        }
      };

      // 读取文件为文本
      reader.readAsText(info.file);
    },
  };

  const onChangeInCareer = (value) => {
    const curCareer = value ? value[value.length - 1] : "";
    setCareerList(value);
    setCareer(curCareer);
    getTaskStatus(curCareer);
  };

  const displayRender = (labels: string[]) => labels[labels.length - 1];

  const deleteAll = () => {
    const deleteList = dataSource.filter((item) => item.checked);
    let result = [...uploadDataSource];

    let dataResult = [...dataSource];

    if (result.length > 0) {
      result.forEach((item) => {
        deleteList.forEach((subItem) => {
          if (subItem.id === item.id) {
            item.type = "delete";
          }
        });
      });
    } else {
      result = deleteList.map((item) => {
        item.type = "delete";
        return item;
      });
    }

    dataResult = dataResult.filter((item) => {
      let temp = true;
      deleteList.forEach((subItem) => {
        if (subItem.id === item.id) {
          temp = false;
        }
      });
      return temp;
    });

    setUploadDataSource(result);
    setDataSource(dataResult);
  };

  const disableDeleteAll = useMemo(() => {
    return !dataSource.some((item) => item.checked);
  }, [dataSource]);

  const reloadStatus = () => {
    queryPQList(1);
  };

  const items = [
    {
      key: "1",
      label: "详情",
      children: (
        <div>
          <h3>介绍</h3>
          <p>
            自定义问答库是指您可以针对指定岗位选择预设问题+答案，当面试官问到相似问题时，OfferWing
            AI会优先返回您提供的答案
          </p>
          <br />
          <h3>规则</h3>
          <p>1. 您可以手动逐行添加问答对</p>
          <p>
            {" "}
            2.
            您也可以上传json文件，json为标准list/array格式，question长度不超过300，answer长度不超过2000
          </p>
          <ReactJson
            displayDataTypes={false}
            displayObjectSize={false}
            name={null}
            src={[
              {
                question: "你认为大模型未来发展是怎么样的？",
                answer:
                  "多模态融合、个性化与定制化、高效能与低能耗、跨领域与跨学科应用",
              },
              {
                question: "你对Agent的理解？",
                answer:
                  "Agent可以被定义为一种自主的、感知环境的实体，能够在特定环境中采取行动以实现某种目标或任务。它通常具有感知能力（Perception）、决策能力（Decision-Making）、行动能力（Action）以及某种形式的目标或动机（Goal or Objective）。",
              },
            ]}
          />
          <p>3. 如果检测到你上传到题库存在问题，会标红处理，请记得修改</p>
          <p>
            4.
            自定义问题库最大条数由您的累积充值时长决定，初始用户可免费添加5条，累计充值1小时您可添加20条，充值时长每增加一小时可继续添加20条
          </p>
        </div>
      ),
    },
    {
      key: "2",
      label: "管理问答库",
      children: (
        <div>
          <div>
            <div>
              <p>地区</p>
              <Select
                className={styles.selectBox}
                onChange={onChangeLan}
                value={region}
              >
                <Option value="国内">国内</Option>
                <Option value="国外">国外</Option>
              </Select>
            </div>
            <div style={{ margin: "10px 0" }}>
              <p>岗位</p>
              <Cascader
                value={careerList}
                className={styles.cascader}
                options={optionsList}
                displayRender={displayRender}
                onChange={onChangeInCareer}
              />
            </div>
          </div>
          {career && (
            <>
              <p>
                你已经充值{payNum}
                <img
                  src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/unit.png"
                  alt="logo"
                  style={{ height: "15px", verticalAlign: "sub" }}
                />
                , 可添加{curCount}条问答对，
                <a onClick={() => toUrl("/pay")}>去充值提高可添加条数</a>
              </p>
              <br />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>上传问答库(json)</Button>
                  </Upload>
                </div>

                <Button onClick={saveJson}>下载到本地</Button>
              </div>
              {submittedLen > 0 && (
                <Alert
                  style={{ margin: "10px 0" }}
                  message={`您当前还有${submittedLen}条问答对正在更新，等待生效中`}
                  type="warning"
                />
              )}
              <Button disabled={disableDeleteAll} onClick={deleteAll}>
                批量删除
              </Button>
              &nbsp;
              <Button onClick={reloadStatus} type="primary">
                刷新状态
              </Button>
              <EditableProTable
                style={{ marginTop: "10px" }}
                headerTitle=""
                columns={columns}
                rowKey="id"
                scroll={{
                  x: 960,
                }}
                maxLength={curCount}
                value={dataSource}
                recordCreatorProps={{
                  newRecordType: "dataSource",
                  position: "top",
                  record: () => ({
                    id: Date.now().toString(),
                    question: "",
                    answer: "",
                    type: "add",
                    checked: false,
                  }),
                }}
                onChange={setDataSource}
                editable={{
                  type: "multiple",
                  editableKeys,
                  actionRender: (row, config, defaultDoms) => {
                    return [defaultDoms.delete];
                  },
                  onDelete: (_, record) => {
                    let curList = [...uploadDataSource];
                    if (record?.saved) {
                      const hasAdd = curList.some(
                        (item) => item.id === record.id
                      );
                      if (hasAdd) {
                        curList = curList.map((item) => {
                          if (item.id === record.id) {
                            item.type = "delete";
                          }
                          return item;
                        });
                      } else {
                        curList = [...curList, { ...record, type: "delete" }];
                      }
                    } else {
                      curList = curList.filter((item) => item.id !== record.id);
                    }
                    setUploadDataSource(curList);
                    return Promise.resolve(true);
                  },
                  onValuesChange: (record, recordList) => {
                    let curList = [...uploadDataSource];
                    if (record) {
                      let hasAdd = curList.some(
                        (item) => item.id === record.id
                      );
                      if (record?.saved) {
                        if (!hasAdd) {
                          curList = [...curList, { ...record, type: "update" }];
                        } else {
                          curList = curList.map((item) => {
                            if (item.id === record.id) {
                              item = record;
                              item.type = "update";
                            }
                            return item;
                          });
                        }
                      } else {
                        if (!hasAdd) {
                          curList = [{ ...record }, ...curList];
                        } else {
                          curList = curList.map((item) => {
                            if (item.id === record.id) {
                              item = record;
                            }
                            return item;
                          });
                        }
                      }
                    }
                    recordList = recordList.map((item) => {
                      item.checked = false;
                      return item;
                    });
                    setDataSource(recordList);
                    setUploadDataSource(curList);
                  },
                  onChange: setEditableRowKeys,
                }}
                pagination={{
                  current,
                  total,
                  pageSize: 200,
                  onChange: (page) => {
                    queryPQList(page);
                    setCurrent(page);
                  },
                }}
              />
              <br />
              <p>所有操作（包括删除）都需要点击“确认上传”才会生效</p>
              <div>
                <Button
                  onClick={postExpTask}
                  style={{ margin: "10px" }}
                  type="primary"
                >
                  确认上传
                </Button>
                <Button
                  onClick={() => {
                    location.href = `/meetingtask?career=${career}&usePQ=${
                      uploadDataSource.length > 0 || dataSource.length > 0
                    }&region=${region}&careerList=${JSON.stringify(
                      careerList
                    )}`;
                    // toUrl(
                    //   "/meetingtask",
                    //   `career=${career}&usePQ=${
                    //     uploadDataSource.length > 0
                    //   }&region=${region}&careerList=${JSON.stringify(
                    //     careerList
                    //   )}`
                    // );
                  }}
                >
                  去面试
                </Button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.qaBox}>
      <Tabs defaultActiveKey={defaultTab} items={items} />
    </div>
  );
}

export default QALibrary;
