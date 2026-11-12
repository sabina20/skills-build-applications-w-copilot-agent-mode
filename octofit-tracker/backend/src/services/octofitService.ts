import { isObjectIdOrHexString } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type RequestRecord = Record<string, unknown>;

function requestRecord(input: unknown): RequestRecord {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Request body must be an object'), { status: 400 });
  }
  return input as RequestRecord;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw Object.assign(new Error(`${field} is required`), { status: 400 });
  }
  return value.trim();
}

function positiveMinutes(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw Object.assign(new Error('minutes must be a positive number'), { status: 400 });
  }
  return value;
}

function activityFocus(type: string) {
  const normalized = type.toLowerCase();
  if (normalized === 'run' || normalized === 'cycle') return 'endurance';
  if (normalized === 'walk') return 'mobility';
  return normalized;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = requestRecord(input);
  const userId = requiredString(body.userId, 'userId');
  const teamId = requiredString(body.teamId, 'teamId');
  const type = requiredString(body.type, 'type');
  const minutes = positiveMinutes(body.minutes);

  if (!isObjectIdOrHexString(userId) || !isObjectIdOrHexString(teamId)) {
    throw Object.assign(new Error('userId and teamId must be valid IDs'), { status: 400 });
  }
  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) {
    throw Object.assign(new Error('The specified user or team does not exist'), { status: 404 });
  }

  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = requestRecord(input);
  const name = requiredString(body.name, 'name');
  const mascot = requiredString(body.mascot, 'mascot');
  const members = body.members ?? [];
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !isObjectIdOrHexString(member))) {
    throw Object.assign(new Error('members must be an array of valid user IDs'), { status: 400 });
  }
  const memberIds = members as string[];
  if (memberIds.length) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== memberIds.length) {
      throw Object.assign(new Error('One or more team members do not exist'), { status: 404 });
    }
  }
  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: string; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const recentFocus = recentActivities[0] ? activityFocus(recentActivities[0].type) : undefined;
  const goalFocus = user.fitnessGoal.trim().toLowerCase();
  const preferredFocuses = [...new Set([recentFocus, goalFocus].filter((focus): focus is string => Boolean(focus)))];
  if (!preferredFocuses.length) return [];

  const workouts = await Workout.find({ focus: { $in: preferredFocuses } }).lean();
  workouts.sort((left, right) => preferredFocuses.indexOf(left.focus) - preferredFocuses.indexOf(right.focus));
  return workouts.map((workout) => ({
    ...workout,
    reason: workout.focus === recentFocus
      ? `Recommended based on your recent ${recentActivities[0].type} activity.`
      : `Recommended to support your ${user.fitnessGoal} goal.`,
  }));
}

export { User };
