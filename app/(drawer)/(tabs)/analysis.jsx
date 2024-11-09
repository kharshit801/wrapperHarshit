import React, { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { COLORS } from "../../../constants/theme";
import ChatInterface from "../../../components/ChatInterface";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Header from "../../../components/commonheader";
import { useGlobalContext } from "../../../components/globalProvider";
import ChatGuidePointer from "../../../components/ChatGuidePointet";
import LottieView from "lottie-react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useTranslation } from "react-i18next";

const TIMEFRAMES = ["month", "quarter", "year"];

const TimeframeSelector = ({ selectedTimeframe, setSelectedTimeframe }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.timeframeContainer}>
      {TIMEFRAMES.map((timeframe) => (
        <TouchableOpacity
          key={timeframe}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe && styles.timeframeButtonActive,
          ]}
          onPress={() => setSelectedTimeframe(timeframe)}
        >
          <Text
            style={[
              styles.timeframeText,
              selectedTimeframe === timeframe && styles.timeframeTextActive,
            ]}
          >
            {t(timeframe.charAt(0).toUpperCase() + timeframe.slice(1))}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CategoryLegend = ({ data }) => (
  <View style={styles.legendContainer}>
    {data.map((item, index) => (
      <View key={`${item.label}-${index}`} style={styles.legendItem}>
        <View
          style={[styles.legendColor, { backgroundColor: item.color }]}
        />
        <Text style={styles.legendText}>
          {item.label} ({item.percentageUsed.toFixed(1)}%)
        </Text>
      </View>
    ))}
  </View>
);

const SummaryCard = ({ label, value }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{t(label)}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
};

const ProgressCard = ({ category }) => (
  <View key={category.label} style={styles.progressCard}>
    <View style={styles.progressHeader}>
      <Text style={styles.categoryName}>{category.label}</Text>
      <Text style={styles.percentageUsed}>
        {category.percentageUsed.toFixed(1)}% used
      </Text>
    </View>
    <View style={styles.progressBar}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.min(category.percentageUsed, 100)}%`,
            backgroundColor:
              category.percentageUsed > 100 ? COLORS.danger : COLORS.secondary,
          },
        ]}
      />
    </View>
  </View>
);

const Analysis = () => {
  const { state, dispatch } = useGlobalContext();
  const { summary, transactions, budgets } = state;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [showSpotlight, setShowSpotlight] = useState(true);
  const { t, i18n } = useTranslation();
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (state.language && i18n.language !== state.language) {
      i18n.changeLanguage(state.language);
    }
  }, [state.language]);

  const processedData = useMemo(() => {
    const today = new Date();
    const periods = {
      month: 6,
      quarter: 4,
      year: 5,
    };

    const getPeriodLabel = (date, timeframe) => {
      switch (timeframe) {
        case "month":
          return date.toLocaleString("default", { month: "short" });
        case "quarter":
          return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
        case "year":
          return date.getFullYear().toString();
        default:
          return "";
      }
    };

    const periodCount = periods[selectedTimeframe];
    const periodData = [];
    const categoryData = {};
    let totalSpent = 0;
    let totalBudget = 0;

    for (let i = periodCount - 1; i >= 0; i--) {
      let periodStartDate, periodEndDate;
      if (selectedTimeframe === "month") {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        periodStartDate = new Date(date);
        periodEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      } else if (selectedTimeframe === "quarter") {
        const monthsBack = i * 3;
        const date = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
        periodStartDate = new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
        periodEndDate = new Date(date.getFullYear(), periodStartDate.getMonth() + 3, 0);
      } else {
        const year = today.getFullYear() - i;
        periodStartDate = new Date(year, 0, 1);
        periodEndDate = new Date(year, 11, 31);
      }

      periodData.push({
        label: getPeriodLabel(periodStartDate, selectedTimeframe),
        startDate: periodStartDate,
        endDate: periodEndDate,
        expenses: 0,
        income: 0,
        savings: 0,
      });
    }

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      periodData.forEach((period) => {
        if (transactionDate >= period.startDate && transactionDate <= period.endDate) {
          if (transaction.type === "EXPENSE") {
            period.expenses += transaction.amount;
            totalSpent += transaction.amount;
            if (!categoryData[transaction.category]) {
              categoryData[transaction.category] = {
                amount: 0,
                budget:
                  budgets.find((b) => b.title.toLowerCase() === transaction.category.toLowerCase())
                    ?.limit || 0,
              };
            }
            categoryData[transaction.category].amount += transaction.amount;
          } else {
            period.income += transaction.amount;
          }
        }
      });
    });

    periodData.forEach((period) => {
      period.savings =
        period.income !== 0 ? ((period.income - period.expenses) / period.income) * 100 : 0;
    });

    budgets.forEach((budget) => {
      totalBudget += budget.limit;
    });

    return {
      periodData,
      categoryData,
      totalSpent,
      totalBudget,
      budgetUtilization: totalBudget ? (totalSpent / totalBudget) * 100 : 0,
    };
  }, [transactions, selectedTimeframe, budgets]);

  const lineChartData = {
    labels: processedData.periodData.map((d) => d.label),
    datasets: [
      {
        data: processedData.periodData.map((d) => d.income),
        color: () => COLORS.income,
        strokeWidth: 2,
      },
      {
        data: processedData.periodData.map((d) => d.expenses),
        color: () => COLORS.expenses,
        strokeWidth: 2,
      },
    ],
    legend: [t("Income"), t("Expenses")],
  };

  const pieChartData = Object.keys(processedData.categoryData).map((category, index) => {
    const data = processedData.categoryData[category];
    return {
      name: category,
      amount: data.amount,
      color: COLORS.chartColors[index % COLORS.chartColors.length],
      legendFontColor: COLORS.text.primary,
      legendFontSize: 12,
      percentageUsed: data.budget ? (data.amount / data.budget) * 100 : 0,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Header searchIconShown={false} />

      <ScrollView style={styles.content}>
        <TimeframeSelector selectedTimeframe={selectedTimeframe} setSelectedTimeframe={setSelectedTimeframe} />

        <View style={styles.summaryContainer}>
          <SummaryCard label={t("Total_Spent")} value={`₹${processedData.totalSpent.toLocaleString()}`} />
          <SummaryCard label={t("Budget_Utilized")} value={`${processedData.budgetUtilization.toFixed(1)}%`} />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t("Income vs Expenses Trend")}</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - wp("18%")}
            height={220}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: COLORS.secondary,
              backgroundGradientFrom: COLORS.primary,
              backgroundGradientTo: COLORS.primary,
              decimalPlaces: 2,
              color: () => COLORS.secondary,
              labelColor: () => COLORS.text.primary,
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
            fromZero
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t("Spending by Category")}</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - wp("8%")}
            height={220}
            chartConfig={{ color: () => `rgb(0, 0, 0)` }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
          <CategoryLegend data={pieChartData} />
        </View>

        <View style={styles.categoryProgressContainer}>
          <Text style={styles.chartTitle}>{t("Budget Progress")}</Text>
          {pieChartData.map((category, index) => (
            <ProgressCard key={`${category.name}-${index}`} category={category} />
          ))}
        </View>
      </ScrollView>

      {showSpotlight && <ChatGuidePointer onDismiss={() => setShowSpotlight(false)} />}

      <TouchableOpacity
        style={[styles.chatButton, showSpotlight && styles.chatButtonSpotlight]}
        onPress={() => setIsChatOpen(true)}
      >
        <LottieView
          source={require("../../../assets/animation/ai.json")}
          loop
          style={{ width: wp("16%"), height: wp("16%") }}
          autoPlay
        />
      </TouchableOpacity>

      {isChatOpen && (
        <View style={StyleSheet.absoluteFill}>
          <ChatInterface summary={summary} transactions={transactions} onClose={() => setIsChatOpen(false)} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: wp("4%"),
  },
  chartTitle: {
    fontSize: wp("4.5%"),
    color: COLORS.text.primary,
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  timeframeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("3%"),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp("4%"),
    padding: wp("1.5%"),
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    borderRadius: wp("3%"),
  },
  timeframeButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  timeframeText: {
    color: COLORS.text.secondary,
    fontSize: wp("4%"),
    fontWeight: "500",
  },
  timeframeTextActive: {
    color: COLORS.background,
    fontWeight: "bold",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("3%"),
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: wp("4%"),
    padding: wp("4%"),
    marginHorizontal: wp("1%"),
    elevation: 3,
  },
  summaryLabel: {
    color: COLORS.text.secondary,
    fontSize: wp("4%"),
    marginBottom: hp("1%"),
  },
  summaryValue: {
    color: COLORS.text.primary,
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  chartContainer: {
    marginBottom: hp("4%"),
    backgroundColor: COLORS.primary,
    borderRadius: wp("4%"),
    padding: wp("4%"),
    elevation: 5,
  },
  legendContainer: {
    width: "100%",
    paddingHorizontal: wp("4%"),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp("1%"),
  },
  legendColor: {
    width: wp("4%"),
    height: wp("4%"),
    borderRadius: wp("2%"),
    marginRight: wp("3%"),
  },
  legendText: {
    color: COLORS.text.primary,
    fontSize: wp("3.5%"),
    flex: 1,
  },
  categoryProgressContainer: {
    marginBottom: hp("4%"),
  },
  progressCard: {
    marginBottom: hp("2.5%"),
    backgroundColor: COLORS.primary,
    padding: wp("4%"),
    borderRadius: wp("3%"),
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  categoryName: {
    fontSize: wp("4%"),
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  percentageUsed: {
    fontSize: wp("3.5%"),
    color: COLORS.text.secondary,
  },
  progressBar: {
    height: hp("2%"),
    backgroundColor: COLORS.lightbackground,
    borderRadius: wp("2%"),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: wp("2%"),
  },
  chatButton: {
    position: "absolute",
    bottom: hp("3%"),
    right: wp("4%"),
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    elevation: 5,
  },
  chatButtonSpotlight: {
    elevation: 8,
    backgroundColor: COLORS.secondary,
  },
});

export default Analysis;
