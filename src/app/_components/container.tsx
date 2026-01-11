type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="container mx-auto md:px-5 lg:px-52">{children}</div>;
};

export default Container;
