import { createModel } from "ice";

export default createModel({
  state: {
    price: 1.5,
    boostPrice: 2,
    writePrice: 1
  },
  reducers: {
    updatePrice(prevState, payload) {
      prevState.price = payload.UnitPrice / 100;
      prevState.boostPrice = payload.BoostUnitPrice / 100;
      prevState.writePrice = payload.WrittenUnitPrice / 100;
    },
  },
});
