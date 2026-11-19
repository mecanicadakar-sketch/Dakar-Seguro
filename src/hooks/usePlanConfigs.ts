import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  MEMBERSHIP_PLANS,
  MembershipPlan,
  mergePlanWithConfig,
  PlanConfigRecord,
  PlanId,
} from '../data/membershipData';
import { db, handleFirestoreError, OperationType } from '../firebase';

type OverrideMap = Partial<Record<PlanId, Partial<PlanConfigRecord> | null>>;

const PLAN_IDS: PlanId[] = ['basico', 'platino', 'oro'];

export function usePlanConfigs() {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [customizedPlanIds, setCustomizedPlanIds] = useState<Record<PlanId, boolean>>({
    basico: false,
    platino: false,
    oro: false,
  });

  useEffect(() => {
    const unsubs = PLAN_IDS.map((planId) => {
      const ref = doc(db, 'planConfigs', planId);
      return onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setOverrides((prev) => ({
              ...prev,
              [planId]: {
                planId,
                monthlyPriceGs:
                  typeof data.monthlyPriceGs === 'number'
                    ? data.monthlyPriceGs
                    : undefined,
                annualFreeMonths:
                  typeof data.annualFreeMonths === 'number'
                    ? data.annualFreeMonths
                    : undefined,
                laborDiscountPct:
                  typeof data.laborDiscountPct === 'number'
                    ? data.laborDiscountPct
                    : undefined,
                injectorDiscountPct:
                  typeof data.injectorDiscountPct === 'number'
                    ? data.injectorDiscountPct
                    : undefined,
                hasFreeOilChangeLabor:
                  typeof data.hasFreeOilChangeLabor === 'boolean'
                    ? data.hasFreeOilChangeLabor
                    : undefined,
                hasFreeTow:
                  typeof data.hasFreeTow === 'boolean' ? data.hasFreeTow : undefined,
                summary:
                  typeof data.summary === 'string' ? data.summary : undefined,
                benefits: Array.isArray(data.benefits)
                  ? data.benefits.map((b) => String(b))
                  : undefined,
              },
            }));
            setCustomizedPlanIds((prev) => ({ ...prev, [planId]: true }));
          } else {
            setOverrides((prev) => ({ ...prev, [planId]: null }));
            setCustomizedPlanIds((prev) => ({ ...prev, [planId]: false }));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `planConfigs/${planId}`);
        }
      );
    });

    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
    };
  }, []);

  const plans: MembershipPlan[] = useMemo(
    () =>
      MEMBERSHIP_PLANS.map((basePlan) =>
        mergePlanWithConfig(basePlan, overrides[basePlan.id])
      ),
    [overrides]
  );

  return { plans, customizedPlanIds };
}
