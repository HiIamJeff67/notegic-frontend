interface WrapPlaceholder {
  consumingProps?: any;
  children?: React.ReactNode;
}

const WrapPlaceholder = ({ children }: WrapPlaceholder) => {
  return <>{children}</>;
};

export default WrapPlaceholder;
