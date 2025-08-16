import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GasReading } from '@/types/device';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

interface DeviceChartProps {
  readings: GasReading[];
  title?: string;
}

export function DeviceChart({ readings, title = "Gas Readings (24 Hours)" }: DeviceChartProps) {
  // Transform data for chart
  const chartData = readings.map(reading => ({
    ...reading,
    time: format(new Date(reading.ts), 'HH:mm'),
    fullTime: new Date(reading.ts).toLocaleString('en-US', {
      timeZone: 'Asia/Brunei',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{data.fullTime}</p>
          <p className="text-sm text-primary">
            Gas: <span className="font-medium">{data.ppm.toFixed(1)} ppm</span>
          </p>
          {data.temperatureC && (
            <p className="text-sm text-muted-foreground">
              Temp: {data.temperatureC.toFixed(1)}°C
            </p>
          )}
          {data.pressureKpa && (
            <p className="text-sm text-muted-foreground">
              Pressure: {data.pressureKpa.toFixed(0)} kPa
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              label={{ 
                value: 'PPM', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="ppm" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}