import { cn } from "@shared/util/utils";
import * as React from "react";
import { Table } from "@/components/ui/table";

type SeparatableTableColumn = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface SeparatableTableProps
  extends React.ComponentPropsWithoutRef<typeof Table> {
  /** Column indexes after which a vertical divider should be rendered. */
  separatedColumns?: SeparatableTableColumn[];
}

const separatorClassNames: Record<SeparatableTableColumn, string> = {
  1: "[&_tr>*:nth-child(1):not([colspan])]:border-r [&_tr>*:nth-child(1):not([colspan])]:border-border/60",
  2: "[&_tr>*:nth-child(2):not([colspan])]:border-r [&_tr>*:nth-child(2):not([colspan])]:border-border/60",
  3: "[&_tr>*:nth-child(3):not([colspan])]:border-r [&_tr>*:nth-child(3):not([colspan])]:border-border/60",
  4: "[&_tr>*:nth-child(4):not([colspan])]:border-r [&_tr>*:nth-child(4):not([colspan])]:border-border/60",
  5: "[&_tr>*:nth-child(5):not([colspan])]:border-r [&_tr>*:nth-child(5):not([colspan])]:border-border/60",
  6: "[&_tr>*:nth-child(6):not([colspan])]:border-r [&_tr>*:nth-child(6):not([colspan])]:border-border/60",
  7: "[&_tr>*:nth-child(7):not([colspan])]:border-r [&_tr>*:nth-child(7):not([colspan])]:border-border/60",
  8: "[&_tr>*:nth-child(8):not([colspan])]:border-r [&_tr>*:nth-child(8):not([colspan])]:border-border/60",
  9: "[&_tr>*:nth-child(9):not([colspan])]:border-r [&_tr>*:nth-child(9):not([colspan])]:border-border/60",
  10: "[&_tr>*:nth-child(10):not([colspan])]:border-r [&_tr>*:nth-child(10):not([colspan])]:border-border/60",
  11: "[&_tr>*:nth-child(11):not([colspan])]:border-r [&_tr>*:nth-child(11):not([colspan])]:border-border/60",
  12: "[&_tr>*:nth-child(12):not([colspan])]:border-r [&_tr>*:nth-child(12):not([colspan])]:border-border/60",
};

const SeparatableTable = React.forwardRef<
  HTMLTableElement,
  SeparatableTableProps
>(({ className, separatedColumns = [], ...props }, ref) => (
  <Table
    ref={ref}
    className={cn(
      "border-separate border-spacing-0",
      "[&_thead_tr>*]:border-b [&_tbody_tr>*]:border-b [&_thead_tr>*]:border-border/80 [&_tbody_tr>*]:border-border/80",
      separatedColumns.map(column => separatorClassNames[column]),
      className
    )}
    {...props}
  />
));
SeparatableTable.displayName = "SeparatableTable";

export default SeparatableTable;
