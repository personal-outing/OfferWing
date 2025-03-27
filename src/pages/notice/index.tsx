import "./index.css";

export default function Notice() {
  return (
    <div>
      <div className="notfound">
        <h1>抱歉，服务器正在维护中，开放时间待定</h1>
      </div>
      <div className="group">
        <div>加入交流群，关注最新消息</div>
        <div>
          <img src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/msg.jpg" />
        </div>
      </div>
    </div>
  );
}
