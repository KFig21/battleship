import App from './App';

const AppFunction = App();

test('testing', () => {
  expect(AppFunction.getTargets(
    [0]
)).toEqual( [1, 10] )});
