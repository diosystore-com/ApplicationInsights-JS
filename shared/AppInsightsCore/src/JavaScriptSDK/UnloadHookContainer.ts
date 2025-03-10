// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { arrAppend, arrForEach, dumpObj } from "@nevware21/ts-utils";
import { eLoggingSeverity, _eInternalMessageId } from "../JavaScriptSDK.Enums/LoggingEnums";
import { IDiagnosticLogger } from "../JavaScriptSDK.Interfaces/IDiagnosticLogger";
import { ILegacyUnloadHook, IUnloadHook } from "../JavaScriptSDK.Interfaces/IUnloadHook";
import { _throwInternal } from "./DiagnosticLogger";

/**
 * Interface which identifiesAdd this hook so that it is automatically removed during unloading
 * @param hooks - The single hook or an array of IInstrumentHook objects
 */
export interface IUnloadHookContainer {
    add: (hooks: IUnloadHook | IUnloadHook[] | Iterator<IUnloadHook> | ILegacyUnloadHook | ILegacyUnloadHook[] | Iterator<ILegacyUnloadHook>) => void;
    run: (logger?: IDiagnosticLogger) => void;
}

/**
 * Create a IUnloadHookContainer which can be used to remember unload hook functions to be executed during the component unloading
 * process.
 * @returns A new IUnloadHookContainer instance
 */
export function createUnloadHookContainer(): IUnloadHookContainer {
    let _hooks: Array<ILegacyUnloadHook | IUnloadHook> = [];

    function _doUnload(logger: IDiagnosticLogger) {
        let oldHooks = _hooks;
        _hooks = [];

        // Remove all registered unload hooks
        arrForEach(oldHooks, (fn) => {
            // allow either rm or remove callback function
            try{
                ((fn as IUnloadHook).rm || (fn as ILegacyUnloadHook).remove).call(fn);
            } catch (e) {
                _throwInternal(logger, eLoggingSeverity.WARNING, _eInternalMessageId.PluginException, "Unloading:" + dumpObj(e));
            }
        });
    }

    function _addHook(hooks: IUnloadHook | IUnloadHook[] | Iterator<IUnloadHook> | ILegacyUnloadHook | ILegacyUnloadHook[] | Iterator<ILegacyUnloadHook>) {
        if (hooks) {
            arrAppend(_hooks, hooks);
        }
    }

    return {
        run: _doUnload,
        add: _addHook
    };
}