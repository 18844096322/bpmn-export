// @ts-ignore
import BpmnModdle from 'bpmn-moddle';
import { LoopCharacteristics } from './types';

/**
 * Creates a bpmn:ExtensionElements object from an array of extension data.
 * @param moddle The bpmn-moddle instance.
 * @param extensions An array of extension objects, e.g., [{ key: 'class', value: 'com.example.MyClass' }].
 * @returns A moddle element for bpmn:ExtensionElements.
 */
function createExtensionElements(moddle: BpmnModdle, extensions: any[]) {
    // Note: The original implementation used 'flowable:' as a prefix.
    // This could be made more generic if different prefixes are needed.
    const extensionValues = extensions.map(ext =>
        moddle.createAny('flowable:' + ext.key, { $body: ext.value })
    );
    return moddle.create('bpmn:ExtensionElements', {
        values: extensionValues
    });
}

/**
 * Creates a bpmn:MultiInstanceLoopCharacteristics object.
 * @param moddle The bpmn-moddle instance.
 * @param loop The loop characteristics data from the X6 node.
 * @returns A moddle element for bpmn:MultiInstanceLoopCharacteristics.
 */
function createLoopCharacteristics(moddle: BpmnModdle, loop: LoopCharacteristics) {
    const loopProps: any = {};

    // Handle nested complex bpmn:FormalExpression elements
    if (loop.completionCondition) {
        loopProps.completionCondition = moddle.create('bpmn:FormalExpression', {
            body: loop.completionCondition
        });
    }
    if (loop.loopCardinality) {
        loopProps.loopCardinality = moddle.create('bpmn:FormalExpression', {
            body: loop.loopCardinality
        });
    }

    // Combine simple properties from the loop object with the newly created complex properties
    const finalProps = { ...loop, ...loopProps };

    return moddle.create('bpmn:MultiInstanceLoopCharacteristics', finalProps);
}

/**
 * Creates a bpmn:FormalExpression for a condition.
 * @param moddle The bpmn-moddle instance.
 * @param body The expression string.
 * @returns A moddle element for bpmn:FormalExpression.
 */
function createConditionExpression(moddle: BpmnModdle, body: string) {
    return moddle.create('bpmn:FormalExpression', { body });
}


/**
 * A map of property names to their corresponding handler functions.
 * This object is used to dynamically process special BPMN properties
 * during the conversion from X6 JSON to BPMN XML.
 */
export const propertyHandlers: { [key: string]: (moddle: BpmnModdle, value: any) => any } = {
    extensionElements: createExtensionElements,
    loopCharacteristics: createLoopCharacteristics,
    conditionExpression: createConditionExpression
}; 