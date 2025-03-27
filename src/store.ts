import { createStore } from "ice";
import user from "@/models/user";
import pay from "@/models/pay";

export default createStore({
  user,
  pay,
});
