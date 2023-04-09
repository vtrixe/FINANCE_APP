import BoxHeader from "@/components/BoxHeader";
import DashboardBox from "@/components/DashboardBox";
import { useGetKpisQuery } from "@/state/api";
import { useTheme } from "@mui/material";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  BarChart,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip,
  Area,
} from "recharts";

const Row1 = () => {
  const { palette } = useTheme();
  const { data } = useGetKpisQuery();
  const revenue = useMemo(() => {
    return (
      data &&
      data[0].monthlyData.map(({ month, revenue }) => {
        return {
          name: month.substring(0, 3),
          revenue: revenue,
        };
      })
    );
  }, [data]);

  const revenueExpenses = useMemo(() => {
    if (!data) {
      return [
        { name: "Jan", revenue: 15400, expenses: 12800 },
      { name: "Feb", revenue: 32500, expenses: 15000 },
      { name: "Mar", revenue: 33500, expenses: 20030 },
      { name: "Apr", revenue: 30000, expenses: 23800 },
      { name: "May", revenue: 9500, expenses: 12500 },
      { name: "Jun", revenue: 35000, expenses: 30001},
      { name: "Jul", revenue: 35500, expenses: 34000 },
      { name: "Aug", revenue: 34500, expenses: 33500 },
      { name: "Sep", revenue: 47000, expenses: 45000 },
      { name: "Oct", revenue: 28000, expenses: 26000 },
      { name: "Nov", revenue: 89000, expenses: 37000 },
      { name: "Dec", revenue: 30000, expenses: 28000 },
      ];
    }
  
    return data[0]?.monthlyData.map(({ month, revenue }) => {
      return {
        name: month.substring(0, 3),
        revenue: revenue,
      };
    })
  }, [data]);
  
  const revenueProfit = useMemo(() => {
    if (!data) {
      return [
        { name: "Jan", revenue: 2500, profit: 1900.23 },
        { name: "Feb", revenue: 3500, profit: 2900.56 },
        { name: "Mar", revenue: 4500, profit: 3900.01 },
        { name: "Apr", revenue: 5500, profit: 4900.89 },
        { name: "May", revenue: 6500, profit: 5900.32 },
        { name: "Jun", revenue: 7500, profit: 6900.45 },
        { name: "Jul", revenue: 8500, profit: 7900.78 },
        { name: "Aug", revenue: 9500, profit: 8900.91 },
        { name: "Sep", revenue: 10500, profit: 9900.34 },
        { name: "Oct", revenue: 11500, profit: 10900.67 },
        { name: "Nov", revenue: 12500, profit: 11900.01 },
        { name: "Dec", revenue: 13500, profit: 12900.23 },
      ];
    }
  
    return data[0].monthlyData.map(({ month, revenue, expenses }) => {
      return {
        name: month.substring(0, 3),
        revenue: revenue * 1.5 + Math.random() * 1000,
        profit: (revenue - expenses) * 1.2 + Math.random() * 500,
      };
    });
  }, [data]);
  

  return (
    <>
      <DashboardBox gridArea="a">
        <BoxHeader
          title="Revenue and Expenses"
          subtitle="top line represents revenue, bottom line represents expenses"
          sideText="+4%"
        />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={revenueExpenses}
            margin={{
              top: 15,
              right: 25,
              left: -10,
              bottom: 60,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.primary[300]}
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor={palette.primary[300]}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.primary[300]}
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor={palette.primary[300]}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              style={{ fontSize: "10px" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ strokeWidth: "0" }}
              style={{ fontSize: "10px" }}
              domain={[8000, 23000]}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              dot={true}
              stroke={palette.primary.main}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              dot={true}
              stroke={palette.primary.main}
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </DashboardBox>
      <DashboardBox gridArea="b">
        <BoxHeader
          title="Profit and Revenue"
          subtitle="top line represents revenue, bottom line represents expenses"
          sideText="+4%"
        />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={400}
            data={revenueProfit}
            margin={{
              top: 20,
              right: 0,
              left: -10,
              bottom: 55,
            }}
          >
            <CartesianGrid vertical={false} stroke={palette.grey[800]} />
            <XAxis
              dataKey="name"
              tickLine={false}
              style={{ fontSize: "10px" }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "10px" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "10px" }}
            />
            <Tooltip />
            <Legend
              height={20}
              wrapperStyle={{
                margin: "0 0 10px 0",
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="profit"
              stroke={palette.tertiary[500]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke={palette.primary.main}
            />
          </LineChart>
        </ResponsiveContainer>
      </DashboardBox>
      <DashboardBox gridArea="c">
        <BoxHeader
          title="Revenue Month by Month"
          subtitle="graph representing the revenue month by month"
          sideText="+4%"
        />
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={revenue}
            margin={{
              top: 17,
              right: 15,
              left: -5,
              bottom: 58,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.primary[300]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={palette.primary[300]}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={palette.grey[800]} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              style={{ fontSize: "10px" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              style={{ fontSize: "10px" }}
            />
            <Tooltip />
            <Bar dataKey="revenue" fill="url(#colorRevenue)" />
          </BarChart>
        </ResponsiveContainer>
      </DashboardBox>
    </>
  );
};

export default Row1;
