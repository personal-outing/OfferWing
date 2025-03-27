import {
  getBatchHotWordRecords,
  updateBatchHotWordRecords,
} from "@/services/voice";
import {
  EditableProTable,
} from "@ant-design/pro-components";
import { Button, message, Pagination } from "antd";
import React, { useEffect, useState } from "react";

export default () => {
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);

  const queryData = (cur) => {
    setDataSource([]);
    getBatchHotWordRecords({
      start: 100 * (cur - 1),
      count: 100,
    }).then((res) => {
      setDataSource(res.data.data);
      setEditableRowKeys(res.data.data.map((item) => item.id));
      setTotal(res.data.totalCount || 0);
    });
  };

  const updatRecords = (data, status = "fail") => {
    updateBatchHotWordRecords({
      records: [
        {
          id: data.id,
          gmtCreate: data.gmtCreate,
          positionId: data.positionId,
          position: data.position,
          hotWord: data.hotWord,
          corrResult: data.corrResult,
          status,
        },
      ],
    }).then((res) => {
      if (res.status) {
        message.success("修改成功");
        setDataSource(dataSource.filter((item) => item.id !== data.id));
      } else {
        message.error(res.message);
      }
    });
  };

  useEffect(() => {
    queryData(1);
  }, []);

  const columns = [
    {
      title: "id",
      dataIndex: "id",
    },
    {
      title: "position",
      dataIndex: "position",
    },
    {
      title: "positionId",
      dataIndex: "positionId",
    },
    {
      title: "hotWord",
      dataIndex: "hotWord",
    },
    {
      title: "corrResult",
      dataIndex: "corrResult",
    },
    {
      title: "操作",
      valueType: "option",
      render: () => {
        return null;
      },
    },
  ];

  return (
    <>
      <EditableProTable
        headerTitle="可编辑表格"
        columns={columns}
        rowKey="id"
        scroll={{
          x: 960,
        }}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: "multiple",
          editableKeys,
          actionRender: (row, config, defaultDoms) => {
            return [
              defaultDoms.save,
              <a
                style={{ color: "red" }}
                onClick={() => {
                  updatRecords(row, "fail");
                }}
              >
                删除
              </a>,
            ];
          },
          saveText: "采纳",
          onSave: (key, row) => {
            updatRecords(row, "success");
          },
          onValuesChange: (record, recordList) => {
            setDataSource(recordList);
          },
          onChange: setEditableRowKeys,
        }}
      />
      <Pagination
        pageSize={100}
        current={current}
        onChange={(page) => {
          queryData(page);
          setCurrent(page);
        }}
        total={total}
      />
    </>
  );
};
