import {Typography} from "@/components/Typography";
import styles from "./TaskSection.module.css";
import classNames from "classnames";
import {ReactNode} from "react";

interface TaskSectionProps {
    label: string;
    title: ReactNode;
    children?: ReactNode;
}

export function TaskSection({label, title, children}: TaskSectionProps) {
    return (
        <section className={styles.tasks}>
            <div className={styles.tasksContent}>
                <Typography size="XXS" font="mono" color="accent" className={styles.tasksLabel}>
                    {label}
                </Typography>
                <div className={styles.task}>
                    <div className={styles.titleWrapper}>
                        <Typography
                            size="MD"
                            font="default"
                            color="black"
                            className={classNames(styles.taskTitle, styles.titleBottomMargin)}
                        >
                            {title}
                        </Typography>
                    </div>
                    {children}
                </div>
            </div>
        </section>
    );
}








