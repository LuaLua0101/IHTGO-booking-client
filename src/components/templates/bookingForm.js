import React, { useState } from "react";
import {
  Input,
  Divider,
  Checkbox,
  Row,
  Button,
  Alert,
  Icon,
  Statistic,
  Switch
} from "antd";
import { PriceListCarousel } from "../atoms";
import DynamicImport from "../../utils/lazyImport";
import { useGlobalState, dispatch } from "../../Store";
import { SET_ORDER_INFO } from "../../utils/actions";

const LocationInput = DynamicImport(() => import("../organisms/locationInput"));

const BD = "bình dương";
const _BD = "binh duong";
const HCM = "hồ chí minh";
const _HCM = "ho chi minh";
const _50K = 50000;
const _100K = 100000;
const _7K = 7000;
const _3K5 = 3500;
const _70K = 70000;
const _140K = 140000;
const _1K = 1000;
const _10K = 10000;
const _250K = 250000;

const formatMoney = money => {
  return parseInt(money / 1000) * 1000;
};

const BookingForm = props => {
  const [state, setState] = useState({
    address: "",
    isDocument: false,
    sourceInvalid: false,
    desInvalid: false,
    sizeInvalid: false,
    weightInvalid: false
  });

  const [orderInfo] = useGlobalState("orderInfo");
  const [sourceLocation] = useGlobalState("sourceLocation");
  const [desLocation] = useGlobalState("desLocation");

  const changeOrderType = () => {
    setState({
      ...state,
      isDocument: !state.isDocument
    });
  };

  const isValid = () => {
    let isValid = true;
    let validate = {
      sourceInvalid: false,
      desInvalid: false,
      sizeInvalid: false,
      weightInvalid: false
    };

    if (!sourceLocation.lat || !sourceLocation.lng || !sourceLocation.place) {
      validate.sourceInvalid = true;
      isValid = false;
    }
    if (!desLocation.lat || !desLocation.lng || !desLocation.place) {
      validate.desInvalid = true;
      isValid = false;
    }

    if (!state.isDocument) {
      if (!orderInfo.weight) {
        validate.weightInvalid = true;
        isValid = false;
      }
    }

    setState({
      ...state,
      ...validate
    });
    return isValid;
  };

  const setOrder = data => {
    dispatch({
      type: SET_ORDER_INFO,
      order: {
        ...data
      }
    });
  };

  const priceCalc = () => {
    if (isValid()) {
      let price = 0;
      let weight = 0;
      if (state.isDocument) {
        const sPlace = sourceLocation.place.toLowerCase();
        const dPlace = desLocation.place.toLowerCase();
        if (
          (sPlace.includes(BD) ||
            sPlace.includes(_BD) ||
            sPlace.includes(HCM) ||
            sPlace.includes(_HCM)) &&
          (dPlace.includes(BD) ||
            dPlace.includes(_BD) ||
            dPlace.includes(HCM) ||
            dPlace.includes(_HCM))
        ) {
          price = _70K;
        } else {
          price = _140K;
        }
      } else {
        if (!orderInfo.height || !orderInfo.len || !orderInfo.width) {
          weight = orderInfo.weight;
        } else {
          const tempW =
            (orderInfo.len * orderInfo.width * orderInfo.height) / 5000.0;
          weight = tempW > orderInfo.weight ? tempW : orderInfo.weight;
        }

        //BIKE
        if (
          weight < 21 &&
          orderInfo.len < 41 &&
          orderInfo.width < 31 &&
          orderInfo.height < 41
        ) {
          if (orderInfo.distance < 26) price = _70K;
          else {
            price = _3K5 * orderInfo.distance;
          }
          console.log("xe may");
        }
        //TRUCK
        else {
          let extDistances = (orderInfo.distance - 35) * _7K;
          let extWeights = weight - 30;

          extDistances = extDistances < 0 ? 0 : extDistances;

          if (extWeights < 0) extWeights = 0;
          else if (extWeights < 50) extWeights = extWeights * 3000;
          else if (extWeights >= 50 && extWeights < 101)
            extWeights = extWeights * 2000;
          else if (extWeights) extWeights = extWeights * _1K;

          price = _250K + extDistances + extWeights;
          console.log("xe tai");
        }
      }

      //check options
      if (orderInfo.isSpeed) price *= 2;
      if (orderInfo.isHandOn) price += _10K;
      if (parseInt(orderInfo.cod) > 1000) price += _10K;
      if (!state.isDocument) {
        if (orderInfo.isDischarge) {
          if (weight > 50 && weight < 151) price += _50K;
          else if (weight > 150 && weight < 301) price += _100K;
          else if (weight > 300) price = price + _100K + weight * _1K;
        }
      }

      dispatch({
        type: SET_ORDER_INFO,
        order: {
          totalPrice: price
        }
      });
    } else {
      dispatch({
        type: SET_ORDER_INFO,
        order: {
          totalPrice: null
        }
      });
    }
  };

  const inputChange = (name, value) => {
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === "" || value === "-") {
      if (name === "len") setOrder({ len: value });
      else if (name === "width") setOrder({ width: value });
      else if (name === "height") setOrder({ height: value });
      else if (name === "weight") setOrder({ weight: value });
      else if (name === "cod") setOrder({ cod: value });
    }
  };

  const toNextPage = () => {
    if (isValid()) props.next();
  };

  return (
    <div
      style={{
        backgroundColor: "#f6f6f6",
        height: window.innerHeight
      }}
    >
      <PriceListCarousel />
      <div
        style={{
          width: "90%",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        <Divider orientation="left">Chọn lộ trình</Divider>
        {state.sourceInvalid && (
          <Alert
            message="Vui lòng nhập điểm nhận hàng"
            type="error"
            showIcon
            banner
          />
        )}
        <LocationInput calc={priceCalc} />
        <Icon
          type="arrow-down"
          style={{
            color: "red",
            fontSize: 32,
            margin: "5px auto",
            width: "100%"
          }}
        />
        {state.desInvalid && (
          <Alert
            message="Vui lòng nhập điểm giao hàng"
            type="error"
            showIcon
            banner
          />
        )}
        <LocationInput destination calc={priceCalc} />
        <Divider orientation="left">Thông số đơn hàng</Divider>
        <Switch
          checkedChildren="Giao chứng từ"
          unCheckedChildren="Giao hàng hóa"
          checked={state.isDocument}
          onClick={changeOrderType}
        />
        {!state.isDocument && (
          <Input
            addonBefore="Quãng đường"
            style={{ width: "100%", marginBottom: 10, marginTop: 10 }}
            value={orderInfo.distance}
            addonAfter="km"
            disabled
          />
        )}

        {!state.isDocument && (
          <>
            {state.sizeInvalid && (
              <Alert
                message="vui lòng nhập kích thước hợp lệ"
                type="error"
                showIcon
                banner
              />
            )}
            <Input.Group compact style={{ marginBottom: 10 }}>
              <Input
                allowClear
                style={{ width: "30%" }}
                placeholder="Dài"
                value={orderInfo.len}
                onChange={e => inputChange("len", e.target.value)}
              />
              <Input
                allowClear
                style={{ width: "30%" }}
                placeholder="Rộng"
                value={orderInfo.width}
                onChange={e => inputChange("width", e.target.value)}
              />
              <Input
                allowClear
                style={{ width: "40%" }}
                placeholder="Cao"
                addonAfter="cm"
                value={orderInfo.height}
                onChange={e => inputChange("height", e.target.value)}
              />
            </Input.Group>
          </>
        )}

        {!state.isDocument && (
          <>
            {state.weightInvalid && (
              <Alert
                message="Vui lòng nhập cân nặng hợp lệ"
                type="error"
                showIcon
                banner
              />
            )}
            <Input
              allowClear
              style={{ width: "100%" }}
              placeholder="Cân nặng"
              addonAfter="kg"
              value={orderInfo.weight}
              onChange={e => inputChange("weight", e.target.value)}
            />
          </>
        )}
        <Divider orientation="left">Tùy chọn thêm</Divider>
        {!orderInfo.isInventory && (
          <Row>
            <Checkbox
              checked={orderInfo.isHandOn ? true : false}
              onChange={e => setOrder({ isHandOn: e.target.checked })}
            >
              Giao tận tay
            </Checkbox>
            <Checkbox
              checked={orderInfo.isSpeed ? true : false}
              onChange={e => setOrder({ isSpeed: e.target.checked })}
            >
              Giao hỏa tốc
            </Checkbox>
            {!state.isDocument && (
              <Checkbox
                checked={orderInfo.isDischarge ? true : false}
                onChange={e => setOrder({ isDischarge: e.target.checked })}
              >
                Bốc xếp hộ
              </Checkbox>
            )}
          </Row>
        )}
        <Row style={{ marginTop: 10 }}>
          {!state.isDocument && (
            <Checkbox
              checked={orderInfo.isInventory ? true : false}
              onChange={e => setOrder({ isInventory: e.target.checked })}
            >
              Giao hàng vào kho
            </Checkbox>
          )}
        </Row>
        {!orderInfo.isInventory && (
          <Input
            allowClear
            style={{ marginTop: 10 }}
            placeholder="Thu hộ"
            addonBefore="Thu hộ"
            addonAfter="VNĐ"
            value={orderInfo.cod}
            onChange={e => inputChange("cod", e.target.value)}
          />
        )}
        <Statistic
          suffix={
            <div style={{ color: "red", fontSize: 12 }}>(đã cộng 10% VAT)</div>
          }
          title={
            <Row>
              Cước phí tạm tính (VNĐ)
              {"   "}
              <Button size="small" onClick={priceCalc} type="danger">
                Tính tiền cước
              </Button>
            </Row>
          }
          value={formatMoney(
            orderInfo.totalPrice + orderInfo.totalPrice / 10.0
          )}
          style={{ marginTop: 10 }}
          valueStyle={{ color: "#68bd45" }}
        />

        <Button
          style={{ width: "100%", margin: "20px 0" }}
          size="large"
          type="danger"
          onClick={toNextPage}
        >
          <b>
            Tiếp tục đơn hàng <Icon type="right" />
          </b>
        </Button>
      </div>
    </div>
  );
};

export default BookingForm;