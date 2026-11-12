import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { _id?: string; title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const { data, loading, error } = useApiResource(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`, getJson<WorkoutResponse>);
  const suggestions = data?.suggestions ?? [];
  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." loading={loading} error={error} empty={!suggestions.length} emptyText="No workout suggestions yet.">
    <ul className="list-group">
      {suggestions.map((workout, index) => <li className="list-group-item" key={workout._id ?? `${workout.title}-${index}`}>
        <strong>{workout.title}</strong>
        {workout.focus && <span> · Focus: {workout.focus}</span>}
        {workout.minutes !== undefined && <span> · {workout.minutes} minutes</span>}
        {workout.difficulty && <span> · {workout.difficulty}</span>}
        {workout.reason && <p className="mb-0">{workout.reason}</p>}
      </li>)}
    </ul>
  </CapabilityCard>;
}
