import React, { useState } from "react";
import { Input, AutoComplete } from "antd";
import Geocode from "react-geocode";
import { SET_SOURCE_LOCATION, SET_DES_LOCATION } from "../../utils/actions";
import { dispatch, useGlobalState } from "../../Store";
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/BarLoader";
import Axios from "axios";

Geocode.setApiKey("AIzaSyCKOI-xG8LmUxZVZEAIO-n42_qCQ312cyQ");

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  width: 100%;
  height: 5px;
`;

const LocationInput = props => {
  const [location] = useGlobalState(
    props.destination ? "desLocation" : "sourceLocation"
  );
  const [state, setState] = useState({
    places: [],
    query: null
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const getLocationFromAddress = address => {
    setLoading(true);
    Geocode.fromAddress(address)
      .then(response => {
        const { lat, lng } = response.results[0].geometry.location;
        dispatch({
          type: props.destination ? SET_DES_LOCATION : SET_SOURCE_LOCATION,
          location: {
            lat,
            lng,
            place: response.results[0].formatted_address
          }
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const changeInput = e => {
    setOpen(false);
    dispatch({
      type: props.destination ? SET_DES_LOCATION : SET_SOURCE_LOCATION,
      location: {
        place: e
      }
    });
  };

  const getSuggestions = () => {
    if (location.place) {
      getLocationFromAddress(location.place);
      Axios.get(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyCKOI-xG8LmUxZVZEAIO-n42_qCQ312cyQ&input=" +
          location.place
      )
        .then(res => {
          const places =
            res.data && res.data.predictions.map(i => i.description);
          setState({
            ...state,
            places: places
          });
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <>
      <ClipLoader
        css={override}
        sizeUnit={"px"}
        size={150}
        color={"red"}
        loading={loading}
      />
      {!loading && (
        <>
          <AutoComplete
            allowClear
            open={open}
            dataSource={state.places}
            style={{ width: "100%" }}
            onSelect={getLocationFromAddress}
            onChange={changeInput}
            value={location.place}
            placeholder={
              props.destination ? "nhập điểm trả hàng" : "nhập điểm nhận hàng"
            }
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
          >
            <Input onPressEnter={getSuggestions} />
          </AutoComplete>
        </>
      )}
    </>
  );
};

export default LocationInput;
