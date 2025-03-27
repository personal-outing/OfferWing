import { Input, Modal, Rate, message } from "antd";
import "./index.css";
import { useEffect, useState } from "react";
import { sendFeedBack } from "@/services/meeting";

const FeedbackModal = (props) => {
  const { username = "", show = false, onClose, interviewid = "" } = props;
  const [correctRate, setCorrectRate] = useState(0);
  const [speedRate, setSpeedRate] = useState(0);
  const [easyRate, setEasyRate] = useState(0);
  const [priceRate, setPriceRate] = useState(0);
  const [feedbackContent, setFeedbackContent] = useState("");

  const handleFeedBack = () => {
    // 反馈结果
    sendFeedBack({
      phone: username,
      feedback: JSON.stringify({
        interviewid,
        content: feedbackContent,
        correctRate,
        speedRate,
        easyRate,
        priceRate,
      }),
      score: correctRate + speedRate + easyRate + priceRate,
    }).then((res) => {
      message.success("感谢您的反馈~");
      onClose();
    });
  };

  useEffect(() => {
    return () => {
      setCorrectRate(0);
      setSpeedRate(0);
      setEasyRate(0);
      setFeedbackContent("");
    };
  }, []);

  return (
    <Modal
      styles={{
        body: {
          padding: "10px 30px",
        },
      }}
      style={{ marginTop: -50 }}
      className="feedbackModal"
      okText="提交"
      cancelText="下次再说"
      title={null}
      open={show}
      onOk={handleFeedBack}
      onCancel={onClose}
    >
      <p style={{ marginBottom: 0 }}>
        您的面试已结束，恳请您填写一下真实反馈，您的建议都会是我们迭代产品的动力！
      </p>
      <div className="rateBox" style={{ marginBottom: 10 }}>
        <div>
          准确度：
          <Rate value={correctRate} onChange={(val) => setCorrectRate(val)} />
        </div>
        <div>
          及时性：
          <Rate value={speedRate} onChange={(val) => setSpeedRate(val)} />
        </div>
        <div>
          操作便捷性：
          <Rate value={easyRate} onChange={(val) => setEasyRate(val)} />
        </div>
        <div>
          价格满意度：
          <Rate value={priceRate} onChange={(val) => setPriceRate(val)} />
        </div>
      </div>
      <Input.TextArea
        style={{ height: 90 }}
        maxLength={120}
        showCount={true}
        value={feedbackContent}
        onChange={(e) => setFeedbackContent(e.target.value)}
      />
    </Modal>
  );
};

export default FeedbackModal;
