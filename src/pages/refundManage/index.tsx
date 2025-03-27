/*
退款管理页
需求：新增一个退款管理页，名称叫refundManage
1. 里面有一个列表是获取所有退款信息，退款信息包含：用户名、退款时间、退款状态（已退款和未退款，用颜色区分）和一个操作按钮。
2. 点击按钮后，弹窗展示信息：上半部分用户余额、充值金额、面试花费、笔试花费和可退款金额。下面展示用户的收款码。
3. 弹窗有两个按钮：确定和取消。点击取消关闭弹窗，点击确定进行操作。
*/
import styles from "./index.module.css";
import { Button, Descriptions, Modal, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { useMemo, useState } from "react";

interface DataType {
  key: string;
  username: string;
  time: string;
  status: 0 | 1;
  balance: number;
  rechargeAmount: number;
  interviewCost: number;
  examCost: number;
  refundableAmount: number;
  paymentQrCode: string;
}

const refundStatusMap = new Map([
  // 已退款
  [0, { color: "green", label: "已退款" }],
  // 未退款
  [1, { color: "red", label: "未退款" }],
]);

const qrCodeBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAVtJREFUeF7t2tEKwyAUg2F9/4d2sN2M0dpABXX9dj1kS5Pza2wtpbQSfFqLvlZqrcFqpfzNegQ8ft7xAyYgAd8KxI4ZPWI4kAM5sIft5akuwiIswltHuIX8X34Wjd6ehOtVAh77PzUMAU/mBwFPhAknVlyKcCAHfhRII8eBNx1DQALOjRwHruZAZYIyQZmwdZkgwiIswiL8pcCsI9Xo/V28nhloBpqBW89Alb5KXx/Yi3BMw/AWbfR6Kv2b7Q4BCTi3oOVADuTAHoTnvbobUl2E70ZYmaBMUCZsXSaIsAiLsAi7E+nuZedGJNzQjq6p4vVABETmJsSdiDsRdyLuRL4UiOm1Ol3D36fOultngQiIgAiIgMj1WfhxL06mFHYWdhaeexbmQA7kQJW+Sv96G/O0kiD+vyACIiCyNUTUWeosdZY6S511vQ9UZ53MShABERABERABkV8FUmi+AGaiD8X0No0HAAAAAElFTkSuQmCC";


const data: DataType[] = [
  {
    key: "1",
    username: "张三",
    time: "2024-03-20 14:30:00",
    status: 0,
    balance: 1000,
    rechargeAmount: 2000,
    interviewCost: 500,
    examCost: 300,
    refundableAmount: 1200,
    paymentQrCode: qrCodeBase64,
  },
  {
    key: "2",
    username: "李四",
    time: "2024-03-19 09:15:00",
    status: 0,
    balance: 500,
    rechargeAmount: 1500,
    interviewCost: 300,
    examCost: 200,
    refundableAmount: 1000,
    paymentQrCode: qrCodeBase64,
  },
  {
    key: "3",
    username: "王五",
    time: "2024-03-18 16:45:00",
    status: 1,
    balance: 2000,
    rechargeAmount: 3000,
    interviewCost: 800,
    examCost: 400,
    refundableAmount: 1800,
    paymentQrCode: qrCodeBase64,
  },
];

function RefundManage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<DataType | null>(null);

  const columns: TableProps<DataType>["columns"] = useMemo(() => {
    const handleRefund = (record: DataType) => {
      setCurrentRecord(record);
      setIsModalVisible(true);
    };

    return [
      {
        title: "用户名",
        dataIndex: "username",
        key: "username",
      },
      {
        title: "退款时间",
        dataIndex: "time",
        key: "time",
      },
      {
        title: "退款状态",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const { color, label } = refundStatusMap.get(status) || { color: "yellow", label: "未知" };
          return (
            <Tag color={color}>
              {label}
            </Tag>
          );
        },
      },
      {
        title: "操作",
        key: "action",
        render: (_, record) => (
          <Button type="link" onClick={() => handleRefund(record)}>
            查看详情
          </Button>
        ),
      },
    ];
  }, []);

  const handleOk = () => {
    // 处理确认退款逻辑
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className={styles.refundManageContainer}>
      <Table<DataType> columns={columns} dataSource={data} />

      <Modal
        className={styles.refundManageContainer}
        title="退款详情"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        {currentRecord && (
          <>
            <Descriptions title="用户账户信息" column={2}>
              <Descriptions.Item label="用户余额">
                {currentRecord.balance}
              </Descriptions.Item>
              <Descriptions.Item label="充值金额">
                {currentRecord.rechargeAmount}
              </Descriptions.Item>
              <Descriptions.Item label="面试花费">
                {currentRecord.interviewCost}
              </Descriptions.Item>
              <Descriptions.Item label="笔试花费">
                {currentRecord.examCost}
              </Descriptions.Item>
              <Descriptions.Item label="可退款金额">
                {currentRecord.refundableAmount}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions title="收款二维码" column={1}>
              <Descriptions.Item>
                <img
                  className="qrcode"
                  src={currentRecord.paymentQrCode}
                  alt="收款二维码"
                />
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
}

RefundManage.pageConfig = {
    auth: true,
};

export default RefundManage;
