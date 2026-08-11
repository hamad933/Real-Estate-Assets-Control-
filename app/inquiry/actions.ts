"use server";

import { createInquiry, type CreateInquiryInput } from "@/lib/data/repository";
import type { PersistedInquiry } from "@/lib/data/types";

const purposes = new Set<CreateInquiryInput["purpose"]>(["visit", "question", "availability"]);
const periods = new Set<CreateInquiryInput["period"]>(["morning", "afternoon", "evening"]);
const contactMethods = new Set<CreateInquiryInput["contactMethod"]>(["phone", "message", "email"]);

export async function submitInquiryAction(
  input: CreateInquiryInput
): Promise<{ ok: true; inquiry: PersistedInquiry } | { ok: false; error: string }> {
  if (!purposes.has(input.purpose) || !periods.has(input.period) || !contactMethods.has(input.contactMethod)) {
    return { ok: false, error: "بيانات الطلب التجريبي غير صالحة." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.proposedDate)) {
    return { ok: false, error: "اختر تاريخًا صحيحًا للطلب التجريبي." };
  }

  try {
    return { ok: true, inquiry: createInquiry(input) };
  } catch {
    return { ok: false, error: "تعذر حفظ الطلب محليًا. أعد المحاولة بعد تهيئة قاعدة البيانات المحلية." };
  }
}
