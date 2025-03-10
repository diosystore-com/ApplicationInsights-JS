// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
"use strict";

import { ITelemetryItem } from "./ITelemetryItem";
import { IPerfEvent } from "./IPerfEvent";

/**
 * An interface used for the notification listener.
 * @interface
 */
export interface INotificationListener {
    /**
     * [Optional] A function called when events are sent.
     * @param events - The array of events that have been sent.
     */
    eventsSent?: (events: ITelemetryItem[]) => void;
    /**
     * [Optional] A function called when events are discarded.
     * @param events - The array of events that have been discarded.
     * @param reason - The reason for discarding the events. The EventsDiscardedReason
     * constant should be used to check the different values.
     */
    eventsDiscarded?: (events: ITelemetryItem[], reason: number) => void;

    /**
     * [Optional] A function called when the events have been requested to be sent to the sever.
     * @param sendReason - The reason why the event batch is being sent.
     * @param isAsync - A flag which identifies whether the requests are being sent in an async or sync manner.
     */
    eventsSendRequest?: (sendReason: number, isAsync?: boolean) => void;

    /**
     * [Optional] This event is sent if you have enabled perf events, they are primarily used to track internal performance testing and debugging
     * the event can be displayed via the debug plugin extension.
     * @param perfEvent
     */
    perfEvent?: (perfEvent: IPerfEvent) => void;
}
