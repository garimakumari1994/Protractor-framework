import { ElementRectanglesOptions, RectanglesOutput, ScreenRectanglesOptions, StatusAddressToolBarRectangles, StatusAddressToolBarRectanglesOptions } from './rectangles.interfaces';
import { Executor } from './methods.interface';
export declare function determineElementRectangles(executor: Executor, screenshot: string, options: ElementRectanglesOptions, element: any): Promise<RectanglesOutput>;
export declare function determineScreenRectangles(screenshot: string, options: ScreenRectanglesOptions): RectanglesOutput;
export declare function determineStatusAddressToolBarRectangles(executor: Executor, options: StatusAddressToolBarRectanglesOptions): Promise<StatusAddressToolBarRectangles>;
