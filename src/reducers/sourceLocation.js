import { SET_SOURCE_LOCATION } from "../utils/actions";

export default function companyReducer(state = [], action) {
  switch (action.type) {
    case SET_SOURCE_LOCATION:
      return { ...state, ...action.location };
    default:
      return state;
  }
}