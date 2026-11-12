import { getJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members: Array<string | { name?: string }> };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const { data, loading, error } = useApiResource('/api/teams', getJson<TeamResponse>);
  const teams = data?.teams ?? [];
  return <CapabilityCard title="Teams" description="Manage teams and members." loading={loading} error={error} empty={!teams.length} emptyText="No teams yet.">
    <ul className="list-group">
      {teams.map((team, index) => <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
        <strong>{team.name}</strong>{team.mascot ? ` — ${team.mascot}` : ''}
        {team.members.length > 0 && <span> · Members: {team.members.map((member) => typeof member === 'string' ? member : member.name ?? 'Member').join(', ')}</span>}
      </li>)}
    </ul>
  </CapabilityCard>;
}
