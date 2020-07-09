import { EnrichedInstanceData, InstanceData } from '../methods/instanceData.interfaces';
export interface BeforeScreenshotOptions {
    instanceData: InstanceData;
    addressBarShadowPadding: number;
    disableCSSAnimation: boolean;
    noScrollBars: boolean;
    toolBarShadowPadding: number;
    hideElements: HTMLElement[];
    removeElements: HTMLElement[];
}
export interface BeforeScreenshotResult extends EnrichedInstanceData {
}
