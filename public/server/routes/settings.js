const express = require("express");
const axios = require("axios");
const router = express.Router();
const { AppDataSource } = require("../ormconfig");
const { Settings } = require("../entities/Settings");

const api = axios.create({
  baseURL: "http://localhost:4003",
});

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Settings");
    const settings = await repo.find();

    return res.status(200).json(settings?.[0]);
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

router.post("/", async (req, res) => {
  const {
    ip,
    port,
    username,
    password,
    customAuthMessage,
    customDenyMessage,
    customNotIdentifiedMessage,
    customMaskMessage,
    enableCustomAuthMessage,
    enableCustomDenyMessage,
    enableCustomNotIdentifiedMessage,
    enableCustomMaskMessage,
  } = req.body || {};

  const payload = {
    ip,
    port,
    username,
    password,
    customAuthMessage,
    customDenyMessage,
    customNotIdentifiedMessage,
    customMaskMessage,
    enableCustomAuthMessage,
    enableCustomDenyMessage,
    enableCustomNotIdentifiedMessage,
    enableCustomMaskMessage,
  };

  try {
    const repo = AppDataSource.getRepository("Settings");
    const allSettings = await repo.find();
    let settings = allSettings?.[0];

    if (!settings) {
      settings = repo.create(payload);
      await repo.save(settings);
    } else {
      await repo.save({ ...settings, ...payload });
    }

    return res.status(201).json(settings);
  } catch (err) {
    console.log("error", err);
    return res.status(400).json({ message: err?.response?.data?.message });
  }
});

module.exports = router;
