import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { history, request } from "ice";
import { getVoiceList } from "@/services/voice";

const columns = [
  {
    title: "用户名",
    dataIndex: "username",
    copyable: true,
    ellipsis: true,
    render: (text, record, _, action) => {
      return (
        <a
          onClick={() =>
            history?.push(`/dogbrain/voice?username=${record.username}`)
          }
        >
          {text}
        </a>
      );
    },
  },
];

export default () => {
  const actionRef = useRef<ActionType>();

  return (
    <>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          const { current = 0, pageSize = 50, username = "" } = params;
          return getVoiceList({
            path: username,
            page: current - 1,
            pageNumber: pageSize,
          }).then((res) => {
            const data = JSON.parse(res.data) || [];
            const fordeList = data.forderList.map((item) => {
              return {
                username: item.slice(0, -1),
              };
            });
            return {
              data: fordeList,
              success: true,
              total: data.totalNum || fordeList.length,
            };
          });
        }}
        rowKey="username"
        search={{
          labelWidth: "auto",
        }}
        pagination={{
          pageSize: 100,
          onChange: (page) => console.log(page),
        }}
        dateFormatter="string"
        headerTitle="录音列表"
      />
    </>
  );
};
