export const Audio = {
  Sound: jest.fn(() => ({
    loadAsync: jest.fn(),
    setIsLoopingAsync: jest.fn(),
    setPositionAsync: jest.fn(),
    playAsync: jest.fn(),
    stopAsync: jest.fn(),
    unloadAsync: jest.fn(),
  })),
};