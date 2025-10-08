import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

interface DailyPoint {
  date: string;
  points_earned: number;
}

interface ProgressChartProps {
  userId: string;
}

const ProgressChart = ({ userId }: ProgressChartProps) => {
  const [chartData, setChartData] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyPoints = async () => {
      try {
        // Get last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30);
        
        const { data, error } = await supabase
          .from('daily_points')
          .select('date, points_earned')
          .eq('user_id', userId)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) throw error;

        // Create a complete 30-day array with 0 points for missing days
        const completeData: DailyPoint[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = date.toISOString().split('T')[0];
          const existingData = data?.find(d => d.date === dateStr);
          
          completeData.push({
            date: format(date, 'dd/MM', { locale: fr }),
            points_earned: existingData?.points_earned || 0
          });
        }

        setChartData(completeData);
      } catch (error) {
        console.error('Error fetching daily points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyPoints();
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  const totalPoints = chartData.reduce((sum, day) => sum + day.points_earned, 0);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Progression sur 30 jours</h3>
        <p className="text-sm text-muted-foreground">
          Total: {totalPoints} points gagnés
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type="monotone" 
            dataKey="points_earned" 
            stroke="hsl(var(--accent))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--accent))' }}
            name="Points"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ProgressChart;
