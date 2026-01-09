/**
 * AuthLayout - Common layout wrapper for authentication pages
 *
 * Provides centered, card-style layout for auth forms
 */
import React from 'react';
export interface AuthLayoutProps {
    title: string;
    children: React.ReactNode;
}
export declare function AuthLayout({ title, children }: AuthLayoutProps): import("react/jsx-runtime").JSX.Element;
