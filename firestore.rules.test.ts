/**
 * Security Rules Specification Verification Suite for Mecánica Dakar Club Admin.
 * Documents the 12 Dirty Dozen attack vectors verified against DRAFT_firestore.rules.
 */
export interface DirtyDozenCase {
  id: number;
  description: string;
  auth: { email?: string; email_verified?: boolean; uid?: string } | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  {
    id: 1,
    description: 'Unauthenticated list on /memberships',
    auth: null,
    operation: 'list',
    path: '/memberships',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    description: 'Non-admin verified Google user attempting list on /memberships',
    auth: { uid: 'user-2', email: 'cliente@gmail.com', email_verified: true },
    operation: 'list',
    path: '/memberships',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    description: 'Spoofed unverified admin email attempting read on /memberships/MD-0001',
    auth: { uid: 'spoof-1', email: 'mecanicadakar@gmail.com', email_verified: false },
    operation: 'get',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    description: 'Non-admin authenticated user attempting create',
    auth: { uid: 'user-2', email: 'otro@gmail.com', email_verified: true },
    operation: 'create',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    description: 'Shadow field injection on create',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'create',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    description: 'Oversized or invalid lowercase memberNumber',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'create',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    description: 'Mismatched planId and monthlyAmountGs',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'create',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    description: 'Forged createdByUid not matching request.auth.uid',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'create',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    description: 'Backdated createdAt timestamp != request.time',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'create',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    description: 'Mutation of immutable createdAt / createdByUid on update',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'update',
    path: '/memberships/MD-0001',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    description: 'Invalid oversized document ID injection',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'create',
    path: '/memberships/invalid$id',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    description: 'Access to undeclared collection /admins/hack',
    auth: { uid: 'admin-1', email: 'mecanicadakar@gmail.com', email_verified: true },
    operation: 'get',
    path: '/admins/hack',
    expectedResult: 'PERMISSION_DENIED',
  },
];
