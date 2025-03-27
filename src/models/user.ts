import { createModel } from "ice";

export default createModel({
  state: {
    currentUser: {
      remain: 0,
      username: "",
      role: "user",
      src: "default",
      abConfig: {
        mjExp: 1,
      },
    },
  },
  reducers: {
    updateCurrentUser(prevState, payload) {
      prevState.currentUser = payload;
    },
  },
});
