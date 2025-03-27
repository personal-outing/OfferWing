import BannerNew from "./BannerNew";
import Banner from "./Banner";
import Introduction from "./Introduction";
import UserReview from "./UserReview";
import Contract from "./Contract";
import Nav from "./Nav";
import Help from "../Help";
import "./index.css";
import { isMobile } from "../../utils";

export default function UnLoginIndex() {
  return (
    <div className="indexBox">
      <Nav />
      {isMobile() ? <Banner /> : <BannerNew />}
      <Introduction />
      <UserReview />
      <Contract />
      <Help />
    </div>
  );
}
