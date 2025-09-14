import { AuthProvider } from './components/AuthProvider';

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
