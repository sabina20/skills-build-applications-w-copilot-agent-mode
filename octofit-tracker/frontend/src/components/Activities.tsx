import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const { data, loading, error } = useApiResource('/api/activities', getJson<ActivityResponse>);
  const activities = data?.activities ?? [];
  return <CapabilityCard title="Activities" description="Track student activity minutes and points." loading={loading} error={error} empty={!activities.length} emptyText="No activities yet.">
    <ul className="list-group">
      {activities.map((activity, index) => <li className="list-group-item" key={activity._id ?? `${activity.type}-${index}`}>
        <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
      </li>)}
    </ul>
  </CapabilityCard>;
}
