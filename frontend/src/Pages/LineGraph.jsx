import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";



const getLast12MonthsKeys = () => {
  const result = [];
  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = monthNames[date.getMonth()];
    result.push(`${month}_${date.getFullYear()}`);
  }
  return result;
};


const LineGraph = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [graphData, setGraphData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (data) {
      const allMonths = Object.values(data);
      const categorySet = new Set();
      allMonths.forEach(month =>
        month?.category?.forEach(c => categorySet.add(c.name))
      );
      setCategories(Array.from(categorySet));
    }
  }, [data]);

  useEffect(() => {
    if (data && selectedCategory) {
      const months = getLast12MonthsKeys();
      const chartData = months.map(monthKey => {
        const monthData = data[monthKey];
        const category = monthData?.category?.find(c => c.name === selectedCategory);
        return {
          month: monthKey.replace("_", " "),
          amount: category ? category.totalAmount : 0,
        };
      });
      setGraphData(chartData);
    }
  }, [data, selectedCategory]);

  return (
    <div className="w-full  bg-white rounded-lg lg:p-4 p-2 mb-10">
      <div className="mb-4 flex justify-end">
        <select
        className="px-4 py-2 rounded-lg outline-none border appearance-none bg-green-400 border-green-500 text-white font-semibold"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} className="bg-white text-black" value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className={"bg-[#f6f6f6] rounded-lg lg:p-4 pt-10"}>

        <ResponsiveContainer width="100%" height={400} >
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              strokeWidth={3}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
       </div>
    </div>
  );
};

export default LineGraph;
