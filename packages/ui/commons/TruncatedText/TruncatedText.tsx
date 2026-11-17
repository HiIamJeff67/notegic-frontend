interface TruncatedTextProps {
  children: React.ReactNode;
  width?: string;
  className?: string;
}

const TruncatedText = ({
  children,
  width = "160px",
  className = "",
}: TruncatedTextProps) => {
  return (
    <span className={`truncate block ${className}`} style={{ maxWidth: width }}>
      {children}
    </span>
  );
};

export default TruncatedText;
