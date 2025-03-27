import { history } from "@ice/runtime";
import { Button } from "antd";
import React from "react";
import { paramsStr } from "../../utils";

function Price(props) {
  return (
    <div className="price" id="price">
      <h1>Use and pay on-demand, no subscription necessary</h1>
      <h2>1 minute = 0.45 $</h2>
      <div className="priceBox">
        <div className="priceBox-item">
          <h2>Free</h2>
          <p>5 minutes</p>
          <p>Test with a free 5-minute trial for an authentic experience</p>
        </div>
        <div className="priceBox-item">
          <h2>Recommend</h2>
          <p>2 or 4 hours</p>
          <p>Guaranteed support for at least 2 interviews</p>
        </div>
        <div className="priceBox-item">
          <h2>Customize</h2>
          <p>10 minutes or more</p>
          <p>Top up with any duration that suits your needs</p>
        </div>
        <div className="priceBox-item">
          <h2>Annual subscription</h2>
          <p>
            <a href="mailto:interviewdog.ai@gmail.com">Email</a> for details
          </p>
          <p>
            You can use it at any time throughout the year, with support for at
            least 48 interviews
          </p>
        </div>
      </div>
      <Button
        className="priceBox-btn"
        onClick={() => {
          history?.push(`/login?spm=index.0.0.0${paramsStr("&")}`);
        }}
      >
        Start Now
      </Button>
    </div>
  );
}

export default Price;
