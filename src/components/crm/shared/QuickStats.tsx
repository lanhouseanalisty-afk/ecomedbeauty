import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  color?: string;
  description?: string;
}

interface QuickStatsProps {
  stats: StatItem[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5;
}

export function QuickStats({ stats, isLoading = false, columns = 4 }: QuickStatsProps) {
  const columnClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  };

  if (isLoading) {
    return (
      <div className={cn("grid gap-4", columnClasses[columns])}>
        {Array.from({ length: columns }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", columnClasses[columns])}>
      {stats.map((stat) => {
        const TrendIcon = stat.trend 
          ? stat.trend.value > 0 
            ? TrendingUp 
            : stat.trend.value < 0 
              ? TrendingDown 
              : Minus
          : null;

        const trendColor = stat.trend
          ? stat.trend.value > 0
            ? "text-success"
            : stat.trend.value < 0
              ? "text-destructive"
              : "text-muted-foreground"
          : "";

        return (
          <Card key={stat.title} className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color || "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {(stat.trend || stat.description) && (
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend && TrendIcon && (
                    <>
                      <TrendIcon className={cn("h-3 w-3", trendColor)} />
                      <span className={cn("text-xs", trendColor)}>
                        {stat.trend.value > 0 ? '+' : ''}{stat.trend.value}%
                      </span>
                    </>
                  )}
                  {stat.description && (
                    <span className="text-xs text-muted-foreground">
                      {stat.description}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
