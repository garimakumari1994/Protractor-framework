import { Executor } from './methods.interface';
import { ElementPosition } from '../clientSideScripts/elementPosition.interfaces';
export declare function getElementPositionAndroid(executor: Executor, isNativeWebScreenshot: boolean, element: HTMLElement): Promise<ElementPosition>;
export declare function getElementPositionDesktop(executor: Executor, innerHeight: number, screenshotHeight: number, element: HTMLElement): Promise<ElementPosition>;
export declare function getElementPositionIos(executor: Executor, element: HTMLElement): Promise<ElementPosition>;
