export interface PageInterface {
    title: string;
    pageName: string;
    pageComponent: any;
    pageUrl: string;
    modulePath: string;
    moduleName: string;
    index?: number;
    icon?: string;
    type?: string;
    params?: any;
}
