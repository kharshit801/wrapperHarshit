import React from "react";
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../constants/theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

const Analysis = () => {
  const navigation = useNavigation();

  // Sample data for the line chart
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [500, 800, 650, 900, 750, 1000],
        strokeWidth: 2,
        color: () => `#007AFF`,
      },
    ],
  };

  // Sample data for the bar chart
  const barData = {
    labels: ["Food", "Rent", "Entertainment", "Utilities"],
    datasets: [
      {
        data: [400, 600, 300, 200],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      },
    ],
  };

  // Sample data for the pie chart
  const pieData = [
    {
      name: "Food",
      amount: 400,
      color: COLORS.secondary,
      legendFontColor: COLORS.text.primary,
      legendFontSize: wp("3%"),
    },
    {
      name: "Rent",
      amount: 600,
      color: COLORS.lightbackground,
      legendFontColor: COLORS.text.primary,
      legendFontSize: wp("3%"),
    },
    {
      name: "Entertainment",
      amount: 300,
      color: "#D1D1D8",
      legendFontColor: COLORS.text.primary,
      legendFontSize: wp("3%"),
    },
    {
      name: "Utilities",
      amount: 200,
      color: "#EBEBF0",
      legendFontColor: COLORS.text.primary,
      legendFontSize: wp("3%"),
    },
  ];

  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={wp("6%")} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate("SearchTransactions")}
        >
          <Ionicons name="search" size={wp("6%")} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending Over Time</Text>
          <LineChart
            data={lineData}
            width={screenWidth - wp("8%")}
            height={hp("25%")}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: COLORS.primary,
              backgroundGradientFrom: COLORS.primary,
              backgroundGradientTo: COLORS.primary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: hp("1%"),
              borderRadius: wp("4%"),
              alignSelf: "center",
            }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          <BarChart
            data={barData}
            width={screenWidth - wp("8%")}
            height={hp("25%")}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: COLORS.primary,
              backgroundGradientFrom: COLORS.primary,
              backgroundGradientTo: COLORS.primary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            style={{
              marginVertical: hp("1%"),
              borderRadius: wp("4%"),
              alignSelf: "center",
            }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending Breakdown</Text>
          <PieChart
        data={pieData}
        width={screenWidth - wp("8%")}
        height={hp("25%")}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          backgroundColor: 'transparent',
        }}
        accessor={"amount"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
        style={{
          alignSelf: "center",
        }}
      />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp("4%"),
    backgroundColor: COLORS.background,
  },
  logo: {
    width: wp("20%"),
    height: wp("8%"),
  },
  menuButton: {
    padding: wp("2%"),
  },
  searchButton: {
    padding: wp("2%"),
  },
  content: {
    flex: 1,
  },
  chartContainer: {
    marginVertical: hp("2%"),
    alignItems: "center",
  },
  chartTitle: {
    fontSize: wp("4.5%"),
    marginBottom: hp("1%"),
    color: COLORS.text.primary,
  },
});

export default Analysis;
