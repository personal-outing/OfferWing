import React, { useState, useEffect } from "react";
import { Collapse } from "antd";
import { definePageConfig } from "ice";
import { getNews } from "../../services/indexPage";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { useSearchParams } from "@ice/runtime";
import "./index.css";

const News = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [newsList, setNewsList] = useState([]);

  const queryNews = () => {
    getNews({ start: 0, count: 50 }).then((res) => {
      if (res.status) {
        const newList = res.data?.data?.map((item, idx) => {
          return {
            key: String(idx),
            open: idx == id,
            label: item.title,
            children: <p>{item.content}</p>,
            style: {
              marginBottom: 24,
              border: "none",
            },
          };
        });
        setNewsList(newList || []);
      }
    });
  };

  useEffect(() => {
    queryNews();
  }, []);
  return (
    <div>
      <Collapse
        style={{ background: "#fff" }}
        bordered={false}
        defaultActiveKey={[id]}
        items={newsList}
      />
    </div>
  );
};

export const pageConfig = definePageConfig(() => {
  return {
    title: "OfferWing AI-公告日志",
  };
});

export default News;
