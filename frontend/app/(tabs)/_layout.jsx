import React, { useContext, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { icons } from "../../constants";
import { router } from "expo-router";
import { GlobalContext } from "../../context/GlobalProvider";
import { useFocusEffect } from "@react-navigation/native";
import { get_all_attacks } from "../../api/attack_functions";
import { deletePushToken } from "../../api/user_functions";
import _ from "lodash";
import StickyPopup from "../../components/StickyPopup";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className={Platform.OS === "ios" ? "w-6 h-6 mt-2" : "w-6 h-6"}
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {

  const { globalState, globalDispatch, Logout } = useContext(GlobalContext);

  const fetchData = async () => {
    try {
      const attacksResult = await get_all_attacks();

      if (!attacksResult || attacksResult.length == 0 || attacksResult == []) return;

      const matchingAttack = attacksResult.find(
        (attack) =>
          attack.attacking_team === globalState.teamNo &&
          attack.attacking_subteam === globalState.subteam
      );

      const matchingDefenses = attacksResult.filter(
        (attack) => attack.defending_team.toString() === globalState.teamNo.toString()
      );

      if (!_.isEqual(matchingAttack, globalState.currentAttack) && globalState.subteam !== "")
        globalDispatch({ type: "SET_CURRENT_ATTACK", payload: matchingAttack });

      if (!_.isEqual(matchingDefenses, globalState.currentDefence))
        globalDispatch({ type: "SET_CURRENT_DEFENCE", payload: matchingDefenses });

    } catch (err) {
      console.error("Failed to fetch attacks:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {

      fetchData();

      globalState.socket.on("new_attack", (newAttack) => {
        if (newAttack.defending_team.toString() === globalState.teamNo.toString())
          globalDispatch({ type: "ADD_CURRENT_DEFENCE", payload: newAttack });

        if (globalState.subteam !== "") {
          if (
            newAttack.attacking_team.toString() === globalState.teamNo.toString() &&
            newAttack.attacking_subteam.toString() === globalState.subteam.toString()
          )
            globalDispatch({ type: "SET_CURRENT_ATTACK", payload: newAttack });
        }
      });

      globalState.socket.on("remove_attack", (attackId) => {
        globalDispatch({
          type: SET_CURRENT_DEFENCE,
          payload: currentDefence.filter((attack) => attack._id !== attackId),
        });

        globalDispatch({
          type: SET_CURRENT_ATTACK,
          payload: currentAttack && currentAttack._id === attackId ? null : currentAttack,
        });
      });

      globalState.socket.on("new_game", () => {
        Alert.alert(
          "New Game",
          "A new game has started. You will be logged out automatically."
        );

        setTimeout(async () => {
          deletePushToken(globalState.expoPushToken, globalState.teamNo);
          Logout();
          router.replace("/");
        }, 3000);
      });

      return () => {
        globalState.socket.off("new_attack");
        globalState.socket.off("remove_attack");
        globalState.socket.off("new_game");
      };
    }, [globalState.teamNo, globalState.subteam])
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#FFF",
          tabBarInactiveTintColor: "#BBB",
          tabBarStyle: {
            backgroundColor: "#201402",
            borderTopWidth: 1,
            borderTopColor: "#000",
            height: Platform.OS === "ios" ? "12%" : "10%",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Map",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.globe}
                color={color}
                name="Map"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="attack"
          options={{
            title: "Attack",
            href: globalState.subteam == "" ? null : "/attack",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.sword}
                color={color}
                name="Attack"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="team_attacks"
          options={{
            title: "Wars",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.swords}
                color={color}
                name="Wars"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="teams_user"
          options={{
            title: "Teams",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.teams}
                color={color}
                name="Teams"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="countries_user"
          options={{
            title: "Countries",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.countries}
                color={color}
                name="Countries"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      {/* {(globalState.currentAttack || globalState.currentDefence.length > 0) && ( */}
      <StickyPopup
        currentAttack={globalState.currentAttack}
        currentDefence={globalState.currentDefence}
        subteam={globalState.subteam}
      />
      {/* )} */}

      <StatusBar backgroundColor="#000" style="light" />
    </>
  );
};

export default TabsLayout;
