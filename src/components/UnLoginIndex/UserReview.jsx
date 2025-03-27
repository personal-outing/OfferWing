import { Button, Rate, Collapse } from "antd";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";
import { sendLog } from "../../services/meeting";
import LoginModal from "../LoginModal";
import { useState } from "react";
import { getUserComments } from "../../services/indexPage";
import { useEffect } from "react";
import { isPC } from "@/utils";
import store from "@/store";
import { useCallback } from "react";
import { toUrl } from "../../utils";

export default function UserReview() {
  const [comments, setComments] = useState([]);
  const [show, setShow] = useState(false);
  const [userState] = store.useModel("user");
  const isLogin = userState.currentUser.username;

  const openUserCenter = () => {
    toUrl("/dashboard");
  };

  useEffect(() => {
    getUserComments({}).then((res) => {
      setComments(res.data);
    });
  }, []);

  const faqItems = [
    {
      key: "1",
      label: "OfferWing支持哪些设备使用?",
      children:
        "答：OfferWing支持所有主流设备，PC、Mac、iPad、iPhone、Android等设备使用。",
    },
    {
      key: "2",
      label: "OfferWing适用哪些具体职位和行业?",
      children:
        "答：OfferWing适用于所有求职者，包括但不限于计算机、电子、通信、金融、管理、法律、教育、艺术等专业。",
    },
    {
      key: "3",
      label: "OfferWing如何影响求职者在实际面试中的表现?",
      children:
        "答：OfferWing在面试过程中实时识别面试对话中涵盖的问题，快速给出答案，并且答案可以根据求职者的个人信息进行个性化定制。OfferWing还支持笔试功能，只需轻轻一点，即可远程截图，快速给出笔试题答案",
    },
    {
      key: "4",
      label: "OfferWing适用于哪些场景?现在很多面试都是线下进行，还能用吗?",
      children:
        "答：OfferWing用于多种场景，包括线上面试、答辩、线下模拟面试，并且支持主流的远程视频、面试平台。即使是线下面试，使用OfferWing的AI模拟面试功能，帮助您在线下面试前做好充足的准备。",
    },
    {
      key: "6",
      label: "OfferWing支持解决行为测评、北森题库、笔试题库吗?",
      children:
        "答：OfferWing支持行为测评、北森题库、笔试题库，依靠专业的AI能力解决常见题库问题。我们也支持用户主动上传题库给我们，帮助我们更好的优化AI，给您更准确的回答！",
    },
    {
      key: "7",
      label: "OfferWing可以免费使用吗?",
      children:
        "答：OfferWing新用户提供免费使用余额，您可以免费体验。同时，我们也提供超优惠付费包，一道题仅需几毛钱！",
    },
  ];

  return (
    <div className="userReview" id="userReview">
      <h1>用OfferWing AI，他们去了哪里？</h1>

      <div className="offerShow">
        {comments.map((item, idx) => {
          return (
            <div key={idx} className="userReview-item">
              <div className="userReview-company">
                <img src={item.logoUrl} alt="" />
                <span>{item.companyName}</span>
              </div>
              <div className="userReview-user">
                <div>
                  <span className="userReview-user-label">用户名：</span>
                  <span className="userReview-user-value">{item.userName}</span>
                </div>
                <div>
                  <span className="userReview-user-label">学校：</span>
                  <span className="userReview-user-value">{item.school}</span>
                </div>
                <div>
                  <span className="userReview-user-label">岗位：</span>
                  <span className="userReview-user-value">{item.position}</span>
                </div>
                <div>
                  <span className="userReview-user-label">岗位类型：</span>
                  <span className="userReview-user-value">
                    {item.positionType}
                  </span>
                </div>
                <div>
                  <span className="userReview-user-label">使用时长：</span>
                  <span className="userReview-user-value">
                    {item.usage}分钟
                  </span>
                </div>
              </div>
              <p className="userReview-text">"{item.comment}"</p>
              <div className="userReview-offer">
                <p className="userReview-offer-title">Offer Show</p>
                <img src={item.offerUrl} alt="" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="userReview-h1Box">
        <h1>用户好评，拦都拦不住</h1>
      </div>
      <div className="userReview-imgBox">
        {[
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/20240906-113246.jpeg",
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/20240906-113234.jpeg",
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/20240906-113229.jpeg",
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/924-1.png",
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/9-24-2.jpg",
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/666.png",
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/1214-2.jpg",
          "https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/1214.jpg",
        ].map((item, idx) => {
          return <img key={idx} src={item} alt="" srcset="" />;
        })}
      </div>
      <div className="faq-section">
        <div className="userReview-h1Box">
          <h1>常见问题</h1>
        </div>
        <Collapse
          items={faqItems}
          className="faq-collapse"
          expandIconPosition="end"
        />
      </div>
      <div className="userReview-use-box">
        {!isLogin ? (
          <Button
            type="text"
            className="userReview-use-now-btn bannerBox-startBtn bannerBox-startBtn-tryBottom"
            onClick={() => {
              sendLog({
                type: "clk",
                uid: "",
                spm: `login.userReview.bottom.0`,
                extInfo: JSON.stringify({}),
              });
              setShow(true);
            }}
          >
            即刻体验
          </Button>
        ) : (
          <Button
            type="text"
            className="userReview-use-now-btn bannerBox-startBtn bannerBox-startBtn-tryBottom"
            onClick={openUserCenter}
          >
            个人中心
          </Button>
        )}
      </div>
      <LoginModal
        key="loginModal"
        show={show}
        onCancel={() => setShow(false)}
      />
    </div>
  );
}
