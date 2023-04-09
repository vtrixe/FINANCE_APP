import DashboardBox from "@/components/DashboardBox";
import FlexBetween from "@/components/FlexBetween";
import { useGetKpisQuery } from "@/state/api";
import { Box, Button, Typography, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import regression, { DataPoint } from "regression";

const Predictions = () => {
  const { palette } = useTheme();
  const [isPredictions, setIsPredictions] = useState(false);
  const { data: kpiData } = useGetKpisQuery();

  const formattedData = useMemo(() => {
    if (!kpiData) {
      return [
        { name: "Jan", "Actual Revenue": 5000, "Regression Line": 5000, "Predicted Revenue": 6000 },
        { name: "Feb", "Actual Revenue": 9000, "Regression Line": 7000, "Predicted Revenue": 7500 },
        { name: "Mar", "Actual Revenue": 12000, "Regression Line": 9000, "Predicted Revenue": 9000 },
        { name: "Apr", "Actual Revenue": 15000, "Regression Line": 11000, "Predicted Revenue": 10500 },
        { name: "May", "Actual Revenue": 18000, "Regression Line": 13000, "Predicted Revenue": 12000 },
        { name: "Jun", "Actual Revenue": 22000, "Regression Line": 15000, "Predicted Revenue": 13500 },
        { name: "Jul", "Actual Revenue": 25000, "Regression Line": 17000, "Predicted Revenue": 15000 },
        { name: "Aug", "Actual Revenue": 28000, "Regression Line": 19000, "Predicted Revenue": 16500 },
        { name: "Sep", "Actual Revenue": 31000, "Regression Line": 21000, "Predicted Revenue": 18000 },
        { name: "Oct", "Actual Revenue": 34000, "Regression Line": 23000, "Predicted Revenue": 19500 },
        { name: "Nov", "Actual Revenue": 37000, "Regression Line": 25000, "Predicted Revenue": 21000 },
        { name: "Dec", "Actual Revenue": 40000, "Regression Line": 27000, "Predicted Revenue": 22500 },
      ];
    }

    const monthData = kpiData[0].monthlyData;

    const formatted: Array<DataPoint> = monthData.map(
      ({ revenue }, i: number) => {
        return [i, revenue];
      }
    );
    const regressionLine = regression.linear(formatted);

    return monthData.map(({ month, revenue }, i: number) => {
      return {
        name: month,
        "Actual Revenue": revenue,
        "Regression Line": regressionLine.points[i][1],
        "Predicted Revenue": regressionLine.predict(i + 12)[1],
      };
    });
  }, [kpiData]);

  return (
    <DashboardBox width="100%" height="100%" p="1rem" overflow="hidden">
      <FlexBetween m="1rem 2.5rem" gap="1rem">
        <Box>
          <Typography variant="h3">Revenue and Predictions</Typography>
          <Typography variant="h6">
            charted revenue and predicted revenue based on a simple linear
            regression model
          </Typography>
        </Box>
        <Button
          onClick={() => setIsPredictions(!isPredictions)}
          sx={{
            color: palette.grey[900],
            backgroundColor: palette.grey[700],
            boxShadow: "0.1rem 0.1rem 0.1rem 0.1rem rgba(0,0,0,.4)",
          }}
        >
          Show Predicted Revenue for Next Year
        </Button>
      </FlexBetween>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 20,
            right: 75,
            left: 20,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grey[800]} />
          <XAxis dataKey="name" tickLine={false} style={{ fontSize: "10px" }}>
            <Label value="Month" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis
            domain={[12000, 26000]}
            axisLine={{ strokeWidth: "0" }}
            style={{ fontSize: "10px" }}
            tickFormatter={(v) => `$${v}`}
          >
            <Label
              value="Revenue in USD"
              angle={-90}
              offset={-5}
              position="insideLeft"
            />
          </YAxis>
          <Tooltip />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="Actual Revenue"
            stroke={palette.primary.main}
            strokeWidth={0}
            dot={{ strokeWidth: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Regression Line"
            stroke="#8884d8"
            dot={false}
          />
          {isPredictions && (
            <Line
              strokeDasharray="5 5"
              dataKey="Predicted Revenue"
              stroke={palette.secondary[500]}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </DashboardBox>
  );
};

export default Predictions;
