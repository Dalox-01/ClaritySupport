"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CreditCard, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Store,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Initial empty data
const initialSalesData = [
  { name: '00:00', value: 0 },
  { name: '04:00', value: 0 },
  { name: '08:00', value: 0 },
  { name: '12:00', value: 0 },
  { name: '16:00', value: 0 },
  { name: '20:00', value: 0 },
  { name: '23:59', value: 0 },
];

type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  isLightMode: boolean;
};

function StatCard({ title, value, change, trend, icon: Icon, isLightMode }: StatCardProps) {
  return (
    <Card className={cn(
      "p-6 border backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
      isLightMode 
        ? "bg-white/80 border-gray-200 shadow-sm" 
        : "bg-slate-900/40 border-slate-800 shadow-black/20"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-3 rounded-xl",
          isLightMode ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend === 'up' 
              ? (isLightMode ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400")
              : trend === 'down'
                ? (isLightMode ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-400")
                : (isLightMode ? "bg-gray-100 text-gray-700" : "bg-gray-500/20 text-gray-400")
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <h3 className={cn("text-sm font-medium mb-1", isLightMode ? "text-gray-500" : "text-slate-400")}>
        {title}
      </h3>
      <div className={cn("text-2xl font-bold", isLightMode ? "text-gray-900" : "text-white")}>
        {value}
      </div>
    </Card>
  );
}

export function ShopifyDashboard({ isLightMode }: { isLightMode: boolean }) {
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [stats, setStats] = useState({
    revenue: "0.00 €",
    visitors: "0",
    orders: "0",
    aov: "0.00 €"
  });
  const [shops, setShops] = useState<any[]>([]);
  const [salesData, setSalesData] = useState(initialSalesData);

  useEffect(() => {
    // Fetch shops
    fetch('/api/shopify/connect')
      .then(res => res.json())
      .then(data => {
        if (data.shops) {
          setShops(data.shops);
        }
      })
      .catch(err => console.error('Failed to fetch shops', err));

    // Fetch stats
    fetch('/api/shopify/stats')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStats({
            revenue: data.revenue || "0.00 €",
            visitors: data.visitors || "0",
            orders: data.orders || "0",
            aov: data.aov || "0.00 €"
          });
        }
      })
      .catch(err => console.error('Failed to fetch stats', err));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={cn(
            "text-2xl font-bold flex items-center gap-3",
            isLightMode ? "text-gray-900" : "text-white"
          )}>
            <Store className="w-8 h-8 text-emerald-500" />
            Tableau de bord Boutique
          </h2>
          <p className={cn("text-sm mt-1", isLightMode ? "text-gray-500" : "text-slate-400")}>
            Vue d&apos;ensemble de vos performances e-commerce en temps réel
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className={cn(
            "gap-2",
            isLightMode ? "bg-white" : "bg-slate-900 border-slate-700 text-slate-300"
          )}>
            <Calendar className="w-4 h-4" />
            Aujourd&apos;hui
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <ShoppingBag className="w-4 h-4" />
            Voir les commandes
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={stats.revenue}
          change="0%"
          trend="neutral"
          icon={DollarSign}
          isLightMode={isLightMode}
        />
        <StatCard
          title="Visiteurs en temps réel"
          value={stats.visitors}
          change="0%"
          trend="neutral"
          icon={Users}
          isLightMode={isLightMode}
        />
        <StatCard
          title="Commandes"
          value={stats.orders}
          change="0%"
          trend="neutral"
          icon={Package}
          isLightMode={isLightMode}
        />
        <StatCard
          title="Panier moyen"
          value={stats.aov}
          change="0%"
          trend="neutral"
          icon={CreditCard}
          isLightMode={isLightMode}
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Sales Chart */}
        <Card className={cn(
          "p-6 border backdrop-blur-xl",
          isLightMode 
            ? "bg-white/80 border-gray-200 shadow-sm" 
            : "bg-slate-900/40 border-slate-800 shadow-black/20"
        )}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn("font-semibold", isLightMode ? "text-gray-900" : "text-white")}>
              Évolution des ventes
            </h3>
            <div className="flex gap-2">
              {['1H', '24H', '7J', '30J'].map((period) => (
                <button
                  key={period}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-colors",
                    period === '24H'
                      ? "bg-emerald-500 text-white"
                      : isLightMode 
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? "#e5e7eb" : "#334155"} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={isLightMode ? "#9ca3af" : "#64748b"} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke={isLightMode ? "#9ca3af" : "#64748b"} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}€`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLightMode ? '#fff' : '#1e293b',
                    borderColor: isLightMode ? '#e5e7eb' : '#334155',
                    borderRadius: '8px',
                    color: isLightMode ? '#111' : '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
