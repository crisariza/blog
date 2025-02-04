const PostTitle = ({ children }) => {
  return (
    <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold md:leading-none mb-6 text-left">
      {children}
    </h1>
  );
};

export default PostTitle;
