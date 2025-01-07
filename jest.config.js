export default {
   preset: 'ts-jest',
   testEnvironment: 'node',
   testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]s$',
   moduleFileExtensions: ['ts', 'js', 'json', 'node'],
   transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
   },
};
