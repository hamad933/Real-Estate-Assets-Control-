import type { ReactNode } from "react";
import styles from "./inquiry-layout.module.css";

type InquiryLayoutProps = {
  children: ReactNode;
};

export default function InquiryLayout({ children }: InquiryLayoutProps) {
  return <div className={styles.scope}>{children}</div>;
}
