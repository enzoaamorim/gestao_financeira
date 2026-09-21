import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useWorkout } from "../../context/WorkoutContext";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { inputClass } from "../../components/ui/fields";
import { formatDate } from "../../lib/format";

function computeStreak(dates: string[]): number {
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const d of uniqueDates) {
    const sessionDate = new Date(`${d}T00:00:00`);
    const diffDays = Math.round((cursor.getTime() - sessionDate.getTime()) / 86400000);

    if (diffDays === 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diffDays === 1 && streak === 0) {
      streak++;
      cursor.setTime(sessionDate.getTime());
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function FitnessDashboard() {
  const { sessions, sets, exercises, exerciseById } = useWorkout();
  const { accentColor } = useAuth();

  const exercisesWithData = useMemo(
    () => exercises.filter((ex) => sets.some((s) => s.exerciseId === ex.id)),
    [exercises, sets],
  );

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const activeExerciseId = selectedExerciseId || exercisesWithData[0]?.id || "";

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const sessionsThisWeek = sessions.filter((s) => s.date >= sevenDaysAgoStr).length;
  const streak = computeStreak(sessions.map((s) => s.date));

  const progressionData = useMemo(() => {
    if (!activeExerciseId) return [];
    const sessionIds = new Set(
      sets.filter((s) => s.exerciseId === activeExerciseId).map((s) => s.sessionId),
    );
    return sessions
      .filter((s) => sessionIds.has(s.id))
      .map((s) => {
        const maxWeight = Math.max(
          0,
          ...sets.filter((st) => st.sessionId === s.id && st.exerciseId === activeExerciseId).map((st) => st.weight),
        );
        return { date: s.date, label: formatDate(s.date), weight: maxWeight };
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);
  }, [activeExerciseId, sessions, sets]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Treino</h1>
        <p className="mt-1 text-sm text-muted">Seu progresso e resumo de atividade</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium text-muted">Treinos nos últimos 7 dias</p>
          <p className="mt-2 text-2xl font-bold text-teal">{sessionsThisWeek}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted">Sequência atual</p>
          <p className="mt-2 text-2xl font-bold">
            {streak} {streak === 1 ? "dia" : "dias"}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted">Total de treinos</p>
          <p className="mt-2 text-2xl font-bold">{sessions.length}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Progressão de carga</p>
          {exercisesWithData.length > 0 && (
            <select
              className={`${inputClass} w-auto`}
              value={activeExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            >
              {exercisesWithData.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.icon} {ex.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {progressionData.length === 0 ? (
          <p className="py-10 text-center text-sm text-subtle">
            Registre treinos com peso pra ver sua evolução aqui.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262b" vertical={false} />
                <XAxis dataKey="label" stroke="#6b6b74" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b6b74" fontSize={12} tickLine={false} axisLine={false} width={40} unit="kg" />
                <Tooltip
                  contentStyle={{ background: "#1b1b1f", border: "1px solid #26262b", borderRadius: 12 }}
                  formatter={(v) => [`${Number(v)} kg`, exerciseById(activeExerciseId)?.name ?? ""]}
                />
                <Line type="monotone" dataKey="weight" stroke={accentColor} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
