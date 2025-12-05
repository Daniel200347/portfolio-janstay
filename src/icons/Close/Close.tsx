import React from "react";
import {classes} from "@/lib/utils";

interface CloseProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Close({className, ...props}: CloseProps) {
    return (
        <svg className={classes(className)}
             {...props} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M16.1781 5L11.1781 10L16.1781 15L14.9997 16.1784L9.99967 11.1784L4.99967 16.1784L3.82129 15L8.82129 10L3.82129 5L4.99967 3.82162L9.99967 8.82162L14.9997 3.82162L16.1781 5Z"
                fill="currentColor"/>
        </svg>

    );
}

