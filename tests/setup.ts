/**
 * Jest test setup
 */

// Mock bpmn-js since it requires DOM environment
jest.mock('bpmn-js/lib/Modeler', () => {
    return jest.fn().mockImplementation(() => ({
        importXML: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockReturnValue({
            getAll: jest.fn().mockReturnValue([])
        })
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