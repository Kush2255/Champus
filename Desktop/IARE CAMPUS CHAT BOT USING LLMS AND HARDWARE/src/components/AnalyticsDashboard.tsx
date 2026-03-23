import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  MessageSquare, 
  Mic, 
  TrendingUp, 
  Clock, 
  Calendar,
  Activity,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { stats, dailyUsage, recentActivity, isLoading, error } = useAnalytics();

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Please sign in to view your analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'Text', value: stats.textChats, icon: MessageSquare },
    { name: 'Voice', value: stats.voiceChats, icon: Mic },
  ];

  const statCards = [
    { 
      title: 'Total Chats', 
      value: stats.totalChats, 
      icon: MessageSquare, 
      description: 'All time conversations',
      color: 'text-primary'
    },
    { 
      title: 'Today', 
      value: stats.todayChats, 
      icon: Calendar, 
      description: 'Chats today',
      color: 'text-chart-1'
    },
    { 
      title: 'This Week', 
      value: stats.weeklyChats, 
      icon: TrendingUp, 
      description: 'Last 7 days',
      color: 'text-chart-2'
    },
    { 
      title: 'Avg Response', 
      value: `${stats.avgResponseLength}`, 
      icon: Clock, 
      description: 'Characters per response',
      color: 'text-chart-3'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Usage Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Daily Usage</CardTitle>
                <CardDescription>Chat activity over the last 7 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : dailyUsage.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="text" name="Text" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="voice" name="Voice" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Text vs Voice Ratio */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Text vs Voice Ratio</CardTitle>
                <CardDescription>Distribution of input methods</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : stats.totalChats > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-3">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <entry.icon className="h-4 w-4" />
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {entry.value} ({stats.totalChats > 0 ? Math.round((entry.value / stats.totalChats) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Usage Trend</CardTitle>
              <CardDescription>Combined activity over the week</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : dailyUsage.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Chats"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Start chatting to see your usage trends!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest conversations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  {activity.type === 'voice' ? (
                    <Mic className="h-4 w-4 text-chart-2" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-primary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.query}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
