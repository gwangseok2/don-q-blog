type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="container mx-auto px-4 md:px-5 lg:px-52 overflow-x-hidden">{children}</div>;
};

export default Container;
