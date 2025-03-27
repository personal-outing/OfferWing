import { useState } from "react";
import LoginModal from "../LoginModal";
import { sendLog } from "../../services/meeting";
import "./index.css";

export default function Banner() {
  const [show, setShow] = useState(false);
  const handleOpen = () => {
    sendLog({
      type: "clk",
      uid: "",
      spm: `login.img.0.0`,
      extInfo: JSON.stringify({}),
    });
    setShow(true);
  };

  return (
    <div className="introBox">
      <div className="introBox-main">
        <div className="introBox-text">
          <h1>多种设备全部支持：Mobile/PC/平板</h1>
          <h2>无需下载，打开网站，随开随用</h2>
        </div>
        <img
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/pcindex.jpg"
          alt="interview dog's step2"
          onClick={handleOpen}
          className="cursor-pointer"
        />
      </div>
      <div className="introBox-main">
        <div className="introBox-text">
          <h1>海量岗位供您选择：技术、金融、商务、法律...</h1>
        </div>
        <img
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/position.png"
          alt="interview dog's step1"
          onClick={handleOpen}
          className="cursor-pointer"
        />
      </div>
      <div className="introBox-main">
        <div className="introBox-text">
          <h1>多种语言强力支持</h1>
          <h2>日语、韩语、泰语陆续上线</h2>
        </div>
        <img
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/career.png"
          alt="interview dog's step2"
          onClick={handleOpen}
          className="cursor-pointer"
        />
      </div>
      <div className="introBox-main">
        <div className="introBox-text">
          <h1>为所有问题类型提供准确答案，包括最复杂的数据结构和算法</h1>
          <h2>
            解决的问题包括：项目管理、基础知识、系统设计、场景问题、算法、智力问题...
          </h2>
        </div>
        <img
          src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/suanfa.png"
          alt="interview dog's step3"
          onClick={handleOpen}
          className="cursor-pointer"
        />
      </div>
      <LoginModal
        key="loginModal"
        show={show}
        onCancel={() => setShow(false)}
      />
    </div>
  );
}
