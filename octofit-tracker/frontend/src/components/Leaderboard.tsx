import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const { data, loading, error } = useApiResource('/api/leaderboard', getJson<LeaderboardResponse>);
  const leaderboard = data?.leaderboard ?? [];
  return <CapabilityCard title="Leaderboard" description="Compare team point totals." loading={loading} error={error} empty={!leaderboard.length} emptyText="No rankings or scores yet.">
    <ol className="list-group list-group-numbered">
      {leaderboard.map((entry) => <li className="list-group-item d-flex justify-content-between" key={entry.rank}>
        <span>{entry.teamName}</span><strong>{entry.totalPoints} points</strong>
      </li>)}
    </ol>
  </CapabilityCard>;
}
