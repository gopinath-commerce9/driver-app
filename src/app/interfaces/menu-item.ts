export interface MenuItemInterface {
    title: string;
    pageName: string;
    pageComponent: any;
    pageUrl: string;
    modulePath: string;
    moduleClass: any;
    moduleClassName: string;
    index?: number;
    icon?: string;
    type?: string;
    subMenus?: Array<MenuItemInterface>;
    params?: any;
}
