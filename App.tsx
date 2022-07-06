import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Animated, LayoutRectangle
} from 'react-native';
import {useState} from "react";

const circleWidth = Dimensions.get('window').width - 100;

const MonthsMapping = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const layoutZones: { [month: string]: LayoutRectangle } = {};

export default function App() {
  const [monthlyGoals, setMonthlyGoals] = useState<string[]>(new Array(12).fill(""));
  const [goalInputValue, setGoalInputValue] = useState("");

  const PanStyles = new Array(12).fill(0).map((_, currentMonthIndex) => {
    const pan = new Animated.ValueXY();
    pan.setValue({ x: 0, y: 0 });
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => {
        return true;
      },
      onPanResponderMove: Animated.event([
        null, { dx: pan.x, dy: pan.y }
      ], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        let monthIndex = -1;
        for (let monthName in layoutZones) {
          const dz = layoutZones[monthName];
          if (gesture.moveX > dz.x && gesture.moveX < dz.y + dz.width && gesture.moveY > dz.y && gesture.moveY < dz.y + dz.height) {
            monthIndex = MonthsMapping.findIndex((m) => m === monthName);
          }
        }
        if (monthIndex > -1) {
          const currentGoal = monthlyGoals[currentMonthIndex] ?? "";
          monthlyGoals[currentMonthIndex] = monthlyGoals[monthIndex] ?? "";
          monthlyGoals[monthIndex] = currentGoal;
          setMonthlyGoals([...monthlyGoals]);
        }
        pan.setValue({ x: 0, y: 0 });
      },
    });

    return {
      pan,
      responder,
    }
  });

  const AddGoal = () => {
    for (let i = 0; i < monthlyGoals.length; i++) {
      if (monthlyGoals[i].length === 0) {
        monthlyGoals[i] = goalInputValue;
        break;
      }
    }
    setMonthlyGoals([...monthlyGoals]);
    setGoalInputValue("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} value={goalInputValue} onChangeText={setGoalInputValue} />
        <Button title="Add" onPress={AddGoal} />
      </View>
      <View style={styles.calendarWrapper}>
        {new Array(12).fill(0).map((_, index) => (
          <View key={index} style={[styles.calendarItem, GetItemStyles(index)]} onLayout={(event) => {
            const { nativeEvent: { layout } } = event;
            layoutZones[MonthsMapping[index]] = {...layout};
          }}>
            <Animated.View
              {...PanStyles[index].responder.panHandlers}
              style={[{ transform: PanStyles[index].pan.getTranslateTransform() }, styles.calendarMonthContainer, { marginTop: 3 }]}
            >
              <View style={styles.calendarItemTextWrap}><Text>{monthlyGoals[index] ?? ""}</Text></View>
            </Animated.View>
            <Text style={styles.calendarMonthName}>{MonthsMapping[index]}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: 50
  },
  input: {
    borderRadius: 7,
    borderWidth: 1,
    padding: 10,
    flexGrow: 1
  },
  calendarWrapper: {
    width: circleWidth,
    height: circleWidth,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: circleWidth,
    // position: "relative",
  },
  calendarItem: {
    flex: 1,
    justifyContent: "flex-end",
    position: "absolute",
    flexDirection: "row",
    left: circleWidth / 2,
    top: circleWidth / 2,
    width: circleWidth / 2,
    height: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "black",
  },
  calendarMonthContainer: {
    marginLeft: 40,
    margin: 5,
  },
  calendarItemTextWrap: {
    height: 30,
    width: 100,
    // borderWidth: 1,
    // borderColor: "black"
  },
  calendarMonthName: {
    right: -35,
    position: "absolute",
  }
});

function GetItemStyles(monthIndex = 0, totalCount= 12) {
  return {
    transform: [
      { translateX: - circleWidth / 4 },
      { rotate: `${parseInt((monthIndex * (360 / totalCount)).toString(), 10)}deg` },
      { translateX: circleWidth / 4 },
    ]
  }
}
