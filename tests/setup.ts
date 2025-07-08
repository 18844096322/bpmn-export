/**
 * Jest test setup
 */

// Mock bpmn-moddle for testing
jest.mock('bpmn-moddle', () => {
    return jest.fn().mockImplementation(() => ({
        fromXML: jest.fn().mockResolvedValue({
            rootElement: {
                $type: 'bpmn:Definitions',
                rootElements: []
            },
            warnings: [],
            elementsById: new Map()
        }),
        toXML: jest.fn().mockResolvedValue({
            xml: '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions/>'
        }),
        create: jest.fn().mockImplementation((type, attrs) => ({ $type: type, ...attrs }))
    }));
});

// Setup global test environment
global.console = {
    ...console,
    // Uncomment to silence specific console methods during tests
    // warn: jest.fn(),
    // error: jest.fn(),
};

// Mock DOM APIs if needed
Object.defineProperty(window, 'URL', {
    value: {
        createObjectURL: jest.fn(),
        revokeObjectURL: jest.fn()
    }
});

// Mock file reading
Object.defineProperty(global, 'File', {
    value: class MockFile {
        constructor(public content: string, public name: string) { }
        text() {
            return Promise.resolve(this.content);
        }
    }
});

// Setup before each test
beforeEach(() => {
    jest.clearAllMocks();
}); 