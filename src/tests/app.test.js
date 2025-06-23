import { renderHook, act } from '@testing-library/react-native';
import { useCamera } from '../hooks/useCamera';

describe('useCamera', () => {
  test('should change mode when setMode is called', () => {
    jest.mock('expo-av');
    jest.mock('expo-speech');

    const { result } = renderHook(() => useCamera());
    
    act(() => {
      result.current.setMode('money');
    });
    
    expect(result.current.mode).toBe('money');
  });
})