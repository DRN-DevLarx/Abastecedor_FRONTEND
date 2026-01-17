import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const dataLine = [
  { name: "Ago", ganacia: 20, venta: 30 },
  { name: "Sep", ganacia: 30, venta: 20 },
  { name: "Oct", ganacia: 20, venta: 15 },
  { name: "Nov", ganacia: 40, venta: 30 },
  { name: "Dec", ganacia: 35, venta: 25 },
  { name: "Jan", ganacia: 50, venta: 40 },
  { name: "Feb", ganacia: 70, venta: 50 },
  { name: "Mar", ganacia: 60, venta: 45 },
];

const dataBar = [
  { day: "L", venta: 50, ganacia: 70 },
  { day: "M", venta: 60, ganacia: 80 },
  { day: "Mi", venta: 40, ganacia: 60 },
  { day: "J", venta: 90, ganacia: 100 },
  { day: "V", venta: 75, ganacia: 90 },
  { day: "S", venta: 85, ganacia: 95 },
  { day: "D", venta: 55, ganacia: 70 },
];

import React, { useState, useEffect } from "react";
import { GetData } from "../services/ApiServices";

function Statistics() {

  const [UserTotal, setUserTotal] = useState(0)
  const [ProductsTotal, setProductsTotal] = useState(0)

  useEffect(() => {

        const fetchData = async () => {
          const UsersData = await GetData("users/")
          const ProductsData = await GetData("productosAdmin/")

          if (UsersData) {

            setUserTotal(UsersData.length)
            setProductsTotal(ProductsData.length)
          }
        }

        fetchData() 
  }), []

  return (
    <div>
    {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto z-20">
        <br />
        <h2 className="text-black dark:text-white text-2xl font-bold mt-2 mb-4">Estadisticas generales</h2>

        {/* Stats Cards */} 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

          <div className="hover:scale-110 bg-transparent hover:bg-[#adb6aa] dark:hover:bg-[#282852a8] shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
            <p className="text-black font-bold dark:text-gray-400">Total de usuarios</p>
            <h2 className="text-2xl font-bold text-white">{UserTotal}</h2>
          </div>

          <div className="hover:scale-110 bg-transparent hover:bg-[#adb6aa] dark:hover:bg-[#282852a8] shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
            <p className="text-black font-bold dark:text-gray-400">Total de productos</p>
            <h2 className="text-2xl font-bold text-white">{ProductsTotal}</h2>
          </div>

          <div className="hover:scale-110 bg-transparent hover:bg-[#adb6aa] dark:hover:bg-[#282852a8] shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
            <p className="text-black font-bold dark:text-gray-400">Total de pedidos</p>
            <h2 className="text-2xl font-bold text-white">230</h2>
            <span className="text-green-400 text-sm">+0.43%</span>
          </div>
          
          <div className="hover:scale-110 bg-transparent hover:bg-[#adb6aa] dark:hover:bg-[#282852a8] shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
            <p className="text-black font-bold dark:text-gray-400">Total de ventas</p>
            <h2 className="text-2xl font-bold text-white">$45.2K</h2>
            <span className="text-green-400 text-sm">+4.53%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-2">
          {/* --- LINE CHART --- */}
          <div className="lg:col-span-2 bg-transparent shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
            <h3 className="mb-4 text-black font-semibold dark:text-gray-400">
              Ganancias vs Ventas
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataLine} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              
                {/* Líneas */}
                <Line type="monotone" dataKey="venta" stroke="currentColor" strokeWidth={3} className="text-blue-500 dark:text-blue-300" name="Ventas"/>

                <Line type="monotone" dataKey="ganacia" stroke="currentColor" strokeWidth={2} className="text-emerald-500 dark:text-emerald-300" name="Ganancias" />

                {/* Ejes y cuadrícula */}
                <CartesianGrid strokeDasharray="5 5" className="text-slate-600 dark:text-slate-700" stroke="currentColor"/>
                <XAxis dataKey="name" className="text-slate-500" stroke="currentColor"/>
                <YAxis className="text-slate-500" stroke="currentColor"/>

                {/* Tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(30 41 59 / 0.5)',
                    border: '1px solid rgb(100 116 139)',
                    color: '#f1f5f9',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Leyenda visual */}
            <div className="flex gap-6  justify-center text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-300"></span>
                <span>Ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-300"></span>
                <span>Ganancias</span>
              </div>
            </div>
          </div>

          {/* --- BAR CHART --- */}
          <div className="bg-transparent shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
            <h3 className="mb-4 text-black font-semibold dark:text-gray-400"> Ventas esta semana </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                <CartesianGrid className="w-full" strokeDasharray="5 5" stroke="#334155" />
                <XAxis dataKey="day" className="text-slate-500" stroke="currentColor"/>
                <YAxis className="text-slate-500" stroke="currentColor"/>

                {/* Tooltip con colores */}
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;

                    return (
                      <div className="bg-slate-800/90 dark:bg-slate-700/90 text-slate-100 border border-slate-600 rounded-lg p-3 shadow-md backdrop-blur-sm">
                        <p className="text-sm font-semibold mb-2 text-slate-200">{label}</p>
                        <ul className="space-y-1">
                          {payload.map((entry, index) => (
                            <li key={`tooltip-bar-${index}`} className="flex items-center gap-2">
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              ></span>
                              <span className="text-slate-300">
                                {entry.name}:{" "}
                                <span className="font-semibold text-slate-100">
                                  {entry.value}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }}
                />

                {/* Barras con sombras y colores consistentes */}
                <Bar dataKey="venta" name="Ventas" fill="#3b82f6" radius={[6, 6, 0, 0]} className="drop-shadow-md" />
                <Bar dataKey="ganacia" name="Ganancias" fill="#10b981" radius={[6, 6, 0, 0]} className="drop-shadow-md" />
              </BarChart>
            </ResponsiveContainer>

            {/* Leyenda visual */}
            <div className="flex gap-6 justify-center text-sm text-gray-600 dark:text-gray-300 mt-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Ganancias</span>
              </div>
            </div>
          </div>

        </div>


      </main>
    </div> 
  );
}

export default Statistics;
