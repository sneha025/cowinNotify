const express = require("express");
const router = express.Router();
const User = require("../Model/user");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const state_api = "https://cdn-api.co-vin.in/api/v2/admin/location/states";
const district_api =
  "https://cdn-api.co-vin.in/api/v2/admin/location/districts/";
const session_api =
  "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?";

const db = "mongodb://localhost/CowinUser";
// const reqestType = {meathod:"GET"}
const apiStateData = async () => {
  const states_ = await fetch(state_api, {
    method: "GET",
    headers: {
      // update with your user-agent
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
      Accept: "application/json; charset=UTF-8",
    },
  });
  let response = await states_.json();
  //   console.log(response);
  return response;
};

mongoose.connect(
  db,
  { userNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log("error while connecting to the database ");
    } else {
      console.log("successful connection!");
    }
  }
);

router.post("/register", async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  const { stateName, districtName } = await req.body;

  const StateResp = await apiStateData();

  const statesList = await StateResp.states;

  var stateId = "";
  for (const item of statesList) {
    if (item.state_name == stateName) {
      stateId = item.state_id;
    }
  }
  console.log("sateId:", stateId);
  const districtsResponse = await fetch(
    encodeURI(
      "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + stateId
    ),
    {
      method: "GET",
      headers: {
        // update with your user-agent
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
        Accept: "application/json; charset=UTF-8",
      },
    }
  );
  const districtData = await districtsResponse.json();
  console.log("districtData:", districtData);
  const districtList = await districtData.districts;

  var districtID = "";
  for (const item of districtList) {
    if (item.district_name == districtName) {
      districtID = item.district_id;
    }
  }
  console.log("districtID:", districtID);
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();

  today = dd + "-" + mm + "-" + yyyy;
  const query = "district_id=" + districtID + "&date=" + today;
  var path = session_api + encodeURI(query);

  console.log(path);
  const sessionData = await fetch(path, {
    method: "GET",
    headers: {
      // update with your user-agent
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
      Accept: "application/json; charset=UTF-8",
    },
  });

  if (user) {
    const oldDist_id = user.district_id;
    console.log(oldDist_id);
    const filter = { district_id: oldDist_id };
    const newDistr_id = {
      $set: {
        district_id: districtID,
      },
    };
    const result = await User.updateOne(filter, newDistr_id);
    console.log("user is already there so updated the district only:", result);
  } else {
    let userData = req.body;
    let new_user = new User(userData);
    new_user.district_id = districtID;
    new_user._id = new mongoose.Types.ObjectId();

    new_user.save();
    console.log(new_user);
  }
});

module.exports = router;
