import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 , Hourglass } from "lucide-react";
import type { WorkLogStats } from "../types/WorkLog";

interface DashboardStatsProps
{
    stats: WorkLogStats;
}

export function DashboardStats({
    stats,
}: DashboardStatsProps)
{
    return (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            本月填寫率
                        </p>

                        <p className="mt-2 text-3xl font-semibold">
                            {stats.completionRate}%
                        </p>
                    </div>

                    <div
                        className="grid size-20 place-items-center rounded-full"
                        style={{
                            background: `conic-gradient(var(--primary) ${stats.completionRate}% , var(--muted) 0)`,
                        }}
                    >
                        <div className="grid size-14 place-items-center rounded-full bg-card text-sm font-medium">
                            {stats.completionRate}%
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            待送出數量
                        </p>

                        <p className="mt-2 text-3xl font-semibold text-orange-500">
                            {stats.draftCount}
                        </p>
                    </div>

                    <Hourglass className="size-8 text-orange-500" />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            已完成數量
                        </p>

                        <p className="mt-2 text-3xl font-semibold text-green-600">
                            {stats.submittedCount}
                        </p>
                    </div>

                    <CheckCircle2 className="size-8 text-green-600" />
                </CardContent>
            </Card>
        </section>
    );
}