import { View, Text, } from 'react-native';
import { Polygon, Marker } from 'react-native-maps';

const MapZone = ({ points, color, label }) => {

  const calculateCenter = (coordinates) => {
    let latSum = 0;
    let lonSum = 0;
    coordinates.forEach((coord) => {
      latSum += coord.latitude;
      lonSum += coord.longitude;
    });
    return {
      latitude: latSum / coordinates.length,
      longitude: lonSum / coordinates.length,
    };
  };

  const polygonCenter = calculateCenter(points);

  return (
    <>
      <Polygon
        coordinates={points}
        strokeColor={`#000000`}
        // strokeColor={``}
        // fillColor={`${color}50`}
        fillColor={`${color}75`}
        strokeWidth={4}
      />

      <Marker coordinate={polygonCenter}>
        <View className = "bg-white rounded-lg">
          <Text className="p-2">{label}</Text>
        </View>
      </Marker>
    </>
  );
};

export default MapZone;
