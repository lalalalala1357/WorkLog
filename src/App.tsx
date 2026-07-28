//import { useState } from 'react'
import { useWorkLogs } from "./features/worklog/hooks/useWorkLogs";
import { WorkLogTable } from "./features/worklog/components/WorkLogTable";

function App()
{
  const {data , isLoading , error} = useWorkLogs(2026,7);

  if(isLoading)
  {
    return <p>工作日誌讀取中...</p>
  }

  if(error)
  {
    return <p>工作日誌取得失敗</p>
  }

  const workLogs = data?? [];

  return(
    <div>
      <h1>工作日誌</h1>
      {workLogs.length === 0 && <p>目前沒有工作日誌</p>}

      <WorkLogTable workLogs={workLogs} />
    </div>
  );
}
export default App;