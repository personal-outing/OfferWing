import React from "react";

function CardTitle(props) {
  const { text = "" } = props;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        style={{
          width: "22px",
          marginRight: "4px",
        }}
        src="https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/public/newVersion/%E7%BB%84%2036%402x.png?"
        alt=""
      />
      {text}
    </div>
  );
}

export default CardTitle;
