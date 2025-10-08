import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp } from "lucide-react";

interface ProgressChartProps {
  userId: string;
}

interface DailyPoint {
  date: string;
  points_earned: number;
}

const ProgressChart = ({ userId }: ProgressChartProps) => {
  const [chartData, setChartData] = useState<{ date: string; points: number }[]>([]);

  useEffect(() => {
    const fetchDailyPoints = async () => {
      // Fetch last 30 days of data
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from('daily_points')
        .select('date, points_earned')
        .eq('user_id', userId)
        .gte('date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching daily points:', error);
        return;
      }

      // Transform data for chart
      const formattedData = (data || []).map((point: DailyPoint) => ({
        date: format(new Date(point.date), 'dd/MM', { locale: fr }),
        points: point.points_earned,
      }));

      setChartData(formattedData);
    };

    fetchDailyPoints();
  }, [userId]);

  if (chartData.length === 0) {
    return (
      <Card className="p-6 card-shadow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Votre progression
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          Complétez des quiz pour voir votre progression quotidienne.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 card-shadow">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Votre progression (30 derniers jours)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="points"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ProgressChart;
