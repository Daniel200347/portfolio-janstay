import styles from './List.module.css';
import { Typography } from "@/components/Typography";
import classNames from "classnames";

interface ListProps {
    listTexts: string[];
    className?: string;
}

export function List({ listTexts,className }: ListProps) {
    return (
        <div className={classNames(styles.list, className)}>
            {listTexts.map((text, index) => (
                <Typography
                    key={index}
                    size="XS"
                    color="secondary"
                    font="default"
                    className='max-w-[368px]'
                >
                    {text}
                </Typography>
            ))}
        </div>
    );
}
