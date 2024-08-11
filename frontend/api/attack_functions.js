import axios from "axios";

import config from "./config";

const serverIP = config.serverIP + "/attacks";

export const attack_check = async (zone_1, team_1, zone_2, team_2) => {
  try {
    const response = await axios.post(`${serverIP}/check`, {
      zone_1,
      team_1,
      zone_2,
      team_2,
    });

    return response.data;
  } catch (error) {
    return {
      errorMsg: error.response?.data || "API: Error checking attack",
    };
  }
};

export const attack = async (zone_1, team_1, zone_2, team_2, war) => {
  try {
    const response = await axios.post(`${serverIP}/attack`, {
      zone_1,
      team_1,
      zone_2,
      team_2,
      war,
    });

    return response.data;
  } catch (error) {
    return {
      errorMsg: error.response?.data || "API: Error making attack request",
    };
  }
};

export const get_all_attacks = async () => {
  try {
    const response = await axios.get(`${serverIP}`);
    return response.data;
  } catch (error) {
    return {
      errorMsg: error.response?.data || "API: Error fetching all attacks",
    };
  }
};

export const get_attacks_on_zone = async (zone) => {
  try {
    const response = await axios.get(`${serverIP}/zones/${zone}`);

    return response.data;
  } catch (error) {
    return {
      errorMsg: error.response?.data || "API: Error getting attacks on zone",
    };
  }
};

export const get_attacks_by_war = async (war) => {
  try {
    const response = await axios.get(`${config.serverIP}/wars/${war}`);

    return response.data;
  } catch (error) {
    return {
      errorMsg: error.response?.data || "API: Error getting attacks by war",
    };
  }
};