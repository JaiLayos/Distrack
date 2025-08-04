import { useEffect, useRef, useState } from "react";
import Gantt from "frappe-gantt";
import { HashIcon } from "lucide-react";
import DashboardCards from "./DashboardCards";
import { fetchTasksByUserId } from "../api";
import { User } from "../UserComponent/page";

interface Props {
    admin: User | null;
}

export default function Dashboard({ admin }: Props) {
    const ganttRef = useRef<HTMLDivElement | null>(null);
    const [upcomingTask, setUpcomingTask] = useState<any>(null);
    const [latestTask, setLatestTask] = useState<any>(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [finishedCount, setFinishedCount] = useState(0);

    useEffect(() => {
        if (!admin?.id) return;

        const loadTaskName = async () => {
            try {
                const tasks = await fetchTasksByUserId(admin.id);
                const today = new Date();

                let pending = 0;
                let finished = 0;
                let closestTask = null;
                let smallestDiff = Infinity;

                const tasksFormatted = tasks.map((task: any) => {
                    const start = new Date(task.createdAt);
                    const end = new Date(task.dueDate);

                    if (task.status === "PENDING" || task.status === "ADDED") pending++;
                    else if (task.status === "COMPLETED") finished++;


                    // Find closest upcoming task
                    const timeDiff = end.getTime() - today.getTime();
                    if (timeDiff > 0 && timeDiff < smallestDiff) {
                        smallestDiff = timeDiff;
                        closestTask = task;
                    }

                    let progress = 0;
                    if (today >= end) progress = 100;
                    else if (today <= start) progress = 0;
                    else {
                        const total = end.getTime() - start.getTime();
                        const elapsed = today.getTime() - start.getTime();
                        progress = Math.round((elapsed / total) * 100);
                    }

                    return {
                        id: task.id.toString(),
                        name: task.taskName,
                        start: start.toISOString().split("T")[0],
                        end: end.toISOString().split("T")[0],
                        progress,
                    };
                });

                setPendingCount(pending);
                setFinishedCount(finished);
                setUpcomingTask(closestTask);

                if (ganttRef.current) {
                    ganttRef.current.innerHTML = "";
                    new Gantt(
                        ganttRef.current,
                        tasksFormatted,
                        {
                            view_mode: "Day",
                        } as any 
                    );
                }
                if (tasks.length > 0) {
                    const latest = tasks.reduce((latestSoFar: any, current: any) => {
                        return new Date(current.createdAt) > new Date(latestSoFar.createdAt) ? current : latestSoFar;
                    }, tasks[0]);
                    setLatestTask(latest);
                }
            } catch (error) {
                console.error("Failed to fetch task by ID:", error);
            }
        };

        loadTaskName();


    }, [admin?.id]);

    return (
        <div className="w-full h-full px-3 flex flex-col space-y-3">
            <div className="sticky top-0 z-30 bg-customDarkBlueBG text-white pt-2 pb-3">
                <div className="w-full flex flex-row items-end pt-10">
                    <HashIcon className="h-[60%] w-[7%] text-white/60" />
                    <div className="flex items-end h-full w-full">
                        <p className="text-3xl pt-1 font-semibold">Dashboard 📊</p>
                    </div>
                </div>
                <p className="text-sm text-white/70 mt-1 ml-3">
                    This is where the team lead’s set deadline will be announced
                </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y">
                <div className="w-11/12 overflow-x-hidden bg-[#292b3c] rounded-xl shadow-lg text-white mx-auto mt-2">
                    <div ref={ganttRef} className="gantt-target overflow-auto p-3" />
                </div>
                <DashboardCards
                    upcomingTask={upcomingTask}
                    latestTask={latestTask}
                    pendingCount={pendingCount}
                    finishedCount={finishedCount}
                />
            </div>
        </div>
    );
}
