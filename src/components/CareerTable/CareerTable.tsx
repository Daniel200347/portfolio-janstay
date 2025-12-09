import { Typography } from "@/components/Typography";
import { classes } from "@/lib/utils";
import styles from "./CareerTable.module.css";

export interface CareerRow {
	year: string;
	company: string;
	position: string;
}

interface CareerTableProps {
	rows: CareerRow[];
	className?: string;
}

const TABLE_HEADERS = [
	{ id: "year", label: "Год" },
	{ id: "company", label: "Компания" },
	{ id: "position", label: "Должность" },
] as const;

export function CareerTable({ rows, className }: CareerTableProps) {
	return (
		<div className={classes(styles.wrapper, className)}>
			<table className={styles.table}>
				<thead className={styles.head}>
					<tr className={styles.row}>
						{TABLE_HEADERS.map((header) => (
							<th key={header.id} className={styles.cell} scope="col">
								<Typography size="XS" font="default" color="secondary">
									{header.label}
								</Typography>
							</th>
						))}
					</tr>
				</thead>
				<tbody className={styles.body}>
					{rows.map((row, index) => (
						<tr key={`${row.year}-${row.company}-${index}`} className={styles.row}>
							<td className={styles.cell} data-label={TABLE_HEADERS[0].label}>
								<Typography size="XS" font="default" color="black">
									{row.year}
								</Typography>
							</td>
							<td className={styles.cell} data-label={TABLE_HEADERS[1].label}>
								<Typography size="XS" font="default" color="black">
									{row.company}
								</Typography>
							</td>
							<td className={styles.cell} data-label={TABLE_HEADERS[2].label}>
								<Typography size="XS" font="default" color="black">
									{row.position}
								</Typography>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

