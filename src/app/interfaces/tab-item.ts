export interface TabItemInterface {
    title: string;
    tabName: string;
    tabComponent: any;
    tabUrl: string;
    modulePath: string;
    moduleClass: any;
    moduleClassName: string;
    index?: number;
    rootParams?: any;
    icon?: string;
}
