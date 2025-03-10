// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ITelemetryItem } from "../JavaScriptSDK.Interfaces/ITelemetryItem";
import { INotificationListener } from "../JavaScriptSDK.Interfaces/INotificationListener";
import { IPerfEvent } from "./IPerfEvent";

/**
 * Class to manage sending notifications to all the listeners.
 */
export interface INotificationManager {
    listeners: INotificationListener[];

    /**
     * Adds a notification listener.
     * @param listener - The notification listener to be added.
     */
    addNotificationListener(listener: INotificationListener): void;

    /**
     * Removes all instances of the listener.
     * @param listener - AWTNotificationListener to remove.
     */
    removeNotificationListener(listener: INotificationListener): void;

    /**
     * Notification for events sent.
     * @param events - The array of events that have been sent.
     */
    eventsSent(events: ITelemetryItem[]): void;

    /**
     * Notification for events being discarded.
     * @param events - The array of events that have been discarded by the SDK.
     * @param reason - The reason for which the SDK discarded the events. The EventsDiscardedReason
     * constant should be used to check the different values.
     */
    eventsDiscarded(events: ITelemetryItem[], reason: number): void;

    /**
     * [Optional] A function called when the events have been requested to be sent to the sever.
     * @param sendReason - The reason why the event batch is being sent.
     * @param isAsync - A flag which identifies whether the requests are being sent in an async or sync manner.
     */
    eventsSendRequest?(sendReason: number, isAsync: boolean): void;

    /**
     * [Optional] This event is sent if you have enabled perf events, they are primarily used to track internal performance testing and debugging
     * the event can be displayed via the debug plugin extension.
     * @param perfEvent - The perf event details
     */
    perfEvent?(perfEvent: IPerfEvent): void;
}
