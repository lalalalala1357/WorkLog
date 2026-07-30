import { Button } from "../../../components/ui/button";

interface DashboardHeaderProps
{
    onLogout: () => void;
}

export function DashboardHeader({
    onLogout,
}:DashboardHeaderProps)
{
    return(
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold">
                    工作日誌
                </h1>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={onLogout}
            >
                登出
            </Button>
        </header>
    );
}