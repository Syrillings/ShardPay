import { useState, useCallback } from 'react';
import { Trend } from '../types';

export const useCommunity = () => {
  const [trends] = useState<Trend[]>([
    {
      id: '1',
      title: 'Top Spending Category',
      value: 'Food & Dining',
      change: 12.5,
      type: 'category',
    },
    {
      id: '2',
      title: 'Average Tip Percentage',
      value: '14.2%',
      change: -2.1,
      type: 'tip',
    },
    {
      id: '3',
      title: 'Monthly Savings Rate',
      value: '23.8%',
      change: 5.3,
      type: 'save',
    },
    {
      id: '4',
      title: 'Popular Payment Time',
      value: '2-4 PM',
      change: 8.7,
      type: 'category',
    },
  ]);

  const [isOptedIn, setIsOptedIn] = useState(false);

  const getTrends = useCallback(() => {
    // TODO: integrate anonymized community data from Shardeum
    return isOptedIn ? trends : [];
  }, [trends, isOptedIn]);

  const toggleOptIn = useCallback((enabled: boolean) => {
    // TODO: integrate privacy preference storage
    setIsOptedIn(enabled);
  }, []);

  const getHeatmapData = useCallback(() => {
    // TODO: integrate real heatmap data
    if (!isOptedIn) return null;
    
    return {
      hours: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: Math.floor(Math.random() * 100),
      })),
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
        day,
        value: Math.floor(Math.random() * 100),
      })),
    };
  }, [isOptedIn]);

  const getSpendingDistribution = useCallback(() => {
    // TODO: integrate real spending distribution
    if (!isOptedIn) return null;
    
    return [
      { category: 'Food & Dining', value: 35, color: '#00D4FF' },
      { category: 'Shopping', value: 25, color: '#FF6B9D' },
      { category: 'Transportation', value: 20, color: '#FFD93D' },
      { category: 'Entertainment', value: 12, color: '#6BCF7F' },
      { category: 'Others', value: 8, color: '#A78BFA' },
    ];
  }, [isOptedIn]);

  return {
    trends: getTrends(),
    isOptedIn,
    toggleOptIn,
    getHeatmapData,
    getSpendingDistribution,
  };
};