import { useAuth } from "../features/authentication/hooks/useAuth";
import { Button } from "../components/ui/button";

export default function DashboardPage()
{
    const { logout } = useAuth();

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">工作日誌</h1>
                <Button variant = "outline" onClick={() => logout()}>
                    登出
                </Button>
            </div>
        </main>
    );
}