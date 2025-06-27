
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DRBE, Milestone, MilestoneStatus } from "@/lib/drbe";

const mockTasks = [
  {
    id: 1,
    title: "Legal Review",
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    status: "pending" as MilestoneStatus,
    lastUpdate: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    title: "Financial Audit",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // in 3 days
    status: "pending" as MilestoneStatus,
    lastUpdate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Draft Contract",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    status: "completed" as MilestoneStatus,
    lastUpdate: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

function getTaskStatus(task: typeof mockTasks[0]): MilestoneStatus {
  // Reuse DRBE milestone evaluation for task deadlines
  return DRBE.evaluateMilestoneStatus({
    title: task.title,
    target_date: task.dueDate,
    status: task.status,
    last_update: task.lastUpdate,
  });
}

const ServiceProviderDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Service Provider Dashboard</h1>
          <Card>
            <CardHeader>
              <CardTitle>Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTasks.map((task) => {
                  const status = getTaskStatus(task);
                  return (
                    <div key={task.id} className="p-4 border rounded-lg mb-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">Last update: {new Date(task.lastUpdate).toLocaleDateString()}</div>
                      </div>
                      <span className={`px-2 py-1 rounded ${status === 'overdue' ? 'bg-red-200 text-red-800' : status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                        {status === 'overdue' ? 'Overdue 🚩' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ServiceProviderDashboard;
