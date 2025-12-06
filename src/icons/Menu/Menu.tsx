import React from "react";
import {classes} from "@/lib/utils";

interface MenuProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Menu({className, ...props}: MenuProps) {
    return (
        <svg className={classes(className)}
             {...props} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3334 12.0833V13.75H1.66675V12.0833H18.3334ZM18.3334 6.25V7.91667H1.66675V6.25H18.3334Z"
                  fill="currentColor"/>
        </svg>
    );
}



