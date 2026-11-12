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

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
