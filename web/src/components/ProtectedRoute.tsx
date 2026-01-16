const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // DEV MODE: Always allow access
  return children;
};

export default ProtectedRoute;
