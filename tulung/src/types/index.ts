// Re-export all types
export * from './database';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Feature1: undefined;
  CameraTab: undefined;
  Feature2: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ExpenseDetail: { expenseId: string };
  ProcessingReceipt: { imageUri: string };
  AddExpense: {
    imageUri?: string;
    ocrData?: import('./database').ReceiptData;
    fromOCR?: boolean;
  };
  Camera: undefined;
  Paywall: undefined;
};

export type ExpensesStackParamList = {
  ExpensesList: undefined;
  ExpenseDetail: { expenseId: string };
  EditExpense: { expenseId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditBudget: undefined;
  Paywall: undefined;
};
