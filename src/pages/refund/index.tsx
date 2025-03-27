import styles from "./index.module.css";
import { InboxOutlined } from "@ant-design/icons";
import { Button, Form, Input, Upload, message } from "antd";
import type { GetProp, UploadProps } from "antd";
import { fileToBase64 } from "@/utils";
import { useState } from "react";
import { toRefund } from "@/services/user";
import store from "@/store";
const { Dragger } = Upload;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("你只能上传JPG/PNG图片!");
  }
  const isLt2M = file.size / 1024 / 1024 < 3;
  if (!isLt2M) {
    message.error("图片大小不能超过3MB!");
  }
  return isJpgOrPng && isLt2M;
};

function Refund() {
  const [form] = Form.useForm();
  const [image, setImage] = useState("");
  const [userState] = store.useModel("user");

  const handleRefund = () => {
    const values = form.getFieldsValue(true);
    if (image) {
      toRefund({
        username: userState.currentUser.username,
        userId: userState.currentUser.username,
        ...values,
        image,
      }).then((res) => {
        console.log(99, res);
      });
    } else {
      message.warning("收款二维码必须上传");
    }
  };

  const props: UploadProps = {
    name: "file",
    maxCount: 1,
    customRequest(info) {
      fileToBase64(info.file).then((url) => {
        if (url) {
          setImage(url);
          info.onSuccess();
        } else {
          info.onError();
        }
      });
    },
    beforeUpload,
  };

  return (
    <div className={styles.refundContainer}>
      <Form
        form={form}
        className="main-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item label="退款原因" name="reason" required={true}>
          <Input />
        </Form.Item>
        <Form.Item
          label="OfferWing AI建议"
          name="suggestion"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="image"
          label="收款二维码"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          required={true}
        >
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          </Dragger>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" onClick={handleRefund}>
            发起退款
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

Refund.pageConfig = {
  auth: false,
};

export default Refund;
