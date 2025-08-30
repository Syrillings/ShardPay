import { useState } from 'react';
import { Users, TrendingUp, BarChart3, Globe, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useCommunity } from '../hooks/useCommunity';
import { PiePlaceholder } from '../components/Charts/PiePlaceholder';
import { HeatmapPlaceholder } from '../components/Charts/HeatmapPlaceholder';

export const Community = () => {
  const { 
    trends, 
    isOptedIn, 
    toggleOptIn, 
    getHeatmapData, 
    getSpendingDistribution 
  } = useCommunity();

  const heatmapData = getHeatmapData();
  const spendingData = getSpendingDistribution();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Community Insights
          </h1>
          <p className="text-muted-foreground">
            Anonymous spending trends and community statistics
          </p>
        </div>

        {/* Privacy Control */}
        <Card variant="glow" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Privacy & Data Sharing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h3 className="font-semibold mb-1">
                  {isOptedIn ? 'Anonymized Insights Enabled' : 'Private Mode'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOptedIn 
                    ? 'Your anonymized data helps improve community insights. No personal information is shared.'
                    : 'Enable to see community trends and contribute anonymous data for better insights.'
                  }
                </p>
              </div>
              <Button
                variant={isOptedIn ? 'destructive' : 'glow'}
                onClick={() => toggleOptIn(!isOptedIn)}
                className="flex items-center"
              >
                {isOptedIn ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {isOptedIn ? 'Disable' : 'Enable'} Insights
              </Button>
            </div>
          </CardContent>
        </Card>

        {!isOptedIn ? (
          /* Privacy Message */
          <Card variant="elevated" className="text-center py-12">
            <CardContent>
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Privacy Mode Active</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Enable anonymized insights to view community trends and contribute to better spending analytics for everyone.
              </p>
              <Button variant="hero" onClick={() => toggleOptIn(true)}>
                <Globe className="mr-2 h-4 w-4" />
                Join Community Insights
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Trending Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {trends.map((trend) => (
                <Card key={trend.id} variant="glass" className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">{trend.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{trend.title}</div>
                    <div className={`flex items-center justify-center text-xs ${
                      trend.change > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      <TrendingUp className={`mr-1 h-3 w-3 ${
                        trend.change < 0 ? 'rotate-180' : ''
                      }`} />
                      {Math.abs(trend.change)}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Spending Distribution */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Community Spending Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PiePlaceholder 
                    title="Spending Distribution"
                    data={spendingData}
                    description="Average spending by category across the community"
                  />
                </CardContent>
              </Card>

              {/* Activity Heatmap */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Transaction Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HeatmapPlaceholder 
                    title="Activity Heatmap"
                    data={heatmapData}
                    description="When the community is most active"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Community Stats */}
            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Community Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">12.5K</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">₦2.8M</div>
                    <div className="text-sm text-muted-foreground">Daily Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">14.2%</div>
                    <div className="text-sm text-muted-foreground">Avg Tip Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">23.8%</div>
                    <div className="text-sm text-muted-foreground">Savings Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card variant="glass" className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Key Insights</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <Chip variant="primary" size="sm" className="mr-3 mt-0.5">📈</Chip>
                    <span>Micro-savings adoption increased 23% this month</span>
                  </div>
                  <div className="flex items-start">
                    <Chip variant="outline" size="sm" className="mr-3 mt-0.5">⏰</Chip>
                    <span>Peak transaction time is 2-4 PM on weekdays</span>
                  </div>
                  <div className="flex items-start">
                    <Chip variant="success" size="sm" className="mr-3 mt-0.5">🍕</Chip>
                    <span>Food & dining remains the top spending category</span>
                  </div>
                  <div className="flex items-start">
                    <Chip variant="warning" size="sm" className="mr-3 mt-0.5">💡</Chip>
                    <span>Users who tip 15%+ save 40% more on average</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};