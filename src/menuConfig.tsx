import type { MenuDataItem } from "@ant-design/pro-layout";
import { sendLog } from "./services/meeting";
import { getToken } from "./utils";

const unloginMenu = [
  {
    name: "帮助",
    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/helpicon.png",
    children: [
      {
        name: "使用指南",
        path: "https://doc.offerwing.cn/docs/intro",
        onclick: () => {
          const t_data = getToken();
          sendLog({
            type: "clk",
            uid: t_data["username"] || "",
            spm: "nav.learn.0.0",
            extInfo: JSON.stringify({ type: "guide" }),
          });
        },
      },
      {
        name: "《用户服务协议》",
        path: "https://doc.offerwing.cn/docs/agreement1",
        onclick: () => {
          const t_data = getToken();
          sendLog({
            type: "clk",
            uid: t_data["username"] || "",
            spm: "nav.learn.0.0",
            extInfo: JSON.stringify({ type: "service" }),
          });
        },
      },
      {
        name: "《OfferWing AI用户付费协议》",
        path: "https://doc.offerwing.cn/docs/agreement2",
        onclick: () => {
          const t_data = getToken();
          sendLog({
            type: "clk",
            uid: t_data["username"] || "",
            spm: "nav.learn.0.0",
            extInfo: JSON.stringify({ type: "pay" }),
          });
        },
      },
    ],
  },
];

const indexMenuConig = [
  {
    name: "面试助手",
    path: "meeting",
  },
  {
    name: "笔试助手",
    path: "writing",
  },
  // {
  //   name: "用户评价",
  //   path: "userReview",
  //   key: "userReview",
  // },
  {
    name: "💰 定价",
    path: "price",
  },
  {
    name: "📖 使用教程",
    path: "https://doc.offerwing.cn/docs/intro",
  },
  // {
  //   name: "📮 联系我们",
  //   path: "contact",
  //   key: "contact",
  // },
];

const asideMenuConfig: MenuDataItem[] = [
  {
    name: "用户中心",
    path: "/",
    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E5%AE%B9%E5%99%A8%402x.png",
    children: [
      {
        name: "工作台",
        path: "/dashboard",
      },
      {
        name: "邀请有礼",
        path: "/share",
      },
      {
        name: "充值中心",
        path: "/pay",
      },
    ],
  },
  {
    name: "面试管理",
    path: "/meetingManage",
    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E5%AE%B9%E5%99%A8%402x%20%281%29.png",
    children: [
      {
        name: "面试助力",
        path: "/meetingtask",
      },
      {
        name: "助力记录",
        path: "/history",
      },
      // {
      //   name: "模拟面试",
      //   path: "/mocktask",
      // },
      {
        name: "面经广场",
        path: "/experience",
      },
    ],
  },
  {
    name: "笔试管理",
    path: "/writingManage",
    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E5%AE%B9%E5%99%A8%402x%20%282%29.png",
    children: [
      {
        name: "笔试助力",
        path: "/writingtask",
      },
      {
        name: "笔试记录",
        path: "/writinghistory",
      },
    ],
  },
  {
    name: "技术定制",
    path: "/tech",
    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E5%AE%B9%E5%99%A8%402x%20%283%29.png",
  },
  {
    name: "博客",
    path: "https://doc.offerwing.cn/blog",
    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E5%AE%B9%E5%99%A8%402x%20%284%29.png",
  },
  {
    name: "公告日志",
    path: "/news",
    icon: "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E5%AE%B9%E5%99%A8%402x%20%284%29.png",
  },
  ...unloginMenu,
];

const adminMenu: MenuDataItem[] = [
  {
    name: "用户管理",
    children: [
      {
        name: "音频片段",
        path: "/dogbrain/voiceSlice",
      },
      {
        name: "音频列表",
        path: "/dogbrain/voiceList",
      },
      {
        hideInMenu: true,
        name: "详细音频",
        path: "/dogbrain/voice",
      },
      {
        name: "问题修改",
        path: "/dogbrain/questionList",
      },
      {
        name: "语音反馈审核",
        path: "/dogbrain/feedbackList",
      },
      {
        name: "错句反馈审核",
        path: "/dogbrain/senfeedback",
      },
    ],
  },
  {
    name: "前往产品页",
    path: "/",
  },
];

export { asideMenuConfig, unloginMenu, adminMenu, indexMenuConig };
