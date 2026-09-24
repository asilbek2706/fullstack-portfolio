import { Toaster } from 'react-hot-toast';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 76,
        right: 20,
      }}
      toastOptions={{
        duration: 3500,
        className: 'app-toast',
        success: {
          duration: 3000,
          className: 'app-toast app-toast--success',
          iconTheme: {
            primary: '#44b78b',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 4500,
          className: 'app-toast app-toast--error',
          iconTheme: {
            primary: '#e57373',
            secondary: '#ffffff',
          },
        },
        loading: {
          duration: Number.POSITIVE_INFINITY,
          className: 'app-toast app-toast--loading',
          iconTheme: {
            primary: '#79aec8',
            secondary: 'transparent',
          },
        },
      }}
    />
  );
}
