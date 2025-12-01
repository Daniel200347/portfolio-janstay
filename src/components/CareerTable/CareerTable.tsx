import React from "react";
import { TableCell } from "@/components/TableCell";
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

export function CareerTable({ rows, className }: CareerTableProps) {
	return (
		<div className={classes(styles.table, className)}>
			<TableCell variant="title">Год</TableCell>
			<TableCell variant="title">Компания</TableCell>
			<TableCell variant="title">Должность</TableCell>
			{rows.map((row, index) => (
				<React.Fragment key={index}>
					<TableCell>{row.year}</TableCell>
					<TableCell>{row.company}</TableCell>
					<TableCell>{row.position}</TableCell>
				</React.Fragment>
			))}
		</div>
	);
}

