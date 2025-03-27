import React from "react";
import { Form, Radio, Input, Button, Checkbox } from "antd";
import { getToken, toUrl } from "@/utils";
import { creatNewMockMeeting } from "@/services/mockMeeting";
import store from "@/store";

const { TextArea } = Input;

const MockInterviewForm = (props) => {
  const { onCancel, positionId, positionName } = props;
  const { currentUser } = store.getState().user;
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  const handleCreateNewMock = () => {
    const values = form.getFieldsValue();
    creatNewMockMeeting({
      username: currentUser.username,
      jwtToken: getToken(),
      terminal: "mockInterview",
      positionId,
      model: "gpt-4o",
      usePQ: false,
      useResume: values.useResume,
      sexual: values.sexual,
      character: values.character,
      company_info: values.companyInfo,
      job_desc: values.jobDesc,
      strictness: values.strictness,
    }).then((res) => {
      if (res.status) {
        toUrl(
          "/mock",
          `id=${res.data.interviewID}&career=${encodeURIComponent(
            positionName
          )}`
        );
      }
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 600, margin: "auto" }}
    >
      <h3>面试官设置</h3>
      {/* 性别 */}
      <Form.Item style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 10 }}>性别：</span>
          <Form.Item name="sexual" noStyle>
            <Radio.Group>
              <Radio value="男">男</Radio>
              <Radio value="女">女</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </Form.Item>

      {/* 角色 */}
      <Form.Item style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 10 }}>角色：</span>
          <Form.Item name="character" noStyle>
            <Radio.Group>
              <Radio value="沉稳老练">沉稳老练</Radio>
              <Radio value="中二">中二</Radio>
              <Radio value="冷酷">冷酷</Radio>
              <Radio value="和蔼">和蔼</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </Form.Item>

      {/* 严格程度 */}
      <Form.Item style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 10 }}>严格程度：</span>
          <Form.Item name="strictness" noStyle>
            <Radio.Group>
              <Radio value="放水面">放水面</Radio>
              <Radio value="普通">普通面</Radio>
              <Radio value="压力面">压力面</Radio>
              <Radio value="KPI面">KPI面</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </Form.Item>

      <h3>信息填写</h3>

      <Form.Item name="companyInfo" label="公司信息">
        <TextArea rows={3} placeholder="请输入公司信息" />
      </Form.Item>

      <Form.Item name="jobDesc" label="岗位描述">
        <TextArea rows={3} placeholder="请输入岗位描述" />
      </Form.Item>

      <Form.Item name="useResume" valuePropName="checked">
        <Checkbox>是否使用简历</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          onClick={handleCreateNewMock}
        >
          开始模拟
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MockInterviewForm;
