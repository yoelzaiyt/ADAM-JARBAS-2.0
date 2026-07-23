import { describe, it, expect, beforeEach } from 'vitest';
import { HR } from '../hr/HR.js';

const CID = 'comp-1';

function empData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Alice Smith',
    email: 'alice@test.com',
    departmentId: 'dept-eng',
    position: 'Engineer',
    status: 'active' as const,
    hireDate: new Date('2024-01-15'),
    managerId: undefined,
    terminationDate: undefined,
    tags: [],
    customFields: {},
    ...overrides,
  };
}

describe('HR', () => {
  let hr: HR;

  beforeEach(() => {
    hr = new HR();
  });

  it('creates and retrieves an employee', async () => {
    const emp = await hr.createEmployee(empData());
    expect(emp.id).toBeDefined();
    expect(emp.createdAt).toBeInstanceOf(Date);
    const found = await hr.getEmployeeById(emp.id);
    expect(found?.name).toBe('Alice Smith');
  });

  it('lists employees with filters', async () => {
    await hr.createEmployee(empData({ name: 'A', departmentId: 'dept-eng', status: 'active' }));
    await hr.createEmployee(empData({ name: 'B', departmentId: 'dept-sales', status: 'active' }));
    await hr.createEmployee(empData({ name: 'C', departmentId: 'dept-eng', status: 'terminated' }));
    const eng = await hr.listEmployees(CID, { departmentId: 'dept-eng' });
    expect(eng).toHaveLength(2);
    const active = await hr.listEmployees(CID, { status: 'active' });
    expect(active).toHaveLength(2);
  });

  it('updates an employee', async () => {
    const emp = await hr.createEmployee(empData());
    const updated = await hr.updateEmployee(emp.id, { position: 'Senior Engineer' });
    expect(updated.position).toBe('Senior Engineer');
    expect(updated.name).toBe('Alice Smith');
  });

  it('terminates an employee', async () => {
    const emp = await hr.createEmployee(empData());
    const term = await hr.terminateEmployee(emp.id);
    expect(term.status).toBe('terminated');
    expect(term.terminationDate).toBeDefined();
  });

  it('computes headcount report', async () => {
    await hr.createEmployee(empData({ name: 'A', status: 'active', departmentId: 'd1' }));
    await hr.createEmployee(empData({ name: 'B', status: 'active', departmentId: 'd1' }));
    await hr.createEmployee(empData({ name: 'C', status: 'on_leave', departmentId: 'd2' }));
    const report = await hr.getHeadcount(CID);
    expect(report.total).toBe(3);
    expect(report.active).toBe(2);
    expect(report.onLeave).toBe(1);
    expect(report.byDepartment).toHaveLength(2);
  });

  it('creates and manages vacation requests', async () => {
    const v = await hr.createVacation({
      companyId: CID, employeeId: 'emp-1', startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-05'), type: 'vacation', status: 'requested', reason: 'Holiday',
    });
    expect(v.id).toBeDefined();
    const approved = await hr.approveVacation(v.id, 'mgr-1');
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('mgr-1');
  });

  it('enrolls and unenrolls employee from training', async () => {
    const t = await hr.createTraining({
      companyId: CID, title: 'Safety 101', type: 'mandatory', status: 'scheduled',
      startDate: new Date(), endDate: new Date(), maxParticipants: 5, participants: [],
      instructor: 'Bob', location: 'Room A', description: 'Safety training',
    });
    const enrolled = await hr.enrollInTraining(t.id, 'emp-1');
    expect(enrolled.participants).toContain('emp-1');
    const unenrolled = await hr.unenrollFromTraining(t.id, 'emp-1');
    expect(unenrolled.participants).toHaveLength(0);
  });

  it('manages evaluation lifecycle', async () => {
    const ev = await hr.createEvaluation({
      companyId: CID, employeeId: 'emp-1', evaluatorId: 'mgr-1', period: '2025-Q1',
      status: 'draft', scores: {}, comments: '', goals: [],
    });
    const submitted = await hr.submitEvaluation(ev.id);
    expect(submitted.status).toBe('submitted');
    const completed = await hr.completeEvaluation(submitted.id);
    expect(completed.status).toBe('completed');
  });
});
