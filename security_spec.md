# Security Specification — Mecánica Dakar Club Admin

## 1. Data Invariants
1. **Strict Single-Admin Access**: Only a Google-authenticated user with `request.auth.token.email == 'mecanicadakar@gmail.com'` AND `request.auth.token.email_verified == true` may read, list, create, update, or delete any document in `/memberships/{membershipId}`.
2. **Default Deny**: All other paths and unauthenticated or non-admin requests are denied (`allow read, write: if false;`).
3. **Paid Plan Integrity**: `planId` must be one of `'basico'`, `'platino'`, `'oro'`, and `monthlyAmountGs` must match the exact plan tariff (`100000`, `150000`, `200000`).
4. **Affiliate Number Formatting**: `memberNumber` must be an uppercase alphanumeric/hyphen code of length 4–24 (`^[A-Z0-9-]+$`), and only issued with a valid `paymentStatus` (`'abonado'` or `'pendiente'`).
5. **Temporal & Identity Immutability**: `createdAt` and `createdByUid` are set strictly on create (`createdAt == request.time`, `createdByUid == request.auth.uid`) and remain immutable on update. `updatedAt` must always equal `request.time`.
6. **Path ID & Payload Bounds**: Every document ID matches `^[a-zA-Z0-9_\\-]+$` (max 128 chars), and every string has strict min/max `.size()` bounds. No shadow fields are permitted (`hasOnly`).

## 2. Dirty Dozen Attack Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated `get` / `list` on `/memberships`.
2. Authenticated non-admin user (`otro@gmail.com`, `email_verified: true`) attempting `list` or `get` on `/memberships`.
3. Spoofed unverified admin (`mecanicadakar@gmail.com`, `email_verified: false`) attempting `read` or `create`.
4. Non-admin authenticated user attempting `create` on `/memberships/mem1`.
5. Admin attempting `create` with a ghost/shadow field (`isSuperAdmin: true`).
6. Admin attempting `create` with oversized `memberNumber` (> 24 chars) or invalid lowercase characters.
7. Admin attempting `create` with invalid `planId: 'vip'` or mismatched `monthlyAmountGs: 1`.
8. Admin attempting `create` with forged `createdByUid` not matching `request.auth.uid`.
9. Admin attempting `create` with client-backdated `createdAt` (`!= request.time`).
10. Admin attempting `update` modifying immutable `createdAt` or `createdByUid`.
11. Admin attempting `create` on an oversized document ID (> 128 chars or containing `/`).
12. Any user attempting `read` or `write` on an undeclared collection `/admins/hack` or `/test/connection`.
