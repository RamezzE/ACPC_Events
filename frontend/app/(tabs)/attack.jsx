import {
  View,
  Text,
  ScrollView,
  Alert,
  ImageBackground,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DropDownField from "../../components/DropDownField";
import CustomButton from "../../components/CustomButton";

import MapView from "react-native-maps";
import { router } from "expo-router";

import { useEffect, useState, useContext } from "react";

import { GlobalContext } from "../../context/GlobalProvider";

import { attack_check, get_all_attacks } from "../../api/attack_functions";

import { images } from "../../constants";

import Loader from "../../components/Loader";

import {
  get_countries_by_team,
  get_country_mappings,
} from "../../api/country_functions";
import { get_all_teams } from "../../api/team_functions";

import countries from "../../constants/countries";

import MapZone from "../../components/MapZone";
import CountryConnections from "../../constants/country_connections";
import DottedLine from "../../components/DottedLine";

const Attack = () => {
  const { name, teamNo, setAttackData } = useContext(GlobalContext);

  const [countryMappings, setCountryMappings] = useState([]);
  const [initialArea, setInitialArea] = useState([30, 30]);
  const [zones, setZones] = useState([]);
  const [teams, setTeams] = useState([]);
  const [myZones, setMyZones] = useState([]);
  const [otherZones, setOtherZones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(true); // Add isRefreshing state
  const [attacks, setAttacks] = useState([]);

  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    teamNo: teamNo,
    your_zone: "",
    other_zone: "",
  });

  const getTeamColor = (countryName) => {
    try {
      const country = countryMappings.find((c) => c.name === countryName);
      const team = country
        ? teams.find((t) => t.number === country.teamNo)
        : null;
      return team ? team.color : "#000000";
    } catch (error) {
      return "#000000";
    }
  };

  const changeMapPreview = (zone) => {
    const country = countries.find((c) => c.name === zone);

    const avgLat =
      country.points.reduce((acc, curr) => acc + curr.latitude, 0) /
      country.points.length;
    const avgLong =
      country.points.reduce((acc, curr) => acc + curr.longitude, 0) /
      country.points.length;

    setInitialArea([avgLat, avgLong]);
  };

  const validateAttack = (zone_1, zone_2) => {
    var result = {
      success: false,
      errorMsg: "",
    };

    if (!zone_1 || !zone_2) {
      result.errorMsg = "Please fill in all the fields";
      return result;
    }

    result.success = true;
    return result;
  };

  const selectYourZone = (zone) => {
    setForm({ ...form, your_zone: zone, other_zone: "" });

    if (!zone || zone == "") return;

    changeMapPreview(zone);

    let country = countries.find((c) => c.name === zone);

    if (!country) return;

    setOtherZones(country.adjacent_zones);
  };

  const selectOtherZone = (zone) => {
    setForm({ ...form, other_zone: zone });

    if (!zone || zone == "") return;

    changeMapPreview(zone);
  };

  const fetchData = async () => {
    setError(null);
    setZones(countries);
    setIsRefreshing(true);

    try {
      const result = await get_country_mappings();
      setCountryMappings(result);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch country mappings");
    }

    try {
      const result1 = await get_countries_by_team(parseInt(teamNo));
      setMyZones(result1.countries);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch your team's countries");
    }

    try {
      const attacksResult = await get_all_attacks();
      setAttacks(attacksResult);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch attacks data");
    }

    try {
      const teamsResult = await get_all_teams();
      setTeams(teamsResult);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch teams data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // const interval = setInterval(fetchData, 60000);
    // const interval = setInterval(fetchData, 30000);

    // Clear interval on component unmount
    // return () => clearInterval(interval);
  }, []);

  const attack_func = async (zone_1, team_1, zone_2) => {
    setIsSubmitting(true);
    try {
      var result = validateAttack(form.your_zone, form.other_zone);

      setForm({ ...form, your_zone: "", other_zone: "" });
      setOtherZones([]);

      if (!result.success) {
        Alert.alert("Attack Failed", result.errorMsg);
        return;
      }

      team_2 = parseInt(countryMappings.find((c) => c.name === zone_2).teamNo);

      console.log("Attacking", zone_1, team_1);
      console.log("Defending: ", zone_2, team_2);

      const response = await attack_check(zone_1, team_1, zone_2, team_2);

      if (!response.success) {
        Alert.alert("Attack Failed", response.errorMsg);
        return;
      }

      console.log("Response", response);
      setAttackData({
        attacking_zone: zone_1,
        attacking_team: team_1,
        defending_zone: zone_2,
        defending_team: team_2,
        war: "",
      });

      setForm({ your_zone: "", other_zone: "" });
      router.push("/warzone");
    } catch (error) {
      Alert.alert(
        "Attack Failed",
        error.response?.data || "Error checking attack"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMarkerPress = (zone) => {
    try {
      const country = countryMappings.find((c) => c.name === zone.name);
      const team = country
        ? teams.find((t) => t.number === country.teamNo)
        : null;
      const attack = attacks.find((a) => a.defending_zone === zone.name);

      Alert.alert(
        zone.name,
        `Owned by: Team ${team.number}\n${
          attack
            ? `Under attack by: Team ${attack.attacking_team}`
            : "Not under attack"
        }`
      );
    } catch (error) {
      console.log(error);
    }
  };

  if (isRefreshing) {
    return (
      <View
        className="flex-1 bg-black"
        style={{
          paddingTop: insets.top,
          paddingRight: insets.right,
          paddingLeft: insets.left,
        }}
      >
        <ImageBackground
          source={images.background}
          style={{ flex: 1, resizeMode: "cover" }}
        >
          <Loader />
        </ImageBackground>
      </View>
    );
  }

  return (
    <View
      className="bg-black h-full"
      style={{
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingLeft: insets.left,
      }}
    >
      <ImageBackground
        source={images.background}
        style={{ flex: 1, resizeMode: "cover" }}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchData()}
              tintColor="#000"
            />
          }
        >
          <View className="w-full min-h-[82.5vh] px-4 py-4 flex flex-col justify-between">
          <View className="flex flex-col mb-6">
              <Text className="font-montez text-center text-5xl py-5">
                {name}, Team {teamNo}
              </Text>

              {!Array.isArray(myZones) || myZones.length === 0 ? (
                <View></View>
              ) : (
                <DropDownField
                  title="Select Your Country"
                  value={form.your_zone}
                  placeholder="Select Your Country"
                  items={myZones.map((zone) => ({
                    label: `${zone.name}`,
                    value: zone.name,
                  }))}
                  handleChange={(e) => selectYourZone(e)}
                  otherStyles=""
                />
              )}

              {!Array.isArray(otherZones) || otherZones.length === 0 ? (
                <View></View>
              ) : (
                <DropDownField
                  title="Select Country to Attack"
                  value={form.other_zone}
                  placeholder="Select Country to Attack"
                  items={otherZones.map((zone) => ({
                    label: `${zone}`,
                    value: zone,
                  }))}
                  handleChange={(e) => selectOtherZone(e)}
                  otherStyles="mt-5"
                />
              )}
            </View>

            <MapView
              className="flex-1"
              region={{
                latitude: initialArea[0],
                longitude: initialArea[1],
                latitudeDelta: 50,
                longitudeDelta: 100,
              }}
              mapType="satellite"
              // scrollEnabled={false}
              // zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {zones.map((zone, index) => (
                <MapZone
                  key={index}
                  points={zone.points}
                  color={getTeamColor(zone.name)}
                  label={zone.name}
                  onMarkerPress={() => onMarkerPress(zone)}
                />
              ))}

              {CountryConnections.map((points, index) => (
                <DottedLine
                  key={index}
                  startPoint={points.point1}
                  endPoint={points.point2}
                  color="#FFF"
                  thickness={2}
                  // dashLength={25}
                  dashGap={2}
                />
              ))}
            </MapView>

            <CustomButton
              title={form.other_zone ? `Attack ${form.other_zone}` : "Attack"}
              handlePress={() =>
                attack_func(form.your_zone, parseInt(teamNo), form.other_zone)
              }
              containerStyles="mt-7 p-3"
              textStyles={"text-3xl"}
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default Attack;
