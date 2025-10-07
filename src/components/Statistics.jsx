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
import { Home, User, Settings, Menu, X, LogOut, Package, MessageCircle } from "lucide-react";

const dataLine = [
  { name: "Sep", ganacia: 30, venta: 20 },
  { name: "Oct", ganacia: 20, venta: 15 },
  { name: "Nov", ganacia: 40, venta: 30 },
  { name: "Dec", ganacia: 35, venta: 25 },
  { name: "Jan", ganacia: 50, venta: 40 },
  { name: "Feb", ganacia: 70, venta: 50 },
  { name: "Mar", ganacia: 60, venta: 45 },
];

const dataBar = [
  { day: "M", venta: 50, ganacia: 70 },
  { day: "T", venta: 60, ganacia: 80 },
  { day: "W", venta: 40, ganacia: 60 },
  { day: "T", venta: 90, ganacia: 100 },
  { day: "F", venta: 75, ganacia: 90 },
  { day: "S", venta: 85, ganacia: 95 },
  { day: "S", venta: 55, ganacia: 70 },
];

import React, { useState, useEffect } from "react";
import { GetData } from "../services/ApiServices";
import { GenerateToken } from "../services/Token/sessionManager";
import { useNavigate } from "react-router-dom";


function Statistics() {

  const navigate = useNavigate()
  const [UserTotal, setUserTotal] = useState(0)
  const [ProductsTotal, setProductsTotal] = useState(0)

  useEffect(() => {

        const fetchData = async () => {
          const UsersData = await GetData("users/")
          const ProductsData = await GetData("productos/")

          if (UsersData) {

            setUserTotal(UsersData.length)
            setProductsTotal(ProductsData.length)
          }
        }

        fetchData() 
  }), []

  const ViewProducts = async () => {
    const TOKEN = await GenerateToken({ ProductsList: true }, "ProductsCookie");

    if(TOKEN) {
      navigate("/productos")
    }
  }

  return (
    <div>
    {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto z-20">
        <br />
        <h2 className="text-black dark:text-white text-2xl font-bold mt-2 mb-4">Estadisticas generales</h2>

        {/* Stats Cards */} 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

          <div onClick={(() => navigate("/usuarios"))} className="hover:scale-110 bg-transparent hover:bg-[#adb6aa] dark:hover:bg-[#282852a8] shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
            <p className="text-black font-bold dark:text-gray-400">Total de usuarios</p>
            <h2 className="text-2xl font-bold text-white">{UserTotal}</h2>
          </div>

          <div onClick={ViewProducts} className="hover:scale-110 bg-transparent hover:bg-[#adb6aa] dark:hover:bg-[#282852a8] shadow-md shadow-[#171731] dark:shadow-[#adb6aa] p-4 rounded-xl">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1e293b] p-4 rounded-xl shadow">
            <h3 className="mb-4 font-semibold text-white">Ganancias vs Ventas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataLine}>
                <Line type="monotone" dataKey="ganacia" stroke="#60a5fa" />
                <Line type="monotone" dataKey="venta" stroke="#34d399" />
                <CartesianGrid stroke="#334155" strokeDasharray="5 5" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl shadow">
            <h3 className="mb-4 font-semibold text-white">Ventas esta semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataBar}>
                <CartesianGrid stroke="#334155" strokeDasharray="5 5" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="venta" fill="#3b82f6" />
                <Bar dataKey="ganacia" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div> 
  );
}

export default Statistics;
