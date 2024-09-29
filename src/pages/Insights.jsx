import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';


const dummy = {
  "message": "Uploaded Successfully!",
  "file": {
      "name": "image.jpg",
      "size": 1024,
      "type": "image/jpeg"
  },
  "receipt": {
      "items": [
          {
              "name": "bananas",
              "price": 1.25,
              "category": "fruit"
          },
          {
              "name": "apples",
              "price": 2.50,
              "category": "fruit"
          },
          {
              "name": "milk",
              "price": 3.00,
              "category": "dairy"
          },
          {
              "name": "bread",
              "price": 2.25,
              "category": "bakery"
          },
          {
              "name": "eggs",
              "price": 2.00,
              "category": "dairy"
          },
          {
            "name": "crackers",
            "price": 3.00,
            "category": "snacks"
          },
          {
            "name": "toothbrush",
            "price": 2.00,
            "category": "hygiene"
          },
          {
            "name": "toothpaste",
            "price": 2.00,
            "category": "hygiene"
          },
          {
            "name": "shampoo",
            "price": 2.00,
            "category": "hygiene"
          }
      ],
      "tax": 5.00,
      "subtotal": 11.00,
      "total": 16.00,
      "payment_method": "cash",
      "cashback": 0.24
  }
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Insights = () => {
  const years = Array.from({ length: 30 }, (_, i) => i + 1); // 30 years
  const growthRate = 0.08; // 8% per year
  const initialAmount = 1; // $1 initial amount
  const gridColors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500'];

  const data = {
    labels: years,
    datasets: [
      {
        label: 'Exponential Growth at 8% per Year',
        data: years.map(year => initialAmount * Math.pow(1 + growthRate, year)),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Exponential Growth from $1 at 8% per Year',
      },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-6xl font-bold mb-4 p-6 pb-0">Investment Growth Insights</h1>
      <div className="w-full max-w-4xl">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default Insights;